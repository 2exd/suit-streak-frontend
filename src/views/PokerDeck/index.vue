<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import PokerCard from "@/components/poker/PokerCard.vue";

// 扑克牌花色类型
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'joker';

// 扑克牌点数类型
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'BJ' | 'RJ';

// 扑克牌接口
interface PokerCard {
  suit: Suit;
  rank: Rank;
  flipped: boolean;
  selected: boolean;
}

// 卡牌尺寸计算
const cardWidth = computed(() => {
  if (window.innerWidth < 640) return '70px';
  if (window.innerWidth < 768) return '80px';
  return '90px';
});

const cardHeight = computed(() => {
  return `${parseInt(cardWidth.value) * 1.4}px`;
});

// 扑克牌数组
const pokerCards = ref<PokerCard[]>([]);

// 生成所有扑克牌
const generateAllCards = () => {
  const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const cards: PokerCard[] = [];

  // 生成四种花色的牌
  suits.forEach(suit => {
    ranks.forEach(rank => {
      cards.push({
        suit,
        rank,
        flipped: false,
        selected: false
      });
    });
  });

  // 添加大小王
  cards.push({
    suit: 'joker',
    rank: 'BJ',
    flipped: false,
    selected: false
  });

  cards.push({
    suit: 'joker',
    rank: 'RJ',
    flipped: false,
    selected: false
  });

  return cards;
};

// 初始化扑克牌
onMounted(() => {
  pokerCards.value = generateAllCards();
});

// 翻转单张牌
const toggleCard = (index: number) => {
  pokerCards.value[index].flipped = !pokerCards.value[index].flipped;
  pokerCards.value[index].selected = !pokerCards.value[index].selected;
};

// 全部翻转
const allFlipped = computed(() => {
  return pokerCards.value.every(card => card.flipped);
});

const flipAllCards = () => {
  const shouldFlip = !allFlipped.value;
  pokerCards.value.forEach(card => {
    card.flipped = shouldFlip;
    card.selected = shouldFlip;
  });
};

// 洗牌
const shuffleCards = () => {
  // Fisher-Yates 洗牌算法
  const shuffled = [...pokerCards.value];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  pokerCards.value = shuffled;
};
</script>

<template>
  <van-page class="p-4 bg-gray-100 min-h-screen">
    <van-nav-bar title="扑克牌展示"/>

    <div class="mt-4 mb-6">
      <van-grid column-num="2" :border="false">
        <van-grid-item>
          <van-button
              round
              type="primary"
              @click="flipAllCards"
              class="w-full"
          >
            {{ allFlipped ? '全部翻回' : '全部翻转' }}
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
              round
              @click="shuffleCards"
              class="w-full"
          >
            洗牌
          </van-button>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 扑克牌网格 -->
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
      <PokerCard
          v-for="(card, index) in pokerCards"
          :key="index"
          :suit="card.suit"
          :rank="card.rank"
          :flipped="card.flipped"
          :selected="card.selected"
          @click="toggleCard(index)"
          :width="cardWidth"
          :height="cardHeight"
      />
    </div>
  </van-page>
</template>

