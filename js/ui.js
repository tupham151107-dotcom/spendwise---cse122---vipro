/* =====================================================
   SpendWise — ui.js : tiện ích dùng chung
   ===================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- tiền tệ dùng chung ---------- */
const SW_CURRENCY_KEY = "sw_currency";
const SW_VND_PER_USD = 25000; // Tỷ giá minh họa cố định cho dữ liệu demo.
function getCurrency() { return localStorage.getItem(SW_CURRENCY_KEY) === "USD" ? "USD" : "VND"; }
function formatCurrencyAmount(value, currency = getCurrency()) {
  const amount = Math.abs(Number(value) || 0);
  return currency === "USD"
    ? "$" + (amount / SW_VND_PER_USD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(amount).toLocaleString("vi-VN") + " ₫";
}
const fmtMoney = n => formatCurrencyAmount(n);
const fmtMoneySign = n => (n < 0 ? "−" : "+") + formatCurrencyAmount(n);

const currencyTextState = new Map();
function parseLocalizedAmount(raw) {
  let value = raw.trim().replace(/\s/g, "");
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) value = value.replace(/\./g, "");
  return Number(value) || 0;
}
function formatCurrencyText(source) {
  const currency = getCurrency();
  const amountToken = "[+-]?\\s*\\d[\\d.,]*";
  const listPattern = new RegExp(`(\\s*)(${amountToken}(?:\\s*\\/\\s*${amountToken})*)\\s*(triệu|tr|k)?\\s*(₫|đ)`, "giu");
  let text = source.replace(listPattern, (_match, leadingSpace, rawAmounts, unit) => {
    const multiplier = /^triệu$|^tr$/i.test(unit || "") ? 1000000 : /^k$/i.test(unit || "") ? 1000 : 1;
    return leadingSpace + rawAmounts.split("/").map(part => {
      const trimmed = part.trim();
      const sign = /^[+\-−]/.test(trimmed) ? trimmed[0] : "";
      const amount = parseLocalizedAmount(trimmed.replace(/^[+\-−]\s*/, "")) * multiplier;
      return sign + formatCurrencyAmount(amount, currency);
    }).join(" / ");
  });
  const dollarPattern = /(\s*)([+\-−]?)\s*\$\s*([\d,]+(?:\.\d+)?)/g;
  text = text.replace(dollarPattern, (_match, leadingSpace, sign, rawAmount) => {
    const amount = Number(rawAmount.replace(/,/g, "")) || 0;
    if (currency === "USD") return leadingSpace + sign + "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return leadingSpace + sign + formatCurrencyAmount(amount * SW_VND_PER_USD, "VND");
  });
  return text;
}
function formatCurrencyTextNode(node) {
  const current = node.nodeValue;
  const host = node.parentElement;
  /* không đụng vào text của thẻ máy / script bên thứ ba (widget Chatbase chèn <style> vào body) */
  if (host && /^(STYLE|SCRIPT|TEXTAREA|TITLE)$/.test(host.tagName)) return;
  let state = currencyTextState.get(node);
  if (!state) {
    if (!/[₫đ$]/.test(current)) return;
    state = { source: current, rendered: null };
    currencyTextState.set(node, state);
  } else if (current !== state.rendered) state.source = current;
  const rendered = formatCurrencyText(state.source);
  state.rendered = rendered;
  if (current !== rendered) node.nodeValue = rendered;
}
function formatCurrencyTree(root) {
  if (root.nodeType === Node.TEXT_NODE) { formatCurrencyTextNode(root); return; }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) formatCurrencyTextNode(walker.currentNode);
}
function refreshCurrencyDisplay() {
  for (const [node, state] of currencyTextState) {
    if (!node.isConnected) { currencyTextState.delete(node); continue; }
    const rendered = formatCurrencyText(state.source);
    state.rendered = rendered;
    if (node.nodeValue !== rendered) node.nodeValue = rendered;
  }
}
function setCurrency(currency) {
  localStorage.setItem(SW_CURRENCY_KEY, currency === "USD" ? "USD" : "VND");
  refreshCurrencyDisplay();
}
function initCurrencyDisplay() {
  formatCurrencyTree(document.body);
  const observer = new MutationObserver(records => records.forEach(record => {
    if (record.type === "characterData") formatCurrencyTextNode(record.target);
    else record.addedNodes.forEach(node => formatCurrencyTree(node));
  }));
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  window.addEventListener("storage", event => {
    if (event.key === SW_CURRENCY_KEY) refreshCurrencyDisplay();
  });
}
initCurrencyDisplay();

/* ---------- theme ---------- */
function initTheme() {
  const t = localStorage.getItem("sw_theme");
  if (t === "dark") document.documentElement.dataset.theme = "dark";
}
initTheme();
function toggleTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "" : "dark";
  localStorage.setItem("sw_theme", dark ? "light" : "dark");
  syncThemeButton();
  return !dark;
}
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  const button = $("#themeBtn");
  if (!button) return;
  button.textContent = dark ? "🌙" : "☀️";
  button.title = dark ? "Giao diện tối" : "Giao diện sáng";
  button.setAttribute("aria-label", dark ? "Giao diện tối" : "Giao diện sáng");
}

/* ---------- ngôn ngữ giao diện (VI ↔ EN) ---------- */
const SW_LANG_KEY = "sw_lang";
const SW_TITLE_SRC = document.title;
/* Chỉ nhãn giao diện; dữ liệu do người dùng nhập vẫn giữ nguyên văn. */
const SW_EN = {
  "Cá nhân": "Personal", "Coach": "Coach", "Kiểm duyệt": "Moderation", "Quản trị": "Admin",
  "Tổng quan": "Overview", "Giao dịch": "Transactions", "Ngân sách": "Budget", "Mục tiêu": "Goals",
  "Insight AI": "AI Insights", "Thông báo": "Notifications", "Hồ sơ": "Profile", "Cài đặt": "Settings",
  "Khách hàng": "Clients", "Duyệt ngân sách": "Budget review", "Tài nguyên": "Resources", "Lịch hẹn": "Appointments",
  "Chờ duyệt": "Pending review", "Mẫu AI": "AI templates", "Phản hồi": "Feedback", "Lịch sử": "History",
  "Hệ thống": "System", "Người dùng": "Users", "Danh mục": "Categories", "Cửa hàng": "Store",
  "Thu gọn / mở thanh bên": "Collapse / expand sidebar", "Mở thanh bên": "Open sidebar", "Đổi giao diện": "Switch theme",
  "Ăn uống": "Food", "Đi lại": "Transport", "Nhà ở": "Housing", "Giải trí": "Entertainment",
  "Hóa đơn": "Bills", "Mua sắm": "Shopping", "Khác": "Other", "Thu nhập": "Income", "Tiết kiệm": "Savings",
  "Tổng quan tài chính": "Financial overview", "Số dư khả dụng": "Available balance", "Chi tiêu": "Spending",
  "Đã tiết kiệm": "Saved", "2 nguồn thu": "2 income sources", "thu nhập": "income", "tháng này": "this month",
  "Xu hướng chi tiêu": "Spending trend", "6 tuần gần nhất · đơn vị triệu ₫": "last 6 weeks · million ₫",
  "−12% so với đỉnh": "−12% vs peak", "Chi tiết →": "Details →", "Đã dùng": "Used", "Đã chi": "Spent",
  "Giao dịch gần đây": "Recent transactions", "Xem tất cả →": "View all →", "Xem tất cả": "View all",
  "Ngày": "Date", "Số tiền": "Amount", "Số tiền (₫)": "Amount (₫)", "Mô tả": "Description",
  "Quản lý giao dịch": "Manage transactions", "Thêm giao dịch": "Add transaction", "Tìm giao dịch...": "Search transactions...",
  "Tổng thu": "Total income", "Tổng chi": "Total spending", "Tỷ lệ tiết kiệm": "Savings rate",
  "⬇ Xuất CSV": "⬇ Export CSV", "⬇ Xuất": "⬇ Export", "Xuất dữ liệu": "Export data",
  "≡ Danh mục: Tất cả": "≡ Category: All", "⑂ Tách khoản": "⑂ Split item", "☕ Rà soát cà phê": "☕ Coffee review",
  "🌙 Auto-save lương": "🌙 Salary auto-save", "📊 Kiểm tra Chủ nhật": "📊 Sunday check-in",
  "Nhập mô tả để nhận gợi ý…": "Type a description to get suggestions…", "VD: Cà phê The Coffee House 65K": "e.g. Coffee house 65K",
  "VD: Mua máy ảnh": "e.g. New camera", "Thu nhập dự kiến (₫)": "Expected income (₫)", "Thu nhập hàng tháng": "Monthly income",
  "Lưu": "Save", "Hủy": "Cancel", "Sửa": "Edit", "✏️ Sửa": "✏️ Edit", "🗑 Xóa": "🗑 Delete", "Đổi": "Change",
  "Tất cả": "All", "Đã chọn:": "Selected:", "Đã duyệt": "Approved",
  "Hạn mức theo danh mục · tổng 24.000.000 ₫": "Caps by category · total 24,000,000 ₫",
  "Còn lại": "Left", "Hạn mức (₫)": "Cap (₫)", "Nhịp chi an toàn": "Safe daily spend",
  "/ngày còn lại của tháng": "/day for the rest of the month", "Tiến độ tháng": "Month progress",
  "Ngân sách được coach duyệt": "Coach-approved budget", "Chi tiêu theo danh mục": "Spending by category",
  "kèm đường xu hướng": "with trend line", "＋ Thêm cột": "＋ Add bar", "Thêm cột": "Add bar",
  "Thêm cột vào biểu đồ": "Add a bar to the chart", "Một danh mục và số tiền đã tiêu": "A category and the amount spent",
  "Chưa có khoản chi nào — ghi giao dịch hoặc bấm “＋ Thêm cột”.": "No spending yet — record a transaction or press “＋ Add bar”.",
  "Thêm hạn mức": "Add cap", "Đặt trần chi cho một danh mục": "Set a ceiling for a category",
  "Mục tiêu tiết kiệm": "Savings goals", "Đếm ngược từng bước tới đích": "Counting down every step to the goal",
  "Tổng đã tiết kiệm": "Total saved", "3 mục tiêu đang chạy": "3 active goals", "Tiến độ trung bình": "Average progress",
  "Đóng góp tháng này": "Contributed this month", "đều đặn 3 tháng liền": "steady for 3 months",
  "+ Tạo mục tiêu": "+ New goal", "Tạo mục tiêu": "Create goal", "Tạo mục tiêu mới": "Create a new goal",
  "Đặt đích rõ ràng, tiến độ tự động": "Set a clear target, progress updates itself",
  "Tên mục tiêu": "Goal name", "Số tiền mục tiêu (₫)": "Target amount (₫)", "Biểu tượng": "Icon",
  "Số tiền đã tiết kiệm": "Amount saved", "Nhập số tiền": "Enter an amount",
  "Đóng góp tháng này (₫) — để 0 nếu muốn xóa": "This month's contribution (₫) — set 0 to clear",
  "Cột mốc gần nhất": "Latest milestone", "GOAL COACH · KẾ HOẠCH 6 TUẦN": "GOAL COACH · 6-WEEK PLAN",
  "✓ Chấp nhận kế hoạch": "✓ Accept plan", "Tạo lại": "Regenerate", "chưa có mục tiêu": "no goals yet",
  "Những gì đang xảy ra với tiền của bạn": "What's happening with your money",
  "✓ Đánh dấu tất cả đã đọc": "✓ Mark all as read", "7 ngày gần đây ▾": "Last 7 days ▾",
  "Không có thông báo nào trong mục này.": "No notifications in this group.",
  "Cần bạn xem": "Needs your review", "Xử lý ngay": "Handle now",
  "Thông tin cá nhân": "Personal details", "✏️ Chỉnh sửa thông tin": "✏️ Edit details",
  "Đổi avatar": "Change avatar", "📷 Tải ảnh lên": "📷 Upload photo", "Số điện thoại": "Phone number",
  "hồ sơ hoàn thiện": "profile complete", "✦ THÀNH VIÊN": "✦ MEMBER",
  "Tuỳ chỉnh trải nghiệm SpendWise": "Personalise your SpendWise",
  "Tài khoản": "Account", "Bảo mật": "Security", "Giao diện": "Appearance", "Quyền riêng tư": "Privacy",
  "Tùy chọn AI": "AI preferences", "Tài khoản & hiển thị": "Account & display",
  "Ngôn ngữ": "Language", "Ngôn ngữ hiển thị của app": "App display language", "Tiếng Việt": "Vietnamese",
  "Đơn vị tiền tệ": "Currency", "Quy đổi minh họa theo tỷ giá cố định 1 USD = 25.000 VND": "Illustrative conversion at a fixed 1 USD = 25,000 VND",
  "Dùng cho mọi số liệu · tỷ giá demo cố định": "Used for every figure · fixed demo exchange rate", "Hồ sơ cá nhân": "Personal profile",
  "Giao dịch tối": "Late-night transactions", "Nhắc khi phát sinh sau 22:00": "Remind me after 22:00",
  "Thông báo email": "Email notifications", "Tóm tắt hàng tuần vào sáng thứ Hai": "Weekly summary on Monday morning",
  "Cảnh báo vượt ngân sách": "Budget overrun alerts", "Gửi ngay khi đạt 90% hạn mức": "Sent at 90% of the cap",
  "Mật khẩu & xác thực": "Password & authentication", "Đổi mật khẩu": "Change password",
  "Cập nhật lần trước 84 ngày trước": "Last updated 84 days ago",
  "Xác thực 2 lớp (2FA)": "Two-factor authentication (2FA)", "Bảo vệ tài khoản bằng app authenticator": "Protect your account with an authenticator app",
  "Đăng xuất mọi thiết bị": "Sign out everywhere", "3 thiết bị đang đăng nhập": "3 devices signed in",
  "Đăng xuất": "Sign out", "Phiên đăng nhập": "Sessions", "Hiện tại": "Current", "Thu hồi": "Revoke",
  "Đang dùng · TP. Hồ Chí Minh": "Active · Ho Chi Minh City",
  "🌙 Chế độ tối": "🌙 Dark mode", "Áp dụng ngay cho toàn bộ ứng dụng": "Applies instantly across the app",
  "Kích thước chữ": "Font size", "Chuẩn": "Default", "To": "Large", "Dễ đọc hơn trên màn hình nhỏ": "Easier to read on small screens",
  "Hiệu ứng chuyển động": "Motion effects", "Biểu đồ vẽ chậm, đếm số tăng dần": "Slow chart draw, count-up numbers",
  "Quyền riêng tư & dữ liệu": "Privacy & data", "Ẩn số dư khi người khác nhìn màn hình": "Hide balance when others look at your screen",
  "Hiển thị •••••• cho tới khi chạm giữ": "Shows •••••• until you press and hold",
  "CSV hoặc PDF toàn bộ giao dịch": "CSV or PDF of all transactions", "Quản lý đăng nhập và 2FA": "Manage sign-in and 2FA",
  "Mở →": "Open →", "CAM KẾT RIÊNG TƯ": "PRIVACY PROMISE",
  "Dữ liệu của bạn không bao giờ được bán. AI chỉ đọc dữ liệu đã ẩn danh và mọi phân tích chạy trong môi trường cách ly.": "Your data is never sold. AI reads anonymised data only and every analysis runs in an isolated environment.",
  "✨ Insight chi tiêu bằng AI": "✨ AI spending insights", "Gợi ý điều chỉnh ngân sách hằng tuần": "Weekly budget adjustment tips",
  "🤖 Tự động phân loại giao dịch": "🤖 Auto-categorise transactions", "AI gán danh mục, bạn chỉ cần xác nhận": "AI picks the category, you just confirm",
  "🎯 Cá nhân hoá thông minh": "🎯 Smart personalisation", "Học thói quen để đề xuất chính xác hơn": "Learns habits for sharper suggestions",
  "Độ chính xác hiện tại": "Current accuracy",
  "Lưu thay đổi": "Save changes", "✓ Đã lưu": "✓ Saved", "● Chưa lưu": "● Unsaved",
  "Đã lưu toàn bộ cài đặt": "All settings saved", "Đã bật chế độ tối 🌙": "Dark mode on 🌙", "Đã tắt chế độ tối ☀️": "Dark mode off ☀️",
  "Đã đổi số liệu sang USD ($)": "Amounts switched to USD ($)", "Đã đổi số liệu sang VND (₫)": "Amounts switched to VND (₫)"
};
const SW_VI = Object.fromEntries(Object.entries(SW_EN).map(([vi, en]) => [en, vi]));

function getLang() { return localStorage.getItem(SW_LANG_KEY) === "en" ? "en" : "vi"; }
function setLang(lang) { localStorage.setItem(SW_LANG_KEY, lang === "en" ? "en" : "vi"); refreshLang(); }
/* cho nội dung vẽ bằng canvas/tooltip — thứ mà MutationObserver không với tới */
function L(text) { const t = String(text).trim(); return getLang() === "en" ? (SW_EN[t] || text) : text; }

const langTextState = new WeakMap();
function translateTextNode(node) {
  const current = node.nodeValue;
  const host = node.parentElement;
  if (!host || /^(STYLE|SCRIPT|TEXTAREA|TITLE)$/.test(host.tagName)) return;
  const state = langTextState.get(node);
  const source = state && current === state.rendered ? state.source : current;
  const parts = /^(\s*)([\s\S]*?)(\s*)$/.exec(source);
  const key = parts[2];
  const swapped = getLang() === "en" ? (SW_EN[key] || key) : (SW_VI[key] && SW_EN[SW_VI[key]] === key ? SW_VI[key] : key);
  const rendered = swapped === key ? source : parts[1] + swapped + parts[3];
  if (!state && rendered === current) return;
  langTextState.set(node, { source, rendered });
  if (current !== rendered) node.nodeValue = rendered;
}
function translateAttrs(el) {
  const en = getLang() === "en";
  ["title", "placeholder"].forEach(attr => {
    if (!el.getAttribute) return;
    const v = el.getAttribute(attr);
    if (!v) return;
    const t = v.trim();
    const swapped = en ? (SW_EN[t] || t) : (SW_VI[t] && SW_EN[SW_VI[t]] === t ? SW_VI[t] : t);
    if (swapped !== t) el.setAttribute(attr, swapped);
  });
}
function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  translateAttrs(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n); else translateAttrs(n);
  }
}
function refreshLang() {
  const en = getLang() === "en";
  document.documentElement.lang = getLang();
  document.title = SW_TITLE_SRC.split(" — ").map(p => (en ? SW_EN[p] || p : p)).join(" — ");
  translateTree(document.body);
}
function initLangDisplay() {
  const observer = new MutationObserver(records => records.forEach(record => {
    if (record.type === "characterData") translateTextNode(record.target);
    else record.addedNodes.forEach(node => translateTree(node));
  }));
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  window.addEventListener("storage", event => { if (event.key === SW_LANG_KEY) refreshLang(); });
}
initLangDisplay();


/* ---------- toast ---------- */
function toast(msg, ico = "✅") {
  let zone = $(".toast-zone");
  if (!zone) { zone = document.createElement("div"); zone.className = "toast-zone"; document.body.appendChild(zone); }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="t-ico">${ico}</span><span>${msg}</span>`;
  zone.appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, 3000);
}

/* ---------- ripple cho nút ---------- */
document.addEventListener("click", e => {
  const btn = e.target.closest(".btn, .icon-btn, .tabs button");
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const rip = document.createElement("span");
  const size = Math.max(r.width, r.height);
  rip.className = "ripple";
  rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  btn.appendChild(rip);
  setTimeout(() => rip.remove(), 600);
});

/* ---------- dropdown ---------- */
document.addEventListener("click", e => {
  const dd = e.target.closest(".dd");
  $$(".dd.open").forEach(d => { if (d !== dd) d.classList.remove("open"); });
  if (dd && e.target.closest(".dd-toggle")) dd.classList.toggle("open");
});
document.addEventListener("click", e => { if (!e.target.closest(".dd")) $$(".dd.open").forEach(d => d.classList.remove("open")); });

/* ---------- modal ---------- */
function openModal(sel) { const m = typeof sel === "string" ? $(sel) : sel; m.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(sel) { const m = typeof sel === "string" ? $(sel) : sel; m.classList.remove("open"); document.body.style.overflow = ""; }
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-back")) closeModal(e.target);
  if (e.target.closest("[data-close]")) closeModal(e.target.closest(".modal-back"));
  if (e.target.closest("[data-modal]")) {
    const m = $(e.target.closest("[data-modal]").dataset.modal);
    if (m) openModal(m);
  }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { $$(".modal-back.open").forEach(closeModal); $$(".dd.open").forEach(d => d.classList.remove("open")); } });

/* ---------- tabs ---------- */
function initTabs(root = document) {
  $$("[data-tabs]", root).forEach(group => {
    const btns = $$("button", group);
    const target = $(group.dataset.tabs);
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const f = b.dataset.filter || "*";
      $$("[data-tab-item]", target).forEach(item => {
        const show = f === "*" || item.dataset.tab === f;
        item.style.display = show ? "" : "none";
        if (show) { item.style.animation = "none"; item.offsetHeight; item.style.animation = "page-in .35s ease both"; }
      });
      group.dispatchEvent(new CustomEvent("tabchange", { detail: f }));
    }));
  });
}
initTabs();

/* ---------- đếm số tăng dần ---------- */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dur = parseInt(el.dataset.dur || 1100);
  const isMoney = el.dataset.money !== undefined;
  const dec = el.dataset.dec ? parseFloat(el.dataset.dec) : 0;
  const t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const v = target * ease;
    if (isMoney) el.textContent = formatCurrencyAmount(v);
    else el.textContent = v.toLocaleString("vi-VN", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function initCounters(root = document) {
  const els = $$("[data-count]", root);
  if (!("IntersectionObserver" in window)) { els.forEach(el => { el.dataset.money = ""; countUp(el); }); return; }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
  }), { threshold: .4 });
  els.forEach(el => io.observe(el));
}

/* ---------- reveal on scroll ---------- */
function initReveal(root = document) {
  const els = $$(".reveal", root);
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach((en, i) => {
    if (en.isIntersecting) { setTimeout(() => en.target.classList.add("in"), i * 70); io.unobserve(en.target); }
  }), { threshold: .12 });
  els.forEach(el => io.observe(el));
}

/* ---------- eye toggle mật khẩu ---------- */
document.addEventListener("click", e => {
  const eye = e.target.closest(".eye");
  if (!eye) return;
  const inp = eye.parentElement.querySelector("input");
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  eye.textContent = show ? "🙈" : "👁️";
});

/* ---------- thanh chọn dòng trong bảng ---------- */
function initRowSelect(root = document) {
  const tbody = $("[data-select-rows]", root);
  const selbar = $("[data-selbar]", root);
  if (!tbody || !selbar) return;
  const label = $("[data-selbar-label]", selbar);
  tbody.addEventListener("click", e => {
    const tr = e.target.closest("tr");
    if (!tr || e.target.closest("a, button")) return;
    const was = tr.classList.contains("selected");
    $$("tr.selected", tbody).forEach(r => r.classList.remove("selected"));
    if (!was) {
      tr.classList.add("selected");
      label.textContent = tr.cells[0].textContent.trim();
      selbar.classList.add("show");
    } else selbar.classList.remove("show");
  });
}

/* ---------- lọc bảng trực tiếp ---------- */
function initLiveFilter(root = document) {
  $$("[data-live]", root).forEach(inp => {
    const table = $(inp.dataset.live);
    if (!table) return;
    const rows = $$("tbody tr", table);
    inp.addEventListener("input", () => {
      const q = inp.value.toLowerCase().trim();
      let shown = 0;
      rows.forEach(r => {
        const hit = r.textContent.toLowerCase().includes(q);
        r.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      const empty = $(".empty[data-empty-for]", table.closest(".card") || table.parentElement);
      if (empty) empty.classList.toggle("hidden", shown > 0);
      const cnt = $("[data-row-count]");
      if (cnt) cnt.textContent = shown;
    });
  });
}

/* ---------- auth (mô phỏng) ---------- */
const IN_SUBFOLDER = /\/(app|coach|moderator|admin)\//.test(location.pathname);
const LOGIN_URL = IN_SUBFOLDER ? "../login.html" : "login.html";
const SWAuth = {
  KEY: "sw_auth",
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; } },
  set(profile) { localStorage.setItem(this.KEY, JSON.stringify(profile)); },
  get role() { return (this.get() || {}).role || null; },
  async logout() {
    if (window.SWCloud) { try { await SWCloud.signOut(); } catch (_) {} }
    localStorage.removeItem(this.KEY); location.href = LOGIN_URL;
  },
  require() {
    if (!this.get()) { location.replace(LOGIN_URL); throw new Error("auth"); }
  }
};

/* ---------- avatar cá nhân (emoji hoặc ảnh, lưu theo tài khoản) ---------- */
function setAvatarEl(el, av, ini) {
  if (av && av.startsWith("data:")) {
    el.textContent = "";
    el.style.color = "transparent";
    el.style.backgroundImage = `url(${av})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  } else if (av && /^https:\/\//i.test(av)) {
    el.textContent = "";
    el.style.color = "transparent";
    el.style.backgroundImage = `url("${av.replace(/["\\]/g, "")}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  } else {
    el.style.backgroundImage = "";
    el.style.color = "";
    el.textContent = av || ini;
  }
}
function applyAvatars() {
  const auth = SWAuth.get();
  const name = (auth && auth.name) || SW_DATA.user.short;
  const ini = name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase();
  const av = SWStore.load().avatar || "";
  $$("#avatar, #bigAvatar, .sidebar .user-box .avatar").forEach(el => setAvatarEl(el, av, ini));
  if (window.SWCloud) SWCloud.syncAvatar().catch(error => console.warn("Supabase avatar sync:", error.message));
}
window.addEventListener("load", applyAvatars);

/* ---------- sidebar + shell theo vai trò ---------- */
const SW_NAV = {
  user: { chip: "Cá nhân", chipCls: "b-green", home: "dashboard.html", items: [
    ["🗂️", "Tổng quan", "dashboard.html"], ["🔁", "Giao dịch", "transactions.html"],
    ["💰", "Ngân sách", "budgets.html"], ["🎯", "Mục tiêu", "goals.html"],
    ["✨", "Insight AI", "dashboard.html#insight"], ["⚙️", "Cài đặt", "settings.html"]
  ]},
  coach: { chip: "Coach", chipCls: "b-blue", home: "clients.html", items: [
    ["👥", "Khách hàng", "clients.html"], ["🧾", "Duyệt ngân sách", "budget-review.html"],
    ["📚", "Tài nguyên", "resources.html"], ["📅", "Lịch hẹn", null]
  ]},
  moderator: { chip: "Kiểm duyệt", chipCls: "b-purple", home: "review.html", items: [
    ["📥", "Chờ duyệt", "review.html"], ["🤖", "Mẫu AI", "ai-templates.html"],
    ["💬", "Phản hồi", "feedback.html"], ["🕘", "Lịch sử", null]
  ]},
  admin: { chip: "Quản trị", chipCls: "b-orange", home: "system.html", items: [
    ["🖥️", "Hệ thống", "system.html"], ["🙋", "Người dùng", "users.html"],
    ["🏷️", "Danh mục", "categories.html"], ["🏪", "Cửa hàng", null]
  ]}
};

/* ---------- ngữ cảnh tài chính thật → đẩy sang bot Chatbase ---------- */
const swPct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function swFinData() {
  const d = window.SW_DATA || {};
  const st = window.SWStore ? SWStore.load() : {};
  const now = new Date();
  /* store là nguồn đúng nhất khi vừa thêm/sửa trong trang (nhiều trang giữ bản sao riêng) */
  const txs = Array.isArray(st.transactions) ? st.transactions : (d.transactions || []);
  const goals = Array.isArray(st.goals) ? st.goals : (d.goals || []);
  const out = {
    goals: goals.filter(g => Number(g.target) > 0),
    caps: st.budgets || (window.SW_FRESH ? [] : (window.DEMO_BUDGETS || []).map(b => ({ ...b }))),
    txs,
    income: txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    expense: txs.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0),
    byCat: {},
    daysLeft: Math.max(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(), 1)
  };
  txs.filter(t => t.amount < 0).forEach(t => { out.byCat[t.cat] = (out.byCat[t.cat] || 0) - t.amount; });
  return out;
}

/* Viết gọn số cho bot: 1.250.000 → 1.25tr, 45.000 → 45k */
const swShort = n => {
  const a = Math.abs(n);
  const v = a >= 1e6 ? +(a / 1e6).toFixed(2) + "tr" : a >= 1e3 ? Math.round(a / 1e3) + "k" : String(Math.round(a));
  return (n < 0 ? "-" : "") + v;
};

/* Chatbase yêu cầu mỗi thuộc tính là một chuỗi, nên tách số liệu thành từng nhóm nhỏ */
const swClip = s => (s.length > 240 ? s.slice(0, 237) + "..." : s);

function swFinAttributes() {
  const D = swFinData();
  const now = new Date();
  const a = {
    quy_tac: "Chỉ dùng số liệu trong các thuộc tính này, không bịa thêm số. Không tư vấn đầu tư hay vay. Trả lời ngắn kiểu Việt, kết thúc bằng 1 việc cụ thể cần làm ở trang nào của web.",
    thang: `Tháng ${now.getMonth() + 1}/${now.getFullYear()} (₫, tr=triệu, k=ngìn): thu ${swShort(D.income)} · chi ${swShort(D.expense)} (${swPct(D.expense, D.income)}% thu) · còn ${swShort(D.income - D.expense)} · ${D.txs.length} GD · còn ${D.daysLeft} ngày.`
  };
  const cats = Object.entries(D.byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  a.chi_theo_nhom = cats.length
    ? cats.map(([c, v]) => `${c} ${swShort(v)} (${swPct(v, D.expense)}%)`).join(" · ")
    : "chưa có khoản chi nào.";
  a.ngan_sach = D.caps.length
    ? D.caps.slice(0, 8).map(c => {
        const pct = swPct(D.byCat[c.name] || 0, c.cap);
        return `${c.name} ${swShort(D.byCat[c.name] || 0)}/${swShort(c.cap)}=${pct}%${pct >= 100 ? "⛔vượt" : pct >= 70 ? "⚠sát" : ""}`;
      }).join(" · ")
    : "chưa đặt hạn mức nào.";
  a.muc_tieu = D.goals.length
    ? D.goals.slice(0, 4).map(g => {
        const gap = Math.max(Number(g.target) - Number(g.saved), 0);
        return `${g.name} ${swShort(g.saved)}/${swShort(g.target)}=${swPct(g.saved, g.target)}%` +
          (gap ? ` (còn ${swShort(gap)}, ${g.thisMonth ? "~" + Math.ceil(gap / g.thisMonth) + " tháng" : "chưa có nhịp nạp"})` : " (đã đạt)");
      }).join(" · ")
    : "chưa có mục tiêu nào.";
  const top = D.txs.filter(t => t.amount < 0).sort((x, y) => x.amount - y.amount)[0];
  if (top) a.chi_lon_nhat = `${top.desc} ${swShort(top.amount)} (${top.cat}, ${top.date}).`;
  Object.keys(a).forEach(k => { a[k] = swClip(a[k]); });
  return a;
}

/* token:null là đường "public attributes" của widget: bot đọc được mà không cần JWT verify */
function pushChatbaseContext() {
  if (!window.chatbase) return;
  const auth = SWAuth.get() || {};
  window.chatbase("identify", { token: null, ho_ten: auth.name || "Bạn", ...swFinAttributes() });
}

/* Chatbase: bot AI huấn luyện bằng TAI-LIEU-HUAN-LUYEN-AI.md, luôn nhận số liệu mới nhất */
function loadChatbase() {
  if (window.chatbase) return;
  window.chatbase = (...args) => {
    if (!window.chatbase.q) window.chatbase.q = [];
    window.chatbase.q.push(args);
  };
  window.chatbase = new Proxy(window.chatbase, {
    get: (target, prop) => (prop === "q" ? target.q : (...args) => target(prop, ...args))
  });
  pushChatbaseContext();
  const onLoad = () => {
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "7qVpTFm3snCgxMACkFIBY";
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad);
}

/* Mỗi lần dữ liệu đổi (thêm giao dịch, sửa ngân sách, nạp mục tiêu) → cập nhật lại ngữ cảnh cho bot */
if (window.SWStore && typeof SWStore.save === "function") {
  const swStoreSave = SWStore.save.bind(SWStore);
  SWStore.save = patch => { const saved = swStoreSave(patch); pushChatbaseContext(); return saved; };
}

function renderShell() {
  const body = document.body;
  const role = body.dataset.role;
  const conf = SW_NAV[role];
  if (!conf) return;
  const here = body.dataset.page;
  const auth = SWAuth.get();
  const names = { user: "Minh Anh", coach: "Lan Phương", moderator: "Mai Phương", admin: "Admin Tuấn" };
  const uname = role === "user" ? ((auth && auth.name) || SW_DATA.user.short).split(" ").slice(-1)[0] : names[role];
  const umail = role === "user" ? ((auth && auth.email) || "") : `${uname.toLowerCase().replace(/\s/g, "")}@sw.vn`;
  if (role === "user") loadChatbase();

  /* thanh xanh trên cùng kiểu YouTube: nút mở/thu thanh bên + logo tên web */
  const topnav = document.createElement("header");
  topnav.className = "topnav";
  topnav.innerHTML = `
    <button class="icon-btn menu-btn" title="Thu gọn / mở thanh bên"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
    <a class="logo" href="${conf.home}"><span class="logo-mark">S</span><span>SpendWise</span></a>
    <div class="topnav-actions">
      <span class="badge role-chip ${conf.chipCls}">${conf.chip}</span>
      <button class="topnav-tool" id="sidebarNotiBtn" type="button" title="Thông báo" aria-label="Thông báo"><svg class="notification-bell" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sidebar-noti-dot"></span></button>
      <button class="topnav-tool" id="themeBtn" type="button" title="Đổi giao diện" aria-label="Đổi giao diện">🌙</button>
      <a class="avatar topnav-avatar" id="avatar" href="profile.html" title="Hồ sơ" aria-label="Mở hồ sơ">${uname.slice(0, 2).toUpperCase()}</a>
    </div>
    <section class="sidebar-noti-popover" id="sidebarNotiPopover" aria-label="Thông báo" hidden>
      <header><b>Thông báo</b><a href="notifications.html">Xem tất cả</a></header>
      <div class="sidebar-noti-list" id="sidebarNotiList"></div>
    </section>`;
  document.body.prepend(topnav);

  const side = document.createElement("aside");
  side.className = "sidebar";
  side.innerHTML = `
    <nav class="nav">
      ${conf.items.map(([ico, label, href]) => href
        ? `<a href="${href}" title="${label}" class="${label === here ? "active" : ""}"><span class="ico">${ico}</span>${label}</a>`
        : `<a href="#" title="${label}" data-soon="${label}"><span class="ico">${ico}</span>${label}</a>`).join("")}
    </nav>
    <a class="user-box sidebar-profile" href="profile.html" title="Hồ sơ cá nhân">
      <span class="avatar">${uname.slice(0, 2).toUpperCase()}</span>
      <div><b>${uname}</b><span>${umail}</span></div>
    </a>
    `;
  const originalTheme = $("#themeBtn");
  if (originalTheme) {
    topnav.querySelector("#themeBtn").replaceWith(originalTheme);
    originalTheme.classList.add("topnav-tool");
    originalTheme.title = "Đổi giao diện";
    originalTheme.setAttribute("aria-label", "Đổi giao diện");
  }
  const originalAvatar = $(".topbar #avatar");
  if (originalAvatar) originalAvatar.remove();
  const themeButton = topnav.querySelector("#themeBtn");
  syncThemeButton();
  themeButton.addEventListener("click", () => {
    const dark = toggleTheme();
    const settingsToggle = $("#darkToggle");
    if (settingsToggle) settingsToggle.checked = dark;
  });
  const notiList = topnav.querySelector("#sidebarNotiList");
  const notiPopover = topnav.querySelector("#sidebarNotiPopover");
  const renderNotiPopover = () => {
    const data = (SWStore.load().notifications || SW_DATA.notifications || []).slice(0, 8);
    topnav.querySelector(".sidebar-noti-dot").hidden = !data.some(n => n.unread);
    notiList.innerHTML = data.length ? data.map(n => `
      <article class="sidebar-noti-item ${n.unread ? "unread" : ""}">
        <span class="sidebar-noti-ico">${n.ico || "🔔"}</span>
        <span><b>${n.title}</b><small>${n.desc || ""}</small><small class="sidebar-noti-time">${n.group || "Gần đây"}</small></span>
      </article>`).join("") : `<p class="sidebar-noti-empty">Chưa có thông báo nào.</p>`;
  };
  renderNotiPopover();
  topnav.querySelector("#sidebarNotiBtn").addEventListener("click", e => {
    e.stopPropagation();
    notiPopover.hidden = !notiPopover.hidden;
    if (!notiPopover.hidden) renderNotiPopover();
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#sidebarNotiPopover, #sidebarNotiBtn")) notiPopover.hidden = true;
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") notiPopover.hidden = true; });
  document.body.prepend(side);

  const scrim = document.createElement("div");
  scrim.className = "scrim";
  document.body.prepend(scrim);

  const main = $(".main");
  if (main) main.classList.add("page-enter");

  /* trạng thái thu gọn được nhớ qua các trang: thu nhỏ xong bấm chuyển trang, thanh vẫn bé */
  if (localStorage.getItem("sw_nav") === "mini") body.classList.add("nav-mini");
  const setMini = mini => {
    body.classList.toggle("nav-mini", mini);
    localStorage.setItem("sw_nav", mini ? "mini" : "full");
  };

  document.addEventListener("click", e => {
    const soon = e.target.closest("[data-soon]");
    if (soon) { e.preventDefault(); toast(`"${soon.dataset.soon}" — màn hình demo chưa có trong luồng này`, "🚧"); }
    const mobile = matchMedia("(max-width: 900px)").matches;
    const closeDrawer = () => { side.classList.remove("open"); scrim.classList.remove("show"); };
    if (e.target.closest(".menu-btn")) {
      if (mobile) {
        const on = side.classList.toggle("open");
        scrim.classList.toggle("show", on);
      } else setMini(!body.classList.contains("nav-mini"));
    }
    /* bấm nền mờ hoặc chọn menu xong thì đóng ngăn kéo */
    if (e.target.classList.contains("scrim")
      || (mobile && e.target.closest(".sidebar .nav a"))) closeDrawer();
  });
}

/* ---------- khởi động chung cho trang app ---------- */
function initAppPage() {
  if (document.body.dataset.auth === "required") SWAuth.require();
  renderShell();
  refreshLang();
  initCounters();
  initReveal();
  initRowSelect();
  initLiveFilter();
  if (window.SWCloud?.trackDevice) {
    const heartbeat = () => SWCloud.trackDevice().catch(() => {});
    heartbeat();
    window.setInterval(() => { if (document.visibilityState === "visible") heartbeat(); }, 60_000);
  }
}
