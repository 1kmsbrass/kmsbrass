(() => {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  if (params.get("kms-preview") !== "1") return;

  const main = document.getElementById("main-content");
  if (!main) return;

  document.body.classList.add("kms-preview-mode");
  const robots = document.querySelector('meta[name="robots"]');
  if (robots) robots.setAttribute("content", "noindex,nofollow");
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", window.location.origin + window.location.pathname);

  const wa = (message) => "https://wa.me/919894053337?text=" + encodeURIComponent(message);
  const products = [
    {
      name: "Tamil Nadu Kuthu Vilakku", tamil: "குத்துவிளக்கு", category: "Lamps",
      description: "Traditional standing oil lamps for homes, pooja spaces, temples and ceremonial requirements.",
      note: "Multiple designs and size options. Confirm height, weight and finish for the selected model.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brass_Kuthuvillakku-1-tirunelveli-India.jpg",
      alt: "Traditional South Indian brass standing oil lamp",
      credit: "Yercaud-elango · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Brass_Kuthuvillakku-1-tirunelveli-India.jpg",
      group: "Lamps"
    },
    {
      name: "Kamakshi Vilakku", tamil: "காமாட்சி விளக்கு", category: "Lamps",
      description: "A familiar pooja lamp form for daily worship, festive gifting and devotional stores.",
      note: "Illustrative lamp photograph. Ask us to confirm the exact design, size and weight.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brass_Kuthuvillakku-2-tirunelveli-India.jpg",
      alt: "Traditional brass oil lamp photographed upright",
      credit: "Yercaud-elango · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Brass_Kuthuvillakku-2-tirunelveli-India.jpg",
      group: "Lamps"
    },
    {
      name: "Brass Pooja Plate", tamil: "பூஜைத் தட்டு", category: "Pooja",
      description: "Pooja plates and ritual arrangements for worship, gifting and specialist pooja retailers.",
      note: "Image shows a ceremonial thali; set contents and plate dimensions vary by model.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pooja_thali.jpg",
      alt: "Brass pooja thali used for Hindu worship",
      credit: "Abhishek raj kalla · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Pooja_thali.jpg",
      group: "Pooja"
    },
    {
      name: "Temple Bell", tamil: "கோவில் மணி", category: "Temple",
      description: "Brass and bell-metal bell options for temples, pooja shops and institutional requirements.",
      note: "Illustrative temple bell photograph. Confirm metal, dimensions and quantity before ordering.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bronze_Temple_Bell.jpg",
      alt: "Traditional temple bell in bronze",
      credit: "பிரயாணி · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Bronze_Temple_Bell.jpg",
      group: "Temple"
    },
    {
      name: "Brass Kodam & Kalasam", tamil: "குடம் · கலசம்", category: "Vessels",
      description: "Traditional brass vessel forms for pooja, temple functions, ritual use and specialist dealers.",
      note: "Representative brass pot image, not a confirmed KMS model. Ask for current shape and size options.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brass_pot.jpg",
      alt: "Traditional brass water vessel",
      credit: "Gurnoor ghuman · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Brass_pot.jpg",
      group: "Vessels"
    },
    {
      name: "Brass Vessels & Pongal Range", tamil: "பித்தளைப் பாத்திரங்கள்", category: "Festival",
      description: "Traditional vessels for Pongal, seasonal demand, household rituals and festive retail.",
      note: "Representative brass vessel image. Confirm the exact Pongal panai model and capacity.",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brass_vessel_01.jpg",
      alt: "Traditional brass vessel",
      credit: "Wikimedia Commons contributor · CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Brass_vessel_01.jpg",
      group: "Festival"
    }
  ];

  const filters = ["All", "Pooja", "Lamps", "Temple", "Vessels", "Festival"];
  const creditLinks = products.map(p => '<a href="' + p.source + '" target="_blank" rel="noopener noreferrer">' + p.name + ' photo</a> — ' + p.credit).join("<br>");
  const productCards = products.map((p, i) => `
    <article class="kms-demo-card" data-category="${p.group}">
      <a class="kms-demo-photo" href="${p.source}" target="_blank" rel="noopener noreferrer" aria-label="View source photograph for ${p.name}">
        <img src="${p.image}" alt="${p.alt}" loading="lazy" decoding="async">
        <span class="kms-demo-photo-tag">Illustrative image</span>
      </a>
      <div class="kms-demo-card-copy">
        <p class="kms-demo-card-category">${p.category} · ${p.tamil}</p>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="kms-demo-note">${p.note}</p>
        <a class="kms-demo-link" href="${wa("Hello Kumbakonam Metal Stores. Please share wholesale details for " + p.name + ". Quantity: ; City: ; Required date: ")}" target="_blank" rel="noopener noreferrer">Enquire about this item <span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join("");

  main.innerHTML = `
    <div class="kms-demo-bar">
      <span><strong>PREVIEW MODE</strong> · Sample catalogue and illustrative photographs</span>
      <a href="${window.location.origin + window.location.pathname}">Exit preview ×</a>
    </div>
    <div class="kms-demo-site">
      <section class="kms-demo-hero">
        <div class="kms-demo-hero-copy">
          <p class="kms-demo-eyebrow">KUMBakonam METAL STORES · TIRUPPUR, TAMIL NADU</p>
          <h1>Brassware for pooja, temples &amp; tradition.</h1>
          <p class="kms-demo-lede">A wholesale catalogue of traditional South Indian brass articles for retailers, pooja stores, temples and bulk buyers.</p>
          <div class="kms-demo-actions">
            <a class="kms-demo-primary" href="#demo-catalogue">Explore catalogue <span aria-hidden="true">↓</span></a>
            <a class="kms-demo-secondary" href="${wa("Hello Kumbakonam Metal Stores. I would like to discuss a wholesale requirement. Items: ; Quantity: ; City: ; Required date: ")}" target="_blank" rel="noopener noreferrer">Wholesale enquiry ↗</a>
          </div>
          <p class="kms-demo-small">Product selection, variants and dispatch details are confirmed directly before an order.</p>
        </div>
        <div class="kms-demo-hero-image">
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Brass_Kuthuvillakku-1-tirunelveli-India.jpg" alt="Traditional South Indian brass standing lamp" fetchpriority="high">
          <span>Traditional brass lamp · illustrative photograph</span>
        </div>
      </section>
      <section class="kms-demo-trust" aria-label="KMS wholesale focus">
        <div><strong>Wholesale focus</strong><span>For shops &amp; dealers</span></div>
        <div><strong>Temple requirements</strong><span>Ritual &amp; event orders</span></div>
        <div><strong>South Indian range</strong><span>Traditional product forms</span></div>
        <div><strong>Direct enquiry</strong><span>Confirm exact specifications</span></div>
      </section>
      <section class="kms-demo-catalogue" id="demo-catalogue">
        <div class="kms-demo-section-head">
          <div><p class="kms-demo-eyebrow">PRODUCT CATALOGUE</p><h2>Explore our product range</h2></div>
          <p>Browse by category. Ask us for current designs, sizes, weights and wholesale quantities.</p>
        </div>
        <div class="kms-demo-filters" role="group" aria-label="Filter products">
          ${filters.map((f, i) => '<button type="button" class="' + (i === 0 ? 'is-active' : '') + '" data-filter="' + f + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + f + '</button>').join("")}
        </div>
        <div class="kms-demo-grid">${productCards}</div>
        <p class="kms-demo-disclaimer">Preview catalogue only. Photographs are illustrative references and do not represent verified KMS stock, exact finishes or exact product variants. All specifications and availability must be confirmed with KMS.</p>
      </section>
      <section class="kms-demo-bulk">
        <div><p class="kms-demo-eyebrow">FOR BULK BUYERS</p><h2>Planning a store reorder or temple requirement?</h2><p>Send the item list, approximate quantity, destination and required date. We will confirm the suitable variants, quotation and dispatch details.</p></div>
        <a href="${wa("Hello Kumbakonam Metal Stores. I have a bulk requirement. Buyer type: ; Item list: ; Quantity: ; Destination: ; Required date: ")}" target="_blank" rel="noopener noreferrer">Start a wholesale enquiry ↗</a>
      </section>
      <footer class="kms-demo-footer">
        <div><strong>Kumbakonam Metal Stores</strong><p>Brass pooja items · Lamps · Temple articles · Traditional vessels</p><p>9 VOC Street, Anupperpalayam, Tiruppur – 641652, Tamil Nadu</p><p><a href="tel:+919894053337">+91 98940 53337</a> · <a href="${wa("Hello Kumbakonam Metal Stores. I would like a wholesale enquiry.")}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p></div>
        <div class="kms-demo-credits"><strong>Photograph credits &amp; licences</strong><p>Third-party illustrative photographs. Each image links to its source page.</p><small>${creditLinks}</small></div>
      </footer>
    </div>`;

  const filterButtons = [...main.querySelectorAll("[data-filter]")];
  const cards = [...main.querySelectorAll(".kms-demo-card")];
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(b => {
      const active = b === button;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    cards.forEach(card => { card.hidden = filter !== "All" && card.dataset.category !== filter; });
  }));
})();
