/* số liệu luôn tính từ mục tiêu thật của tài khoản */
  function goalStat(G) {
    const tot = G.reduce((s, x) => s + x.saved, 0);
    const mon = G.reduce((s, x) => s + x.thisMonth, 0);
    const avg = G.length ? G.reduce((s, x) => s + Math.min(x.saved / x.target * 100, 100), 0) / G.length : 0;
    const money = n => Math.round(n).toLocaleString("vi-VN") + " ₫";
    const sv = $$(".stats .s-value");
    if (sv[0]) { sv[0].dataset.count = tot; sv[0].textContent = money(tot); }
    if (sv[1]) { sv[1].dataset.count = Math.round(avg * 10) / 10; sv[1].textContent = avg.toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "%"; }
    if (sv[2]) { sv[2].dataset.count = mon; sv[2].textContent = money(mon); }
    const f0 = $$(".s-foot")[0];
    if (f0) f0.textContent = G.length ? G.filter(x => !x.done).length + "/" + G.length + " mục tiêu đang chạy" : "chưa có mục tiêu";
    const done = G.filter(x => x.done);
    const surplus = done.reduce((s, x) => s + (x.saved - x.target), 0);
    const f1 = $$(".s-foot")[1];
    if (f1) f1.textContent = G.length ? (done.length ? done.length + "/" + G.length + " đạt đủ" + (surplus > 0 ? " · dư " + money(surplus) : "") : "chưa mục tiêu nào đạt đủ") : "bắt đầu từ hôm nay";
    const f2 = $$(".s-foot")[2];
    if (f2) f2.textContent = mon > 0 ? "từ các lần nạp tháng này" : "—";
  }
  if (window.SW_FRESH) {
    const feet = $$(".s-foot");
    if (feet[1]) feet[1].textContent = "bắt đầu từ hôm nay";
    if (feet[2]) feet[2].textContent = "—";
    const ph = $(".panel-head .small"); if (ph) ph.textContent = SW_DATA.goals.length ? "cập nhật hôm nay" : "chưa có";
  }
  initAppPage();
  let goals = [...SW_DATA.goals].map(g => ({ ...g, done: !!g.done }));
  goals.forEach(g => { if (g.saved >= g.target) g.done = true; });
  goalStat(goals);

  const auth = SWAuth.get();
  if (auth && auth.name) $("#avatar").textContent = auth.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase();

  function render() {
    if (!goals.length) {
      $("#goalGrid").innerHTML = `<div class="card empty" style="grid-column:1/-1"><div class="e-ico">🎯</div><div>Chưa có mục tiêu nào — tạo mục tiêu đầu tiên để bắt đầu.</div><button class="btn btn-accent btn-sm mt-16" data-modal="#goalModal">+ Tạo mục tiêu</button></div>`;
      renderMs();
      return;
    }
    $("#goalGrid").innerHTML = goals.map((g, i) => {
      const pct = Math.min(Math.round(g.saved / g.target * 100), 100);
      return `
      <div class="card hoverable goal-card reveal in" style="animation:page-in .5s ${i * .08}s both">
        <div class="g-top">
          <div class="row" style="gap:12px">
            <span class="g-emoji">${g.emoji}</span>
            <div>
              <h3>${g.name}</h3>
              <span class="row" style="gap:6px">
                ${g.done ? `<span class="badge b-green">Đạt đủ · dư ${(g.saved - g.target).toLocaleString("vi-VN")} ₫</span>` : `<span class="badge b-gray">Còn ${g.monthsLeft} tháng</span>`}
                <button class="badge ${g.done ? "b-green" : "b-gray"} st-toggle" data-done="${g.id}" title="Bấm để đổi trạng thái">${g.done ? "✓ Đã hoàn thành" : "Chưa hoàn thành"}</button>
              </span>
            </div>
          </div>
          <span class="goal-pct" data-count="${pct}" data-suffix="%">0%</span>
        </div>
        <div class="bar"><i data-w="${pct}" ${g.done ? 'style="background:linear-gradient(90deg,#4ade80,#16a34a)"' : ""}></i></div>
        <div class="goal-meta">
          <button class="saved-edit" data-edit="${g.id}" title="Bấm để sửa số tiền tiết kiệm"><b style="color:var(--ink)">${g.saved.toLocaleString("vi-VN")}</b> / ${g.target.toLocaleString("vi-VN")} ₫</button>
          <button class="saved-edit trend up" data-editm="${g.id}" title="Bấm để sửa hoặc xóa đóng góp tháng này">+${g.thisMonth.toLocaleString("vi-VN")} ₫ tháng này</button>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn btn-soft btn-sm grow" data-add="${g.id}">+ Nạp tiền</button>
          <button class="btn btn-ghost btn-sm" data-detail="${g.id}">Chi tiết</button>
        </div>
      </div>`;
    }).join("");
    initCounters($("#goalGrid"));

    /* animate progress bars */
    setTimeout(() => $$("[data-w]").forEach(b => b.style.width = b.dataset.w + "%"), 60);

    /* nạp tiền / sửa số tiền / đổi trạng thái */
    $$("[data-add]").forEach(b => b.addEventListener("click", () => openSav("add", b.dataset.add)));
    $$("[data-edit]").forEach(b => b.addEventListener("click", () => openSav("edit", b.dataset.edit)));
    $$("[data-editm]").forEach(b => b.addEventListener("click", () => openSav("edit", b.dataset.editm, "month")));
    $$("[data-done]").forEach(b => b.addEventListener("click", () => {
      const g = goals.find(x => x.id == b.dataset.done);
      g.done = !g.done;
      render();
      toast(g.done ? `"${g.name}" đã đánh dấu hoàn thành` : `"${g.name}" chuyển lại đang chạy`, g.done ? "✅" : "🔄");
    }));
    $$("[data-detail]").forEach(b => b.addEventListener("click", () => {
      const g = goals.find(x => x.id == b.dataset.detail);
      toast(`"${g.name}" — ${g.saved >= g.target ? `đạt đủ, dư ${(g.saved - g.target).toLocaleString("vi-VN")} ₫` : `đạt ${Math.round(g.saved / g.target * 100)}%, còn ${(g.target - g.saved).toLocaleString("vi-VN")} ₫`}`, "🎯");
    }));
    SWStore.save({ goals: goals });
    goalStat(goals);
    renderMs();
  }
  render();

  /* cột mốc — sinh từ mục tiêu thật, đồng bộ trạng thái hoàn thành */
  function renderMs() {
    $("#msUpd").textContent = goals.length ? "cập nhật hôm nay" : "chưa có";
    $("#msList").innerHTML = goals.length ? goals.map(g => {
      const pct = Math.min(Math.round(g.saved / g.target * 100), 100);
      return `
      <div class="bud-item">
        <div class="row between" style="gap:10px">
          <div class="row" style="gap:9px;min-width:0">
            <span style="font-size:18px">${g.emoji}</span>
            <div style="min-width:0">
              <b style="font-size:13.5px">${g.name}</b>
              <div class="small muted">Đích ${g.target.toLocaleString("vi-VN")} ₫ · còn ${g.monthsLeft} tháng</div>
            </div>
          </div>
          <span class="st ${g.done ? "st-ok" : "st-gray"}">${g.done ? "Hoàn thành" : "Đang chạy"}</span>
        </div>
        <div class="bar" style="margin-top:9px"><i data-msw="${pct}" ${g.done ? 'style="background:linear-gradient(90deg,#4ade80,#16a34a)"' : ""}></i></div>
      </div>`;
    }).join("") :
    `<div class="empty" style="padding:16px 0"><div class="e-ico">🏁</div>Chưa có cột mốc — sẽ có khi bạn tạo mục tiêu đầu tiên.</div>`;
    setTimeout(() => $$("[data-msw]").forEach(b => b.style.width = b.dataset.msw + "%"), 60);
  }

  /* goal coach */
  $("#coachPlan").textContent = SW_DATA.coachPlan;
  $("#acceptPlan").addEventListener("click", () => toast("Đã chấp nhận kế hoạch 6 tuần — Goal Coach sẽ nhắc bạn mỗi tuần", "🧙"));
  $("#editPlan").addEventListener("click", () => toast("Chỉnh sửa tham số kế hoạch (demo)", "✏️"));
  $("#regenPlan").addEventListener("click", () => {
    const p = $("#coachPlan");
    p.style.animation = "none"; p.offsetHeight; p.style.animation = "page-in .5s";
    p.textContent = "Phương án mới: tăng đóng góp lên 3,5 triệu/tháng từ lương — mục tiêu Đà Nẵng hoàn thành trước Tết, rủi ro thấp.";
    toast("Goal Coach đã tạo phương án mới", "🔄");
  });

  /* ô số tiền tự chấm phần nghìn */
  $("#gTarget").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });

  /* modal nạp tiền / sửa số tiền đã tiết kiệm */
  let savMode = "edit", savId = null;
  function openSav(mode, id, focus) {
    savMode = mode; savId = id;
    const g = goals.find(x => x.id == id);
    $("#savTitle").textContent = mode === "add" ? `Nạp tiền vào "${g.name}"` : "Sửa số tiền đã tiết kiệm";
    $("#savSub").textContent = mode === "add" ? "Số tiền muốn thêm vào mục tiêu này" : `Tổng đang có + đóng góp tháng này cho "${g.name}"`;
    $("#sAmt").value = mode === "edit" ? g.saved.toLocaleString("vi-VN") : "";
    $("#sMonthField").style.display = mode === "edit" ? "" : "none";
    $("#sMonth").value = mode === "edit" ? g.thisMonth.toLocaleString("vi-VN") : "";
    openModal("#savModal");
    if (mode === "edit") setTimeout(() => { $(focus === "month" ? "#sMonth" : "#sAmt").select(); }, 60);
  }
  $("#sAmt").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });
  $("#sMonth").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });
  $("#savForm").addEventListener("submit", e => {
    e.preventDefault();
    const val = parseInt($("#sAmt").value.replace(/\D/g, ""), 10);
    if (isNaN(val) || (savMode === "add" && val <= 0)) { $("#sAmt").classList.add("invalid"); setTimeout(() => $("#sAmt").classList.remove("invalid"), 600); return; }
    const g = goals.find(x => x.id == savId);
    if (savMode === "add") { g.saved += val; g.thisMonth += val; }
    else {
      g.saved = val;
      const m = parseInt($("#sMonth").value.replace(/\D/g, ""), 10);
      g.thisMonth = isNaN(m) ? 0 : m;
    }
    const reached = g.saved >= g.target && !g.done;
    if (reached) g.done = true;
    const pct = Math.min(Math.round(g.saved / g.target * 100), 100);
    /* thông báo kiểu ngân hàng cho lần nạp tiết kiệm */
    if (savMode === "add") SW_DATA.notifications.unshift({
      id: Date.now(),
      group: "Hôm nay",
      type: "Mục tiêu",
      tone: "purple",
      ico: "🎯",
      title: "Mục tiêu",
      desc: `${g.name}<br>Tiến độ tiết kiệm: ${pct}%<br>Số tiền đã gửi: ${val.toLocaleString("vi-VN")} ₫`,
      action: "Xem mục tiêu",
      unread: true
    });
    SWStore.save({ goals: goals, notifications: SW_DATA.notifications });
    render();
    closeModal("#savModal");
    e.target.reset();
    if (reached) toast(`🎉 Chúc mừng — "${g.name}" đã hoàn thành!`, "🎉");
    else toast(savMode === "add" ? `Đã nạp ${fmtMoney(val)} vào "${g.name}" · ${pct}%` : `Đã cập nhật "${g.name}" còn ${fmtMoney(g.saved)} / ${fmtMoney(g.target)}`, savMode === "add" ? "🪙" : "✏️");
  });

  /* tạo mục tiêu */
  $("#goalForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#gName").value.trim(), target = parseInt($("#gTarget").value.replace(/\D/g, ""), 10);
    if (!name || !target) { [$("#gName"), $("#gTarget")].forEach(i => { if (!i.value) { i.classList.add("invalid"); setTimeout(() => i.classList.remove("invalid"), 600); } }); return; }
    goals.push({ id: Date.now(), emoji: $("#gEmoji").value, name, saved: 0, target, monthsLeft: 12, thisMonth: 0, done: false });
    render();
    closeModal("#goalModal");
    e.target.reset();
    toast(`Đã tạo mục tiêu "${name}"`, "🎯");
  });

  $("#themeBtn").addEventListener("click", () => { const dark = toggleTheme(); $("#themeBtn").textContent = dark ? "☀️" : "🌙"; });
  if (document.documentElement.dataset.theme === "dark") $("#themeBtn").textContent = "☀️";
