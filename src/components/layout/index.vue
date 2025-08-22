<script
  lang="ts"
  setup
>
import {onMounted, ref} from "vue"
import { showToast } from 'vant';

const isLandscape = ref<boolean>(window.innerWidth > window.innerHeight)

// 生命周期与事件监听
onMounted(() => {
  // 屏幕方向检测
  const checkOrientation = () => {
    isLandscape.value = window.innerWidth > window.innerHeight
    if (!isLandscape.value) {
      showToast({
        message: "请横屏以获得最佳体验",
        duration: 2000,
        position: "bottom"
      })
    }
  }

  checkOrientation()
  window.addEventListener("resize", checkOrientation)


  return () => {
    window.removeEventListener("resize", checkOrientation)
  }
})
</script>

<template>
  <div class="">
    <!-- 顶部导航区 -->
    <header class="">
    </header>
    <!-- 竖屏提示层 -->
    <div
      v-if="!isLandscape"
      class="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white p-6"
    >
      <div class="text-6xl mb-4">📱</div>
      <h3 class="text-xl font-bold mb-2">请将设备横屏</h3>
      <p class="text-center">以获得最佳游戏体验</p>
    </div>
    <!-- 主内容区（路由视图） -->
    <main class=" ">
      <router-view />
    </main>

    <!-- 底部操作区 -->
    <footer>
    </footer>
  </div>
</template>

<style scoped>

</style>
