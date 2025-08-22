<script lang="ts" setup>
import Latex from "@/views/Home/Latex.vue"
import Markdown from "vue3-markdown-it"
import markdownIt from "markdown-it"
import mk from "markdown-it-katex"

// 初始化 markdown-it 并添加 katex 插件
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(mk, {
  throwOnError: false, // 如果 KaTeX 抛出错误，不会中断渲染
  errorColor: "#cc0000" // 错误显示颜色
})

// 配置项
const mdOptions = {
  markdownIt: md,
}

// Markdown 内容
const mkContent = ref(`
# 示例

这是一个包含公式的示例：

$$
E = mc^2
$$

内联公式如 $100\%$。
`);


// 插件列表，这里不需要额外的插件，因为我们直接在 options 中配置了 markdown-it 和 katex
const plugins = []
const thinkingContent = `
## 思考过程

1. 创建一个项目，并安装依赖
2. 创建一个组件，并引入到项目里
3. 创建一个页面，并引入到项目里
4. 创建一个路由，并引入到项目里
5. 创建一个 store，并引入到项目里
6. 创建一个 service，并引入到项目里
7. 创建一个 service，并引入到项目里
8. 创建一个 service，并引入到项目里
9. 创建一个 service，并引入到项目里
10. 创建一个 service，并引入到项目里
`
const displayText = `
公式 $100\%$
`

const content = `
<details open>
<summary style="cursor: pointer; user-select: none;">思考过程</summary>
<div style="color: #888888; font-size: 12px;">
${thinkingContent}
</div>
</details>

${displayText}`

</script>

<template>
  home
  <el-divider></el-divider>
  <Markdown :html="true" :source="content"/>
  <el-divider></el-divider>

  <Markdown :options="mdOptions" :plugins="plugins" :source="mkContent"/>
  <el-divider></el-divider>

  <Latex></Latex>

</template>
<style
    scoped
    src="katex/dist/katex.min.css">

</style>
