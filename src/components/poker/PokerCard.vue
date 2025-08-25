<template>
  <div
    :style="{
        width: props.width,
        height: props.height,
        transform: `rotate(${props.rotation}deg)`
      }"
    class="poker-card relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
    @click="$emit('click')"
  >
    <!-- 卡牌翻转容器 -->
    <div
      :class="{ 'rotate-y-180': isFlipped }"
      class="absolute w-full h-full transition-transform duration-600 transform-style-3d"
    >
      <!-- 卡牌正面（保持不变） -->
      <div
        :class="selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''"
        class="absolute w-full h-full backface-hidden bg-gradient-to-br from-white to-gray-100 rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col p-2 justify-center"
      >
        <!-- 左上角花色和数字 -->
        <div class="flex select-none content-center justify-start items-center">
          <span :class="[colorClass, 'font-bold', 'text-sm']">{{ rankText }}</span>
          <span v-if="props.showIcon" :class="[colorClass]" class="text-md ml-1">{{ suitSymbol }}</span>
        </div>

        <!-- 中间大花色 -->
        <div v-if="!isJoker" class="flex-1 flex items-center justify-center select-none">
          <span :class="[colorClass, 'text-3xl md:text-4xl', 'font-light']">{{ suitSymbol }}</span>
        </div>

        <!-- 大王/小王 -->
        <div v-if="isJoker" class="flex-1 flex flex-col items-center justify-center p-2 relative select-none">
          <div class="absolute inset-0 opacity-10">
            <div class="w-full h-full flex items-center justify-center">
              <span :class="[jokerColorClass, 'text-6xl font-black']">★</span>
            </div>
          </div>
          <div :class="[jokerColorClass, 'text-4xl md:text-5xl' , 'font-extrabold', 'relative', 'z-10', 'transition-transform hover:scale-110 duration-300']">
            <i aria-hidden="true" class="fa fa-joker"></i>
          </div>
          <div class="mt-2 flex gap-2 h-8 items-center justify-center">
            <span class="text-red-600 text-xl transform hover:scale-125 transition-transform">♥</span>
            <span class="text-red-600 text-xl transform hover:scale-125 transition-transform">♦</span>
            <span class="text-gray-800 text-xl transform hover:scale-125 transition-transform">♠</span>
            <span class="text-gray-800 text-xl transform hover:scale-125 transition-transform">♣</span>
          </div>
        </div>

        <!-- 右下角花色和数字 -->
        <div class="flex justify-start items-center transform rotate-180 select-none">
          <span :class="[colorClass, 'font-bold', 'text-sm']">{{ rankText }}</span>
          <span v-if="props.showIcon" :class="[colorClass]" class="text-md ml-1">{{ suitSymbol }}</span>
        </div>
      </div>

      <!-- 修复后的背面：移除非法CSS语法，保留设计风格 -->
      <div class="absolute w-full h-full backface-hidden rounded-xl shadow-md rotate-y-180 overflow-hidden transition-all duration-500 hover:shadow-2xl group tech-cyber">
        <!-- 1. 底层渐变背景（修复渐变语法） -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[length:400%_400%] animate-gradient"></div>

        <!-- 2. 基础线条纹理层（移除非法:style转义） -->
        <div class="absolute inset-0 opacity-15">
          <!-- 细网格背景 -->
          <div class="w-full h-full grid grid-cols-12 grid-rows-16 gap-[1px]">
            <div v-for="i in 192" :key="i" class="bg-white/10 rounded-sm"></div>
          </div>
          <!-- 对角线线条（改用class，避免内联style转义问题） -->
          <div class="absolute inset-0 diagonal-lines"></div>
        </div>

        <!-- 3. 动态光效层 -->
        <div class="absolute inset-0 overflow-hidden">
          <!-- 扫描线 -->
          <div class="absolute left-0 top-[-100%] w-full h-1/4 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent skew-y-[-12deg] animate-scan"></div>
          <!-- 闪烁光点 -->
          <div class="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-2">
            <div v-for="i in 48" :key="i" class="relative">
              <div class="absolute inset-0 m-auto w-1 h-1 rounded-full bg-cyan-400/50 animate-pulse-random" :style="{animationDelay: `${i * 0.1}s`}"></div>
            </div>
          </div>
        </div>

        <!-- 4. 中心对称图案（无文字·几何线条） -->
        <div class="absolute inset-0 flex items-center justify-center select-none">
          <!-- 外层光晕 -->
          <div class="w-2/3 h-2/3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse-slow blur-lg"></div>

          <!-- 中层几何框 -->
          <div class="absolute w-1/2 h-1/2 border-2 border-cyan-400/30 rounded-xl rotate-45 transition-all duration-700 group-hover:rotate-0 group-hover:border-cyan-400/60"></div>

          <!-- 内层核心图案（改用class，避免内联style） -->
          <div class="absolute w-2/5 h-2/5 core-pattern"></div>
        </div>

        <!-- 5. 边缘装饰（线条+花纹） -->
        <div class="absolute inset-1 border-2 border-white/5 rounded-xl"></div>
        <div class="absolute inset-2 border border-white/3 rounded-lg"></div>

        <!-- 四角装饰（几何图形） -->
        <div class="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40 transition-all duration-500 group-hover:border-cyan-400/80"></div>
        <div class="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40 transition-all duration-500 group-hover:border-cyan-400/80"></div>
        <div class="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400/40 transition-all duration-500 group-hover:border-cyan-400/80"></div>
        <div class="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400/40 transition-all duration-500 group-hover:border-cyan-400/80"></div>

        <!-- 6. 复古风备用图案（默认隐藏） -->
        <div class="absolute inset-0 opacity-0 retro-pattern-only">
          <div class="w-full h-full flex items-center justify-center">
            <svg class="w-3/4 h-3/4 text-white/20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.5,-65.3C61.6,-58.7,74.7,-47.9,81.4,-33.9C88.1,-19.9,88.4,-3.6,84.6,12.2C80.8,28,72.9,43.8,60.7,55.2C48.5,66.6,31.9,73.7,14.1,76.8C-3.7,80,-21.9,79.1,-37.4,72.2C-52.9,65.3,-65.7,52.5,-73.9,37.1C-82.1,21.7,-85.7,3.7,-82.7,-13.8C-79.7,-31.3,-70.1,-48.4,-56.8,-59.9C-43.5,-71.4,-26.5,-77.3,-9.9,-78.3C6.7,-79.3,23.1,-75.5,36.2,-68.9Z" transform="translate(100 100)" fill="currentColor"/>
              <path d="M38.8,-69.8C52.2,-62.8,63.8,-49.7,71.6,-34.9C79.4,-20.1,83.3,-3.6,80.9,12.3C78.5,28.2,70,44.2,57.3,55.9C44.6,67.6,27.8,75,10.6,78.1C-6.6,81.2,-24.1,79.9,-38.4,72.6C-52.7,65.3,-63.9,52,-71.4,37.3C-78.9,22.6,-82.7,6.5,-79.9,-8.9C-77.1,-24.3,-67.7,-39.3,-55.1,-50.3C-42.5,-61.3,-26.8,-68.3,-10.8,-71.7C5.2,-75.1,20.9,-74.9,34.9,-70.3C48.9,-65.7,61.1,-56.7,74.3,-46.2Z" transform="translate(100 100)" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"

// 扑克牌类型定义（保持不变）
type Suit = "hearts" | "diamonds" | "spades" | "clubs" | "joker";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "BJ" | "RJ";

interface Props {
  suit: Suit;
  rank: Rank;
  flipped?: boolean;
  width?: string;
  height?: string;
  selected?: boolean;
  rotation?: number;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  flipped: false,
  width: "80px",
  height: "112px",
  selected: false,
  rotation: 0,
  showIcon: false,
})

// 计算属性（保持不变）
const isFlipped = computed(() => props.flipped)
const isJoker = computed(() => props.suit === "joker")
const suitSymbol = computed(() => {
  switch (props.suit) {
    case "hearts": return "♥"
    case "diamonds": return "♦"
    case "spades": return "♠"
    case "clubs": return "♣"
    default: return ""
  }
})
const rankText = computed(() => {
  if (props.rank === "BJ" || props.rank === "RJ") return "🤡"
  return props.rank
})
const colorClass = computed(() => {
  return props.suit === "hearts" || props.suit === "diamonds" ? "text-red-600" : "text-gray-800"
})
const jokerColorClass = computed(() => {
  return props.rank === "RJ" ? "text-red-600" : "text-gray-800"
})
</script>

<style scoped>
/* 基础样式（保持不变） */
.poker-card {
  perspective: 1500px;
  user-select: none;
  -webkit-user-select: none;
}
.backface-hidden { backface-visibility: hidden; }
.transform-style-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }

/* 选中状态动画（保持不变） */
:deep(.ring-blue-500) {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.7); }
}

/* Font Awesome图标样式（保持不变） */
:deep(.fa-joker) {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

/* 禁止文本选择（保持不变） */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 🌟 修复后的动画样式：移除非法转义，统一语法 */
.animate-gradient {
  animation: gradientFlow 15s ease infinite;
}
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-scan {
  animation: scanLine 3s ease-in-out infinite;
}
@keyframes scanLine {
  0% { top: -100%; }
  100% { top: 200%; }
}

.animate-pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}
@keyframes pulseSlow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

.animate-pulse-fast {
  animation: pulseFast 2s ease-in-out infinite;
}
@keyframes pulseFast {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.animate-pulse-random {
  animation: pulseRandom 3s ease-in-out infinite;
}
@keyframes pulseRandom {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

/* 🌟 修复后的样式：将内联style转为class，避免转义错误 */
/* 对角线线条（原内联linear-gradient移到这里） */
.diagonal-lines {
  background:
    linear-gradient(45deg, transparent 49.5%, rgba(34,211,238,0.2) 49.5%, rgba(34,211,238,0.2) 50.5%, transparent 50.5%),
    linear-gradient(135deg, transparent 49.5%, rgba(34,211,238,0.2) 49.5%, rgba(34,211,238,0.2) 50.5%, transparent 50.5%);
}

/* 中心核心图案（原内联style移到这里） */
.core-pattern {
  position: relative;
}
.core-pattern::before,
.core-pattern::after,
.core-pattern .corner {
  content: "";
  position: absolute;
}
/* 十字线 */
.core-pattern::before {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #22d3ee, transparent);
  transform: translateY(-50%);
}
.core-pattern::after {
  left: 50%;
  top: 0;
  height: 100%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #22d3ee, transparent);
  transform: translateX(-50%);
}
/* 四角边框 */
.core-pattern .corner {
  width: 50%;
  height: 50%;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(34,211,238,0.4);
}
.core-pattern .corner:nth-child(1) {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 8px 0 0 0;
}
.core-pattern .corner:nth-child(2) {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 8px 0 0;
}
.core-pattern .corner:nth-child(3) {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 8px;
}
.core-pattern .corner:nth-child(4) {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 8px 0;
}
/* 中心圆点 */
.core-pattern .center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(to right, #22d3ee, #a855f7);
  box-shadow: 0 0 10px rgba(34,211,238,0.8);
  transform: translate(-50%, -50%);
  animation: pulseFast 2s ease-in-out infinite;
}

/* 🌟 风格1：科技赛博风（修复选择器语法） */
.tech-cyber {
  --primary-color: #22d3ee;
  --secondary-color: #a855f7;
}
.tech-cyber .animate-scan {
  background: linear-gradient(to right, transparent, var(--primary-color)/30, transparent);
}
.tech-cyber .animate-pulse-slow {
  background: linear-gradient(to right, var(--primary-color)/20, var(--secondary-color)/20);
}

/* 🌟 风格2：复古花纹风（修复选择器语法，移除!important） */
.retro-pattern {
  --primary-color: #d97706;
  --secondary-color: #b45309;
}
.retro-pattern .bg-gradient-to-br {
  background: linear-gradient(to bottom right, #1e293b, #0f172a, #1e293b);
}
.retro-pattern .animate-scan {
  background: linear-gradient(to right, transparent, var(--primary-color)/20, transparent);
}
.retro-pattern .animate-pulse-slow {
  background: linear-gradient(to right, var(--primary-color)/15, var(--secondary-color)/15);
}
/* 复古风边框/背景色替换（用class优先级覆盖，不用!important） */
.retro-pattern .border-cyan-400\/40 {
  border-color: var(--primary-color)/40;
}
.retro-pattern .bg-cyan-400\/50 {
  background-color: var(--primary-color)/50;
}
.retro-pattern .bg-gradient-to-r {
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}
.retro-pattern .shadow-cyan {
  box-shadow: 0 0 10px rgba(217, 119, 6, 0.6);
}

/* 复古风图案显示控制（修复选择器） */
.retro-pattern-only {
  display: none;
}
.retro-pattern .retro-pattern-only {
  display: block;
  opacity: 1;
}

/* 🌟 交互增强（保持不变） */
.group:hover .animate-scan {
  animation-duration: 2s;
}
.group:hover .animate-pulse-slow {
  animation-duration: 2.5s;
}
.group:hover .animate-pulse-random {
  animation-duration: 2s;
}
</style>
