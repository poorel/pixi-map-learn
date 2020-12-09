import * as PIXI from 'pixi.js';
import MapUtil from '../../utils/MapUtil';
import Cell from '../widgets/Cell';

export default class MapLayer extends PIXI.Sprite {

  static CellMap = {};

  static showHot = true;

  constructor(events) {
    super();

    this.events = events;
    
    this.sortableChildren = true;
  }

  async initMap(mapData) {
    const CellDataList = MapUtil.generateMapData(mapData);

    for (let i = 0, n = CellDataList.length; i < n; i++) {
      let cell = new Cell(CellDataList[i], this.events);
      MapLayer.CellMap[cell.data.cellCode] = cell;
      this.addChild(cell);
    }
    
    this.x = -MapUtil.BoundRect.x;
    this.y = -MapUtil.BoundRect.y;

    // this.cacheAsBitmap = true;
  }

  updateCell(data) {
    if (MapLayer.showHot) {
      for (let i = 0, n = data.data.cells.length; i < n; i++) {
        let cellData = data.data.cells[i];
        let cell = MapLayer.CellMap[cellData.cellCode];
        if (cell) {
          cell.update(cellData);
        }
      }
    }
  }

  toggleBlock(cellCode) {
    let cell = MapLayer.CellMap[cellCode];
    cell.toggleBlock();
  }

  toggleHot(showHot) {
    MapLayer.showHot = showHot;
    if (!showHot) {
      for (let cellCode in MapLayer.CellMap) {
        MapLayer.CellMap[cellCode].update();
      }
    }
  }

  onDestroy() {}
}