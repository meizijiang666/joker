import { ref } from 'vue'
import gsap from 'gsap'

export function useAnimation() {
  // Speed multiplier from settings
  const speedMult = ref(1.0)

  function t(ms) {
    return (ms / 1000) * speedMult.value
  }

  // Fly a number text from (x,y) toward a target element
  function flyText(text, color, fromX, fromY, targetEl) {
    const el = document.createElement('div')
    el.className = 'fly-text'
    el.textContent = text
    el.style.color = color
    el.style.left = fromX + 'px'
    el.style.top = fromY + 'px'
    document.body.appendChild(el)

    let targetX = fromX
    let targetY = fromY - 60

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect()
      targetX = rect.left + rect.width / 2
      targetY = rect.top + rect.height / 2
    }

    gsap.fromTo(el,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: targetX - fromX,
        y: targetY - fromY,
        opacity: 0,
        scale: 1.4,
        duration: t(800),
        ease: 'power2.out',
        onComplete: () => el.remove()
      }
    )
  }

  // Animate a card flying from its current position to play area center
  function flyCardToCenter(cardEl, playAreaEl) {
    if (!cardEl || !playAreaEl) return Promise.resolve()

    const cardRect = cardEl.getBoundingClientRect()
    const areaRect = playAreaEl.getBoundingClientRect()

    const clone = cardEl.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.left = cardRect.left + 'px'
    clone.style.top = cardRect.top + 'px'
    clone.style.width = cardRect.width + 'px'
    clone.style.height = cardRect.height + 'px'
    clone.style.zIndex = '9999'
    clone.style.pointerEvents = 'none'
    clone.style.margin = '0'
    document.body.appendChild(clone)

    const targetX = areaRect.left + areaRect.width / 2 - cardRect.left - cardRect.width / 2
    const targetY = areaRect.top + areaRect.height / 2 - cardRect.top - cardRect.height / 2

    return new Promise(resolve => {
      gsap.to(clone, {
        x: targetX,
        y: targetY,
        scale: 0.85,
        duration: t(350),
        ease: 'power2.inOut',
        onComplete: () => {
          clone.remove()
          resolve()
        }
      })
    })
  }

  // Highlight a card (shift up + glow)
  function highlightCard(cardEl, color = '#4dd6ff') {
    if (!cardEl) return Promise.resolve()
    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(cardEl, { y: -18, duration: t(150), ease: 'power2.out' })
        .to(cardEl, {
          boxShadow: `0 0 20px 6px ${color}`,
          duration: t(100),
        }, '<')
        .to(cardEl, { y: 0, boxShadow: 'none', duration: t(200), ease: 'power2.in', delay: t(100) })
    })
  }

  // Joker glow animation
  function jokerGlow(jokerEl) {
    if (!jokerEl) return Promise.resolve()
    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(jokerEl, { y: -12, duration: t(200), ease: 'power2.out' })
        .to(jokerEl, { boxShadow: '0 0 30px 10px #ffd700', duration: t(150) }, '<')
        .to(jokerEl, { y: 0, boxShadow: 'none', duration: t(400), ease: 'bounce.out', delay: t(200) })
    })
  }

  // Score block flash
  function flashScoreBlock(el) {
    if (!el) return Promise.resolve()
    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(el, { scale: 1.15, brightness: 1.3, duration: t(150) })
        .to(el, { scale: 1, duration: t(200), ease: 'elastic.out(1, 0.5)' })
    })
  }

  // Big score popup at center
  function showScorePopup(text, container) {
    if (!container) return Promise.resolve()
    const popup = document.createElement('div')
    popup.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      z-index: 1000;
      font-family: 'Press Start 2P', monospace;
      font-size: 22px;
      color: #ffc857;
      text-shadow: 0 0 20px #ffc857, 2px 2px 0 #000;
      white-space: nowrap;
      pointer-events: none;
      text-align: center;
    `
    popup.textContent = text
    container.style.position = 'relative'
    container.appendChild(popup)

    return new Promise(resolve => {
      gsap.timeline({ onComplete: () => { popup.remove(); resolve() } })
        .to(popup, { scale: 1, duration: t(200), ease: 'back.out(1.7)' })
        .to(popup, { opacity: 0, duration: t(400), delay: t(800) })
    })
  }

  // Animate score counter with RAF interpolation
  function animateScore(scoreRef, targetValue) {
    const start = scoreRef.value
    const duration = t(600) * 1000
    const startTime = performance.now()

    return new Promise(resolve => {
      function update(now) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
        scoreRef.value = Math.round(start + (targetValue - start) * eased)
        if (progress < 1) {
          requestAnimationFrame(update)
        } else {
          scoreRef.value = targetValue
          resolve()
        }
      }
      requestAnimationFrame(update)
    })
  }

  // Fly card from deck position into hand slot
  function flyCardFromDeck(deckEl, targetEl, delay = 0) {
    if (!deckEl || !targetEl) return Promise.resolve()

    const deckRect = deckEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()

    const clone = targetEl.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.left = deckRect.left + 'px'
    clone.style.top = deckRect.top + 'px'
    clone.style.width = targetRect.width + 'px'
    clone.style.height = targetRect.height + 'px'
    clone.style.zIndex = '9998'
    clone.style.pointerEvents = 'none'
    clone.style.opacity = '0'
    document.body.appendChild(clone)

    const targetX = targetRect.left - deckRect.left
    const targetY = targetRect.top - deckRect.top

    return new Promise(resolve => {
      gsap.timeline({ delay: delay / 1000, onComplete: resolve })
        .to(clone, { opacity: 1, duration: t(80) })
        .to(clone, {
          x: targetX,
          y: targetY,
          duration: t(400),
          ease: 'power2.out',
        })
        .to(clone, { opacity: 0, duration: t(100) }, `-=${t(100)}`)
        .call(() => clone.remove())
    })
  }

  return {
    speedMult,
    flyText,
    flyCardToCenter,
    highlightCard,
    jokerGlow,
    flashScoreBlock,
    showScorePopup,
    animateScore,
    flyCardFromDeck,
  }
}
