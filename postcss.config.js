export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 添加 px 转 viewport 配置
    'postcss-px-to-viewport': {
      // 横屏设计稿宽度（根据实际设计稿调整，通常是 667px 或 750px）
      viewportWidth: 667,
      // 横屏设计稿高度
      viewportHeight: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      // 忽略 Vant 组件的转换
      selectorBlackList: ['van-'],
      minPixelValue: 1,
      mediaQuery: false,
    },
  },
}
