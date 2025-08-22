import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router"
import {useUserStore} from "@/store/modules/user.store.ts"
import Layout from '@/components/layout/index.vue'

/*?Note: 路由配置项

hidden: true                     // 当设置 true 的时候该路由不会在侧边栏出现 如 401，login 等页面，或者如一些编辑页面/edit/1
alwaysShow: true                 // 当一个路由下面的 children 声明的路由大于 1 个时，自动会变成嵌套的模式--如组件页面
// 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
// 若想不管路由下面的 children 声明的个数都显示你的根路由
// 可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
name:"router-name"               // 设定路由的名字，一定要填写不然使用 <keep-alive> 时会出现各种问题
query: "{\"id\": 1, \"name\": \"ry\"}" // 访问路由的默认传递参数
roles: ["admin", "common"]       // 访问路由的角色权限
permissions: ["a:a:a", "b:b:b"]  // 访问路由的菜单权限
meta : {
    noCache: true                   // 如果设置为 true，则不会被 <keep-alive> 缓存(默认 false)
    title: "title"                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: "svg-name"                // 设置该路由的图标，对应路径 src/assets/icons/svg
    breadcrumb: false               // 如果设置为 false，则不会在 breadcrumb 面包屑中显示
    activeMenu: "/system/user"      // 当路由设置了该属性，则会高亮相对应的侧边栏。
}*/

declare module "vue-router" {
    interface RouteMeta {
        hidden?: boolean;
        title?: string;
        icon?: string;
        elSvgIcon?: string;
        permissions?: string[];
        requiresAuth?: boolean; // 是否需要登录
        layout?: boolean; // 是否使用横屏布局
    }

    interface _RouteRecordBase {
        hidden?: boolean;
        parentPath?: string;
        permissions?: string[]

    }

    interface _RouteLocationBase {
        title?: string;
    }
}

export const routes = [
    {
        path: '/',
        name: 'login',
        component: () => import('@/views/Login/index.vue'),
    },
    // {
    //     path: '/lobby',
    //     name: 'Lobby',
    //     component: () => import('@/views/Lobby/index.vue'),
    //     meta: {
    //         title: '游戏大厅',
    //         requiresAuth: true
    //     },
    // },
    // {
    //     path: '/room',
    //     name: 'Room',
    //     component: () => import('@/views/Room/index.vue'),
    //     meta: {
    //         title: '游戏房间',
    //         requiresAuth: true
    //     },
    // },
    // 布局容器路由（所有需要布局的页面作为其子路由）
    {
        path: '/',
        component: Layout,
        meta: {
            layout: true
        },
        children: [
            {
                path: 'lobby',
                name: 'Lobby',
                component: () => import('@/views/Lobby/index.vue'),
                meta: {
                    title: '游戏大厅',
                    requiresAuth: true
                },
            },
            {
                path: 'room',
                name: 'Room',
                component: () => import('@/views/Room/index.vue'),
                meta: {
                    title: '游戏房间',
                    requiresAuth: true
                },
            },
            {
                path: 'poker',
                name: 'Poker',
                component: () => import('@/views/PokerDeck/index.vue'),
                meta: {
                    title: '扑克',
                    requiresAuth: true
                },
            }
        ]
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes,

    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {top: 0};
        }
    },
})


// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next('/'); // 未登录跳转到用户名输入页
    } else {
        next();
    }
});

export default router
