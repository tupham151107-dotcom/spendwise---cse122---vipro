initAppPage();
  let notis = SW_DATA.notifications.map(n => ({ ...n }));

  /* tài khoản mới: bỏ đếm cứng, đổi panel thành lời chào */
  if (window.SW_FRESH) {
    $$(".tabs .cnt").forEach(c => { if (c.id !== "cntAll") c.remove(); });
    const panel = $("#handleBtn").closest(".card");
    panel.querySelector("h3").textContent = "Bắt đầu cùng SpendWise";
    panel.querySelector("p").textContent = "Thêm giao dịch đầu tiên — AI sẽ tự phân loại và bắt đầu theo dõi tài chính của bạn.";
    $("#handleBtn").textContent = "＋ Thêm giao dịch đầu tiên";
  }

  const auth = SWAuth.get();
  if (auth && auth.name) $("#avatar").textContent = auth.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase();

  const TONE = { red: ["var(--red-soft)", "var(--red)"], orange: ["var(--orange-soft)", "var(--orange)"], green: ["var(--accent-soft)", "var(--accent)"], purple: ["var(--purple-soft)", "var(--purple)"], blue: ["var(--blue-soft)", "var(--blue)"] };

  function render() {
    let html = "", lastGroup = "";
    notis.forEach(n => {
      if (n.group !== lastGroup) { html += `<div class="date-chip">${n.group}</div>`; lastGroup = n.group; }
      const [bg, fg] = TONE[n.tone];
      html += `
      <div class="card noti ${n.unread ? "unread" : "readed"}" data-tab-item data-tab="${n.type}" data-id="${n.id}">
        <span class="n-ico" style="background:${bg};color:${fg}">${n.ico}</span>
        <div class="grow">
          <b style="font-size:13.5px">${n.title}</b>
          <div class="small muted">${n.desc}</div>
          <a href="#" class="link mt-8" data-act="${n.id}">${n.action} →</a>
        </div>
        ${n.unread ? `<button class="btn btn-ghost btn-sm" data-read="${n.id}" style="align-self:center">Đã đọc</button>` : ""}
      </div>`;
    });
    $("#notiList").innerHTML = html;
    $("#noNoti").classList.toggle("hidden", notis.length > 0);
    const unread = notis.filter(n => n.unread).length;
    $("#cntAll").textContent = notis.length;
    $("#readAll").innerHTML = unread ? `✓ Đánh dấu tất cả đã đọc (${unread})` : "✓ Tất cả đã đọc";
    $("#allCaught").classList.toggle("hidden", unread > 0 || !notis.length);

    $$("[data-read]").forEach(b => b.addEventListener("click", () => {
      const n = notis.find(x => x.id == b.dataset.read);
      n.unread = false; render(); initTabs();
      toast("Đã đánh dấu đã đọc", "👁️");
    }));
    $$("[data-act]").forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      const n = notis.find(x => x.id == a.dataset.act);
      n.unread = false; render(); initTabs();
      toast(`"${n.title}" — mở liên kết (demo)`, "↗");
    }));
    SWStore.save({ notifications: notis });
  }
  render();

  $("#readAll").addEventListener("click", () => {
    notis.forEach(n => n.unread = false);
    render(); initTabs();
    $("#readPill").classList.add("show");
    setTimeout(() => $("#readPill").classList.remove("show"), 2000);
    toast("Tất cả thông báo đã được đánh dấu là đã đọc", "✅");
  });

  $("#handleBtn").addEventListener("click", () => {
    if (window.SW_FRESH) { location.href = "transactions.html"; return; }
    const odd = notis.find(n => n.title.includes("lạ"));
    if (odd) { odd.unread = false; render(); initTabs(); }
    toast("Giao dịch Tech Shop đã được xác nhận là của bạn", "🛡️");
  });
