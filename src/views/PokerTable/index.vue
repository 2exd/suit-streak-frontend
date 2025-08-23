<template>
  <!-- 模板部分保持不变 -->
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
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
    >
      <PokerCard
          v-for="(card, index) in pokerDeck"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :flipped="card.flipped"
          :width="cardWidth"
          :height="cardHeight"
          class="poker-card-item transition-all duration-300 ease-out"
          :class="{ 'active-card': activeIndex === index }"
          :style="getCardStyle(index)"
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

    <!-- 已弃牌区 -->
    <div
        class="discard-area flex flex-col items-center justify-center py-4 mt-4 transition-all duration-300 ease-out"
        :style="{
        height: discardAreaHeight,
        opacity: discardPile.length > 0 ? 1 : 0.5,
        width: '100%'
      }"
    >
      <!-- 弃牌区卡片容器 -->
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
import { ref, computed, onMounted, watch } from 'vue';
import PokerCard from "@/components/poker/PokerCard.vue"

// 类型定义
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type AnimationType = '' | 'shake 0.5s ease-in-out' | 'bounce 0.5s ease-in-out' | 'slide-up 0.3s ease-out' | 'slide-right 0.3s ease-out';
type ActionType = 'play' | 'discard' | null;

interface PokerCard {
  id: string;
  suit: Suit;
  rank: Rank;
  flipped: boolean;
  discardFlipped: boolean;
  offsetX: number;
  offsetY: number;
  rotate: number;
  opacity: number;
  animation: AnimationType;
}

// 配置常量（集中管理配置）
const config = {
  cardCount: 15,
  baseWidth: '60px',
  baseHeight: '90px',
  stackOffset: 30,
  maxRotation: 2,
  extraPadding: 10,
  cardBorderRadius: 12, // 新增：卡牌边框圆角配置，单位px
  activeOffset: {
    main: -30,
    adjacent: -15,
    neighbor: -5
  },
  minSwipeDistance: 40,
  successProbability: 0.6,
  playDiscardRatio: 0.5,
  // 交互稳定性配置
  activationThreshold: 15, // 切换激活卡牌的最小距离阈值(px)
  stabilityZone: 20, // 激活卡牌的稳定区域扩展(px)
};

// 排序权重配置
const suitOrder: { [key in Suit]: number } = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3
};

const rankOrder: { [key in Rank]: number } = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

// 响应式状态
const pokerDeck = ref<PokerCard[]>([]);
const discardPile = ref<PokerCard[]>([]);
const allFlipped = ref(false);
const activeIndex = ref<number | null>(null);
const firstActiveIndex = ref<number | null>(null); // 记录首次激活的卡牌
const currentAction = ref<ActionType>(null);
const stackContainerRect = ref<DOMRect | null>(null);
const touchStartY = ref<number | null>(null);
const touchStartX = ref<number | null>(null); // 记录触摸起始X坐标
const currentSwipeDistance = ref(0);
const cardElements = ref<HTMLElement[]>([]);

// 弃牌区相关状态
const discardContainer = ref<HTMLElement | null>(null);
const discardCards = ref<HTMLElement[]>([]);
const allDiscardFlipped = ref(false);

// 计算属性
const cardWidth = computed(() => config.baseWidth);
const cardHeight = computed(() => config.baseHeight);
const stackPadding = computed(() => `${parseInt(config.baseWidth) / 2 + config.extraPadding}px`);
const playAreaHeight = computed(() => `${parseInt(config.baseHeight) / 2}px`);
const discardAreaHeight = computed(() => `${parseInt(config.baseHeight) + 40}px`);
// 新增：卡牌边框圆角计算属性
const cardBorderRadius = computed(() => `${config.cardBorderRadius}px`);

// 排序后的弃牌区
const sortedDiscardPile = computed(() => {
  return [...discardPile.value].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return rankOrder[a.rank] - rankOrder[b.rank];
  });
});

// 工具函数：生成唯一ID
const generateId = (suit: Suit, rank: Rank, index: number): string => {
  return `${suit}-${rank}-${Date.now().toString(36)}-${index}`;
};

// 计算牌组整体居中的起始偏移
const getCenterStartOffset = (cardCount: number) => {
  const totalStackLength = (cardCount - 1) * config.stackOffset;
  return -totalStackLength / 2;
};

// 获取弃牌区卡片的X轴偏移量
const getDiscardCardOffsetX = (index: number) => {
  const startOffsetX = getCenterStartOffset(sortedDiscardPile.value.length);
  return startOffsetX + index * config.stackOffset;
};

// 获取卡片样式
const getCardStyle = (index: number) => {
  const card = pokerDeck.value[index];
  let yOffset = card.offsetY;
  let zIndex = index + 1;

  // 激活卡片偏移处理
  if (activeIndex.value === index) {
    // 激活卡片提升层级，确保视觉上在最上层
    zIndex = pokerDeck.value.length + 10;
    yOffset += config.activeOffset.main + currentSwipeDistance.value;
  }
  // 相邻卡片偏移处理
  else if (activeIndex.value !== null) {
    const distance = Math.abs(index - activeIndex.value);
    if (distance === 1) {
      yOffset += config.activeOffset.adjacent;
    } else if (distance === 2) {
      yOffset += config.activeOffset.neighbor;
    }
  }

  return {
    zIndex,
    transform: `translateX(${card.offsetX}px) translateY(${yOffset}px) rotate(${card.rotate}deg)`,
    opacity: card.opacity,
    animation: card.animation,
    borderRadius: cardBorderRadius.value // 应用统一的边框圆角
  };
};

// 初始化牌组
const initializeDeck = () => {
  const newDeck: PokerCard[] = [];
  const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const startOffsetX = getCenterStartOffset(config.cardCount);

  for (let i = 0; i < config.cardCount; i++) {
    const suitIndex = i % suits.length;
    const rankIndex = Math.floor(i / suits.length) % ranks.length;
    const suit = suits[suitIndex];
    const rank = ranks[rankIndex];

    newDeck.push({
      id: generateId(suit, rank, i),
      suit,
      rank,
      flipped: false,
      discardFlipped: false,
      offsetX: startOffsetX + i * config.stackOffset,
      offsetY: Math.random() * 6 - 3,
      rotate: (Math.random() * config.maxRotation * 2) - config.maxRotation,
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
  // 按花色分组并排序
  const suitGroups: { [key in Suit]?: PokerCard[] } = {
    spades: [], hearts: [], clubs: [], diamonds: []
  };

  pokerDeck.value.forEach(card => {
    suitGroups[card.suit]?.push(card);
  });

  const rankOrderList: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  Object.values(suitGroups).forEach(group => {
    group?.sort((a, b) => rankOrderList.indexOf(a.rank) - rankOrderList.indexOf(b.rank));
  });

  // 重组牌组
  const newDeck: PokerCard[] = [];
  newDeck.push(...(suitGroups.spades || []));
  newDeck.push(...(suitGroups.hearts || []));
  newDeck.push(...(suitGroups.clubs || []));
  newDeck.push(...(suitGroups.diamonds || []));

  // 应用动画效果
  const startOffsetX = getCenterStartOffset(newDeck.length);
  pokerDeck.value = newDeck.map((card, index) => ({
    ...card,
    offsetX: startOffsetX + index * config.stackOffset,
    flipped: false,
    offsetY: 10,
    opacity: 0.5,
    animation: ''
  }));

  // 延迟更新以创建动画效果
  setTimeout(() => {
    pokerDeck.value = pokerDeck.value.map((card, index) => ({
      ...card,
      offsetY: Math.random() * 6 - 3,
      rotate: (Math.random() * config.maxRotation * 2) - config.maxRotation,
      opacity: 1,
      animation: ''
    }));
  }, 300);

  activeIndex.value = null;
  firstActiveIndex.value = null; // 重置首次激活记录
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
  // 添加退出动画
  pokerDeck.value = pokerDeck.value.map(card => ({
    ...card,
    offsetY: 20,
    opacity: 0.3,
    animation: ''
  }));

  // 延迟初始化以显示动画
  setTimeout(initializeDeck, 400);
  activeIndex.value = null;
  firstActiveIndex.value = null; // 重置首次激活记录
  currentAction.value = null;
  discardPile.value = [];
  allDiscardFlipped.value = false;
};

// 尝试出牌/弃牌
const attemptAction = (index: number) => {
  const canAct = Math.random() < config.successProbability;

  if (canAct) {
    const isDiscard = Math.random() < config.playDiscardRatio;
    currentAction.value = isDiscard ? 'discard' : 'play';
    const currentCard = pokerDeck.value[index];
    const randomRotate = (Math.random() * config.maxRotation * 2) - config.maxRotation;

    // 设置动画
    pokerDeck.value[index].animation = isDiscard ? 'slide-right 0.3s ease-out' : 'slide-up 0.3s ease-out';

    // 动画完成后处理
    setTimeout(() => {
      // 移除卡片
      pokerDeck.value = pokerDeck.value.filter((_, i) => i !== index);

      // 重新计算剩余卡片位置
      const startOffsetX = getCenterStartOffset(pokerDeck.value.length);
      pokerDeck.value = pokerDeck.value.map((card, i) => ({
        ...card,
        offsetX: startOffsetX + i * config.stackOffset
      }));

      // 处理弃牌
      if (isDiscard) {
        discardPile.value.push({
          ...currentCard,
          discardFlipped: allDiscardFlipped.value,
          rotate: randomRotate,
          id: generateId(currentCard.suit, currentCard.rank, discardPile.value.length)
        });
      } else {
        console.log('出牌:', currentCard);
      }

      currentAction.value = null;
    }, 300);
  } else {
    // 操作失败动画
    pokerDeck.value[index].animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      pokerDeck.value[index].animation = '';
    }, 500);
  }
};

// 触摸开始事件
const handleTouchStart = (e: TouchEvent) => {
  const stackElement = e.currentTarget as HTMLElement;
  stackContainerRect.value = stackElement.getBoundingClientRect();
  const touch = e.touches[0];
  touchStartY.value = touch.clientY;
  touchStartX.value = touch.clientX; // 记录起始X坐标
  currentSwipeDistance.value = 0;

  // 确定初始激活的卡片并记录
  const initialIndex = determineActiveCard(touch.clientX, touch.clientY);
  activeIndex.value = initialIndex;
  firstActiveIndex.value = initialIndex; // 记录首次激活的卡牌
};

// 触摸移动事件
const handleTouchMove = (e: TouchEvent) => {
  if (!stackContainerRect.value || !touchStartY.value || !touchStartX.value || pokerDeck.value.length === 0) return;

  const touch = e.touches[0];
  currentSwipeDistance.value = touch.clientY - touchStartY.value;

  // 计算移动距离
  const moveDistanceX = Math.abs(touch.clientX - touchStartX.value);
  const moveDistanceY = Math.abs(touch.clientY - touchStartY.value);
  const totalMoveDistance = Math.sqrt(moveDistanceX **2 + moveDistanceY** 2);

  // 优化：仅在移动超过一定距离时才更新激活卡片
  if (totalMoveDistance > 5) {
    // 当已有首次激活的卡牌时，使用稳定检测模式
    if (firstActiveIndex.value !== null) {
      determineStableActiveCard(touch.clientX, touch.clientY);
    } else {
      activeIndex.value = determineActiveCard(touch.clientX, touch.clientY);
    }
  }
};

// 触摸结束事件
const handleTouchEnd = () => {
  if (activeIndex.value !== null && touchStartY.value !== null &&
      currentSwipeDistance.value < -config.minSwipeDistance) {
    attemptAction(activeIndex.value);
  }

  // 重置触摸状态
  touchStartY.value = null;
  touchStartX.value = null;
  currentSwipeDistance.value = 0;
  activeIndex.value = null;
  firstActiveIndex.value = null; // 重置首次激活记录
};

// 确定激活的卡片（基础检测）
const determineActiveCard = (x: number, y: number): number | null => {
  // 从后往前检测，找到最上层的卡片
  for (let i = pokerDeck.value.length - 1; i >= 0; i--) {
    const cardEl = document.querySelector(`.poker-card-item[data-index="${i}"]`);
    if (cardEl && isPointInElement(x, y, cardEl as HTMLElement)) {
      return i;
    }
  }
  return null;
};

// 确定稳定的激活卡片（带稳定性检测）
const determineStableActiveCard = (x: number, y: number) => {
  // 如果首次激活的卡牌仍然有效（手指在其区域内），保持激活
  if (firstActiveIndex.value !== null) {
    const firstCardEl = document.querySelector(`.poker-card-item[data-index="${firstActiveIndex.value}"]`);
    if (firstCardEl && isPointInElementWithStabilityZone(x, y, firstCardEl as HTMLElement)) {
      activeIndex.value = firstActiveIndex.value;
      return;
    }
  }

  // 找到当前位置的卡牌
  const newIndex = determineActiveCard(x, y);

  // 如果找到新卡牌，且与当前激活卡牌不同，检查是否超过切换阈值
  if (newIndex !== null && newIndex !== activeIndex.value) {
    // 计算与首次激活卡牌的距离
    if (firstActiveIndex.value !== null) {
      const firstCardEl = document.querySelector(`.poker-card-item[data-index="${firstActiveIndex.value}"]`);
      if (firstCardEl) {
        const firstRect = firstCardEl.getBoundingClientRect();
        const newCardEl = document.querySelector(`.poker-card-item[data-index="${newIndex}"]`);

        if (newCardEl) {
          const newRect = newCardEl.getBoundingClientRect();
          // 计算两个卡牌中心之间的距离
          const centerDistance = Math.sqrt(
              Math.pow((newRect.left + newRect.width/2) - (firstRect.left + firstRect.width/2), 2) +
              Math.pow((newRect.top + newRect.height/2) - (firstRect.top + firstRect.height/2), 2)
          );

          // 只有当距离超过阈值时才切换激活卡牌
          if (centerDistance > config.activationThreshold) {
            activeIndex.value = newIndex;
          }
        }
      }
    } else {
      activeIndex.value = newIndex;
    }
  }
};

// 检测点是否在元素内（带稳定区域扩展）
const isPointInElementWithStabilityZone = (x: number, y: number, element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  // 扩展检测区域，增加稳定性
  return x >= rect.left - config.stabilityZone &&
      x <= rect.right + config.stabilityZone &&
      y >= rect.top - config.stabilityZone &&
      y <= rect.bottom + config.stabilityZone;
};

// 检测点是否在元素内（基础检测）
const isPointInElement = (x: number, y: number, element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

// 切换所有弃牌的翻转状态
const toggleAllDiscardFlipped = () => {
  allDiscardFlipped.value = !allDiscardFlipped.value;
  discardPile.value = discardPile.value.map(card => ({
    ...card,
    discardFlipped: allDiscardFlipped.value
  }));
};

// 屏幕尺寸变化时重新计算布局
watch(
    () => window.innerWidth,
    () => {
      const startOffsetX = getCenterStartOffset(pokerDeck.value.length);
      pokerDeck.value = pokerDeck.value.map((card, index) => ({
        ...card,
        offsetX: startOffsetX + index * config.stackOffset
      }));
    }
);

// 组件挂载时初始化
onMounted(() => {
  initializeDeck();

  // 初始化动画
  setTimeout(() => {
    pokerDeck.value = pokerDeck.value.map(card => ({
      ...card,
      offsetY: card.offsetY
    }));
  }, 100);
});
</script>

<style scoped>
/* 样式部分 */
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
  will-change: transform, opacity, z-index, box-shadow; /* 优化动画性能 */
  border-radius: v-bind(cardBorderRadius); /* 使用绑定的圆角值 */
}

/* 选中卡片样式 - 优化圆角一致性 */
.active-card {
  /* 边框效果 */
  box-shadow:
      0 0 0 2px #4F46E5,  /* 紫色边框 */
      0 0 10px 2px rgba(79, 70, 229, 0.5),  /* 内发光 */
      0 0 20px 4px rgba(79, 70, 229, 0.3);  /* 外发光 */
  border-radius: v-bind(cardBorderRadius); /* 与卡牌保持一致的圆角 */
  /* 略微放大增加选中感 */
  transform: scale(1.05);
  transition: all 0.2s ease-out;
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
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) translateY(0) rotate(0deg); }
  20%, 40%, 60%, 80% { transform: translateX(5px) translateY(0) rotate(0deg); }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 出牌动画 */
@keyframes slide-up {
  from { transform: translateX(0) translateY(0) rotate(0deg); }
  to { transform: translateX(0) translateY(-200px) rotate(0deg); opacity: 0; }
}

/* 弃牌动画 */
@keyframes slide-right {
  from { transform: translateX(0) translateY(0) rotate(0deg); }
  to { transform: translateX(200px) translateY(0) rotate(30deg); opacity: 0; }
}

.poker-stack-container {
  animation: fadeInUp 0.5s ease-out;
}
</style>
