<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user.store.ts"
import { Button, Field } from "vant"
import { showToast } from "vant" // 修复Toast导入
import { useMotion } from "@vueuse/motion"

// 类型定义
const userStore = useUserStore()
const router = useRouter()

// 响应式变量
const username = ref<string>(userStore.username || "")
const inputRef = ref<HTMLDivElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const isLandscape = ref<boolean>(window.innerWidth > window.innerHeight)

// 用户名验证
const isUsernameValid = computed<boolean>(() => {
  const trimmed = username.value.trim()
  return trimmed.length >= 2 && trimmed.length <= 10
})

// 输入处理
const handleInput = (val: string) => {
  username.value = val.trim()
}

// 确认用户名
const confirmUsername = () => {
  if (!isUsernameValid.value) return

  // 按钮点击动画
  if (buttonRef.value) {
    buttonRef.value.classList.add("scale-95", "opacity-80")
    setTimeout(() => {
      buttonRef.value?.classList.remove("scale-95", "opacity-80")
    }, 200)
  }

  userStore.setUsername(username.value)
  setTimeout(() => router.push("/lobby"), 200)
}

// 生命周期与事件监听
onMounted(() => {
  // 屏幕方向检测
  const checkOrientation = () => {
    isLandscape.value = window.innerWidth > window.innerHeight
    if (!isLandscape.value) {
      showToast({ // 修复Toast调用
        message: "请横屏以获得最佳体验",
        duration: 2000,
        position: "bottom"
      })
    }
  }

  checkOrientation()
  window.addEventListener("resize", checkOrientation)

  // 输入框入场动画（适配useMotion v3 API）
  if (inputRef.value) {
    useMotion(inputRef.value, {
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { duration: 500 } },
    })
  }

  // 输入框聚焦动画
  const setupInputEvents = () => {
    if (!inputRef.value) return
    const inputElement = inputRef.value.querySelector<HTMLInputElement>("input")
    if (!inputElement) return

    inputElement.addEventListener("focus", () => {
      inputRef.value?.classList.add("ring-2", "ring-primary/50", "scale-[1.02]")
    })
    inputElement.addEventListener("blur", () => {
      inputRef.value?.classList.remove("ring-2", "ring-primary/50", "scale-[1.02]")
    })
  }

  setupInputEvents()

  return () => {
    window.removeEventListener("resize", checkOrientation)
  }
})
</script>

<template>
  <!-- 横屏容器：使用公用样式类 -->
  <div class="username-page page-container bg-gradient-to-r from-blue-50 to-indigo-100">
    <!-- 竖屏提示层 -->
    <div
      v-if="!isLandscape"
      class="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white p-6"
    >
      <div class="text-6xl mb-4">📱</div>
      <h3 class="text-xl font-bold mb-2">请将设备横屏</h3>
      <p class="text-center">以获得最佳游戏体验</p>
    </div>

    <!-- 主内容区：响应式布局 -->
    <div class="flex flex-col md:flex-row items-center justify-around w-full max-w-3xl flex-1">
      <!-- 游戏Logo/标题区域 -->
      <div class="text-center md:text-right mb-6 md:mb-0 md:mr-6 animate-fade-in">
        <div class="w-20 h-20 sm:w-28 sm:h-28 mx-auto md:ml-auto md:mr-0 mb-4 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
          <span class="text-white text-3xl sm:text-4xl font-bold">🃏</span>
        </div>
        <h1 class="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-indigo-800 mb-1">Suit Streak</h1>
        <p class="text-indigo-600/80 text-sm sm:text-base">花色接龙 · 多人对战</p>
      </div>

      <!-- 输入区域：使用公用卡片样式 -->
      <div
        ref="inputRef"
        class="w-full md:w-80 card-container"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-indigo-800 mb-5 text-center">
          请输入您的昵称
        </h2>

        <!-- 输入框：使用公用输入样式 -->
        <Field
          v-model="username"
          class="input-field"
          input-class="input-control"
          label="用户名"
          label-class="input-label"
          maxlength="10"
          placeholder="2-10个字符"
          @input="handleInput"
        />

        <!-- 按钮：使用公用按钮样式 -->
        <button
          ref="buttonRef"
          :class="[
            'btn-primary',
            isUsernameValid ? 'btn-primary-active' : 'btn-primary-disabled'
          ]"
          :disabled="!isUsernameValid"
          @click="confirmUsername"
        >
          进入游戏大厅
        </button>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none"></div>
    <div class="absolute top-1/4 -left-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 -right-20 w-60 h-60 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
  </div>
</template>

<style scoped>
/* 自定义动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

/* 横屏专用样式 */
@media (orientation: landscape) {
  .username-page {
    padding: env(safe-area-inset-left) env(safe-area-inset-right);
    justify-content: center;
  }
}

/* 竖屏样式 */
@media (orientation: portrait) {
  .username-page {
    justify-content: flex-start;
    padding-top: env(safe-area-inset-top);
  }
}

/* 输入框聚焦效果 */
:deep(.van-field__control:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

/* 安全区域适配 */
@supports (padding: env(safe-area-inset-top)) {
  .username-page {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
