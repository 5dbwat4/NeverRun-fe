# Notebookshelf 前端设计风格文档

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup lang="ts">`) |
| 构建 | Vite 7 |
| 语言 | TypeScript 5.9 |
| 路由 | Vue Router 4 + `unplugin-vue-router` (文件路由, hash history) |
| 样式方案 | Tailwind CSS v4 + 组件级 scoped CSS |
| 组件库 | @nuxt/ui v4 (headless 模式, 脱离 Nuxt 框架使用) |
| 图标 | Iconify + Lucide 图标集 |
| 包管理 | pnpm |

### 样式架构

采用**混合方案**:

1. **Tailwind CSS v4** — 通过 `@import "tailwindcss"` 引入，CSS-first 配置 (无 `tailwind.config.ts`)
2. **Nuxt UI 内置样式** — 通过 `@import "@nuxt/ui"` 引入，提供 `UCard`、`UButton`、`UInput` 等组件样式
3. **Scoped CSS** — 每个 `.vue` 组件通过 `<style scoped>` 编写自定义样式
4. **CSS 自定义属性** — 所有设计 Token 定义在 `App.vue` 的 `.page-wrap` 中，前缀 `--ns-`

---

## 色彩体系

色彩以**森林绿/鼠尾草绿**为基调，形成温暖、自然、学术气质的视觉风格。所有 Token 定义在 `src/App.vue:167-299`。

### 语义色板 (Light Mode)

| Token | 色值 | 说明 |
|-------|------|------|
| `--ns-bg` | `#fff` | 页面背景 |
| `--ns-surface` | `rgba(255,255,255,0.9)` | 卡片/面板背景 |
| `--ns-surface-soft` | `rgba(255,255,255,0.58)` | 软表面 (空状态等) |
| `--ns-surface-hover` | `rgba(250,253,252,1)` | 悬停态背景 |
| `--ns-border` | `#9eb4ad` | 边框色 |
| `--ns-text` | `#1f3b33` | 正文文字 |
| `--ns-text-strong` | `#113e34` | 强调/标题文字 |
| `--ns-muted` | `#4c665f` | 次要/弱化文字 |
| `--ns-link` | `#1f7d64` | 超链接 |
| `--ns-danger` | `#b7354d` | 错误/危险 |
| `--ns-mark-bg` | `rgba(255,206,91,0.55)` | 搜索高亮 `<mark>` 背景 |
| `--ns-mark-text` | `#173f31` | 搜索高亮 `<mark>` 文字 |

### 语义色板 (Dark Mode)

| Token | 色值 | 说明 |
|-------|------|------|
| `--ns-bg` | `#111` | 页面背景 |
| `--ns-surface` | `rgba(19,28,25,0.92)` | 卡片/面板背景 |
| `--ns-surface-soft` | `rgba(17,25,23,0.82)` | 软表面 |
| `--ns-surface-hover` | `rgba(24,34,31,0.95)` | 悬停态背景 |
| `--ns-border` | `#36524a` | 边框色 |
| `--ns-text` | `#dcebe6` | 正文文字 |
| `--ns-text-strong` | `#effaf5` | 强调/标题文字 |
| `--ns-muted` | `#9fbbb2` | 次要/弱化文字 |
| `--ns-link` | `#7dd6b8` | 超链接 |
| `--ns-danger` | `#ff8da2` | 错误/危险 |
| `--ns-mark-bg` | `rgba(255,202,82,0.35)` | 搜索高亮 `<mark>` 背景 |
| `--ns-mark-text` | `#fff3cd` | 搜索高亮 `<mark>` 文字 |

### 组件硬编码颜色

| 颜色 | 用途 |
|------|------|
| `#2818d5` | 加载动画外圈 |
| `#0c0542` | 加载动画内圈 |
| `#198754` | 成功/OK 状态 (config 页) |
| `#cc334d` / `#c93d57` | 错误/Failed 状态 (config 页) |
| `#8d7a33` | 等待中/Waiting 状态 (config 页) |

---

## 字体

定义于 `src/assets/fonts/def.css`。

### 字体族

| 字体 | 来源 | CSS 变量/类名 | 用途 |
|------|------|-------------|------|
| **Monomakh** | Google Fonts | `font-family: "Monomakh", system-ui` | `<h1>` 大标题、`<h2>` 页面标题 |
| **DM Sans** | Google Fonts | `font-family: "DM Sans", system-ui` | Hero 区 `<p>` 副标题 |
| **LXGW WenKai Mono** (霞鹜文楷) | chinese-fonts CDN | `font-family: "LXGW WenKai Mono", system-ui` | 搜索结果标题和摘要 (中文内容字体) |

- Fallback: 上述三个字体族均以 `system-ui` 回退

### 字号层级

| 场景 | 字号 | 字重 | 行高 |
|------|------|------|------|
| Hero 主标题 `<h1>` | `2.25rem` | 默认 | — |
| 页面标题 `<h2>` | `1.3rem` | 默认 | — |
| 搜索结果标题 | `1.15rem` | 默认 | `1.4` |
| 搜索摘要 snippet | `0.9rem` | 默认 | `1.65` |
| 元信息/状态文字 | `0.92rem` | 默认 | — |
| 摘要 label (config) | `0.86rem` | 默认 | — |
| URL 文字 | `0.83rem` | 默认 | — |
| Repo name | `0.82rem` | 默认 | — |
| Repo stats | `0.8rem` | 默认 | — |
| 摘要 value (config) | `1.5rem` | **700** | — |

---

## 间距与布局

### 页面级

| 属性 | 值 |
|------|------|
| 页面内边距 | `3rem 1.25rem 4rem` |
| 内容最大宽度 | `min(980px, 100%)` |
| 内容水平居中 | `margin: 0 auto` |

### 区块间距

| 场景 | 值 |
|------|------|
| Hero 区底部 | `1.3rem` |
| Section 底部 | `1rem` |
| summary-grid 底部 | `0.9rem` |
| Heading 行底部 | `1rem` |
| 结果卡片网格间距 | `0.9rem` |
| 工具栏表单间距 | `0.7rem` |
| 搜索面板底部 | `1rem` |
| 导航链接间距 | `0.5rem` |
| GitHub repo stats 内间距 | `0.8rem` |

### 内边距

| 场景 | 值 |
|------|------|
| GitHub card | `0.55rem 0.75rem` |
| 空状态容器 | `1rem` |
| Search `<mark>` | `0 0.15em` |

---

## 圆角

| 场景 | 值 |
|------|------|
| GitHub card | `0.75rem` |
| Config 表格 | `0.8rem` |
| 空状态容器 | `0.9rem` |
| 搜索 `<mark>` 高亮 | `0.2em` |
| 加载动画 | `50%` (圆形) |

---

## 边框与阴影

- **不使用 `box-shadow`** — 设计通过 `1px solid` / `1px dashed` 边框和 surface 颜色差异来表现层次
- 卡片边框: `1px solid var(--ns-border)`
- 空状态边框: `1px dashed var(--ns-border)`
- Nuxt UI 组件的默认边框样式由组件库自身提供

---

## 暗色模式

完整支持亮/暗两种模式，机制如下：

1. `document.documentElement` 上设置 `data-theme="light|dark"` 属性
2. 所有 `--ns-*` CSS 变量在 `:global(html[data-theme="dark"]) .page-wrap` 下提供深色覆盖
3. 用户选择持久化到 `localStorage` (key: `notebookshelf-theme`)
4. 初始页面加载时优先读取 localStorage，无记录则跟随 `prefers-color-scheme` 系统偏好
5. 切换按钮 (当前注释掉) 使用 Lucide sun/moon 图标

---

## 动画与过渡

| 场景 | 动画 |
|------|------|
| 路由切换 | fade: `opacity 0.3s ease` (`.fade-enter-active /.fade-leave-active`) |
| 链接悬停 | `color 0.2s` |
| 搜索结果卡片悬停 | `background-color 0.2s ease` + `transform 0.2s ease` + `translateY(-1px)` |
| 加载动画 | CSS `rotation 1s linear infinite` (双环旋转动画) |

---

## 响应式

| 断点 | 行为 |
|------|------|
| `860px` | 搜索工具栏从 3 列 Grid 变为单列堆叠 |
| `860px` | Hero 区从水平布局变为垂直布局 |
| `840px` | Config 页 summary-grid 从 4 列变为 2 列 |

---

## 组件规范

### 文件结构
- 页面组件: `src/pages/*.vue` (由 `unplugin-vue-router` 自动路由)
- 可复用组件: `src/components/` 下按功能分组 (如 `search/`)

### 编码约定
- 所有组件使用 `<script setup lang="ts">` Composition API
- 使用 `defineProps<T>()` 和 `defineEmits<T>()` 实现类型安全
- Vue 父子通信: Props 向下、Events 向上
- 双向绑定: `:model-value` + `@update:model-value` 模式
- 样式使用 `<style scoped>`, 引用 `var(--ns-*)` Token

### Nuxt UI 组件使用
- `UApp` — 根包裹器
- `UCard` — 卡片容器 (variant="outline")
- `UButton` — 按钮 (color="primary" / "neutral", variant="outline")
- `UInput` — 输入框 (icon="i-lucide-search")
- `USelect` — 下拉选择
- `UBadge` — 状态徽章 (color="neutral/success/error", variant="subtle/soft")
- `UTable` — 数据表格
- `UPagination` — 分页 (show-controls, show-edges, active-variant="soft", variant="outline")
- `UIcon` — 图标引用 (name="i-lucide-*")

### 图标系统
- 使用 Iconify + unplugin 自动解析 `i-lucide-*` 图标
- Lucide 图标集为主要图标来源

---

## 关键文件索引

| 文件 | 内容 |
|------|------|
| `src/App.vue` | 设计 Token 定义、主题切换、全局布局 |
| `src/assets/main.css` | Tailwind + Nuxt UI 样式入口 |
| `src/assets/fonts/def.css` | Google Fonts 与中文 Web Font 引入 |
| `src/pages/index.vue` | 搜索页 (含 `<mark>` 样式) |
| `src/pages/config.vue` | 配置页 (含 status badge 颜色) |
| `src/pages/about.vue` | FAQs 页 (github-markdown-css) |
| `src/components/search/SearchToolbar.vue` | 搜索工具栏 Grid 布局 |
| `src/components/search/SearchResultCard.vue` | 搜索结果卡片 (悬停动效) |
| `src/components/search/SearchResults.vue` | 搜索结果 Grid 容器 |
| `src/components/search/SearchPagination.vue` | 分页控制 |
| `src/components/loading.vue` | 加载动画 |
