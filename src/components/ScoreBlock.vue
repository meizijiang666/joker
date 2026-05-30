<template>
  <div class="score-block-row">
    <div class="score-block chips-block" ref="chipsRef">
      <span class="score-label">筹码</span>
      <span class="score-value chips-value">{{ chips }}</span>
    </div>
    <div class="score-separator">×</div>
    <div class="score-block mult-block" ref="multRef">
      <span class="score-label">倍率</span>
      <span class="score-value mult-value">{{ mult }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  chips: { type: Number, default: 0 },
  mult: { type: Number, default: 0 },
})

const chipsRef = ref(null)
const multRef = ref(null)

defineExpose({ chipsRef, multRef })
</script>

<style scoped>
.score-block-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-block {
  border-radius: 10px;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  gap: 2px;
}

.chips-block {
  background: linear-gradient(135deg, var(--chips-from), var(--chips-to));
  box-shadow: 0 3px 10px rgba(33,150,243,0.4);
}

.mult-block {
  background: linear-gradient(135deg, var(--mult-from), var(--mult-to));
  box-shadow: 0 3px 10px rgba(255,51,68,0.4);
}

.score-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.05em;
}

.score-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
}

.score-separator {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: var(--muted);
  flex-shrink: 0;
}
</style>
