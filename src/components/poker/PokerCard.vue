<template>
  <div
      class="poker-card relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
      :style="{ width: props.width, height: props.height }"
      @click="$emit('click')"
  >
    <!-- 卡牌翻转容器 -->
    <div
        class="absolute w-full h-full transition-transform duration-600 transform-style-3d"
        :class="{ 'rotate-y-180': isFlipped }"
    >
      <!-- 卡牌正面 -->
      <div
          class="absolute w-full h-full backface-hidden bg-gradient-to-br from-white to-gray-100 rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col p-2 justify-center"
          :class="selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''"
      >
        <!-- 左上角花色和数字 -->
        <div class="flex flex-col items-start">
          <span :class="colorClass">{{ suitSymbol }}</span>
          <span :class="[colorClass, 'font-bold', 'text-sm']">{{ rankText }}</span>
        </div>

        <!-- 中间大花色 -->
        <div v-if="!isJoker" class="flex-1 flex items-center justify-center">
          <span :class="[colorClass, 'text-3xl md:text-4xl', 'font-light']">{{ suitSymbol }}</span>
        </div>

        <!-- 大王/小王 -->
        <div v-if="isJoker" class="flex-1 flex flex-col items-center justify-center p-2 relative">
          <!-- 装饰背景 -->
          <div class="absolute inset-0 opacity-10">
            <div class="w-full h-full flex items-center justify-center">
              <span :class="[jokerColorClass, 'text-6xl font-black']">★</span>
            </div>
          </div>

          <!-- 大小王图标 -->
          <div :class="[jokerColorClass, 'text-4xl md:text-5xl' , 'font-extrabold', 'relative', 'z-10', 'transition-transform hover:scale-110 duration-300']">
            <i class="fa fa-joker" aria-hidden="true"></i>
          </div>

          <!-- 花色图标组合 -->
          <div class="mt-2 flex gap-2 h-8 items-center justify-center">
            <span class="text-red-600 text-xl transform hover:scale-125 transition-transform">♥</span>
            <span class="text-red-600 text-xl transform hover:scale-125 transition-transform">♦</span>
            <span class="text-gray-800 text-xl transform hover:scale-125 transition-transform">♠</span>
            <span class="text-gray-800 text-xl transform hover:scale-125 transition-transform">♣</span>
          </div>
        </div>

        <!-- 右下角花色和数字 (旋转180度) -->
        <div class="flex flex-col items-start transform rotate-180">
          <span :class="colorClass">{{ suitSymbol }}</span>
          <span :class="[colorClass, 'font-bold', 'text-sm']">{{ rankText }}</span>
        </div>
      </div>

      <!-- 卡牌背面 -->
      <div class="absolute w-full h-full backface-hidden rounded-xl shadow-md rotate-y-180 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <!-- 背面背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-red-800 via-red-700 to-red-900"></div>

        <!-- 装饰纹理 -->
        <div class="absolute inset-0 opacity-10">
          <div class="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
            <div v-for="i in 9" :key="i" class="bg-white/30 rounded-sm"></div>
          </div>
        </div>

        <!-- 中心图案 -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-1/2 h-1/2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
            <div class="w-3/4 h-3/4 relative">
              <div class="absolute inset-0 border-2 border-white/30 rounded-full"></div>
              <div class="absolute inset-1/4 border-2 border-white/40 rounded-full"></div>
              <span class="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">P</span>
            </div>
          </div>
        </div>

        <!-- 边缘装饰 -->
        <div class="absolute inset-1 border border-white/10 rounded-xl"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 扑克牌花色类型
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'joker';

// 扑克牌点数类型
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'BJ' | 'RJ';

interface Props {
  suit: Suit;
  rank: Rank;
  flipped?: boolean;
  width?: string;
  height?: string;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  flipped: false,
  width: '80px',
  height: '112px',
  selected: false
});

// 计算属性：是否翻转
const isFlipped = computed(() => props.flipped);

// 计算属性：是否为大小王
const isJoker = computed(() => props.suit === 'joker');

// 计算属性：花色符号
const suitSymbol = computed(() => {
  switch (props.suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'spades': return '♠';
    case 'clubs': return '♣';
    default: return '';
  }
});

// 计算属性：点数文本（大小王显示缩写）
const rankText = computed(() => {
  if (props.rank === 'BJ') return '🤡';
  if (props.rank === 'RJ') return '🤡';
  return props.rank;
});

// 计算属性：颜色类
const colorClass = computed(() => {
  if (props.suit === 'hearts' || props.suit === 'diamonds') {
    return 'text-red-600';
  }
  return 'text-gray-800';
});

// 计算属性：王的颜色类
const jokerColorClass = computed(() => {
  return props.rank === 'RJ' ? 'text-red-600' : 'text-gray-800';
});
</script>

<style scoped>
.poker-card {
  perspective: 1200px;
}

.backface-hidden {
  backface-visibility: hidden;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

/* 增加选中状态的动画效果 */
:deep(.ring-blue-500) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.7);
  }
}

/* 确保Font Awesome图标正确显示 */
:deep(.fa-joker) {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
