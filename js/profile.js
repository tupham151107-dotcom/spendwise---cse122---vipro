/* tài khoản mới: về 0, ẩn card demo */
  if (window.SW_FRESH) {
    $$(".stats [data-count]").forEach(el => { el.dataset.count = "0"; el.textContent = el.dataset.money ? "0 ₫" : "0" + (el.dataset.suffix || ""); });
    const feet = $$(".s-foot");
    if (feet[0]) feet[0].textContent = "chưa có dữ liệu";
    if (feet[1]) feet[1].textContent = "bắt đầu từ hôm nay";
    if (feet[2]) feet[2].textContent = "—";
    $("#fPhone").value = ""; $("#fJob").value = ""; $("#fIncome").value = "";
    $$("main .card").forEach(c => { const t = c.textContent; if (t.includes("QUỸ DU LỊCH") || t.includes("GHI CHÚ")) c.style.display = "none"; });
  }
  initAppPage();
  const auth = SWAuth.get();
  const u = SW_DATA.user;
  const name = (auth && auth.name) || u.name;
  const email = (auth && typeof auth.email === "string" ? auth.email.trim() : "");

  const last = name.split(" ").slice(-1)[0];
  const ini = last.slice(0, 2).toUpperCase();
  $("#avatar").textContent = ini; $("#bigAvatar").textContent = ini;
  $("#heroName").textContent = name;
  $("#heroMeta").textContent = [email, u.city, `Tham gia ${u.joined}`].filter(Boolean).join(" · ");

  /* biệt danh theo thâm niên — dùng càng lâu cấp càng cao */
  const RANKS = [
    { min: 0, ico: "🌱", name: "Tân Binh" },
    { min: 7, ico: "⚔️", name: "Chiến Binh" },
    { min: 30, ico: "💼", name: "Đốc Tài" },
    { min: 90, ico: "👑", name: "Đại Gia" },
    { min: 180, ico: "🏆", name: "Huyền Thoại" }
  ];
  const jp = u.joined.split("/").map(Number);
  const daysIn = Math.max(0, Math.floor((Date.now() - new Date(jp[2], jp[1] - 1, jp[0])) / 864e5));
  let rank = RANKS[0], next = null;
  RANKS.forEach((r, i) => { if (daysIn >= r.min) { rank = r; next = RANKS[i + 1] || null; } });
  const mb = $(".member-badge");
  mb.textContent = `${rank.ico} ${rank.name.toUpperCase()}`;
  mb.title = `Thâm niên ${daysIn} ngày`;
  $("#heroMeta").textContent += next
    ? ` · còn ${next.min - daysIn} ngày lên ${next.ico} ${next.name}`
    : " · cấp tối đa";
  $("#fName").value = name;

  /* hồ sơ cá nhân (phone/job/thu nhập) lưu theo tài khoản */
  const prof = SWStore.load().profile || {};
  if (prof.phone) $("#fPhone").value = prof.phone;
  if (prof.job) $("#fJob").value = prof.job;
  if (prof.income != null) $("#fIncome").value = Number(prof.income).toLocaleString("vi-VN");
  else if ($("#fIncome").value) $("#fIncome").value = Number($("#fIncome").value.replace(/\D/g, "")).toLocaleString("vi-VN");

  /* số liệu hồ sơ luôn tính từ dữ liệu thật của tài khoản */
  function updateStats() {
    const sv = $$(".stats .s-value"), feet = $$(".s-foot");
    const tin = SW_DATA.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const tout = SW_DATA.transactions.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);
    const inc = tin || (parseInt(($("#fIncome").value || "").replace(/\D/g, ""), 10) || 0);
    const rate = tin > 0 ? Math.round((tin - tout) / tin * 100) : 0;
    if (sv[0]) { sv[0].dataset.count = inc; sv[0].textContent = inc.toLocaleString("vi-VN") + " ₫"; }
    if (feet[0]) feet[0].textContent = tin ? "từ các giao dịch đã ghi" : (inc ? "theo thu nhập dự kiến" : "chưa có dữ liệu");
    if (sv[1]) { sv[1].dataset.count = rate; sv[1].textContent = rate + "%"; }
    if (sv[2]) { sv[2].dataset.count = SW_DATA.goals.length; sv[2].textContent = SW_DATA.goals.length + " mục tiêu"; }
  }
  updateStats();

  /* ô thu nhập tự chấm phần nghìn */
  $("#fIncome").addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g, "");
    e.target.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });

  const editable = ["#fName", "#fPhone", "#fJob", "#fIncome"];
  let editing = false;
  $("#editBtn").addEventListener("click", () => {
    editing = !editing;
    editable.forEach(s => $(s).disabled = !editing);
    $("#editBtn").textContent = editing ? "💾 Lưu thay đổi" : "✏️ Chỉnh sửa thông tin";
    if (!editing) {
      const newName = $("#fName").value.trim() || name;
      SWAuth.set({ ...(auth || {}), name: newName, role: "user" });
      SWStore.save({ profile: { phone: $("#fPhone").value.trim(), job: $("#fJob").value.trim(), income: parseInt($("#fIncome").value.replace(/\D/g, ""), 10) || 0 } });
      $("#heroName").textContent = newName;
      applyAvatars();
      updateStats();
      toast("Đã lưu hồ sơ cá nhân", "💾");
    } else {
      $("#fName").focus();
      toast("Chế độ chỉnh sửa đang bật", "✏️");
    }
  });

  /* ---- đổi avatar ---- */
  const EMOJIS = ["🦊", "🐼", "🐯", "🐸", "🦄", "🐵", "🐙", "🦁", "🐝", "🌵", "🍕", "🚀"];
  let pick = SWStore.load().avatar || "";
  const drawPreview = () => setAvatarEl($("#avPreview"), pick, ini);
  function renderEmoji() {
    $("#avEmoji").innerHTML = EMOJIS.map(e =>
      `<button type="button" class="btn btn-ghost" style="font-size:19px;padding:7px 0;${pick === e ? "outline:2px solid var(--accent);background:var(--accent-soft)" : ""}" data-e="${e}">${e}</button>`).join("");
    $$("#avEmoji [data-e]").forEach(b => b.addEventListener("click", () => { pick = b.dataset.e; drawPreview(); renderEmoji(); }));
  }
  drawPreview(); renderEmoji();
  $("#bigAvatar").addEventListener("click", () => openModal("#avModal"));
  $("#avatar").addEventListener("click", e => { e.preventDefault(); openModal("#avModal"); });
  $("#avUpload").addEventListener("click", () => $("#avFile").click());
  $("#avReset").addEventListener("click", () => { pick = ""; drawPreview(); renderEmoji(); });
  $("#avFile").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      const s = Math.min(img.width, img.height);
      x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
      pick = c.toDataURL("image/jpeg", 0.85);
      drawPreview();
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
    e.target.value = "";
  });
  $("#avSave").addEventListener("click", async () => {
    SWStore.save({ avatar: pick });
    applyAvatars();
    closeModal("#avModal");
    try {
      const result = window.SWCloud ? await SWCloud.saveAvatar(pick) : { synced: false };
      toast(result.synced
        ? (pick ? "Avatar đã lưu và đồng bộ qua Supabase" : "Đã xoá avatar trên các trình duyệt")
        : "Avatar chỉ lưu trên trình duyệt này. Hãy đăng nhập Supabase để đồng bộ.", result.synced ? "🖼️" : "⚠️");
      if (result.synced) await SWCloud.syncAvatar();
    } catch (error) {
      toast("Lưu trên trình duyệt này được, nhưng đồng bộ cloud lỗi: " + error.message, "⚠️");
    }
  });
