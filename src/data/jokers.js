// 6 Joker cards library (locked values)
export const JOKER_LIBRARY = [
  {
    id: 'jester',
    name: '小丑',
    emoji: '🃏',
    rarity: 'common',
    price: 3,
    desc: '每手 +4 倍率',
    // effect called with ({ chips, mult }, playedCards, handType)
    effect: ({ chips, mult }) => ({ chips, mult: mult + 4 }),
    aiValue: 4, // estimated mult gain per use
  },
  {
    id: 'scholar',
    name: '学者',
    emoji: '📖',
    rarity: 'common',
    price: 3,
    desc: '打出的牌每张A：+4倍率',
    effect: ({ chips, mult }, playedCards) => {
      const aces = playedCards.filter(c => c.rank === 'A').length
      return { chips, mult: mult + aces * 4 }
    },
    aiValue: 3,
  },
  {
    id: 'heart_collector',
    name: '红心收藏家',
    emoji: '❤️',
    rarity: 'rare',
    price: 5,
    desc: '含♥时，倍率×4',
    effect: ({ chips, mult }, playedCards) => {
      const hasHeart = playedCards.some(c => c.suit === '♥')
      return { chips, mult: hasHeart ? mult * 4 : mult }
    },
    aiValue: 8,
  },
  {
    id: 'club_lover',
    name: '梅花爱好者',
    emoji: '♣',
    rarity: 'rare',
    price: 5,
    desc: '含♣时，倍率×4',
    effect: ({ chips, mult }, playedCards) => {
      const hasClub = playedCards.some(c => c.suit === '♣')
      return { chips, mult: hasClub ? mult * 4 : mult }
    },
    aiValue: 8,
  },
  {
    id: 'royal_banner',
    name: '皇家头牌',
    emoji: '👑',
    rarity: 'rare',
    price: 5,
    desc: '含J/Q/K时，倍率×10',
    effect: ({ chips, mult }, playedCards) => {
      const hasRoyal = playedCards.some(c => ['J','Q','K'].includes(c.rank))
      return { chips, mult: hasRoyal ? mult * 10 : mult }
    },
    aiValue: 15,
  },
  {
    id: 'flush_master',
    name: '同花顺大师',
    emoji: '🔥',
    rarity: 'legendary',
    price: 8,
    desc: '打出同花顺时 +50倍率',
    effect: ({ chips, mult }, playedCards, handType) => {
      return { chips, mult: handType === '同花顺' ? mult + 50 : mult }
    },
    aiValue: 25,
  },
]

export const RARITY_COLORS = {
  common: '#6cb4d3',
  rare: '#e34b6f',
  legendary: '#b577ff',
}
