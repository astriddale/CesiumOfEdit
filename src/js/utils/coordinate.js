// 笛卡尔转经纬度点
export function cartesian3ToCoordinates(position) {
    const c = Cesium.Cartographic.fromCartesian(position);
    return [
        Cesium.Math.toDegrees(c.longitude),
        Cesium.Math.toDegrees(c.latitude),
        c.height
    ];
}