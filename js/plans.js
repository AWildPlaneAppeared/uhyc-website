/* =============================================================
   Local Board plans — in-page PDF viewer (PDF.js, lazy-loaded)
   -------------------------------------------------------------
   The council's own site blocks iframes of its PDFs, so copies
   live in assets/plans/ and are rendered here page by page.
   The library only downloads once the section scrolls into view.
   ============================================================= */
window.UHYCPlans = (function () {
  "use strict";
  const CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/";
  let pdfjs = null, doc = null, current = null, page = 1, rendering = false, queued = null;
  let ui = {};

  async function lib() {
    if (!pdfjs) {
      pdfjs = await import(CDN + "pdf.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = CDN + "pdf.worker.min.mjs";
    }
    return pdfjs;
  }

  function init(docs) {
    ui = {
      tabs: document.getElementById("docTabs"),
      title: document.getElementById("pdfTitle"),
      prev: document.getElementById("pdfPrev"),
      next: document.getElementById("pdfNext"),
      input: document.getElementById("pdfPageInput"),
      count: document.getElementById("pdfPageCount"),
      open: document.getElementById("pdfOpen"),
      download: document.getElementById("pdfDownload"),
      stage: document.getElementById("pdfStage"),
      canvas: document.getElementById("pdfCanvas"),
      loading: document.getElementById("pdfLoading"),
      slider: document.getElementById("pdfSlider"),
      card: document.getElementById("pdfCard"),
    };
    if (!ui.tabs || !ui.canvas) return;

    docs.forEach((d, i) => {
      const b = document.createElement("button");
      b.className = "doc-tab"; b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.innerHTML = `<b>${d.title}</b><span>${d.subtitle || ""}</span>`;
      b.addEventListener("click", () => { select(d, b); });
      ui.tabs.appendChild(b);
    });

    ui.prev.addEventListener("click", () => go(page - 1));
    ui.next.addEventListener("click", () => go(page + 1));
    ui.input.addEventListener("change", () => go(parseInt(ui.input.value, 10) || 1));
    ui.slider.addEventListener("input", () => go(parseInt(ui.slider.value, 10) || 1));
    ui.card.addEventListener("keydown", (e) => {
      if (e.target === ui.input) return;
      if (e.key === "ArrowRight") { go(page + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { go(page - 1); e.preventDefault(); }
    });
    ui.card.tabIndex = 0;

    // Re-render at the new size when the card changes width
    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (doc) show(page, true); }, 120); }).observe(ui.stage);

    // Lazy: load the first document when the section is near the viewport
    const first = docs[0];
    setMeta(first);
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(first); }
    }, { rootMargin: "400px 0px" });
    io.observe(ui.card);
  }

  function setMeta(d) {
    ui.title.textContent = d.title;
    ui.open.href = d.file;
    ui.download.href = d.file;
    ui.download.setAttribute("download", d.file.split("/").pop());
  }

  function select(d, btn) {
    ui.tabs.querySelectorAll(".doc-tab").forEach((b) => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
    setMeta(d);
    load(d);
  }

  async function load(d) {
    if (current === d && doc) return;
    current = d;
    ui.loading.classList.remove("hide");
    ui.count.textContent = "–";
    try {
      const lib_ = await lib();
      const task = lib_.getDocument({ url: d.file });
      const loaded = await task.promise;
      if (current !== d) return;              // user switched while loading
      doc = loaded;
      ui.count.textContent = doc.numPages;
      ui.slider.max = doc.numPages;
      ui.input.max = doc.numPages;
      page = 1;
      await show(1);
      ui.loading.classList.add("hide");
    } catch (err) {
      console.error("PDF failed to load", err);
      ui.loading.innerHTML = `Could not load the document. <a href="${d.file}" target="_blank" rel="noopener">Open it directly</a>.`;
    }
  }

  function go(n) {
    if (!doc) return;
    n = Math.max(1, Math.min(doc.numPages, n));
    if (n === page && !queued) return;
    page = n;
    show(n);
  }

  async function show(n, force) {
    if (!doc) return;
    if (rendering) { queued = n; return; }
    rendering = true;
    ui.stage.classList.add("busy");
    try {
      const p = await doc.getPage(n);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cs = getComputedStyle(ui.stage);
      const fitW = (ui.stage.clientWidth || 600) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const fitH = (ui.stage.clientHeight || 800) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const base = p.getViewport({ scale: 1 });
      const scale = Math.min(fitW / base.width, fitH / base.height) * dpr;   // whole page fits the stage
      const vp = p.getViewport({ scale });
      const canvas = ui.canvas, ctx = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
      canvas.style.width = Math.floor(vp.width / dpr) + "px";
      canvas.style.height = Math.floor(vp.height / dpr) + "px";
      await p.render({ canvasContext: ctx, viewport: vp }).promise;
      ui.input.value = n; ui.slider.value = n;
      ui.prev.disabled = n <= 1; ui.next.disabled = n >= doc.numPages;
    } finally {
      rendering = false;
      ui.stage.classList.remove("busy");
      if (queued !== null) { const q = queued; queued = null; if (q !== n || force) show(q); }
    }
  }

  return { init };
})();
