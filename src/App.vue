<template>
  <div id="app">
    <transition name="navbarIn">
      <div class="navbar" v-if="visible">
        <div class="title">
          <img src="./assets/logo.png" />
          六边形地图
        </div>
        <div class="group">602极客联盟</div>
      </div>
    </transition>
    <div class="container">
      <robot-control
        class="robot-map"
        ref="robotControl"
        :socketUrl="`ws://${socketUrl}:8080/ws/robot`"
        @selectCell="selectCell"
        @selectRobot="selectRobot"
        @updateRobot="updateRobot"
        @updateCell="updateCell"
        @setDestination="setDestination"
        @toggleScene="toggleScene" />
      <transition name="toolsIn">
        <div class="tools" v-if="visible">
          <el-tabs class="tabs" v-model="tab" stretch @tab-click="handleTabClick">
            <el-tab-pane label="地图" name="map">
              <label class="search-item">格子：
                <el-input size="small" v-model="cellCode" placeholder="请输入 cellCode" @keydown.native.enter="searchCell">
                  <el-button slot="append" icon="el-icon-search" @click="searchCell"></el-button>
                </el-input>
              </label>
              <div class="data-item">
                <div>CODE：</div>
                <div>{{ cell.cellCode }}</div>
              </div>
              <div class="data-item">
                <div>坐标：</div>
                <div>{{ typeof cell.x == 'number' ? cell.x + ', ' : '' }} {{ typeof cell.y == 'number' ? cell.y + ', ' : '' }} {{ typeof cell.z == 'number' ? cell.z : '' }}</div>
              </div>
              <div class="data-item">
                <div>热度：</div>
                <div>{{ cell.hot }}</div>
              </div>
              <div class="operations">
                <el-button type="info" :disabled="!Object.keys(cell).length" @click="toggleBlock">{{ cell.obstacle ? '清除障碍' : '设为障碍' }}</el-button>
                <el-button type="primary" :disabled="!Object.keys(cell).length || cell.obstacle" @click="addRobot">添加机器人</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="机器人" name="robot">
              <label class="search-item">机器人：
                <el-input size="small" v-model="robotId" placeholder="请输入机器人id" @keydown.native.enter="searchRobot">
                  <el-button slot="append" icon="el-icon-search" @click="searchRobot"></el-button>
                </el-input>
              </label>
              <div class="data-item">
                <div>ID：</div>
                <div>{{ robot.robotId }}</div>
              </div>
              <div class="data-item">
                <div>坐标：</div>
                <div>{{ typeof robot.x == 'number' ? robot.x + ', ' : '' }} {{ typeof robot.y == 'number' ? robot.y + ', ' : '' }} {{ typeof robot.z == 'number' ? robot.z : '' }}</div>
              </div>
              <div class="data-item">
                <div>角度：</div>
                <div>{{ robot.angle }}</div>
              </div>
              <div class="data-item">
                <div>状态：</div>
                <div>{{ typeof robot.status == 'number' ? (robot.status == 1 ? '任务中' : '空闲') : '' }}</div>
              </div>
              <div class="operations">
                <el-button type="primary" :disabled="!Object.keys(robot).length" @click="toggleDestination">{{ settingDestination ? '取消操作' : '设置目的地' }}</el-button>
                <el-button type="danger" :disabled="!Object.keys(robot).length" @click="removeRobot">删除机器人</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="设置" name="settings">
              <div class="data-item">
                <div>模式：</div>
                <div>
                  <el-switch v-model="mode" active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0" active-text="自动模式" inactive-text="手动模式" @change="changeMode" />
                </div>
              </div>
              <div class="data-item">
                <div>显示路线：</div>
                <div>
                  <el-switch v-model="showLine" @change="changeShowLine" />
                </div>
              </div>
              <div class="data-item">
                <div>显示热力图：</div>
                <div>
                  <el-switch v-model="showHot" @change="changeShowHot" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="back">
            <el-button size="small" @click="exit">退出</el-button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { RobotControl } from './components/index.js';
import { addRobot, removeRobot, getMode, setMode } from './components/api';

export default {
  name: 'app',
  components: {
    RobotControl
  },
  data() {
    return {
      socketUrl: 'autotest2.geekplus.cc',
      visible: false,
      tab: 'map',
      cellCode: null,
      robotId: null,
      cell: {},
      robot: {},
      mode: 1,
      showLine: true,
      showHot: true,
      settingDestination: false
    }
  },
  mounted() {
    getMode().then(data => this.mode = data.data);
  },
  methods: {
    handleTabClick(e) {
      console.log(e)
    },
    searchCell() {
      this.cellCode && this.emit('APP:searchCell', this.cellCode);
    },
    searchRobot() {
      this.robotId && this.emit('APP:searchRobot', this.robotId);
    },
    exit() {
      this.emit('APP:back');
    },
    selectCell(cell = {}) {
      this.cell = cell;
    },
    selectRobot(robot = {}) {
      this.robot = robot;
      if (this.settingDestination) {
        this.settingDestination = false;
        this.emit('APP:cancelDestination');
      }
    },
    updateRobot(data) {
      if (data.robotId === this.robot.robotId) {
        Object.assign(this.robot, data);
      }
    },
    updateCell(data) {
      if (data.cellCode === this.cell.cellCode) {
        Object.assign(this.cell, data);
      }
    },
    toggleBlock() {
      console.log('toggleBlock', this.cell.cellCode);
      this.emit('APP:toggleBlock', this.cell.cellCode);
    },
    toggleDestination() {
      console.log('APP:setDestination', this.robot.robotId);
      if (this.settingDestination) {
        this.settingDestination = false;
        this.emit('APP:cancelDestination');
      } else {
        this.settingDestination = true;
        this.emit('APP:setDestination', this.robot.robotId);
      }
    },
    setDestination(data) {
      console.log('destination', data);
      this.settingDestination = false;
      this.emit('APP:cancelDestination');
    },
    addRobot() {
      console.log('addRobot', this.cell.cellCode);
      addRobot(this.cell.cellCode);
    },
    removeRobot() {
      console.log('removeRobot', this.robot.robotId);
      removeRobot(this.robot.robotId);
      this.emit('APP:removeRobot', this.robot.robotId);
    },
    changeMode() {
      console.log('changeMode', this.mode);
      setMode(this.mode);
    },
    changeShowHot() {
      console.log('changeShowHot', this.showHot);
      this.emit('APP:toggleHot', this.showHot);
    },
    changeShowLine() {
      console.log('changeShowLine', this.showLine);
      this.emit('APP:toggleLine', this.showLine);
    },
    toggleScene(scene) {
      console.log('toggleScene', scene);
      this.visible = scene === 'WarehouseScene';
      this.cell = {};
      this.robot = {};
    },
    emit(event, ...args) {
      this.$refs.robotControl.$emit(event, ...args);
    }
  }
}
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
html, body, #app {
  width: 100%;
  height: 100%;
}
#app {
  display: flex;
  flex-flow: column;
  background: #F3F3F3;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #efefef;
  padding: 12px 20px;
  background: #000;
  .title {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 2px 5px #666;
    display: flex;
    align-items: center;
    img {
      height: 22px;
      margin-right: 15px;
    }
  }
  .group {
    color: #d5d5d5;
    font-size: 14px;
  }
}
.container {
  flex: 1;
  display: flex;
  .robot-map {
    flex: 1;
  }
  .tools {
    display: flex;
    flex-flow: column;
    width: 400px;
    height: 100%;
    background: #fff;
    box-shadow: inset 3px 0px 3px #e5e5e5;
    .tabs {
      flex: 1;
      .el-tabs__item {
        font-size: 18px;
        padding: 0;
        height: 48px;
        line-height: 48px;
      }
      .search-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 18px;
        margin: 8px 20px 15px;
        letter-spacing: 2px;
        .el-input {
          flex: 1;
        }
      }
      .data-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #696969;
        font-size: 18px;
        margin: 8px 30px 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #efefef;
        .el-switch__label {
          display: flex;
          align-items: center;
        }
        > div:first-child {
          font-family: fangsong;
          margin-right: 10px;
          letter-spacing: 2px;
        }
        &:last-child {
          border-bottom: none;
        }
      }
      .operations {
        padding: 10px 30px;
        .el-button {
          width: 100%;
          & + .el-button {
            margin: 10px 0 10px;
          }
        }
      }
    }
    .back {
      padding: 10px 20px;
      .el-button {
        width: 100%;
      }
    }
  }
}

.navbarIn-enter-active,
.navbarIn-leave-active {
  transition: all .3s;
}

.navbarIn-enter,
.navbarIn-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.toolsIn-enter-active,
.toolsIn-leave-active {
  transition: all .3s;
}

.toolsIn-enter,
.toolsIn-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
