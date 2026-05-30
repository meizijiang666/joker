<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-panel">
        <div class="modal-header">
          <span class="modal-title">设置</span>
          <button class="modal-close" @click="close">✕</button>
        </div>

        <div class="modal-body">
          <!-- BGM Volume -->
          <div class="setting-row">
            <label class="setting-label">BGM 音量</label>
            <div class="setting-control">
              <input
                type="range" min="0" max="100"
                v-model.number="localSettings.bgmVolume"
                class="slider"
                @change="save"
              />
              <span class="slider-value">{{ localSettings.bgmVolume }}</span>
            </div>
          </div>

          <!-- SFX Volume -->
          <div class="setting-row">
            <label class="setting-label">SFX 音量</label>
            <div class="setting-control">
              <input
                type="range" min="0" max="100"
                v-model.number="localSettings.sfxVolume"
                class="slider"
                @change="save"
              />
              <span class="slider-value">{{ localSettings.sfxVolume }}</span>
            </div>
          </div>

          <!-- Animation Speed -->
          <div class="setting-row">
            <label class="setting-label">动画速度</label>
            <div class="setting-control radio-group">
              <label
                v-for="opt in speedOptions" :key="opt.value"
                class="radio-option"
                :class="{ active: localSettings.animSpeed === opt.value }"
              >
                <input
                  type="radio"
                  :value="opt.value"
                  v-model="localSettings.animSpeed"
                  @change="save"
                />
                {{ opt.label }}
              </label>
            </div>
          </div>

          <!-- Formula preview toggle -->
          <div class="setting-row">
            <label class="setting-label">显示出牌公式预览</label>
            <div class="setting-control">
              <button
                class="toggle-btn"
                :class="{ on: localSettings.showFormula }"
                @click="toggleFormula"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const STORAGE_KEY = 'balatro.settings'

const DEFAULT_SETTINGS = {
  bgmVolume: 50,
  sfxVolume: 70,
  animSpeed: 'normal', // slow | normal | fast
  showFormula: true,
}

const speedOptions = [
  { value: 'slow', label: '慢' },
  { value: 'normal', label: '普通' },
  { value: 'fast', label: '快' },
]

const SPEED_MULT = { slow: 1.5, normal: 1.0, fast: 0.6 }

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'settings-change'])

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

const localSettings = ref(loadSettings())

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localSettings.value))
  } catch {}
  emit('settings-change', {
    ...localSettings.value,
    speedMult: SPEED_MULT[localSettings.value.animSpeed],
  })
}

function toggleFormula() {
  localSettings.value.showFormula = !localSettings.value.showFormula
  save()
}

function close() {
  emit('close')
}

// Emit settings on mount so parent can initialize
save()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-panel {
  background: linear-gradient(135deg, #1a2858 0%, #0d1a40 100%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.modal-close {
  background: rgba(255,255,255,0.1);
  border: none;
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255,255,255,0.2);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 6px;
  accent-color: var(--sb-blue);
  cursor: pointer;
}

.slider-value {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--text);
  min-width: 30px;
  text-align: right;
}

.radio-group {
  display: flex;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: var(--muted);
  transition: all 0.2s;
}

.radio-option input {
  display: none;
}

.radio-option.active {
  background: rgba(74,107,255,0.25);
  border-color: var(--sb-blue);
  color: var(--text);
}

/* Toggle */
.toggle-btn {
  width: 52px;
  height: 28px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
}

.toggle-btn.on {
  background: var(--sb-blue);
  border-color: var(--sb-blue);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  display: block;
}

.toggle-btn.on .toggle-knob {
  transform: translateX(24px);
}
</style>
