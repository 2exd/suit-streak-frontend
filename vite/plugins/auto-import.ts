import AutoImport from "unplugin-auto-import/vite"
import {ElementPlusResolver} from "unplugin-vue-components/resolvers"

export default function createAutoImport() {
    return AutoImport({
        // 在哪些文件下自动导入
        include: [
            /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
            /\.vue$/,
            /\.vue\?vue/, // .vue
            /\.md$/, // .md
            "src/types/auto-imports.d.ts"
        ],
        // 自动导入的内容
        imports: [
            "vue",
            "vue-router",
            "pinia",
            "@vueuse/core"
        ],
        // 配置文件生成位置，默认是根目录
        dts: "src/types/auto-imports.d.ts",
        resolvers: [
            ElementPlusResolver(),
        ]
    })
}
