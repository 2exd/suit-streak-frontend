<template>
  <div class="deck-container flex items-center justify-center">
    <!-- 堆叠容器：动态计算宽高以完全容纳卡牌并居中显示 -->
    <div
      :style="{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`
      }"
      class="poker-stack relative transition-all duration-500 ease-out"
    >
      <PokerCard
        v-for="(card, index) in pokerDeck"
        :key="card.id"
        :data-index="index"
        :flipped="card.flipped"
        :height="cardHeight"
        :rank="card.rank"
        :style="getCardStyle(index)"
        :suit="card.suit"
        :width="cardWidth"
        :show-icon=true
        class="poker-card-item"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, nextTick } from "vue"
import PokerCard from "@/components/poker/PokerCard.vue"

const props = defineProps({
  discardCount: {
    type: Number,
    default: 0
  },
  handCount: {
    type: Number,
    default: 0
  },
  rotate: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0 && value <= 360
  },
  stackMode: {
    type: String as () => "horizontal" | "vertical",
    default: "horizontal",
    validator: (value: string) => ["horizontal", "vertical"].includes(value)
  }
})

// 类型定义
type Suit = "hearts" | "diamonds" | "spades" | "clubs"
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"
type AnimationType = "" | "shake 0.5s ease-in-out" | "bounce 0.5s ease-in-out" | "slide-up 0.3s ease-out" | "slide-right 0.3s ease-out"

const suits: Suit[] = ["spades", "hearts", "clubs", "diamonds"]
const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

interface PokerCard {
  id: string
  suit: Suit
  rank: Rank
  flipped: boolean
  discardFlipped: boolean
  offsetX: number
  offsetY: number
  rotate: number
  opacity: number
  animation: AnimationType
}

// 配置常量
const config = {
  baseWidth: 60, // 卡牌基础宽度（像素）
  baseHeight: 90, // 卡牌基础高度（像素）
  safeMargin: 20, // 安全边距，确保旋转后不被裁剪
  overlapRatios: {
    horizontal: 0.7, // 水平模式重叠比例
    vertical: 0.8 // 垂直模式重叠比例
  },
  maxRotation: 1.2, // 最大随机旋转角度（度）
  randomOffsetRatios: {
    horizontal: { x: 0.05, y: 0.03 },
    vertical: { x: 0.03, y: 0.05 }
  }
}

// 基础卡牌尺寸
const cardWidth = computed(() => `${config.baseWidth}px`)
const cardHeight = computed(() => `${config.baseHeight}px`)
const pokerDeck = ref<PokerCard[]>([])

// 动态容器尺寸
const containerWidth = ref<number>(0)
const containerHeight = ref<number>(0)

// 工具函数：生成唯一ID
const generateId = (suit: Suit, rank: Rank, index: number): string => {
  return `${suit}-${rank}-${Date.now().toString(36)}-${index}`
}

// 工具函数：角度转弧度
const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * 计算单张卡牌旋转后的实际投影尺寸
 */
const getProjectedCardSize = (angle: number): { width: number; height: number } => {
  const radians = degreesToRadians(angle)
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  return {
    width: config.baseWidth * cos + config.baseHeight * sin,
    height: config.baseWidth * sin + config.baseHeight * cos
  }
}

/**
 * 计算整个牌堆在旋转后的最大包围盒尺寸（宽高）
 */
const calculateRotatedDeckSize = (
  cardCount: number,
  mode: "horizontal" | "vertical",
  rotateAngle: number
): { width: number; height: number } => {
  const radians = degreesToRadians(rotateAngle)
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))

  // 单张卡牌旋转后的最大投影
  const { width: projCardWidth, height: projCardHeight } = getProjectedCardSize(rotateAngle)

  // 堆叠方向上的总偏移（未旋转）
  const visibleRatio = 1 - config.overlapRatios[mode]
  const step = mode === "horizontal" ? config.baseWidth * visibleRatio : config.baseHeight * visibleRatio
  const stackLength = (cardCount - 1) * step

  // 将堆叠方向向量旋转后投影到 x/y 轴
  let projStackX: number, projStackY: number
  if (mode === "horizontal") {
    projStackX = stackLength * cos
    projStackY = stackLength * sin
  } else {
    projStackX = stackLength * sin
    projStackY = stackLength * cos
  }

  // 总包围盒 = 单卡最大投影 + 堆叠投影
  return {
    width: projCardWidth + projStackX,
    height: projCardHeight + projStackY
  }
}

/**
 * 初始化牌组：优化堆叠与居中逻辑
 */
const initializeDeck = (cardCount: number, rotateAngle: number, mode: "horizontal" | "vertical") => {
  if (cardCount <= 0) {
    pokerDeck.value = []
    updateContainerSize(0, 0)
    return
  }

  // ✅ 计算旋转后包围盒
  const rotatedSize = calculateRotatedDeckSize(cardCount, mode, rotateAngle)

  const newDeck: PokerCard[] = []

  // 堆叠步长（未旋转）
  const visibleRatio = 1 - config.overlapRatios[mode]
  const step = mode === "horizontal" ? config.baseWidth * visibleRatio : config.baseHeight * visibleRatio
  const totalStackLength = (cardCount - 1) * step

  // 随机偏移配置
  const randomOffsets = config.randomOffsetRatios[mode]
  const maxRandomX = config.baseWidth * randomOffsets.x
  const maxRandomY = config.baseHeight * randomOffsets.y

  for (let i = 0; i < cardCount; i++) {
    const suitIndex = i % suits.length
    const rankIndex = Math.floor(i / suits.length) % ranks.length
    const suit = suits[suitIndex]
    const rank = ranks[rankIndex]

    // 堆叠方向偏移（中心对齐）
    const offsetAlongStack = i * step - totalStackLength / 2

    let offsetX = mode === "horizontal" ? offsetAlongStack : 0
    let offsetY = mode === "vertical" ? offsetAlongStack : 0

    // 添加随机抖动
    offsetX += (Math.random() * maxRandomX * 2) - maxRandomX
    offsetY += (Math.random() * maxRandomY * 2) - maxRandomY

    newDeck.push({
      id: generateId(suit, rank, i),
      suit,
      rank,
      flipped: false,
      discardFlipped: false,
      offsetX,
      offsetY,
      rotate: rotateAngle + (Math.random() * config.maxRotation * 2) - config.maxRotation,
      opacity: 1,
      animation: ""
    })
  }

  pokerDeck.value = newDeck

  // ✅ 更新容器尺寸（加上安全边距）
  updateContainerSize(
    rotatedSize.width + config.safeMargin * 2,
    rotatedSize.height + config.safeMargin * 2
  )
}

/**
 * 更新容器宽高
 */
const updateContainerSize = (width: number, height: number) => {
  containerWidth.value = Math.max(width, config.baseWidth + config.safeMargin * 2)
  containerHeight.value = Math.max(height, config.baseHeight + config.safeMargin * 2)
}

// 获取卡牌样式（关键：使用绝对定位 + transform 居中）
const getCardStyle = (index: number) => {
  const card = pokerDeck.value[index]
  return {
    zIndex: index + 1,
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%) rotate(${card.rotate}deg) translateX(${card.offsetX}px) translateY(${card.offsetY}px)`,
    transformOrigin: "center",
    opacity: card.opacity,
    animation: card.animation,
    borderRadius: "12px",
    transition: "all 0.3s ease-out"
  }
}

// 监听 props 变化
watch(
  () => [props.handCount, props.rotate, props.stackMode],
  async () => {
    initializeDeck(props.handCount, props.rotate, props.stackMode)
    await nextTick()
  },
  { immediate: true }
)

onMounted(() => {
  initializeDeck(props.handCount, props.rotate, props.stackMode)
})
</script>

<style lang="scss" scoped>
.deck-container {
  @apply w-full h-full;
  min-height: 200px;
}

.poker-stack {
  position: relative;
  transition: all 0.5s ease-out;
  // 可选：调试时显示边框
  // border: 1px dashed #ccc;
  // overflow: visible;
}

.poker-card-item {
  will-change: transform, opacity;
  // 避免内容溢出影响布局
  overflow: hidden;
}

/* 动画定义 */
@keyframes shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateX(0); }
  25% { transform: translate(-50%, -50%) rotate(0deg) translateX(-5px); }
  75% { transform: translate(-50%, -50%) rotate(0deg) translateX(5px); }
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateY(0); }
  50% { transform: translate(-50%, -50%) rotate(0deg) translateY(-10px); }
}

@keyframes slide-up {
  from { transform: translate(-50%, -50%) rotate(0deg) translateY(20px); opacity: 0; }
  to { transform: translate(-50%, -50%) rotate(0deg) translateY(0); opacity: 1; }
}

@keyframes slide-right {
  from { transform: translate(-50%, -50%) rotate(0deg) translateX(-20px); opacity: 0; }
  to { transform: translate(-50%, -50%) rotate(0deg) translateX(0); opacity: 1; }
}
</style>
