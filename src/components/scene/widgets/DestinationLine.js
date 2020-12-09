import * as PIXI from 'pixi.js';
import TweenMax from "greensock";
import MapUtil from '../../utils/MapUtil';
import Mouse from '../../utils/Mouse';
import Robot from './Robot';

export default class DestinationLine extends PIXI.Container {
  static ARROW_TIMER = 20;

  counter = 0;
  line = new PIXI.Graphics();
  arrows = [];
  lineLen = 0;

  constructor() {
    super();

    this.timeHandler = this.timeHandler.bind(this);
    this.addChild(this.line);
    this.addTween();
  }

  addTween() {
    PIXI.Ticker.shared.add(this.timeHandler);
  }

  timeHandler() {
    this.counter++;
    this.arrows.slice().forEach(arrow => {
      if (arrow.y >= this.lineLen) {
        TweenMax.killTweensOf(arrow);
        this.removeChild(arrow);
        this.arrows.splice(this.arrows.indexOf(arrow), 1);
      }
    })
    if (this.counter % DestinationLine.ARROW_TIMER === 0) {
      let arrow = new PIXI.Graphics();
      arrow.lineStyle(5, 0x0000FF);
      arrow.moveTo(0, 0);
      arrow.lineTo(-8, -16);
      arrow.moveTo(0, 0);
      arrow.lineTo(8, -16);
      this.addChild(arrow);
      this.arrows.push(arrow);
      TweenMax.to(arrow, 5, { y: MapUtil.BoundRect.width * 2 });
    }
  }

  update() {
    this.line.clear();
    this.line.lineStyle(4, 0x0000FF);
    this.line.beginFill(0x0000FF, 0.5);

    let startPoint = {
      x: Robot.settingDestination.robot.x,
      y: Robot.settingDestination.robot.y
    }
    let targetPoint = Mouse;
    let dx = targetPoint.x - startPoint.x;
    let dy = targetPoint.y - startPoint.y;
    this.lineLen = Math.sqrt(dx * dx + dy * dy);
    
    let angle = 0;
    if (dx === 0) {
      if (dy > 0) angle = 0;
      else if (dy < 0) angle = Math.PI;
      else return;
    } else {
      if (dy === 0) {
        if (dx > 0) angle = Math.PI * 3 / 2;
        else angle = Math.PI / 2;
      } else {
        angle = Math.atan(dy / dx);
        if (dx > 0 && dy > 0) angle += Math.PI * 3 / 2;
        else if (dx > 0 && dy < 0) angle += Math.PI * 3 / 2;
        else if (dx < 0 && dy < 0) angle += Math.PI / 2;
        else if (dx < 0 && dy > 0) angle += Math.PI / 2;
      }
    }
    this.x = startPoint.x;
    this.y = startPoint.y;
    this.rotation = angle;
    this.line.moveTo(0, 0);
    this.line.lineTo(0, this.lineLen);
    this.line.drawCircle(0, this.lineLen, 15);
  }

  onDestroy() {
    PIXI.Ticker.shared.remove(this.timeHandler);
  }
}