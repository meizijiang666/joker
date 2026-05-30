<template>
  <aside class="sidebar">
    <!-- 1. Logo -->
    <div class="sidebar-logo">
      <span class="logo-emoji">🃏</span>
      <span class="logo-text">Joker</span>
    </div>

    <!-- 2. Blind Panel -->
    <div class="blind-panel">
      <div class="blind-header">
        <span class="blind-icon">{{ blind.icon }}</span>
        <span class="blind-name">{{ blind.name }}</span>
      </div>
      <div class="blind-target">
        <span class="blind-target-label">目标</span>
        <span class="blind-target-score">{{ blind.target }}</span>
      </div>
      <div class="blind-reward">
        通关奖励：${{ blind.baseReward }} + 剩余手数×$1
      </div>
    </div>

    <!-- 3. Round Score -->
    <div class="score-panel">
      <div class="score-panel-label">本关得分</div>
      <div class="round-score">{{ displayScore }}</div>
      <div class="score-progress-bar">
        <div class="score-progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div class="score-progress-text">{{ displayScore }} / {{ blind.target }}</div>
    </div>

    <!-- 4. HAND score block -->
    <div class="hand-score-panel">
      <div class="hand-type-name" :style="{ color: handTypeName ? 'var(--gold)' : 'var(--muted)' }">
        {{ handTypeName || '-- 选牌组成牌型 --' }}
      </div>
      <ScoreBlock :chips="displayChips" :mult="displayMult" ref="scoreBlockRef" />
    </div>

    <!-- 5. Hands / Discards -->
    <div class="stats-row">
      <div class="stat-panel">
        <div class="stat-label">手数</div>
        <div class="stat-value">{{ handsLeft }}</div>
      </div>
      <div class="stat-panel">
        <div class="stat-label">弃牌</div>
        <div class="stat-value">{{ discardsLeft }}</div>
      </div>
    </div>

    <!-- 6. Gold -->
    <div class="gold-panel">
      <span class="gold-symbol">$</span>
      <span class="gold-value">{{ gold }}</span>
    </div>

    <!-- 7. Blind progress -->
    <div class="blind-progress">
      <span>底注 {{ currentBlindIndex + 1 }}/3 · 回合 {{ currentBlindIndex + 1 }}</span>
    </div>

    <!-- 8. Restart button -->
    <button class="btn btn-discard restart-btn" @click="$emit('restart')">
      重新开始
    </button>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import ScoreBlock from './ScoreBlock.vue'

const props = defineProps({
  blind: { type: Object, required: true },
  displayScore: { type: Number, default: 0 },
  handsLeft: { type: Number, default: 4 },
  discardsLeft: { type: Number, default: 3 },
  gold: { type: Number, default: 0 },
  currentBlindIndex: { type: Number, default: 0 },
  handTypeName: { type: String, default: '' },
  displayChips: { type: Number, default: 0 },
  displayMult: { type: Number, default: 0 },
})

defineEmits(['restart'])

const scoreBlockRef = ref(null)

const progressPct = computed(() => {
  return Math.min(100, (props.displayScore / props.blind.target) * 100)
})

defineExpose({ scoreBlockRef })
</script>

<style scoped>
.sidebar {
  width: min(28vw, 480px);
  min-width: 280px;
  height: 100vh;
  background: rgba(10, 20, 56, 0.85);
  border-right: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  padding: 16px 14px;
  gap: 12px;
  overflow-y: auto;
  flex-shrink: 0;
}

/* 1. Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.logo-emoji {
  font-size: 24px;
}

.logo-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: var(--gold);
  text-shadow: 2px 2px 0 #000;
  letter-spacing: -1px;
}

/* 2. Blind Panel */
.blind-panel {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

.blind-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.blind-icon {
  font-size: 20px;
}

.blind-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
}

.blind-target {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.blind-target-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: var(--muted);
}

.blind-target-score {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: var(--gold);
  line-height: 1;
}

.blind-reward {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: var(--muted);
  margin-top: 4px;
}

/* 3. Round Score */
.score-panel {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.08);
}

.score-panel-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.round-score {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: var(--text);
  line-height: 1;
  letter-spacing: 1px;
}

.score-progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.score-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--chips-from), var(--chips-to));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.score-progress-text {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: var(--muted);
  margin-top: 4px;
  text-align: right;
}

/* 4. HAND score block */
.hand-score-panel {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-type-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 700;
  transition: color 0.2s;
}

/* 5. Stats row */
.stats-row {
  display: flex;
  gap: 8px;
}

.stat-panel {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.08);
  text-align: center;
}

.stat-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: var(--muted);
}

.stat-value {
  font-family: 'VT323', monospace;
  font-size: 34px;
  color: var(--text);
  line-height: 1;
}

/* 6. Gold */
.gold-panel {
  background: #0d0d0d;
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(255,200,87,0.3);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.gold-symbol {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--gold);
}

.gold-value {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: var(--gold);
  line-height: 1;
}

/* 7. Blind progress */
.blind-progress {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

/* 8. Restart button */
.restart-btn {
  width: 100%;
  margin-top: auto;
}
</style>
