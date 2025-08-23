<template>
  <div class="poker-stack-container relative flex flex-1 flex-col">
    <!-- 出牌区 -->
    <div
        class="play-area flex items-center justify-center py-4 transition-all duration-300 ease-out"
        :style="{
        height: playAreaHeight,
        opacity: activeIndex !== null ? 1 : 0.5,
        marginBottom: '10px'
      }"
    >
      <span class="text-lg font-medium">出牌/弃牌</span>
    </div>

    <!-- 堆叠的扑克牌 -->
    <div
        class="poker-stack flex items-center justify-center transition-all duration-500 ease-out"
        :style="{
        paddingLeft: stackPadding,
        paddingRight: stackPadding,
        minHeight: cardHeight
      }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
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
          transform: `translateX(${card.offsetX}px) translateY(${getCardYOffset(index)}px) rotate(${card.rotate}deg)`,
          opacity: card.opacity,
          animation: card.animation
        }"
          :data-index="index"
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

    <!-- 已弃牌区 (双击切换所有弃牌翻转状态) -->
    <div
        class="discard-area flex flex-col items-center justify-center py-4 mt-4 transition-all duration-300 ease-out"
        :style="{
        height: discardAreaHeight,
        opacity: discardPile.length > 0 ? 1 : 0.5,
        width: '100%'
      }"
    >
      <span class="text-sm font-medium mb-2">已弃牌区 (双击切换所有卡牌显示状态)</span>

      <!-- 弃牌区卡片容器，添加双击事件 -->
      <div
          class="poker-stack flex items-center justify-center transition-all duration-500 ease-out relative"
          :style="{
          paddingLeft: stackPadding,
          paddingRight: stackPadding,
          minHeight: cardHeight
        }"
          @dblclick="toggleAllDiscardFlipped"
          ref="discardContainer"
      >
        <PokerCard
            v-for="(card, index) in sortedDiscardPile"
            :key="'discard-' + card.id"
            :suit="card.suit"
            :rank="card.rank"
            :flipped="card.discardFlipped"
            :width="cardWidth"
            :height="cardHeight"
            class="poker-card-item transition-all duration-300 ease-out"
            :style="{
              zIndex: index + 1,
              transform: `translateX(${getDiscardCardOffsetX(index)}px) rotate(${card.rotate}deg)`,
              opacity: 1
            }"
            :data-index="index"
            ref="discardCards"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch, nextTick} from 'vue';
import PokerCard from "@/components/poker/PokerCard.vue"

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type AnimationType =
    ''
    | 'shake 0.5s ease-in-out'
    | 'bounce 0.5s ease-in-out'
    | 'slide-up 0.3s ease-out'
    | 'slide-right 0.3s ease-out';
type ActionType = 'play' | 'discard' | null;

interface PokerCard {
  id: string; // 唯一标识符，用于追踪卡牌
  suit: Suit;
  rank: Rank;
  flipped: boolean;
  discardFlipped: boolean; // 弃牌区专用的翻转状态
  offsetX: number;
  offsetY: number;
  rotate: number;
  opacity: number;
  animation: AnimationType;
}

// 配置参数
const CARD_COUNT = 15;
const BASE_WIDTH = '60px';
const BASE_HEIGHT = '90px';
const STACK_OFFSET = 30;
const MAX_ROTATION = 2;
const EXTRA_PADDING = 10;
const ACTIVE_OFFSET = {
  main: -30,
  adjacent: -15,
  neighbor: -5
};
const MIN_SWIPE_DISTANCE = 40;
const SUCCESS_PROBABILITY = 0.6;
const PLAY_DISCARD_RATIO = 0.5;

// 花色和点数排序权重
const suitOrder: { [key in Suit]: number } = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3
};

const rankOrder: { [key in Rank]: number } = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

// 响应式状态
const pokerDeck = ref<PokerCard[]>([]);
const discardPile = ref<PokerCard[]>([]);
const allFlipped = ref(false);
const activeIndex = ref<number | null>(null);
const currentAction = ref<ActionType>(null);
const stackContainerRect = ref<DOMRect | null>(null);
const touchStartY = ref<number | null>(null);
const currentSwipeDistance = ref(0);

// 弃牌区相关状态
const discardContainer = ref<HTMLElement | null>(null);
const discardCards = ref<HTMLElement[]>([]);
const allDiscardFlipped = ref(false); // 控制所有弃牌的翻转状态

// 计算属性 - 排序后的弃牌区
const sortedDiscardPile = computed(() => {
  return [...discardPile.value].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return rankOrder[a.rank] - rankOrder[b.rank];
  });
});

// 计算属性
const cardWidth = computed(() => BASE_WIDTH);
const cardHeight = computed(() => BASE_HEIGHT);
const stackPadding = computed(() => {
  return `${parseInt(BASE_WIDTH) / 2 + EXTRA_PADDING}px`;
});
const playAreaHeight = computed(() => `${parseInt(BASE_HEIGHT) / 2}px`);
const discardAreaHeight = computed(() => `${parseInt(BASE_HEIGHT) + 40}px`);

// 计算牌组整体居中的起始偏移
const getCenterStartOffset = (cardCount: number) => {
  const totalStackLength = (cardCount - 1) * STACK_OFFSET;
  return -totalStackLength / 2;
};

// 获取弃牌区卡片的X轴偏移量
const getDiscardCardOffsetX = (index: number) => {
  const startOffsetX = getCenterStartOffset(sortedDiscardPile.value.length);
  return startOffsetX + index * STACK_OFFSET;
};

// 获取卡片的Y轴偏移量
const getCardYOffset = (index: number) => {
  let baseOffset = pokerDeck.value[index].offsetY;

  if (activeIndex.value === index) {
    // 激活的卡片先应用主偏移
    baseOffset += ACTIVE_OFFSET.main;

    // 如果正在触摸滑动，再加上滑动距离
    if (touchStartY.value !== null) {
      baseOffset += currentSwipeDistance.value;
    }
  } else if (activeIndex.value !== null) {
    // 非激活卡片根据距离应用相邻偏移
    const distance = Math.abs(index - activeIndex.value);
    if (distance === 1) {
      baseOffset += ACTIVE_OFFSET.adjacent;
    } else if (distance === 2) {
      baseOffset += ACTIVE_OFFSET.neighbor;
    }
  }

  return baseOffset;
};

// 初始化牌组
const initializeDeck = () => {
  const newDeck: PokerCard[] = [];
  const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const startOffsetX = getCenterStartOffset(CARD_COUNT);

  for (let i = 0; i < CARD_COUNT; i++) {
    const suitIndex = i % suits.length;
    const rankIndex = Math.floor(i / suits.length) % ranks.length;
    const suit = suits[suitIndex];
    const rank = ranks[rankIndex];

    newDeck.push({
      id: `${suit}-${rank}-${Date.now()}-${i}`, // 生成唯一ID
      suit,
      rank,
      flipped: false,
      discardFlipped: false, // 初始化为未翻转
      offsetX: startOffsetX + i * STACK_OFFSET,
      offsetY: Math.random() * 6 - 3,
      rotate: (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION,
      opacity: 1,
      animation: ''
    });
  }

  pokerDeck.value = newDeck;
  discardPile.value = [];
  allDiscardFlipped.value = false;
};

// 洗牌功能
const shuffleDeck = () => {
  const suitGroups: { [key in Suit]?: PokerCard[] } = {
    spades: [],
    hearts: [],
    clubs: [],
    diamonds: []
  };
  pokerDeck.value.forEach(card => {
    suitGroups[card.suit]?.push(card);
  });

  const rankOrder: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  Object.keys(suitGroups).forEach(suit => {
    const group = suitGroups[suit as Suit];
    if (group) {
      group.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    }
  });

  const newDeck: PokerCard[] = [];
  newDeck.push(...(suitGroups.spades || []));
  newDeck.push(...(suitGroups.hearts || []));
  newDeck.push(...(suitGroups.clubs || []));
  newDeck.push(...(suitGroups.diamonds || []));

  const startOffsetX = getCenterStartOffset(newDeck.length);
  pokerDeck.value = newDeck.map((card, index) => ({
    ...card,
    offsetX: startOffsetX + index * STACK_OFFSET,
    flipped: false,
    offsetY: 10,
    opacity: 0.5,
    animation: ''
  }));

  setTimeout(() => {
    pokerDeck.value = pokerDeck.value.map((card, index) => ({
      ...card,
      offsetY: Math.random() * 6 - 3,
      rotate: (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION,
      opacity: 1,
      animation: ''
    }));
  }, 300);

  activeIndex.value = null;
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
  pokerDeck.value = pokerDeck.value.map(card => ({
    ...card,
    offsetY: 20,
    opacity: 0.3,
    animation: ''
  }));
  setTimeout(initializeDeck, 400);
  activeIndex.value = null;
  currentAction.value = null;
  discardPile.value = [];
  allDiscardFlipped.value = false;
};

// 尝试出牌/弃牌
const attemptAction = (index: number) => {
  const canAct = Math.random() < SUCCESS_PROBABILITY;

  if (canAct) {
    const isDiscard = Math.random() < PLAY_DISCARD_RATIO;
    currentAction.value = isDiscard ? 'discard' : 'play';
    const currentCard = pokerDeck.value[index];
    const randomRotate = (Math.random() * MAX_ROTATION * 2) - MAX_ROTATION;

    pokerDeck.value[index].animation = isDiscard ? 'slide-right 0.3s ease-out' : 'slide-up 0.3s ease-out';

    setTimeout(() => {
      pokerDeck.value = pokerDeck.value.filter((_, i) => i !== index);
      const startOffsetX = getCenterStartOffset(pokerDeck.value.length);
      pokerDeck.value = pokerDeck.value.map((card, i) => ({
        ...card,
        offsetX: startOffsetX + i * STACK_OFFSET
      }));

      if (isDiscard) {
        // 添加到弃牌区，使用当前的全局弃牌翻转状态
        discardPile.value.push({
          ...currentCard,
          discardFlipped: allDiscardFlipped.value,
          rotate: randomRotate,
          id: `${currentCard.suit}-${currentCard.rank}-${Date.now()}-${discardPile.value.length}`
        });
      } else {
        console.log('出牌:', currentCard);
      }

      currentAction.value = null;
    }, 300);
  } else {
    pokerDeck.value[index].animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      pokerDeck.value[index].animation = '';
    }, 500);
  }
};

// 触摸事件处理（主牌堆）
const handleTouchStart = (e: TouchEvent) => {
  const stackElement = e.currentTarget as HTMLElement;
  stackContainerRect.value = stackElement.getBoundingClientRect();
  const touch = e.touches[0];
  touchStartY.value = touch.clientY;
  currentSwipeDistance.value = 0;
  handleTouchMove(e);
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  if (!stackContainerRect.value || !touchStartY.value || pokerDeck.value.length === 0) return;

  const touch = e.touches[0];
  currentSwipeDistance.value = touch.clientY - touchStartY.value;

  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
  let topCardIndex: number | null = null;

  for (const el of elements) {
    if (el.classList.contains('poker-card-item')) {
      const indexStr = (el as HTMLElement).dataset.index;
      if (indexStr !== undefined) {
        topCardIndex = parseInt(indexStr);
        break;
      }
    }
  }

  if (topCardIndex !== null) {
    activeIndex.value = topCardIndex;
  }
};

const handleTouchEnd = () => {
  if (activeIndex.value !== null && touchStartY.value !== null &&
      currentSwipeDistance.value < -MIN_SWIPE_DISTANCE) {
    attemptAction(activeIndex.value);
  }

  touchStartY.value = null;
  currentSwipeDistance.value = 0;
  activeIndex.value = null;
};

// 双击弃牌容器切换所有弃牌的翻转状态
const toggleAllDiscardFlipped = () => {
  allDiscardFlipped.value = !allDiscardFlipped.value;
  // 更新所有弃牌的翻转状态
  discardPile.value = discardPile.value.map(card => ({
    ...card,
    discardFlipped: allDiscardFlipped.value
  }));
};

// 屏幕尺寸变化时重新居中
watch(
    () => window.innerWidth,
    () => {
      const startOffsetX = getCenterStartOffset(pokerDeck.value.length);
      pokerDeck.value = pokerDeck.value.map((card, index) => ({
        ...card,
        offsetX: startOffsetX + index * STACK_OFFSET
      }));
    }
);

// 组件挂载时初始化
onMounted(() => {
  initializeDeck();
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
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

/* 横屏样式优化 */
@media (orientation: landscape) {
  .poker-stack-container {
    height: 100vh;
    justify-content: center;
  }

  .discard-area {
    max-height: 200px;
  }
}

.play-area, .discard-area {
  @apply border-2 border-dashed rounded-lg;
}

.play-area {
  @apply border-blue-300;
  min-width: calc(15 * 30px + 80px);
}

.discard-area {
  @apply border-red-300;
  max-width: calc(100vw - 40px);
  overflow-x: auto;
}

.discard-area::-webkit-scrollbar {
  height: 6px;
}

.discard-area::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

.play-area-cards, .discard-area-cards {
  @apply flex items-center;
}

.discard-area-cards {
  @apply justify-start;
  padding-bottom: 8px;
}

.poker-stack {
  @apply w-full flex items-center justify-center relative h-40;
  min-width: calc(15 * 30px + 80px);
  user-select: none;
}

.poker-card-item {
  @apply absolute transition-all duration-300 ease-out;
  overflow: visible;
  touch-action: none;
}

/* 卡牌翻转动画优化 */
.poker-card-item {
  transition-property: transform, opacity, z-index;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
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

/* 抖动动画 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px) translateY(0) rotate(0deg);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px) translateY(0) rotate(0deg);
  }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 出牌动画 */
@keyframes slide-up {
  from {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  to {
    transform: translateX(0) translateY(-200px) rotate(0deg);
    opacity: 0;
  }
}

/* 弃牌动画 */
@keyframes slide-right {
  from {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  to {
    transform: translateX(200px) translateY(0) rotate(30deg);
    opacity: 0;
  }
}

.poker-stack-container {
  animation: fadeInUp 0.5s ease-out;
}
</style>
