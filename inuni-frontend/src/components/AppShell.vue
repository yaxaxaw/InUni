<template>
  <div class="app-page">
    <aside class="sidebar">
      <RouterLink to="/" class="sidebar-logo">
        <InUniLogo :height="36" variant="inuni-logo--compact" />
      </RouterLink>

      <nav class="sidebar-nav">
        <template v-for="group in navGroups" :key="group.label">
          <div class="nav-group-label">{{ group.label }}</div>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            @click="item.to === '/chat' && clearUnread(); item.to === '/friends' && clearFriendBadge()"
          >
            <span class="nav-icon-wrap">
              <AppIcon :name="item.icon" :size="18" />
              <span v-if="item.to === '/chat' && unreadDm > 0" class="nav-badge">{{ unreadDm > 9 ? '9+' : unreadDm }}</span>
              <span v-if="item.to === '/friends' && pendingFriends > 0" class="nav-badge nav-badge--friends">{{ pendingFriends > 9 ? '9+' : pendingFriends }}</span>
            </span>
            <span class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-chip">
          <div class="user-avatar" :class="{ 'user-avatar--photo': !!profile.profilePhoto }">
            <img v-if="profile.profilePhoto" :src="profile.profilePhoto" alt="" class="user-avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ profile.fullName }}</span>
            <span class="user-role">{{ profile.role }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>

    <nav class="mobile-bottom-nav" v-if="!isAdmin">
      <RouterLink to="/profile" class="mob-nav-item" @click.native="clearUnread">
        <span class="mob-nav-icon-wrap">
          <AppIcon name="user" :size="22" />
        </span>
        <span class="mob-nav-label">Профиль</span>
      </RouterLink>
      <RouterLink to="/swipe" class="mob-nav-item">
        <span class="mob-nav-icon-wrap">
          <AppIcon name="sparkles" :size="22" />
        </span>
        <span class="mob-nav-label">Знакомства</span>
      </RouterLink>
      <RouterLink to="/teams" class="mob-nav-item">
        <span class="mob-nav-icon-wrap">
          <AppIcon name="trophy" :size="22" />
        </span>
        <span class="mob-nav-label">Команды</span>
      </RouterLink>
      <RouterLink to="/chat" class="mob-nav-item" @click.native="clearUnread">
        <span class="mob-nav-icon-wrap">
          <AppIcon name="chat" :size="22" />
          <span v-if="unreadDm > 0" class="mob-nav-badge">{{ unreadDm > 9 ? '9+' : unreadDm }}</span>
        </span>
        <span class="mob-nav-label">Чат</span>
      </RouterLink>
      <RouterLink to="/friends" class="mob-nav-item" @click.native="clearFriendBadge">
        <span class="mob-nav-icon-wrap">
          <AppIcon name="users" :size="22" />
          <span v-if="pendingFriends > 0" class="mob-nav-badge">{{ pendingFriends > 9 ? '9+' : pendingFriends }}</span>
        </span>
        <span class="mob-nav-label">Друзья</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'
import InUniLogo from './InUniLogo.vue'
import { createInitials } from '../lib/appState'
import { useAuthStore } from '../stores/auth.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://backend-production-431c.up.railway.app' : 'http://localhost:8080')

export default {
  name: 'AppShell',
  components: {
    AppIcon,
    InUniLogo,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    return {
      unreadDm: 0,
      _lastDmId: 0,
      _notifTimer: null,
      pendingFriends: 0,
      _friendTimer: null,
    }
  },
  mounted() {
    this._startNotifPolling()
    this._startFriendPolling()
    this._checkFriendBadge()
    this._onFriendClear = () => { this.pendingFriends = 0 }
    window.addEventListener('friends-badge-clear', this._onFriendClear)
  },
  beforeUnmount() {
    if (this._notifTimer) clearInterval(this._notifTimer)
    if (this._friendTimer) clearInterval(this._friendTimer)
    window.removeEventListener('friends-badge-clear', this._onFriendClear)
  },
  methods: {
    clearUnread() {
      this.unreadDm = 0
    },
    clearFriendBadge() {
      this.pendingFriends = 0
    },
    async _checkFriendBadge() {
      if (this.$route?.path === '/friends') { this.pendingFriends = 0; return }
      const token = localStorage.getItem('accessToken')
      if (!token) return
      try {
        const res = await fetch('/api/friends/incoming', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        this.pendingFriends = Array.isArray(data) ? data.length : 0
      } catch {}
    },
    _startFriendPolling() {
      if (this._friendTimer) clearInterval(this._friendTimer)
      this._friendTimer = setInterval(() => this._checkFriendBadge(), 5000)
    },
    _startNotifPolling() {
      if (this._notifTimer) clearInterval(this._notifTimer)
      this._notifTimer = setInterval(async () => {
        if (this.$route?.path === '/chat') { this.unreadDm = 0; return }
        const token = localStorage.getItem('accessToken')
        if (!token) return
        try {
          const res = await fetch(`${API_BASE}/api/dm/unread?since=${this._lastDmId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) return
          const data = await res.json()
          if (data.count > 0) {
            this.unreadDm += data.count
            this._lastDmId = data.lastId
          }
        } catch (e) {}
      }, 3000)
    },
  },
  computed: {
    profile() {
      const authProfile = this.authStore.profile || {}
      const rawPhoto = authProfile.profile_photo || ''
      const photoUrl = rawPhoto
        ? (rawPhoto.startsWith('http') ? rawPhoto : `${API_BASE}${rawPhoto}`)
        : ''
      return {
        firstName: authProfile.first_name || '',
        lastName: authProfile.last_name || '',
        fullName: `${authProfile.first_name || ''} ${authProfile.last_name || ''}`.trim() || 'Пользователь',
        role: authProfile.role || '',
        profilePhoto: photoUrl,
      }
    },
    initials() {
      return createInitials(this.profile.firstName, this.profile.lastName)
    },
    isAdmin() {
      return !!this.authStore.user?.is_admin
    },
    navGroups() {
      if (this.isAdmin) {
        return [
          { label: 'Админ', items: [
            { to: '/admin', label: 'Хакатоны', icon: 'trophy' },
            { to: '/admin/events', label: 'Мероприятия', icon: 'calendar' },
          ]},
        ]
      }
      return [
        { label: 'Я', items: [
          { to: '/profile', label: 'Профиль', icon: 'user' },
        ]},
        { label: 'Участие', items: [
          { to: '/events', label: 'Мероприятия', icon: 'calendar' },
          { to: '/teams', label: 'Команды', icon: 'trophy' },
          { to: '/career', label: 'Карьера', icon: 'briefcase' },
        ]},
        { label: 'Люди', items: [
          { to: '/swipe', label: 'Знакомства', icon: 'sparkles' },
          { to: '/friends', label: 'Друзья', icon: 'users' },
        ]},
        { label: 'Общение', items: [
          { to: '/chat', label: 'Чат', icon: 'chat' },
        ]},
      ]
    },
  },
}
</script>

<style scoped>
.app-page {
  --c-bg: #080c1a;
  --c-surface: #0f1629;
  --c-card: #131a30;
  --c-border: rgba(255, 255, 255, 0.07);
  --c-red: #e63946;
  --c-red-dim: rgba(230, 57, 70, 0.12);
  --c-text: #e8eaf2;
  --c-muted: #8891b2;
  --c-white: #ffffff;
  font-family: 'Onest', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 236px;
  flex-shrink: 0;
  background: rgba(15, 22, 41, 0.92);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  backdrop-filter: blur(12px);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  margin-bottom: 34px;
  padding: 0 4px;
  text-decoration: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-group-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-muted);
  padding: 14px 12px 4px;
  opacity: 0.6;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-muted);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--c-text);
}

.nav-item.router-link-active {
  background: var(--c-red-dim);
  color: #f28b93;
  border: 1px solid rgba(230, 57, 70, 0.18);
}

.nav-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--c-red);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  font-family: 'Onest', sans-serif;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  pointer-events: none;
  line-height: 1;
}
.nav-badge--friends {
  background: #059669;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  display: grid;
  place-items: center;
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar--photo {
  background: transparent;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-info {
  min-width: 0;
}

.user-name,
.user-role {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-white);
}

.user-role {
  font-size: 11px;
  color: var(--c-muted);
}

.main-content {
  margin-left: 236px;
  flex: 1;
  min-height: 100vh;
  position: relative;
  min-width: 0;
}

@media (max-width: 1180px) {
  .sidebar {
    width: 92px;
    padding: 20px 12px;
  }

  .sidebar-logo {
    justify-content: center;
    padding: 0;
  }

  .user-info,
  .nav-item span,
  .nav-group-label {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }

  .user-chip {
    justify-content: center;
    padding: 8px;
  }

  .main-content {
    margin-left: 92px;
  }
}

@media (max-width: 760px) {
  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
    padding-bottom: 72px;
  }
}

.mobile-bottom-nav {
  display: none;
}

@media (max-width: 760px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(15, 22, 41, 0.97);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    height: 64px;
    padding-bottom: env(safe-area-inset-bottom);
    align-items: center;
    justify-content: space-around;
  }

  .mob-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    height: 100%;
    text-decoration: none;
    color: rgba(136, 145, 178, 0.7);
    transition: color 0.2s;
    position: relative;
  }

  .mob-nav-item.router-link-active {
    color: #e63946;
  }

  .mob-nav-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mob-nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .mob-nav-badge {
    position: absolute;
    top: -5px;
    right: -8px;
    background: #e63946;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }
}
</style>
