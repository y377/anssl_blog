/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2025 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * Modified for single toggle button
 */

(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = theme => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }

  const updateThemeIcon = (theme) => {
    const themeIcon = document.querySelector('#theme-icon')
    const themeToggle = document.querySelector('#theme-toggle')
    
    if (themeIcon && themeToggle) {
      if (theme === 'dark') {
        themeIcon.className = 'bi bi-moon-fill'
        themeToggle.setAttribute('aria-label', '切换到浅色模式')
      } else {
        themeIcon.className = 'bi bi-sun-fill text-warning'
        themeToggle.setAttribute('aria-label', '切换到深色模式')
      }
    }
  }

  const toggleTheme = () => {
    const currentTheme = getStoredTheme() || getPreferredTheme()
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    setStoredTheme(newTheme)
    setTheme(newTheme)
    updateThemeIcon(newTheme)
  }

  // 初始化主题
  const initialTheme = getPreferredTheme()
  setTheme(initialTheme)
  updateThemeIcon(initialTheme)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (!storedTheme) {
      const preferredTheme = getPreferredTheme()
      setTheme(preferredTheme)
      updateThemeIcon(preferredTheme)
    }
  })

  // 绑定点击事件
  window.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('#theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme)
    }
  })
})()
