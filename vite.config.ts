import {defineConfig, loadEnv} from "vite"
import path from "path"
import Icons from "unplugin-icons/vite"
import tailwindcss from "tailwindcss"
import pxtovw from "postcss-px-to-viewport"
import createVitePlugins from "./vite/plugins"


// const loder_pxtovw = pxtovw({
//     //这里是设计稿宽度 自己修改
//     viewportWidth: 1440,
//     viewportUnit: "vw",
// })


// https://vite.dev/config/
export default defineConfig(({mode, command}) => {
    const env = loadEnv(mode, process.cwd())
    const {VITE_APP_ENV} = env
    return {
        plugins: [
            createVitePlugins(env, command === "build"),
            Icons({compiler: "vue3", autoInstall: true}),

        ],
        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    // loader_pxtovw
                ],
            },
            preprocessorOptions: {
                scss: {
                },
            },
        },
        devSourcemap: true,
        base: VITE_APP_ENV === "production" ? "/" : "/",
        resolve: {
            alias: {
                // 设置路径
                "~": path.resolve(__dirname, "./"),
                // 设置别名
                "@": path.resolve(__dirname, "src")
            },
            extensions: [".js", ".json", ".ts", ".vue"] // 使用路径别名时想要省略的后缀名
        },
        server: {
            proxy: {
                "/devApi": {
                    target: "https://10.194.98.123", // 所要代理的目标地址
                    secure: false,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/devApi/, "") // 重写传过来的path路径
                }
            }
        }
    }
})
