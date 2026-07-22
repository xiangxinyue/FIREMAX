# FIREMAX — Deccum / Savings Map

面向提前退休人群的**退休提款规划工具**原型。把散落在 401(k)、Roth、券商、养老金里的资产连起来，按年份规划该从哪个账户取钱，并追踪影响计划的新政策变化。

> Cursor Hackathon Toronto 项目

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) **18+**（推荐 20+）
- npm（随 Node.js 一起安装）

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/xiangxinyue/FIREMAX.git
cd FIREMAX

# 2. 进入前端项目目录
cd deccum

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

启动后在浏览器打开：**http://localhost:5173**

### 生产构建（可选）

```bash
cd deccum
npm run build    # 构建静态文件到 dist/
npm run preview  # 本地预览构建结果
```

---

## 使用流程

1. **Setup** — 填写年龄、离职年龄、年支出，以及各账户余额
2. **Generate Savings Map** — 生成按年份规划的提款时间线
3. **Savings Map** — 查看彩色时间线、每年提款来源、ACA / 罚金等预警
4. **Policy Tracker** — 浏览 SECURE 2.0、ACA 补贴、RMD 等政策变化对你的影响

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 账户设置 | 401(k)、Roth IRA、券商、养老金、HSA |
| 提款引擎 | Rule of 55、Roth 转换、ACA 门槛、社保时机 |
| 彩色时间线 | 每年按账户类型堆叠，点击看详情 |
| 预警系统 | 提前取款罚金、ACA 悬崖、RMD、IRMAA |
| 政策追踪 | 10+ 条政策模拟数据，个性化影响评估 |

---

## 项目结构

```
FIREMAX/
└── deccum/                  # 前端原型（React + Vite + Tailwind）
    ├── src/
    │   ├── App.tsx          # 主应用
    │   ├── components/      # UI 组件
    │   ├── data/policies.ts # 政策数据库
    │   └── engine/          # 提款策略引擎
    ├── package.json
    └── vite.config.ts
```

---

## 技术栈

- **React 19** + **TypeScript**
- **Vite 6** — 开发服务器与构建
- **Tailwind CSS 4** — 样式

---

## 常见问题

**Q: 端口 5173 被占用怎么办？**

Vite 会自动尝试下一个可用端口，注意终端输出的实际地址。

**Q: `npm install` 报错？**

确认 Node.js 版本 ≥ 18，然后删除 `node_modules` 和 `package-lock.json` 后重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

**Q: 这是真实的财务建议吗？**

不是。这是产品原型，税务规则已简化，仅供演示，不构成投资或税务建议。

---

## Disclaimer

Prototype for demonstration only. All revenue estimates, policy data, and withdrawal strategies are illustrative. Not financial, legal, or tax advice.

---

## License

See [LICENSE](LICENSE).
