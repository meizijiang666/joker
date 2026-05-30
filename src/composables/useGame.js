import { reactive, computed } from 'vue'
import { BLINDS, HAND_TYPES, RANK_VALUES } from '../data/blinds.js'
import { JOKER_LIBRARY } from '../data/jokers.js'

// Build a standard 52-card deck
function buildDeck() {
  const suits = ['♠', '♥', '♦', '♣']
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
  const deck = []
  let id = 0
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: id++, suit, rank, value: RANK_VALUES[rank] })
    }
  }
  return deck
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Identify best hand type from 1-5 cards
export function identifyHand(cards) {
  if (!cards || cards.length === 0) return null
  const n = cards.length
  const ranks = cards.map(c => c.rank)
  const suits = cards.map(c => c.suit)

  const rankCount = {}
  for (const r of ranks) rankCount[r] = (rankCount[r] || 0) + 1
  const counts = Object.values(rankCount).sort((a, b) => b - a)

  const isFlush = n >= 5 && suits.every(s => s === suits[0])

  // Check straight
  const rankOrder = ['A','2','3','4','5','6','7','8','9','10','J','Q','K','A']
  // use numeric index for straight check
  const numericOrder = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 }
  let isStraight = false
  if (n >= 5) {
    const nums = [...new Set(ranks.map(r => numericOrder[r]))].sort((a,b)=>a-b)
    if (nums.length === 5) {
      isStraight = nums[4] - nums[0] === 4
      // Ace-low straight A,2,3,4,5
      if (!isStraight && nums.includes(14)) {
        const low = nums.filter(v => v !== 14).concat([1]).sort((a,b)=>a-b)
        isStraight = low[4] - low[0] === 4
      }
    }
  }

  if (n === 5 && isFlush && isStraight) return '同花顺'
  if (counts[0] === 4) return '四条'
  if (counts[0] === 3 && counts[1] === 2) return '葫芦'
  if (n === 5 && isFlush) return '同花'
  if (n === 5 && isStraight) return '顺子'
  if (counts[0] === 3) return '三条'
  if (counts[0] === 2 && counts[1] === 2) return '两对'
  if (counts[0] === 2) return '对子'
  return '高牌'
}

// Calculate score given played cards + jokers
export function calculateScore(playedCards, ownedJokers) {
  const handName = identifyHand(playedCards)
  if (!handName) return { chips: 0, mult: 0, score: 0, handName: null }

  const handType = HAND_TYPES.find(h => h.name === handName)
  let chips = handType.chips + playedCards.reduce((sum, c) => sum + c.value, 0)
  let mult = handType.mult

  // Apply joker effects in order
  for (const joker of ownedJokers) {
    const def = JOKER_LIBRARY.find(j => j.id === joker.id)
    if (def) {
      const result = def.effect({ chips, mult }, playedCards, handName)
      chips = result.chips
      mult = result.mult
    }
  }

  return { chips, mult, score: chips * mult, handName }
}

// Enumerate best play from hand cards
export function findBestPlay(handCards, ownedJokers) {
  if (handCards.length <= 5) {
    return handCards.map(c => c.id)
  }

  let bestScore = -1
  let bestIds = []

  // Try all subsets of size 1 to 5
  for (let size = 1; size <= Math.min(5, handCards.length); size++) {
    const combos = getCombinations(handCards, size)
    for (const combo of combos) {
      const { score } = calculateScore(combo, ownedJokers)
      if (score > bestScore) {
        bestScore = score
        bestIds = combo.map(c => c.id)
      }
    }
  }
  return bestIds
}

function getCombinations(arr, size) {
  if (size === 0) return [[]]
  if (arr.length < size) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, size - 1).map(c => [first, ...c])
  const withoutFirst = getCombinations(rest, size)
  return [...withFirst, ...withoutFirst]
}

// Game state
export function useGame() {
  const state = reactive({
    phase: 'playing', // playing | shop | won | lost
    deck: [],
    hand: [],          // cards in hand
    playedArea: [],    // cards currently shown in play area
    currentBlindIndex: 0,
    roundScore: 0,
    handsLeft: 4,
    discardsLeft: 3,
    gold: 4,
    ownedJokers: [],   // { id, ... }
    shopItems: [],     // 3 jokers for current shop
    selectedCardIds: new Set(),
    lastHandResult: null, // { handName, chips, mult, score }
    animating: false,
  })

  function initRound() {
    const fresh = shuffle(buildDeck())
    state.deck = fresh.slice(8)
    state.hand = fresh.slice(0, 8).map((c, i) => ({ ...c, handIndex: i }))
    state.playedArea = []
    state.handsLeft = 4
    state.discardsLeft = 3
    state.roundScore = 0
    state.selectedCardIds = new Set()
    state.lastHandResult = null
  }

  function startGame() {
    state.currentBlindIndex = 0
    state.gold = 4
    state.ownedJokers = []
    state.phase = 'playing'
    initRound()
  }

  function toggleCard(cardId) {
    if (state.animating) return
    const s = new Set(state.selectedCardIds)
    if (s.has(cardId)) {
      s.delete(cardId)
    } else {
      if (s.size >= 5) return // max 5 selected
      s.add(cardId)
    }
    state.selectedCardIds = s
  }

  function sortByRank() {
    const rankOrder = {'A':14,'K':13,'Q':12,'J':11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2}
    state.hand = [...state.hand].sort((a,b) => rankOrder[b.rank] - rankOrder[a.rank])
  }

  function sortBySuit() {
    const suitOrder = {'♠':0,'♥':1,'♦':2,'♣':3}
    const rankOrder = {'A':14,'K':13,'Q':12,'J':11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2}
    state.hand = [...state.hand].sort((a,b) => {
      const sd = suitOrder[a.suit] - suitOrder[b.suit]
      return sd !== 0 ? sd : rankOrder[b.rank] - rankOrder[a.rank]
    })
  }

  // Returns cards that will be played (used by animation layer)
  function getSelectedCards() {
    return state.hand.filter(c => state.selectedCardIds.has(c.id))
  }

  // Called after animation completes to finalize score
  function finalizePlay() {
    const played = getSelectedCards()
    if (played.length === 0) return null

    const result = calculateScore(played, state.ownedJokers)
    state.roundScore += result.score
    state.lastHandResult = result
    state.handsLeft -= 1
    state.playedArea = played

    // Remove played cards from hand, draw new ones
    const playedIds = new Set(played.map(c => c.id))
    state.hand = state.hand.filter(c => !playedIds.has(c.id))
    state.selectedCardIds = new Set()

    // Draw up to replace played cards
    const needed = Math.min(played.length, state.deck.length)
    const drawn = state.deck.splice(0, needed)
    state.hand = [...state.hand, ...drawn]

    // Check win/lose
    const blind = BLINDS[state.currentBlindIndex]
    if (state.roundScore >= blind.target) {
      // Win this blind
      if (state.currentBlindIndex >= BLINDS.length - 1) {
        state.phase = 'won'
      } else {
        // Go to shop
        buildShop()
        state.phase = 'shop'
        // Award gold
        state.gold += blind.baseReward + state.handsLeft
      }
    } else if (state.handsLeft <= 0) {
      state.phase = 'lost'
    }

    return result
  }

  function discardSelected() {
    if (state.discardsLeft <= 0) return
    if (state.selectedCardIds.size === 0) return
    if (state.animating) return

    const discardIds = new Set(state.selectedCardIds)
    state.hand = state.hand.filter(c => !discardIds.has(c.id))
    state.selectedCardIds = new Set()
    state.discardsLeft -= 1

    // Draw replacements
    const needed = Math.min(discardIds.size, state.deck.length)
    const drawn = state.deck.splice(0, needed)
    state.hand = [...state.hand, ...drawn]
  }

  function buildShop() {
    // Random 3 unique jokers from library that aren't owned
    const ownedIds = new Set(state.ownedJokers.map(j => j.id))
    const available = JOKER_LIBRARY.filter(j => !ownedIds.has(j.id))
    const shuffled = shuffle(available)
    state.shopItems = shuffled.slice(0, 3)
  }

  function buyJoker(jokerId) {
    const joker = state.shopItems.find(j => j.id === jokerId)
    if (!joker) return
    if (state.gold < joker.price) return
    if (state.ownedJokers.length >= 5) return

    state.gold -= joker.price
    state.ownedJokers.push({ ...joker })
    // Mark as sold
    const idx = state.shopItems.findIndex(j => j.id === jokerId)
    if (idx >= 0) state.shopItems[idx] = { ...state.shopItems[idx], sold: true }
  }

  function skipShop() {
    state.currentBlindIndex += 1
    state.phase = 'playing'
    initRound()
  }

  // AI: find best joker to highlight in shop
  function getAIShopSuggestion() {
    const available = state.shopItems.filter(j => !j.sold && state.gold >= j.price && state.ownedJokers.length < 5)
    if (available.length === 0) return null
    // best value = aiValue / price
    return available.reduce((best, j) => {
      const val = j.aiValue / j.price
      const bestVal = best ? best.aiValue / best.price : -1
      return val > bestVal ? j : best
    }, null)
  }

  // Computed helpers
  const currentBlind = computed(() => BLINDS[state.currentBlindIndex])
  const selectedCards = computed(() => getSelectedCards())
  const previewResult = computed(() => {
    const sel = getSelectedCards()
    if (sel.length === 0) return null
    return calculateScore(sel, state.ownedJokers)
  })

  return {
    state,
    currentBlind,
    selectedCards,
    previewResult,
    startGame,
    toggleCard,
    sortByRank,
    sortBySuit,
    getSelectedCards,
    finalizePlay,
    discardSelected,
    buildShop,
    buyJoker,
    skipShop,
    findBestPlay,
    getAIShopSuggestion,
    identifyHand,
    calculateScore,
  }
}
