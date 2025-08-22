<template>
  <div class="landscape-container toolbar-avoid bg-gray-50">
    <!-- 顶部导航区 -->
    <header class="flex items-center justify-between py-3 border-b border-gray-200">
      <slot name="header-left"></slot>
      <h1 class="text-lg font-bold text-gray-800">
        {{ $route.meta.title || '卡牌游戏' }}
      </h1>
      <slot name="header-right"></slot>
    </header>

    <!-- 主内容区（路由视图） -->
    <main class="flex-1 overflow-hidden relative">
      <router-view />
    </main>

    <!-- 底部操作区 -->
    <footer class="py-3 border-t border-gray-200">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 监听屏幕方向变化
onMounted(() => {
  const checkOrientation = () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    if (!isLandscape) {
      console.log('请将设备横屏以获得最佳体验');
    }
  };

  checkOrientation();
  window.addEventListener('resize', checkOrientation);

  return () => {
    window.removeEventListener('resize', checkOrientation);
  };
});
</script>

<style scoped>
.landscape-container {
  @apply flex flex-col w-full h-screen overflow-hidden;
}

.toolbar-avoid {
  @apply pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)];
}

.orientation-tip {
  @apply fixed inset-0 bg-black/80 flex items-center justify-center z-50;
}

.orientation-tip-content {
  @apply text-white text-center p-6;
}
</style>
