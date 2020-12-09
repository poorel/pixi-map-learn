import RobotControl from './robot-control.vue';

const install = Vue => {
  if (install.installed) return;
  install.installed = true;

  Vue.component(RobotControl.name, RobotControl);
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { RobotControl };

export default {
  install,
  RobotControl
};