import * as PIXI from 'pixi.js';

export default class BaseScene extends PIXI.Container {
  name;
  app;
  events;

  constructor() {
    super();
  }

  emit(name, ...args) {
    this.events.$emit(name, ...args);
  }
}