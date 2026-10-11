/* Small, dependency-free site interactions. Search code is loaded only when requested. */
(() => {
  const dialog = document.getElementById("site-search-dialog");
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("site-search-results");
  if (!dialog || !input || !results) return;

  let pagefindLoading;
  let searchSequence = 0;

  const openSearch = async () => {
    if (!dialog.open) dialog.showModal();
    window.setTimeout(() => input.focus(), 20);
    if (!pagefindLoading) {
      pagefindLoading = import("/pagefind/pagefind.js").then((module) => {
        window.pagefind = module.default || module;
        return window.pagefind;
      }).catch(() => {
        results.textContent = "Search index is not available yet. You can still browse the site.";
        return null;
      });
    }
    await pagefindLoading;
    if (window.pagefind && input.value.trim()) runSearch();
  };

  const closeSearch = () => dialog.close();
  document.querySelectorAll(".search-open").forEach((button) => button.addEventListener("click", openSearch));
  document.querySelectorAll(".search-close").forEach((button) => button.addEventListener("click", closeSearch));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeSearch();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if ((event.key === "/" && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      openSearch();
    }
  });

  let debounce;
  input.addEventListener("input", () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(runSearch, 100);
  });

  async function runSearch() {
    const query = input.value.trim();
    const sequence = ++searchSequence;
    if (!query) {
      results.textContent = "Start typing to search products, temples, guides and tools.";
      return;
    }
    if (!window.pagefind) {
      results.textContent = "Search index is not ready. Browse the site or try again after the site build completes.";
      return;
    }
    results.setAttribute("aria-busy", "true");
    try {
      const response = await window.pagefind.search(query);
      if (sequence !== searchSequence) return;
      results.replaceChildren();
      if (!response.results.length) {
        results.textContent = "No results found. Try another spelling or a Tamil search term.";
        return;
      }
      const groups = new Map();
      for (const result of response.results.slice(0, 12)) {
        const data = await result.data();
        if (sequence !== searchSequence) return;
        // Use the URL path as a reliable fallback until each template supplies search metadata.
        const path = String(data.url || "").toLowerCase().replace(/^\/(?:en|ta)(?:-[a-z]{2})?\//, "/");
        const section = (data.meta && (data.meta.section || data.meta.type)) || path;
        const group = /product/i.test(section) || path.startsWith("/products/") ? "Products" :
          /temple|pooja|kumbabishegam/i.test(section) || /^\/(temples|poojas|kumbabishegam)\//.test(path) ? "Temples & rituals" :
          /tool|rate/i.test(section) || /^\/(tools|rates|brass-rate)\//.test(path) ? "Tools & rates" : "Guides";
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(data);
      }
      for (const [groupName, items] of groups) {
        const heading = document.createElement("h3");
        heading.className = "search-group-title";
        heading.textContent = groupName;
        results.appendChild(heading);
        for (const item of items) {
          const link = document.createElement("a");
          link.className = "search-result";
          link.href = item.url;
          const title = document.createElement("span");
          title.className = "search-result-title";
          title.textContent = (item.meta && item.meta.title) || item.url;
          const excerpt = document.createElement("span");
          excerpt.className = "search-result-excerpt";
          const parser = new DOMParser();
          excerpt.textContent = parser.parseFromString(item.excerpt || "", "text/html").body.textContent || "";
          link.append(title, excerpt);
          results.appendChild(link);
        }
      }
    } catch (error) {
      results.textContent = "Search could not load. Please try again in a moment.";
    } finally {
      if (sequence === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }
})();
