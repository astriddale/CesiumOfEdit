import * as turf from "@turf/turf"
export default class EntityEdit {
    constructor(viewer) {
        this.viewer = viewer;
        this.initEventHandler();
    }

    //鼠标事件
    initEventHandler() {
        this.eventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.EditEndEvent = new Cesium.Event();
    }

    //激活编辑
    activate() {
        this.deactivate();
        //鼠标左键点击事件 鼠标左键点击拾取需要编辑的对象
        this.initLeftClickEventHandler();
    }

    //禁用编辑
    deactivate() {
        this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.unRegisterEvents();
        this.clearAllEditVertex();
    }

    //清空编辑节点
    clearAllEditVertex() {
        this.clearEditVertex();
        this.clearMidVertex();
    }

    //左键点击事件
    initLeftClickEventHandler() {
        this.eventHandler.setInputAction(e => {
            let id = this.viewer.scene.pick(e.position);
            if (!id || !id.id) {
                this.handleEditEntity();
                return; // 没有拾取到对象 直接返回 不做任何操作
            }

            // 拾取到对象 判断拾取到的对象类型
            if (!id.id || !id.id.Type) return;
            //重复点击同一个对象
            if (this.editEntity && this.editEntity.id == id.id.id) return;

            //拾取到新的GeoPlot对象
            this.handleEditEntity(); //处理上一个编辑对象
            this.handlePickEditEntity(id.id);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    //处理编辑对象
    handleEditEntity() {
        this.unRegisterEvents();
        this.clearAllEditVertex();
        let editEntity = this.editEntity;
        if (!editEntity) return;
        this.closeEntityEditMode();
        this.editEntity = undefined;
        if (!this.isEdited) return; //没有任何编辑 直接返回   

        // console.log("对象被编辑过是否需要保存操作？？");

        //触发编辑事件  
        this.EditEndEvent.raiseEvent(editEntity);
        this.isEdited = false;
        this.isEditing = false;
    }

    //处理拾取到的对象
    handlePickEditEntity(pickId) {
        const EditableTypes = ["EditableMarker", "EditablePolyline", "EditablePolygon"];
        if (EditableTypes.indexOf(pickId.Type) == -1) return;
        this.editEntity = pickId;

        this.isEditing = false;
        this.isEdited = false;

        this.editPositions = this.getEditEntityPositions();
        this.EditMoveCenterPositoin = this.getCenterPosition();

        this.openEntityEditModel();

        this.clearAllEditVertex();
        this.unRegisterEvents();
        this.createEditVertex();
        this.createMidVertex();
        this.registerEvents();
    }

    openEntityEditModel() {
        switch (this.editEntity.Type) {
            case "EditableMarker":
                this.editEntity.position = new Cesium.CallbackProperty(e => {
                    return this.editPositions[0];
                }, false);
                break;
            case "EditablePolyline":
                this.editEntity.polyline.positions = new Cesium.CallbackProperty(e => {
                    return this.editPositions;
                }, false);
                break;
            case "EditablePolygon":
                this.editEntity.polygon.hierarchy = new Cesium.CallbackProperty(e => {
                    return new Cesium.PolygonHierarchy(this.editPositions);
                }, false);

                if (this.editEntity.polyline) {
                    this.editEntity.polyline.positions = new Cesium.CallbackProperty(e => {
                        return this.editPositions.concat(this.editPositions[0]);
                    }, false);
                }
                break;
        }
    }

    closeEntityEditMode() {
        switch (this.editEntity.Type) {
            case "EditableMarker":
                this.editEntity.position = this.editPositions[0];
                break;
            case "EditablePolyline":
                this.editEntity.polyline.positions = this.editPositions;
                break;
            case "EditablePolygon":
                this.editEntity.polygon.hierarchy = this.editPositions;
                if (this.editEntity.polyline) {
                    this.editEntity.polyline.positions = this.editPositions.concat(this.editPositions[0]);
                }
                break;
        }
    }

    getEditEntityPositions() {
        switch (this.editEntity.Type) {
            case "EditableMarker":
                return [this.editEntity.position._value];
            case "EditablePolyline":
                return this.editEntity.polyline.positions._value;
            case "EditablePolygon":
                return this.editEntity.polygon.hierarchy._value.positions;
        }
    }

    //注册事件监听
    registerEvents() {
        //鼠标左键按下事件 当有对象被选中时 如果拾取到编辑辅助要素 表示开始改变对象的位置
        this.initLeftDownEventHandler();
        //鼠标移动事件 鼠标移动 如果有编辑对象 表示改变编辑对象的位置
        this.initMouseMoveEventHandler();
        //鼠标左键抬起事件 当有编辑对象时  
        this.initLeftUpEventHandler();
    }

    //取消事件监听
    unRegisterEvents() {
        this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //场景鼠标左键按下事件
    initLeftDownEventHandler() {
        this.eventHandler.setInputAction((e) => {
            let id = this.viewer.scene.pick(e.position);
            // 拾取到对象 判断拾取到的对象类型 
            if (!id || !id.id || !id.id.type) return;
            //拾取到具有type 属性的entity对象  
            if (id.id.type == "EditVertex" || id.id.type == "EditMove") {
                this.isEditing = true;
                //禁用场景的旋转移动功能 保留缩放功能
                this.viewer.scene.screenSpaceCameraController.enableRotate = false;
                //改变鼠标状态
                this.viewer.enableCursorStyle = false;
                this.viewer._element.style.cursor = '';
                document.body.style.cursor = "move";
                this.editVertext = id.id;
                this.editVertext.show = false;
                this.clearMidVertex();
            } else if (id.id.type == "EditMidVertex") {
                this.editPositions.splice(id.id.vertexIndex, 0, id.id.position._value);
                this.clearAllEditVertex();
                this.createEditVertex();
                this.createMidVertex();
                this.isEdited = true;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    //场景鼠标左键抬起事件
    initLeftUpEventHandler() {
        this.eventHandler.setInputAction(((e) => {
            if (!this.isEditing) return;
            this.viewer.enableCursorStyle = true;
            document.body.style.cursor = "default";
            this.viewer.scene.screenSpaceCameraController.enableRotate = true;
            this.editVertext.show = true;
            this.isEditing = false;
            this.clearMidVertex();
            this.createMidVertex();
        }), Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    //场景鼠标移动事件
    initMouseMoveEventHandler() {
        this.eventHandler.setInputAction(((e) => {
            let pickPosition = this.viewer.scene.pickPosition(e.endPosition);
            if (!pickPosition) {
                pickPosition = this.viewer.scene.camera.pickEllipsoid(e.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!pickPosition) return;

            if (!this.isEditing) return;
            if (this.editVertext.type == "EditMove") {
                let startPosition = this.EditMoveCenterPositoin;
                if (!startPosition) return;
                this.moveEntityByOffset(startPosition, pickPosition);
            } else {
                this.editPositions[this.editVertext.vertexIndex] = pickPosition;
            }
            this.isEdited = true;
            this.EditMoveCenterPositoin = this.getCenterPosition();
        }), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //获取编辑对象中心点
    getCenterPosition() {
        let points = [];
        let maxHeight = 0;
        //如果是点 返回第一个点作为移动点
        if (this.editEntity.Type == "EditableMarker") {
            return this.editPositions[0];
        }

        //获取所有节点的最高位置
        this.editPositions.forEach(position => {
            const point3d = this.cartesian3ToPoint3D(position);
            points.push([point3d.x, point3d.y]);
            if (maxHeight < point3d.z) maxHeight = point3d.z;
        })

        //构建turf.js  lineString
        let geo = turf.lineString(points);
        let bbox = turf.bbox(geo);
        let bboxPolygon = turf.bboxPolygon(bbox);
        let pointOnFeature = turf.center(bboxPolygon);
        let lonLat = pointOnFeature.geometry.coordinates;
        return Cesium.Cartesian3.fromDegrees(lonLat[0], lonLat[1], maxHeight);
    }

    //根据偏移量移动实体
    moveEntityByOffset(startPosition, endPosition) {
        let startPoint3d = this.cartesian3ToPoint3D(startPosition);
        let endPoint3d = this.cartesian3ToPoint3D(endPosition);
        let offsetX = endPoint3d.x - startPoint3d.x;
        let offsetY = endPoint3d.y - startPoint3d.y;
        //设置偏移量
        let element;
        for (let i = 0; i < this.editPositions.length; i++) {
            element = this.cartesian3ToPoint3D(this.editPositions[i]);
            element.x += offsetX;
            element.y += offsetY;
            this.editPositions[i] = Cesium.Cartesian3.fromDegrees(element.x, element.y, element.z)
        }
    }

    //创建编辑节点
    createEditVertex() {
        this.vertexEntities = [];
        this.editPositions.forEach((p, index) => {
            const entity = this.viewer.entities.add({
                position: new Cesium.CallbackProperty(e => {
                    return this.editPositions[index];
                }, false),
                type: "EditVertex",
                vertexIndex: index, //节点索引 
                point: {
                    color: Cesium.Color.DARKBLUE.withAlpha(0.4),
                    pixelSize: 10,
                    outlineColor: Cesium.Color.YELLOW.withAlpha(0.4),
                    outlineWidth: 3,
                    disableDepthTestDistance: 2000,
                },
            })
            this.vertexEntities.push(entity);
        });

        if (this.editPositions.length == 1) { //只有一个节点表示点类型 不需要创建整体移动节点
            return;
        }
        this.createEditMoveCenterEntity();
    }

    //整体移动
    createEditMoveCenterEntity() {
        this.EditMoveCenterEntity = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(e => {
                return this.EditMoveCenterPositoin;
            }, false),
            type: "EditMove",
            point: {
                color: Cesium.Color.RED.withAlpha(0.4),
                pixelSize: 10,
                outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
                outlineWidth: 3,
                disableDepthTestDistance: 2000,
            },
        })
    }

    //清空编辑节点
    clearEditVertex() {
        if (this.vertexEntities) {
            this.vertexEntities.forEach(item => {
                this.viewer.entities.remove(item);
            })
        }
        this.vertexEntities = [];
        this.viewer.entities.remove(this.EditMoveCenterEntity);
    }

    //创建中点节点
    createMidVertex() {
        this.midVertexEntities = [];
        for (let i = 0; i < this.editPositions.length; i++) {
            const p1 = this.editPositions[i];
            const p2 = this.editPositions[i + 1];
            let mideP = this.midPosition(p1, p2);
            const entity = this.viewer.entities.add({
                position: mideP,
                type: "EditMidVertex",
                vertexIndex: i + 1, //节点索引 
                point: {
                    color: Cesium.Color.LIMEGREEN.withAlpha(0.4),
                    pixelSize: 10,
                    outlineColor: Cesium.Color.YELLOW.withAlpha(0.4),
                    outlineWidth: 3,
                    disableDepthTestDistance: 2000,
                },
            })
            this.midVertexEntities.push(entity);
        }
    }

    //清空中点节点
    clearMidVertex() {
        if (this.midVertexEntities) {
            this.midVertexEntities.forEach(item => {
                this.viewer.entities.remove(item);
            })
        }
        this.midVertexEntities = [];
    }

    //笛卡尔坐标转为经纬度xyz
    cartesian3ToPoint3D(position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        return { x: lon, y: lat, z: cartographic.height };
    }

    //获取两个节点的中心点
    midPosition(first, second) {
        if (!first || !second) return null;
        let point3d1 = this.cartesian3ToPoint3D(first);
        let point3d2 = this.cartesian3ToPoint3D(second);
        let midLonLat = {
            x: (point3d1.x + point3d2.x) / 2,
            y: (point3d1.y + point3d2.y) / 2,
            z: (point3d1.z + point3d2.z) / 2
        }
        return Cesium.Cartesian3.fromDegrees(midLonLat.x, midLonLat.y, midLonLat.z);
    }
}