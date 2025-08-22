<script
  lang="ts"
  setup
>
import { computed, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user.store.ts"

// 核心功能逻辑
const userStore = useUserStore()
const router = useRouter()

// 响应式变量
const username = ref<string>(userStore.username || "")
const inputRef = ref<HTMLDivElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const isButtonActive = ref<boolean>(false) // 控制按钮交互状态的响应式变量
const isLandscape = ref<boolean>(window.innerWidth > window.innerHeight)

// 监听窗口大小变化以检测横竖屏
onMounted(() => {
  const checkOrientation = () => {
    isLandscape.value = window.innerWidth > window.innerHeight
  }

  window.addEventListener('resize', checkOrientation)

  return () => {
    window.removeEventListener('resize', checkOrientation)
  }
})

// 用户名验证
const isUsernameValid = computed<boolean>(() => {
  const trimmed = username.value.trim()
  return trimmed.length >= 2 && trimmed.length <= 10
})

// 输入处理
const handleInput = (val: unknown) => {
  const strVal = typeof val === "string" ? val : ""
  username.value = strVal.trim()
}

// 确认用户名 - 修复按钮引用问题
const confirmUsername = () => {
  if (!isUsernameValid.value) return

  // 激活按钮动画状态
  isButtonActive.value = true

  // 保存用户名并跳转
  userStore.setUsername(username.value)

  // 动画结束后跳转
  setTimeout(() => {
    isButtonActive.value = false
    router.push("/lobby")
  }, 200)
}
</script>

<template>
  <!-- 主容器 -->
  <div class="min-h-screen flex flex-col bg-gray-50 p-4">
    <!-- 竖屏提示层 -->
    <div
      v-if="!isLandscape"
      class="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white p-6"
    >
      <div class="text-6xl mb-4">📱</div>
      <h3 class="text-xl font-bold mb-2">请将设备横屏</h3>
      <p class="text-center">以获得最佳游戏体验</p>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col md:flex-row items-center justify-center w-full max-w-3xl mx-auto my-auto gap-8">
      <!-- 游戏Logo/标题区域 -->
      <div class="flex flex-col text-center items-center">
        <div class="w-28 h-28 mb-4 bg-indigo-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-4xl font-bold">🃏</span>
        </div>
        <h1 class="text-2xl font-bold text-indigo-800 mb-1">Suit Streak</h1>
        <p class="text-indigo-600/80">花色接龙 · 多人对战</p>
      </div>

      <!-- 输入区域 -->
      <div
        ref="inputRef"
        class="w-full md:w-80"
      >
        <h2 class="text-xl font-semibold text-indigo-800 mb-5 text-center">
          请输入您的昵称
        </h2>

        <van-field
          v-model="username"
          class="mb-4"
          label="用户名"
          maxlength="10"
          placeholder="2-10个字符"
          @input="handleInput"
        ></van-field>

        <!-- 使用动态类实现按钮样式变化 -->
        <van-button
          ref="buttonRef"
          :disabled="!isUsernameValid"
          :class="{ 'opacity-80': isButtonActive }"
          class="w-full transition-opacity duration-200"
          @click="confirmUsername"
        >
          进入游戏大厅
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 输入框聚焦样式 */
:deep(.van-field__control:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

</style>
