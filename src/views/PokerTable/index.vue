<template>
  <div class="poker-stack-container relative flex flex-1 flex-col">
    <!-- 堆叠的扑克牌 -->
    <div
        class="poker-stack flex items-center justify-center transition-all duration-500 ease-out"
        :style="{
        paddingLeft: stackPadding,
        paddingRight: stackPadding,
        minHeight: cardHeight
      }"
    >
      <PokerCard
          v-for="(card, index) in pokerDeck"
          :key="index"
          :suit="card.suit"
          :rank="card.rank"
          :flipped="card.flipped"
          :width="cardWidth"
          :height="cardHeight"
          class="poker-card-item transition-all duration-300 ease-out"
          :style="{
          zIndex: index + 1,
          transform: `translateX(${card.offsetX}px) translateY(${card.offsetY}px) rotate(${card.rotate}deg)`,
          opacity: 1
        }"
      />
    </div>

    <!-- 控制按钮 -->
    <div class="poker-controls flex justify-center gap-4 mt-6 mb-6">
      <van-button
          round
          type="primary"
          @click="shuffleDeck"
          class="w-24"
      >
        洗牌
      </van-button>
      <van-button
          round
          type="success"
          @click="flipAllCards"
          class="w-24"
      >
        {{ allFlipped ? '翻回' : '翻转' }}
      </van-button>
      <van-button
          round
          @click="resetDeck"
          class="w-24"
      >
        重置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import PokerCard from "@/components/poker/PokerCard.vue"

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PokerCard {
  suit: Suit;
  rank: Rank;
  flipped: boolean;
  offsetX: number;
  offsetY: number;
  rotate: number;
  opacity: number;
}

// 配置参数
const CARD_COUNT = 15;
const BASE_WIDTH = '80px';
const BASE_HEIGHT = '130px';
const STACK_OFFSET = 30;
const MAX_ROTATION = 2;
const EXTRA_PADDING = 10;

// 响应式状态
const pokerDeck = ref<PokerCard[]>([]);
const allFlipped = ref(false);

// 计算属性
const cardWidth = computed(() => BASE_WIDTH);
const cardHeight = computed(() => BASE_HEIGHT);
const stackPadding = computed(() => {
  return `${parseInt(BASE_WIDTH) / 2 + EXTRA_PADDING}px`;
});

// 初始化牌组（关键修复：水平居中计算）
const initializeDeck = () => {
  const newDeck: PokerCard[] = [];
  const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // 核心：计算牌组水平居中的起始偏移
  const totalStackWidth = CARD_COUNT * STACK_OFFSET;
  const containerHalfWidth = parseInt(BASE_WIDTH) / 2;
  const startOffsetX = -(totalStackWidth - parseInt(BASE_WIDTH)) / 2 + containerHalfWidth;

  for (let i = 0; i < CARD_COUNT; i++) {
    const suitIndex = i % suits.length;
    const rankIndex = Math.floor(i / suits.length) % ranks.length;

    const offsetX = startOffsetX + i * STACK_OFFSET;
    const offsetY = Math.random() * 6 - 3;
    const rotate = (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION;
    const opacity = 1;

    newDeck.push({
      suit: suits[suitIndex],
      rank: ranks[rankIndex],
      flipped: false,
      offsetX,
      offsetY,
      rotate,
      opacity
    });
  }

  pokerDeck.value = newDeck;
};

// 洗牌功能
const shuffleDeck = () => {
  const currentDeck = [...pokerDeck.value];
  // 经典洗牌算法：打乱数组
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }

  // 洗牌动画：先临时调整样式
  pokerDeck.value = currentDeck.map((card, index) => ({
    ...card,
    offsetX: index * STACK_OFFSET,
    flipped: false,
    offsetY: 10,
    opacity: 0.5
  }));

  // 动画结束后恢复正常样式
  setTimeout(() => {
    pokerDeck.value = pokerDeck.value.map((card, index) => ({
      ...card,
      offsetY: Math.random() * 6 - 3,
      rotate: (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION,
      opacity: 1
    }));
  }, 300);
};

// 翻转所有牌
const flipAllCards = () => {
  allFlipped.value = !allFlipped.value;
  pokerDeck.value = pokerDeck.value.map(card => ({
    ...card,
    flipped: allFlipped.value,
  }));
};

// 重置牌组
const resetDeck = () => {
  // 重置动画：先调整临时样式
  pokerDeck.value = pokerDeck.value.map(card => ({
    ...card,
    offsetY: 20,
    opacity: 0.3
  }));

  // 延迟恢复初始化状态
  setTimeout(initializeDeck, 400);
};

// 监听屏幕尺寸变化（可扩展响应式逻辑）
watch(
    () => window.innerWidth,
    () => {
      // 可在此动态调整布局，如重新计算偏移等
    }
);

// 组件挂载时初始化
onMounted(() => {
  initializeDeck();

  // 延迟触发动画，让显示更自然
  setTimeout(() => {
    pokerDeck.value = pokerDeck.value.map(card => ({
      ...card,
      offsetY: card.offsetY
    }));
  }, 100);
});
</script>

<style scoped>
.poker-stack-container {
  @apply w-full flex flex-col items-center justify-center px-2;
}

.poker-stack {
  @apply w-full flex items-center justify-center relative h-40;
  min-width: calc(15 * 30px + 80px);
}

.poker-card-item {
  @apply absolute transition-all duration-300 ease-out;
  overflow: visible;
}

/* 横屏适配 */
@media (orientation: landscape) {
  .poker-stack-container {
    height: 100vh;
    justify-content: center;
  }
}

/* 初始化进入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.poker-stack-container {
  animation: fadeInUp 0.5s ease-out;
}
</style>