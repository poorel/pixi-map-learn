import * as PIXI from 'pixi.js';
import Robot from './Robot';
import MapUtil from '../../utils/MapUtil';
import Mouse from '../../utils/Mouse';
import MapLayer from '../layers/MapLayer';
import { setObstacles, addTask } from '../../api';

export default class Cell extends PIXI.Container {
  static selected = null;

  constructor(cellData, events) {
    super();

    this.data = { ...cellData.data, hot: 0 };
    this.events = events;

    this.cell = new PIXI.Graphics();
    this.addChild(this.cell);

    this.init(cellData);
    this.addEvent();
  }

  init(cellData) {
    if (!Cell.point) {
      let CellSize = MapUtil.CellSize * MapUtil.Scale;
      Cell.points = [
        new PIXI.Point(-CellSize * MapUtil.TRANS_COORD.y, -CellSize / 2),
        new PIXI.Point(0, -CellSize),
        new PIXI.Point(CellSize * MapUtil.TRANS_COORD.y, -CellSize / 2),
        new PIXI.Point(CellSize * MapUtil.TRANS_COORD.y, CellSize / 2),
        new PIXI.Point(0, CellSize),
        new PIXI.Point(-CellSize * MapUtil.TRANS_COORD.y, CellSize / 2),
      ]
    }
    this.x = cellData.x;
    this.y = cellData.y;
    this.draw();
  }

  addEvent() {
    this.interactive = true;
    
    this.on('click', e => this.onClick(e));
    this.on('mouseover', e => {
      Mouse.x = this.x;
      Mouse.y = this.y;
      this.events.$emit('updateDestinationLine');
    });
  }
  
  onClick() {
    if (Robot.settingDestination) {
      if (Robot.settingDestination.data.status === 0) {
        if (this.data.obstacle) {
          return this.events.$message({ type: 'warning', message: '不能设置障碍为终点' })
        }
        addTask(Robot.settingDestination.data.robotId, this.data.cellCode);
      } else {
        return this.events.$message({ type: 'warning', message: `机器人 ${Robot.settingDestination.data.robotId} 正在任务中`});
      }
      Robot.settingDestination = null;
      this.events.$emit('setDestination', this.data);
      return;
    }
    let selected = Cell.selected;
    if (selected) {
      selected.unselect();
      if (selected === this) return;
    }
    this.select();
  }

  select() {
    Cell.selected = this;
    this.draw();
    this.zIndex = 1;
    this.events.$emit('selectCell', { ...this.data });
  }
  
  unselect() {
    Cell.selected = null;
    this.draw();
    this.zIndex = 0;
    this.events.$emit('selectCell');
  }

  toggleBlock() {
    this.data.obstacle = !this.data.obstacle;
    this.draw();
    this.events.$emit('selectCell', { ...this.data });
    setObstacles(this.data.cellCode, this.data.obstacle ? '1' : '0');
  }

  update(cellData = {}) {
    let { hot, obstacle } = this.data;
    let { isObstacle, ...desc } = cellData;
    Object.assign(this.data, { obstacle: isObstacle, ...desc });
    if (this.data.hot !== hot || this.data.obstacle !== obstacle) this.events.$emit('updateCell', { ...this.data });
    this.draw();
  }

  draw() {
    this.cell.clear();
    if (Cell.selected === this) {
      if (this.data.obstacle) {
        this.cell.lineStyle(2, 0xB0DF81);
        this.cell.beginFill(0xDEDEDE);
        this.cell.drawPolygon(Cell.points);
        this.cell.endFill();
      } else {
        if (MapLayer.showHot) {
          this.cell.lineStyle(2, 0xB0DF81);
          this.cell.beginFill(...Cell.getHotColor(this.data.hot));
        } else {
          this.cell.lineStyle(2, 0xECECEC);
          this.cell.beginFill(0xB0DF81);
        }
        this.cell.drawPolygon(Cell.points);
        this.cell.endFill();
      }
    } else if (this.data.obstacle) {
      this.cell.lineStyle(2, 0xECECEC);
      this.cell.beginFill(0xDEDEDE);
      this.cell.drawPolygon(Cell.points);
      this.cell.endFill();
    } else {
      this.cell.lineStyle(2, 0xECECEC);
      if (MapLayer.showHot) this.cell.beginFill(...Cell.getHotColor(this.data.hot));
      else this.cell.beginFill(0xFFFFFF);
      this.cell.drawPolygon(Cell.points);
      this.cell.endFill();
    }
  }

  static getHotColor(hot) {
    if (hot === 0) {
      return [0xFFFFFF];
    } else if (hot === 1) {
      return [0xf8ff01, 0.2];
    } else if (hot === 2) {
      return [0xffe301, 0.6];
    } else if (hot === 3) {
      return [0xffb401];
    } else if (hot === 4) {
      return [0xff6501];
    } else if (hot === 5) {
      return [0xff2201];
    } else {
      return [0xff0101];
    }
  }
}