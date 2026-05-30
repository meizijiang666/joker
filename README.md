# 小丑牌（Joker）

Balatro 风格的卡牌游戏，基于 Vue 3 + Vite 构建。玩家通过打出手牌组合得分，挑战三关盲注，并在商店购买小丑牌强化阵容。

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev      # 启动开发服务器（http://localhost:5173）
npm run build    # 构建生产版本（输出到 dist/）
npm run preview  # 本地预览构建产物
```

## 游戏玩法

1. 每轮发 8 张手牌，选 1–5 张出牌，系统识别牌型并计算 Chips × Mult 得分
2. 累计得分超过盲注目标后进入商店，可购买小丑牌
3. 连续通过 Small Blind → Big Blind → Boss Blind 三关即为获胜
4. 手牌次数耗尽前未达目标则失败
