import * as PIXI from 'pixi.js';
import MapUtil from './MapUtil';

export default class MouseCtrl {
  active;
  x;
  y;
  x2;
  y2;
  width;
  height;
  pr;
  scale = 1;
  
  static isMobile = PIXI.utils.isMobile.any;
  static MOUSEDOWN;
  static MOUSEMOVE;
  static MOUSEUP;

  constructor(app, doc, minScale = 1, maxScale = 5, ds = 0.1) {
    this.app = app;
    this.doc = doc;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.ds = ds;

    MouseCtrl.MOUSEDOWN = MouseCtrl.isMobile ? 'touchstart' : 'mousedown';
    MouseCtrl.MOUSEMOVE = MouseCtrl.isMobile ? 'touchmove' : 'mousemove';
    MouseCtrl.MOUSEUP = MouseCtrl.isMobile ? 'touchend' : 'mouseup';
    MouseCtrl.isMobile && window.scrollTo(0, 0);

    let rect = document.querySelector('#pixi').getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.pr = 1;
    this.scale = Math.min(rect.width / MapUtil.BoundRect.width, rect.height / MapUtil.BoundRect.height) * this.pr;
    this.doc.scale.x = this.doc.scale.y = this.scale;
    this.minScale = this.scale / 2;
    if (rect.width / rect.height >= MapUtil.BoundRect.width / MapUtil.BoundRect.height) {
      this.doc.x = (rect.width - MapUtil.BoundRect.width * this.scale) / 2;
    } else {
      this.doc.y = (rect.height - MapUtil.BoundRect.height * this.scale) / 2;
    }
    
    this.initEvents();
  }

  initEvents() {
      this._onResize = this._onResize.bind(this);
      this._onMousewheel = this._onMousewheel.bind(this);
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);

      this.addResize();
      this.addMousewheel();
      this.addDragger();
  }

  addResize() {
    window.addEventListener('resize', this._onResize, false);
  }
  
  _onResize() {
    let rect = document.querySelector('#pixi').getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.minScale = Math.min(rect.width / MapUtil.BoundRect.width, rect.height / MapUtil.BoundRect.height) * this.pr / 2;

    if (this.scale < this.minScale) {
        this.scale = this.doc.scale.x = this.doc.scale.y = this.minScale;
    }

    this.moveBy(0, 0);
  }

  addMousewheel() {
      document.querySelector('#pixi').addEventListener('mousewheel', this._onMousewheel, false);
  }

  _onMousewheel(e, ds) {
    let evt = e;
    let scale = this.scale;
    // let tp = this.doc.globalToLocal(evt.layerX * this.pr, evt.layerY * this.pr);
    let tp = this.doc.toLocal(new PIXI.Point(evt.layerX * this.pr, evt.layerY * this.pr));
    let layerX = tp.x;
    let layerY = tp.y;

    if (evt.deltaY > 0) {
        scale -= ds || this.ds;
    } else {
        scale += ds || this.ds;
    }
    if (scale < this.minScale) {
        scale = this.minScale;
    }
    if (scale > this.maxScale) {
        scale = this.maxScale;
    }

    let dx = layerX * (this.scale - scale);
    let dy = layerY * (this.scale - scale);

    this.doc.scale.x = this.doc.scale.y = this.scale = scale;
    this.moveBy(dx, dy);
  }

  addDragger() {
      document.querySelector('#pixi').addEventListener(MouseCtrl.MOUSEDOWN, this._onMouseDown, false);
      window.addEventListener(MouseCtrl.MOUSEMOVE, this._onMouseMove, false);
      window.addEventListener(MouseCtrl.MOUSEUP, this._onMouseUp, false);
  }

  _onMouseDown(e) {
    this.active = true;
    if (MouseCtrl.isMobile) {
      if (e.touches.length > 1) {
        this.x2 = e.touches[1].pageX;
        this.y2 = e.touches[1].pageY;
      }
      this.x = e.touches[0].pageX;
      this.y = e.touches[0].pageY;
    } else {
      let evt = e;
      this.x = evt.pageX * this.pr;
      this.y = evt.pageY * this.pr;
    }
  }

  _onMouseMove(e) {
    let evt = e;

    if (this.active) {
      let pageX, pageY;
      if (MouseCtrl.isMobile) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
      } else {
        pageX = evt.pageX;
        pageY = evt.pageY;
      }
      let dx = pageX - this.x;
      let dy = pageY - this.y;
      if (MouseCtrl.isMobile && e.touches.length > 1) {
          let deltaY = -1, layerX = (pageX + e.touches[1].pageX) / 2, layerY = (pageY + e.touches[1].pageY) / 2, ds = 0.1;
          let dd = Math.pow(this.x - this.x2, 2) + Math.pow(this.y - this.y2, 2) - Math.pow(pageX - e.touches[1].pageX, 2) + Math.pow(pageY - e.touches[1].pageY, 2);
          ds = Math.abs(dd) > 3000 ? ds : ds * Math.abs(dd) / 3000;
          if (dd >= 0) {
            deltaY = 1;
          }
          this._onMousewheel({ layerX, layerY, deltaY }, ds);
          this.x = pageX;
          this.y = pageY;
          this.x2 = e.touches[1].pageX;
          this.y2 = e.touches[1].pageY;
      } else {
        this.x = pageX;
        this.y = pageY;
        
        this.moveBy(dx, dy);
      }
    }
  }

  _onMouseUp(e) {
    this.active = false;
  }

  onDestroy() {
    window.removeEventListener('resize', this._onResize, false);
    if (document.querySelector('#pixi')) {
        document.querySelector('#pixi').removeEventListener('mousewheel', this._onMousewheel, false);
        document.querySelector('#pixi').removeEventListener(MouseCtrl.MOUSEDOWN, this._onMouseDown, false);
    }
    window.removeEventListener(MouseCtrl.MOUSEMOVE, this._onMouseMove, false);
    window.removeEventListener(MouseCtrl.MOUSEUP, this._onMouseUp, false);
  }

  moveBy(dx, dy) {
      this.doc.x += dx;
      this.doc.y += dy;

      // if (this.doc.x > 0) this.doc.x = 0;
      // if (this.doc.y > 0) this.doc.y = 0;

      // if (this.doc.x + this.doc.width < this.width)
      //     this.doc.x = this.width - this.doc.width;
      // if (this.doc.y + this.doc.height < this.height)
      //     this.doc.y = this.height - this.doc.height;
  }
}