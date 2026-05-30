<template>
  <div class="end-view" :class="{ won: isWon }">
    <div class="end-bg-glow"></div>
    <div class="end-content">
      <div class="end-emoji">{{ isWon ? '🎉' : '💀' }}</div>
      <div class="end-title">{{ isWon ? '通关全部' : '失败' }}</div>
      <div class="end-subtitle">
        {{ isWon ? '你赢得了所有关卡！' : '没有达到目标分数。' }}
      </div>
      <div class="end-stats">
        <div class="end-stat">
          <span class="end-stat-label">最终得分</span>
          <span class="end-stat-value">{{ finalScore }}</span>
        </div>
        <div class="end-stat">
          <span class="end-stat-label">拥有 Jokers</span>
          <span class="end-stat-value">{{ jokerCount }}</span>
        </div>
        <div class="end-stat">
          <span class="end-stat-label">剩余金币</span>
          <span class="end-stat-value">${{ gold }}</span>
        </div>
      </div>
      <button class="btn btn-play restart-btn" @click="$emit('restart')">
        {{ isWon ? '再来一局' : '重新挑战' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isWon: { type: Boolean, default: false },
  finalScore: { type: Number, default: 0 },
  jokerCount: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
})

defineEmits(['restart'])
</script>

<style scoped>
.end-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.end-bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,200,87,0.15), transparent);
}

.end-view.won .end-bg-glow {
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(52,211,153,0.2), transparent);
}

.end-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.end-emoji {
  font-size: 72px;
  filter: drop-shadow(0 0 20px rgba(255,200,87,0.8));
}

.end-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 40px;
  font-weight: 900;
  color: var(--gold);
  text-shadow: 0 0 30px rgba(255,200,87,0.6);
}

.end-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: var(--muted);
}

.end-stats {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.end-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 20px;
}

.end-stat-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: var(--muted);
}

.end-stat-value {
  font-family: 'VT323', monospace;
  font-size: 32px;
  color: var(--text);
}

.restart-btn {
  margin-top: 12px;
  padding: 16px 40px;
  font-size: 18px;
}
</style>
