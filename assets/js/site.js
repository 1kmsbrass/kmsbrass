/* Site-wide search enhancement. Without JavaScript, all content and contact links remain usable. */
(() => {
  const disclosure = document.getElementById("site-search-disclosure");
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("site-search-results");
  if (!disclosure || !input || !results) return;

  const isTamil = (document.documentElement.lang || "").toLowerCase().startsWith("ta");
  const messages = isTamil ? {
    loading: "தேடல் ஏற்றப்படுகிறது…",
    unavailable: "தேடல் பட்டியல் இப்போது கிடைக்கவில்லை. தளத்தைத் தொடர்ந்து உலாவலாம்.",
    ready: "பொருட்கள், கோயில்கள், வழிகாட்டிகள் மற்றும் கருவிகளைத் தேடத் தொடங்குங்கள்.",
    noResults: "முடிவுகள் இல்லை. வேறு எழுத்து அல்லது தமிழ்/ஆங்கிலச் சொல்லை முயற்சிக்கவும்.",
    notReady: "தேடல் பட்டியல் இன்னும் தயாராகவில்லை. பக்கங்களை நேரடியாக உலாவலாம்.",
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
    notReady: "Search index is not ready. You can browse the pages directly.",
    failed: "Search could not load. Please try again in a moment.",
    products: "Products",
    rituals: "Temples & rituals",
    tools: "Tools & rates",
    guides: "Guides"
  };

  let pagefindPromise = null;
  let searchSequence = 0;
  let debounceTimer;

  function loadPagefind() {
    if (!pagefindPromise) {
      results.textContent = messages.loading;
      pagefindPromise = import("/pagefind/pagefind.js")
        .then((module) => {
          window.pagefind = module.default || module;
          return window.pagefind;
        })
        .catch(() => {
          results.textContent = messages.unavailable;
          results.setAttribute("aria-busy", "false");
          return null;
        });
    }
    return pagefindPromise;
  }

  disclosure.addEventListener("toggle", async () => {
    if (!disclosure.open) return;
    await loadPagefind();
    if (input.value.trim()) runSearch();
    else {
      results.textContent = messages.ready;
      results.setAttribute("aria-busy", "false");
    }
  });

  input.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runSearch, 100);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if ((event.key === "/" && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      disclosure.open = true;
      input.focus();
    } else if (event.key === "Escape" && disclosure.open && target !== input) {
      disclosure.open = false;
      disclosure.querySelector("summary")?.focus();
    } else if (event.key === "Escape" && disclosure.open && target === input) {
      input.value = "";
      results.textContent = messages.ready;
      disclosure.open = false;
      disclosure.querySelector("summary")?.focus();
    }
  });

  async function runSearch() {
    const query = input.value.trim();
    const sequence = ++searchSequence;
    if (!query) {
      results.replaceChildren();
      results.textContent = messages.ready;
      results.setAttribute("aria-busy", "false");
      return;
    }

    const pagefind = await loadPagefind();
    if (sequence !== searchSequence) return;
    if (!pagefind) {
      results.textContent = messages.notReady;
      return;
    }

    results.setAttribute("aria-busy", "true");
    try {
      const response = await pagefind.search(query);
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
    } catch (_) {
      results.textContent = messages.failed;
    } finally {
      if (sequence === searchSequence) results.setAttribute("aria-busy", "false");
    }
  }
})();
