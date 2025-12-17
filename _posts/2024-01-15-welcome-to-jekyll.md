---
title: "欢迎使用Jekyll博客系统"
date: 2024-01-15 10:00:00 +0800
categories: [技术, 博客]
tags: [Jekyll, 博客, 静态网站]
description: "介绍Jekyll静态网站生成器的基本概念和使用方法，帮助新手快速上手。"
---

欢迎来到我的博客！这是一个基于Jekyll构建的现代化博客系统。

## 什么是Jekyll？

Jekyll是一个简单、博客感知的静态网站生成器。它使用Liquid模板语言，支持Markdown、Textile和Liquid标记语言，并且可以运行在GitHub Pages上。

### 主要特点

- **静态网站生成**：将Markdown文件转换为静态HTML
- **模板系统**：使用Liquid模板语言
- **插件支持**：丰富的插件生态系统
- **GitHub集成**：完美支持GitHub Pages

## 开始使用

### 1. 安装Jekyll

```bash
gem install jekyll bundler
```

### 2. 创建新站点

```bash
jekyll new my-blog
cd my-blog
```

### 3. 启动本地服务器

```bash
bundle exec jekyll serve
```

## 项目结构

```
my-blog/
├── _config.yml      # 配置文件
├── _layouts/        # 布局模板
├── _posts/          # 博客文章
├── _sass/           # Sass样式文件
├── assets/          # 静态资源
└── index.md         # 首页
```

## 写作博客文章

在`_posts`目录下创建Markdown文件，文件名格式为：`YYYY-MM-DD-title.md`

```markdown
---
layout: post
title: "文章标题"
date: 2024-01-15 10:00:00 +0800
categories: [分类]
tags: [标签1, 标签2]
---

文章内容...
```

## 自定义主题

你可以通过修改以下文件来自定义博客外观：

- `_layouts/default.html` - 默认布局
- `_layouts/post.html` - 文章布局
- `assets/css/main.scss` - 样式文件

## 部署到GitHub Pages

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支（通常是main）
4. 等待部署完成

## 代码块测试

> CDN

```
<link href="https://cdn.anssl.cn/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.anssl.cn/bootstrap-icons/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.anssl.cn/bootstrap/js/bootstrap.bundle.min.js"></script>
```

## 总结

Jekyll是一个强大而灵活的静态网站生成器，特别适合个人博客和技术文档。通过简单的配置和Markdown写作，你就能拥有一个专业的博客网站。

> **提示**：更多Jekyll使用技巧和高级功能，请关注后续文章！

---

如果你有任何问题或建议，欢迎在评论区留言讨论！
