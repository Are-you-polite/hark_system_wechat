# 🎨 向内倾听 — UI 重构计划

> 生成日期：2026/06/04
> 设计源文件：`project.pen`
> 当前分支：`refactor`

---

## 一、设计系统对齐

### 1.1 设计变量 vs 现行变量

| 设计稿变量 | 设计值 | 现行 SCSS 变量 | 现行值 | 需对齐? |
|-----------|--------|---------------|--------|--------|
| `$bg` | `#FAFAFA` | `$color-bg` | `#fafafa` | ✅ 一致 |
| `$surface` | `#FFFFFF` | `$color-surface` | `#ffffff` | ✅ 一致 |
| `$brand` | `#2D6B3F` | `$color-accent` | `#2d6b3f` | ✅ 一致 |
| `$brand-bg` | `#EAF3EC` | 无 | — | ⚠️ 新增 |
| `$brand-soft` | `#F4F5F5` | `$color-surface-secondary` | `#f4f5f5` | ✅ 一致 |
| `$line` | `#E5E8E5` | `$color-border` | `#e5e8e5` | ✅ 一致 |
| `$text-primary` | `#1E3322` | `$color-primary` | `#1e3322` | ✅ 一致 |
| `$text-secondary` | `#6B7B6B` | `$color-secondary` | `#6b7b6b` | ✅ 一致 |
| `$text-tertiary` | `#808A80` | `$color-muted` | `#808a80` | ✅ 一致 |
| `$success` | `#2D6B3F` | 无 | — | ⚠️ 新增 |
| `$font-heading` | Inter | 无 | — | ⚠️ 小程序固定字体 |
| `$font-body` | Inter | 无 | — | ⚠️ 小程序固定字体 |

> **结论**：颜色系统基本对齐，需在 `variables.scss` 中补充 `$color-brand-bg: #EAF3EC` 和 `$color-success: #2D6B3F`。

### 1.2 设计稿中使用的圆角值

| 设计值 | 现行变量 | 需对齐? |
|-------|---------|--------|
| 12rpx（状态卡、骨架卡片） | `$radius-sm: 12rpx` | ✅ |
| 14rpx（空状态图标容器） | 无 | ⚠️ 新增 `$radius-xs: 8rpx`~ |
| 16rpx（屏幕外框） | `$radius-md: 16rpx` | ✅ |
| 10rpx（按钮） | 无 | ⚠️ 新增 `$radius-btn: 10rpx` |
| 999rpx（TabBar 头像） | 无 | 可复用现有 |
| 8rpx（输入框） | 无 | ⚠️ 新增 |

### 1.3 间距规范

设计稿间距均为 8rpx 倍数，与现行规范一致（16/20/24/32/40/48rpx），**无需调整**。

---

## 二、页面级 UI 差异分析

### Tab 1：首页（Home）

| 设计稿帧 | 对应组件 | 页面高度 | 差异点 |
|---------|---------|---------|-------|
| `1-1 首页-加载态` | `tab-home/index.vue` | 844rpx | ✅ 加载状态匹配 |
| `1-2 首页-未开始测试` | `tab-home/index.vue` | 844rpx | ⚠️ 头部 padding 设计为 `[48,24,16,24]`，当前实现无严格对齐 |
| `1-3 首页-测试进行中` | `tab-home/index.vue` | 844rpx | ⚠️ 缺少"测试进行中"状态卡片 UI |
| `1-4 首页-测试完成` | `tab-home/index.vue` | 1096rpx | ❌ 存在"补资料覆盖层"，代码中未实现 |
| `1-5 被邀请匹配未测试弹窗` | — | 1044rpx | ❌ 未实现弹窗覆盖层 |
| `1-6 被邀请匹配已测试弹窗` | — | 1044rpx | ❌ 未实现 |
| `1-7 被邀请匹配已匹配过弹窗` | — | 1044rpx | ❌ 未实现 |
| `1-8 被邀请已经测试未补充信息弹窗` | — | 1190rpx | ❌ 未实现 |

**重构重点**：
1. Header 区域统一为 `padding: 48rpx 24rpx 16rpx 24rpx`，标题字体 `22/700` + 副标题 `13/normal`
2. 补充"测试进行中"状态（进度条 + 继续答题入口）
3. 补充"补资料覆盖层"弹窗逻辑
4. 实现完整的邀请匹配弹窗体系（4 种状态）

### Tab 2：对话（Chats）

| 设计稿帧 | 对应组件 | 差异点 |
|---------|---------|-------|
| `2-1 对话列表-未测试` | `tab-chats/index.vue` | ⚠️ 标题设计为"洞察日志"，现行已匹配 |
| `2-2 对话列表-已测试无记录` | `tab-chats/index.vue` | ⚠️ 空状态圆角图标容器 `56rpx`、`$brand-bg` |
| `2-3 对话列表-有对话记录` | `tab-chats/index.vue` | ❌ 对话卡片缺少阴影 `shadow`（设计使用外阴影） |
| `2-4 AI对话-聊天欢迎页` | `chat/detail.vue` | ❌ 大量差异，见下 |
| `2-5 AI对话-聊天进行中` | `chat/detail.vue` | ❌ 消息气泡样式未按设计实现 |
| `2-6 次数不足抽屉` | — | ❌ 未实现底部抽屉组件 |

**重构重点**：
1. 对话卡片增加阴影 `shadow: {blur:4, y:1, #0000000F}`
2. 空状态图标容器改为 `56×56rpx` 圆角 `14rpx`，底色 `$brand-bg`
3. 聊天页导航栏统一：返回 + 中间信息 + 占位
4. 输入栏结构：左侧输入框（`8rpx` 圆角、`$bg` 背景）+ 右侧发送按钮（`10rpx` 圆角、`$brand`）
5. 实现"次数不足"底部抽屉组件

### Tab 3：匹配（Match）

| 设计稿帧 | 对应组件 | 差异点 |
|---------|---------|-------|
| `3-1 匹配-未测试` | `tab-match/index.vue` | ⚠️ 空状态 `56rpx` 圆角图标，底色 `$brand-bg` |
| `3-2 匹配-已测试无记录` | `tab-match/index.vue` | ⚠️ CTA 按钮 `243rpx` 宽、`10rpx` 圆角 |
| `3-3 匹配-有匹配记录` | `tab-match/index.vue` | ❌ 卡片缺少阴影 |
| `3-4 匹配报告` | `match/result.vue` | ❌ 大差异，见下 |

**重构重点**：
1. 匹配记录卡片增加外阴影
2. 空状态统一为 `$brand-bg` 圆形图标 + 描述文字 `lineHeight: 1.6`
3. 匹配报告完整实现：关系摘要 → 维度对比 → 关系建议 → AI入口 → 分享

### Tab 4：我的（Mine）

| 设计稿帧 | 对应组件 | 差异点 |
|---------|---------|-------|
| `4-1 我的-未测试` | `tab-mine/index.vue` | ⚠️ 标题"个人档案"，副标题匹配 |
| `4-2 我的-已测试` | `tab-mine/index.vue` | ⚠️ 人格类型卡 `padding: 28rpx` |
| `4-3 会员中心` | `member/center.vue` | ❌ 缺少会员卡片阴影 |
| `4-4 购买套餐` | `member/subscribe.vue` | ❌ 套餐卡片样式需要对齐 |
| `4-5 购买套餐-成功弹窗` | — | ❌ 未实现成功弹窗 |
| `4-6 购买记录` | `member/orders.vue` | ❌ 需要对齐 |

**重构重点**：
1. 人格类型卡 padding 统一为 `28rpx`
2. 统计区布局对齐设计
3. 会员卡片增加外阴影
4. 套餐卡片区分"推荐"状态（`#F6FAF7` 底色 + `$brand` 边框）

### Tab 5：测试答题（Test）

| 设计稿帧 | 对应组件 | 差异点 |
|---------|---------|-------|
| `5-1 测试答题-默认态` | `test/answer.vue` | ⚠️ 基本结构匹配 |
| `5-2 测试答题-已选态` | `test/answer.vue` | ⚠️ 选中项边框 `1.5rpx` + `$brand` |
| `5-3 测试答题-最后一题` | `test/answer.vue` | ⚠️ 按钮文字改为"完成" |

**重构重点**：
1. 选项选中态边框改为 `1.5rpx`，颜色 `$brand`
2. 进度条填充色 `$brand`，轨道色 `$brand-soft`
3. 导航栏 "退出/上一题" + "当前题号/总题数" + "占位" 三栏式布局对齐

---

## 三、状态管理对齐

设计稿中定义了以下 UI 状态组合：

| Tab | 未登录 | 加载中 | 未测试 | 进行中 | 已完成 |
|-----|-------|-------|-------|-------|-------|
| 首页 | ➖ | 1-1 | 1-2 | 1-3 | 1-4 + 弹窗 |
| 对话 | ➖ | ➖ | 2-1 | ➖ | 2-2 / 2-3 |
| 匹配 | ➖ | ➖ | 3-1 | ➖ | 3-2 / 3-3 |
| 我的 | ➖ | ➖ | 4-1 | ➖ | 4-2 |

**需补充状态**：
1. 首页"测试进行中"（1-3）—— 进度条 + "继续测试"入口
2. 首页 4 种邀请弹窗覆盖层（1-5 ~ 1-8）
3. 对话次数不足抽屉（2-6）
4. 购买成功弹窗（4-5）

---

## 四、重构优先级与工作量估算

### P0 — 必须优先（影响核心体验）

| 模块 | 工时 | 说明 |
|-----|------|-----|
| 首页状态: 测试进行中 | 0.5d | 进度条 + 入口 |
| 聊天页 UI 对齐 | 1.5d | 导航栏、输入栏、消息气泡 |
| 匹配报告 UI | 1d | 维度对比、关系建议、分享 |
| 设置页面/补资料覆盖层 | 0.5d | 设计稿 1-4 中的覆盖层 |

### P1 — 重要（补齐缺失状态）

| 模块 | 工时 | 说明 |
|-----|------|-----|
| 邀请匹配弹窗体系（4种） | 1d | 底部弹窗覆盖层 |
| 次数不足抽屉 | 0.5d | 底部抽屉组件 |
| 购买成功弹窗 | 0.5d | 同上 |

### P2 — 视觉微调

| 模块 | 工时 | 说明 |
|-----|------|-----|
| 卡片阴影统一 | 0.5d | 匹配/对话卡片加 shadow |
| 间距/圆角对齐 | 0.5d | padding/border-radius 按设计调整 |
| 空状态图标容器 | 0.5d | 统一为 `56rpx` `$brand-bg` |
| 变量补充 | 0.25d | `$brand-bg`, `$radius-btn` 等 |

### P3 — 低优先级

| 模块 | 工时 | 说明 |
|-----|------|-----|
| 像素级间距微调 | 1d | Header padding 等 |
| 动画/过渡效果 | 1d | 页面过渡、加载动画（设计稿未标注） |
| 深色模式准备 | 0.5d | 使用变量体系预留 |

---

## 五、文件变更清单

### 新增文件

| 文件 | 用途 |
|-----|------|
| `src/components/QuotaDrawer.vue` | AI 对话次数不足抽屉 |
| `src/components/InviteModal.vue` | 邀请匹配弹窗（4合1） |
| `src/hooks/useInviteModal.ts` | 邀请弹窗逻辑 |
| `src/components/SuccessModal.vue` | 购买成功弹窗 |

### 修改文件

| 文件 | 改动要点 |
|-----|---------|
| `src/styles/variables.scss` | 补充 `$color-brand-bg`、`$color-success`、`$radius-btn`、`$radius-xs` |
| `src/components/tab-home/index.vue` | 补充"测试进行中"状态 + 弹窗覆盖层 |
| `src/components/tab-home/index.scss` | 新状态样式 |
| `src/components/tab-chats/index.vue` | 对话卡片阴影 + 空状态样式 |
| `src/components/tab-chats/index.scss` | 对应样式 |
| `src/components/tab-match/index.vue` | 匹配卡片阴影 + 空状态对齐 |
| `src/components/tab-match/index.scss` | 对应样式 |
| `src/components/tab-mine/index.vue` | 人格卡片 padding、统计区 |
| `src/components/tab-mine/index.scss` | 对应样式 |
| `src/pages/chat/detail.vue` | 导航栏、输入栏、消息气泡全面重构 |
| `src/pages/chat/detail.scss` | 对应样式 |
| `src/pages/match/result.vue` | 匹配报告UI重构 |
| `src/pages/match/result.scss` | 对应样式 |
| `src/pages/test/answer.vue` | 选项选中态、进度条对齐 |
| `src/pages/test/answer.scss` | 对应样式 |
| `src/pages/member/center.vue` | 会员卡片阴影、样式对齐 |
| `src/pages/member/subscribe.vue` | 套餐卡片"推荐"态高亮 |
| `src/pages/member/orders.vue` | 购买记录样式对齐 |

---

## 六、实施路线图

```
Phase 1（第1-2天）— 基础对齐
  ├── 补充 variables.scss 变量
  └── 空状态 + 卡片阴影 + 间距圆角统一

Phase 2（第3-4天）— 页面补齐
  ├── 首页"测试进行中"状态
  ├── 聊天页 UI 对齐
  ├── 匹配报告 UI 重构
  └── 测试答题选中态对齐

Phase 3（第5-6天）— 弹窗与抽屉
  ├── 邀请匹配弹窗体系
  ├── 次数不足抽屉
  ├── 购买成功弹窗
  └── 补资料覆盖层

Phase 4（第7天）— 收尾验收
  ├── 像素级走查
  ├── npx uni build -p mp-weixin 编译验证
  ├── eslint --fix
  └── 清除调试文件
```

---

## 七、注意事项

1. **设计稿未覆盖的场景**：加载失败、网络错误、空白数据等异常态 — 需自行补充，保持与设计语言一致。
2. **字体差异**：设计稿使用 Inter 字体，微信小程序无法使用自定义字体，回退使用系统字体（`-apple-system, sans-serif`），字号权重对齐即可。
3. **弹窗体系**：设计稿中的弹窗（邀请匹配、补资料覆盖层）使用 `layout: none` 的绝对定位覆盖层，需要确保组件可复用。
4. **屏幕高度溢出**：部分设计帧高度超过标准 844rpx（如 1-4 为 1096rpx），注意滚动容器设计。
5. **分包路由不变**：`pages.json` 的结构不需要调整，只需更新各页面内部 UI。

---

*本计划基于 `project.pen` 设计文件（28 个设计帧）与当前代码库（15 个 .vue 文件）的全面对比生成。*
