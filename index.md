---
layout: default
title: "首页"
---
<div class="container">
    <div class="row px-lg-5 mx-lg-4">
        {%- if site.posts.size > 0 -%}
        {%- for post in site.posts -%}
        <article class="mb-5 pb-4 border-bottom">
            <div class="d-flex justify-content-between align-items-center flex-column flex-xl-row">
                <h4 class="lh-base">{{ post.title }}</h4>
                <small class="text-muted"><i class="bi bi-pencil-square pe-1"></i>{{ post.date | date: "%Y-%m-%d" }}</small>
            </div>
            {%- if post.description -%}
            <p class="text-muted">{{ post.description }}</p>
            {%- else -%}
            <p class="text-muted">{{ post.excerpt | strip_html | truncate: 100 }}</p>
            {%- endif -%}
            <a href="{{ post.url | relative_url }}" class="icon-link icon-link-hover">阅读全文
                <svg xmlns="http://www.w3.org/2000/svg" class="bi" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                </svg>
            </a>
        </article>
        {%- endfor -%}
        {%- else -%}
        <div class="text-center py-5">
            <p class="text-muted">暂无文章</p>
        </div>
        {%- endif -%}
    </div>
    <button id="back-to-top" class="btn btn-link position-fixed bottom-0 end-0 m-3 d-none text-muted" type="button">
        <i class="bi bi-arrow-up-square fs-2"></i>
    </button>
</div>