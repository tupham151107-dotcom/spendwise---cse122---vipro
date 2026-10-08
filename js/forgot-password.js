$("#fpForm").addEventListener("submit", e => {
    e.preventDefault();
    const em = $("#email");
    if (!/^\S+@\S+\.\S+$/.test(em.value)) { em.classList.add("invalid"); setTimeout(() => em.classList.remove("invalid"), 700); return; }
    $("#sentTo").textContent = em.value;
    $("#fpForm").style.display = "none";
    $("#sentCard").classList.add("show");
    let s = 42;
    const t = setInterval(() => {
      s--;
      $("#cd").textContent = "00:" + String(Math.max(s, 0)).padStart(2, "0");
      if (s <= 0) { clearInterval(t); $("#resendBtn").style.opacity = "1"; }
    }, 1000);
    $("#resendBtn").addEventListener("click", e => { e.preventDefault(); s = 42; toast("Đã gửi lại liên kết đặt lại mật khẩu", "📧"); });
  });
