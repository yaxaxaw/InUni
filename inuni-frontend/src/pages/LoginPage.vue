<template>
  <div class="login-page">

    
    <div class="page-bg">
      <div class="grid-overlay"></div>
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <svg class="bg-logo-watermark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240" aria-hidden="true">
        
        <path d="M28 118 L72 38 L90 68 L105 30 L148 105 L148 118Z" fill="#1a3370" opacity="0.9"/>
        <path d="M90 112 L115 38 L155 95 L155 112Z" fill="#c8102e" opacity="0.9"/>
        <rect x="26" y="96" width="36" height="110" rx="7" fill="white"/>
        <rect x="26" y="96" width="36" height="110" rx="7" fill="#1a3370"/>
        
        <rect x="86" y="96" width="24" height="95" rx="0" fill="white"/>
        <rect x="86" y="96" width="24" height="95" rx="0" fill="#c8102e"/>
        
        <rect x="86" y="171" width="68" height="24" rx="12" fill="white"/>
        <rect x="86" y="171" width="68" height="24" rx="12" fill="#c8102e"/>
        <rect x="130" y="42" width="24" height="153" rx="0" fill="white"/>
        <rect x="130" y="42" width="24" height="153" rx="0" fill="#c8102e"/>
        
        <path d="M114 60 L142 32 L170 60" fill="white" stroke="white" stroke-width="4" stroke-linejoin="round"/>
        <path d="M114 60 L142 32 L170 60" fill="#c8102e" stroke="#c8102e" stroke-width="2" stroke-linejoin="round"/>
        
        <line x1="54" y1="93" x2="92" y2="133" stroke="white" stroke-width="7" stroke-linecap="round"/>
      </svg>
    </div>

    
    <nav class="navbar">
      <div class="nav-inner">
        <a href="/" class="nav-logo">
          <img src="data:image/png;base64,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" alt="InUni" style="height:44px;width:auto;display:block;" />
        </a>
        <div class="nav-right">
          <span class="nav-hint">Нет аккаунта?</span>
          <a href="/register" class="btn-primary">Вступить</a>
        </div>
      </div>
    </nav>

    
    <main class="main">
      <div class="auth-shell">

        
        <div class="brand-panel">
          <div class="lp-content">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              Добро пожаловать обратно
            </div>

            <h1 class="lp-title">
              Твои люди<br>
              <span class="gradient-text">ждут тебя.</span>
            </h1>

            <p class="lp-sub">
              Войди и возвращайся в свою студенческую сеть — чаты, проекты, хакатоны и новые знакомства.
            </p>

            
            <div class="lp-stats">
              <div class="lp-stat">
                <span class="lp-stat-num">2 400+</span>
                <span class="lp-stat-label">студентов онлайн</span>
              </div>
              <div class="lp-stat-divider"></div>
              <div class="lp-stat">
                <span class="lp-stat-num">120+</span>
                <span class="lp-stat-label">активных команд</span>
              </div>
            </div>

            
            <div class="lp-preview-cards">
              <div class="mini-card mc-back">
                <div class="mc-avatar" style="background:#3a2d6e"></div>
                <div class="mc-lines"><span></span><span style="width:60%"></span></div>
              </div>
              <div class="mini-card mc-main">
                <div class="mc-top">
                  <div class="mc-avatar-main">
                    <span>АК</span>
                  </div>
                  <div class="mc-match-badge">MATCH! 🎉</div>
                </div>
                <div class="mc-name">Алексей Ким</div>
                <div class="mc-sub">Frontend Dev · Vue · React</div>
                <div class="mc-tags">
                  <span>Fintech</span>
                  <span>AI</span>
                </div>
              </div>
              <div class="notif-bubble">
                <span class="notif-dot"></span>
                Максим зовёт в команду 🔥
              </div>
            </div>
          </div>
        </div>

        <div class="form-panel">
          <div class="form-card">
            <div class="mobile-brand">
              <svg height="40" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" aria-label="InUni" style="display:block;">
                <path d="M28 118 L72 38 L90 68 L105 30 L148 105 L148 118Z" fill="#1a3370"/>
                <path d="M90 112 L115 38 L155 95 L155 112Z" fill="#c8102e"/>
                <rect x="24" y="94" width="40" height="114" rx="9" fill="white"/>
                <rect x="28" y="98" width="32" height="106" rx="7" fill="#1a3370"/>
                <rect x="84" y="94" width="28" height="99" rx="0" fill="white"/>
                <rect x="87" y="97" width="22" height="96" rx="0" fill="#c8102e"/>
                <rect x="84" y="169" width="74" height="28" rx="14" fill="white"/>
                <rect x="87" y="172" width="68" height="22" rx="11" fill="#c8102e"/>
                <rect x="128" y="40" width="30" height="157" rx="0" fill="white"/>
                <rect x="131" y="43" width="24" height="151" rx="0" fill="#c8102e"/>
                <path d="M112 62 L143 30 L174 62" fill="white" stroke="white" stroke-width="6" stroke-linejoin="round"/>
                <path d="M114 62 L143 32 L172 62" fill="#c8102e" stroke="#c8102e" stroke-width="2" stroke-linejoin="round"/>
                <line x1="52" y1="90" x2="94" y2="136" stroke="white" stroke-width="8" stroke-linecap="round"/>
              </svg>
              <p>Твоя студенческая сеть</p>
            </div>

            <div class="form-header">
              <h2 class="form-title">Вход в InUni</h2>
              <p class="form-sub">Введи университетскую почту и пароль</p>
            </div>

            
            <div class="field-group">
              <label class="field-label">Университетская почта</label>
              <div class="field-wrap" :class="{ focused: focusedField === 'email', error: emailError }">
                <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                    v-model="email"
                    type="email"
                    placeholder="you@university.edu"
                    class="field-input"
                    @focus="focusedField = 'email'"
                    @blur="focusedField = null; validateEmail()"
                    @keyup.enter="focusPassword"
                />
              </div>
              <span v-if="emailError" class="field-error">{{ emailError }}</span>
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">Пароль</label>
                <button type="button" class="forgot-link" @click="showForgotToast">Забыл пароль?</button>
              </div>
              <div class="field-wrap" :class="{ focused: focusedField === 'password', error: passwordError }">
                <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="field-input"
                    ref="passwordInput"
                    @focus="focusedField = 'password'"
                    @blur="focusedField = null"
                    @keyup.enter="handleLogin"
                />
                <button class="eye-btn" @click="showPassword = !showPassword" type="button">
                  <svg v-if="showPassword" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
            </div>


            
            <button
                class="submit-btn"
                :class="{ loading: isLoading, success: loginSuccess }"
                @click="handleLogin"
                :disabled="isLoading"
            >
              <span v-if="!isLoading && !loginSuccess" class="submit-text">
                Войти в InUni
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
              <span v-if="isLoading" class="submit-spinner">
                <span class="spinner"></span>
                Входим…
              </span>
              <span v-if="loginSuccess" class="submit-ok">
                ✓ Добро пожаловать!
              </span>
            </button>

            
            <div v-if="loginError" class="error-alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ loginError }}
            </div>

            <p class="register-link">
              Ещё нет аккаунта?
              <a href="/register">Вступить в InUni →</a>
            </p>
            
            <p class="admin-link">
              <a href="/admin/login">🛠️ Вход для администраторов</a>
            </p>
          </div>
        </div>

      </div>
    </main>

    
    <transition name="toast-fade">
      <div v-if="forgotToast" class="forgot-toast">
        Не надо было забывать, балда!
      </div>
    </transition>

  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'LoginPage',
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      focusedField: null,
      emailError: '',
      passwordError: '',
      loginSuccess: false,
      forgotToast: false,
    };
  },
  computed: {
    isLoading() {
      return this.authStore.loading
    },
    loginError() {
      return this.authStore.error
    }
  },
  methods: {
    showForgotToast() {
      this.forgotToast = true
      setTimeout(() => { this.forgotToast = false }, 3000)
    },
    focusPassword() {
      this.$refs.passwordInput?.focus();
    },
    validateEmail() {
      if (!this.email) {
        this.emailError = 'Введи почту';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.emailError = 'Неверный формат почты';
      } else {
        this.emailError = '';
      }
    },
    async handleLogin() {
      this.authStore.clearError()
      this.validateEmail()
      if (!this.password) this.passwordError = 'Введи пароль'
      else this.passwordError = ''
      if (this.emailError || this.passwordError) return

      const result = await this.authStore.login(this.email, this.password)
      
      if (result.success) {
        if (result.user?.is_admin) {
          await this.authStore.logout()
          window.location.href = '/admin/login'
          return
        }
        this.loginSuccess = true
        setTimeout(() => {
          this.$router.push('/teams')
        }, 600)
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
  --c-bg:      #080c1a;
  --c-surface: #0f1629;
  --c-card:    #131a30;
  --c-border:  rgba(255,255,255,0.07);
  --c-red:     #e63946;
  --c-red-dim: rgba(230,57,70,0.15);
  --c-blue:    #1d4ed8;
  --c-accent:  #3b82f6;
  --c-text:    #e8eaf2;
  --c-muted:   #7a80a0;
  --c-white:   #ffffff;
  --r:         14px;

  font-family: 'Onest', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── BG ── */
.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.2;
}
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -150px; right: -150px; animation: blobFloat 9s ease-in-out infinite; }
.blob-2 { width: 350px; height: 350px; background: #1d4ed8; bottom: -100px; left: -100px; animation: blobFloat 12s ease-in-out infinite reverse; }
.blob-3 { width: 250px; height: 250px; background: #7c3aed; top: 50%; left: 30%; animation: blobFloat 10s ease-in-out infinite 2s; }
@keyframes blobFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(20px,-20px) scale(1.06); }
}

/* ── BG LOGO WATERMARK ── */
.bg-logo-watermark {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 420px;
  height: 420px;
  opacity: 0.055;
  pointer-events: none;
  transform: rotate(-8deg);
  filter: blur(1px);
}

/* ── NAVBAR ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(8,12,26,0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--c-border);
}
.nav-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 clamp(20px, 4vw, 48px);
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nav-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}
.nav-hint { font-size: 13px; color: var(--c-muted); }

/* ── BUTTONS ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--c-red);
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 14px;
  padding: 10px 22px;
  border-radius: 8px;
  border: none; cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover { background: #c62d39; transform: translateY(-1px); }

/* ── MAIN LAYOUT ── */
.main {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88px clamp(16px, 3vw, 32px) 48px;
}
.auth-shell {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
  gap: clamp(28px, 4vw, 56px);
  align-items: center;
}

/* ── BRAND PANEL ── */
.brand-panel {
  min-width: 0;
}
.lp-content { max-width: 480px; }

.hero-badge {
  display: inline-flex;
  align-items: center; gap: 8px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.3);
  color: #f87171;
  font-size: 12px; font-weight: 500;
  padding: 6px 14px; border-radius: 100px;
  margin-bottom: 24px;
}
.badge-dot {
  width: 6px; height: 6px;
  background: var(--c-red); border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

.lp-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--c-white);
  margin-bottom: 18px;
  letter-spacing: -1px;
}
.gradient-text {
  background: linear-gradient(135deg, #e63946 0%, #f87171 50%, #fb923c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp-sub {
  font-size: 15px; line-height: 1.65;
  color: var(--c-muted);
  margin-bottom: 32px;
  max-width: 400px;
}

.lp-stats {
  display: flex; align-items: center; gap: 20px;
  margin-bottom: 40px;
}
.lp-stat { display: flex; flex-direction: column; gap: 2px; }
.lp-stat-num {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px; font-weight: 700; color: var(--c-white);
}
.lp-stat-label { font-size: 11px; color: var(--c-muted); }
.lp-stat-divider { width: 1px; height: 32px; background: var(--c-border); }

/* Preview Cards */
.lp-preview-cards {
  position: relative;
  width: 280px;
  height: 200px;
}
.mini-card {
  position: absolute;
  width: 250px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.mc-back {
  top: 20px; left: 20px;
  transform: rotate(4deg);
  opacity: 0.4;
}
.mc-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  margin-bottom: 12px;
}
.mc-lines { display: flex; flex-direction: column; gap: 7px; }
.mc-lines span {
  display: block; height: 8px;
  background: rgba(255,255,255,0.07); border-radius: 4px;
}
.mc-main {
  top: 0; left: 0;
  background: var(--c-surface);
  border-color: rgba(255,255,255,0.12);
  animation: cardFloat 4s ease-in-out infinite;
}
@keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.mc-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 10px;
}
.mc-avatar-main {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  border-radius: 12px;
  display: grid; place-items: center;
}
.mc-avatar-main span {
  font-family: 'Unbounded', sans-serif;
  font-size: 11px; font-weight: 700; color: #fff;
}
.mc-match-badge {
  background: linear-gradient(135deg, #e63946, #f97316);
  color: #fff; font-size: 9px; font-weight: 700;
  padding: 3px 8px; border-radius: 100px;
  font-family: 'Unbounded', sans-serif;
  animation: matchPop 1.5s ease-in-out infinite;
}
@keyframes matchPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
.mc-name {
  font-family: 'Unbounded', sans-serif;
  font-size: 13px; font-weight: 700; color: #fff;
  margin-bottom: 3px;
}
.mc-sub { font-size: 11px; color: var(--c-muted); margin-bottom: 10px; }
.mc-tags { display: flex; gap: 5px; }
.mc-tags span {
  font-size: 10px; padding: 2px 8px; border-radius: 100px;
  background: rgba(59,130,246,0.1); color: #93c5fd;
  border: 1px solid rgba(59,130,246,0.2);
}

/* Notification bubble */
.notif-bubble {
  position: absolute;
  bottom: -10px; right: -20px;
  background: var(--c-surface);
  border: 1px solid rgba(52,211,153,0.3);
  border-radius: 100px;
  padding: 7px 14px;
  font-size: 12px; font-weight: 500; color: #34d399;
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  animation: notifBounce 3s ease-in-out infinite;
  white-space: nowrap;
}
.notif-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #34d399;
  animation: pulse 2s infinite;
}
@keyframes notifBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

/* ── FORM PANEL ── */
.form-panel {
  width: 100%;
  min-width: 0;
}
.form-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: rgba(15, 22, 41, 0.9);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: clamp(24px, 3vw, 32px);
  backdrop-filter: blur(14px);
  box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.mobile-brand {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  text-align: center;
}
.mobile-brand p {
  margin: 0;
  font-size: 13px;
  color: var(--c-muted);
}
.form-header { margin-bottom: 22px; }
.form-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 24px; font-weight: 700;
  color: var(--c-white); margin-bottom: 6px;
}
.form-sub { font-size: 14px; color: var(--c-muted); }

/* Fields */
.field-group { margin-bottom: 16px; }
.field-label {
  display: block;
  font-size: 12px; font-weight: 600;
  color: var(--c-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: 'Unbounded', sans-serif;
}
.field-label-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.field-label-row .field-label { margin-bottom: 0; }
.forgot-link {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 12px; color: var(--c-red);
  text-decoration: none; font-weight: 500;
  transition: opacity 0.2s;
}
.forgot-link:hover { opacity: 0.8; }

.field-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03);
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.field-wrap.focused {
  border-color: var(--c-red);
  background: rgba(230,57,70,0.04);
  box-shadow: 0 0 0 3px rgba(230,57,70,0.1);
}
.field-wrap.error {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
}
.field-icon { color: var(--c-muted); flex-shrink: 0; }
.field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--c-white);
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  padding: 13px 0;
}
.field-input::placeholder { color: rgba(122,128,160,0.6); }
.eye-btn {
  background: none; border: none; cursor: pointer;
  color: var(--c-muted); display: flex; align-items: center;
  padding: 4px; transition: color 0.2s;
}
.eye-btn:hover { color: var(--c-text); }
.field-error { display: block; font-size: 11px; color: #f87171; margin-top: 5px; }

/* Remember me */
.remember-row { margin-bottom: 20px; }
.checkbox-wrap {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; user-select: none;
}
.checkbox-input { display: none; }
.checkbox-custom {
  width: 16px; height: 16px;
  border: 1.5px solid var(--c-border);
  border-radius: 4px; background: transparent;
  transition: all 0.2s;
  flex-shrink: 0;
  position: relative;
}
.checkbox-input:checked + .checkbox-custom {
  background: var(--c-red);
  border-color: var(--c-red);
}
.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 3px; top: 1px;
  width: 5px; height: 8px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}
.checkbox-label { font-size: 13px; color: var(--c-muted); }

/* Submit */
.submit-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--c-red);
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-weight: 700; font-size: 15px;
  padding: 14px 24px;
  border-radius: 10px;
  border: none; cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  min-height: 50px;
}
.submit-btn:hover:not(:disabled) { background: #c62d39; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(230,57,70,0.3); }
.submit-btn:disabled { opacity: 0.8; cursor: default; transform: none; }
.submit-btn.success { background: #16a34a; }

.submit-text { display: flex; align-items: center; gap: 8px; }
.submit-spinner { display: flex; align-items: center; gap: 10px; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error alert */
.error-alert {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px; color: #f87171;
  margin-bottom: 12px;
}

/* Forgot toast */
.forgot-toast {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #131a30; border: 1px solid rgba(230,57,70,0.3);
  color: var(--c-white); font-size: 18px; font-weight: 700;
  padding: 14px 22px; border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.4); z-index: 999;
  white-space: nowrap;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, -40%); }

/* Register link */
.register-link {
  text-align: center;
  font-size: 13px; color: var(--c-muted);
}
.register-link a {
  color: var(--c-red); text-decoration: none; font-weight: 600;
}
.register-link a:hover { text-decoration: underline; }

/* Admin link */
.admin-link {
  text-align: center;
  font-size: 12px;
  color: var(--c-muted);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--c-border);
}
.admin-link a {
  color: var(--c-blue);
  text-decoration: none;
  font-weight: 500;
}
.admin-link a:hover {
  text-decoration: underline;
  color: var(--c-accent);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .main {
    align-items: flex-start;
    padding-top: 84px;
  }
  .auth-shell {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
  .brand-panel { display: none; }
  .mobile-brand { display: flex; }
  .form-card { max-width: 100%; }
}
@media (max-width: 600px) {
  .form-title { font-size: 20px; }
  .form-card { padding: 22px 18px; border-radius: 16px; }
  .lp-preview-cards { display: none; }
}
</style>ч