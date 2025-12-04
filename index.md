---
layout: default
title: "首页"
---

<!-- <div class="hero-description">
  <div class="content text-center">
    <div class="mb-3">
      <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
    </div>
    <p class="lead mb-0 fw-medium">{{ site.description }}</p>
  </div>
</div> -->

<div class="row px-lg-5">  
{% if site.posts.size > 0 %}
  {% for post in site.posts %}
  <article class="mb-5 pb-4 border-bottom">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <h2 class="h4 fw-bold mb-0">
        <a href="{{ post.url | relative_url }}" class="text-decoration-none text-dark">
          {{ post.title }}
        </a>
      </h2>
      <small class="text-muted">{{ post.date | date: "%Y-%m-%d" }}</small>
    </div>
    {% if post.description %}
    <p class="text-muted mb-3">{{ post.description }}</p>
    {% else %}
    <p class="text-muted mb-3">{{ post.excerpt | strip_html | truncate: 150 }}</p>
    {% endif %}
    <a href="{{ post.url | relative_url }}" class="btn btn-outline-primary btn-sm">
      阅读全文
    </a>
  </article>
  {% endfor %}
  {% else %}
  <div class="text-center py-5">
    <p class="text-muted">暂无文章</p>
  </div>
{% endif %}
</div>