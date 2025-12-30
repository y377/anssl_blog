## 开始使用

### 1. 安装 Jekyll

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

在`_posts`目录下创建 Markdown 文件，文件名格式为：`YYYY-MM-DD-title.md`

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
