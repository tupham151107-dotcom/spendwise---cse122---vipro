initAppPage();
  const ICO = { "Ăn uống": "c-Ăn", "Đi lại": "c-Đi", "Nhà ở": "c-Nhà", "Giải trí": "c-Giải", "Hóa đơn": "c-Hóa", "Mua sắm": "c-Mua", "Thu nhập": "c-Th" };
  let txs = [...SW_DATA.transactions];

  /* tài khoản mới: bảng trống + ẩn thanh gợi ý AI demo */
  if (window.SW_FRESH) {
    const emp = $(".empty[data-empty-for]");
    if (emp) { emp.classList.remove("hidden"); emp.innerHTML = `<div class="e-ico">🧾</div>Chưa có giao dịch nào — thêm khoản đầu tiên bằng nút “+ Thêm giao dịch”.`; }
    const ai = $("#aiBar"); if (ai) ai.style.display = "none";
  }

  const auth = SWAuth.get();
  if (auth && auth.name) $("#avatar").textContent = auth.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase();

  function render() {
    $("#txBody").innerHTML = txs.map(t => `
      <tr>
        <td><div class="tx-desc"><span class="tx-ico ${ICO[t.cat] || "c-Khác"}"></span><div><b>${t.desc}</b><div class="small muted">${t.cat === "Thu nhập" ? "Nguồn thu" : "Thanh toán " + t.acc}</div></div></div></td>
        <td><span class="badge ${t.amount > 0 ? "b-green" : "b-gray"}">${t.cat}</span></td>
        <td class="muted">${t.acc}</td>
        <td class="muted">${t.date}</td>
        <td class="num" style="text-align:right"><span class="${t.amount > 0 ? "money-pos" : "money-neg"}">${fmtMoneySign(t.amount)}</span></td>
      </tr>`).join("");
    const tin = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const tout = txs.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);
    $("#sumIn").textContent = fmtMoney(tin);
    $("#sumOut").textContent = fmtMoney(tout);
    $("#sumDiff").textContent = "+" + fmtMoney(tin - tout);
    const saved = SW_DATA.goals.reduce((s, g) => s + g.saved, 0);
    $("#sumSaved").textContent = fmtMoney(saved);
    $("#sumSavedFoot").textContent = SW_DATA.goals.length ? SW_DATA.goals.filter(g => !g.done).length + "/" + SW_DATA.goals.length + " mục tiêu đang chạy" : "chưa có mục tiêu";
    $("[data-row-count]").textContent = txs.length;
    const emp = $(".empty[data-empty-for]");
    if (emp) emp.classList.toggle("hidden", txs.length > 0);
    SWStore.save({ transactions: txs, notifications: SW_DATA.notifications });
  }
  render();

  /* lọc theo danh mục */
  $("#catFilter").addEventListener("change", e => {
    const c = e.target.value;
    $$("#txBody tr").forEach((tr, i) => tr.style.display = (!c || txs[i].cat === c) ? "" : "none");
  });

  /* CSV thật bằng Blob */
  $("#csvBtn").addEventListener("click", () => {
    const head = "Mo ta,Danh muc,Tai khoan,Ngay,So tien\n";
    const body = txs.map(t => [t.desc, t.cat, t.acc, t.date, t.amount].join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + head + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "spendwise-giao-dich.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Đã xuất file CSV — kiểm tra thư mục tải về", "📄");
  });

  /* AI suggestion trong modal — mô phỏng theo từ khoá */
  const AI_RULES = [
    [/cà phê|coffee|highlands|trà|bún|phở|bánh|mì|cơm|ăn|lẩu|market|winmart|vinamart/i, "Ăn uống"],
    [/grab|xe|bus|xăng|petrol|taxi|be\b/i, "Đi lại"],
    [/điện|nước|net|wifi|internet|evn|hóa đơn|nhà thuê|rent/i, "Hóa đơn"],
    [/netflix|film|cinema|cgv|game|spotify|karaoke/i, "Giải trí"],
    [/shopee|lazada|tiki|quần|áo|giày|sắm/i, "Mua sắm"],
    [/lương|thưởng|freelance|thu nhập|bonus|interest/i, "Thu nhập"]
  ];
  $("#fDesc").addEventListener("input", e => {
    const v = e.target.value;
    const hit = AI_RULES.find(([re]) => re.test(v));
    $("#aiSuggestTxt").innerHTML = hit
      ? `AI đoán danh mục <b style="color:var(--purple)">${hit[1]}</b> — đã chọn giúp bạn (chỉnh sửa nếu cần)`
      : "Nhập mô tả để nhận gợi ý…";
    if (hit) $("#fCat").value = hit[1];
  });

  /* ô số tiền tự chấm phần nghìn: 65000 -> 65.000 */
  $("#fAmt").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });

  /* thêm giao dịch */
  $("#txForm").addEventListener("submit", e => {
    e.preventDefault();
    const desc = $("#fDesc").value.trim();
    const amt = parseInt($("#fAmt").value.replace(/\D/g, ""), 10);
    if (!desc || !amt) {
      [$("#fDesc"), $("#fAmt")].forEach(i => { if (!i.value) { i.classList.add("invalid"); setTimeout(() => i.classList.remove("invalid"), 600); } });
      return;
    }
    txs.unshift({ desc, cat: $("#fCat").value, acc: "MoMo", date: new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), amount: ($("#fSign").value === "-" ? -1 : 1) * amt });

    /* thông báo kiểu ngân hàng cho giao dịch mới */
    const thu = $("#fSign").value === "+";
    const now = new Date();
    SW_DATA.notifications.unshift({
      id: Date.now(),
      group: "Hôm nay",
      type: thu ? "Thu nhập" : "Chi tiêu",
      tone: thu ? "green" : "orange",
      ico: thu ? "🪙" : "💸",
      title: "SW thông báo tới quý khách",
      desc: `Thời gian giao dịch: ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${now.toLocaleDateString("vi-VN")}<br>Số tiền GD: ${amt.toLocaleString("vi-VN")} ₫<br>Nội dung: ${thu ? "Thu nhập" : "Chi tiêu"} — ${desc}`,
      action: "Xem giao dịch",
      unread: true
    });

    render();
    closeModal("#txModal");
    e.target.reset();
    toast(`Đã thêm "${desc}" vào danh sách`, "🧾");
  });

  /* thanh AI gợi ý */
  $("#aiAccept").addEventListener("click", () => { $("#aiBar").style.animation = "page-in .4s reverse forwards"; setTimeout(() => $("#aiBar").remove(), 400); toast("Đã chấp nhận phân loại của AI (Ăn uống · 92%)", "🤖"); });
  $("#aiDismiss").addEventListener("click", () => { $("#aiBar").remove(); toast("Đã ẩn gợi ý", "🗑"); });
  $("#aiEdit").addEventListener("click", () => { $("#fDesc").value = $("#aiDesc").textContent; openModal("#txModal"); });

  /* hành động trên dòng chọn */
  function selRow() { return $("#txBody tr.selected"); }
  $("#rowDel").addEventListener("click", () => {
    const tr = selRow(); if (!tr) return;
    tr.style.transition = "opacity .3s, transform .3s"; tr.style.opacity = "0"; tr.style.transform = "translateX(24px)";
    setTimeout(() => {
      const idx = [...$("#txBody").children].indexOf(tr);
      txs.splice(idx, 1); render(); $("[data-selbar]").classList.remove("show");
      toast("Đã xóa giao dịch", "🗑");
    }, 300);
  });
  $("#rowEdit").addEventListener("click", () => { toast("Mở form sửa giao dịch (demo)", "✏️"); });
  $("#rowSplit").addEventListener("click", () => { toast("Tách khoản thành 2 giao dịch nhỏ (demo)", "⑂"); });

  $("#themeBtn").addEventListener("click", () => { const dark = toggleTheme(); $("#themeBtn").textContent = dark ? "☀️" : "🌙"; });
  if (document.documentElement.dataset.theme === "dark") $("#themeBtn").textContent = "☀️";
