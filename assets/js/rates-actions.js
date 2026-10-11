/* Rates-page only: copies and shares published figures without making up missing data. */
(() => {
  const cards = [...document.querySelectorAll("[data-rate-card]")];
  const status = document.querySelector(".copy-status");
  const copyButton = document.querySelector("[data-copy-rates]");
  const shareButton = document.querySelector("[data-share-rates]");
  if (!cards.length) return;

  const isTamil = (document.documentElement.lang || "").toLowerCase().startsWith("ta");
  const copiedMessage = isTamil ? "விலைகள் நகலெடுக்கப்பட்டன." : "Rates copied.";
  const copyFailedMessage = isTamil ? "இந்த உலாவியில் நகலெடுக்க முடியவில்லை." : "Copy not available in this browser.";
  const getText = () => {
    const rows = cards.map((card) => {
      const label = card.dataset.label || (isTamil ? "குறிப்பு விலை" : "Reference rate");
      const value = card.dataset.value
        ? "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(card.dataset.value)) + " " + (card.dataset.unit || "")
        : (isTamil ? "வெளியிடப்படவில்லை — இன்றைய விலைக்கு KMS-ஐ தொடர்பு கொள்ளவும்" : "Not published — contact KMS for today's quote");
      const updated = card.dataset.updated ? (isTamil ? " (புதுப்பிப்பு " : " (updated ") + card.dataset.updated + ")" : "";
      return label + ": " + value + updated;
    });
    const title = isTamil ? "கும்பகோணம் மெட்டல் ஸ்டோர்ஸ் — பொது குறிப்பு விலைகள்" : "Kumbakonam Metal Stores — public reference rates";
    const note = isTamil ? "குறிப்பு விலைகள் மட்டுமே. சரியான விலைக்கு தொடர்பு கொள்ளவும். மொத்த ஆர்டர்களுக்கு முன்பணம் தேவை." : "Indicative only. Call for exact quote. Wholesale orders require advance payment.";
    return [title, ...rows, note, window.location.href].join("\n");
  };

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getText());
      if (status) status.textContent = copiedMessage;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = getText();
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (status) status.textContent = copied ? copiedMessage : copyFailedMessage;
    }
  });

  shareButton?.addEventListener("click", () => {
    const message = getText();
    window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  });
})();
