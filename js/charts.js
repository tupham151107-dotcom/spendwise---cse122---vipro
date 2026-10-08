/* =====================================================
   SpendWise — charts.js : biểu đồ canvas tự vẽ, có animation
   ===================================================== */

function _setup(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.getAttribute("height") ? parseInt(canvas.getAttribute("height")) : (canvas.clientHeight || 180);
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.height = h + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}
const easeOut = p => 1 - Math.pow(1 - p, 3);

/* ---------- biểu đồ cột ---------- */
function barChart(canvas, values, opts = {}) {
  const { ctx, w, h } = _setup(canvas);
  const pad = 6, gap = opts.gap ?? 8;
  const max = Math.max(...values) * 1.12;
  const bw = (w - pad * 2 - gap * (values.length - 1)) / values.length;
  const t0 = performance.now();
  const dur = opts.dur || 900;
  const css = getComputedStyle(document.documentElement);
  const hotColor = opts.hotColor || "#ea580c";
  const normal = opts.color || ["#0d9488", "#16a34a"];

  function frame(now) {
    const p = easeOut(Math.min((now - t0) / dur, 1));
    ctx.clearRect(0, 0, w, h);
    values.forEach((v, i) => {
      const bh = (v / max) * (h - 14) * p;
      const x = pad + i * (bw + gap);
      const y = h - bh - 2;
      const grad = ctx.createLinearGradient(0, y, 0, h);
      if (i === opts.hot) { grad.addColorStop(0, hotColor); grad.addColorStop(1, hotColor + "66"); }
      else { grad.addColorStop(0, normal[0]); grad.addColorStop(1, normal[1] + "55"); }
      ctx.fillStyle = grad;
      const r = Math.min(6, bw / 2);
      ctx.beginPath();
      ctx.moveTo(x, h - 2);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.arcTo(x + bw, y, x + bw, y + r, r);
      ctx.lineTo(x + bw, h - 2);
      ctx.closePath();
      ctx.fill();
    });
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* tooltip khi rê chuột */
  canvas.onmousemove = e => {
    const r = canvas.getBoundingClientRect();
    const i = Math.floor((e.clientX - r.left - pad) / (bw + gap));
    if (i >= 0 && i < values.length) {
      let tip = canvas._tip;
      if (!tip) {
        tip = document.createElement("div");
        Object.assign(tip.style, {
          position: "fixed", background: "#06281e", color: "#eafff5", padding: "5px 10px",
          borderRadius: "8px", fontSize: "11.5px", fontWeight: "600", pointerEvents: "none",
          zIndex: 99, transition: "opacity .15s", opacity: "0"
        });
        document.body.appendChild(tip);
        canvas._tip = tip;
      }
      tip.textContent = (opts.labels ? L(opts.labels[i]) + ": " : "") + values[i] + (opts.suffix || "");
      tip.style.left = e.clientX + 10 + "px";
      tip.style.top = e.clientY - 30 + "px";
      tip.style.opacity = "1";
    } else if (canvas._tip) canvas._tip.style.opacity = "0";
  };
  canvas.onmouseleave = () => { if (canvas._tip) canvas._tip.style.opacity = "0"; };
}

/* ---------- cột + đường xu hướng ---------- */
function barTrend(canvas, values, opts = {}) {
  const { ctx, w, h } = _setup(canvas);
  const labels = opts.labels || values.map((_, i) => "#" + (i + 1));
  const pad = 8, gap = opts.gap ?? 10;
  const labelH = 18, topPad = 22;
  const max = Math.max(...values) * 1.15 || 1;
  const bw = (w - pad * 2 - gap * (values.length - 1)) / values.length;
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim() || "#132a20";
  const t0 = performance.now(), dur = opts.dur || 900;
  const fmt = opts.fmt || (v => v >= 1e6 ? (Math.round(v / 1e5) / 10).toLocaleString("vi-VN") + "tr" : v >= 1e3 ? Math.round(v / 1e3) + "k" : "" + v);
  let hoverIdx = -1;

  function draw(p) {
    ctx.clearRect(0, 0, w, h);
    const pts = [];
    values.forEach((v, i) => {
      const bh = (v / max) * (h - labelH - topPad) * p;
      const x = pad + i * (bw + gap);
      const y = h - labelH - bh - 2;
      const g = ctx.createLinearGradient(0, y, 0, h);
      if (i === opts.hot || i === hoverIdx) { g.addColorStop(0, "#ea580c"); g.addColorStop(1, "#ea580c66"); }
      else { g.addColorStop(0, "#0d9488"); g.addColorStop(1, "#16a34a55"); }
      ctx.fillStyle = g;
      const r = Math.min(6, bw / 2);
      ctx.beginPath();
      ctx.moveTo(x, h - labelH - 2);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.arcTo(x + bw, y, x + bw, y + r, r);
      ctx.lineTo(x + bw, h - labelH - 2);
      ctx.closePath();
      ctx.fill();
      pts.push([x + bw / 2, y]);
      if (v > 0) {
        ctx.fillStyle = ink;
        ctx.font = "600 10.5px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(fmt(v), x + bw / 2, y - 5);
      }
      ctx.fillStyle = i === hoverIdx ? ink : "rgba(130,145,138,.9)";
      ctx.font = i === hoverIdx ? "700 10px system-ui" : "10px system-ui";
      ctx.fillText(L(labels[i]), x + bw / 2, h - 4);
    });
    /* đường only dẫn từ cột tiền xuống đúng danh mục đang chỉ */
    if (hoverIdx >= 0 && hoverIdx < values.length && values[hoverIdx] > 0) {
      const x = pts[hoverIdx][0];
      ctx.beginPath();
      ctx.moveTo(x, pts[hoverIdx][1] - 2);
      ctx.lineTo(x, h - labelH - 2);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (pts.length > 1) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = opts.trendColor || "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      pts.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = opts.trendColor || "#8b5cf6"; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.stroke();
      });
    }
  }
  function frame(now) {
    const p = easeOut(Math.min((now - t0) / dur, 1));
    draw(p);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  canvas.onmousemove = e => {
    const r = canvas.getBoundingClientRect();
    const i = Math.floor((e.clientX - r.left - pad) / (bw + gap));
    const ok = i >= 0 && i < values.length && values[i] > 0;
    const hi = ok ? i : -1;
    if (hi !== hoverIdx) { hoverIdx = hi; draw(1); }
    if (ok) {
      let tip = canvas._tip;
      if (!tip) {
        tip = document.createElement("div");
        Object.assign(tip.style, {
          position: "fixed", background: "#06281e", color: "#eafff5", padding: "5px 10px",
          borderRadius: "8px", fontSize: "11.5px", fontWeight: "600", pointerEvents: "none",
          zIndex: 99, transition: "opacity .15s", opacity: "0"
        });
        document.body.appendChild(tip);
        canvas._tip = tip;
      }
      tip.textContent = L(labels[i]) + ": " + fmt(values[i]) + (opts.tipSuffix ?? " ₫");
      tip.style.left = e.clientX + 10 + "px";
      tip.style.top = e.clientY - 30 + "px";
      tip.style.opacity = "1";
    } else if (canvas._tip) canvas._tip.style.opacity = "0";
  };
  canvas.onmouseleave = () => {
    if (hoverIdx !== -1) { hoverIdx = -1; draw(1); }
    if (canvas._tip) canvas._tip.style.opacity = "0";
  };
}

/* ---------- donut ---------- */
function donut(canvas, pct, opts = {}) {
  const { ctx, w, h } = _setup(canvas);
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) / 2 - 8;
  const r = R - (opts.thick || 13);
  const color = opts.color || getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#16a34a";
  const track = opts.track || "rgba(120,150,135,.18)";
  const dur = opts.dur || 1100;
  const t0 = performance.now();
  function frame(now) {
    const p = easeOut(Math.min((now - t0) / dur, 1));
    const val = pct * p;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = opts.thick || 13;
    ctx.lineCap = "round";
    ctx.strokeStyle = track;
    ctx.beginPath(); ctx.arc(cx, cy, (R + r) / 2, 0, Math.PI * 2); ctx.stroke();
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, color); g.addColorStop(1, opts.color2 || "#0d9488");
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, (R + r) / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (val / 100));
    ctx.stroke();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- đường gãy (sparkline) ---------- */
function spark(canvas, values, opts = {}) {
  const { ctx, w, h } = _setup(canvas);
  const pad = 8;
  const min = Math.min(...values), max = Math.max(...values);
  const rng = max - min || 1;
  const px = i => pad + i * ((w - pad * 2) / (values.length - 1));
  const py = v => h - pad - ((v - min) / rng) * (h - pad * 2);
  const color = opts.color || "#16a34a";
  const dur = opts.dur || 1000;
  const t0 = performance.now();
  function frame(now) {
    const p = easeOut(Math.min((now - t0) / dur, 1));
    const n = Math.max(2, Math.ceil(values.length * p));
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    values.slice(0, n).forEach((v, i) => i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    /* vùng gradient */
    ctx.lineTo(px(n - 1), h - 2); ctx.lineTo(px(0), h - 2); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color + "40"); g.addColorStop(1, color + "00");
    ctx.fillStyle = g;
    ctx.fill();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- bắt đầu khi cuộn tới ---------- */
function initCharts(root = document) {
  const jobs = $$("[data-chart]", root);
  const run = el => {
    const type = el.dataset.chart;
    const d = SW_DATA;
    const custom = window._charts && (window._charts[el.dataset.chart] || window._charts[el.id]);
    if (custom) return custom(el);
    if (type === "demo-bars") barChart(el, [62, 78, 55, 84, 70, 92], { labels: ["T1", "T2", "T3", "T4", "T5", "T6"], suffix: "%" });
    if (type === "demo-donut") donut(el, 78);
  };
  if (!("IntersectionObserver" in window)) { jobs.forEach(run); return; }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
  }), { threshold: .3 });
  jobs.forEach(el => io.observe(el));
}
