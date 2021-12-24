import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routers"

Vue.use(Router)

export const constantRouterMap = [{
        path: '/',
        redirect: "/orderlist",
    },
    {
        path: '/orderlist',
        name: "orderlist",
        component: () =>
            import ('@/views/AppLayout/OrderList'),
        meta: {
            title: "顺序浏览"
        }
    },
    ...routes
]

export default new Router({
    mode: "history",
    routes: constantRouterMap
})