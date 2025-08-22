<!--<template>-->
<!--  <div v-html="renderedMarkdown"></div>-->
<!--</template>-->

<!--<script>-->
<!--import MarkdownIt from 'markdown-it';-->
<!--import mk from 'markdown-it-katex';-->

<!--export default {-->
<!--  data() {-->
<!--    let displayText = `-->
<!--    公式 $100\%$-->
<!--    `;-->
<!--    let thinkingContent= `-->
<!--    ## 思考过程-->

<!--1. 创建一个项目，并安装依赖-->
<!--2. 创建一个组件，并引入到项目里-->
<!--3. 创建一个页面，并引入到项目里-->
<!--4. 创建一个路由，并引入到项目里-->
<!--5. 创建一个 store，并引入到项目里-->
<!--6. 创建一个 service，并引入到项目里-->
<!--7. 创建一个 service，并引入到项目里-->
<!--8. 创建一个 service，并引入到项目里-->
<!--9. 创建一个 service，并引入到项目里-->
<!--10. 创建一个 service，并引入到项目里-->
<!--    `;-->
<!--    return {-->
<!--      // markdownContent: `这是一个数学公式示例：$E = mc^2$`-->

<!--      markdownContent: `-->
<!--<details open>-->
<!--<summary style="cursor: pointer; user-select: none;">思考过程</summary>-->
<!--<div style="color: #888888; font-size: 12px;">-->
<!--${thinkingContent}-->
<!--</div>-->
<!--</details>-->

<!--${displayText}`-->
<!--    };-->
<!--  },-->
<!--  computed: {-->
<!--    renderedMarkdown() {-->
<!--      const md = new MarkdownIt();-->
<!--      md.use(mk);-->
<!--      return md.render(this.markdownContent);-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style>-->
<!--/* 在这里添加KaTeX的CSS样式 */-->
<!--@import 'katex/dist/katex.min.css';-->
<!--</style>-->
<template>
  <Markdown :source="content" :options="mdOptions" />
</template>

<script setup>
import { ref } from 'vue';
import Markdown from 'vue3-markdown-it';
import markdownIt from 'markdown-it';
import mk from 'markdown-it-katex';

// ✅ 1. 创建 markdown-it 实例，并添加 katex 插件
const md = markdownIt({
  html: true,        // 允许 HTML 标签
  linkify: true,     // 自动转换网址
  typographer: true, // 智能引号等
}).use(mk, {
  throwOnError: false,  // 遇到公式错误不崩溃
  errorColor: 'red',    // 错误公式显示为红色
});

// ✅ 2. 定义你的内容
const thinkingContent = "这是一个思考过程...";
const displayText = "利润率是 $x = 100\\%$，公式应该被渲染。";

const content = `
<details open>
<summary style="cursor: pointer; user-select: none;">思考过程</summary>
<div style="color: #888888; font-size: 12px;">
${thinkingContent}
</div>
</details>

${displayText}
`;

// ✅ 3. 传入自定义 markdown-it 实例
const mdOptions = {
  markdownIt: md,
};
</script>

<!-- ✅ 4. 引入 KaTeX 样式 -->
<style>
/* 在这里添加KaTeX的CSS样式 */
@import 'katex/dist/katex.min.css';
</style>
