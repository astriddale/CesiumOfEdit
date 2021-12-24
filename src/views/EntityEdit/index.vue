<template>
  <div class="app-wrapp">
    <div class="cesium-container" id="cesium-container"></div> 
    <div class="panel">
      <div class="panel-header">点线面编辑</div>
      <div class="panel-body">
        <button @click="drawActivate('Point')">绘制点</button>
        <button @click="drawActivate('Polyline')">绘制线</button>
        <button @click="drawActivate('Polygon')">绘制面</button>
        <button @click="clearDraw">清空绘制</button>
        <div class="tip-item">
          点击按钮后在场景中绘制，绘制完成后选中要编辑的对象。
          按住红色点进行整体移动，按住黑色点移动节点，点击蓝色点新增节点。
        </div>

        <div class="tip-item">点击编辑对象之外的地方，结束编辑。编辑结束会触发编辑结束事件（默认打印结果在控制台）</div>
      </div>
    </div>
  </div>
</template>

<script>  
import cesiumInit from "./gis3d.js";

export default { 
  mounted() {
    cesiumInit.init("cesium-container");
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
 