import { createApp } from 'vue'
import './styles/app.css'

import './styles/tailwind.css'
import router from "./router/index.ts";
import App from "./App.vue";

// svg-icon
import 'virtual:svg-icons-register'


// markdown
import Markdown from 'vue3-markdown-it';
import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';
import 'katex/dist/katex.min.css';


const app = createApp(App)


// 配置 markdown-it 实例以支持公式渲染
const md = new MarkdownIt().use(markdownItKatex);

app.use(Markdown, {
    markdownIt: md
});


app.use(router)

app.mount('#app')
