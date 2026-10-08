/* =====================================================
   SpendWise — data.js : dữ liệu mẫu cho toàn bộ app
   Biến toàn cục: SW_DATA
   ===================================================== */
window.SW_DATA = {

  user: {
    name: "Nguyễn Minh Anh",
    short: "Minh Anh",
    email: "minhanh.nguyen@email.com",
    phone: "090 234 5678",
    job: "Product Designer",
    income: 35000000,
    city: "TP. Hồ Chí Minh",
    joined: "12/03/2025",
    initials: "MA"
  },

  /* ---- Tổng quan (dashboard) ---- */
  overview: {
    balance: 28450000, balanceDelta: 8.4,
    income: 35000000, incomeSrc: 2,
    expense: 18650000, expensePct: 53,
    weekly: [92, 60, 84, 70, 96, 62], // xu hướng 6 tuần (triệu %)
    budgetUsed: 78, budgetSpent: 16650000, budgetTotal: 24000000, budgetLeft: 2350000,
    insight: "Ăn uống vượt 150.000 ₫ so với tuần trước. Bạn có thể chuyển 200.000 ₫ từ quỹ Giải trí để giữ ngân sách trong giới hạn.",
    insightShort: "Ăn uống tuần này vượt 150.000 ₫. Giải trí còn dư 480.000 ₫ — chuyển bớt sang để vẫn nằm trong hạn mức."
  },

  transactions: [
    { id: 1, desc: "WinMart Nguyễn Trãi", cat: "Ăn uống", acc: "MoMo",  date: "02/10", amount: -885000 },
    { id: 2, desc: "Lương tháng 10",      cat: "Thu nhập", acc: "VCB",   date: "01/10", amount: 25000000 },
    { id: 3, desc: "GrabBike đi làm",     cat: "Đi lại",   acc: "MoMo",  date: "30/09", amount: -126000 },
    { id: 4, desc: "Netflix Premium",     cat: "Giải trí", acc: "Visa",  date: "28/09", amount: -260000 },
    { id: 5, desc: "Tiền điện EVN",       cat: "Hóa đơn",  acc: "VCB",   date: "27/09", amount: -742000 },
    { id: 6, desc: "Highlands Coffee",    cat: "Ăn uống",  acc: "MoMo",  date: "26/09", amount: -98000 },
    { id: 7, desc: "Thưởng dự án freelance", cat: "Thu nhập", acc: "VCB", date: "25/09", amount: 3200000 },
    { id: 8, desc: "Shopee — phụ kiện",   cat: "Mua sắm",  acc: "Visa",  date: "24/09", amount: -435000 },
    { id: 9, desc: "Thuê nhà tháng 10",   cat: "Nhà ở",    acc: "VCB",   date: "23/09", amount: -6500000 },
    { id: 10, desc: "CGV Cinema",         cat: "Giải trí", acc: "MoMo",  date: "22/09", amount: -180000 },
    { id: 11, desc: "BÁNH MÌ HƯƠNG VIỆT - 45K", cat: "Ăn uống", acc: "MoMo", date: "21/09", amount: -45000 },
    { id: 12, desc: "VINAMART - 68K",     cat: "Ăn uống",  acc: "MoMo",  date: "20/09", amount: -68000 }
  ],
  txTotalIn: 35000000,
  txTotalOut: 18650000,

  /* ---- Mục tiêu ---- */
  goals: [
    { id: 1, emoji: "🏝️", name: "Quỹ du lịch Đà Nẵng", saved: 18000000, target: 30000000, monthsLeft: 4, thisMonth: 3000000 },
    { id: 2, emoji: "🛟", name: "Quỹ dự phòng 6 tháng", saved: 45000000, target: 90000000, monthsLeft: 11, thisMonth: 3000000 },
    { id: 3, emoji: "💻", name: "Laptop mới cho công việc", saved: 6300000, target: 28000000, monthsLeft: 9, thisMonth: 2100000 }
  ],
  coachPlan: "Nếu chuyển thêm 800.000 ₫ một tháng từ ngân sách Giải trí, bạn sẽ đạt mục tiêu Đà Nẵng sớm hơn 5 tuần mà vẫn giữ quỹ dự phòng an toàn.",
  milestones: [
    { goal: "Quỹ du lịch Đà Nẵng", mark: "70% · 21 triệu", due: "01/11", status: "Đúng hạn", st: "ok" },
    { goal: "Quỹ dự phòng 6 tháng", mark: "50% · 45 triệu", due: "15/11", status: "Đúng hạn", st: "ok" },
    { goal: "Laptop mới", mark: "25% · 7 triệu", due: "28/09", status: "Trễ 3 ngày", st: "warn" }
  ],

  /* ---- Thông báo ---- */
  notifications: [
    { id: 1, group: "Hôm nay", type: "Ngân sách", tone: "red", ico: "⚠️", title: "Ngân sách Ăn uống đã vượt 8%", desc: "2.450.000 ₫ / 2.250.000 ₫ · 09:42", action: "Xem ngân sách", unread: true },
    { id: 2, group: "Hôm nay", type: "Chi tiêu", tone: "orange", ico: "🔍", title: "Giao dịch lạ cần kiểm tra", desc: "Tech Shop 2.190.000 ₫ · 21:18 hôm qua", action: "Xác nhận giao dịch", unread: true },
    { id: 3, group: "Hôm nay", type: "Mục tiêu", tone: "green", ico: "🎯", title: "Mục tiêu Đà Lạt đạt 64%", desc: "Còn 5.200.000 ₫ nữa là tới đích", action: "Xem tiến độ", unread: true },
    { id: 4, group: "Hôm qua", type: "Chi tiêu", tone: "purple", ico: "💬", title: "Coach Lan Phương đã phản hồi", desc: "\"Em duy trì auto-save ngày nhận lương nhé\"", action: "Mở cuộc trò chuyện", unread: false },
    { id: 5, group: "Hôm qua", type: "Ngân sách", tone: "blue", ico: "✅", title: "Ngân sách tháng 10 đã được duyệt", desc: "Coach Lan đã duyệt phân bổ 24.000.000 ₫", action: "Xem chi tiết", unread: false }
  ],

  /* ---- Coach ---- */
  clients: [
    { name: "Nguyễn Minh Anh", score: 82, budget: "78% đúng hạn", checkin: "Hôm nay", status: "Ổn định", st: "ok" },
    { name: "Trần Quốc Bảo", score: 61, budget: "96% đúng hạn", checkin: "02/10", status: "Cần chú ý", st: "warn" },
    { name: "Lê Thu Hà", score: 74, budget: "89% đúng hạn", checkin: "01/10", status: "Theo dõi", st: "info" },
    { name: "Phạm Hoàng Nam", score: 46, budget: "112% — vượt", checkin: "28/08", status: "Rủi ro cao", st: "bad" },
    { name: "Võ Ngọc Linh", score: 68, budget: "84% đúng hạn", checkin: "Hôm nay", status: "Ổn định", st: "ok" }
  ],
  clientStats: { active: 12, attention: 3, checkin: 8, checkinTotal: 12, checkinPct: 87 },

  budgetReview: {
    who: "Nguyễn Minh Anh · 1 tháng 10/2026",
    total: 24000000,
    items: [
      { name: "Nhà ở", amt: 8000000, note: "Đúng cam kết hợp đồng" },
      { name: "Ăn uống", amt: 5200000, note: "Tăng nhẹ so với 9" },
      { name: "Tiết kiệm", amt: 2500000, note: "Auto-save ngày nhận lương" },
      { name: "Giải trí", amt: 2000000, note: "Có 480.000 ₫ còn dư" }
    ],
    insight: "Chi tiêu tuần đầu tập trung vào nhu cầu thiết yếu, tỉ lệ tiết kiệm 22% (+3% so với tháng 9).",
    note: "Mục phân bổ hợp lý. Nhắc Minh Anh duy trì auto-save ngày nhận lương."
  },

  resources: [
    { title: "Lập ngân sách 50/30/20", fmt: "Bài viết", fmtIco: "📝", who: "Người mới", updated: "03/10", status: "Đã duyệt", st: "ok" },
    { title: "5 bước xây quỹ dự phòng", fmt: "Video", fmtIco: "🎬", who: "Gia đình trẻ", updated: "02/10", status: "Chờ duyệt", st: "warn" },
    { title: "Checklist giảm chi tiêu", fmt: "Checklist", fmtIco: "📋", who: "Mọi người", updated: "01/10", status: "Bản nháp", st: "gray" },
    { title: "Hiểu điểm sức khỏe tài chính", fmt: "Infographic", fmtIco: "📊", who: "Người mới", updated: "28/09", status: "Bị trả về", st: "bad" },
    { title: "Tự động hoá tiết kiệm", fmt: "Bài viết", fmtIco: "📝", who: "Nhân viên văn phòng", updated: "26/09", status: "Lưu trữ", st: "gray" }
  ],

  /* ---- Kiểm duyệt ---- */
  reviewQueue: [
    { title: "5 bước xây quỹ dự phòng", author: "Coach Lan", sent: "02/10 · 09:12", risk: "Thấp", st: "warn", status: "Chờ duyệt",
      excerpt: "Video 12 phút hướng dẫn xây quỹ dự phòng 3–6 tháng chi tiêu, kèm checklist tải về." },
    { title: "Quản lý nợ thẻ tín dụng", author: "Coach Đạc", sent: "02/10 · 20:40", risk: "Cao", st: "bad", status: "Cần rà soát",
      excerpt: "Bài viết đề cập chiến lược trả nợ — cần kiểm tra phần tư vấn chuyển nợ có nhắc đến thương hiệu ngân hàng." },
    { title: "Checklist giảm chi tiêu", author: "Coach Lan", sent: "01/10 · 15:03", risk: "Thấp", st: "ok", status: "Đã duyệt",
      excerpt: "Checklist 18 mục cắt chi tiêu không cần thiết, phù hợp người mới." },
    { title: "Hiểu điểm sức khỏe tài chính", author: "Coach Minh", sent: "30/09 · 08:47", risk: "Vừa", st: "info", status: "Bị trả về",
      excerpt: "Infographic giải thích cách tính điểm 0–100 — đã trả về vì thiếu nguồn dẫn số liệu." }
  ],

  aiTemplates: [
    { name: "expense_categorizer_vi", ver: "v2.4", use: "Phân loại chi", updated: "03/10", status: "Đang chạy", st: "ok",
      prompt: "Phân loại giao dịch theo định dạng cố định. Trả về confidence, lý do ngắn và không suy diễn khi thiếu dữ liệu.", temp: "0.2", tokens: "150", lang: "vi-VN", acc: "91,8%", delta: "+2,4% so với v2.3",
      test: { input: "VINAMART - 68K", cat: "Ăn uống", conf: "92%", note: "✓ Không chứa lời khuyên đầu tư" } },
    { name: "spending_pattern_vi", ver: "v1.8", use: "Pattern insight", updated: "02/10", status: "A/B test", st: "info",
      prompt: "Tìm pattern chi tiêu bất thường trong 4 tuần. Chỉ cảnh báo khi chênh lệch vượt 15% trung vị.", temp: "0.3", tokens: "220", lang: "vi-VN", acc: "88,2%", delta: "+0,8% so với v1.7",
      test: { input: "Tháng 10: ăn uống +18%", cat: "Cảnh báo pattern", conf: "84%", note: "✓ Có so sánh trung vị" } },
    { name: "goal_coach_vi", ver: "v3.1", use: "Mục tiêu", updated: "01/10", status: "Đang chạy", st: "ok",
      prompt: "Đề xuất kế hoạch chuyển tiền giữa các ngân sách để đạt mục tiêu sớm hơn, không vi phạm quỹ dự phòng.", temp: "0.4", tokens: "300", lang: "vi-VN", acc: "93,4%", delta: "+1,1% so với v3.0",
      test: { input: "Đà Nẵng còn 12tr, 4 tháng", cat: "Kế hoạch 6 tuần", conf: "90%", note: "✓ Giữ nguyên quỹ dự phòng" } },
    { name: "budget_summary_vi", ver: "v0.9", use: "Tóm tắt", updated: "30/09", status: "Bản nháp", st: "gray",
      prompt: "Tóm tắt ngân sách tháng thành 3 gạch đầu dòng, tối đa 40 từ mỗi dòng.", temp: "0.2", tokens: "180", lang: "vi-VN", acc: "—", delta: "Chưa chạy thử",
      test: { input: "Ngân sách 10/2026", cat: "Tóm tắt 3 dòng", conf: "—", note: "○ Chưa kiểm thử" } }
  ],

  feedback: [
    { id: "FG-1046", title: "AI phân loại sai cửa hàng", from: "Minh Anh", type: "AI", tone: "purple", prio: "Cao", prioSt: "bad", status: "Đang xử lý", st: "info",
      detail: "Giao dịch 'VINAMART - 68K' bị phân loại vào Mua sắm, người dùng mong đợi Ăn uống. Đề xuất thêm quy tắc từ khoá." },
    { id: "FG-1045", title: "Cần xuất báo cáo PDF", from: "Quốc Bảo", type: "Tính năng", tone: "blue", prio: "Vừa", prioSt: "info", status: "Mới", st: "warn",
      detail: "Muốn xuất báo cáo tháng kèm biểu đồ ra PDF để gửi cho coach. Hiện chỉ có CSV." },
    { id: "FG-1044", title: "Biểu đồ tải chậm trên máy yếu", from: "Thu Hà", type: "Lỗi", tone: "red", prio: "Cao", prioSt: "bad", status: "Đã chuyển dev", st: "bad",
      detail: "Biểu đồ donut đôi khi mất 3–4 giây để vẽ trên laptop cấu hình thấp. Nghi vấn do animation." },
    { id: "FG-1043", title: "Goal Coach rất hữu ích", from: "Ngọc Linh", type: "Khen ngợi", tone: "green", prio: "Thấp", prioSt: "ok", status: "Đã lưu", st: "ok",
      detail: "Kế hoạch 6 tuần giúp sớm đạt mục tiêu Đà Lạt mà không chạm quỹ dự phòng." }
  ],

  /* ---- Admin ---- */
  system: {
    uptime: "99,98%", dau: 8942, dauDelta: "+8,7% MoM", aiReq: "184K", aiAccept: "91,8%",
    traffic: [42, 58, 65, 61, 72, 80, 76, 88, 95, 68, 74, 60, 83, 91, 97, 79, 66, 71, 58, 52, 47],
    hotHour: 14,
    services: [
      { name: "API Gateway", up: "99,99%", st: "ok" },
      { name: "AI Service", up: "99,96%", st: "ok" },
      { name: "Notification", up: "98,72%", st: "warn" },
      { name: "Database", up: "99,99%", st: "ok" }
    ],
    events: [
      { txt: "Notification queue tăng đột biến", time: "10:42", status: "Cần theo dõi", st: "warn" },
      { txt: "Backup database hoàn tất", time: "09:00", status: "Thành công", st: "ok" },
      { txt: "Deploy v2.4.1 lên production", time: "06:30", status: "Thành công", st: "ok" }
    ],
    cpu: 42, mem: 61
  },

  categories: [
    { name: "Ăn uống", ico: "🍜", type: "Chi tiêu", rules: 24, tx: 1248, status: "Hoạt động", st: "ok" },
    { name: "Đi lại", ico: "🛵", type: "Chi tiêu", rules: 18, tx: 864, status: "Hoạt động", st: "ok" },
    { name: "Nhà ở", ico: "🏠", type: "Chi tiêu", rules: 11, tx: 326, status: "Hoạt động", st: "ok" },
    { name: "Giải trí", ico: "🎬", type: "Chi tiêu", rules: 14, tx: 587, status: "Hoạt động", st: "ok" },
    { name: "Khác", ico: "📦", type: "Chi tiêu", rules: 34, tx: 92, status: "Cần tư vấn", st: "warn" },
    { name: "Thu nhập", ico: "💼", type: "Thu nhập", rules: 9, tx: 214, status: "Hoạt động", st: "ok" }
  ],

  users: [
    { name: "Nguyễn Minh Anh", role: "Cá nhân", last: "Hôm nay", auth: "2FA", status: "Hoạt động", st: "ok" },
    { name: "Lê Thanh Lan", role: "Coach", last: "Hôm nay", auth: "2FA", status: "Hoạt động", st: "ok" },
    { name: "Mai Phương", role: "Kiểm duyệt", last: "02/10", auth: "SSO", status: "Hoạt động", st: "ok" },
    { name: "Phạm Hoàng Nam", role: "Cá nhân", last: "28/08", auth: "Email", status: "Tạm khoá", st: "bad" },
    { name: "Trần Minh Đức", role: "Coach", last: "24/09", auth: "2FA", status: "Chờ duyệt", st: "warn" }
  ]
};

/* =====================================================
   Chế độ "tài khoản mới đăng ký": dữ liệu bắt đầu từ 0.
   Email đăng ký được lưu vào localStorage("spendwise_users");
   khi email đó đăng nhập, toàn bộ dữ liệu demo cá nhân
   được thay bằng trạng thái trống (window.SW_FRESH = true).
   Đăng nhập nhanh/demo không có email → giữ dữ liệu mẫu.
   ===================================================== */
(function () {
  try {
    const auth = JSON.parse(localStorage.getItem("sw_auth"));
    const users = JSON.parse(localStorage.getItem("spendwise_users")) || [];
    if (!auth || !auth.email || (!auth.supabase && !users.some(u => (u.email || u) === auth.email))) return;

    window.SW_FRESH = true;
    const ini = (auth.name || "Bạn Mới").trim().split(" ").slice(-1)[0].slice(0, 2).toUpperCase();
    /* ngày tham gia lưu theo tài khoản (cần cho biệt danh thâm niên) */
    let joined = null;
    try {
      const st = JSON.parse(localStorage.getItem("sw_store_" + auth.email)) || {};
      if (typeof st.joined === "string") joined = st.joined;
      else {
        joined = new Date().toLocaleDateString("vi-VN");
        st.joined = joined;
        localStorage.setItem("sw_store_" + auth.email, JSON.stringify(st));
      }
    } catch (e) { joined = new Date().toLocaleDateString("vi-VN"); }
    SW_DATA.user = {
      name: auth.name || "Bạn Mới", short: auth.name || "Bạn Mới",
      email: auth.email, phone: "", job: "", income: 0,
      city: "Việt Nam",
      joined: joined, initials: ini
    };
    SW_DATA.transactions = [];
    SW_DATA.txTotalIn = 0; SW_DATA.txTotalOut = 0;
    SW_DATA.goals = []; SW_DATA.milestones = [];
    SW_DATA.notifications = [];
    SW_DATA.coachPlan = "Chào bạn mới! Ghi nhận vài giao dịch và tạo mục tiêu đầu tiên — Goal Coach sẽ đề xuất kế hoạch tiết kiệm riêng cho bạn.";
    SW_DATA.overview = {
      balance: 0, balanceDelta: 0, income: 0, incomeSrc: 0,
      expense: 0, expensePct: 0,
      weekly: [0, 0, 0, 0, 0, 0],
      budgetUsed: 0, budgetSpent: 0, budgetTotal: 0, budgetLeft: 0,
      insight: "Chưa có dữ liệu để phân tích. Thêm giao dịch đầu tiên và AI sẽ bắt đầu đọc hiểu thói quen chi tiêu của bạn.",
      insightShort: "Chưa có dữ liệu — thêm giao dịch đầu tiên để AI bắt đầu phân tích."
    };
  } catch (e) { /* localStorage không khả dụng — giữ dữ liệu mẫu */ }
})();

/* =====================================================
   Lưu trữ dữ liệu người dùng vào localStorage.
   Mỗi tài khoản một kho riêng (theo email; đăng nhập demo
   dùng chung kho "demo"). Trang nào làm thay đổi dữ liệu
   sẽ gọi SWStore.save(...) sau khi render.
   ===================================================== */
/* hạn mức demo dùng chung (dashboard + trang ngân sách, khi tài khoản chưa có hạn mức riêng) */
window.DEMO_BUDGETS = [
  { ico: "🏠", name: "Nhà ở",     cap: 8000000 },
  { ico: "🍜", name: "Ăn uống",   cap: 5200000 },
  { ico: "🛵", name: "Đi lại",    cap: 1500000 },
  { ico: "🎯", name: "Tiết kiệm", cap: 2500000 },
  { ico: "🎬", name: "Giải trí",  cap: 2000000 },
  { ico: "📦", name: "Khác",      cap: 4800000 }
];

window.SWStore = {
  key() {
    let auth = null;
    try { auth = JSON.parse(localStorage.getItem("sw_auth")); } catch (e) {}
    return "sw_store_" + ((auth && auth.email) || "demo");
  },
  load() {
    try { return JSON.parse(localStorage.getItem(this.key())) || {}; } catch (e) { return {}; }
  },
  save(patch) {
    try { localStorage.setItem(this.key(), JSON.stringify({ ...this.load(), ...patch })); } catch (e) {}
  }
};
(function () {
  const st = SWStore.load();
  if (Array.isArray(st.transactions)) SW_DATA.transactions = st.transactions;
  if (Array.isArray(st.goals)) SW_DATA.goals = st.goals;
  if (Array.isArray(st.notifications)) SW_DATA.notifications = st.notifications;
})();
