<template>
  <div class="app-container">

    <!-- Settings Modal -->
    <SettingsModal
      :visible="showSettings"
      @close="showSettings = false"
      @settings-change="onSettingsChange"
    />

    <!-- ====== SIDEBAR ====== -->
    <SideBar
      v-if="state.phase !== 'won' && state.phase !== 'lost'"
      ref="sideBarRef"
      :blind="currentBlind"
      :display-score="animatedScore"
      :hands-left="state.handsLeft"
      :discards-left="state.discardsLeft"
      :gold="state.gold"
      :current-blind-index="state.currentBlindIndex"
      :hand-type-name="previewHandType"
      :display-chips="previewChips"
      :display-mult="previewMult"
      @restart="handleRestart"
    />

    <!-- ====== MAIN AREA ====== -->
    <div class="main-area" v-if="state.phase === 'playing'">

      <!-- Settings button (top right) -->
      <button class="btn btn-settings settings-btn" @click="showSettings = true">⚙️</button>

      <!-- Row 1: Jokers (230px) -->
      <div class="joker-zone">
        <div class="zone-title">
          JOKERS · {{ state.ownedJokers.length }}/5
        </div>
        <div class="joker-slots">
          <JokerCard
            v-for="(slot, i) in jokerSlots"
            :key="i"
            :joker="slot"
            :ref="el => { if(el) jokerRefs[i] = el }"
          />
        </div>
      </div>

      <!-- Row 2: Play area (1fr) -->
      <div class="play-area" ref="playAreaRef">
        <div class="play-area-title">出牌区</div>

        <!-- Played cards display -->
        <div class="played-cards" v-if="state.playedArea.length > 0">
          <PlayingCard
            v-for="card in state.playedArea"
            :key="card.id"
            :card="card"
          />
        </div>
        <div class="play-area-empty" v-else>
          选择手牌组成牌型（1-5 张）
        </div>

        <!-- Deck pile (absolute bottom-right) -->
        <div class="deck-pile" ref="deckRef">
          <div class="deck-layer deck-layer-3"></div>
          <div class="deck-layer deck-layer-2"></div>
          <div class="deck-layer deck-layer-1">
            <span class="deck-count">{{ state.deck.length }}</span>
          </div>
        </div>

        <!-- Score formula popup container (absolute, handled by animation) -->
        <div class="score-popup-container" ref="scorePopupContainerRef"></div>
      </div>

      <!-- Row 3: Hand + Actions (280px) -->
      <div class="hand-zone">
        <div class="hand-cards" ref="handCardsRef">
          <PlayingCard
            v-for="card in state.hand"
            :key="card.id"
            :card="card"
            :selected="state.selectedCardIds.has(card.id)"
            :ref="el => { if(el) cardRefs[card.id] = el }"
            @click="onToggleCard"
          />
        </div>

        <div class="action-buttons">
          <button class="btn btn-sort" @click="onSortByRank">按点排序</button>
          <button class="btn btn-sort" @click="onSortBySuit">按花排序</button>

          <button
            class="btn btn-play"
            :disabled="state.selectedCardIds.size === 0 || state.animating"
            @click="handlePlay"
          >
            出牌 ({{ state.selectedCardIds.size }})
          </button>

          <button
            class="btn btn-discard"
            :disabled="state.selectedCardIds.size === 0 || state.discardsLeft <= 0 || state.animating"
            @click="handleDiscard"
          >
            弃牌 ({{ state.discardsLeft }})
          </button>

          <button
            class="btn btn-ai"
            :class="{ thinking: aiThinking }"
            :disabled="aiThinking || state.animating"
            @click="handleAIPlay"
          >
            {{ aiThinking ? '🤔 AI思考中…' : '🤖 AI出牌' }}
          </button>
        </div>

        <!-- Formula preview -->
        <div v-if="settings.showFormula && previewHandType" class="formula-preview">
          {{ previewHandType }}：{{ previewChips }} × {{ previewMult }} = {{ previewScore }}
        </div>
      </div>
    </div>

    <!-- ====== SHOP VIEW ====== -->
    <div class="main-area shop-main" v-else-if="state.phase === 'shop'">
      <button class="btn btn-settings settings-btn" @click="showSettings = true">⚙️</button>
      <ShopView
        :shop-items="state.shopItems"
        :gold="state.gold"
        :owned-jokers="state.ownedJokers"
        @buy="onBuyJoker"
        @skip="onSkipShop"
      />
    </div>

    <!-- ====== END VIEW ====== -->
    <div class="end-area" v-else-if="state.phase === 'won' || state.phase === 'lost'">
      <button class="btn btn-settings settings-btn" @click="showSettings = true">⚙️</button>
      <EndView
        :is-won="state.phase === 'won'"
        :final-score="state.roundScore"
        :joker-count="state.ownedJokers.length"
        :gold="state.gold"
        @restart="handleRestart"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import { useGame, identifyHand, calculateScore } from './composables/useGame.js'
import { useAnimation } from './composables/useAnimation.js'
import { useSound } from './composables/useSound.js'
import SideBar from './components/SideBar.vue'
import JokerCard from './components/JokerCard.vue'
import PlayingCard from './components/PlayingCard.vue'
import ScoreBlock from './components/ScoreBlock.vue'
import ShopView from './components/ShopView.vue'
import EndView from './components/EndView.vue'
import SettingsModal from './components/SettingsModal.vue'

const {
  state,
  currentBlind,
  startGame,
  toggleCard,
  sortByRank,
  sortBySuit,
  getSelectedCards,
  finalizePlay,
  discardSelected,
  buyJoker,
  skipShop,
  findBestPlay,
  calculateScore: calcScore,
  identifyHand: identify,
} = useGame()

const anim = useAnimation()
const sound = useSound()

// Refs for DOM elements
const playAreaRef = ref(null)
const deckRef = ref(null)
const handCardsRef = ref(null)
const sideBarRef = ref(null)
const scorePopupContainerRef = ref(null)
const cardRefs = reactive({})
const jokerRefs = reactive({})

// UI state
const showSettings = ref(false)
const aiThinking = ref(false)
const animatedScore = ref(0)

const settings = reactive({
  bgmVolume: 50,
  sfxVolume: 70,
  animSpeed: 'normal',
  showFormula: true,
  speedMult: 1.0,
})

function onSettingsChange(newSettings) {
  Object.assign(settings, newSettings)
  anim.speedMult.value = newSettings.speedMult || 1.0
  sound.setSfxVolume(settings.sfxVolume)
  sound.setBgmVolume(settings.bgmVolume)
}

// 首次用户交互时解锁音频上下文并起 BGM（浏览器自动播放策略要求手势触发）
let audioUnlocked = false
function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true
  sound.resume()
  sound.setSfxVolume(settings.sfxVolume)
  sound.setBgmVolume(settings.bgmVolume)
  if (state.phase === 'playing' || state.phase === 'shop') sound.startBgm()
}

// 阶段切换：胜负音效与商店进入音，并控制 BGM 起停
watch(() => state.phase, (phase) => {
  if (phase === 'won') {
    sound.stopBgm()
    sound.play('win')
  } else if (phase === 'lost') {
    sound.stopBgm()
    sound.play('lose')
  } else if (phase === 'shop') {
    sound.play('buy')
  }
})

// Computed for preview
const previewHandType = computed(() => {
  const sel = getSelectedCards()
  if (sel.length === 0) return ''
  return identify(sel) || ''
})

const previewResult = computed(() => {
  const sel = getSelectedCards()
  if (sel.length === 0) return null
  return calcScore(sel, state.ownedJokers)
})

const previewChips = computed(() => previewResult.value?.chips ?? 0)
const previewMult = computed(() => previewResult.value?.mult ?? 0)
const previewScore = computed(() => previewResult.value?.score ?? 0)

// Joker slots (always 5)
const jokerSlots = computed(() => {
  const slots = [...state.ownedJokers]
  while (slots.length < 5) slots.push(null)
  return slots
})

// Initialize game on mount
startGame()

// Watch animatedScore
watch(() => state.roundScore, (newVal) => {
  // Score is animated in handlePlay
})

async function handlePlay() {
  if (state.selectedCardIds.size === 0 || state.animating) return
  state.animating = true

  const played = getSelectedCards()
  if (played.length === 0) { state.animating = false; return }

  unlockAudio()
  sound.play('play')

  // Pre-calculate result for animation
  const handName = identify(played)
  const handDef = handName ? { chips: 0, mult: 0 } : null

  // Step 1: fly selected cards to play area center
  const flyPromises = played.map(card => {
    const cardEl = cardRefs[card.id]?.$el
    return flyCardToPlayArea(cardEl)
  })
  await Promise.all(flyPromises)

  // Finalize game state
  const result = finalizePlay()
  if (!result) { state.animating = false; return }

  // Step 2: Show hand type name - handled by computed previewHandType updating
  // But now state has changed so we show the last result
  await nextTick()

  // Step 3: per-card chip highlight animation
  const chipsTarget = sideBarRef.value?.scoreBlockRef?.chipsRef
  for (let i = 0; i < played.length; i++) {
    const card = played[i]
    // spawn fly text from center of play area
    if (playAreaRef.value) {
      const rect = playAreaRef.value.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      anim.flyText(`+${card.value}`, '#4dd6ff', x, y, chipsTarget?.$el)
    }
    sound.playChip(i)
    await sleep(150 * anim.speedMult.value)
  }

  // Step 4: Apply joker effects animation
  const multTarget = sideBarRef.value?.scoreBlockRef?.multRef
  for (let i = 0; i < state.ownedJokers.length; i++) {
    const jokerEl = jokerRefs[i]?.$el
    if (jokerEl) {
      sound.play('joker')
      await anim.jokerGlow(jokerEl)
    }
    if (playAreaRef.value) {
      const rect = playAreaRef.value.getBoundingClientRect()
      anim.flyText(`×Mult`, '#ff8844', rect.left + rect.width/2, rect.top + rect.height/2, multTarget?.$el)
    }
    await sleep(400 * anim.speedMult.value)
  }

  // Step 5: Score popup
  if (scorePopupContainerRef.value) {
    const popupText = `${result.chips} × ${result.mult} = ${result.score}`
    await anim.showScorePopup(popupText, scorePopupContainerRef.value)
  }

  // Step 6: Animate score counter
  const oldScore = animatedScore.value
  await anim.animateScore(animatedScore, oldScore + result.score)
  animatedScore.value = state.roundScore

  // Step 7: Deal new cards from deck
  await nextTick()
  await dealNewCards(played.length)

  state.animating = false
}

async function flyCardToPlayArea(cardEl) {
  if (!cardEl || !playAreaRef.value) return
  await anim.flyCardToCenter(cardEl, playAreaRef.value)
}

async function dealNewCards(count) {
  // Cards are already in state.hand; animate them flying in from deck
  if (!deckRef.value) return

  const newCards = state.hand.slice(-count)
  await nextTick()

  const promises = newCards.map((card, i) => {
    const targetEl = cardRefs[card.id]?.$el
    if (!targetEl || !deckRef.value) return Promise.resolve()
    setTimeout(() => sound.play('deal'), i * 60)
    return anim.flyCardFromDeck(deckRef.value, targetEl, i * 60)
  })

  await Promise.all(promises)
}

async function handleDiscard() {
  if (state.selectedCardIds.size === 0 || state.discardsLeft <= 0 || state.animating) return
  state.animating = true

  unlockAudio()
  sound.play('discard')

  const toDiscard = getSelectedCards()
  const count = toDiscard.length
  discardSelected()

  await nextTick()
  await dealNewCards(count)

  state.animating = false
}

async function handleAIPlay() {
  if (aiThinking.value || state.animating) return
  unlockAudio()
  sound.play('click')
  aiThinking.value = true

  // Simulate AI thinking
  await sleep(800 * anim.speedMult.value)

  const bestIds = findBestPlay(state.hand, state.ownedJokers)
  state.selectedCardIds = new Set(bestIds)

  aiThinking.value = false

  // Auto-play after short delay
  await sleep(200)
  await handlePlay()
}

function handleRestart() {
  unlockAudio()
  sound.play('click')
  animatedScore.value = 0
  startGame()
  sound.startBgm()
}

// ====== 交互音效包装 ======
function onToggleCard(cardId) {
  if (state.animating) return
  unlockAudio()
  const wasSelected = state.selectedCardIds.has(cardId)
  toggleCard(cardId)
  // 仅在选中状态真正变化时出声（如已达 5 张上限再点无效，则不响）
  if (state.selectedCardIds.has(cardId) !== wasSelected) {
    sound.play(wasSelected ? 'deselect' : 'select')
  }
}

function onSortByRank() {
  unlockAudio()
  sound.play('click')
  sortByRank()
}

function onSortBySuit() {
  unlockAudio()
  sound.play('click')
  sortBySuit()
}

function onBuyJoker(jokerId) {
  unlockAudio()
  const before = state.ownedJokers.length
  buyJoker(jokerId)
  if (state.ownedJokers.length > before) sound.play('buy')
}

function onSkipShop() {
  unlockAudio()
  sound.play('click')
  skipShop()
  sound.startBgm()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Settings button: absolute top-right of main area */
.settings-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}

/* ======= MAIN AREA ======= */
.main-area {
  flex: 1;
  display: grid;
  grid-template-rows: 230px 1fr 280px;
  overflow-x: clip;
  overflow-y: visible;
  position: relative;
  min-width: 0;
}

.shop-main, .end-area {
  flex: 1;
  position: relative;
  display: flex;
  overflow: hidden;
}

.end-area {
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,64,128,.6), transparent 70%),
    linear-gradient(135deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
}

/* Row 1: Joker Zone */
.joker-zone {
  padding: 12px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.zone-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.joker-slots {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

/* Row 2: Play Area */
.play-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}

.play-area-title {
  position: absolute;
  top: 10px;
  left: 20px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.played-cards {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.play-area-empty {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: var(--muted);
  opacity: 0.55;
}

/* Deck pile - ABSOLUTE within play area */
.deck-pile {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 90px;
  height: 130px;
  cursor: default;
}

.deck-layer {
  position: absolute;
  width: 80px;
  height: 116px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4a1a8a, #2a0f5a);
  border: 2px solid rgba(255,255,255,0.15);
}

.deck-layer-3 {
  top: 4px;
  left: 4px;
  background: #2a0f5a;
  opacity: 0.5;
}

.deck-layer-2 {
  top: 2px;
  left: 2px;
  background: #3a1472;
  opacity: 0.75;
}

.deck-layer-1 {
  top: 0;
  left: 0;
  background-image: url('/deck-back.jpeg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  overflow: hidden;
}

.deck-count {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fff;
  background: rgba(0,0,0,0.55);
  padding: 3px 7px;
  border-radius: 6px;
  line-height: 1;
}

.score-popup-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Row 3: Hand Zone */
.hand-zone {
  padding-top: 36px;
  padding-left: 16px;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-x: clip;
  overflow-y: visible;
}

.hand-cards {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  overflow-x: auto;
  overflow-y: visible;
  padding-top: 20px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-right: 130px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.action-buttons .btn {
  flex-shrink: 0;
}

.formula-preview {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: var(--gold);
  padding-left: 4px;
  opacity: 0.85;
}
</style>
