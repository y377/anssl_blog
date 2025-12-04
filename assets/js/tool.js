(() => {
  "use strict";

  // 布局切换（container / container-fluid）
  const BREAKPOINT = 992;
  const STORAGE_KEY = "layoutMode"; // 'wide' | 'normal' | null
  const layoutContainers = document.querySelectorAll(".layout-width");

  const getStoredLayout = () => localStorage.getItem(STORAGE_KEY);
  const setStoredLayout = (mode) => localStorage.setItem(STORAGE_KEY, mode);

  const applyLayoutMode = (mode) => {
    layoutContainers.forEach((el) => {
      if (mode === "wide") {
        el.classList.remove("container");
        el.classList.add("container-fluid");
      } else {
        el.classList.remove("container-fluid");
        el.classList.add("container");
      }
    });
  };

  const applyAutoLayout = () => {
    const isWide = window.innerWidth <= BREAKPOINT;
    applyLayoutMode(isWide ? "wide" : "normal");
  };

  const updateLayout = () => {
    const stored = getStoredLayout();
    if (stored === "wide" || stored === "normal") {
      applyLayoutMode(stored);
    } else {
      applyAutoLayout();
    }
  };

  const initToggleButton = () => {
    const btn = document.querySelector("#layout-toggle");
    const icon = document.querySelector("#layout-icon");
    if (!btn || !icon) return;

    const updateIcon = () => {
      const stored = getStoredLayout();
      if (stored === "wide") {
        icon.className = "bi bi-arrows-angle-contract";
        btn.setAttribute("aria-label", "切换为常规宽度");
      } else {
        icon.className = "bi bi-arrows-fullscreen";
        btn.setAttribute("aria-label", "切换为全屏宽度");
      }
    };

    btn.addEventListener("click", () => {
      const stored = getStoredLayout();
      const newMode = stored === "wide" ? "normal" : "wide";
      setStoredLayout(newMode);
      applyLayoutMode(newMode);
      updateIcon();
    });

    updateIcon();
  };

  window.addEventListener("DOMContentLoaded", () => {
    updateLayout();
    initToggleButton();
  });

  window.addEventListener("resize", () => {
    if (!getStoredLayout()) {
      updateLayout();
    }
  });
})();

// TOC 点击高亮当前目录项
document.addEventListener("DOMContentLoaded", () => {
  const tocRoot = document.getElementById("toc");
  if (!tocRoot) return;

  tocRoot.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    tocRoot.querySelectorAll("li").forEach((li) => {
      li.classList.remove("active");
      li.removeAttribute("aria-current");
    });

    const li = link.closest("li");
    if (li) {
      li.classList.add("active");
      li.setAttribute("aria-current", "true");
    }
  });
});

// 回到顶部 + 手机 TOC 按钮
document.addEventListener("DOMContentLoaded", () => {
  const btnDesktop = document.getElementById("back-to-top");
  const btnMobile = document.getElementById("back-to-top-mobile");
  const showThreshold = 200;

  window.addEventListener("scroll", () => {
    const show = window.scrollY > showThreshold;
    btnDesktop?.classList.toggle("d-none", !show);
    btnMobile?.classList.toggle("d-none", !show);
  });

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  btnDesktop?.addEventListener("click", scrollTop);
  btnMobile?.addEventListener("click", scrollTop);

  const hasTOC = document.querySelector("#toc") !== null;
  const mobileTocBtn = document.getElementById("mobile-toc-btn");
  if (!mobileTocBtn) return;

  mobileTocBtn.classList.toggle("d-none", !hasTOC);
});

// 复制工具：HTTP / HTTPS 自适应
const copyToClipboard = async (text) => {
  const isSecure = window.isSecureContext === true;

  if (isSecure && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  Object.assign(textarea.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
  });

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);

  if (!ok) {
    throw new Error("复制失败");
  }
};

// 让其它脚本（copy.js 等）也能用这一套复制逻辑
if (typeof window !== "undefined" && !window.copyToClipboard) {
  window.copyToClipboard = copyToClipboard;
}

// 正文标题复制链接 + Tooltip（按钮只显示图标，文字放 Tooltip）
document.addEventListener("DOMContentLoaded", () => {
  const headings = document.querySelectorAll(
    ".toc-content h2, .toc-content h3, .toc-content h4"
  );

  headings.forEach((heading) => {
    let id = heading.id;

    const injectedAnchor = heading.querySelector("a.anchor");
    if (!id && injectedAnchor) {
      const href = injectedAnchor.getAttribute("href") || "";
      if (href.startsWith("#")) {
        id = href.slice(1);
        heading.id = id;
      }
    }

    if (!id) return;

    if (injectedAnchor) injectedAnchor.remove();

    heading.classList.add("d-flex", "align-items-center", "gap-2", "flex-wrap");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add(
      "btn",
      "btn-link",
      "btn-sm",
      "p-0",
      "heading-copy-btn"
    );
    btn.setAttribute("data-bs-toggle", "tooltip");
    btn.setAttribute("data-bs-placement", "top");
    btn.setAttribute("data-bs-title", "复制");
    btn.setAttribute("aria-label", "复制");

    const icon = document.createElement("i");
    // 初始不设 class，交给 setState 控制
    btn.appendChild(icon);

    heading.appendChild(btn);

    const tooltip = bootstrap.Tooltip.getOrCreateInstance(btn);

    const setState = (state) => {
      btn.classList.remove("text-secondary", "text-success", "text-danger");

      if (state === "success") {
        icon.className = "bi bi-clipboard-check";
        btn.classList.add("text-success");
        tooltip.setContent({ ".tooltip-inner": "已复制" });
      } else if (state === "fail") {
        icon.className = "bi bi-clipboard-x";
        btn.classList.add("text-danger");
        tooltip.setContent({ ".tooltip-inner": "失败" });
      } else {
        // idle：锚点样式
        icon.className = "bi bi-link-45deg";
        btn.classList.add("text-secondary");
        tooltip.setContent({ ".tooltip-inner": "复制" });
      }
    };

    setState("idle");

    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(
        id
      )}`;

      try {
        await copyToClipboard(url);
        setState("success");
      } catch (err) {
        console.error("复制失败", err);
        setState("fail");
      }

      tooltip.show();
      setTimeout(() => setState("idle"), 1500);
    });
  });
});
