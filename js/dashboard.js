/* tài khoản mới: số liệu tính từ giao dịch đã ghi, bỏ badge demo */
  /* thu–chi–tồn luôn tính từ giao dịch thật của tài khoản */
  const money = n => Math.round(Math.abs(n)).toLocaleString("vi-VN") + " ₫";
  const tin = SW_DATA.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const tout = SW_DATA.transactions.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const sv = $$(".stats .s-value");
  if (sv[0]) { sv[0].dataset.count = tin - tout; sv[0].textContent = money(tin - tout); }
  if (sv[1]) { sv[1].dataset.count = tin; sv[1].textContent = money(tin); }
  if (sv[2]) { sv[2].dataset.count = tout; sv[2].textContent = money(tout); }
  const saved = (SW_DATA.goals || []).reduce((s, g) => s + (g.saved || 0), 0);
  if (sv[3]) { sv[3].dataset.count = saved; sv[3].textContent = money(saved); }
  const feet = $$(".stats .s-foot");
  if (feet[3]) feet[3].textContent = (SW_DATA.goals || []).length
    ? (SW_DATA.goals.filter(g => !g.done).length + "/" + SW_DATA.goals.length + " mục tiêu đang chạy")
    : "chưa có mục tiêu";
  if (window.SW_FRESH) {
    $$(".stats .badge").forEach(b => b.remove());
    const src = SW_DATA.transactions.filter(t => t.amount > 0).length;
    if (feet[0]) feet[0].textContent = "tháng này";
    if (feet[1]) feet[1].textContent = src ? src + " nguồn thu" : "chưa có nguồn thu";
    if (feet[2]) feet[2].textContent = tin ? Math.round(tout / tin * 100) + "% thu nhập" : "0% thu nhập";
    $$(".badge").forEach(b => { if (b.textContent.includes("so với đỉnh")) b.remove(); });
    const bh = $("#budgetCard h3"); if (bh) bh.textContent = "Ngân sách của bạn";
    if (SW_DATA.transactions.length)
      SW_DATA.overview.insightShort = `Bạn đã ghi ${SW_DATA.transactions.length} giao dịch (chi ${money(tout)}). Tiếp tục để AI phân tích thói quen chi tiêu của bạn.`;
  }
  initAppPage();

  /* ngày hôm nay thật */
  const d = new Date();
  const thu = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"][d.getDay()];
  $("#todayStr").textContent = `${thu}, ${String(d.getDate()).padStart(2,"0")} tháng ${d.getMonth() + 1}`;

  /* avatar theo user đăng nhập */
  const auth = SWAuth.get();
  if (auth && auth.name) {
    const last = auth.name.split(" ").slice(-1)[0];
    $("#avatar").textContent = last.slice(0, 2).toUpperCase();
  }

  /* xu hướng 6 tuần: tài khoản thật thì gom chi tiêu theo tuần (tuần cuối là tuần này) */
  let weekly = SW_DATA.overview.weekly;
  let wkLabels = weekly.map((_, i) => "T" + (33 + i));
  if (window.SW_FRESH) {
    const now = new Date();
    const w0 = new Date(now); w0.setDate(w0.getDate() - ((w0.getDay() + 6) % 7)); w0.setHours(0, 0, 0, 0);
    const iso = d => "T" + Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
    weekly = [0, 0, 0, 0, 0, 0].map((_, i) => {
      const s = new Date(w0); s.setDate(s.getDate() - (5 - i) * 7);
      const e = new Date(s); e.setDate(e.getDate() + 7);
      wkLabels[i] = iso(s);
      return SW_DATA.transactions.reduce((sum, t) => {
        if (t.amount >= 0 || !t.date) return sum;
        const p = t.date.split("/").map(Number);
        const dt = new Date(now.getFullYear(), p[1] - 1, p[0]);
        return dt >= s && dt < e ? sum - t.amount : sum;
      }, 0);
    });
  }

  /* card Ngân sách: đồng bộ với trang Ngân sách (hạn mức theo tài khoản + chi tiêu thật) */
  const _sb = {};
  SW_DATA.transactions.filter(t => t.amount < 0).forEach(t => _sb[t.cat] = (_sb[t.cat] || 0) - t.amount);
  const _buds = SWStore.load().budgets || (window.SW_FRESH ? [] : DEMO_BUDGETS.map(b => ({ ...b })));
  const _cap = _buds.reduce((s, b) => s + b.cap, 0);
  const _used = _buds.reduce((s, b) => s + (_sb[b.name] || 0), 0);
  const _pct = _cap ? Math.min(Math.round(_used / _cap * 100), 100) : 0;
  const _bh = $("#budgetCard h3");
  if (_bh) _bh.textContent = window.SW_FRESH ? "Ngân sách của bạn" : "Ngân sách tháng " + (new Date().getMonth() + 1);
  const _pv = $("#budgetCard [data-count]");
  if (_pv) { _pv.dataset.count = _pct; _pv.textContent = _pct + "%"; }
  const _spentEl = $("#budgetCard .mt-8.small b");
  if (_spentEl) _spentEl.textContent = _buds.length ? Math.round(_used).toLocaleString("vi-VN") + " / " + _cap.toLocaleString("vi-VN") + " ₫" : "0 / 0 ₫";
  const _safeEl = $$("#budgetCard .small").find(s => s.textContent.includes("an toàn") || s.textContent.includes("Chưa có"));
  if (_safeEl) {
    if (!_buds.length) _safeEl.textContent = "Chưa có ngân sách — tạo ở trang Ngân sách";
    else if (_used > _cap) { _safeEl.textContent = "Vượt hạn mức " + Math.round(_used - _cap).toLocaleString("vi-VN") + " ₫"; _safeEl.style.color = "var(--red)"; }
    else _safeEl.textContent = "Còn " + Math.max(_cap - _used, 0).toLocaleString("vi-VN") + " ₫ an toàn";
  }

  window._charts = {
    "dash-bars": el => barTrend(el, weekly, {
      hot: weekly.indexOf(Math.max(...weekly)),
      labels: wkLabels,
      trendColor: "#8b5cf6",
      fmt: window.SW_FRESH ? undefined : (v => v + "%"),
      tipSuffix: window.SW_FRESH ? undefined : ""
    }),
    "dash-donut": el => donut(el, _pct, { thick: 15 })
  };
  initCharts();

  /* hiệu ứng gõ chữ cho insight AI */
  const txt = SW_DATA.overview.insightShort;
  let i = 0;
  const startTyping = () => {
    const t = setInterval(() => {
      $("#aiText").textContent = txt.slice(0, ++i);
      if (i >= txt.length) clearInterval(t);
    }, 18);
  };
  setTimeout(startTyping, 900);

  /* bảng giao dịch gần đây */
  const ICO = { "Ăn uống": "c-Ăn", "Đi lại": "c-Đi", "Nhà ở": "c-Nhà", "Giải trí": "c-Giải", "Hóa đơn": "c-Hóa", "Mua sắm": "c-Mua", "Thu nhập": "c-Th" };
  const recent = SW_DATA.transactions.slice(0, 5);
  $("#recentTx").innerHTML = recent.length ? recent.map(t => `
    <tr>
      <td><div class="tx-desc"><span class="tx-ico ${ICO[t.cat] || "c-Khác"}"></span><div><b>${t.desc}</b><div class="small muted">${t.acc}</div></div></div></td>
      <td><span class="badge ${t.amount > 0 ? "b-green" : "b-gray"}">${t.cat}</span></td>
      <td class="muted">${t.date}</td>
      <td class="num" style="text-align:right"><span class="${t.amount > 0 ? "money-pos" : "money-neg"}">${fmtMoneySign(t.amount)}</span></td>
    </tr>`).join("") :
    `<tr><td colspan="4" style="text-align:center;padding:30px 0" class="muted">Chưa có giao dịch nào — <a class="link" href="transactions.html">thêm giao dịch đầu tiên →</a></td></tr>`;
