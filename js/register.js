const pw = $("#pw"), pw2 = $("#pw2");
  const rules = {
    len:   v => v.length >= 8,
    upper: v => /[A-Z]/.test(v),
    num:   v => /\d/.test(v)
  };
  pw.addEventListener("input", () => {
    $$("[data-rule]").forEach(r => r.classList.toggle("ok", rules[r.dataset.rule](pw.value)));
  });

  let otpSent = false;
  const showError = message => {
    const box = $("#pwErr");
    box.querySelector("span").textContent = message;
    box.classList.add("show");
  };
  const pendingSignupEmail = sessionStorage.getItem("sw_signup_pending_email");
  let otpVerified = !!pendingSignupEmail && sessionStorage.getItem("sw_signup_otp_verified") === pendingSignupEmail;
  if (pendingSignupEmail) {
    $("#email").value = pendingSignupEmail;
    $("#clearEmail").hidden = false;
    $("#otpField").hidden = false;
    $("#sendOtp").textContent = "↻";
    $("#sendOtp").title = "Gửi lại mã OTP";
    $("#sendOtp").setAttribute("aria-label", "Gửi lại mã OTP");
    otpSent = true;
    if (otpVerified) {
      $("#otpStatus").textContent = "Mã OTP đúng! Hoàn tất thông tin để tạo tài khoản.";
      $("#otpStatus").style.color = "#16a34a";
      $("#otp").readOnly = true;
    } else {
      showError("Đang chờ xác nhận email " + pendingSignupEmail + ". Nhập mã OTP hoặc bấm gửi lại.");
    }
  }
  const resetPendingOtp = () => {
    sessionStorage.removeItem("sw_signup_pending_email");
    sessionStorage.removeItem("sw_signup_otp_verified");
    otpSent = false;
    otpVerified = false;
    $("#otp").value = "";
    $("#otp").readOnly = false;
    $("#otpStatus").textContent = "";
    $("#sendOtp").textContent = "✉";
    $("#sendOtp").title = "Gửi mã OTP";
    $("#sendOtp").setAttribute("aria-label", "Gửi mã OTP");
    $("#sendOtp").disabled = false;
    $("#pwErr").classList.remove("show");
  };
  $("#clearEmail").addEventListener("click", () => {
    clearInterval(cooldownTimer);
    resetPendingOtp();
    $("#email").value = "";
    $("#clearEmail").hidden = true;
    $("#email").focus();
  });
  $("#email").addEventListener("input", () => {
    $("#clearEmail").hidden = !$("#email").value;
    const pending = sessionStorage.getItem("sw_signup_pending_email");
    if (otpSent && $("#email").value.trim() !== pending) resetPendingOtp();
  });
  let cooldownTimer = null;
  const startCooldown = (seconds = 60) => {
    const button = $("#sendOtp");
    clearInterval(cooldownTimer);
    let remain = seconds;
    button.disabled = true;
    button.textContent = remain + "s";
    cooldownTimer = setInterval(() => {
      remain--;
      if (remain <= 0) {
        clearInterval(cooldownTimer);
        button.disabled = false;
        button.textContent = otpSent ? "↻" : "✉";
      } else {
        button.textContent = remain + "s";
      }
    }, 1000);
  };
  $("#sendOtp").addEventListener("click", async () => {
    const emailInput = $("#email");
    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      emailInput.classList.add("invalid");
      showError("Hãy nhập địa chỉ email hợp lệ trước.");
      emailInput.focus();
      return;
    }
    if (!window.SWCloud) { showError("Không tải được Supabase. Kiểm tra Internet rồi tải lại trang."); return; }
    const button = $("#sendOtp");
    button.disabled = true;
    try {
      if (otpSent) {
        await SWCloud.resendSignupOtp(email);
        showError("Đã gửi lại email xác nhận đến " + email + ". Kiểm tra hộp thư đến và Spam.");
        startCooldown();
      } else {
        button.textContent = "…";
        const result = await SWCloud.startSignupOtp($("#name").value.trim(), email);
        if (result.session) {
          toast("Email đã được xác nhận. Đang mở SpendWise 🎉");
          setTimeout(() => location.href = "/app/dashboard.html", 500);
          return;
        }
        otpSent = true;
        sessionStorage.setItem("sw_signup_pending_email", email);
        sessionStorage.removeItem("sw_signup_otp_verified");
        $("#clearEmail").hidden = false;
        $("#otpField").hidden = false;
        button.textContent = "↻";
        button.title = "Gửi lại mã OTP";
        button.setAttribute("aria-label", "Gửi lại mã OTP");
        showError("Mã xác nhận đã gửi đến " + email + ". Nhập mã ở ô bên dưới email.");
        $("#otp").focus();
        startCooldown();
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = otpSent ? "↻" : "✉";
      button.title = otpSent ? "Gửi lại mã OTP" : "Gửi mã OTP";
      button.setAttribute("aria-label", button.title);
      showError(error.message || "Không thể gửi mã OTP. Hãy kiểm tra email và cấu hình SMTP.");
    }
  });
  let otpVerifying = false;
  const verifyEnteredOtp = async () => {
    const code = $("#otp").value.trim();
    if (otpVerifying || otpVerified || !/^\d{8}$/.test(code)) return;
    otpVerifying = true;
    $("#otpStatus").textContent = "Đang kiểm tra mã…";
    $("#otpStatus").style.color = "#64748b";
    try {
      await SWCloud.verifySignupOtp($("#email").value.trim(), code);
      otpVerified = true;
      sessionStorage.setItem("sw_signup_otp_verified", $("#email").value.trim());
      $("#otp").readOnly = true;
      $("#otpStatus").textContent = "Mã OTP đúng! Hoàn tất thông tin rồi bấm Tạo tài khoản.";
      $("#otpStatus").style.color = "#16a34a";
      $("#pw").focus();
    } catch (error) {
      $("#otpStatus").textContent = "Mã OTP sai hoặc đã hết hạn. Kiểm tra lại hoặc gửi mã mới.";
      $("#otpStatus").style.color = "#dc2626";
      $("#otp").readOnly = false;
    } finally {
      otpVerifying = false;
    }
  };
  $("#otp").addEventListener("input", () => {
    $("#otpStatus").textContent = "";
    if (/^\d{8}$/.test($("#otp").value.trim())) verifyEnteredOtp();
  });
  $("#regForm").addEventListener("submit", async e => {
    e.preventDefault();
    if (!otpSent) { showError("Nhập email rồi bấm “Gửi mã OTP” ngay bên dưới ô email trước nhé."); return; }
    if (!otpVerified) { showError("Nhập đủ 8 số OTP để hệ thống tự kiểm tra trước khi tạo tài khoản."); $("#otp").focus(); return; }
    let ok = true;
    const need = [["#name", "Họ tên"], ["#email", "Email"]];
    need.forEach(([sel]) => { if (!$(sel).value.trim()) { $(sel).classList.add("invalid"); ok = false; setTimeout(() => $(sel).classList.remove("invalid"), 700); } });
    const strong = Object.values(rules).every(f => f(pw.value));
    if (!strong) { pw.classList.add("invalid"); ok = false; setTimeout(() => pw.classList.remove("invalid"), 700); }
    const match = pw2.value === pw.value && pw2.value.length > 0;
    if (!match) {
      pw2.classList.add("invalid");
      $("#pwErr").classList.add("show");
      setTimeout(() => { pw2.classList.remove("invalid"); $("#pwErr").classList.remove("show"); }, 2600);
      ok = false;
    }
    if (!$("#agree").checked) { toast("Bạn cần đồng ý với Điều khoản để tiếp tục", "📜"); ok = false; }
    if (!ok) return;

    if (!window.SWCloud) { toast("Không tải được Supabase. Kiểm tra Internet rồi tải lại trang.", "⚠️"); return; }
    try {
      await SWCloud.completeSignupProfile($("#name").value.trim(), pw.value);
      sessionStorage.removeItem("sw_signup_pending_email");
      sessionStorage.removeItem("sw_signup_otp_verified");
      toast("Xác nhận thành công! Đang mở SpendWise 🎉");
      setTimeout(() => location.href = "/app/dashboard.html", 500);
    } catch (error) {
      showError(error.message || "Mã OTP không đúng hoặc đã hết hạn.");
    }
  });
