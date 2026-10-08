/* tài khoản mới: đổi tiêu đề + chữ demo */
  if (window.SW_FRESH) {
    $(".topbar h1").textContent = "Ngân sách của bạn";
    const ai = $(".ai-card p");
    if (ai) ai.textContent = "AI sẽ có nhận xét đầu tiên ngay khi bạn ghi nhận vài giao dịch.";
    const coach = [...$$(".card")].find(k => { const h = k.querySelector("h3"); return h && h.textContent.includes("coach duyệt"); });
    if (coach) coach.remove();
  }
  initAppPage();

  /* ---- hạn mức theo tài khoản, chi tiêu từ giao dịch thật ---- */
  const CAT_ICO = { "Ăn uống": "🍜", "Đi lại": "🛵", "Nhà ở": "🏠", "Giải trí": "🎬", "Hóa đơn": "🧾", "Mua sắm": "🛍️", "Tiết kiệm": "🎯", "Khác": "📦" };
  let BUDGETS = SWStore.load().budgets || (window.SW_FRESH ? [] : DEMO_BUDGETS.map(b => ({ ...b })));
  const spentBy = {};
  SW_DATA.transactions.filter(t => t.amount < 0).forEach(t => spentBy[t.cat] = (spentBy[t.cat] || 0) - t.amount);
  const tinAll = SW_DATA.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const toutAll = SW_DATA.transactions.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const incBase = tinAll || ((SWStore.load().profile || {}).income || 0);
  const cappedSpent = () => BUDGETS.reduce((s, b) => s + (spentBy[b.name] || 0), 0);
  const totalCap = () => BUDGETS.reduce((s, b) => s + b.cap, 0);
  const donutPct = () => totalCap() ? Math.min(Math.round(cappedSpent() / totalCap() * 100), 100) : 0;

  window._charts = {
    "bs-donut": el => donut(el, donutPct(), { thick: 16, color2: "#16a34a" }),
    "cat-bars": () => drawCatBar()
  };
  initCharts();

  function renderPage() {
    const remain = BUDGETS.length ? Math.max(totalCap() - cappedSpent(), 0) : Math.max(incBase - toutAll, 0);
    const now = new Date();
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
    const pace = Math.round(remain / daysLeft);
    const sv = $$(".stats [data-count]"), feet = $$(".s-foot");
    if (sv[0]) { sv[0].dataset.count = toutAll; sv[0].textContent = Math.round(toutAll).toLocaleString("vi-VN") + " ₫"; }
    if (sv[1]) { sv[1].dataset.count = remain; sv[1].textContent = Math.round(remain).toLocaleString("vi-VN") + " ₫"; }
    if (sv[2]) { sv[2].dataset.count = pace; sv[2].textContent = Math.round(pace).toLocaleString("vi-VN") + " ₫"; }
    if (feet[0]) feet[0].textContent = BUDGETS.length ? donutPct() + "% tổng hạn mức" : (toutAll ? "từ các giao dịch đã ghi" : "chưa có dữ liệu");
    if (feet[1]) feet[1].textContent = BUDGETS.length ? "tính đến " + now.toLocaleDateString("vi-VN") : "thu nhập − chi tiêu";
    if (feet[2]) feet[2].textContent = "/ngày còn lại của tháng";
    const saved = SW_DATA.goals.reduce((s, g) => s + g.saved, 0);
    $("#bSaved").textContent = Math.round(saved).toLocaleString("vi-VN") + " ₫";
    $("#bSavedFoot").textContent = SW_DATA.goals.length ? SW_DATA.goals.filter(g => !g.done).length + "/" + SW_DATA.goals.length + " mục tiêu đang chạy" : "chưa có mục tiêu";
    $(".topbar .sub").textContent = BUDGETS.length
      ? "Hạn mức theo danh mục · tổng " + totalCap().toLocaleString("vi-VN") + " ₫"
      : "Chưa có hạn mức nào — bấm “＋ Thêm hạn mức” để bắt đầu";
    const c = $(".center");
    if (c) c.innerHTML = BUDGETS.length
      ? `<div style="font-size:24px;font-weight:800">${donutPct()}%</div><div class="small muted">Đã dùng ${Math.round(cappedSpent()).toLocaleString("vi-VN")} / ${totalCap().toLocaleString("vi-VN")} ₫</div>`
      : `<div style="font-size:24px;font-weight:800">0%</div><div class="small muted">Chưa có hạn mức — thêm để theo dõi nhịp chi</div>`;
    $("#catList").innerHTML = `<div class="row between" style="margin-bottom:16px"><h3>Hạn mức theo danh mục</h3><button class="btn btn-soft btn-sm" id="addBudBtn">＋ Thêm hạn mức</button></div>` +
      (BUDGETS.length ? BUDGETS.map((b, i) => {
        const used = spentBy[b.name] || 0;
        const pct = Math.min(Math.round(used / b.cap * 100), 100);
        const near = pct > 90 && used <= b.cap, over = used > b.cap;
        return `
        <div class="bud-item">
          <div class="row between" style="margin-bottom:6px">
            <span class="row" style="gap:9px;font-weight:600;font-size:13.5px"><span style="font-size:16px">${b.ico}</span> ${b.name}
              ${over ? '<span class="badge b-red">Vượt</span>' : near ? '<span class="badge b-yellow">Sắp chạm hạn</span>' : ""}
            </span>
            <span class="row" style="gap:8px">
              <span class="small muted"><b style="color:var(--ink)">${used.toLocaleString("vi-VN")}</b> / ${b.cap.toLocaleString("vi-VN")} ₫ · ${pct}%</span>
              <button class="icon-btn bud-edit" data-i="${i}" title="Sửa hạn mức" style="width:26px;height:26px;font-size:12px">✏️</button>
            </span>
          </div>
          <div class="bar" ${over ? 'style="background:var(--red-soft)"' : ""}><i data-bar="${pct}" ${over ? 'style="background:var(--red)"' : near ? 'style="background:linear-gradient(90deg,#fbbf24,#f59e0b)"' : ""}></i></div>
        </div>`;
      }).join("") : `<div class="empty"><div class="e-ico">🎯</div>Chưa có hạn mức nào — thêm danh mục đầu tiên để theo dõi nhịp chi.</div>`);
    $("#addBudBtn").addEventListener("click", () => openBudModal(-1));
    $$(".bud-edit", $("#catList")).forEach(btn => btn.addEventListener("click", () => openBudModal(+btn.dataset.i)));
    setTimeout(() => $$("[data-bar]").forEach(b => b.style.width = b.dataset.bar + "%"), 60);
    donut($('[data-chart="bs-donut"]'), donutPct(), { thick: 16, color2: "#16a34a" });
  }
  renderPage();

  /* ---- thêm / cập nhật hạn mức ---- */
  let editIdx = -1;
  function openBudModal(i) {
    editIdx = i;
    const b = BUDGETS[i];
    $("#budModal h3").textContent = i >= 0 ? "Sửa hạn mức" : "Thêm hạn mức";
    $("#budModal .small").textContent = i >= 0 ? "Đổi danh mục hoặc điều chỉnh trần chi" : "Đặt trần chi cho một danh mục";
    $("#bCat").value = b ? b.name : $("#bCat").options[0].value;
    $("#bCap").value = b ? b.cap.toLocaleString("vi-VN") : "";
    openModal("#budModal");
  }
  $("#bCap").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });
  $("#budForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#bCat").value;
    const cap = parseInt($("#bCap").value.replace(/\D/g, ""), 10);
    if (!cap) { $("#bCap").classList.add("invalid"); setTimeout(() => $("#bCap").classList.remove("invalid"), 600); return; }
    const dup = BUDGETS.findIndex((b, i) => b.name === name && i !== editIdx);
    if (dup >= 0) { toast(`"${name}" đã có hạn mức rồi — bấm ✏️ trên dòng đó để sửa`, "⚠️"); return; }
    if (editIdx >= 0) {
      const b = BUDGETS[editIdx];
      b.name = name; b.ico = CAT_ICO[name] || b.ico; b.cap = cap;
      toast(`Đã sửa hạn mức "${name}" thành ${fmtMoney(cap)}`, "✏️");
    } else {
      BUDGETS.push({ ico: CAT_ICO[name] || "📦", name, cap });
      toast(`Đã thêm hạn mức ${fmtMoney(cap)} cho "${name}"`, "💰");
    }
    SWStore.save({ budgets: BUDGETS });
    renderPage();
    closeModal("#budModal");
    e.target.reset();
  });

  /* ---- biểu đồ cột + đường xu hướng theo danh mục ---- */
  let catCols = SWStore.load().catCols || [];
  const CAT_ORDER = ["Ăn uống", "Đi lại", "Nhà ở", "Giải trí", "Hóa đơn", "Mua sắm", "Khác"];
  function catChartData() {
    const map = {};
    SW_DATA.transactions.filter(t => t.amount < 0).forEach(t => map[t.cat] = (map[t.cat] || 0) - t.amount);
    catCols.forEach(c => map[c.name] = (map[c.name] || 0) + c.amount);
    const labels = Object.keys(map).sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    const values = labels.map(k => map[k]);
    return { labels, values, hot: values.indexOf(Math.max(...values)) };
  }
  function drawCatBar() {
    const { labels, values, hot } = catChartData();
    const has = values.some(v => v > 0);
    $("#catBar").style.display = has ? "" : "none";
    $("#noCatBar").classList.toggle("hidden", has);
    if (has) barTrend($("#catBar"), values, { labels, hot });
  }

  /* ---- thêm cột ---- */
  $("#addColBtn").addEventListener("click", () => openModal("#colModal"));
  $("#cAmt").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });
  $("#colForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#cCat").value;
    const amt = parseInt($("#cAmt").value.replace(/\D/g, ""), 10);
    if (!amt) { $("#cAmt").classList.add("invalid"); setTimeout(() => $("#cAmt").classList.remove("invalid"), 600); return; }
    const ex = catCols.find(c => c.name === name);
    if (ex) ex.amount += amt; else catCols.push({ name, amount: amt });
    SWStore.save({ catCols });
    drawCatBar();
    closeModal("#colModal");
    e.target.reset();
    toast(`Đã thêm ${fmtMoney(amt)} vào cột "${name}"`, "📊");
  });
