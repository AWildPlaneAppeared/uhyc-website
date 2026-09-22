/* =============================================================
   Org chart engine
   -------------------------------------------------------------
   render(host, yearData, boardName) builds the cards from data,
   then routes SVG connectors between measured anchor points:

     Local Board  <-- exec block reports up
        |
     [ Executives ]
        |  trunk
     ---+-----+-----+---  bus (rounded elbows down to each lead)
        |     |     |
      lead  lead  lead
        |     |     |     spine runs down a gutter on the left of
       -+ m  -+ m  -+ m   each group, with a tick into every member
       -+ m  -+ m

   Everything is re-routed whenever the chart's size changes
   (fonts loading, avatars loading, viewport resize, year switch),
   so the lines always snap to the cards, at any breakpoint.

   Animation: ONE pulse. It leaves the Local Board, passes through
   the executives, splits down every branch and spine at a constant
   speed until the last member lights up, rests, then loops. Each
   path knows its distance from the source, so the timing is exact.
   ============================================================= */
window.UHYCOrg = (function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = (name) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  /* ---------- cards ---------- */
  let PHOTOS = {};
  function person(p, kind) {
    const c = el("div", `card ${kind}`);
    let photo = p.photo || PHOTOS[String(p.name).toLowerCase()];
    if (photo) {
      // A photo can be a path, or { src, zoom, x, y } to zoom and shift it inside the circle
      if (typeof photo === "string") photo = { src: photo };
      const wrap = el("span", "avatar photo");
      const img = el("img");
      img.src = photo.src; img.alt = ""; img.loading = "lazy";
      if (photo.zoom || photo.x || photo.y) {
        img.style.transform = `scale(${photo.zoom || 1}) translate(${photo.x || 0}%, ${photo.y || 0}%)`;
      }
      img.onerror = () => { wrap.replaceWith(el("span", "avatar", esc(initials(p.name)))); };
      wrap.appendChild(img);
      c.appendChild(wrap);
    } else {
      c.appendChild(el("span", "avatar", esc(initials(p.name))));
    }
    if (p.role) c.appendChild(el("span", "role", esc(p.role)));
    c.appendChild(el("span", "name", esc(p.name)));
    return c;
  }

  function render(host, data, boardName, photos) {
    PHOTOS = photos || {};
    host.replaceChildren();
    const org = el("div", "org");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "org-lines");
    svg.setAttribute("aria-hidden", "true");
    org.appendChild(svg);

    // Local Board bar
    const board = el("div", "org-board");
    board.appendChild(el("span", "role", "Reports to"));
    board.appendChild(el("span", "name", esc(boardName)));
    org.appendChild(board);

    // Executives
    const exec = el("div", "org-exec");
    data.execRows.forEach((row) => {
      const r = el("div", "org-row");
      row.forEach((p) => r.appendChild(person(p, "exec")));
      exec.appendChild(r);
    });
    org.appendChild(exec);

    // Either subgroups, or a flat list of members (older councils)
    const groups = el("div", "org-groups");
    if (!data.groups && data.members) {
      const flat = el("div", "org-members");
      data.members.forEach((m) => flat.appendChild(person(typeof m === "string" ? { name: m } : m, "member")));
      org.appendChild(flat);
    }
    (data.groups || []).forEach((g) => {
      const box = el("div", "group");
      if (g.lead) {
        box.appendChild(person({ ...g.lead, role: g.lead.role || `${g.name} lead` }, "lead"));
      } else {
        box.appendChild(person({ name: g.name, role: g.role || "Project team" }, "lead header"));
      }
      const members = el("div", "members");
      g.members.forEach((m) => members.appendChild(person(typeof m === "string" ? { name: m } : m, "member")));
      box.appendChild(members);
      groups.appendChild(box);
    });
    if (data.groups) org.appendChild(groups);
    host.appendChild(org);

    // Header cards get no avatar
    org.querySelectorAll(".card.header .avatar").forEach((a) => a.remove());

    /* ---------- routing, kept in sync with layout ---------- */
    let timer = 0;
    const route = () => { clearTimeout(timer); timer = setTimeout(() => routeLines(org, svg), 16); };
    const ro = new ResizeObserver(route);
    ro.observe(org);
    org.querySelectorAll(".avatar.photo img").forEach((img) => img.addEventListener("load", route));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(route);
    routeLines(org, svg);

    return { org, route, destroy() { ro.disconnect(); clearTimeout(timer); } };
  }

  /* ---------- geometry ---------- */
  function routeLines(org, svg) {
    const base = org.getBoundingClientRect();
    const W = org.clientWidth, H = org.clientHeight;
    if (!W || !H) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren();

    const R = (node) => {
      const r = node.getBoundingClientRect();
      return { l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top,
               w: r.width, h: r.height, cx: r.left - base.left + r.width / 2, cy: r.top - base.top + r.height / 2 };
    };

    const board = org.querySelector(".org-board");
    const exec = org.querySelector(".org-exec");
    const groups = Array.from(org.querySelectorAll(".group"));
    const flat = org.querySelector(".org-members");
    if (!exec) return;
    const E = R(exec);
    const paths = [];   // { d, start }  start = distance from the source, in px
    const dots = [];    // [x, y]
    const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

    // From the Local Board down into the exec block
    let d0 = 0;
    if (board) {
      const B = R(board);
      paths.push({ d: poly([[E.cx, B.b], [E.cx, E.t]]), start: 0 });
      d0 = E.t - B.b;
    }
    d0 += E.h;                      // the pulse crosses the exec block
    const holds = [{ el: exec, at: d0 - E.h, len: E.h }];

    // Flat member list: one trunk down to the members block
    if (flat) {
      const F = R(flat);
      paths.push({ d: poly([[E.cx, E.b], [E.cx, F.t]]), start: d0 });
      draw(svg, paths, dots, holds);
      return;
    }
    if (!groups.length) { draw(svg, paths, dots, holds); return; }

    // Trunk from the exec block, then either:
    //   side-by-side groups: a horizontal bus with rounded branches down to each lead
    //   stacked groups (narrow screens): a rail down the left with a tick into each lead
    const anchors = groups.map((g) => R(g.querySelector(".card.lead")));
    const stacked = anchors.length > 1 &&
      anchors.every((a) => Math.abs(a.cx - anchors[0].cx) < 4) &&
      anchors.some((a, i) => i > 0 && a.t > anchors[i - 1].t + 10);
    const minTop = Math.min(...anchors.map((a) => a.t));
    const busY = E.b + (minTop - E.b) * 0.5;
    paths.push({ d: poly([[E.cx, E.b], [E.cx, busY]]), start: d0 });
    const dBus = d0 + (busY - E.b);
    const leadStart = [];          // distance at which the pulse reaches each lead's card
    if (!stacked) {
      anchors.forEach((a) => {
        paths.push({ d: poly([[E.cx, busY], [a.cx, busY], [a.cx, a.t]], 16), start: dBus });
        leadStart.push(dBus + Math.abs(a.cx - E.cx) + (a.t - busY));
        if (Math.abs(a.cx - E.cx) > 2) dots.push([a.cx, busY]);
      });
      dots.push([E.cx, busY]);
    } else {
      const G = R(org.querySelector(".org-groups"));
      const railX = Math.max(4, G.l + 6);
      const last = anchors[anchors.length - 1];
      paths.push({ d: poly([[E.cx, busY], [railX, busY], [railX, last.cy]], 16), start: dBus });
      anchors.forEach((a, i) => {
        const at = dBus + (E.cx - railX) + (a.cy - busY);
        paths.push({ d: poly([[railX, a.cy], [a.l, a.cy]]), start: at });
        leadStart.push(at + (a.l - railX));
        if (i < anchors.length - 1) dots.push([railX, a.cy]);
      });
    }

    // Spines: lead -> stem -> gutter on the left of the members -> tick into each member
    groups.forEach((g, gi) => {
      const a = anchors[gi];
      const members = Array.from(g.querySelectorAll(".card.member")).map(R);
      holds.push({ el: g.querySelector(".card.lead"), at: leadStart[gi], len: a.h });
      if (!members.length) return;
      const left = Math.min(...members.map((m) => m.l));
      const gutterX = left - 15;
      const stemY = a.b + (members[0].t - a.b) * 0.5;
      const last = members[members.length - 1];
      const s0 = leadStart[gi] + a.h;                    // out of the bottom of the lead card
      paths.push({ d: poly([[a.cx, a.b], [a.cx, stemY], [gutterX, stemY], [gutterX, last.cy]], 14), start: s0 });
      members.forEach((m, mi) => {
        const at = s0 + (stemY - a.b) + (a.cx - gutterX) + (m.cy - stemY);
        paths.push({ d: poly([[gutterX, m.cy], [m.l, m.cy]]), start: at });
        holds.push({ el: g.querySelectorAll(".card.member")[mi], at: at + (m.l - gutterX), len: m.w * 0.6 });
      });
    });

    draw(svg, paths, dots, holds);
  }

  // Draw: static base lines + junction dots, then one pulse that travels the
  // whole tree at a constant speed. Each path animates its dash offset only
  // during its own window of the shared cycle, so everything loops in sync.
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = REDUCED ? 260 : 760;   // px per second
  const DASH = 44;                      // pulse length, px
  const PAUSE = REDUCED ? 3 : 1.6;      // rest between loops, s
  function draw(svg, paths, dots, holds) {
    const comets = [];
    paths.forEach((p) => {
      if (!p.d) return;
      svg.appendChild(mk(p.d, "ln-base"));
      const glow = mk(p.d, "ln-glow"), core = mk(p.d, "ln-core");
      svg.appendChild(glow); svg.appendChild(core);
      const L = core.getTotalLength();
      [glow, core].forEach((n) => { n.style.strokeDasharray = `${DASH} ${L + DASH}`; n.style.strokeDashoffset = DASH; });
      comets.push({ els: [glow, core], L, start: p.start });
    });
    let end = 0;
    comets.forEach((c) => { end = Math.max(end, c.start + c.L + DASH); });
    (holds || []).forEach((h) => { end = Math.max(end, h.at + h.len); });
    const cycle = end / SPEED + PAUSE;                 // seconds
    const ms = cycle * 1000;
    const at = (px) => Math.min(1, Math.max(0, px / SPEED / cycle));
    comets.forEach((c) => {
      const t0 = at(c.start), t1 = at(c.start + c.L + DASH);
      c.els.forEach((n) => n.animate(
        [{ strokeDashoffset: DASH, offset: 0 }, { strokeDashoffset: DASH, offset: t0 },
         { strokeDashoffset: -c.L, offset: t1 }, { strokeDashoffset: -c.L, offset: 1 }],
        { duration: ms, iterations: Infinity, easing: "linear" }));
    });
    // Cards light up briefly as the pulse passes through them
    (holds || []).forEach((h) => {
      if (!h.el) return;
      const t0 = at(h.at), t1 = at(h.at + h.len), t2 = at(h.at + h.len + 320);
      h.el.animate(
        [{ boxShadow: "0 0 0 0 rgba(56,214,255,0)", borderColor: "", offset: 0 },
         { boxShadow: "0 0 0 0 rgba(56,214,255,0)", offset: t0 },
         { boxShadow: "0 0 0 1px rgba(120,225,255,0.9), 0 0 28px rgba(56,214,255,0.45)", offset: t1 },
         { boxShadow: "0 0 0 0 rgba(56,214,255,0)", offset: t2 },
         { boxShadow: "0 0 0 0 rgba(56,214,255,0)", offset: 1 }],
        { duration: ms, iterations: Infinity, easing: "linear" });
    });
    dots.forEach(([x, y]) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 2.6);
      c.setAttribute("class", "ln-dot");
      svg.appendChild(c);
    });
  }

  function mk(d, cls) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    return p;
  }

  // Polyline with rounded corners: each interior vertex becomes a quadratic
  // curve of radius r (clamped to half the adjoining segment lengths).
  function poly(pts, r = 0) {
    const P = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.5);
    const f = (n) => Math.round(n * 100) / 100;
    if (P.length < 2) return "";
    let d = `M ${f(P[0][0])} ${f(P[0][1])}`;
    for (let i = 1; i < P.length - 1; i++) {
      const [px, py] = P[i - 1], [cx, cy] = P[i], [nx, ny] = P[i + 1];
      const d1 = Math.hypot(cx - px, cy - py), d2 = Math.hypot(nx - cx, ny - cy);
      const rr = Math.min(r, d1 / 2, d2 / 2);
      if (rr < 0.5) { d += ` L ${f(cx)} ${f(cy)}`; continue; }
      const ax = cx - ((cx - px) / d1) * rr, ay = cy - ((cy - py) / d1) * rr;
      const bx = cx + ((nx - cx) / d2) * rr, by = cy + ((ny - cy) / d2) * rr;
      d += ` L ${f(ax)} ${f(ay)} Q ${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`;
    }
    const [lx, ly] = P[P.length - 1];
    return d + ` L ${f(lx)} ${f(ly)}`;
  }

  return { render };
})();
