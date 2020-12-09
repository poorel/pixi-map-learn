import * as PIXI from 'pixi.js';

export default class MapUtil {
    static MAPCELLTYPECOLORMAP = {
        'NULL_CELL': 'fffffff',
        'SHELF_CELL': 'CED3E2', //货架位
        'N2S_PATH_CELL': 'FFFFFF',
        'E2W_PATH_CELL': 'FFFFFF',
        'W2E_PATH_CELL': 'FFFFFF',
        'S2N_PATH_CELL': 'FFFFFF',
        'E2W_S2N_PATH_CELL': 'FFFFFF',
        'E2W_N2S_PATH_CELL': 'FFFFFF',
        'W2E_S2N_PATH_CELL': 'FFFFFF',
        'W2E_N2S_PATH_CELL': 'FFFFFF',
        'E2W_W2E_PATH_CELL': 'FFFFFF',
        'N2S_S2N_PATH_CELL': 'FFFFFF',
        'E2W_W2E_N2S_PATH_CELL': 'FFFFFF',
        'E2W_W2E_S2N_PATH_CELL': 'FFFFFF',
        'N2S_S2N_E2W_PATH_CELL': 'FFFFFF',
        'N2S_S2N_W2E_PATH_CELL': 'FFFFFF',
        'OMNI_DIR_CELL': 'FFFFFF',
        'PICKSTATION_PATH_CELL': '6FB92C', //拣货工位路径
        'CHARGER_PI_CELL': 'AAAAAA', //充电设施
        'CHARGER_CELL': 'F5CE03', //充电位
        'PICKSTATION_PICK_CELL': '008BD5', //停车拣货
        'PICKSTATION_TURN_CELL': 'FF851B' //货架翻转区
    };
    static CellFlag = {
        'LOCKED': 'f7cccc',
        'STOPPED': 'fdd8bb'
    };

    static BoundRect;

    static CellSize = 10;
    static Scale = 2.5;
    static TRANS_COORD = {
        x: -1.5,
        y: Math.sqrt(3) * 0.5
    };

    static generateMapData(mapData) {
        let p1, p2;
        let CellDataList = [];
        let CellSize = MapUtil.CellSize * MapUtil.Scale;
        for (let i = 0, m = mapData.cells.length; i < m; i++) {
            let mapCell = mapData.cells[i];
            let cellData = MapUtil.transCoord(mapCell.x, mapCell.y, mapCell.z);
            if (!p1) p1 = new PIXI.Point(cellData.x, cellData.y);
            if (!p2) p2 = new PIXI.Point(cellData.x, cellData.y);
            p1.x = Math.min(p1.x, cellData.x - CellSize - 10);
            p1.y = Math.min(p1.y, cellData.y - CellSize - 10);
            p2.x = Math.max(p2.x, cellData.x + 10);
            p2.y = Math.max(p2.y, cellData.y + 10);
            CellDataList.push({ ...cellData, data: mapCell });
        }

        let width = p2.x - p1.x + CellSize;
        let height = p2.y - p1.y + CellSize;
        MapUtil.BoundRect = new PIXI.Rectangle(p1.x, p1.y, width, height);

        return CellDataList;
    }

    static transCoord(x, y, z) {
        return {
            x: (x - y) * MapUtil.TRANS_COORD.y * MapUtil.Scale,
            y: z * MapUtil.TRANS_COORD.x * MapUtil.Scale
        };
    }
}