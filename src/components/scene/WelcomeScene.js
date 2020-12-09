import * as PIXI from 'pixi.js';
import { ZoomBlurFilter } from '@pixi/filter-zoom-blur';
import { TwistFilter } from '@pixi/filter-twist';
import { BulgePinchFilter } from '@pixi/filter-bulge-pinch';
import { GodrayFilter } from '@pixi/filter-godray';
import { SimpleLightmapFilter } from '@pixi/filter-simple-lightmap';
import TweenMax, { TimelineMax } from "greensock";
import MapUtil from '../utils/MapUtil';
import SceneManager from './SceneManager';
import WarehouseScene from './WarehouseScene';
import BaseScene from './BaseScene';

export default class WelcomeScene extends BaseScene {
  doc = new PIXI.Sprite();
  text = new PIXI.Container();
  mask = new PIXI.Graphics();

  constructor(app, socketUrl, events) {
    super();

    this.name = 'WelcomeScene';
    this.app = app;
    this.socketUrl = socketUrl;
    this.events = events;
  }

  async enter() {
    console.log('enter welcome');
    await this.draw();
    this.initFilters();
  }

  initFilters() {
    this.initDocFilters();
    this.initTextFilters();
  }
  
  initDocFilters() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    let twist = new TwistFilter(300, 1);
    twist.offset = new PIXI.Point(w, h);

    let bulgePinch = new BulgePinchFilter({
      center: [0.3, 0.5],
      radius: 1500,
      strength: 0.1
    });

    let zoomBlur = new ZoomBlurFilter({
      center: [w / 2, h / 2],
      innerRadius: w * 0.4
    });

    let godray = new GodrayFilter();

    let simpleLightmap = new SimpleLightmapFilter(new PIXI.Texture.from('/lightmap.png'), 0xFFFFFF);

    this.doc.filters = [
      twist,
      bulgePinch,
      zoomBlur,
      godray,
      simpleLightmap
    ];

    new TimelineMax({ yoyo: true, repeat: -1 }).from(twist, 10, { angle: 0, radius: 100, offsetX: 0 })
      .from(twist.offset, 10, { x: w * 0.8, y: 0 }, 0)
      .from(zoomBlur, 5, { innerRadius: w * 0.6 }, 0)
      .from(bulgePinch, 10, { radius: 500, strength: 0.8, ease: Back.easeInOut }, 0)
      .from(godray, 10, { time: 10 }, 0);
  }

  initTextFilters() {
    let twist = new TwistFilter(50, 0);
    twist.offset = new PIXI.Point(1000, 300);

    this.text.filters = [
      twist
    ];

    new TimelineMax({ yoyo: true, repeat: -1 }).from(twist, 8, { angle: 2 });
    new TimelineMax({ yoyo: true, repeat: -1 }).from(twist.offset, 8, { x: 0, y: 250 });
    new TimelineMax({ yoyo: true, repeat: -1 }).from(this.title.scale, 1, { y: 1.1, ease: Linear.easeInOut });
  }

  async draw() {
    return new Promise(resolve => {
      let w = window.innerWidth;
      let h = window.innerHeight;
      this.scale = new PIXI.Point(w / 1920, h / 1080);
  
      let bg = new PIXI.Sprite.from('/bg.jpg');
      // bg.width = w * 1.4;
      // bg.height = h * 1.1;
      this.doc.addChild(bg);
      this.bg = bg;
  
      // let world = new PIXI.Sprite.from('/world.png');
      // this.doc.addChild(world);
  
      let CellSize = 60;
  
      const points = [
        new PIXI.Point(-CellSize * MapUtil.TRANS_COORD.y, -CellSize / 2),
        new PIXI.Point(0, -CellSize),
        new PIXI.Point(CellSize * MapUtil.TRANS_COORD.y, -CellSize / 2),
        new PIXI.Point(CellSize * MapUtil.TRANS_COORD.y, CellSize / 2),
        new PIXI.Point(0, CellSize),
        new PIXI.Point(-CellSize * MapUtil.TRANS_COORD.y, CellSize / 2),
      ];
  
      for (let i = 0, n = Math.ceil(w / (CellSize * Math.sqrt(3) * this.scale.x)), m = Math.ceil(h / (CellSize * 1.4 * this.scale.y)); i < n; i++) {
        for (let j = 0; j < m; j++) {
          let cell = new PIXI.Graphics();
          cell.clear();
          cell.lineStyle(1, 0xECECEC, 0.2);
          cell.drawPolygon(points);
          cell.endFill();
          cell.x = i * CellSize * Math.sqrt(3);
          if (j % 2) {
            cell.x += CellSize * Math.sqrt(3) / 2;
          }
          cell.y = j * CellSize * 1.52;
          this.doc.addChild(cell);
        }
      }
  
      this.addChild(this.doc);
  
      let img = new Image();
      img.onload = () => {
        let patternCanvas = document.getElementById('patternCanvas');
        let patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 200;
        patternCanvas.height = 200;
        let textStyle = new PIXI.TextStyle({
          fontSize: 140,
          fontWeight: 900,
          dropShadow: true,
          dropShadowColor: 0xF16A4B,
          dropShadowAlpha: .5,
          padding: 100,
          fill: patternCtx.createPattern(img, 'repeat')
        });
        this.title = new PIXI.Text('602极客联盟', textStyle);
        this.title.x = 950;
        this.title.y = 450;
        this.title.anchor.set(1);
        this.text.addChild(this.title);
  
        let startBtn = new PIXI.Text('START', {
          fontSize: 50,
          fontWeight: 900,
          fill: 0xffffff,
          dropShadow: true,
          dropShadowColor: 0x999999,
          dropShadowAlpha: .5,
          letterSpacing: 5
        });
        startBtn.x = 450;
        startBtn.y = 550;
        this.text.addChild(startBtn);
        this.addChild(this.text);
    
        this.mask.beginFill(0xF3F3F3);
        this.mask.drawRect(0, 0, w / this.scale.x, h / this.scale.y);
        this.mask.endFill();
        this.mask.alpha = 0;
        this.addChild(this.mask);
    
        startBtn.interactive = true;
        startBtn.on('click', () => {
          TweenMax.to(this.mask, 1, { alpha: 1, onComplete: e => {
            SceneManager.enterScene(this.app, new WarehouseScene(this.app, this.socketUrl, this.events));
          }});
        });
        resolve();
      };
      img.src = '/pattern.png';
    });
  }

  onDestroy() {
  }
}