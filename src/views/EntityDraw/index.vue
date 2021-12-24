<template>
  <div class="app-wrapp">
    <div class="cesium-container" id="cesium-container"></div> 
    <div class="panel">
      <div class="panel-header">点线面绘制</div>
      <div class="panel-body">
        <button @click="drawActivate('Point')">绘制点</button>
        <button @click="drawActivate('Polyline')">绘制线</button>
        <button @click="drawActivate('Polygon')">绘制面</button>
        <button @click="clearDraw">清空绘制</button>

        <div class="tip-item">点击“绘制点”按钮后在场景中点击鼠标左键绘制点</div>

        <div class="tip-item">点击“绘制线”按钮后在场景中点击鼠标左键绘制线,点击鼠标右键结束绘制。</div>

        <div class="tip-item">点击“绘制面”按钮后在场景中点击鼠标左键绘制面,点击鼠标右键结束绘制。</div>

        <div class="tip-item">点击“清空绘制”按钮后删除所有绘制对象</div>

        <div class="tip-item">第一次绘制点后可能图标加载较慢，属正常情况，绘制结束会有回调事件，在回调事件中获取绘制结果</div>
      </div>
    </div>
  </div>
</template>

<script> 
import cesiumInit from "./gis3d.js";

export default { 
  mounted() {
    cesiumInit.init("cesium-container");
    cesiumInit.drawTool.DrawEndEvent.addEventListener(
      (result, positions, drawType) => {
        this.$message.success("绘制结束，结果打印在控制台，按F12查看");
      }
    );
  },

  beforeDestroy() {
    cesiumInit.destroy();
  },

  methods: { 
    drawActivate(type) {
      cesiumInit.drawActivate(type);
    },

    clearDraw() {
      cesiumInit.clearDraw();
    }
  }
};
</script>
 