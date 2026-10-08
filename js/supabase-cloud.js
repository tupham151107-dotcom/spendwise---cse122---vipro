/* Supabase config: publishable key is intended for browser use; protect data with Auth + RLS. */
(function () {
  const url = "https://lhtglhcohqfdzgowubba.supabase.co";
  const key = "sb_publishable_DzbrtGXXzb-aqti4QItOFw_lelN6VIW";
  const sdk = window.supabase || (typeof supabase !== "undefined" ? supabase : null);
  if (!sdk || !url || !key) {
    window.SW_SUPABASE = null;
    window.SWCloud = null;
    return;
  }

  const client = sdk.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.SW_SUPABASE = client;

  const acceptSession = session => {
    if (!session || !session.user) return null;
    const user = session.user;
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email?.split("@")[0] || "Bạn";
    const profile = { name, email: user.email || "", role: "user", at: Date.now(), supabase: true };
    try { localStorage.setItem("sw_auth", JSON.stringify(profile)); } catch (_) {}
    return profile;
  };

  const parseJwtPayload = token => {
    try {
      const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(Array.from(atob(part), c => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
    } catch (_) { return {}; }
  };

  const deviceLabel = () => {
    const ua = navigator.userAgent || "";
    const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox\//.test(ua) ? "Firefox" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Trình duyệt";
    const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "thiết bị khác";
    return `${browser} · ${os}`;
  };

  window.SWCloud = {
    client,
    acceptSession,
    async currentUser() {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    async finishRedirect() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return acceptSession(data.session);
    },
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      return acceptSession(data.session);
    },
    async sendEmailOtp(email, name) {
      const { data, error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: name ? { full_name: name.trim() } : undefined,
          emailRedirectTo: `${location.origin}/login.html`
        }
      });
      if (error) throw error;
      return data;
    },
    async verifyEmailOtp(email, token) {
      const { data, error } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "email" });
      if (error) throw error;
      return acceptSession(data.session);
    },
    async verifySignupOtp(email, token) {
      const { data, error } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "signup" });
      if (error) throw error;
      return acceptSession(data.session);
    },
    async resendSignupOtp(email) {
      const { data, error } = await client.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${location.origin}/login.html` }
      });
      if (error) throw error;
      return data;
    },
    async signUp(name, email, password) {
      const { data, error } = await client.auth.signUp({
        email: email.trim(), password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${location.origin}/login.html`
        }
      });
      if (error) throw error;
      if (data.session) acceptSession(data.session);
      return data;
    },
    async startSignupOtp(name, email) {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const temporaryPassword = Array.from(randomBytes, b => b.toString(16).padStart(2, "0")).join("") + "Aa1!";
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: temporaryPassword,
        options: {
          data: { full_name: (name || "Bạn").trim() },
          emailRedirectTo: `${location.origin}/login.html`
        }
      });
      if (error) throw error;
      if (data.session) acceptSession(data.session);
      return data;
    },
    async verifySignupOtpAndSetPassword(email, token, name, password) {
      const { data: verified, error: verifyError } = await client.auth.verifyOtp({
        email: email.trim(), token: token.trim(), type: "signup"
      });
      if (verifyError) throw verifyError;
      const { data, error } = await client.auth.updateUser({
        password,
        data: { full_name: (name || "Bạn").trim() }
      });
      if (error) throw error;
      const { data: sessionData } = await client.auth.getSession();
      return acceptSession(sessionData.session) || acceptSession({ user: data.user });
    },
    async completeSignupProfile(name, password) {
      const { data, error } = await client.auth.updateUser({
        password,
        data: { full_name: (name || "Bạn").trim() }
      });
      if (error) throw error;
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      return acceptSession(sessionData.session) || acceptSession({ user: data.user });
    },
    async signInGoogle() {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/login.html`,
          queryParams: { prompt: "select_account" }
        }
      });
      if (error) throw error;
    },
    async syncAvatar() {
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) return false;
      const user = data.session.user;
      const meta = user.user_metadata || {};
      let avatar = meta.avatar_emoji || meta.avatar_url || "";

      if (meta.avatar_path) {
        const { data: signed, error: signError } = await client.storage.from("avatars").createSignedUrl(meta.avatar_path, 3600);
        if (!signError && signed?.signedUrl) avatar = signed.signedUrl;
      } else if (!meta.avatar_emoji && window.SWStore) {
        /* Move an existing local avatar to cloud on the first authenticated session. */
        const localAvatar = SWStore.load().avatar || "";
        if (localAvatar && !/^https:\/\//i.test(localAvatar)) {
          const result = await this.saveAvatar(localAvatar);
          if (result.synced) return true;
          avatar = localAvatar;
        }
      }

      if (avatar) {
        const name = meta.full_name || meta.name || user.email?.split("@")[0] || "Bạn";
        const initial = name.trim().split(/\s+/).pop().slice(0, 2).toUpperCase();
        $$("#avatar, #bigAvatar, .sidebar .user-box .avatar").forEach(el => setAvatarEl(el, avatar, initial));
        if (window.SWStore) SWStore.save({ avatar });
      }
      return true;
    },
    async trackDevice() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.user) return null;
      const sessionId = parseJwtPayload(session.access_token).session_id;
      if (!sessionId) return null;
      const { error: saveError } = await client.from("user_device_sessions").upsert({
        user_id: session.user.id,
        session_id: sessionId,
        device_label: deviceLabel(),
        user_agent: navigator.userAgent || "",
        last_seen: new Date().toISOString()
      }, { onConflict: "user_id,session_id" });
      if (saveError) throw saveError;
      await client.from("user_device_sessions").delete()
        .eq("user_id", session.user.id)
        .lt("last_seen", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      return sessionId;
    },
    async currentSessionId() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session ? parseJwtPayload(data.session.access_token).session_id : null;
    },
    async listDevices() {
      const { data, error } = await client.from("user_device_sessions")
        .select("session_id,device_label,last_seen")
        .order("last_seen", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async saveAvatar(value) {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      const user = data.session?.user;
      if (!user) return { synced: false, reason: "Chưa đăng nhập tài khoản Supabase." };

      if (!value) {
        const { error: updateError } = await client.auth.updateUser({ data: { avatar_path: null, avatar_emoji: null, avatar_url: null } });
        if (updateError) throw updateError;
        return { synced: true };
      }

      if (!value.startsWith("data:")) {
        const { error: updateError } = await client.auth.updateUser({ data: { avatar_path: null, avatar_emoji: value, avatar_url: null } });
        if (updateError) throw updateError;
        return { synced: true };
      }

      const blob = await (await fetch(value)).blob();
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await client.storage.from("avatars").upload(path, blob, {
        upsert: true, contentType: "image/jpeg", cacheControl: "3600"
      });
      if (uploadError) throw uploadError;
      const { error: updateError } = await client.auth.updateUser({ data: { avatar_path: path, avatar_emoji: null, avatar_url: null } });
      if (updateError) throw updateError;
      return { synced: true };
    },
    async signOut() {
      try {
        const { data } = await client.auth.getSession();
        const sessionId = data.session && parseJwtPayload(data.session.access_token).session_id;
        if (sessionId) await client.from("user_device_sessions").delete().eq("session_id", sessionId);
      } catch (_) {}
      await client.auth.signOut();
    }
  };
})();
