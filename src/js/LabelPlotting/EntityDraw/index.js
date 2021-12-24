export default class EntityDraw {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    //激活
    activate(drawType) {
        this.deactivate();
        this.clear();
        this.drawType = drawType;
        this.positions = [];
        this.tempPositions = [];
        this.registerEvents(); //注册鼠标事件 

        //设置鼠标状态 
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
        // this.DrawStartEvent.raiseEvent("开始绘制");
    }

    //禁用
    deactivate() {
        this.unRegisterEvents();
        this.drawType = undefined;
        this.drawEntity = undefined;

        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
    }

    //清空绘制
    clear() {
        if (this.drawEntity) {
            this.viewer.entities.remove(this.drawEntity);
            this.drawEntity = undefined;
        }
    }

    //初始化事件
    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.DrawStartEvent = new Cesium.Event(); //开始绘制事件
        this.DrawEndEvent = new Cesium.Event(); //结束绘制事件        
    }

    //注册鼠标事件
    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        //单击鼠标左键画点
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            this.positions.push(position);
            if (this.positions.length == 1) {
                this.handleFirstPosition();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    handleFirstPosition() {
        switch (this.drawType) {
            case "Point":
                this.generatePoint();
                this.drawEnd();
                break;
            case "Polyline":
                this.generatePolyline();
                break;
            case "Polygon":
                this.generatePolygon();
                break;
        }
    }

    generatePoint() {
        this.drawEntity = this.viewer.entities.add({
            position: this.positions[0],
            point: {
                pixelSize: 4,
                color: Cesium.Color.RED
            }
        })
    }

    generatePolyline() {
        this.drawEntity = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.tempPositions;
                }, false),
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    }

    generatePolygon() {
        this.drawEntity = this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(e => {
                    return new Cesium.PolygonHierarchy(this.tempPositions);
                    //使用最新1.72的时候 必须返回PolygonHierarchy类型 Cannot read property 'length' of undefined
                    //低版本好像都可以
                }, false),
                material: Cesium.Color.RED.withAlpha(0.4),
                perPositionHeight: true
            },
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.tempPositions.concat(this.tempPositions[0]);
                }, false),
                width: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    }


    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default'; //由于鼠标移动时 Cesium会默认将鼠标样式修改为手柄 所以移动时手动设置回来
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.drawEntity) return;
            this.tempPositions = this.positions.concat([position]);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (!this.drawEntity) {
                this.deactivate()
                return;
            }
            switch (this.drawType) {
                case "Polyline":
                    this.drawEntity.polyline.positions = this.positions;
                    this.minPositionCount = 2;
                    break;
                case "Polygon":
                    this.drawEntity.polygon.hierarchy = this.positions;
                    this.drawEntity.polyline.positions = this.positions.concat(this.positions[0]);
                    this.minPositionCount = 3;
                    break;
            }
            if (this.positions.length < this.minPositionCount) {
                this.clear();
                this.deactivate();
                return;
            }
            this.drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    //解除鼠标事件
    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    //绘制结束 触发结束事件
    drawEnd() {
        this.drawEntity.remove = () => {
            this.viewer.entities.remove(this.drawEntity);
        }
        this.DrawEndEvent.raiseEvent(this.drawEntity, this.positions, this.drawType);
        this.deactivate();
    }
}