<template>
  <div class="shop-view">
    <div class="shop-header">
      <div class="shop-title">商店</div>
      <div class="shop-subtitle">
        通关奖励到账！金币 ${{ gold }} · Joker槽 {{ ownedJokers.length }}/5
      </div>
    </div>

    <!-- AI Suggestion button in shop -->
    <div class="shop-ai-row">
      <button class="btn btn-ai" @click="onAISuggest">
        🤖 AI建议
      </button>
    </div>

    <div class="shop-items">
      <div
        v-for="item in shopItems"
        :key="item.id"
        class="shop-item"
        :class="{ sold: item.sold, highlighted: aiSuggestedId === item.id }"
      >
        <!-- Rarity border -->
        <div class="shop-item-rarity-border" :style="{ borderColor: getRarityColor(item.rarity) }"></div>

        <div class="shop-item-emoji">{{ item.emoji }}</div>
        <div class="shop-item-name">{{ item.name }}</div>
        <div class="shop-item-desc">{{ item.desc }}</div>
        <div class="shop-item-rarity" :style="{ color: getRarityColor(item.rarity) }">
          {{ getRarityLabel(item.rarity) }}
        </div>

        <button
          class="btn shop-buy-btn"
          :class="getBuyBtnClass(item)"
          :disabled="item.sold || gold < item.price || ownedJokers.length >= 5"
          @click="$emit('buy', item.id)"
        >
          {{ getBuyLabel(item) }}
        </button>
      </div>
    </div>

    <div class="shop-actions">
      <button class="btn btn-skip" @click="$emit('skip')">
        跳过商店 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RARITY_COLORS } from '../data/jokers.js'

const props = defineProps({
  shopItems: { type: Array, default: () => [] },
  gold: { type: Number, default: 0 },
  ownedJokers: { type: Array, default: () => [] },
})

const emit = defineEmits(['buy', 'skip'])

const aiSuggestedId = ref(null)

function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || '#6cb4d3'
}

function getRarityLabel(rarity) {
  const map = { common: '普通', rare: '稀有', legendary: '传说' }
  return map[rarity] || ''
}

function getBuyLabel(item) {
  if (item.sold) return '已售出'
  if (props.ownedJokers.length >= 5) return '槽满了'
  if (props.gold < item.price) return '钱不够'
  return `购买 $${item.price}`
}

function getBuyBtnClass(item) {
  if (item.sold) return 'btn-sold'
  if (props.ownedJokers.length >= 5) return 'btn-sold'
  if (props.gold < item.price) return 'btn-cant'
  return 'btn-can-buy'
}

function onAISuggest() {
  // Find best value joker
  const available = props.shopItems.filter(j => !j.sold && props.gold >= j.price && props.ownedJokers.length < 5)
  if (available.length === 0) {
    aiSuggestedId.value = null
    return
  }
  const best = available.reduce((b, j) => {
    return (j.aiValue / j.price) > (b.aiValue / b.price) ? j : b
  })
  aiSuggestedId.value = best.id
}
</script>

<style scoped>
.shop-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
  height: 100%;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,64,128,.6), transparent 70%),
    linear-gradient(135deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
}

.shop-header {
  text-align: center;
}

.shop-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 32px;
  font-weight: 900;
  color: var(--gold);
  text-shadow: 0 0 20px rgba(255,200,87,0.5);
}

.shop-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: var(--muted);
  margin-top: 6px;
}

.shop-ai-row {
  display: flex;
  justify-content: center;
}

.shop-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.shop-item {
  width: 180px;
  background: linear-gradient(135deg, #1e2d5a 0%, #152040 100%);
  border-radius: 16px;
  border: 2px solid rgba(255,255,255,0.12);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.shop-item:hover {
  transform: translateY(-4px);
}

.shop-item.sold {
  opacity: 0.5;
}

.shop-item.highlighted {
  box-shadow: 0 0 20px 6px rgba(255,200,87,0.5);
  border-color: var(--gold);
}

.shop-item-rarity-border {
  position: absolute;
  inset: 4px;
  border-radius: 12px;
  border: 2px solid;
  pointer-events: none;
}

.shop-item-emoji {
  font-size: 48px;
  line-height: 1;
}

.shop-item-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}

.shop-item-desc {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}

.shop-item-rarity {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 700;
}

.shop-buy-btn {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 13px;
}

.btn-can-buy {
  background: linear-gradient(180deg, #34d399, #10b981, #059669);
  box-shadow: 0 4px 0 #047857;
  color: #fff;
}

.btn-sold, .btn-cant {
  background: rgba(255,255,255,0.1);
  box-shadow: none;
  color: var(--muted);
}

.shop-actions {
  margin-top: auto;
}
</style>
