import * as PIXI from 'pixi.js';
import TweenMax, { TimelineLite } from "greensock";
import MapUtil from '../../utils/MapUtil';
import Mouse from '../../utils/Mouse';

export default class Robot extends PIXI.Container {

  static selected = null;
  static settingDestination = null;
  static showLine = true;
  
  tl = new TimelineLite();
  toX = 0;
  toY = 0;
  rotation = 0;

  constructor(robotData, events) {
    super();

    this.data = robotData;
    this.events = events;

    this.robotTexture = PIXI.Texture.from('/robot.png');
    this.robotSelectTexture = PIXI.Texture.from('/robotSelected.png');

    this.graphics = new PIXI.Graphics();
    this.addChild(this.graphics);

    this.robot = new PIXI.Sprite(this.robotTexture);
    this.addChild(this.robot);

    this.init(robotData);
    this.addEvent();
  }

  init(robotData) {
    let p = MapUtil.transCoord(robotData.x, robotData.y, robotData.z);
    this.robot.x = p.x;
    this.robot.y = p.y;
    this.robot.anchor.x = 0.5;
    this.robot.anchor.y = 0.5;
    this.robot.rotation = (270 - robotData.angle) * Math.PI / 180;
    this.robot.width = MapUtil.CellSize * MapUtil.Scale;
    this.robot.height = MapUtil.CellSize * MapUtil.Scale;
  }

  addEvent() {
    this.robot.interactive = true;
    
    this.robot.on('click', e => this.onClick(e));
  }

  onClick() {
    let selected = Robot.selected;
    if (selected) {
      selected.unselect();
      if (selected === this) return;
    }
    this.select();
  }

  select() {
    Robot.selected = this;
    this.zIndex = 1;
    this.robot.texture = this.robotSelectTexture;
    this.events.$emit('selectRobot', { ...this.data });
  }
  
  unselect() {
    Robot.selected = null;
    this.zIndex = 0;
    this.robot.texture = this.robotTexture;
    this.events.$emit('selectRobot');
  }

  update(robotData, delta) {
    let p = MapUtil.transCoord(robotData.x, robotData.y, robotData.z);
    this.toX = p.x;
    this.toY = p.y;
    this.tl.clear();
    this.tl.to(this.robot, delta / 1000, { x: p.x, y: p.y, ease: Linear.easeInOut });

    let angle = (630 - robotData.angle) % 360;
    let deltaAngle = (this.rotation % 360 + 360) % 360 - angle;
    if (deltaAngle) {
      if (deltaAngle > 180) {
        deltaAngle = 360 - deltaAngle;
        this.rotation += deltaAngle;
      } else if (deltaAngle < -180) {
        deltaAngle = 360 + deltaAngle;
        this.rotation -= deltaAngle;
      } else {
        this.rotation -= deltaAngle;
      }
      TweenMax.to(this.robot, delta / 1000, { rotation: this.rotation * Math.PI / 180 });
      // this.robot.rotation = (270 - robotData.angle) * Math.PI / 180;
    }
    this.showPath(robotData.path ? robotData.path.map(item => item.match(/([+\-]\d+)/g).map(item => +item)) : []);

    if (Robot.settingDestination === this) this.events.$emit('updateDestinationLine');
    // if (Robot.settingDestination === this) this.showDestinationLine();

    if (Robot.selected === this) {
      this.events.$emit('updateRobot', robotData);
    }
    
    this.data = robotData;
  }

  showPath(path) {
    this.graphics.clear();
    if (!Robot.showLine && Robot.selected !== this) return;

    let lineColor = 0xF00d0F, fillColor = 0x6CC236;
    if (Robot.selected === this) {
      [lineColor, fillColor] = [fillColor, lineColor];
    }
    this.graphics.lineStyle(2, lineColor);
    this.graphics.moveTo(this.toX, this.toY);

    let p = null;
    path.slice(1).forEach(([x, y, z]) => {
      p = MapUtil.transCoord(x, y, z);
      this.graphics.lineTo(p.x, p.y);
    });
    
    if (p) {
      this.graphics.beginFill(fillColor, 1);
      this.graphics.drawCircle(p.x, p.y, 3);
    }
  }

  showDestinationLine() {
    this.graphics.lineStyle(2, 0x00FF00);
    this.graphics.moveTo(this.robot.x, this.robot.y);
    this.graphics.lineTo(Mouse.x, Mouse.y);
  }
}