<template>
  <div class="admin-login-page">
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <h1>🛠️ Admin Panel</h1>
        <p>Вход для администраторов</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="admin@inuni.com"
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••"
            :disabled="loading"
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn-login"
          :disabled="loading"
        >
          <span v-if="loading">Вход...</span>
          <span v-else>Войти как админ</span>
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/login" class="link-user">
          ← Вход для пользователей
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'AdminLoginPage',
  
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null
      
      const authStore = useAuthStore()
      
      try {
        const result = await authStore.adminLogin(this.email, this.password)
        
        if (result.success) {
          this.$router.push('/admin')
        } else {
          this.error = result.error || 'Неверные данные администратора'
        }
      } catch (e) {
        this.error = 'Ошибка входа: ' + e.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  --c-bg: #080c1a;
  --c-surface: #0f1629;
  --c-card: #131a30;
  --c-border: rgba(255, 255, 255, 0.07);
  --c-red: #e63946;
  --c-red-dim: rgba(230, 57, 70, 0.15);
  --c-blue: #1d4ed8;
  --c-blue-dim: rgba(29, 78, 216, 0.15);
  --c-text: #e8eaf2;
  --c-muted: #8891b2;
  --c-white: #ffffff;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  font-family: 'Onest', sans-serif;
}

/* Background */
.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: var(--c-bg);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.2;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #e63946;
  top: -150px;
  right: -150px;
  animation: blobFloat 9s ease-in-out infinite;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: #1d4ed8;
  bottom: -100px;
  left: -100px;
  animation: blobFloat 12s ease-in-out infinite reverse;
}

@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.06); }
}

.login-card {
  position: relative;
  z-index: 1;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--c-white);
  margin: 0 0 8px 0;
}

.login-header p {
  color: var(--c-muted);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text);
}

.form-group input {
  padding: 14px 18px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  font-size: 16px;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--c-red);
  box-shadow: 0 0 0 3px var(--c-red-dim);
}

.form-group input:disabled {
  background: rgba(255, 255, 255, 0.03);
  cursor: not-allowed;
  color: var(--c-muted);
}

.form-group input::placeholder {
  color: var(--c-muted);
}

.error-message {
  background: var(--c-red-dim);
  border: 1px solid rgba(230, 57, 70, 0.3);
  color: var(--c-red);
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.btn-login {
  background: linear-gradient(135deg, var(--c-red) 0%, var(--c-blue) 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  font-family: 'Onest', sans-serif;
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.35);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(230, 57, 70, 0.45);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.link-user {
  color: var(--c-muted);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.link-user:hover {
  color: var(--c-red);
}
</style>
