/* =============================================================
   Upper Harbour Youth Council — page behaviour
   ============================================================= */
(function () {
  "use strict";
  const D = window.UHYC;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    nav();
    hero();
    about();
    timeline();
    team();
    events();
    plans();
    contact();
    reveal();
  });

  /* ---------- NAV: menu, active link, light/dark adaptation ---------- */
  function nav() {
    const bar = $("#nav"), links = $("#navLinks"), toggle = $("#navToggle");
    toggle.addEventListener("click", () => {
      const open = bar.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", links).forEach((a) => a.addEventListener("click", () => {
      bar.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false");
    }));

    // Active section
    const map = {};
    $$("a[href^='#']", links).forEach((a) => { map[a.getAttribute("href").slice(1)] = a; });
    const secs = Object.keys(map).map((id) => document.getElementById(id)).filter(Boolean);
    const active = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$("a", links).forEach((a) => a.classList.remove("active"));
        const a = map[e.target.id]; if (a && !a.classList.contains("nav-cta")) a.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => active.observe(s));

    // Frosted bar turns dark while a dark section sits directly under its bottom edge
    const darks = $$("[data-theme='dark']");
    let ticking = false;
    const sample = () => {
      ticking = false;
      const y = bar.offsetHeight + 1;
      bar.classList.toggle("on-dark", darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(sample); } };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    sample();
  }

  /* ---------- HERO parallax ---------- */
  function hero() {
    if (reduced) return;
    const media = $("#heroMedia"), sec = $("#hero");
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < sec.offsetHeight) media.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ---------- ABOUT: chips + counters ---------- */
  function about() {
    const ul = $("#suburbChips");
    D.about.suburbs.forEach((s) => { const li = document.createElement("li"); li.textContent = s; ul.appendChild(li); });

    const stats = $$(".stat-num[data-count]");
    const run = (elm) => {
      if (elm.hasAttribute("data-static")) return;
      const target = +elm.dataset.count, suffix = elm.dataset.suffix || "";
      if (reduced) { elm.textContent = target + suffix; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        elm.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    stats.forEach((s) => io.observe(s));
  }

  /* ---------- HISTORY timeline ---------- */
  function timeline() {
    const track = $("#tlTrack"), prev = $("#tlPrev"), next = $("#tlNext"), bar = $("#tlProgress");
    D.history.forEach((m) => {
      const card = document.createElement("article");
      card.className = "tl-card" + (m.photo ? " has-photo" : "");
      card.innerHTML = (m.photo ? `<img src="${esc(m.photo)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/photo.svg'" />` : "") +
        `<div class="tl-year">${esc(m.year)}</div><div class="tl-title">${esc(m.title)}</div><p class="tl-text">${esc(m.text)}</p>`;
      track.appendChild(card);
    });
    const step = () => (track.querySelector(".tl-card")?.offsetWidth || 360) + 20;
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const w = Math.max(0.12, track.clientWidth / track.scrollWidth);
      bar.style.width = (w * 100) + "%";
      bar.style.transform = `translateX(${(p * (1 - w) / w) * 100}%)`;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* ---------- TEAM: current council + previous councils dropdown ---------- */
  function team() {
    window.UHYCOrg.render($("#orgHost"), D.team.current, D.team.board, D.team.photos);

    const select = $("#prevSelect"), archive = $("#orgArchive"), host = $("#orgArchiveHost"), title = $("#archiveTitle");
    let chart = null;
    D.team.previous.forEach((c) => {
      const o = document.createElement("option");
      o.value = c.year; o.textContent = c.year + " council";
      select.appendChild(o);
    });
    const close = () => {
      if (chart) { chart.destroy(); chart = null; }
      host.replaceChildren();
      archive.hidden = true;
      select.value = "";
    };
    select.addEventListener("change", () => {
      const c = D.team.previous.find((x) => x.year === select.value);
      if (!c) { close(); return; }
      if (chart) chart.destroy();
      title.textContent = `The ${c.year} council`;
      archive.hidden = false;
      chart = window.UHYCOrg.render(host, c, D.team.board, D.team.photos);
      archive.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
    $("#archiveClose").addEventListener("click", () => {
      close();
      $("#team").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------- EVENTS: upcoming + recent, split by date ---------- */
  const PLACEHOLDER = "assets/photo.svg";
  const photoTag = (src, cls) => { const u = esc(src || PLACEHOLDER); const fb = `onerror="this.onerror=null;this.src='${PLACEHOLDER}'"`;
    return `<div class="media ${cls || ""}"><img class="bg" src="${u}" alt="" aria-hidden="true" loading="lazy" ${fb} /><img class="fg" src="${u}" alt="" loading="lazy" ${fb} /></div>`; };
  function events() {
    $("#focusAreas").textContent = D.about.focusAreas.map((f) => f.toLowerCase()).join(", ");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isPast = (ev) => ev.date && new Date(ev.date + "T23:59:59") < today;
    const upcoming = D.events.filter((e) => !isPast(e)).sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));   // undated last
    const recent = D.events.filter(isPast).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const up = $("#upcomingEvents");
    upcoming.forEach((ev, i) => {
      const a = document.createElement("article");
      a.className = "up-card" + (i === 0 ? " featured" : "");
      const dt = ev.date ? new Date(ev.date + "T12:00:00") : null;
      const day = !dt ? "Soon" : (ev.dateTbc ? "TBC" : dt.toLocaleDateString("en-NZ", { day: "numeric" }));
      const mon = dt ? dt.toLocaleDateString("en-NZ", { month: "short" }) : "";
      a.innerHTML = `${photoTag(ev.photo, "up-photo")}<div class="up-body">
          <div class="up-date"><b class="${(ev.dateTbc || !dt) ? "tbc" : ""}">${esc(day)}</b>${mon ? `<span>${esc(mon)}</span>` : ""}</div>
          <div class="up-text"><h4>${esc(ev.title)}</h4><p class="up-when">${esc(ev.when || "")}${ev.where ? " · " + esc(ev.where) : ""}</p><p>${esc(ev.text)}</p></div>
        </div>`;
      up.appendChild(a);
    });
    if (!upcoming.length) up.innerHTML = `<p class="muted">Nothing scheduled right now. Check the calendar below or follow us on Instagram for announcements.</p>`;

    const grid = $("#recentEvents");
    recent.forEach((ev) => {
      const a = document.createElement("article");
      a.className = "event-card";
      a.innerHTML = `${photoTag(ev.photo)}<div class="body"><span class="when">${esc(ev.when)}</span><h4>${esc(ev.title)}</h4><p>${esc(ev.text)}</p></div>`;
      grid.appendChild(a);
    });
    const id = D.links.calendarId, enc = encodeURIComponent(id);
    $("#calFrame").src = `https://calendar.google.com/calendar/embed?src=${enc}&ctz=Pacific%2FAuckland&mode=AGENDA&showTitle=0&showPrint=0&showCalendars=0&showTz=0&bgcolor=%23ffffff`;
    $("#calSubscribe").href = `https://calendar.google.com/calendar/u/0?cid=${btoa(id)}`;
    $("#calIcs").href = `https://calendar.google.com/calendar/ical/${enc}/public/basic.ics`;
  }

  /* ---------- PLANS ---------- */
  function plans() {
    const ol = $("#outcomes");
    D.planOutcomes.forEach((o) => {
      const li = document.createElement("li");
      li.innerHTML = `<div><b>${esc(o.name)}</b><span>${esc(o.text)}</span></div>`;
      ol.appendChild(li);
    });
    $("#lbLink").href = D.links.localBoard;
    window.UHYCPlans.init(D.documents);
  }

  /* ---------- CONTACT: form + socials ---------- */
  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 8l9 6 9-6"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 0 0z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4a5 5 0 0 0 5 5"/></svg>',
  };
  function contact() {
    const list = $("#socialList");
    D.links.socials.forEach((s) => {
      const a = document.createElement("a");
      a.className = "social-card"; a.href = s.href;
      if (!s.href.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener"; }
      a.classList.add("net-" + (s.icon || "link"));
      const face = s.avatar
        ? `<span class="social-avatar"><img src="${esc(s.avatar)}" alt="" onerror="this.parentNode.classList.add('none')" /><i class="badge">${ICONS[s.icon] || ICONS.mail}</i></span>`
        : `<span class="social-icon">${ICONS[s.icon] || ICONS.mail}</span>`;
      a.innerHTML = `${face}<div><b>${esc(s.name)}</b><span>${esc(s.handle)}</span></div>`;
      list.appendChild(a);
    });

    const form = $("#contactForm"), status = $("#formStatus");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      if (D.links.formEndpoint) {
        status.textContent = "Sending…";
        try {
          const res = await fetch(D.links.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.statusText);
          status.textContent = "Thanks, we will be in touch.";
          form.reset();
        } catch (err) {
          status.textContent = "Something went wrong. Please email us directly.";
        }
      } else {
        // No endpoint configured yet: hand the message to the visitor's email app.
        const subject = encodeURIComponent(data.subject || "Message from the UHYC website");
        const body = encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`);
        window.location.href = `mailto:${D.links.email}?subject=${subject}&body=${body}`;
        status.textContent = "Opening your email app…";
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveal() {
    const els = $$(".reveal");
    if (reduced) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el, i) => { el.style.transitionDelay = ((i % 4) * 0.06) + "s"; io.observe(el); });
  }
})();
