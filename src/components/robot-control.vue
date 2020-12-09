<template>
  <div class="robot-pixi" ref="robot" style="width: 100%; height: 100%;">
    <canvas id="pixi" />
    <canvas id="patternCanvas" style="display: none" />
  </div>
</template>

<script>
import app from './app.js';

export default {
  name: 'RobotControl',
  props: {
    socketUrl: {
      type: String,
    }
  },
  mounted() {
    this.start();
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    start() {
      app.start(this, this.$refs.robot, this.socketUrl);
      this.$emit('start');
    },
    stop() {
      app.stop();
      this.$emit('stop');
    }
  }
}
</script>
