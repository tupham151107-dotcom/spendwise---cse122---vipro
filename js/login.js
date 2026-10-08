const HOMES = { user: "/app/dashboard.html", coach: "/coach/clients.html", moderator: "/moderator/review.html", admin: "/admin/system.html" };
const homeFor = role => location.protocol === "file:" && role === "user" ? "app/dashboard.html" : HOMES[role];
  const NAMES = { user: "Nguyễn Minh Anh", coach: "Lê Thanh Lan", moderator: "Mai Phương", admin: "Trần Minh Đức" };

  function goRole(role, email) {
    let name = NAMES[role];
    if (email) {
      try {
        const users = JSON.parse(localStorage.getItem("spendwise_users")) || [];
        const u = users.find(x => (x.email || x) === email);
        if (u && u.name) name = u.name;
      } catch (e) {}
    }
    const profile = { name, role, at: Date.now() };
    if (email) profile.email = email;
    SWAuth.set(profile);
    toast("Đăng nhập với vai trò " + role + "…", "🔐");
    setTimeout(() => location.href = homeFor(role), 500);
  }

  const setLoginError = message => {
    const box = $("#loginErr");
    box.querySelector("span").textContent = message;
    box.classList.add("show");
  };

  /* Chỉ xử lý redirect khi Supabase vừa quay về từ OAuth/email.
     Nếu chạy luôn khi đã có session cũ, trang login sẽ tự đá người dùng về dashboard. */
  const callbackQuery = new URLSearchParams(location.search);
  const callbackHash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const hasAuthCallback = callbackQuery.has("code") || callbackQuery.has("token_hash") ||
    callbackHash.has("access_token") || callbackHash.has("error") || callbackHash.has("error_description");
  if (window.SWCloud && hasAuthCallback) {
    SWCloud.finishRedirect().then(profile => {
      if (profile) location.replace(homeFor("user"));
    }).catch(error => setLoginError("Không thể khôi phục phiên đăng nhập: " + error.message));
  }

  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const pw = $("#pw");
    if (pw.value.length < 6) { pw.classList.add("invalid"); setLoginError("Mật khẩu cần ít nhất 6 ký tự."); setTimeout(() => pw.classList.remove("invalid"), 700); return; }
    if (!window.SWCloud) { setLoginError("Không tải được kết nối Supabase. Kiểm tra Internet rồi tải lại trang."); return; }
    SWCloud.signIn($("#email").value, pw.value).then(() => location.replace(homeFor("user")))
      .catch(error => setLoginError(error.message || "Đăng nhập thất bại. Kiểm tra email và mật khẩu."));
  });
  $("#btnGoogle").addEventListener("click", async () => {
    if (!window.SWCloud) { setLoginError("Không tải được kết nối Supabase. Kiểm tra Internet rồi tải lại trang."); return; }
    try { await SWCloud.signInGoogle(); }
    catch (error) { setLoginError(error.message || "Chưa bật đăng nhập Google trong Supabase."); }
  });
  $$("[data-role]").forEach(b => b.addEventListener("click", () => goRole(b.dataset.role)));
