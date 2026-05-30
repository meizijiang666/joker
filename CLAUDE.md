# CLAUDE.md

## 项目定位

Balatro 风格卡牌游戏 demo，Vue 3 + Vite + GSAP。核心循环：出牌得分 → 商店购买 → 下一轮。只做前端，无后端/数据库。

## 目录约定

```
src/
  components/     # UI 组件（PlayingCard, JokerCard, SideBar 等）
  composables/    # 业务逻辑（useGame.js 状态机 + useAnimation.js GSAP 动效）
  data/           # 静态数据（jokers.js, blinds.js）
  App.vue         # 主布局 + 动画入口
  style.css       # 全局 CSS 变量与基础样式
```

## 常用命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 关键约定

- 状态机在 `useGame.js`，阶段：`playing` → `shop` → `playing` → `won/lost`
- GSAP 动效统一在 `useAnimation.js`，7 步时间线
- 设置持久化：`localStorage` key `balatro.settings`
- AI 建议：枚举 C(8,1)~C(8,5) 共 218 种组合，取最高分
- 实施阶段强制走 `fullstack-engineer` 子代理
