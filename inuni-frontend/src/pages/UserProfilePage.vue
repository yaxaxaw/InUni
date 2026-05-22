<template>
  <AppShell>
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="uprofile-page">

      
      <div v-if="loading" class="uprofile-loading">
        <div class="spinner"></div>
      </div>

      
      <div v-else-if="!user" class="uprofile-notfound">
        <div class="nf-icon">🔍</div>
        <h2>Профиль не найден</h2>
        <p>Возможно, пользователь удалил аккаунт или ссылка неверна.</p>
        <button class="btn-outline" @click="$router.back()">← Назад</button>
      </div>

      
      <div v-else class="uprofile-content">

        
        <div class="uprofile-hero">
          <button class="btn-back" @click="$router.back()">← Назад</button>

          <div class="hero-avatar-wrap">
            <div
              class="hero-avatar"
              :class="{ 'hero-avatar--photo': !!mainPhoto }"
              :style="mainPhoto ? { backgroundImage: `url(${mainPhoto})` } : { background: avatarColor }"
              @click="mainPhoto && openLightbox(allPhotos, 0)"
              :style2="mainPhoto ? { cursor: 'zoom-in' } : {}"
            >
              <span v-if="!mainPhoto" class="hero-initials">{{ initials }}</span>
            </div>
            
            <div v-if="allPhotos.length > 1" class="hero-photo-dots">
              <span
                v-for="(p, i) in allPhotos" :key="i"
                class="hero-dot"
                :class="{ active: i === photoIdx }"
                @click="photoIdx = i"
              ></span>
            </div>
            <button v-if="allPhotos.length > 1 && photoIdx > 0" class="hero-arr hero-arr--l" @click="photoIdx--">‹</button>
            <button v-if="allPhotos.length > 1 && photoIdx < allPhotos.length-1" class="hero-arr hero-arr--r" @click="photoIdx++">›</button>
          </div>

          <div class="hero-info">
            <div class="hero-name-row">
              <h1 class="hero-name">{{ user.first_name }} {{ user.last_name }}</h1>
              <span v-if="userAchievement" class="rank-badge-hero" :title="userAchievement.currentRank.name + ' · ' + userAchievement.total + ' участий'">
                {{ userAchievement.currentRank.emoji }} {{ userAchievement.currentRank.name }}
              </span>
            </div>
            <div class="hero-role" v-if="user.role">{{ user.role }}</div>
            <div class="hero-meta">
              <span v-if="user.direction" class="hero-meta-item">🎓 {{ user.direction }}</span>
              <span v-if="user.course" class="hero-meta-item">📅 {{ user.course }}</span>
            </div>

            
            <div class="hero-actions">
              <button
                class="btn-friend"
                :class="friendBtnClass"
                :disabled="friendStatus === 'accepted' || friendStatus === 'pending_sent'"
                @click="handleFriendAction"
              >
                <span v-if="friendStatus === 'accepted'">✓ Уже в друзьях</span>
                <span v-else-if="friendStatus === 'pending_sent'">✓ Заявка отправлена</span>
                <span v-else-if="friendStatus === 'pending_incoming'">✓ Принять заявку</span>
                <span v-else>+ Добавить в друзья</span>
              </button>
              <button class="btn-message" @click="openChat">
                <AppIcon name="chat" :size="16" /> Написать
              </button>
            </div>
          </div>
        </div>

        
        <div v-if="user.about" class="uprofile-card">
          <div class="card-label">О себе</div>
          <p class="card-text">{{ user.about }}</p>
        </div>

        
        <div v-if="hardSkills.length || softSkills.length" class="uprofile-card">
          <div class="card-label">Навыки</div>
          <div v-if="hardSkills.length" class="skills-block">
            <div class="skills-block-title">⚙️ Hard Skills</div>
            <div class="skills-list">
              <span v-for="s in hardSkills" :key="s" class="skill-tag skill-tag--hard">{{ s }}</span>
            </div>
          </div>
          <div v-if="softSkills.length" class="skills-block" :style="hardSkills.length ? 'margin-top:14px' : ''">
            <div class="skills-block-title">🧠 Soft Skills</div>
            <div class="skills-list">
              <span v-for="s in softSkills" :key="s" class="skill-tag skill-tag--soft">{{ s }}</span>
            </div>
          </div>
        </div>

        
        <div v-if="galleryPhotos.length > 1" class="uprofile-card">
          <div class="card-label">Фотографии</div>
          <div class="gallery-grid">
            <div
              v-for="(ph, i) in galleryPhotos" :key="i"
              class="gallery-thumb"
              :style="{ backgroundImage: `url(${ph})` }"
              @click="openLightbox(galleryPhotos, i)"
            ></div>
          </div>
        </div>

        
        <div v-if="user.resume" class="uprofile-card">
          <div class="card-label">Резюме / CV</div>
          <div class="resume-row">
            <span class="resume-icon-big">📄</span>
            <div class="resume-info">
              <div class="resume-title">Резюме</div>
              <div class="resume-sub">PDF / DOC файл</div>
            </div>
            <a :href="user.resume" target="_blank" download class="resume-dl-btn">⬇ Скачать</a>
            <a :href="user.resume" target="_blank" class="resume-view-btn">👁 Открыть</a>
          </div>
        </div>

        
        <div class="uprofile-card career-card">
          <div class="card-label">✨ AI Портрет кандидата</div>
          <p class="career-hint">AI составит портрет {{ user.first_name || 'кандидата' }} для принятия решения о найме</p>
          <button class="career-btn" :class="{ loading: careerLoading }" @click="getCareerGuidance" :disabled="careerLoading">
            <span v-if="careerLoading">⏳ Составляю портрет {{ user.first_name || '' }}...</span>
            <span v-else>🎯 Составить портрет {{ user.first_name || 'кандидата' }}</span>
          </button>
          <div v-if="careerGuidance" class="career-result" v-html="formattedGuidance"></div>
        </div>

        
        <div v-if="user.github || user.linkedin" class="uprofile-card">
          <div class="card-label">Контакты</div>
          <div class="links-list">
            <a v-if="user.github" :href="user.github" target="_blank" class="link-item">
              <span class="link-icon">🐙</span> GitHub
            </a>
            <a v-if="user.linkedin" :href="user.linkedin" target="_blank" class="link-item">
              <span class="link-icon">💼</span> LinkedIn
            </a>
          </div>
        </div>

      </div>
    </div>

    
    <transition name="fade">
      <div v-if="lightboxUrl" class="lightbox-overlay" @click.self="lightboxUrl = null">
        <button class="lb-close" @click="lightboxUrl = null">✕</button>
        <button v-if="lightboxList.length > 1" class="lb-arrow lb-arrow--prev" @click="lbPrev">‹</button>
        <img :src="lightboxUrl" class="lightbox-img" />
        <button v-if="lightboxList.length > 1" class="lb-arrow lb-arrow--next" @click="lbNext">›</button>
        <div v-if="lightboxList.length > 1" class="lb-counter">{{ lightboxIdx + 1 }} / {{ lightboxList.length }}</div>
      </div>
    </transition>

  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import AppIcon from '../components/AppIcon.vue'
import { createInitials } from '../lib/appState'
import { HARD_SKILLS, SOFT_SKILLS } from '../lib/universityProfile'

const API_BASE = ''
const COLORS = [
  'linear-gradient(135deg,#e63946,#1d4ed8)',
  'linear-gradient(135deg,#7c3aed,#2563eb)',
  'linear-gradient(135deg,#059669,#0d9488)',
  'linear-gradient(135deg,#d97706,#dc2626)',
]

function fullUrl(p) {
  if (!p) return ''
  if (p.startsWith('http')) return p
  return p
}

export default {
  name: 'UserProfilePage',
  components: { AppShell, AppIcon },
  data() {
    return {
      user: null,
      loading: true,
      friendStatus: 'none',
      photoIdx: 0,
      lightboxUrl: null,
      lightboxList: [],
      lightboxIdx: 0,
      careerLoading: false,
      careerGuidance: '',
      apiBase: API_BASE,
      userAchievement: null,
    }
  },
  computed: {
    formattedGuidance() {
      return this.careerGuidance
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
    },
    userId() { return this.$route.params.userId },
    initials() {
      if (!this.user) return ''
      return createInitials(this.user.first_name, this.user.last_name)
    },
    avatarColor() {
      const code = this.userId?.charCodeAt(0) || 0
      return COLORS[code % COLORS.length]
    },
    allPhotos() {
      if (!this.user) return []
      const main = fullUrl(this.user.profile_photo)
      const extras = (this.user.photos || []).map(fullUrl)
      const all = main ? [main, ...extras.filter(p => p !== main)] : extras
      return all.filter(Boolean)
    },
    galleryPhotos() { return this.allPhotos },
    mainPhoto() { return this.allPhotos[this.photoIdx] || '' },
    hardSkills() {
      return (this.user?.interests || []).filter(s => HARD_SKILLS.includes(s))
    },
    softSkills() {
      return (this.user?.interests || []).filter(s => SOFT_SKILLS.includes(s))
    },
    friendBtnClass() {
      if (this.friendStatus === 'accepted') return 'btn-friend--added'
      if (this.friendStatus === 'pending_sent') return 'btn-friend--sent'
      if (this.friendStatus === 'pending_incoming') return 'btn-friend--incoming'
      return 'btn-friend--add'
    },
  },
  async mounted() {
    await this.loadProfile()
    await this.loadFriendStatus()
    this.loadUserAchievement()
  },
  methods: {
    token() { return localStorage.getItem('accessToken') },
    async loadUserAchievement() {
      try {
        const res = await fetch(`/api/achievements/${this.userId}`, {
          headers: { Authorization: `Bearer ${this.token()}` }
        })
        if (res.ok) this.userAchievement = await res.json()
      } catch {}
    },
    async loadProfile() {
      try {
        const res = await fetch(`/api/profiles/${this.userId}`, {
          headers: { Authorization: `Bearer ${this.token()}` }
        })
        if (!res.ok) { this.user = null; return }
        this.user = await res.json()
      } catch { this.user = null }
      finally { this.loading = false }
    },
    async loadFriendStatus() {
      try {
        const res = await fetch(`/api/friends/status/${this.userId}`, {
          headers: { Authorization: `Bearer ${this.token()}` }
        })
        const data = await res.json()
        if (data.status === 'accepted') this.friendStatus = 'accepted'
        else if (data.status === 'pending') {
          this.friendStatus = data.isSender ? 'pending_sent' : 'pending_incoming'
        } else this.friendStatus = 'none'
      } catch {}
    },
    async handleFriendAction() {
      if (this.friendStatus === 'pending_incoming') {
        await fetch('/api/friends/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token()}` },
          body: JSON.stringify({ fromUserId: this.userId })
        })
        this.friendStatus = 'accepted'
      } else if (this.friendStatus === 'none') {
        const res = await fetch('/api/friends/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token()}` },
          body: JSON.stringify({ toUserId: this.userId })
        })
        const data = await res.json()
        this.friendStatus = data.status === 'accepted' ? 'accepted' : 'pending_sent'
      }
    },
    openChat() {
      this.$router.push({ path: '/chat', query: { dm: this.userId } })
    },
    async getCareerGuidance() {
      if (!this.user) return
      this.careerLoading = true
      this.careerGuidance = ''
      try {
        const res = await fetch('/api/ai/career-guidance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token()}` },
          body: JSON.stringify({
            skills: (this.user.interests || []).filter(s => this.hardSkills.includes(s)),
            interests: (this.user.interests || []).filter(s => this.softSkills.includes(s)),
            direction: this.user.direction,
            role: this.user.role,
            about: this.user.about,
          })
        })
        const data = await res.json()
        this.careerGuidance = data.guidance || 'Не удалось получить ответ'
      } catch { this.careerGuidance = 'Ошибка запроса' }
      finally { this.careerLoading = false }
    },
    openLightbox(list, idx) {
      this.lightboxList = list
      this.lightboxIdx = idx
      this.lightboxUrl = list[idx]
    },
    lbNext() {
      this.lightboxIdx = (this.lightboxIdx + 1) % this.lightboxList.length
      this.lightboxUrl = this.lightboxList[this.lightboxIdx]
    },
    lbPrev() {
      this.lightboxIdx = (this.lightboxIdx - 1 + this.lightboxList.length) % this.lightboxList.length
      this.lightboxUrl = this.lightboxList[this.lightboxIdx]
    },
  }
}
</script>

<style scoped>
.page-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -120px; left: -120px; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: -80px; right: -80px; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}

.uprofile-page {
  position: relative; z-index: 1;
  max-width: 680px; margin: 0 auto;
  padding: 32px 24px 80px;
}

.uprofile-loading {
  display: flex; justify-content: center; padding: 80px 0;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.uprofile-notfound {
  text-align: center; padding: 80px 20px;
  color: #8891b2;
}
.nf-icon { font-size: 48px; margin-bottom: 16px; }
.uprofile-notfound h2 { color: #e8eaf2; margin-bottom: 8px; }

.btn-back {
  background: none; border: none; color: #8891b2;
  font-size: 13px; cursor: pointer; padding: 0;
  margin-bottom: 24px; display: block;
  transition: color 0.15s;
}
.btn-back:hover { color: #e8eaf2; }

/* Hero */
.uprofile-hero {
  display: flex; flex-direction: column;
  align-items: center; gap: 0;
  margin-bottom: 24px;
}
.hero-avatar-wrap {
  position: relative; margin-bottom: 20px;
}
.hero-avatar {
  width: 120px; height: 120px; border-radius: 50%;
  background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid rgba(255,255,255,0.12);
  cursor: pointer;
  transition: border-color 0.2s;
}
.hero-avatar:hover { border-color: rgba(230,57,70,0.5); }
.hero-initials { font-size: 36px; font-weight: 700; color: #fff; }
.hero-photo-dots {
  display: flex; justify-content: center; gap: 5px;
  margin-top: 10px;
}
.hero-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.25); cursor: pointer;
  transition: all 0.15s;
}
.hero-dot.active { background: #e63946; transform: scale(1.3); }
.hero-arr {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.hero-arr--l { left: -14px; }
.hero-arr--r { right: -14px; }

.hero-info { text-align: center; width: 100%; }
.hero-name {
  font-family: 'Unbounded', sans-serif;
  font-size: 24px; color: #fff; margin: 0 0 8px;
}
.hero-role {
  display: inline-block;
  padding: 5px 16px; border-radius: 20px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.25);
  color: #f87171; font-size: 13px; font-weight: 600;
  margin-bottom: 12px;
}
.hero-meta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
.hero-meta-item { font-size: 13px; color: #8891b2; }

.hero-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.btn-friend {
  padding: 10px 22px; border-radius: 12px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Onest', sans-serif;
  transition: all 0.15s;
}
.btn-friend--add {
  background: rgba(230,57,70,0.15);
  border: 1px solid rgba(230,57,70,0.35);
  color: #f87171;
}
.btn-friend--add:hover { background: rgba(230,57,70,0.25); }
.btn-friend--sent, .btn-friend--added {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: #8891b2; cursor: default;
}
.btn-friend--incoming {
  background: rgba(5,150,105,0.15);
  border: 1px solid rgba(5,150,105,0.35);
  color: #34d399;
}
.btn-message {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 22px; border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #e8eaf2; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: 'Onest', sans-serif;
  transition: all 0.15s;
}
.btn-message:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
.btn-outline {
  padding: 10px 22px; border-radius: 12px;
  background: none; border: 1px solid rgba(255,255,255,0.12);
  color: #8891b2; font-size: 14px; cursor: pointer;
  transition: all 0.15s; margin-top: 12px;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.25); color: #e8eaf2; }

/* Cards */
.uprofile-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; padding: 20px 22px;
  margin-bottom: 14px;
}
.card-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #8891b2; margin-bottom: 12px;
}
.card-text { font-size: 14px; color: #c4c8d8; line-height: 1.7; margin: 0; }

/* Skills */
.skills-block { }
.skills-block-title {
  font-size: 12px; font-weight: 700; color: #8891b2;
  margin-bottom: 8px;
}
.skills-list { display: flex; flex-wrap: wrap; gap: 7px; }
.skill-tag {
  padding: 5px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
  border: 1px solid transparent;
}
.skill-tag--hard {
  background: rgba(59,130,246,0.1); color: #60a5fa;
  border-color: rgba(59,130,246,0.25);
}
.skill-tag--soft {
  background: rgba(168,85,247,0.1); color: #c084fc;
  border-color: rgba(168,85,247,0.25);
}

/* Gallery */
.gallery-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.gallery-thumb {
  aspect-ratio: 1; border-radius: 10px;
  background-size: cover; background-position: center;
  cursor: zoom-in; transition: opacity 0.15s;
}
.gallery-thumb:hover { opacity: 0.85; }

/* Links */
.links-list { display: flex; gap: 10px; flex-wrap: wrap; }
.link-item {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  color: #e8eaf2; font-size: 13px; text-decoration: none;
  transition: all 0.15s;
}
.link-item:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.08); }

/* Resume */
.resume-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.resume-icon-big { font-size: 28px; }
.resume-info { flex: 1; }
.resume-title { font-size: 14px; font-weight: 600; color: #e8eaf2; }
.resume-sub { font-size: 12px; color: #8891b2; margin-top: 2px; }
.resume-dl-btn, .resume-view-btn {
  padding: 8px 16px; border-radius: 10px;
  font-size: 12px; font-weight: 600; text-decoration: none;
  transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px;
}
.resume-dl-btn {
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa;
}
.resume-dl-btn:hover { background: rgba(59,130,246,0.22); }
.resume-view-btn {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8eaf2;
}
.resume-view-btn:hover { background: rgba(255,255,255,0.08); }

/* Rank badge */
.hero-name-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.rank-badge-hero {
  display: inline-flex; align-items: center; gap: 5px;
  background: linear-gradient(135deg, rgba(230,57,70,0.15), rgba(124,58,237,0.15));
  border: 1px solid rgba(230,57,70,0.3);
  border-radius: 20px; padding: 4px 12px;
  font-size: 12px; font-weight: 700; color: #e8eaf2;
  cursor: default;
}

/* Career Guidance */
.career-card { }
.career-hint { font-size: 13px; color: #8891b2; margin: 0 0 14px; line-height: 1.6; }
.career-btn {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(230,57,70,0.15));
  border: 1px solid rgba(124,58,237,0.3);
  color: #c084fc; font-size: 14px; font-weight: 700;
  font-family: 'Onest', sans-serif; cursor: pointer;
  transition: all 0.2s;
}
.career-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(230,57,70,0.25)); }
.career-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.career-result {
  margin-top: 16px; padding: 16px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  font-size: 13px; color: #c4c8d8; line-height: 1.75;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.88); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
}
.lightbox-img {
  max-width: 80vw; max-height: 80vh;
  border-radius: 16px; object-fit: contain;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}
.lb-close {
  position: fixed; top: 20px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 16px; cursor: pointer; z-index: 10;
  display: flex; align-items: center; justify-content: center;
}
.lb-arrow {
  position: fixed; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 28px; cursor: pointer; z-index: 10;
  display: flex; align-items: center; justify-content: center;
}
.lb-arrow--prev { left: 20px; }
.lb-arrow--next { right: 20px; }
.lb-counter {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.75);
  font-size: 13px; padding: 6px 16px; border-radius: 20px; z-index: 10;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
