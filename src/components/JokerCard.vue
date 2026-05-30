<template>
  <div class="joker-card" :class="{ empty: !joker, highlighted }">
    <template v-if="joker">
      <!-- Rarity border -->
      <div class="rarity-border" :style="{ borderColor: rarityColor }"></div>
      <div class="joker-emoji">{{ joker.emoji }}</div>
      <div class="joker-name">{{ joker.name }}</div>
      <div class="joker-desc">{{ joker.desc }}</div>
      <div class="joker-rarity-badge" :style="{ color: rarityColor }">{{ rarityLabel }}</div>
    </template>
    <template v-else>
      <div class="empty-slot-plus">+</div>
      <div class="empty-slot-label">空槽</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY_COLORS } from '../data/jokers.js'

const props = defineProps({
  joker: { type: Object, default: null },
  highlighted: { type: Boolean, default: false },
})

const rarityColor = computed(() => {
  if (!props.joker) return '#8a9bbf'
  return RARITY_COLORS[props.joker.rarity] || '#6cb4d3'
})

const rarityLabel = computed(() => {
  const map = { common: '普通', rare: '稀有', legendary: '传说' }
  return props.joker ? map[props.joker.rarity] || '' : ''
})
</script>

<style scoped>
.joker-card {
  width: 140px;
  height: 200px;
  background: linear-gradient(135deg, #1e2d5a 0%, #152040 100%);
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.15);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  gap: 6px;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.joker-card.empty {
  border: 2px dashed var(--sb-blue);
  background: rgba(74, 107, 255, 0.05);
}

.joker-card.highlighted {
  box-shadow: 0 0 20px 6px rgba(255,200,87,0.7);
  border-color: var(--gold);
}

.rarity-border {
  position: absolute;
  inset: 3px;
  border-radius: 9px;
  border: 2px solid;
  pointer-events: none;
}

.joker-emoji {
  font-size: 40px;
  line-height: 1;
}

.joker-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  text-align: center;
}

.joker-desc {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}

.joker-rarity-badge {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  font-weight: 700;
  position: absolute;
  bottom: 8px;
}

.empty-slot-plus {
  font-size: 24px;
  color: #8a9bbf;
  line-height: 1;
}

.empty-slot-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8a9bbf;
}
</style>
