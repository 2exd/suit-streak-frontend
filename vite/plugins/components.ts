import Components from "unplugin-vue-components/vite"
import IconsResolver from "unplugin-icons/resolver"
import {VantResolver} from "@vant/auto-import-resolver"

export default function createComponents() {
    return Components({
        // dts: true, // enabled by default if `typescript` is installed
        dirs: [
            "src/components",        // 基础目录
            "src/**/components"      // 递归查找所有 components 目录
        ],
        include: [/\.vue$/, /\.vue\?vue/],
        dts: "src/types/components.d.ts",
        extensions: ["vue"],
        resolvers: [
            // VantResolver(),
            // 自动注册图标组件
            IconsResolver({
                // 修改Icon组件前缀，不设置则默认为i,禁用则设置为false
                prefix: "icon",
                // 指定collection，即指定为elementplus图标集ep
                enabledCollections: ["ep"]
            })],
    })
}
