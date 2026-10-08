initAppPage();
  const auth = SWAuth.get();
  if (auth && auth.name) {
    $("#avatar").textContent = auth.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase();
    $("#emailNow").textContent = auth.email || "minhanh.nguyen@email.com";
  }

  function nowStr() { const d = new Date(); return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }); }

  /* chính nút này là chỉ báo: sạch = "✓ Đã lưu", động vào tuỳ chọn = "Lưu thay đổi" */
  const saveBtn = $("#saveBtn"), savedTxt = $("#savedTxt"), savedAt = $("#savedAt");
  function markDirty() {
    saveBtn.disabled = false;
    saveBtn.classList.replace("btn-ghost", "btn-primary");
    savedTxt.textContent = "Lưu thay đổi";
    savedAt.textContent = "";
  }
  function markSaved() {
    saveBtn.disabled = true;
    saveBtn.classList.replace("btn-primary", "btn-ghost");
    savedTxt.textContent = "✓ Đã lưu";
    savedAt.textContent = nowStr();
  }

  const currencySelect = $("#currencySelect");
  currencySelect.value = getCurrency();
  currencySelect.addEventListener("change", () => {
    setCurrency(currencySelect.value);
    toast(currencySelect.value === "USD" ? "Đã đổi số liệu sang USD ($)" : "Đã đổi số liệu sang VND (₫)", "💱");
  });

  const langSelect = $("#langSelect");
  langSelect.value = getLang();
  langSelect.addEventListener("change", () => setLang(langSelect.value));

  /* mọi toggle/select -> đánh dấu chưa lưu */
  $$("[data-set]").forEach(el => el.addEventListener("change", markDirty));

  /* dark mode toggle đồng bộ với theme */
  const dt = $("#darkToggle");
  dt.checked = document.documentElement.dataset.theme === "dark";
  dt.addEventListener("change", () => {
    const dark = toggleTheme();
    dt.checked = dark;
    toast(dark ? "Đã bật chế độ tối 🌙" : "Đã tắt chế độ tối ☀️", "🎨");
  });

  $("#saveBtn").addEventListener("click", () => { markSaved(); toast("Đã lưu toàn bộ cài đặt", "💾"); });
  $("#changeEmail").addEventListener("click", () => toast("Gửi email xác thực đổi địa chỉ (demo)", "📧"));
  $("#logoutCurrent").addEventListener("click", () => { SWAuth.logout(); });
  $$("[data-revoke]").forEach(b => b.addEventListener("click", () => { b.closest(".set-row").style.opacity = .4; toast("Đã thu hồi phiên đăng nhập", "🔒"); }));
  const deviceList = $("#deviceList"), deviceCount = $("#deviceCount");
  const refreshDevices = async () => {
    if (!window.SWCloud) {
      deviceCount.textContent = "Chưa kết nối Supabase Auth.";
      deviceList.innerHTML = '<p class="small muted">Không thể tải phiên đăng nhập.</p>';
      return;
    }
    try {
      const [rows, currentSession] = await Promise.all([SWCloud.listDevices(), SWCloud.currentSessionId()]);
      const activeSince = Date.now() - 2 * 60 * 1000;
      const activeCount = rows.filter(row => Date.parse(row.last_seen) >= activeSince).length;
      deviceCount.textContent = `${activeCount} thiết bị hoạt động gần đây (${rows.length} phiên đã ghi nhận)`;
      if (!rows.length) {
        deviceList.innerHTML = '<p class="small muted">Chưa có thiết bị nào được ghi nhận. Hãy chạy file SQL thiết lập theo hướng dẫn.</p>';
        return;
      }
      deviceList.replaceChildren(...rows.map(row => {
        const item = document.createElement("div");
        item.className = "set-row";
        const info = document.createElement("div");
        const title = document.createElement("div");
        title.className = "t";
        title.textContent = row.device_label || "Trình duyệt không xác định";
        const date = document.createElement("div");
        date.className = "d";
        date.textContent = `Hoạt động lần cuối: ${new Date(row.last_seen).toLocaleString("vi-VN")}`;
        info.append(title, date);
        const badge = document.createElement("span");
        badge.className = `badge ${row.session_id === currentSession ? "b-green" : ""}`;
        badge.textContent = row.session_id === currentSession ? "Thiết bị này" : (Date.parse(row.last_seen) >= activeSince ? "Đang hoạt động" : "Không hoạt động");
        item.append(info, badge);
        return item;
      }));
    } catch (error) {
      deviceCount.textContent = "Chưa thiết lập bảng theo dõi thiết bị.";
      deviceList.innerHTML = '<p class="small muted">Hãy chạy <code>supabase/device-session-tracking.sql</code> trong SQL Editor của Supabase, sau đó tải lại trang.</p>';
      console.error("Không tải được phiên thiết bị:", error);
    }
  };
  $("#refreshDevices").addEventListener("click", refreshDevices);
  refreshDevices();
  window.setInterval(refreshDevices, 60_000);

  $("#exportBtn").addEventListener("click", () => toast("Chuẩn bị file xuất dữ liệu… (demo)", "📦"));
  $$("[data-goto-tab]").forEach(b => b.addEventListener("click", () => {
    const btn = $$("[data-tabs] button").find(x => x.dataset.filter === b.dataset.gotoTab);
    if (btn) btn.click();
  }));
