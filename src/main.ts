import {createApp} from "vue"
// import "./styles/app.css"

import router from "./router/index.ts"
import store from "@/store"
import App from "./App.vue"

// 导入全局样式
import '@/styles/global.scss';

// svg-icon
// import 'virtual:svg-icons-register'
//? vant
import "vant/lib/index.css"


const app = createApp(App)

app.use(store)
app.use(router)

app.mount("#app")
