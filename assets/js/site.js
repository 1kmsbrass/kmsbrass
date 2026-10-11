/* Small, dependency-free site interactions. Search code is loaded only when requested. */
(() => {
  const dialog = document.getElementById("site-search-dialog");
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("site-search-results");
  if (!dialog || !input || !results) return;

  let pagefindLoading;
  let searchSequence = 0;
  const isTamil = (document.documentElement.lang || "").toLowerCase().startsWith("ta");
  const messages = isTamil ? {
    loading: "தேடல் ஏற்றப்படுகிறது…",
    unavailable: "தேடல் பட்டியல் இப்போது கிடைக்கவில்லை. தளத்தைத் தொடர்ந்து உலாவலாம்.",
    ready: "பொருட்கள், கோயில்கள், வழிகாட்டிகள் மற்றும் கருவிகளைத் தேடத் தொடங்குங்கள்.",
    noResults: "முடிவுகள் இல்லை. வேறு எழுத்து அல்லது தமிழ்/ஆங்கிலச் சொல்லை முயற்சிக்கவும்.",
    notReady: "தேடல் பட்டியல் இன்னும் தயாராகவில்லை. தளத்தை உலாவவும் அல்லது கட்டமைப்பு முடிந்தபின் மீண்டும் முயற்சிக்கவும்.",
    failed: "தேடலை ஏற்ற முடியவில்லை. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.",
    products: "பொருட்கள்",
    rituals: "கோயில்கள் மற்றும் சடங்குகள்",
    tools: "கருவிகள் மற்றும் விலைகள்",
    guides: "வழிகாட்டிகள்"
  } : {
    loading: "Loading search…",
    unavailable: "Search index is not available yet. You can still browse the site.",
    ready: "Start typing to search products, temples, guides and tools.",
    noResults: "No results found. Try another spelling or a Tamil search term.",
    notReady: "Search index is not ready. Browse the site or try again after the site build completes.",
    failed: "Search could not load. Please try again in a moment.",
    products: "Products",
    rituals: "Temples & rituals",
    tools: "Tools & rates",
    guides: "Guides"
  };

  const openSearch = async () => {
    if (!dialog.open) dialog.showModal();
    window.setTimeout(() => input.focus(), 20);
    if (!pagefindLoading) {
      pagefindLoading = import("/pagefind/pagefind.js").then((module) => {
        window.pagefind = module.default || module;
        return window.pagefind;
      }).catch(() => {
        results.textContent = messages.unavailable;
        return null;
      });
    }
    await pagefindLoading;
    if (window.pagefind && input.value.trim()) {
      runSearch();
    } else if (window.pagefind) {
      results.textContent = messages.ready;
      results.setAttribute("aria-busy", "false");
    }
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
      results.textContent = messages.notReady;
      return;
    }
    results.setAttribute("aria-busy", "true");
    try {
      const response = await window.pagefind.search(query);
      if (sequence !== searchSequence) return;
      results.replaceChildren();
      if (!response.results.length) {
        results.textContent = messages.noResults;
        return;
      }
      const groups = new Map();
      for (const result of response.results.slice(0, 12)) {
        const data = await result.data();
        if (sequence !== searchSequence) return;
        // Use the URL path as a reliable fallback until each template supplies search metadata.
        const path = String(data.url || "").toLowerCase().replace(/^\/(?:en|ta)(?:-[a-z]{2})?\//, "/");
        const section = (data.meta && (data.meta.section || data.meta.type)) || path;
        const group = /product/i.test(section) || path.startsWith("/products/") ? messages.products :
          /temple|pooja|kumbabishegam/i.test(section) || /^\/(temples|poojas|kumbabishegam)\//.test(path) ? messages.rituals :
          /tool|rate/i.test(section) || /^\/(tools|rates|brass-rate)\//.test(path) ? messages.tools : messages.guides;
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
      results.textContent = messages.failed;
    } finally {
      if (sequence === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }
})();
