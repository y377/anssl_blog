document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("table").forEach(table => {
    // 避免重复包裹
    if (table.parentElement.classList.contains("table-responsive")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive";

    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});
