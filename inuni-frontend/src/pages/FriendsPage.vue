<template>
  <AppShell>
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="friends-page">
      <div class="page-header">
        <div>
          <div class="page-label">Социальное</div>
          <h1 class="page-title">Друзья</h1>
          <p class="page-sub">Добавляй однокурсников в друзья и приглашай их в команды.</p>
        </div>
      </div>

      
      <div class="friends-tabs">
        <button class="ftab" :class="{ active: tab === 'friends' }" @click="tab = 'friends'">
          Друзья <span v-if="friends.length" class="ftab-count">{{ friends.length }}</span>
        </button>
        <button class="ftab" :class="{ active: tab === 'incoming' }" @click="tab = 'incoming'">
          Заявки <span v-if="incoming.length" class="ftab-count ftab-count--red">{{ incoming.length }}</span>
        </button>
        <button class="ftab" :class="{ active: tab === 'search' }" @click="tab = 'search'">
          Найти
        </button>
      </div>

      
      <div v-if="tab === 'friends'" class="friends-list">
        <div v-if="!friends.length" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>У тебя пока нет друзей.<br>Найди их через вкладку «Найти».</p>
        </div>
        <div v-for="user in friends" :key="user.id" class="friend-row">
          <div class="friend-avatar" :style="avatarStyle(user)" @click="$router.push('/profile/' + user.id)" style="cursor:pointer">
            <span v-if="!user.profile_photo">{{ initials(user) }}</span>
          </div>
          <div class="friend-info" style="cursor:pointer" @click="$router.push('/profile/' + user.id)">
            <div class="friend-name">{{ user.first_name }} {{ user.last_name }}</div>
            <div class="friend-role">{{ user.role || 'Студент' }}</div>
          </div>
          <button class="btn-remove" @click="removeFriend(user.id)" title="Удалить из друзей">✕</button>
        </div>
      </div>

      
      <div v-if="tab === 'incoming'" class="friends-list">
        <div v-if="!incoming.length" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Входящих заявок нет.</p>
        </div>
        <div v-for="user in incoming" :key="user.id" class="friend-row">
          <div class="friend-avatar" :style="avatarStyle(user)" @click="$router.push('/profile/' + user.id)" style="cursor:pointer">
            <span v-if="!user.profile_photo">{{ initials(user) }}</span>
          </div>
          <div class="friend-info" style="cursor:pointer" @click="$router.push('/profile/' + user.id)">
            <div class="friend-name">{{ user.first_name }} {{ user.last_name }}</div>
            <div class="friend-role">{{ user.role || 'Студент' }}</div>
          </div>
          <div class="friend-actions">
            <button class="btn-accept" @click="acceptRequest(user.id)">✓ Принять</button>
            <button class="btn-remove" @click="declineRequest(user.id)">✕</button>
          </div>
        </div>
      </div>

      <div v-if="tab === 'search'" class="friends-list">
        <div class="search-bar">
          <input v-model="searchQ" type="text" placeholder="Имя или роль..." class="search-input" @input="searchUsers" />
        </div>
        <div v-if="!searchResults.length && searchQ" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>Никого не найдено</p>
        </div>
        <div v-for="user in searchResults" :key="user.id" class="friend-row">
          <div class="friend-avatar" :style="avatarStyle(user)" @click="$router.push('/profile/' + user.id)" style="cursor:pointer">
            <span v-if="!user.profile_photo">{{ initials(user) }}</span>
          </div>
          <div class="friend-info" style="cursor:pointer" @click="$router.push('/profile/' + user.id)">
            <div class="friend-name">{{ user.first_name }} {{ user.last_name }}</div>
            <div class="friend-role">{{ user.role || 'Студент' }}</div>
          </div>
          <button
            class="btn-add"
            :class="{ sent: user.friendStatus === 'pending', added: user.friendStatus === 'accepted' }"
            :disabled="user.friendStatus !== 'none'"
            @click="sendRequest(user)"
          >
            <span v-if="user.friendStatus === 'accepted'">✓ Друг</span>
            <span v-else-if="user.friendStatus === 'pending'">Отправлено</span>
            <span v-else>+ Добавить</span>
          </button>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import { createInitials } from '../lib/appState'

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://backend-production-431c.up.railway.app' : 'http://localhost:8080')
const COLORS = ['linear-gradient(135deg,#e63946,#1d4ed8)', 'linear-gradient(135deg,#7c3aed,#2563eb)', 'linear-gradient(135deg,#059669,#0d9488)', 'linear-gradient(135deg,#d97706,#dc2626)']

export default {
  name: 'FriendsPage',
  components: { AppShell },
  data() {
    return {
      tab: 'friends',
      friends: [],
      incoming: [],
      searchQ: '',
      searchResults: [],
      _searchTimer: null,
    }
  },
  async mounted() {
    await this.loadFriends()
    await this.loadIncoming()
    window.dispatchEvent(new CustomEvent('friends-badge-clear'))
  },
  methods: {
    token() { return localStorage.getItem('accessToken') },
    initials(user) { return createInitials(user.first_name, user.last_name) },
    avatarStyle(user) {
      if (user.profile_photo) {
        const url = user.profile_photo.startsWith('http') ? user.profile_photo : `${API_BASE}${user.profile_photo}`
        return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }
      return { background: COLORS[(user.id?.charCodeAt(0) || 0) % COLORS.length] }
    },
    async loadFriends() {
      try {
        const res = await fetch(`${API_BASE}/api/friends`, { headers: { Authorization: `Bearer ${this.token()}` } })
        this.friends = await res.json()
      } catch (e) {}
    },
    async loadIncoming() {
      try {
        const res = await fetch(`${API_BASE}/api/friends/incoming`, { headers: { Authorization: `Bearer ${this.token()}` } })
        this.incoming = await res.json()
      } catch (e) {}
    },
    async searchUsers() {
      clearTimeout(this._searchTimer)
      if (!this.searchQ.trim()) { this.searchResults = []; return }
      this._searchTimer = setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/profiles/search?q=${encodeURIComponent(this.searchQ)}`, {
            headers: { Authorization: `Bearer ${this.token()}` }
          })
          const users = await res.json()
          this.searchResults = await Promise.all(users.map(async u => {
            try {
              const sr = await fetch(`${API_BASE}/api/friends/status/${u.id}`, { headers: { Authorization: `Bearer ${this.token()}` } })
              const sd = await sr.json()
              return { ...u, friendStatus: sd.status }
            } catch { return { ...u, friendStatus: 'none' } }
          }))
        } catch (e) {}
      }, 300)
    },
    async sendRequest(user) {
      try {
        const res = await fetch(`${API_BASE}/api/friends/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token()}` },
          body: JSON.stringify({ toUserId: user.id })
        })
        const data = await res.json()
        user.friendStatus = data.status
        if (data.status === 'accepted') { this.loadFriends() }
      } catch (e) {}
    },
    async acceptRequest(fromId) {
      try {
        await fetch(`${API_BASE}/api/friends/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token()}` },
          body: JSON.stringify({ fromUserId: fromId })
        })
        this.incoming = this.incoming.filter(u => u.id !== fromId)
        await this.loadFriends()
      } catch (e) {}
    },
    async declineRequest(fromId) {
      try {
        await fetch(`${API_BASE}/api/friends/${fromId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${this.token()}` } })
        this.incoming = this.incoming.filter(u => u.id !== fromId)
      } catch (e) {}
    },
    async removeFriend(userId) {
      try {
        await fetch(`${API_BASE}/api/friends/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${this.token()}` } })
        this.friends = this.friends.filter(u => u.id !== userId)
      } catch (e) {}
    },
  }
}
</script>

<style scoped>
.page-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.blob {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12;
}
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -100px; left: -100px; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: -80px; right: -80px; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}
.friends-page {
  position: relative; z-index: 1;
  max-width: 640px; margin: 0 auto;
  padding: 40px 24px 80px;
}
.page-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: #e63946; text-transform: uppercase; margin-bottom: 6px;
}
.page-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px; color: #fff; margin: 0 0 6px;
}
.page-sub { font-size: 14px; color: #8891b2; margin: 0 0 28px; }

.friends-tabs {
  display: flex; gap: 8px; margin-bottom: 24px;
}
.ftab {
  flex: 1; padding: 10px 0;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.03);
  color: #8891b2; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ftab.active {
  background: rgba(230,57,70,0.1);
  border-color: rgba(230,57,70,0.3);
  color: #f87171;
}
.ftab:hover:not(.active) { border-color: rgba(255,255,255,0.12); color: #e8eaf2; }
.ftab-count {
  background: rgba(255,255,255,0.1);
  border-radius: 20px; padding: 1px 7px;
  font-size: 11px;
}
.ftab-count--red {
  background: rgba(230,57,70,0.2);
  color: #f87171;
}

.friends-list { display: flex; flex-direction: column; gap: 8px; }
.friend-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  transition: border-color 0.15s;
}
.friend-row:hover { border-color: rgba(255,255,255,0.12); }
.friend-avatar {
  width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px; color: #fff;
}
.friend-info { flex: 1; min-width: 0; }
.friend-name { font-size: 14px; font-weight: 600; color: #fff; }
.friend-role { font-size: 12px; color: #8891b2; margin-top: 2px; }
.friend-actions { display: flex; gap: 8px; }

.btn-add {
  padding: 8px 16px; border-radius: 10px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.3);
  color: #f87171; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: all 0.15s;
}
.btn-add:hover:not(:disabled) { background: rgba(230,57,70,0.2); }
.btn-add.sent, .btn-add.added {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.08);
  color: #8891b2; cursor: default;
}
.btn-accept {
  padding: 7px 14px; border-radius: 10px;
  background: rgba(5,150,105,0.15);
  border: 1px solid rgba(5,150,105,0.3);
  color: #34d399; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-accept:hover { background: rgba(5,150,105,0.25); }
.btn-remove {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #8891b2; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.btn-remove:hover { background: rgba(230,57,70,0.1); border-color: rgba(230,57,70,0.2); color: #f87171; }

.search-bar { margin-bottom: 12px; }
.search-input {
  width: 100%; padding: 11px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; color: #e8eaf2;
  font-size: 14px; outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.search-input:focus { border-color: rgba(230,57,70,0.35); }
.search-input::placeholder { color: #8891b2; }

.empty-state {
  text-align: center; padding: 40px 20px;
  color: #8891b2; font-size: 14px;
}
.empty-icon { font-size: 36px; margin-bottom: 12px; }
</style>
