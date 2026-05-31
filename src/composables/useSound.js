// 音效系统 —— 纯 Web Audio API 程序化合成，无需任何外部 mp3 文件。
// 对应 PRD：设置面板的「BGM 音量 / SFX 音量」两个滑块在此真正接线。
// 模块级单例：多处 import 共享同一个 AudioContext 与音量总线。

let ctx = null
let sfxBus = null      // SFX 总线（接 SFX 音量）
let bgmBus = null      // BGM 总线（接 BGM 音量）
let sfxVolume = 0.7    // 0~1
let bgmVolume = 0.5    // 0~1
let bgmTimer = null    // BGM 调度器
let bgmStep = 0
let bgmWanted = false  // 是否希望 BGM 处于播放态（受音量/交互限制）

// 浏览器策略：AudioContext 必须在用户手势后才能出声，首次创建后处于 suspended。
function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    sfxBus = ctx.createGain()
    bgmBus = ctx.createGain()
    sfxBus.gain.value = sfxVolume
    bgmBus.gain.value = bgmVolume * 0.18 // BGM 整体压低，避免盖过音效
    sfxBus.connect(ctx.destination)
    bgmBus.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// 单个振荡器音符，自带 ADSR 包络
function tone({ freq, type = 'sine', start = 0, dur = 0.15, gain = 0.3, freqEnd = null, bus }) {
  if (!ctx) return
  const target = bus || sfxBus
  const t0 = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(target)
  osc.start(t0)
  osc.stop(t0 + dur + 0.03)
}

// 短促噪声（用于「唰」的纸牌滑动 / whoosh）
function noise({ start = 0, dur = 0.18, gain = 0.18, hp = 800 }) {
  if (!ctx) return
  const t0 = ctx.currentTime + start
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filt = ctx.createBiquadFilter()
  filt.type = 'highpass'
  filt.frequency.value = hp
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filt)
  filt.connect(g)
  g.connect(sfxBus)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

// ====== 具名音效 ======
const SFX = {
  // 选牌：清脆上行 blip
  select: () => tone({ freq: 660, type: 'square', dur: 0.08, gain: 0.18, freqEnd: 990 }),
  // 取消选牌：下行 blip
  deselect: () => tone({ freq: 560, type: 'square', dur: 0.08, gain: 0.15, freqEnd: 380 }),
  // 按钮 / 排序：轻 click
  click: () => tone({ freq: 420, type: 'triangle', dur: 0.06, gain: 0.16, freqEnd: 300 }),
  // 出牌：whoosh
  play: () => { noise({ dur: 0.22, gain: 0.2, hp: 600 }); tone({ freq: 300, type: 'sine', dur: 0.18, gain: 0.12, freqEnd: 600 }) },
  // 发牌：轻短 tick
  deal: () => noise({ dur: 0.1, gain: 0.12, hp: 1200 }),
  // 弃牌：低一点的唰
  discard: () => { noise({ dur: 0.26, gain: 0.18, hp: 400 }); tone({ freq: 400, type: 'sine', dur: 0.16, gain: 0.1, freqEnd: 200 }) },
  // Joker 触发：明亮闪光双音
  joker: () => { tone({ freq: 880, type: 'triangle', dur: 0.16, gain: 0.16 }); tone({ freq: 1320, type: 'sine', start: 0.05, dur: 0.18, gain: 0.12 }) },
  // 购买：cha-ching 双音
  buy: () => { tone({ freq: 784, type: 'square', dur: 0.1, gain: 0.16 }); tone({ freq: 1175, type: 'square', start: 0.1, dur: 0.18, gain: 0.16 }) },
  // 胜利：上行大调琶音
  win: () => [523, 659, 784, 1047].forEach((f, i) =>
    tone({ freq: f, type: 'triangle', start: i * 0.12, dur: 0.4, gain: 0.2 })),
  // 失败：下行小调
  lose: () => [440, 349, 262].forEach((f, i) =>
    tone({ freq: f, type: 'sawtooth', start: i * 0.16, dur: 0.5, gain: 0.16 })),
}

// 计分音：每张牌音高递增，营造「叮叮叮」累积感
function playChip(index = 0) {
  ensureCtx()
  const base = 523 // C5
  const freq = base * Math.pow(2, (index % 8) / 12) // 半音阶递增
  tone({ freq, type: 'triangle', dur: 0.14, gain: 0.2 })
}

function play(name) {
  ensureCtx()
  const fn = SFX[name]
  if (fn) fn()
}

// ====== BGM ======
// 轻快的 I–V–vi–IV (C–G–Am–F) 琶音循环，纯合成 pad + arpeggio。
const BGM_NOTES = (() => {
  const chords = [
    [262, 330, 392],  // C
    [196, 392, 494],  // G
    [220, 349, 440],  // Am
    [175, 349, 440],  // F
  ]
  const seq = []
  for (const ch of chords) {
    // 每个和弦 4 个 arp 音（上行后回落）
    seq.push(ch[0], ch[1], ch[2], ch[1])
  }
  return seq
})()

function bgmTick() {
  if (!ctx || !bgmWanted) return
  const note = BGM_NOTES[bgmStep % BGM_NOTES.length]
  // 主旋律 arp
  tone({ freq: note, type: 'triangle', dur: 0.32, gain: 0.5, bus: bgmBus })
  // 每 4 步（每小节）补一个低八度 bass
  if (bgmStep % 4 === 0) {
    tone({ freq: note / 2, type: 'sine', dur: 0.6, gain: 0.6, bus: bgmBus })
  }
  bgmStep++
}

function startBgm() {
  bgmWanted = true
  if (!ensureCtx()) return
  if (bgmTimer || bgmVolume <= 0) return
  bgmStep = 0
  bgmTick()
  bgmTimer = setInterval(bgmTick, 340) // ~176 BPM 的八分音
}

function stopBgm() {
  bgmWanted = false
  if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null }
}

// ====== 音量控制（接设置面板滑块，传入 0~100）======
function setSfxVolume(v0to100) {
  sfxVolume = Math.max(0, Math.min(1, v0to100 / 100))
  if (sfxBus) sfxBus.gain.value = sfxVolume
}

function setBgmVolume(v0to100) {
  bgmVolume = Math.max(0, Math.min(1, v0to100 / 100))
  if (bgmBus) bgmBus.gain.value = bgmVolume * 0.18
  // 音量归零时停掉调度器省资源；从 0 调上来且希望播放则恢复
  if (bgmVolume <= 0) {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null }
  } else if (bgmWanted && !bgmTimer) {
    startBgm()
  }
}

// 用户手势后调用，解锁音频上下文
function resume() {
  ensureCtx()
}

export function useSound() {
  return {
    play,
    playChip,
    startBgm,
    stopBgm,
    setSfxVolume,
    setBgmVolume,
    resume,
  }
}
