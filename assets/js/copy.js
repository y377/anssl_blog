// 统一：行号 + 顶部语言 + 复制按钮（与 tool.js 标题复制统一：图标 + tooltip）
(() => {
  "use strict";

  // 本地复制逻辑：优先全局 window.copyToClipboard，再 HTTPS/HTTP 自适应
  const fallbackCopy = async (text) => {
    const isSecure = window.isSecureContext;

    if (isSecure && navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
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
    } finally {
      document.body.removeChild(textarea);
    }

    if (!ok) {
      throw new Error("复制失败");
    }
  };

  const doCopy = (text) => {
    if (typeof window.copyToClipboard === "function") {
      return window.copyToClipboard(text);
    }
    return fallbackCopy(text);
  };

  hljs.addPlugin({
    "after:highlightBlock": ({ block }) => {
      const pre = block.closest("pre");
      if (!pre) return;

      // 避免重复处理
      if (pre.dataset.enhanced === "1") return;
      pre.dataset.enhanced = "1";

      const parent = pre.parentElement;
      if (!parent) return;

      // ===============================
      // 外层容器：代码卡片
      // ===============================
      const wrapper = document.createElement("div");
      wrapper.className =
        "code-block rounded-3 overflow-hidden mb-3 bg-body bg-gradient";

      parent.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // ===============================
      // 顶部：语言 + 复制按钮
      // ===============================
      const header = document.createElement("div");
      header.className =
        "code-header d-flex justify-content-between align-items-center small ps-4 bg-body-secondary";

      const langClass =
        [...block.classList].find((c) => c.startsWith("language-")) ||
        [...pre.classList].find((c) => c.startsWith("language-"));

      const lang = (langClass ? langClass.replace("language-", "") : "text").toUpperCase();

      const langSpan = document.createElement("small");
      langSpan.className = "text-body-secondary";
      langSpan.textContent = lang;

      // 复制按钮：只显示图标，风格与锚点复制统一
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn btn-sm border-0 code-copy-btn";
      copyBtn.setAttribute("data-bs-toggle", "tooltip");
      copyBtn.setAttribute("data-bs-placement", "top");
      copyBtn.setAttribute("data-bs-title", "复制");
      copyBtn.setAttribute("aria-label", "复制");

      const iconEl = document.createElement("i");
      iconEl.className = "bi bi-clipboard";
      copyBtn.appendChild(iconEl);

      header.append(langSpan, copyBtn);
      wrapper.insertBefore(header, pre);

      // ===============================
      // 行号（保持你原来的布局）
      // ===============================
      pre.classList.add("pre-wrapper", "d-flex", "lh-base", "mb-0");

      const lineCount = block.textContent.replace(/\s+$/, "").split(/\r?\n/).length;
      const lineNumbersCode = document.createElement("code");

      const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

      lineNumbersCode.className =
        "hljs border-end border-secondary opacity-50 flex-shrink-0 text-center px-2";
      lineNumbersCode.style.userSelect = "none";
      lineNumbersCode.textContent = lineNumbers;

      pre.insertBefore(lineNumbersCode, block);
      block.classList.add("flex-grow-1");

      // ===============================
      // Tooltip（如果引入了 Bootstrap）
      // ===============================
      let tooltip = null;
      if (window.bootstrap?.Tooltip) {
        tooltip = bootstrap.Tooltip.getOrCreateInstance(copyBtn);
      }

      // ===============================
      // 状态机：idle / success / fail（与锚点复制统一）
      // ===============================
      const setState = (state) => {
        copyBtn.classList.remove("text-secondary", "text-success", "text-danger");

        if (state === "success") {
          iconEl.className = "bi bi-clipboard-check";
          copyBtn.classList.add("text-success");
          tooltip?.setContent({ ".tooltip-inner": "已复制" });
        } else if (state === "fail") {
          iconEl.className = "bi bi-clipboard-x";
          copyBtn.classList.add("text-danger");
          tooltip?.setContent({ ".tooltip-inner": "失败" });
        } else {
          iconEl.className = "bi bi-clipboard";
          copyBtn.classList.add("text-secondary");
          tooltip?.setContent({ ".tooltip-inner": "复制" });
        }
      };

      setState("idle");

      // ===============================
      // 复制按钮点击事件
      // ===============================
      copyBtn.addEventListener("click", async () => {
        const text = block.innerText;

        try {
          await doCopy(text);
          setState("success");
        } catch {
          setState("fail");
        }

        tooltip?.show();
        setTimeout(() => setState("idle"), 1500);
      });
    },
  });

  // highlight.js 生效
  hljs.highlightAll();
})();
