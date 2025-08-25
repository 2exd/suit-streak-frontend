<template>
  <div
    class="poker-stack"
    :class="[
      layout === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
      stackDirection === 'left-right' ? 'justify-start' : 'justify-center',
      stackDirection === 'top-bottom' ? 'items-start' : 'items-center'
    ]"
    :style="{
      gap: gap,
      maxWidth: layout === 'horizontal' ? '100%' : undefined,
      maxHeight: layout === 'vertical' ? '100%' : undefined,
      overflow: 'auto'
    }"
  >
    <!-- 牌堆中的每张牌 -->
    <PokerCard
      v-for="(card, index) in cards"
      :key="index"
      :suit="card.suit"
      :rank="card.rank"
      :flipped="flipped || card.flipped"
      :width="cardWidth"
      :height="cardHeight"
      :selected="selectedCards.includes(index)"
      :style="getCardPositionStyle(index)"
      @click="handleCardClick(index, card)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PokerCard from "@/components/poker/PokerCard.vue"
// 扑克牌花色类型 (复用自pokerCard)
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'joker';

// 扑克牌点数类型 (复用自pokerCard)
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'BJ' | 'RJ';

// 单张牌数据结构
interface PokerCardData {
  suit: Suit;
  rank: Rank;
  flipped?: boolean; // 单独控制某张牌是否翻转
}

// 组件属性定义
interface Props {
  // 牌堆数据
  cards: PokerCardData[];
  // 布局方向：横向或纵向
  layout?: 'horizontal' | 'vertical';
  // 堆叠方向：左右或上下
  stackDirection?: 'left-right' | 'right-left' | 'top-bottom' | 'bottom-top';
  // 整体是否翻转（背面展示）
  flipped?: boolean;
  // 牌之间的间距
  gap?: string;
  // 单张牌宽度
  cardWidth?: string;
  // 单张牌高度
  cardHeight?: string;
  // 堆叠偏移量（控制牌重叠程度）
  stackOffset?: number;
  // 已选中的牌索引
  selectedCards?: number[];
}

// 定义属性并设置默认值
const props = withDefaults(defineProps<Props>(), {
  cards: () => [],
  layout: 'horizontal',
  stackDirection: 'left-right',
  flipped: false,
  gap: '0px', // 布局间距，堆叠布局时通常设为0
  cardWidth: '80px',
  cardHeight: '112px',
  stackOffset: 20, // 默认堆叠偏移像素
  selectedCards: () => []
});

// 计算牌的位置样式（实现堆叠效果）
const getCardPositionStyle = (index: number) => {
  // 非堆叠布局（有间距）直接返回空
  if (props.gap !== '0px') return {};

  const offset = props.stackOffset * index;
  const zIndex = index + 1;

  // 根据布局方向和堆叠方向计算偏移
  if (props.layout === 'horizontal') {
    return {
      zIndex,
      marginLeft: props.stackDirection === 'right-left' ? `-${offset}px` : undefined,
      marginRight: props.stackDirection === 'left-right' ? `-${offset}px` : undefined,
    };
  } else {
    return {
      zIndex,
      marginTop: props.stackDirection === 'bottom-top' ? `-${offset}px` : undefined,
      marginBottom: props.stackDirection === 'top-bottom' ? `-${offset}px` : undefined,
    };
  }
};

// 处理卡片点击事件
const emit = defineEmits<{
  (e: 'click', index: number, card: PokerCardData): void;
  (e: 'select', index: number, card: PokerCardData, selected: boolean): void;
}>();

const handleCardClick = (index: number, card: PokerCardData) => {
  emit('click', index, card);
  // 判断是否选中
  const isSelected = props.selectedCards.includes(index);
  emit('select', index, card, !isSelected);
};
</script>

<style scoped>
.poker-stack {
  user-select: none;
  padding: 12px;
  box-sizing: border-box;
}

/* 滚动条美化 */
.poker-stack::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.poker-stack::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.poker-stack::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
