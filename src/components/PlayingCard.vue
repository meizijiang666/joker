<template>
  <div
    class="playing-card"
    :class="[
      `suit-${suitClass}`,
      { selected, 'card-face-down': faceDown }
    ]"
    @click="$emit('click', card.id)"
  >
    <template v-if="!faceDown">
      <div class="card-corner card-corner-tl">
        <span class="card-rank">{{ card.rank }}</span>
        <span class="card-suit">{{ card.suit }}</span>
      </div>
      <div class="card-center-suit">{{ card.suit }}</div>
      <div class="card-corner card-corner-br">
        <span class="card-rank">{{ card.rank }}</span>
        <span class="card-suit">{{ card.suit }}</span>
      </div>
    </template>
    <template v-else>
      <div class="card-back-pattern"></div>
    </template>
    <div v-if="selected" class="card-selected-glow"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  faceDown: { type: Boolean, default: false },
})

defineEmits(['click'])

const suitClass = computed(() => {
  const map = { '♠': 'spade', '♥': 'heart', '♦': 'diamond', '♣': 'club' }
  return map[props.card.suit] || 'spade'
})
</script>

<style scoped>
.playing-card {
  width: 100px;
  height: 145px;
  background: linear-gradient(135deg, var(--paper-1) 0%, var(--paper-2) 100%);
  border-radius: 10px;
  border: 2px solid var(--card-edge);
  position: relative;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
}

.playing-card.selected {
  transform: translateY(-16px);
  box-shadow: 0 0 16px 4px rgba(77,214,255,0.7), 0 8px 20px rgba(0,0,0,0.5);
  border-color: #4dd6ff;
}

.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}

.card-corner-tl {
  top: 6px;
  left: 8px;
}

.card-corner-br {
  bottom: 6px;
  right: 8px;
  transform: rotate(180deg);
}

.card-rank {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

.card-suit {
  font-size: 11px;
  line-height: 1;
}

.card-center-suit {
  font-size: 36px;
  line-height: 1;
}

/* Suit colors */
.suit-heart .card-rank,
.suit-heart .card-suit,
.suit-heart .card-center-suit {
  color: #cc0000;
}

.suit-diamond .card-rank,
.suit-diamond .card-suit,
.suit-diamond .card-center-suit {
  color: #cc0000;
}

.suit-spade .card-rank,
.suit-spade .card-suit,
.suit-spade .card-center-suit {
  color: #1a1a1a;
}

.suit-club .card-rank,
.suit-club .card-suit,
.suit-club .card-center-suit {
  color: #1a1a1a;
}

/* Face down */
.card-face-down {
  background: linear-gradient(135deg, #3a1a6b 0%, #1a0f3a 100%);
  cursor: default;
}

.card-back-pattern {
  width: 80%;
  height: 80%;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0.05) 0px,
    rgba(255,255,255,0.05) 2px,
    transparent 2px,
    transparent 8px
  );
}

.card-selected-glow {
  position: absolute;
  inset: -3px;
  border-radius: 12px;
  border: 2px solid #4dd6ff;
  box-shadow: 0 0 12px 4px rgba(77,214,255,0.5);
  pointer-events: none;
}
</style>
