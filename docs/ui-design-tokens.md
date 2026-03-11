# UI Design Token 规范 / UI Design Token Specification

> **Single Source of Truth** — 所有 UI 开发必须遵循本文档定义的 Token。
> Token 变量定义位于 `src/app/globals.css` 的 `@theme inline` 块中，
> `@utility` 快捷类定义在同文件的 `@utility` 区块中。

---

## 1. 响应式策略 / Responsive Strategy

### Mobile-First 原则

默认样式为手机端编写，通过断点前缀渐进增强：

| 断点  | 宽度       | 设备     | 用法   |
| ----- | ---------- | -------- | ------ |
| 默认  | `< 640px`  | 手机     | 无前缀 |
| `sm`  | `≥ 640px`  | 大屏手机 | `sm:`  |
| `md`  | `≥ 768px`  | 平板     | `md:`  |
| `lg`  | `≥ 1024px` | 笔记本   | `lg:`  |
| `xl`  | `≥ 1280px` | 桌面     | `xl:`  |
| `2xl` | `≥ 1536px` | 大屏     | `2xl:` |

**编码规则**：

```tsx
// [Correct] Mobile-first, progressive enhancement
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// [Wrong] Desktop-first, degradation
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

### 容器查询

组件级响应式使用 Tailwind v4 container queries：

```tsx
// 父元素标记为容器
<div className="@container">
  {/* 子元素根据容器宽度适配 */}
  <div className="@sm:flex-row flex-col">...</div>
</div>
```

---

## 2. 排版 / Typography

### Token 定义

标题类使用 `clamp()` 流式缩放（320px → 1536px），正文类保持固定值：

| Token   | CSS 变量         | Mobile | Desktop | Tailwind Class |
| ------- | ---------------- | ------ | ------- | -------------- |
| Display | `--text-display` | 30px   | 48px    | `text-display` |
| H1      | `--text-h1`      | 24px   | 36px    | `text-h1`      |
| H2      | `--text-h2`      | 20px   | 24px    | `text-h2`      |
| H3      | `--text-h3`      | 16px   | 18px    | `text-h3`      |
| Body    | `--text-body`    | 16px   | 16px    | `text-body`    |
| Body-sm | `--text-body-sm` | 14px   | 14px    | `text-body-sm` |
| Caption | `--text-caption` | 12px   | 12px    | `text-caption` |

### 行高

| Token   | CSS 变量            | 值  | 适用             |
| ------- | ------------------- | --- | ---------------- |
| Tight   | `--leading-tight`   | 1.2 | Display, H1      |
| Snug    | `--leading-snug`    | 1.3 | H2, H3           |
| Normal  | `--leading-normal`  | 1.6 | Body             |
| Relaxed | `--leading-relaxed` | 1.5 | Body-sm, Caption |

> **[Caution] Tailwind 覆盖说明**：以下 `@utility` 重定义了 Tailwind 默认值，差异很小但是刻意的。
>
> | Class             | Tailwind 默认 | 本项目 Token | 差异   |
> | ----------------- | ------------- | ------------ | ------ |
> | `leading-tight`   | 1.25          | **1.2**      | -0.05  |
> | `leading-snug`    | 1.375         | **1.3**      | -0.075 |
> | `leading-normal`  | 1.5           | **1.6**      | +0.1   |
> | `leading-relaxed` | 1.625         | **1.5**      | -0.125 |

### 使用场景

| 场景              | Token                     | 示例            |
| ----------------- | ------------------------- | --------------- |
| 页面主标题 (Hero) | `display` + `font-bold`   | 首页 Hero       |
| 页面标题          | `h1` + `font-bold`        | 一级页面标题    |
| 区块标题          | `h2` + `font-semibold`    | Section heading |
| 卡片/列表标题     | `h3` + `font-semibold`    | 卡片标题        |
| 正文内容          | `body` + `font-normal`    | 段落文字        |
| 按钮/标签         | `body-sm` + `font-medium` | 按钮文字        |
| 辅助信息          | `caption` + `font-normal` | 时间戳、脚注    |

### 代码示例

```tsx
// Hero 大标题
<h1 className="text-display font-bold leading-tight tracking-tight">

// 卡片标题
<h3 className="text-h3 font-semibold leading-snug">

// 正文
<p className="text-body leading-normal text-muted-foreground">

// 按钮
<button className="text-body-sm font-medium">
```

> **Tip**: 这些快捷类通过 Tailwind v4 `@utility` 指令定义在 `globals.css` 中，
> 每个类仅设置 `font-size`（或 `line-height`），可自由与其他类组合。

---

## 3. 间距 / Spacing

保持 Tailwind 原生 scale，按场景约定使用级别：

| 场景            | Mobile | Desktop | Class            |
| --------------- | ------ | ------- | ---------------- |
| 图标与文字      | 8px    | 8px     | `gap-2`          |
| 卡片内小间距    | 12px   | 12px    | `gap-3`, `p-3`   |
| 按钮/列表内边距 | 16px   | 16px    | `p-4`            |
| 卡片内边距      | 16px   | 24px    | `p-4 lg:p-6`     |
| 区块间距        | 24px   | 32px    | `gap-6 lg:gap-8` |
| Section 间距    | 40px   | 64px    | `py-10 lg:py-16` |
| Hero 留白       | 48px   | 80px    | `py-12 lg:py-20` |
| 页面水平边距    | 16px   | 24px    | `px-4 lg:px-6`   |

**禁止**：不允许使用非标准间距值（如 `p-[13px]`、`mt-[22px]`）。

---

## 4. 圆角 / Border Radius

| Token          | 值     | 用途              |
| -------------- | ------ | ----------------- |
| `rounded-sm`   | ~6px   | Tag, Badge        |
| `rounded-md`   | ~8px   | Button, Input     |
| `rounded-lg`   | 10px   | Card, Dialog      |
| `rounded-xl`   | 14px   | 搜索框, Hero 元素 |
| `rounded-full` | 9999px | Avatar, Spinner   |

---

## 5. 组件尺寸 / Component Sizes

| Token        | CSS 变量              | 值   | Tailwind Class | 适用上下文                                    |
| ------------ | --------------------- | ---- | -------------- | --------------------------------------------- |
| Icon SM      | `--size-icon-sm`      | 16px | `size-icon-sm` | 通用                                          |
| Icon         | `--size-icon`         | 20px | `size-icon`    | 通用                                          |
| Icon LG      | `--size-icon-lg`      | 24px | `size-icon-lg` | 通用                                          |
| Button SM    | `--size-button-sm`    | 32px | `h-button-sm`  | [Caution] 桌面紧凑 UI 专用，手机端禁用        |
| Button       | `--size-button`       | 40px | `h-button`     | [Caution] 桌面通用，手机端需配 `lg:` 前缀使用 |
| Button LG    | `--size-button-lg`    | 48px | `h-button-lg`  | [OK] 通用，满足所有设备触控要求               |
| Input        | `--size-input`        | 56px | `h-input`      | [OK] 通用                                     |
| Touch Target | `--size-touch-target` | 44px | —              | 最小可触摸区域（Apple HIG）                   |
| Spinner      | `--size-spinner`      | 40px | `size-spinner` | 通用                                          |

> **[Caution] 规则**：所有可点击元素在手机端不得小于 `--size-touch-target` (44px)。
> `h-button-sm` 和 `h-button` 低于此阈值，仅适用于桌面紧凑场景（表格行内操作、工具栏等）。
> 默认（Mobile-First）应使用 `h-button-lg`，桌面场景可用 `h-button-lg lg:h-button`。

---

## 6. 容器宽度 / Container Widths

| Token   | CSS 变量             | 值     | 用途         |
| ------- | -------------------- | ------ | ------------ |
| SM      | `--width-content-sm` | 576px  | 错误页, 表单 |
| Default | `--width-content`    | 672px  | 标准内容     |
| LG      | `--width-content-lg` | 896px  | 卡片网格     |
| XL      | `--width-content-xl` | 1152px | 仪表盘       |

```tsx
<div className="mx-auto w-full max-w-content">
```

| Token   | Tailwind Class     |
| ------- | ------------------ |
| SM      | `max-w-content-sm` |
| Default | `max-w-content`    |
| LG      | `max-w-content-lg` |
| XL      | `max-w-content-xl` |

---

## 7. 响应式组件模式 / Responsive Component Patterns

| 组件     | 手机 (< 768px)      | 平板 (≥ 768px) | 桌面 (≥ 1024px) |
| -------- | ------------------- | -------------- | --------------- |
| 导航     | 汉堡菜单 / 底部 Tab | 折叠侧栏       | 完整导航        |
| 对话框   | 底部 Drawer         | 居中 Dialog    | 居中 Dialog     |
| 卡片网格 | 1 列                | 2 列           | 3 列            |
| 表格     | Card 模式           | 完整表格       | 完整表格        |
| 搜索框   | 全宽                | 全宽           | 最大宽度约束    |
| 按钮     | 全宽                | 自适应         | 固定宽度        |

---

## 8. 颜色 / Colors

沿用 `globals.css` 中 shadcn/ui Nova 主题定义的语义颜色变量（oklch 色彩空间，支持 light/dark mode）。

**禁止**：不允许硬编码颜色值（如 `text-[#333]`、`bg-[rgb(0,0,0)]`）。

所有颜色必须使用语义 Token：`text-foreground`、`bg-primary`、`text-muted-foreground` 等。
