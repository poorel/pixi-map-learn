import * as PIXI from 'pixi.js';
import MapUtil from '../../utils/MapUtil';
import Robot from '../widgets/Robot';
import DestinationLine from '../widgets/DestinationLine';

export default class RobotLayer extends PIXI.Container {

  static RobotMap = {};

  destinationLine;

  constructor(events) {
    super();

    this.events = events

    this.sortableChildren = true;
  }

  initRobot(displayRobots) {
    this.x = -MapUtil.BoundRect.x;
    this.y = -MapUtil.BoundRect.y;

    for (let id in displayRobots) {
      let robot = this.createRobot(id, displayRobots[id]);
      this.addChild(robot);
    }
  }

  updateRobot(data) {
    for (let id in data.data.robots) {
      let robot = RobotLayer.RobotMap[id];
      let robotData = data.data.robots[id];
      if (robot) {
        robot.update(robotData, data.delta);
      } else {
        robot = this.createRobot(id, robotData);
        this.addChild(robot);
      }
    }
    Object.keys(RobotLayer.RobotMap).filter(id => !data.data.robots[id]).forEach(id => this.removeRobot(id));
  }

  createRobot(id, robotData) {
    let robot = new Robot(robotData, this.events);
    RobotLayer.RobotMap[id] = robot;

    return robot;
  }

  removeRobot(id) {
    let robot = RobotLayer.RobotMap[id];
    delete RobotLayer.RobotMap[id];
    if (Robot.settingDestination === robot) this.cancelDestination();
    if (Robot.selected === robot) robot.unselect();
    this.removeChild(robot);
  }

  setDestination(id) {
    Robot.settingDestination = RobotLayer.RobotMap[id];
    this.destinationLine = new DestinationLine();
    this.addChild(this.destinationLine);
  }

  updateDestinationLine() {
    this.destinationLine && this.destinationLine.update();
  }

  cancelDestination() {
    Robot.settingDestination = null;
    if (this.destinationLine) {
      this.destinationLine.onDestroy();
      this.removeChild(this.destinationLine);
      this.destinationLine = null;
    }
  }

  toggleLine(showLine) {
    Robot.showLine = showLine;
  }

  onDestroy() {
    RobotLayer.RobotMap = {};
  }
}