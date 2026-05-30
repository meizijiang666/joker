// 3 blind levels (locked values)
export const BLINDS = [
  {
    index: 0,
    name: '小盲注',
    icon: '🔵',
    target: 300,
    // reward formula: $5 + remaining_hands * $1
    baseReward: 5,
  },
  {
    index: 1,
    name: '中盲注',
    icon: '🟡',
    target: 500,
    baseReward: 5,
  },
  {
    index: 2,
    name: '大盲注',
    icon: '🔴',
    target: 800,
    baseReward: 5,
  },
]

export const HAND_TYPES = [
  { name: '同花顺', chips: 100, mult: 8 },
  { name: '四条',   chips: 60,  mult: 7 },
  { name: '葫芦',   chips: 40,  mult: 4 },
  { name: '同花',   chips: 35,  mult: 4 },
  { name: '顺子',   chips: 30,  mult: 4 },
  { name: '三条',   chips: 30,  mult: 3 },
  { name: '两对',   chips: 20,  mult: 2 },
  { name: '对子',   chips: 10,  mult: 2 },
  { name: '高牌',   chips: 5,   mult: 1 },
]

// Card rank values for scoring
export const RANK_VALUES = {
  'A': 11, 'K': 10, 'Q': 10, 'J': 10,
  '10': 10, '9': 9, '8': 8, '7': 7,
  '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
}
