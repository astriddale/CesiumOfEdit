// 普通点线面绘制
import EntityDraw from "@/js/LabelPlotting/EntityDraw"

let cesiumInit = {
    init(el) {
        this.initViewer(el);
        this.load3ditles();
        this.initDrawTool();
    },

    //初始化viewer
    initViewer(el) {
        this.viewer = new Cesium.Viewer(el, {
            infoBox: false,
            selectionIndicator: false,
            navigation: false,
            animation: false,
            shouldAnimate: false,
            timeline: false,
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            imageryProvider: new Cesium.UrlTemplateImageryProvider({
                url: appConfig.imageryProvider
            })
        });
        this.viewer.scene.globe.depthTestAgainstTerrain = true; //默认为false
    },

    //初始化绘制工具
    initDrawTool() {
        this.drawTool = new EntityDraw(this.viewer);
        this.drawTool.DrawEndEvent.addEventListener((result, positions, drawType) => {
            result.remove();
            this.addDrawResult(positions, drawType);
            console.log("绘制类型：" + drawType + "结果如下");
            console.log(positions)
        })
    },

    //添加绘制结果
    addDrawResult(positions, drawType) {
        switch (drawType) {
            case "Point":
                this.generatePoint(positions);
                break;
            case "Polyline":
                this.generatePolyline(positions);
                break;
            case "Polygon":
                this.generatePolygon(positions);
                break;
        }
    },

    //构造点
    generatePoint(positions) {
        let entity = this.viewer.entities.add({
            position: positions[0],
            billboard: {
                image: "static/images/poi/sp.png",
                scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            }
        })
    },

    //构造线
    generatePolyline(positions) {
        let entity = this.viewer.entities.add({
            polyline: {
                positions: positions,
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    },

    //构造面
    generatePolygon(positions) {
        let entity = this.viewer.entities.add({
            polygon: {
                hierarchy: positions,
                material: Cesium.Color.RED.withAlpha(0.4),
                perPositionHeight: true
            },
            polyline: {
                positions: positions.concat(positions[0]),
                width: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                })
            }
        })
    },

    //激活绘制工具
    drawActivate(type) { //type in Point Polyline Polygon
        this.drawTool.activate(type);
    },

    //清除所有绘制
    clearDraw() {
        this.viewer.entities.removeAll();
    },

    //加载三维模型
    load3ditles() {
        var tileset = this.viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                url: appConfig.zy3dtiles,
            })
        );

        tileset.readyPromise
            .then(tileset => {
                this.tileset = tileset;
                this.viewer.zoomTo(
                    tileset,
                );
                this.setTilesetHeight(55);
            })
            .otherwise(function(error) {
                console.log(error);
            });
    },

    //设置模型高度
    setTilesetHeight(height) {
        var cartographic = Cesium.Cartographic.fromCartesian(
            this.tileset.boundingSphere.center
        );
        var surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            cartographic.height
        );
        var offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude, height
        );
        var translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
        );
        this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    },

    destroy() {
        this.viewer.entities.removeAll();
        this.viewer.imageryLayers.removeAll(true);
        this.viewer.destroy();
    },
}
export default cesiumInit;