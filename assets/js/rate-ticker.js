/* Used only on the homepage and rates page. No network calls or trackers. */
(() => {
  const formatINR = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(value);

  document.querySelectorAll(".rate-ticker").forEach((ticker) => {
    const value = Number(ticker.dataset.rateValue);
    const valueNode = ticker.querySelector(".rate-ticker-value");
    const historyNode = ticker.querySelector(".rate-ticker-sparkline");

    // Show the verified value immediately; avoid decorative count-up animation.
    if (ticker.dataset.rateValue && Number.isFinite(value) && valueNode) {
      valueNode.textContent = formatINR(value) + " / kg";
    }

    if (historyNode) {
      let points = [];
      try { points = JSON.parse(ticker.dataset.rateHistory || "[]"); } catch (_) { points = []; }
      points = points.filter((point) => point && point.public === true && Number.isFinite(Number(point.value)));
      if (points.length > 1) {
        const values = points.map((point) => Number(point.value));
        const min = Math.min(...values), max = Math.max(...values);
        const span = max - min || 1;
        const coords = values.map((v, i) => {
          const x = 3 + (i * 106 / (values.length - 1));
          const y = 25 - ((v - min) / span) * 20;
          return [x, y];
        });
        const path = coords.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
        historyNode.innerHTML = '<path class="ticker-sparkline-path" d="' + path + '"></path><circle class="ticker-sparkline-dot" cx="' + coords[coords.length - 1][0] + '" cy="' + coords[coords.length - 1][1] + '" r="2.4"></circle>';
      }
    }
  });

  // Draw the larger history chart on the rates page from the same public-only history data.
  const chart = document.querySelector("[data-history-chart] svg");
  const historySource = document.querySelector(".rate-ticker");
  if (chart && historySource) {
    let history = [];
    try { history = JSON.parse(historySource.dataset.rateHistory || "[]"); } catch (_) { history = []; }
    history = history.filter((point) => point && point.public === true && Number.isFinite(Number(point.value)));
    if (history.length > 1) {
      const values = history.map((point) => Number(point.value));
      const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
      const coords = values.map((value, index) => [
        12 + index * (456 / (values.length - 1)),
        88 - ((value - min) / span) * 66
      ]);
      const path = coords.map(([x, y], index) => (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
      const last = coords[coords.length - 1];
      chart.innerHTML = '<path d="M1 95 H479" class="chart-baseline"></path>' +
        '<path d="' + path + '" class="history-line"></path>' +
        '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="4" class="history-dot"></circle>';
    }
  }
})();
