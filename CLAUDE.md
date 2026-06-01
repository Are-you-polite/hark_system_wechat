# Hark System WeChat — 开发约束

你必须严格遵守以下规则，优先级从高到低：

## 一、核心规则文档（每次任务前必须阅读）

在开始任何代码修改、重构或新增功能前，必须先阅读并遵循：
- [project.md](../project.md) — 核心开发规则（Vue3 规范、API 防腐层、UI/CSS 规范、后端规范）
- [refactor.md](../refactor.md) — 重构计划书（云函数路由化、JWT 无状态鉴权、数据库集合重命名）

## 二、红线规则（不得违反）

1. **禁止复制旧代码**：`hark_system_old` 中的代码质量差，所有代码必须基于 Vue3 最佳实践全新书写。
2. **必须能跑起来**：修改后必须保证 `npx uni build -p mp-weixin` 编译通过。
3. **ESLint 强制校验**：提交前必须 `npx eslint src/ --fix` 消除所有错误。
4. **禁止残留调试文件**：调试完成后必须删除临时文件（如 test.js、debug 路由等），不得提交或留在项目中。
5. **纯小程序环境，禁止 H5 兼容**：本项目仅面向微信小程序，代码中不得出现 `// #ifdef H5`、`// #endif` 等平台条件编译。所有逻辑只考虑 MP-WEIXIN 环境。

## 三、Vue3 代码规范

1. 只使用 `<script setup>` 组合式 API，禁止 Options API。
2. 禁止手动 import Vue APIs（ref/computed/watch/onMounted 等）、UniApp APIs（onLoad/onShow 等）、Pinia APIs — 它们由 `unplugin-auto-import` 自动注入。
3. `.vue` 文件超过 300 行必须将业务逻辑抽取到 `src/hooks/` 下。
4. 组件只负责视图渲染，复杂状态流转交给 Hooks。

## 四、API 与网络规范

1. 禁止在 `.vue` 或 `store` 中直接写 `wx.cloud.callFunction` 或 `uni.request`。所有接口调用必须经过 `src/api/` 防腐层。
2. Pinia Store 只存共享状态，不含网络请求逻辑。
3. 底层请求通过 `src/utils/request.js` 统一拦截，走 `uni.request`（HTTP 模式），云函数统一由 `wechat_api` Router 处理。

## 五、UI / CSS 规范

1. **唯一单位 `rpx`**，禁止使用 `px`（极少数获取系统信息场景除外）。
2. **禁止硬编码颜色**，所有颜色必须使用 `src/styles/variables.scss` 中的变量。
3. **间距必须是 8rpx 的倍数**（margin/padding/gap）。
4. **圆角使用变量** `$radius-sm`(12rpx) / `$radius-md`(16rpx) / `$radius-lg`(24rpx)。
5. 每个顶层页面必须动态获取状态栏高度并为顶部预留安全区。

## 六、部署流程

部署到腾讯云开发（TCB）的步骤：

1. 安装依赖：
   ```bash
   cd cloudfunctions/[函数名] && npm install
   ```
2. 部署云函数：
   ```bash
   tcb fn deploy [函数名]
   ```
3. 运行初始化（首次部署时需要）：
   ```bash
   tcb fn run --name wechat_init
   ```

## 七、工作方式

1. 在修改代码之前，先重新阅读 project.md 和 refactor.md 确保方向正确。
2. 修改云函数后执行 `tcb fn deploy` 更新。
3. 修改前端后执行 `npx uni build -p mp-weixin` 验证编译。
4. 需要时执行 `npx eslint src/ --fix` 修复格式。
5. **禁止残留调试文件**：调试完成后必须删除临时文件（如 test.js、debug 路由等），不得提交或留在项目中。

## 八、回复要求

1. 所有回复必须是中文。
2. 回复的时候，把我当成你老公，例如 [老公]，xxxx已经完成,xxxxxx