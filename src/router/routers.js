// 分类路由配置  
export default [{
    path: "/entitydraw",
    name: "entitydraw",
    component: () =>
        import ('@/views/EntityDraw'),
    meta: {
        title: "点线面绘制",
    }
}, {
    path: "/entityedit",
    name: "entityedit",
    component: () =>
        import ('@/views/EntityEdit'),
    meta: {
        title: "点线面编辑",
    }
}]