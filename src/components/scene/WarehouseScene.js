import * as PIXI from 'pixi.js';
import WsWorker from '../workers/WsWorker';
import MouseCtrl from '../utils/MouseCtrl';
import MapLayer from './layers/MapLayer';
import RobotLayer from './layers/RobotLayer';
import SceneManager from './SceneManager';
import WelcomeScene from './WelcomeScene';
import BaseScene from './BaseScene';
import Robot from './widgets/Robot';
import Cell from './widgets/Cell';
import { getCells } from '../api';

export default class WarehouseScene extends BaseScene {
  mapLayer;
  robotLayer;

  worker;
  mouseCtrl;

  constructor(app, socketUrl, events) {
    super();

    this.name = 'WarehouseScene';
    this.app = app;
    this.socketUrl = socketUrl;
    this.events = events;
  }

  async enter() {
    console.log('enter warehouse')

    this.initLayers();
    this.initEvents();
    let cellData = await getCells();
    // let robotData = await getRobots();
    this.mapLayer.initMap(cellData.data);
    this.robotLayer.initRobot({});
    this.mouseCtrl = new MouseCtrl(this.app, this);
    this.worker = new WsWorker(this.socketUrl, async data => {
      this.robotLayer.updateRobot(data);
      this.mapLayer.updateCell(data);
    });
  }

  onDestroy() {
    this.worker && this.worker.destroy();
    this.mouseCtrl.onDestroy();
    this.mapLayer.onDestroy();
    this.robotLayer.onDestroy();
  }

  async nextTick() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  initLayers() {
    this.mapLayer = new MapLayer(this.events);
    this.addChild(this.mapLayer);
    this.robotLayer = new RobotLayer(this.events);
    this.addChild(this.robotLayer);
  }
  
  initEvents() {
    this.events.$off('APP:searchCell');
    this.events.$off('APP:searchRobot');
    this.events.$off('APP:removeRobot');
    this.events.$off('APP:setDestination');
    this.events.$off('APP:cancelDestination');
    this.events.$off('APP:toggleLine');
    this.events.$off('APP:toggleBlock');
    this.events.$off('APP:toggleHot');
    this.events.$off('updateDestinationLine');
    this.events.$on('APP:searchCell', id => MapLayer.CellMap[id] ? MapLayer.CellMap[id].onClick() : Cell.selected?.unselect());
    this.events.$on('APP:searchRobot', id => RobotLayer.RobotMap[id] ? RobotLayer.RobotMap[id].onClick() : Robot.selected?.unselect());
    this.events.$on('APP:removeRobot', id => this.robotLayer.removeRobot(id));
    this.events.$on('APP:setDestination', id => this.robotLayer.setDestination(id));
    this.events.$on('APP:cancelDestination', () => this.robotLayer.cancelDestination());
    this.events.$on('APP:toggleLine', showLine => this.robotLayer.toggleLine(showLine));
    this.events.$on('APP:toggleBlock', cellCode => this.mapLayer.toggleBlock(cellCode));
    this.events.$on('APP:toggleHot', showHot => this.mapLayer.toggleHot(showHot));
    this.events.$on('updateDestinationLine', () => this.robotLayer.updateDestinationLine());
    this.events.$once('APP:back', () => SceneManager.enterScene(this.app, new WelcomeScene(this.app, this.socketUrl, this.events)));
  }
}