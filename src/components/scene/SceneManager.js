export default class SceneManager {
  static scene;

  static async enterScene(app, scene) {
    if (SceneManager.scene) {
      try {
        await SceneManager.scene.onDestroy();
      } catch {}
      app.stage.removeChild(SceneManager.scene);
    }
    setTimeout(() => {
      scene.emit('toggleScene', scene.name);
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        SceneManager.scene = scene;
        app.stage.addChild(scene);
        scene.enter();
      }, scene.name === 'WarehouseScene' ? 0 : 350);
    });
  }
}