/* Rates-page only: copies and shares published figures without making up missing data. */
(() => {
  const cards = [...document.querySelectorAll("[data-rate-card]")];
  const status = document.querySelector(".copy-status");
  const copyButton = document.querySelector("[data-copy-rates]");
  const shareButton = document.querySelector("[data-share-rates]");
  if (!cards.length) return;

  const getText = () => {
    const rows = cards.map((card) => {
      const label = card.dataset.label || "Reference rate";
      const value = card.dataset.value
        ? "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(card.dataset.value)) + " " + (card.dataset.unit || "")
        : "Not published — contact KMS for today's quote";
      const updated = card.dataset.updated ? " (updated " + card.dataset.updated + ")" : "";
      return label + ": " + value + updated;
    });
    return ["Kumbakonam Metal Stores — public reference rates", ...rows,
      "Indicative only. Call for exact quote. Wholesale orders require advance payment.",
      window.location.href].join("\n");
  };

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getText());
      if (status) status.textContent = "Rates copied.";
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
      if (status) status.textContent = copied ? "Rates copied." : "Copy not available in this browser.";
    }
  });

  shareButton?.addEventListener("click", () => {
    const message = getText();
    window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  });
})();
