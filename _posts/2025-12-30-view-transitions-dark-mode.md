---
title: "使用View Transitions API实现圆形扩散的暗色主题切换"
date: 2025-12-30 14:30:00 +0800
categories: [前端开发, CSS]
tags: [View Transitions, CSS, JavaScript, 暗色模式, 前端]
description: "详细介绍如何使用View Transitions API实现从按钮位置圆形扩散的暗色主题切换动画效果。"
---

## 前言

在现代 Web 应用中，暗色模式已经成为提升用户体验的重要特性之一。传统的暗色模式切换往往显得生硬，缺乏过渡动画。本文将介绍如何使用 **View Transitions API** 配合 CSS `clip-path` 实现从按钮位置向外圆形扩散的优雅过渡效果。

## 什么是 View Transitions API？

View Transitions API 是浏览器提供的一种原生 API，允许开发者为页面状态变化创建平滑的过渡动画。它最初是为了单页应用（SPA）的页面切换而设计，但同样适用于主题切换等场景。

### 浏览器支持情况

- Chrome 104+
- Edge 104+
- Firefox 正在开发中
- Safari 暂不支持（可以使用 polyfill）

## 核心实现原理

本示例的核心思路是：

1. 使用 CSS 变量记录点击位置坐标
2. 利用 `clip-path` 创建圆形扩散效果
3. 通过 `startViewTransition` API 触发生命周期回调

## 完整代码下载

[`View Transitions API_demo.zip 📥`](https://oss.yzys.cc/anssl-blog/View%20TransitionsAPI_demo.zip "点击下载完整示例代码")

## 技术要点解析

### 1. 圆形扩散动画原理

通过 CSS 变量 `--ripple-x`、`--ripple-y` 和 `--ripple-radius` 动态控制 `clip-path` 的圆形位置和大小：

```css
@keyframes theme-ripple-out {
  from {
    clip-path: circle(0px at var(--ripple-x, 50%) var(--ripple-y, 50%));
  }
  to {
    clip-path: circle(
      var(--ripple-radius, 100vmax) at var(--ripple-x, 50%) var(--ripple-y, 50%)
    );
  }
}
```

### 2. 点击位置计算

JavaScript 中计算按钮中心点作为动画起点：

```javascript
const rect = button.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top + rect.height / 2;
```

### 3. 最大覆盖半径计算

确保圆形能够覆盖整个屏幕：

```javascript
const maxRadius = Math.hypot(
  Math.max(x, window.innerWidth - x),
  Math.max(y, window.innerHeight - y)
);
```

### 4. 降级处理

对于不支持 View Transitions API 的浏览器，直接切换主题：

```javascript
if (document.startViewTransition) {
  // 使用过渡动画
} else {
  // 直接切换
  currentTheme = newTheme;
  applyTheme(currentTheme);
  isAnimating = false;
}
```

## 注意事项

1. **浏览器兼容性**：在不支持 View Transitions API 的浏览器中会降级为直接切换
2. **性能考虑**：动画时长 0.6 秒，不会影响用户体验
3. **可访问性**：通过 `prefers-reduced-motion` 可以进一步优化
4. **本地存储**：主题偏好会保存到 localStorage，下次访问自动应用

## 总结

使用 View Transitions API 配合 CSS clip-path 可以实现非常流畅的主题切换动画效果。这种方案不需要额外的动画库，完全依赖浏览器原生支持，性能优秀且效果自然。随着浏览器支持的不断完善，这种技术将成为 Web 主题切换的标准方案。

> **提示**：在实际项目中，建议添加 `prefers-reduced-motion` 媒体查询，为减少动画偏好的用户提供简化版的过渡效果或直接禁用动画。

---
