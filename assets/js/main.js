/* =====================================================================
   PERFORIENT — site configuration
   Fill these two values in before going live (see README.md).
   ===================================================================== */
const PERFORIENT_CONFIG = {
  // Your online booking page, e.g. a Calendly / Cal.com / Google Calendar link.
  bookingUrl: "",
  // Form endpoint that emails you submissions, e.g. "https://formspree.io/f/abcdwxyz".
  formEndpoint: "",
};

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";

  /* ---------------- Header / menu ---------------- */
  const header = $(".site-header");
  const toggle = $(".nav__toggle");
  const links = $(".nav__links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------------- Booking links ---------------- */
  $$("[data-booking]").forEach((a) => {
    if (PERFORIENT_CONFIG.bookingUrl) {
      a.href = PERFORIENT_CONFIG.bookingUrl;
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  /* ---------------- Reveal on scroll ---------------- */
  const revealables = $$(".reveal, .route");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }
  const hero = $(".hero");
  if (hero) requestAnimationFrame(() => hero.classList.add("is-ready"));

  /* =====================================================================
     PROCESS DIAGRAM
     A workflow drawn as a schematic. "Current" shows leaks; "Fixed" adds
     redline markups, removes waste steps and shrinks the cycle time.
     ===================================================================== */
  const DIAGRAMS = {
    rd: {
      stations: [
        { label: "DESIGN" },
        { label: "HANDOFF", remove: true, leak: "manual handoff" },
        { label: "REVIEW", auto: true },
        { label: "APPROVAL 1" },
        { label: "APPROVAL 2", remove: true, leak: "redundant approval" },
        { label: "REWORK", remove: true, leak: "rework loop" },
        { label: "RELEASE" },
      ],
      before: "R&D CYCLE ≈ 3 WEEKS",
      after: "3 DAYS  (−85%)",
      ratio: 3 / 21,
    },
    enroll: {
      stations: [
        { label: "APPLICATION" },
        { label: "PAPER FORMS", remove: true, leak: "paper-based step" },
        { label: "DATA ENTRY", auto: true, leak: "manual data entry" },
        { label: "VERIFY" },
        { label: "RE-CHECK", remove: true, leak: "redundant step" },
        { label: "ENROLLED" },
      ],
      before: "60 MIN PER STUDENT",
      after: "20 MIN  (−67%)",
      ratio: 20 / 60,
    },
  };

  function el(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor) {
    const t = el("text", { x, y, class: cls || "", "text-anchor": anchor || "middle" }, parent);
    t.textContent = s;
    return t;
  }

  function buildDiagram(root) {
    const data = DIAGRAMS[root.dataset.diagram];
    const host = $(".diagram__svg-wrap", root);
    if (!data || !host) return null;
    const vertical = window.matchMedia("(max-width: 600px)").matches;
    const n = data.stations.length;
    host.innerHTML = "";

    let W, H, pos, along, mainA, mainB;
    if (!vertical) {
      W = 760; H = 316; const y = 150, pad = 56;
      pos = (i) => ({ x: pad + i * (W - 2 * pad) / (n - 1), y });
      mainA = pad - 40; mainB = W - pad + 40;
      along = (s, c) => ({ x: s, y: y + c });
    } else {
      const top = 104, gap = 82;
      W = 340; H = top + (n - 1) * gap + 56; const x = 112;
      pos = (i) => ({ x, y: top + i * gap });
      mainA = top - 40; mainB = top + (n - 1) * gap + 40;
      along = (s, c) => ({ x: x + c, y: s });
    }
    const geoW = W;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-labelledby": root.id + "-title" }, host);
    const title = el("title", { id: root.id + "-title" }, svg);
    title.textContent = `Process diagram. Before: ${data.before}. Steps removed by the fix: ${data.stations.filter(s => s.remove).map(s => s.label.toLowerCase()).join(", ")}. After: ${data.after}.`;

    // markers
    const defs = el("defs", {}, svg);
    [["arr-ink", "var(--ink)"], ["arr-red", "var(--red)"]].forEach(([id, c]) => {
      const m = el("marker", { id: id + root.id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0,1 L9,5 L0,9", fill: "none", stroke: c, "stroke-width": 1.4 }, m);
    });

    const p0 = pos(0), pN = pos(n - 1);
    const dims = el("g", {}, svg);
    if (!vertical) {
      // before dimension
      const gB = el("g", { class: "dg-dim dg-dim--before" }, dims);
      el("line", { class: "dg-dim-ext", x1: p0.x, y1: 40, x2: p0.x, y2: p0.y - 46 }, gB);
      el("line", { class: "dg-dim-ext", x1: pN.x, y1: 40, x2: pN.x, y2: pN.y - 46 }, gB);
      el("line", { x1: p0.x, y1: 50, x2: pN.x, y2: 50, "marker-start": `url(#arr-ink${root.id})`, "marker-end": `url(#arr-ink${root.id})` }, gB);
      const lw = data.before.length * 7.6 + 20;
      el("rect", { class: "dg-dim-bg", x: (p0.x + pN.x) / 2 - lw / 2, y: 40, width: lw, height: 20 }, gB);
      txt(gB, (p0.x + pN.x) / 2, 54.5, data.before);
      // after dimension
      const gA = el("g", { class: "dg-dim dg-dim--after" }, dims);
      const xe = p0.x + (pN.x - p0.x) * data.ratio;
      el("line", { x1: xe, y1: 70, x2: xe, y2: 92 }, gA);
      el("line", { x1: p0.x, y1: 82, x2: xe, y2: 82, "marker-start": `url(#arr-red${root.id})`, "marker-end": `url(#arr-red${root.id})` }, gA);
      txt(gA, xe + 10, 86.5, data.after, "", "start");
    } else {
      const gB = el("g", { class: "dg-dim dg-dim--before" }, dims);
      el("line", { x1: 14, y1: p0.y - 19, x2: 14, y2: pN.y + 19, "marker-start": `url(#arr-ink${root.id})`, "marker-end": `url(#arr-ink${root.id})` }, gB);
      txt(gB, 14, 26, "BEFORE  " + data.before, "", "start");
      const gA = el("g", { class: "dg-dim dg-dim--after" }, dims);
      const ye = (p0.y - 19) + ((pN.y + 19) - (p0.y - 19)) * data.ratio;
      el("line", { x1: 28, y1: p0.y - 19, x2: 28, y2: ye, "marker-start": `url(#arr-red${root.id})`, "marker-end": `url(#arr-red${root.id})` }, gA);
      txt(gA, 14, 48, "AFTER   " + data.after, "", "start");
    }

    // pipes
    if (!vertical) {
      el("line", { class: "dg-pipe", x1: mainA, y1: p0.y, x2: mainB, y2: p0.y, "marker-end": `url(#arr-ink${root.id})` }, svg);
      el("line", { class: "dg-pipe-fast", x1: mainA, y1: p0.y - 6, x2: mainB, y2: p0.y - 6 }, svg);
    } else {
      el("line", { class: "dg-pipe", x1: p0.x, y1: mainA, x2: p0.x, y2: mainB, "marker-end": `url(#arr-ink${root.id})` }, svg);
      el("line", { class: "dg-pipe-fast", x1: p0.x - 6, y1: mainA, x2: p0.x - 6, y2: mainB }, svg);
    }

    const particles = el("g", {}, svg);
    const leakPts = [];

    // stations
    data.stations.forEach((s, i) => {
      const p = pos(i);
      const span = vertical ? 0 : (geoW - 112) / (n - 1);
      const bw = vertical ? 128 : Math.max(92, Math.min(112, span - 20)), bh = vertical ? 38 : 40;
      const g = el("g", { class: "dg-st" + (s.remove ? " is-removed" : "") }, svg);
      el("rect", { x: p.x - bw / 2, y: p.y - bh / 2, width: bw, height: bh }, g);
      txt(g, p.x, p.y + 4.5, s.label);
      if (!vertical) txt(g, p.x, p.y - bh / 2 - 9, "S-" + String(i + 1).padStart(2, "0"), "dg-idx");
      if (s.remove) {
        el("line", { class: "dg-x", x1: p.x - bw / 2 - 4, y1: p.y - bh / 2 - 4, x2: p.x + bw / 2 + 4, y2: p.y + bh / 2 + 4 }, g);
        el("line", { class: "dg-x", x1: p.x - bw / 2 - 4, y1: p.y + bh / 2 + 4, x2: p.x + bw / 2 + 4, y2: p.y - bh / 2 - 4 }, g);
      }
      if (s.remove || s.auto) {
        const tag = el("g", { class: "dg-tag" }, g);
        const word = s.remove ? "REMOVED" : "AUTOMATED";
        const tw = word.length * 6.6 + 12;
        const tx = vertical ? p.x + bw / 2 + 10 : p.x - tw / 2;
        const ty = vertical ? p.y - 9 : p.y + bh / 2 + 10;
        el("rect", { x: tx, y: ty, width: tw, height: 18 }, tag);
        txt(tag, tx + tw / 2, ty + 12.5, word);
      }
      if (s.leak) {
        const lg = el("g", { class: "dg-leak" }, svg);
        if (!vertical) {
          const drop = leakPts.length % 2 ? 34 : 0; // stagger neighbouring labels
          el("line", { x1: p.x, y1: p.y + bh / 2 + 4, x2: p.x, y2: p.y + 72 + drop }, lg);
          txt(lg, p.x, p.y + 90 + drop, "▼ LEAK", "dg-leak-k");
          txt(lg, p.x, p.y + 106 + drop, s.leak);
        } else {
          el("line", { x1: p.x + bw / 2 + 4, y1: p.y, x2: p.x + bw / 2 + 22, y2: p.y }, lg);
          txt(lg, p.x + bw / 2 + 28, p.y - 3, "► LEAK", "dg-leak-k", "start");
          txt(lg, p.x + bw / 2 + 28, p.y + 12, s.leak, "", "start");
        }
        leakPts.push({ s: vertical ? p.y : p.x, removable: !!s.remove || !!s.auto });
      }
    });

    return { svg, particles, leakPts, mainA, mainB, along, vertical };
  }

  function initDiagram(root) {
    let geo = buildDiagram(root);
    if (!geo) return;
    let fixed = false, interacted = false, visible = false, raf = 0, last = 0, spawnAcc = 0;
    let parts = [];
    const btns = $$(".seg button", root);
    const status = $(".diagram__status span:last-child", root);

    function setFixed(v, byUser) {
      fixed = v;
      if (byUser) interacted = true;
      root.classList.toggle("is-fixed", v);
      btns.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.state === "after") === v)));
      if (status) status.textContent = v ? "Status: fixed. Waste removed" : "Status: leaking";
    }
    btns.forEach((b) => b.addEventListener("click", () => setFixed(b.dataset.state === "after", true)));

    function spawn() {
      const c = el("circle", { r: 3.6, class: "dg-p" }, geo.particles);
      parts.push({ node: c, s: geo.mainA, c: 0, leak: false, checked: new Set(), life: 1 });
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      const speed = fixed ? 230 : 70, interval = fixed ? 0.16 : 0.42;
      spawnAcc += dt;
      if (spawnAcc > interval) { spawnAcc = 0; spawn(); }
      parts = parts.filter((p) => {
        if (p.leak) {
          p.c += 70 * dt; p.life -= 1.1 * dt;
        } else {
          p.s += speed * dt;
          if (!fixed) {
            geo.leakPts.forEach((lp, i) => {
              if (!p.checked.has(i) && p.s >= lp.s) {
                p.checked.add(i);
                if (Math.random() < 0.34) { p.leak = true; p.node.setAttribute("class", "dg-p dg-p--leak"); p.s = lp.s; }
              }
            });
          }
        }
        const q = geo.along(p.s, p.c);
        p.node.setAttribute("cx", q.x.toFixed(1));
        p.node.setAttribute("cy", q.y.toFixed(1));
        p.node.setAttribute("opacity", Math.max(0, p.life).toFixed(2));
        if (p.s > geo.mainB - 6 || p.life <= 0) { p.node.remove(); return false; }
        return true;
      });
    }
    function play() { if (!raf && !reduceMotion) { last = 0; raf = requestAnimationFrame(frame); } }
    function pause() { cancelAnimationFrame(raf); raf = 0; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          play();
          if (!interacted && !root.dataset.autoplayed) {
            root.dataset.autoplayed = "1";
            setTimeout(() => { if (!interacted) setFixed(true); }, 6500);
          }
        } else pause();
      }, { threshold: 0.25 }).observe(root);
    } else play();
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : visible && play()));

    const mq = window.matchMedia("(max-width: 600px)");
    const rebuild = () => { pause(); parts = []; geo = buildDiagram(root); if (visible) play(); };
    mq.addEventListener ? mq.addEventListener("change", rebuild) : mq.addListener(rebuild);
    setFixed(false);
  }
  $$("[data-diagram]").forEach(initDiagram);

  /* =====================================================================
     SYMPTOM CHECKLIST
     ===================================================================== */
  const checklist = $("[data-checklist]");
  let symptoms = [];
  let calcSummary = "";
  if (checklist) {
    const boxes = $$("input[type=checkbox]", checklist);
    const cells = $$(".meter span", checklist);
    const msg = $(".checklist__msg", checklist);
    const count = $("[data-count]", checklist);
    const update = () => {
      const on = boxes.filter((b) => b.checked);
      symptoms = on.map((b) => b.value);
      const k = on.length;
      cells.forEach((c, i) => c.classList.toggle("on", i < k));
      if (count) count.textContent = k + " / 5";
      checklist.classList.toggle("has-leaks", k > 0);
      msg.textContent =
        k === 0 ? "Tick anything that sounds familiar. Nothing is sent anywhere." :
        k === 1 ? "1 of 5. One leak is enough to compound every month you leave it." :
        k <= 3 ? `${k} of 5. Your operations are leaking. The next step is to put a number on it.` :
        `${k} of 5. Significant leakage. This is costing you every single day.`;
      syncHidden();
    };
    boxes.forEach((b) => b.addEventListener("change", update));
    update();
  }

  /* =====================================================================
     LEAK CALCULATOR
     ===================================================================== */
  const calc = $("[data-calc]");
  if (calc) {
    const people = $("#c-people", calc), hours = $("#c-hours", calc), rate = $("#c-rate", calc), cur = $("#c-cur", calc);
    const outs = {
      people: $("[data-o=people]", calc), hours: $("[data-o=hours]", calc), rate: $("[data-o=rate]", calc),
      big: $("[data-o=annual]", calc), month: $("[data-o=month]", calc), hw: $("[data-o=hw]", calc),
      hy: $("[data-o=hy]", calc), fte: $("[data-o=fte]", calc),
    };
    const WEEKS = 48, FTE_HOURS = 1800;
    const money = (v, c) => {
      try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v); }
      catch (e) { return c + " " + Math.round(v).toLocaleString(); }
    };
    const fill = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    const update = () => {
      [people, hours, rate].forEach(fill);
      const p = +people.value, h = +hours.value, r = +rate.value, c = cur.value;
      const hw = p * h, hy = hw * WEEKS, annual = hy * r;
      outs.people.textContent = p + (p === 1 ? " person" : " people");
      outs.hours.textContent = h + " h / week";
      outs.rate.textContent = money(r, c) + " / h";
      outs.big.textContent = money(annual, c);
      outs.month.textContent = money(annual / 12, c);
      outs.hw.textContent = hw.toLocaleString() + " h";
      outs.hy.textContent = hy.toLocaleString() + " h";
      outs.fte.textContent = (hy / FTE_HOURS).toFixed(1) + " full-time staff";
      calcSummary = `Leak estimate: ${p} people × ${h} h/week × ${money(r, c)}/h ≈ ${money(annual, c)} per year (${hy.toLocaleString()} hours).`;
      syncHidden();
    };
    [people, hours, rate, cur].forEach((i) => i.addEventListener("input", update));
    update();

    const send = $("[data-calc-send]", calc);
    if (send) send.addEventListener("click", () => {
      const msg = $("#f-msg");
      if (msg && !msg.value.includes("Leak estimate:")) msg.value = (msg.value ? msg.value.trim() + "\n\n" : "") + calcSummary;
    });
  }

  function syncHidden() {
    const s = $("#f-symptoms"), c = $("#f-calc");
    if (s) s.value = symptoms.join("; ");
    if (c) c.value = calcSummary;
  }

  /* =====================================================================
     BEFORE / AFTER CASE SHEETS
     ===================================================================== */
  $$(".days[data-total]").forEach((d) => {
    const total = +d.dataset.total, keep = +d.dataset.after;
    for (let i = 0; i < total; i++) { const c = document.createElement("i"); if (i < keep) c.className = "keep"; d.appendChild(c); }
  });
  $$(".seats[data-total]").forEach((d) => {
    const total = +d.dataset.total, base = +d.dataset.before;
    for (let i = 0; i < total; i++) { const c = document.createElement("i"); if (i < base) c.className = "base"; d.appendChild(c); }
  });
  $$("[data-case]").forEach((c) => {
    const btns = $$(".seg button", c);
    const set = (state) => {
      c.dataset.state = state;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.state === state)));
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.state)));
    set(c.dataset.state || "before");
    // show the result once when scrolled into view
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); setTimeout(() => { if (c.dataset.touched !== "1") set("after"); }, 1400); }
      }, { threshold: 0.5 });
      io.observe(c);
      btns.forEach((b) => b.addEventListener("click", () => (c.dataset.touched = "1")));
    }
  });

  /* =====================================================================
     WORK ORDER FORM
     ===================================================================== */
  const form = $("#audit-form");
  if (form) {
    const d = new Date();
    const wo = "PF-" + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
    $$("[data-wo]").forEach((n) => (n.textContent = wo));
    const woField = $("#f-wo"); if (woField) woField.value = wo;

    const status = $(".form__status", form);
    const btn = $("button[type=submit]", form);
    const show = (m, ok) => { status.textContent = m; status.className = "form__status " + (ok ? "is-ok" : "is-err"); };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      if ($(".hp input", form).value) return;
      if (!PERFORIENT_CONFIG.formEndpoint) {
        show("The form isn't connected yet. Site owner: set formEndpoint in assets/js/main.js (see README.md).", false);
        return;
      }
      btn.disabled = true;
      const label = btn.innerHTML;
      btn.textContent = "Sending…";
      try {
        const res = await fetch(PERFORIENT_CONFIG.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        show(`Work order ${wo} received. We'll reply within one business day to schedule your audit.`, true);
      } catch (err) {
        show("Something went wrong sending your request. Please try again in a moment.", false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });
  }

  /* ---------------- Dates ---------------- */
  $$("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
})();
