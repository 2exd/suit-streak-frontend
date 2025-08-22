import {createApp} from "vue"
// import "./styles/app.css"
import router from "./router/index.ts"
import store from "@/store"
import App from "./App.vue"

// 导入全局样式
import "@/styles/global.scss"


// svg-icon
// import 'virtual:svg-icons-register'
//? Vant 桌面端适配
// import "@vant/touch-emulator"
import Vant from "vant" // 引入 Vant 组件库
import "vant/lib/index.css" // 引入 Vant 样式


const app = createApp(App)

app.use(Vant)  // 注册 Vant
app.use(store)
app.use(router)

app.mount("#app")
