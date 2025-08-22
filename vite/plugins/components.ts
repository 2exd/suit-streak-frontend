import Components from "unplugin-vue-components/vite"
import {ElementPlusResolver} from "unplugin-vue-components/resolvers"
import IconsResolver from "unplugin-icons/resolver"
import {VantResolver} from "@vant/auto-import-resolver"

export default function createComponents() {
    return Components({
        // dts: true, // enabled by default if `typescript` is installed
        dirs: [
            "src/components",        // 基础目录
            "src/**/components"      // 递归查找所有 components 目录
        ],
        dts: "src/types/components.d.ts",
        extensions: ["vue"],
        resolvers: [
            // Vant组件解析器放在最前面
            VantResolver({
                // 确保样式也能自动导入
                importStyle: true
            }),
            // 组件自动导入
            ElementPlusResolver({
                // importStyle: false
                importStyle: "sass" // 解决覆盖element plus 的sass变量不生效的bug
            }),
            // 自动注册图标组件
            IconsResolver({
                // 修改Icon组件前缀，不设置则默认为i,禁用则设置为false
                prefix: "icon",
                // 指定collection，即指定为elementplus图标集ep
                enabledCollections: ["ep"]
            })],
    })
}
