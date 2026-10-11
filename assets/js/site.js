/* Shared, lazily loaded Pagefind search. The HTML remains readable without JavaScript. */
(() => {
  const inputs = [...document.querySelectorAll("[data-pagefind-search-input]")];
  if (!inputs.length) return;

  const disclosure = document.getElementById("site-search-disclosure");
  const headerInput = document.getElementById("site-search-input");
  const homeInput = document.getElementById("home-search-input");
  let pagefindPromise = null;
  const sequences = new WeakMap();
  const debounceTimers = new WeakMap();

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

  function resultTarget(input) {
    const id = input.getAttribute("aria-controls");
    return id ? document.getElementById(id) : null;
  }

  function loadPagefind(results) {
    if (!pagefindPromise) {
      if (results) results.textContent = messages.loading;
      pagefindPromise = import("/pagefind/pagefind.js")
        .then((module) => {
          window.pagefind = module.default || module;
          return window.pagefind;
        })
        .catch(() => {
          if (results) {
            results.textContent = messages.unavailable;
            results.setAttribute("aria-busy", "false");
          }
          return null;
        });
    }
    return pagefindPromise;
  }

  inputs.forEach((input) => {
    const results = resultTarget(input);
    if (!results) return;
    input.addEventListener("focus", async () => {
      await loadPagefind(results);
      if (!input.value.trim()) {
        results.textContent = messages.ready;
        results.setAttribute("aria-busy", "false");
      }
    });
    input.addEventListener("input", () => {
      window.clearTimeout(debounceTimers.get(input));
      debounceTimers.set(input, window.setTimeout(() => search(input, results), 100));
    });
  });

  if (disclosure && headerInput) {
    disclosure.addEventListener("toggle", async () => {
      if (!disclosure.open) return;
      await loadPagefind(resultTarget(headerInput));
      headerInput.focus();
      if (headerInput.value.trim()) search(headerInput, resultTarget(headerInput));
      else {
        const results = resultTarget(headerInput);
        if (results) {
          results.textContent = messages.ready;
          results.setAttribute("aria-busy", "false");
        }
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

    if ((event.key === "/" && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      if (homeInput && homeInput.getClientRects().length) {
        homeInput.focus();
      } else if (disclosure && headerInput) {
        disclosure.open = true;
        headerInput.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      if (disclosure && disclosure.open && disclosure.contains(target)) {
        disclosure.open = false;
        disclosure.querySelector("summary")?.focus();
      } else if (target instanceof HTMLInputElement && target.matches("[data-pagefind-search-input]")) {
        target.value = "";
        const results = resultTarget(target);
        if (results) {
          results.replaceChildren();
          results.textContent = messages.ready;
        }
      }
    }
  });

  async function search(input, results) {
    const query = input.value.trim();
    const sequence = (sequences.get(input) || 0) + 1;
    sequences.set(input, sequence);

    if (!query) {
      results.replaceChildren();
      results.textContent = messages.ready;
      results.setAttribute("aria-busy", "false");
      return;
    }

    results.setAttribute("aria-busy", "true");
    const pagefind = await loadPagefind(results);
    if (sequence !== sequences.get(input)) return;
    if (!pagefind) {
      results.textContent = messages.notReady;
      results.setAttribute("aria-busy", "false");
      return;
    }

    try {
      const response = await pagefind.search(query);
      if (sequence !== sequences.get(input)) return;
      results.replaceChildren();
      if (!response.results.length) {
        results.textContent = messages.noResults;
        return;
      }

      const groups = new Map();
      for (const result of response.results.slice(0, 12)) {
        const data = await result.data();
        if (sequence !== sequences.get(input)) return;
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
      if (sequence === sequences.get(input)) results.setAttribute("aria-busy", "false");
    }
  }
})();
