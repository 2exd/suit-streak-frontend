<script
  lang="ts"
  setup
>
import {computed, onMounted, ref} from "vue"
import {useRouter} from "vue-router"
import {useUserStore} from "@/store/modules/user.store.ts"
import {Button, Field, Toast} from "vant"
import {useMotion} from "@vueuse/motion"

const userStore = useUserStore()
const router = useRouter()

// 绑定输入框
const username = ref(userStore.username || "")
const inputRef = ref<HTMLDivElement>()
const buttonRef = ref<HTMLButtonElement>()
const isLandscape = ref(window.innerWidth > window.innerHeight)

// 验证用户名是否有效
const isUsernameValid = computed(() => {
  return username.value.trim().length >= 2 && username.value.trim().length <= 10
})

// 处理输入
const handleInput = (val: string) => {
  username.value = val.trim()
}

// 确认用户名
const confirmUsername = () => {
  if (!isUsernameValid.value) return

  // 添加点击动画
  if (buttonRef.value) {
    buttonRef.value.classList.add("scale-95", "opacity-80")
    setTimeout(() => {
      buttonRef.value?.classList.remove("scale-95", "opacity-80")
    }, 200)
  }

  userStore.setUsername(username.value)
  // 延迟跳转，让动画完成
  setTimeout(() => {
    router.push("/lobby")
  }, 200)
}

// 监听屏幕方向变化
onMounted(() => {
  const checkOrientation = () => {
    isLandscape.value = window.innerWidth > window.innerHeight
    // 横屏提示
    if (!isLandscape.value) {
      Toast({
        message: "请横屏以获得最佳体验",
        duration: 2000,
        position: "bottom"
      })
    }
  }

  // 初始化检查
  checkOrientation()
  // 监听屏幕旋转
  window.addEventListener("resize", checkOrientation)

  // 页面加载时的入场动画
  const {motion} = useMotion(inputRef.value, {
    initial: {opacity: 0, y: 20},
    enter: {opacity: 1, y: 0, transition: {duration: 500}},
  })

  // 输入框聚焦动画
  if (inputRef.value) {
    const inputElement = inputRef.value.querySelector("input")
    inputElement?.addEventListener("focus", () => {
      inputRef.value?.classList.add("ring-2", "ring-primary/50", "scale-[1.02]")
    })
    inputElement?.addEventListener("blur", () => {
      inputRef.value?.classList.remove("ring-2", "ring-primary/50", "scale-[1.02]")
    })
  }

  return () => {
    window.removeEventListener("resize", checkOrientation)
  }
})
</script>

<template>
  <!-- 横屏容器：充分利用水平空间 -->
  <div class="username-page min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 px-6 lg:px-10 relative overflow-hidden">
    <!-- 横屏提示（仅在竖屏显示） -->
    <div
      v-if="!isLandscape"
      class="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white p-6"
    >
      <div class="text-6xl mb-4">📱</div>
      <h3 class="text-xl font-bold mb-2">请将设备横屏</h3>
      <p class="text-center">以获得最佳游戏体验</p>
    </div>

    <!-- 主内容区：横屏采用水平布局 -->
    <div class="flex flex-col md:flex-row items-center justify-around w-full max-w-3xl flex-1">
      <!-- 游戏Logo/标题区域 - 横屏时左侧展示 -->
      <div class="text-center md:text-right mb-6 md:mb-0 md:mr-6 animate-fade-in">
        <div class="w-20 h-20 sm:w-28 sm:h-28 mx-auto md:ml-auto md:mr-0 mb-4 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
          <span class="text-white text-3xl sm:text-4xl font-bold">🃏</span>
        </div>
        <h1 class="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-indigo-800 mb-1">
          Suit Streak </h1>
        <p class="text-indigo-600/80 text-sm sm:text-base"> 花牌接龙 ·
                                                            多人对战 </p>
      </div>

      <!-- 输入区域 - 横屏时右侧展示，更窄更高 -->
      <div
        ref="inputRef"
        class="w-full md:w-80 bg-white rounded-2xl shadow-xl p-5 sm:p-6 transition-all duration-300"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-indigo-800 mb-5 text-center">
          请输入您的昵称</h2>

        <field
          v-model="username"
          class="mb-5"
          input-class="h-11 text-base"
          label="用户名"
          label-class="text-indigo-700 font-medium"
          maxlength="10"
          placeholder="2-10个字符"
          @input="handleInput"
        />

        <button
          ref="buttonRef"
          :class="[
            isUsernameValid ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed',
          ]"
          :disabled="!isUsernameValid"
          block
          class="w-full h-11 rounded-xl text-white font-medium text-base transition-all duration-300 flex items-center justify-center"
          color="primary"
          @click="confirmUsername"
        >
          进入游戏大厅
        </button>
      </div>
    </div>

    <!-- 装饰元素：调整位置适应横屏 -->
    <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none"></div>
    <div class="absolute top-1/4 -left-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 -right-20 w-60 h-60 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
  </div>
</template>

<style scoped>
/* 自定义动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  /* 横屏时输入区域和标题区域并排显示 */
  .flex-1 {
    display: flex;
    align-items: center;
  }
}

/* 竖屏提示样式 */
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

/* 按钮样式覆盖 */
:deep(.van-button--primary) {
  background-color: #6366f1 !important;
  border-color: #6366f1 !important;
}

:deep(.van-button--primary:disabled) {
  background-color: #e5e7eb !important;
  border-color: #e5e7eb !important;
}

/* 安全区域适配 */
@supports (padding: env(safe-area-inset-top)) {
  .username-page {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
