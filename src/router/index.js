import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/newslist',
                    name: 'newslist',
                    component: resolve => require(['../components/page/news/NewsList.vue'], resolve),
                    meta: { title: '新闻管理', permission: true }
                },
                {
                    path: '/newsdetail',
                    name: 'newsdetail',
                    component: resolve => require(['../components/page/news/NewsDetail.vue'], resolve),
                    meta: { title: '模型新闻', permission: true }
                },
                {
                    path: '/about',
                    name: 'about',
                    component: resolve => require(['../components/page/about/AboutDetail.vue'], resolve),
                    meta: { title: '活动介绍', permission: true }
                },
                {
                    path: '/404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: resolve => require(['../components/page/403.vue'], resolve),
                    meta: { title: '403' }
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
