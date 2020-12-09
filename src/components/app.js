import * as PIXI from 'pixi.js';
import SceneManager from './scene/SceneManager';
import WelcomeScene from './scene/WelcomeScene';
import WarehouseScene from './scene/WarehouseScene';

let app;

const start = (vm, view, socketUrl) => {
  app = new PIXI.Application({
    view: document.getElementById('pixi'),
    resizeTo: view,
    backgroundColor: 0xF3F3F3
  });
  
  app.ticker.maxFPS = 30;

  SceneManager.enterScene(app, new WelcomeScene(app, socketUrl, vm));
}

const stop = () => {
  try {
    SceneManager.scene.onDestroy();
  } catch {}
  app && app.destroy();
  app = null;
  SceneManager.scene = null;
}

export default {
  start, stop
};
