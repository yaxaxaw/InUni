<template>
  <AppShell>
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="page-inner">
      <div class="page-header">
        <div>
          <div class="page-label">Личный кабинет</div>
          <h1 class="page-title">Мой профиль</h1>
          <p class="page-sub">Профиль внутри сети {{ universityName }} — направление, навыки и фото для знакомств.</p>
        </div>
        <div class="header-actions">
          <button v-if="!isEditing" class="btn-outline logout-btn" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Выйти
          </button>
          <button v-if="!isEditing" class="btn-primary" @click="startEditing">Редактировать профиль</button>
          <div v-else class="header-actions editing-actions">
            <button class="btn-outline" @click="cancelEditing">Отмена</button>
            <button class="btn-primary" @click="saveProfile">Сохранить</button>
          </div>
        </div>
      </div>

      <div class="profile-layout">
        <section class="profile-card hero-card">
          <div class="profile-header">
            <div class="avatar-block">
              <div class="profile-avatar" :class="{ 'profile-avatar--photo': !!displayPhoto }">
                <img v-if="displayPhoto" :src="displayPhoto" alt="Фото профиля" class="avatar-image" />
                <span v-else class="avatar-initials">{{ initials }}</span>
              </div>
              <label v-if="isEditing" class="avatar-upload-btn">
                <input
                    :key="photoInputKey"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="onProfilePhotoSelected"
                />
                {{ displayPhoto ? 'Сменить фото' : 'Загрузить фото' }}
              </label>
              <button
                  v-if="isEditing && displayPhoto"
                  type="button"
                  class="avatar-upload-btn avatar-upload-btn--ghost"
                  @click="openPhotoCropEditor"
              >
                Обрезать и повернуть
              </button>
              <button
                  v-else-if="!profile.profilePhoto"
                  type="button"
                  class="avatar-upload-btn avatar-upload-btn--ghost"
                  @click="startEditing"
              >
                Добавить фото
              </button>
              <button
                  v-else
                  type="button"
                  class="avatar-upload-btn avatar-upload-btn--ghost"
                  @click="startEditing"
              >
                Изменить фото
              </button>
              <button
                  v-if="isEditing && draftProfilePhoto"
                  type="button"
                  class="avatar-remove-btn"
                  @click="removeProfilePhoto"
              >
                Удалить
              </button>
            </div>
            <div class="profile-head-copy">
              <span class="university-pill">{{ universityName }}</span>
              <template v-if="isEditing">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Имя</label>
                    <input v-model="draftProfile.firstName" type="text" placeholder="Имя" />
                  </div>
                  <div class="form-group">
                    <label>Фамилия</label>
                    <input v-model="draftProfile.lastName" type="text" placeholder="Фамилия" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Роль / специализация</label>
                  <select v-model="draftProfile.role" class="role-select">
                    <option value="">Выберите роль</option>
                    <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                  </select>
                </div>
              </template>
              <template v-else>
                <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
                <p>{{ profile.role }}</p>
                <p class="education-line">{{ profile.education }}</p>
              </template>
            </div>

            <div class="hero-rank-block">
              <div class="hero-rank-top">
                <div class="hero-rank-emoji">{{ achievement.currentRank.emoji }}</div>
                <div class="hero-rank-info">
                  <div class="hero-rank-label">Ранг</div>
                  <div class="hero-rank-name">{{ achievement.currentRank.name }}</div>
                </div>
                <div class="hero-rank-count">{{ achievement.total }} участ.</div>
              </div>

              <div class="hero-rank-track">
                <div class="hero-rank-line-wrap">
                  <div class="hero-rank-line-bg"></div>
                  <div class="hero-rank-line-fill" :style="{ width: rankProgressPct + '%' }"></div>
                </div>
                <div class="hero-rank-steps">
                  <div v-for="r in achievement.ranks" :key="r.level"
                    class="hero-rank-step"
                    :class="{
                      'hero-rank-step--done': achievement.total >= r.minParticipations,
                      'hero-rank-step--current': r.level === achievement.currentRank.level
                    }"
                  >
                    <div class="hero-rank-step-dot"></div>
                    <span class="hero-rank-step-label">{{ r.name }}</span>
                  </div>
                </div>
              </div>

              <div class="hero-rank-hint" v-if="achievement.nextRank">→ ещё {{ achievement.toNext }} участ. до {{ achievement.nextRank.emoji }} {{ achievement.nextRank.name }}</div>
              <div class="hero-rank-hint hero-rank-hint--max" v-else>👑 Максимальный ранг!</div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-card">
              <span class="stat-label">Заявок и откликов</span>
              <span class="stat-value">{{ stats.applications }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">События / слоты</span>
              <span class="stat-value">{{ stats.events }} / {{ stats.slots }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Профиль заполнен</span>
              <span class="stat-value">{{ completion }}%</span>
            </div>
          </div>
        </section>

        <transition name="rank-up-anim">
          <div v-if="rankUpNotif" class="rank-up-notif" @click="rankUpNotif = false">
            <span class="rank-up-emoji">{{ achievement.currentRank.emoji }}</span>
            <div><div class="rank-up-title">Новый ранг!</div><div class="rank-up-sub">Ты стал {{ achievement.currentRank.name }}</div></div>
            <button class="rank-up-close">✕</button>
          </div>
        </transition>

        <div class="profile-two-cols">

          <div class="profile-col-l">
            <section class="profile-card">
              <div class="section-header">
                <div><div class="section-kicker">Основное</div><h3>О себе</h3></div>
              </div>
              <div v-if="isEditing" class="section-stack">
                <p class="internal-note">{{ universityTagline }}</p>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Направление</label>
                    <select v-model="draftProfile.direction">
                      <option disabled value="">Выберите направление</option>
                      <option v-for="dir in directionOptions" :key="dir" :value="dir">{{ dir }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Курс</label>
                    <select v-model="draftProfile.course">
                      <option disabled value="">Выберите курс</option>
                      <option v-for="course in courseOptions" :key="course" :value="course">{{ course }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Email</label>
                    <input v-model="draftProfile.email" type="email" />
                  </div>
                </div>
                <div class="form-group">
                  <label>О себе</label>
                  <textarea v-model="draftProfile.about" rows="4"></textarea>
                </div>
              </div>
              <div v-else class="section-stack">
                <p class="section-text">{{ profile.about }}</p>
                <div class="meta-row">
                  <span class="meta-chip"><AppIcon name="graduation" :size="14" />{{ profile.education }}</span>
                  <span class="meta-chip"><AppIcon name="chat" :size="14" />{{ profile.email }}</span>
                </div>
              </div>
            </section>

            <section class="profile-card">
              <div class="section-header">
                <div><div class="section-kicker">Фотографии</div><h3>Галерея</h3></div>
              </div>
              <div v-if="galleryPhotos.length > 0" :class="['gallery-grid', `gallery-grid--${Math.min(galleryPhotos.length, 3)}`]">
                <div v-for="(photo, idx) in galleryPhotos" :key="photo" class="gallery-thumb" @click="openLightbox(photo, idx)">
                  <img :src="photo" alt="" class="gallery-img" />
                  <button class="gallery-del-btn" @click.stop="deleteGalleryPhoto(photo)" title="Удалить">✕</button>
                </div>
              </div>
              <label class="gallery-add-zone">
                <input :key="galleryInputKey" type="file" accept="image/*" class="sr-only" @change="uploadGalleryPhoto" />
                <span v-if="galleryUploading" class="gallery-add-zone-inner">⏳ Загрузка...</span>
                <span v-else class="gallery-add-zone-inner">
                  <span class="gallery-add-plus">＋</span>
                  <span class="gallery-add-text">Добавить фото</span>
                </span>
              </label>
            </section>

            <section class="profile-card contacts-card">
              <div class="section-header">
                <div><div class="section-kicker">Контакты</div><h3>GitHub и LinkedIn</h3></div>
              </div>
              <div class="section-stack">
                <div v-if="isEditing" class="form-grid compact">
                  <div class="form-group"><label>GitHub</label><input v-model="draftProfile.github" type="url" placeholder="https://github.com/username" /></div>
                  <div class="form-group"><label>LinkedIn</label><input v-model="draftProfile.linkedin" type="url" placeholder="https://linkedin.com/in/username" /></div>
                </div>
                <div v-else class="links-row">
                  <a v-if="profile.github" class="link-chip" :href="profile.github" target="_blank" rel="noreferrer">
                    <span class="link-chip-icon">GH</span><span class="link-chip-text">{{ profile.githubHandle || profile.github }}</span>
                  </a>
                  <div v-else class="link-chip link-chip--empty"><span class="link-chip-icon">GH</span><span class="link-chip-text">GitHub не указан</span></div>
                  <a v-if="profile.linkedin" class="link-chip" :href="profile.linkedin" target="_blank" rel="noreferrer">
                    <span class="link-chip-icon">in</span><span class="link-chip-text">{{ profile.linkedinHandle || profile.linkedin }}</span>
                  </a>
                  <div v-else class="link-chip link-chip--empty"><span class="link-chip-icon">in</span><span class="link-chip-text">LinkedIn не указан</span></div>
                </div>
              </div>
            </section>
          </div>

          <div class="profile-col-r">
            <section class="profile-card">
              <div class="section-header">
                <div><div class="section-kicker">Навыки</div><h3>Навыки и интересы</h3></div>
              </div>
              <div v-if="isEditing" class="section-stack">
                <p class="skills-hint">Выбери навыки — они отобразятся в знакомствах и поиске команды.</p>
                <div class="skill-tabs">
                  <button type="button" class="skill-tab" :class="{ active: skillTab === 'hard' }" @click="skillTab = 'hard'">⚙️ Hard Skills</button>
                  <button type="button" class="skill-tab" :class="{ active: skillTab === 'soft' }" @click="skillTab = 'soft'">🧠 Soft Skills</button>
                </div>
                <div class="skill-groups">
                  <button v-for="g in (skillTab === 'hard' ? hardSkillGroups : softSkillGroups)" :key="g.id"
                    type="button" class="skill-group-btn"
                    :class="{ active: (skillTab === 'hard' ? skillGroup : softSkillGroup) === g.id }"
                    @click="skillTab === 'hard' ? skillGroup = g.id : softSkillGroup = g.id">
                    <span class="sg-icon">{{ g.icon }}</span><span class="sg-label">{{ g.label }}</span>
                  </button>
                </div>
                <div class="skills-grid">
                  <button v-for="skill in (skillTab === 'hard'
                      ? (hardSkillGroups.find(g => g.id === skillGroup) || hardSkillGroups[0]).skills
                      : (softSkillGroups.find(g => g.id === softSkillGroup) || softSkillGroups[0]).skills)"
                    :key="skill" type="button" class="skill-chip"
                    :class="{ selected: draftSkills.includes(skill) }"
                    @click="toggleSkill(skill)">{{ skill }}</button>
                </div>
                <p class="skills-count" :class="{ ok: draftSkills.length >= 3 }">Выбрано: {{ draftSkills.length }} (минимум 3)</p>
              </div>
              <div v-else>
                <div v-if="profile.interests.filter(s => hardSkills.includes(s)).length" class="skills-view-block">
                  <div class="skills-view-label">⚙️ Hard Skills</div>
                  <div class="tags-list">
                    <span v-for="s in profile.interests.filter(i => hardSkills.includes(i))" :key="s" class="interest-tag interest-tag--hard">{{ s }}</span>
                  </div>
                </div>
                <div v-if="profile.interests.filter(s => softSkills.includes(s)).length" class="skills-view-block" style="margin-top:12px">
                  <div class="skills-view-label">🧠 Soft Skills</div>
                  <div class="tags-list">
                    <span v-for="s in profile.interests.filter(i => softSkills.includes(i))" :key="s" class="interest-tag interest-tag--soft">{{ s }}</span>
                  </div>
                </div>
                <div v-if="!profile.interests.length" class="section-text">Навыки не указаны</div>
              </div>
            </section>

            <section class="profile-card ai-card">
              <div class="section-header ai-section-header">
                <div><div class="section-kicker ai-kicker">✨ AI-советник</div><h3>Рекомендации по профилю</h3></div>
              </div>
              <div v-if="aiError" class="ai-error">{{ aiError }}</div>
              <div v-if="!aiRecommendations.length && !aiLoading && !aiError" class="ai-empty">
                <p>AI проанализирует твой профиль и даст конкретные советы — как улучшить «О себе», какие навыки добавить, как лучше описать роль для хакатонов.</p>
              </div>
              <div v-if="aiRecommendations.length" class="ai-recs">
                <div v-for="(rec, i) in aiRecommendations" :key="i" class="ai-rec-item" :class="`ai-rec--${rec.type}`">
                  <span class="ai-rec-icon">{{ rec.icon }}</span>
                  <div class="ai-rec-body"><strong>{{ rec.title }}</strong><p>{{ rec.text }}</p></div>
                </div>
              </div>
              <div class="ai-generate-bio">
                <button class="btn-ai-ghost" :disabled="aiGeneratingBio" @click="generateBio">
                  <span v-if="aiGeneratingBio" class="ai-spinner ai-spinner--dark"></span>
                  {{ aiGeneratingBio ? 'Генерирую...' : '✨ Написать «О себе» с помощью AI' }}
                </button>
                <p class="ai-bio-hint">AI напишет текст на основе твоей роли, навыков и направления</p>
              </div>
            </section>

            <section class="profile-card resume-section">
              <div class="section-header">
                <div><div class="section-kicker">Резюме</div><h3>Резюме / CV</h3></div>
              </div>
              <div v-if="profile.resume" class="resume-uploaded">
                <div class="resume-file-card">
                  <div class="resume-file-icon">📄</div>
                  <div class="resume-file-info">
                    <div class="resume-file-name">Резюме загружено</div>
                    <div class="resume-file-type">PDF / DOC файл</div>
                  </div>
                  <div class="resume-file-actions">
                    <a :href="profile.resume" target="_blank" class="resume-action-btn resume-action-btn--view">👁 Открыть</a>
                    <a :href="profile.resume" target="_blank" download class="resume-action-btn resume-action-btn--download">⬇ Скачать</a>
                    <button class="resume-action-btn resume-action-btn--delete" @click="deleteResume">🗑 Удалить</button>
                  </div>
                </div>
                <label class="resume-replace-label">
                  <input type="file" accept=".pdf,.doc,.docx" @change="uploadResume" class="resume-input" />
                  <span v-if="resumeUploading">⏳ Загрузка...</span>
                  <span v-else>🔄 Заменить файл</span>
                </label>
              </div>
              <div v-else class="resume-dropzone">
                <label class="resume-dropzone-label">
                  <input type="file" accept=".pdf,.doc,.docx" @change="uploadResume" class="resume-input" />
                  <div class="resume-dropzone-icon"><span v-if="resumeUploading">⏳</span><span v-else>📎</span></div>
                  <div class="resume-dropzone-title"><span v-if="resumeUploading">Загрузка файла...</span><span v-else>Загрузить резюме</span></div>
                  <div class="resume-dropzone-hint">PDF, DOC или DOCX · до 10 МБ</div>
                </label>
              </div>
            </section>
          </div>

        </div>

        <section class="profile-card full-width-card">
          <div class="section-header">
            <div>
              <div class="section-kicker">Активность</div>
              <h3>Последние действия</h3>
            </div>
          </div>
          <div v-if="recentActivity.length" class="activity-list">
            <div v-for="item in recentActivity" :key="item.id" class="activity-item">
              <span class="activity-icon"><AppIcon :name="item.icon" :size="16" /></span>
              <div class="activity-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.subtitle }}</span>
              </div>
              <span class="activity-status">{{ item.status }}</span>
            </div>
          </div>
          <div v-else class="section-text">
            Пока нет активности. Заполни профиль и начни подавать заявки на хакатоны и проекты.
          </div>
        </section>
      </div>
    </div>
    <transition name="match-pop">
      <div v-if="lightboxPhoto" class="lb-overlay" @click.self="lightboxPhoto = null">
        <button class="lb-close" @click="lightboxPhoto = null">✕</button>
        <button v-if="galleryPhotos.length > 1" class="lb-arrow lb-arrow--prev" @click="lightboxPrev">‹</button>
        <img :src="lightboxPhoto" class="lb-img" @click.stop />
        <button v-if="galleryPhotos.length > 1" class="lb-arrow lb-arrow--next" @click="lightboxNext">›</button>
        <div class="lb-counter" v-if="galleryPhotos.length > 1">{{ lightboxIndex + 1 }} / {{ galleryPhotos.length }}</div>
      </div>
    </transition>
  </AppShell>

  <PhotoCropModal
      :visible="showPhotoCrop"
      :image-src="cropSourceImage"
      @cancel="closePhotoCrop"
      @apply="onPhotoCropApply"
  />

  <transition name="toast-fade">
    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </transition>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import AppShell from '../components/AppShell.vue'
import PhotoCropModal from '../components/PhotoCropModal.vue'
import { analyzeProfile as requestProfileAnalysis, generateProfileBio } from '../api/ai'
import { uploadProfilePhoto } from '../api/index.js'
import { createInitials, getHandle, patchAppState } from '../lib/appState'
import { useAuthStore } from '../stores/auth.js'
import {
  buildEducation,
  buildFullName,
  parseFullName,
  UNIVERSITY_NAME,
  UNIVERSITY_TAGLINE,
  DIRECTION_OPTIONS,
  COURSE_OPTIONS,
  ROLE_OPTIONS,
  SKILL_OPTIONS,
  HARD_SKILLS,
  SOFT_SKILLS,
  HARD_SKILL_GROUPS,
  SOFT_SKILL_GROUPS,
} from '../lib/universityProfile'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://backend-production-431c.up.railway.app' : 'http://localhost:8080')
function getPhotoUrl(photoPath) {
  if (!photoPath) return ''
  if (photoPath.startsWith('http')) return photoPath
  if (photoPath.startsWith('/uploads/')) return `${API_BASE_URL}${photoPath}`
  return photoPath
}

export default {
  name: 'ProfilePage',
  components: {
    AppIcon,
    AppShell,
    PhotoCropModal,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    const authProfile = this?.authStore?.profile || {}
    const authUser = this?.authStore?.user || {}
    
    const mergedProfile = {
      firstName: authProfile.first_name || '',
      lastName: authProfile.last_name || '',
      email: authUser.email || '',
      role: authProfile.role || '',
      direction: authProfile.direction || '',
      course: authProfile.course || '',
      about: authProfile.about || '',
      interests: authProfile.interests || [],
      profilePhoto: getPhotoUrl(authProfile.profile_photo),
      github: authProfile.github || '',
      linkedin: authProfile.linkedin || '',
    }
    
    const profile = {
      ...mergedProfile,
      githubHandle: getHandle(mergedProfile.github),
      linkedinHandle: getHandle(mergedProfile.linkedin),
    }
    return {
      profile: { ...profile, resume: authProfile.resume || null },
      draftProfile: { ...profile, interests: [...profile.interests] },
      draftProfilePhoto: profile.profilePhoto || '',
      galleryPhotos: (authProfile.photos || []).map(p => getPhotoUrl(p)),
      galleryUploading: false,
      resumeUploading: false,
      apiBase: API_BASE_URL,
      lightboxPhoto: null,
      lightboxIndex: 0,
      draftSkills: [...profile.interests],
      teamApplications: [],
      universityName: UNIVERSITY_NAME,
      universityTagline: UNIVERSITY_TAGLINE,
      directionOptions: DIRECTION_OPTIONS,
      courseOptions: COURSE_OPTIONS,
      roleOptions: ROLE_OPTIONS,
      skillOptions: SKILL_OPTIONS,
      hardSkills: HARD_SKILLS,
      softSkills: SOFT_SKILLS,
      hardSkillGroups: HARD_SKILL_GROUPS,
      softSkillGroups: SOFT_SKILL_GROUPS,
      skillTab: 'hard',
      skillGroup: 'it',
      softSkillGroup: 'personal',
      isEditing: false,
      showPhotoCrop: false,
      cropSourceImage: '',
      photoInputKey: 0,
      toastMessage: '',
      toastTimer: null,
      galleryInputKey: Date.now(),
      aiLoading: false,
      aiGeneratingBio: false,
      aiError: '',
      aiRecommendations: [],
      ANTHROPIC_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
      achievement: {
        total: 0, teamCount: 0, eventCount: 0,
        currentRank: { level: 1, name: 'Новичок', emoji: '🌱', minParticipations: 0 },
        nextRank: { level: 2, name: 'Искатель', emoji: '🔍', minParticipations: 2 },
        toNext: 2,
        ranks: [
          { level: 1, name: 'Новичок',    emoji: '🌱', minParticipations: 0 },
          { level: 2, name: 'Искатель',   emoji: '🔍', minParticipations: 2 },
          { level: 3, name: 'MVP-Мастер', emoji: '⭐', minParticipations: 4 },
          { level: 4, name: 'Ас',         emoji: '⚡', minParticipations: 6 },
          { level: 5, name: 'Завоеватель',emoji: '👑', minParticipations: 8 },
        ],
      },
      rankUpNotif: false,
    }
  },
  computed: {
    displayPhoto() {
      return this.isEditing ? this.draftProfilePhoto : this.profile.profilePhoto
    },
    initials() {
      return createInitials(this.profile.firstName, this.profile.lastName)
    },
    completion() {
      const fields = [
        this.profile.firstName,
        this.profile.lastName,
        this.profile.role,
        this.profile.direction,
        this.profile.course,
        this.profile.email,
        this.profile.about,
        this.profile.profilePhoto,
      ]
      const filled = fields.filter(Boolean).length + (this.profile.interests.length >= 3 ? 1 : 0)
      return Math.round((filled / 9) * 100)
    },
    stats() {
      const apps = this.teamApplications
      return {
        applications: apps.length,
        events: apps.filter((a) => a.kind === 'event').length,
        slots: apps.filter((a) => a.kind === 'slot').length,
      }
    },
    recentActivity() {
      return this.teamApplications.map((item) => ({
        id: item.id,
        icon: item.kind === 'event' ? 'trophy' : 'folder',
        title: item.title,
        subtitle: item.role || 'Участник',
        status: item.statusLabel,
      })).slice(0, 5)
    },
    rankProgressPct() {
      const ranks = this.achievement.ranks
      const cur = this.achievement.currentRank
      const next = this.achievement.nextRank
      if (!next) return 100
      const from = cur.minParticipations
      const to = next.minParticipations
      const done = this.achievement.total - from
      const need = to - from
      const maxParticipations = ranks[ranks.length - 1].minParticipations
      return Math.min(Math.round((this.achievement.total / maxParticipations) * 100), 100)
    },
  },
  async mounted() {
    await this.authStore.init()
    this.refreshProfileFromAuthStore()
    this.loadAchievement()
    try {
      const token = localStorage.getItem('accessToken')
      const userId = this.authStore.userId
      if (userId && token) {
        const res = await fetch(`${API_BASE_URL}/api/profiles/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.photos)) {
            this.galleryPhotos = data.photos.map(p => getPhotoUrl(p))
          }
          if (data.resume !== undefined) {
            this.profile = { ...this.profile, resume: data.resume || null }
          }
        }
      }
    } catch {}
  },
  watch: {
    'authStore.profile': {
      handler() {
        this.refreshProfileFromAuthStore()
      },
      deep: true
    }
  },
  methods: {
    async loadAchievement() {
      try {
        const token = localStorage.getItem('accessToken')
        const userId = this.authStore.userId
        if (!userId || !token) return
        const res = await fetch(`${API_BASE_URL}/api/achievements/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        this.achievement = { ...this.achievement, ...data }
        if (data.newRankUp) {
          this.rankUpNotif = true
          setTimeout(() => { this.rankUpNotif = false }, 5000)
        }
      } catch {}
    },
    async uploadGalleryPhoto(e) {
      const file = e.target.files[0]
      if (!file) return
      console.log('[Gallery] uploading:', file.name, file.type, file.size)
      this.galleryUploading = true
      try {
        const formData = new FormData()
        formData.append('photo', file)
        const token = localStorage.getItem('accessToken')
        const userId = this.authStore.userId
        console.log('[Gallery] userId:', userId, 'hasToken:', !!token)
        const res = await fetch(`${API_BASE_URL}/api/profiles/${userId}/photos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        console.log('[Gallery] response status:', res.status)
        const data = await res.json()
        console.log('[Gallery] response data:', data)
        if (!res.ok) {
          this.showToast(data.error || `Ошибка ${res.status}`)
          return
        }
        if (data.photos) {
          this.galleryPhotos = data.photos.map(p => getPhotoUrl(p))
          if (this.authStore.profile) {
            this.authStore.profile.photos = data.photos
          }
        }
        this.showToast('Фото добавлено ✓')
      } catch (err) {
        console.error('[Gallery] error:', err)
        this.showToast('Ошибка загрузки: ' + (err.message || ''))
      } finally {
        this.galleryUploading = false
        this.galleryInputKey = Date.now()
      }
    },
    async deleteGalleryPhoto(photoUrl) {
      try {
        const token = localStorage.getItem('accessToken')
        const userId = this.authStore.userId
        const rawUrl = photoUrl.replace(/^https?:\/\/[^/]+/, '')
        await fetch(`${API_BASE_URL}/api/profiles/${userId}/photos`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photoUrl: rawUrl })
        })
        this.galleryPhotos = this.galleryPhotos.filter(p => p !== photoUrl)
        if (this.lightboxPhoto === photoUrl) this.lightboxPhoto = null
        this.showToast('Фото удалено')
      } catch (e) {
        this.showToast('Ошибка удаления')
      }
    },
    async uploadResume(e) {
      const file = e.target.files[0]
      if (!file) return
      this.resumeUploading = true
      try {
        const token = localStorage.getItem('accessToken')
        const userId = this.authStore.userId
        const formData = new FormData()
        formData.append('resume', file)
        const res = await fetch(`${API_BASE_URL}/api/profiles/${userId}/resume`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        const data = await res.json()
        if (data.resumeUrl) { this.profile.resume = data.resumeUrl; this.showToast('Резюме загружено ✓') }
        else this.showToast(data.error || 'Ошибка')
      } catch { this.showToast('Ошибка загрузки') }
      finally { this.resumeUploading = false }
    },
    async deleteResume() {
      try {
        const token = localStorage.getItem('accessToken')
        const userId = this.authStore.userId
        await fetch(`${API_BASE_URL}/api/profiles/${userId}/resume`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        this.profile.resume = null
        this.showToast('Резюме удалено')
      } catch { this.showToast('Ошибка') }
    },
    openLightbox(url, idx) {
      this.lightboxPhoto = url
      this.lightboxIndex = idx
    },
    lightboxNext() {
      this.lightboxIndex = (this.lightboxIndex + 1) % this.galleryPhotos.length
      this.lightboxPhoto = this.galleryPhotos[this.lightboxIndex]
    },
    lightboxPrev() {
      this.lightboxIndex = (this.lightboxIndex - 1 + this.galleryPhotos.length) % this.galleryPhotos.length
      this.lightboxPhoto = this.galleryPhotos[this.lightboxIndex]
    },
    refreshProfileFromAuthStore() {
      const authProfile = this.authStore?.profile || {}
      const authUser = this.authStore?.user || {}
      
      if (authProfile.first_name !== undefined || authProfile.last_name !== undefined) {
        this.profile = {
          ...this.profile,
          firstName: authProfile.first_name || '',
          lastName: authProfile.last_name || '',
          email: authUser.email || '',
          role: authProfile.role || '',
          direction: authProfile.direction || '',
          course: authProfile.course || '',
          about: authProfile.about || '',
          interests: authProfile.interests || [],
          profilePhoto: getPhotoUrl(authProfile.profile_photo),
          github: authProfile.github || '',
          linkedin: authProfile.linkedin || '',
          githubHandle: getHandle(authProfile.github || ''),
          linkedinHandle: getHandle(authProfile.linkedin || ''),
          resume: authProfile.resume || this.profile.resume || null,
        }
        if (Array.isArray(authProfile.photos) && authProfile.photos.length > 0) {
          this.galleryPhotos = authProfile.photos.map(p => getPhotoUrl(p))
        }
        if (!this.isEditing) {
          this.draftProfile = { ...this.profile, interests: [...this.profile.interests] }
          this.draftProfilePhoto = this.profile.profilePhoto || ''
          this.draftSkills = [...this.profile.interests]
        }
      }
    },
    
    startEditing() {
      this.isEditing = true
      this.draftProfile = { ...this.profile, interests: [...this.profile.interests] }
      this.draftProfilePhoto = this.profile.profilePhoto || ''
      this.draftSkills = [...this.profile.interests]
    },
    cancelEditing() {
      this.isEditing = false
      this.draftProfile = { ...this.profile, interests: [...this.profile.interests] }
      this.draftProfilePhoto = this.profile.profilePhoto || ''
      this.draftSkills = [...this.profile.interests]
    },
    toggleSkill(skill) {
      const i = this.draftSkills.indexOf(skill)
      if (i >= 0) this.draftSkills.splice(i, 1)
      else this.draftSkills.push(skill)
    },
    onProfilePhotoSelected(event) {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        this.showToast('Выбери файл изображения')
        event.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.cropSourceImage = reader.result
        this.showPhotoCrop = true
      }
      reader.readAsDataURL(file)
      event.target.value = ''
      this.photoInputKey += 1
    },
    openPhotoCropEditor() {
      if (!this.draftProfilePhoto) return
      this.cropSourceImage = this.draftProfilePhoto
      this.showPhotoCrop = true
    },
    closePhotoCrop() {
      this.showPhotoCrop = false
      this.cropSourceImage = ''
    },
    async onPhotoCropApply(dataUrl) {
      this.closePhotoCrop()
      this.showToast('Загрузка фото...')
      
      try {
        const blob = this.dataURLtoBlob(dataUrl)
        
        const photoUrl = await this.uploadPhotoToStorage(blob)
        
        this.draftProfilePhoto = photoUrl
        this.showToast('Фото загружено ✓')
      } catch (err) {
        console.error('Photo upload error:', err)
        this.showToast('Ошибка загрузки фото')
        this.draftProfilePhoto = dataUrl
      }
    },
    
    dataURLtoBlob(dataURL) {
      const arr = dataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    
    async uploadPhotoToStorage(blob) {
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId
        if (!userId) throw new Error('Not authenticated')
        
        const file = new File([blob], 'profile_photo.jpg', { type: 'image/jpeg' })
        
        const result = await uploadProfilePhoto(userId, file)
        return result.photoUrl
      } catch (err) {
        console.error('Failed to upload photo to server:', err)
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      }
    },
    
    removeProfilePhoto() {
      this.draftProfilePhoto = ''
      this.closePhotoCrop()
    },
    async saveProfile() {
      const fullName = buildFullName(this.draftProfile.firstName, this.draftProfile.lastName)
      const education = buildEducation(this.draftProfile.direction, this.draftProfile.course)

      const profileUpdates = {
        first_name: this.draftProfile.firstName,
        last_name: this.draftProfile.lastName,
        role: this.draftProfile.role,
        direction: this.draftProfile.direction,
        course: this.draftProfile.course,
        education: education,
        about: this.draftProfile.about,
        interests: [...this.draftSkills],
        profile_photo: this.draftProfilePhoto,
        github: this.draftProfile.github || '',
        linkedin: this.draftProfile.linkedin || '',
      }
      
      console.log('Saving profile:', profileUpdates)
      
      const result = await this.authStore.updateProfile(profileUpdates)
      
      if (result.success) {
        const updatedProfile = {
          firstName: this.draftProfile.firstName,
          lastName: this.draftProfile.lastName,
          email: this.draftProfile.email,
          role: this.draftProfile.role,
          direction: this.draftProfile.direction,
          course: this.draftProfile.course,
          about: this.draftProfile.about,
          interests: [...this.draftSkills],
          profilePhoto: this.draftProfilePhoto,
          github: this.draftProfile.github || '',
          linkedin: this.draftProfile.linkedin || '',
        }
        
        console.log('Profile saved successfully:', updatedProfile)
        
        patchAppState({
          profile: {
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
            fullName: fullName,
            role: updatedProfile.role,
            direction: updatedProfile.direction,
            course: updatedProfile.course,
            education: education,
            email: updatedProfile.email,
            about: updatedProfile.about,
            interests: updatedProfile.interests,
            profilePhoto: updatedProfile.profilePhoto,
            github: updatedProfile.github,
            linkedin: updatedProfile.linkedin,
          },
        })
        
        this.profile = { ...updatedProfile, githubHandle: getHandle(updatedProfile.github), linkedinHandle: getHandle(updatedProfile.linkedin) }
        
        this.isEditing = false
        this.showToast('Профиль сохранён в облаке ✓')
      } else {
        this.showToast('Ошибка сохранения: ' + result.error)
      }
    },
    showToast(message) {
      this.toastMessage = message
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.toastMessage = ''
      }, 2400)
    },

    async handleLogout() {
      const result = await this.authStore.logout()
      if (result.success) {
        this.showToast('Вы вышли из аккаунта')
        setTimeout(() => {
          this.$router.push('/login')
        }, 1000)
      } else {
        this.showToast('Ошибка выхода: ' + result.error)
      }
    },

    async analyzeProfile() {
      this.aiLoading = true
      this.aiError = ''
      this.aiRecommendations = []
      const p = this.profile
      try {
        const profileSummary = `
Имя: ${p.firstName} ${p.lastName}
Роль: ${p.role || 'не указана'}
Направление: ${p.direction || 'не указано'}
Курс: ${p.course || 'не указан'}
О себе: ${p.about || 'не заполнено'}
Навыки: ${(p.interests || []).join(', ') || 'не выбраны'}
GitHub: ${p.github || 'не указан'}
LinkedIn: ${p.linkedin || 'не указан'}
Заполненность профиля: ${this.completion}%
        `.trim()

        const systemPrompt = `Ты — AI-советник платформы InUni для студентов IT-специальностей.
Анализируй профиль студента и давай конкретные, практичные рекомендации на русском языке.
Отвечай ТОЛЬКО валидным JSON-массивом без markdown, без пояснений вне JSON.
Формат каждого элемента: {"type": "tip|warning|success", "icon": "emoji", "title": "короткий заголовок", "text": "конкретный совет 1-2 предложения"}
Типы: "success" — что уже хорошо, "warning" — что срочно надо заполнить, "tip" — как улучшить.
Давай 4-5 рекомендаций включая описание сильных сторон, направление развития и конкретные шаги. Будь конкретным, не общим.`

        const raw = await this.callAI(systemPrompt, `Проанализируй профиль студента и дай рекомендации по развитию:
${profileSummary}`)
        
        if (!raw) {
          this.aiRecommendations = [
            { type: 'tip', icon: '💡', title: 'Добавь навыки', text: 'Укажи конкретные технологии которыми владеешь (React, Python, Figma и т.д.)' },
            { type: 'tip', icon: '📝', title: 'Заполни «О себе»', text: 'Расскажи о своих проектах и чем хочешь заниматься' },
          ]
          return
        }
        let suggestions = []
        try {
          const jsonMatch = raw.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            suggestions = JSON.parse(jsonMatch[0])
          } else {
            suggestions = [
              { type: 'success', icon: '🎯', title: 'Профиль активен', text: 'Твой профиль виден другим студентам для нетворкинга' },
              { type: 'tip', icon: '💡', title: 'Добавь навыки', text: 'Укажи конкретные технологии которыми владеешь (React, Python, Figma и т.д.)' },
              { type: 'tip', icon: '📝', title: 'Заполни «О себе»', text: 'Расскажи о своих проектах и чем хочешь заниматься' },
              { type: 'warning', icon: '🔗', title: 'Добавь ссылки', text: 'GitHub и LinkedIn помогут найти единомышленников' }
            ]
          }
        } catch (e) {
          suggestions = [
            { type: 'tip', icon: '🚀', title: 'Развивай навыки', text: 'Добавь больше технологий в раздел навыков для лучшего мэтчинга' }
          ]
        }
        
        this.aiRecommendations = Array.isArray(suggestions) ? suggestions : [suggestions]
      } catch (e) {
        this.aiError = 'Ошибка AI: ' + e.message
      } finally {
        this.aiLoading = false
      }
    },

    async generateBio() {
      this.aiGeneratingBio = true
      this.aiLoading = true
      this.aiError = ''
      const p = this.isEditing ? this.draftProfile : this.profile
      try {
        // 1. Генерируем текст "О себе" через AI
        const profileSummary = `
Имя: ${p.firstName} ${p.lastName}
Роль: ${p.role || 'не указана'}
Направление: ${p.direction || 'не указано'}
Курс: ${p.course || 'не указан'}
Навыки: ${(this.draftSkills || p.interests || []).join(', ') || 'не выбраны'}
Заполненность профиля: ${this.completion}%
        `.trim()

        const systemPrompt = `Ты — AI-советник платформы InUni для студентов. 
Создай краткий текст "О себе" (2-3 предложения) для профиля студента на основе данных.
Тон: профессиональный но дружелюбный. Упомяни роль, навыки и цели (хакатоны, стартапы).
Отвечай ТОЛЬКО текстом без markdown, без пояснений.`

        const userMessage = `Создай текст "О себе" для профиля студента:\n${profileSummary}`
        
        const bioText = await this.callAI(systemPrompt, userMessage)
        
        if (bioText === null) {
          this.aiError = 'AI недоступен: не настроен VITE_GROQ_API_KEY'
          return
        }
        if (bioText) {
          if (this.isEditing) {
            this.draftProfile.about = bioText.trim()
          } else {
            this.profile.about = bioText.trim()
            await this.saveProfile()
          }
        }

        // 2. Анализируем профиль и даем рекомендации
        await this.analyzeProfile()
        
        this.showToast('✨ Текст сгенерирован и рекомендации получены')
      } catch (e) {
        this.aiError = e.message
        this.showToast('Ошибка: ' + e.message)
      } finally {
        this.aiGeneratingBio = false
        this.aiLoading = false
      }
    },

    // ── AI API METHOD ──
    async callAI(systemPrompt, userMessage) {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: [{ role: 'system', content: systemPrompt }],
          userProfile: {},
        }),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.reply || ''
    },

  },
  async mounted() {
    if (this.authStore.user?.id) {
      try {
        const { getProfile } = await import('../api/index.js')
        const fresh = await getProfile(this.authStore.user.id)
        if (fresh) {
          this.authStore.profile = fresh
          const photoUrl = fresh.profile_photo
            ? (fresh.profile_photo.startsWith('http') ? fresh.profile_photo : `${API_BASE_URL}${fresh.profile_photo}`)
            : ''
          const updated = {
            firstName: fresh.first_name || '',
            lastName: fresh.last_name || '',
            email: this.authStore.user?.email || '',
            role: fresh.role || '',
            direction: fresh.direction || '',
            course: fresh.course || '',
            about: fresh.about || '',
            interests: fresh.interests || [],
            profilePhoto: photoUrl,
            github: fresh.github || '',
            linkedin: fresh.linkedin || '',
          }
          this.profile = { ...updated, githubHandle: updated.github, linkedinHandle: updated.linkedin }
          this.draftProfile = { ...updated, interests: [...updated.interests] }
          this.draftProfilePhoto = photoUrl
          this.draftSkills = [...updated.interests]
        }
      } catch (e) {}
    }
  },
  beforeUnmount() {
    if (this.toastTimer) clearTimeout(this.toastTimer)
  },
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Onest:wght@400;500;600;700&display=swap');

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
      linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #e63946;
  top: -100px;
  right: 0;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #1d4ed8;
  bottom: 100px;
  left: 100px;
}

.page-inner {
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 1180px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.page-label,
.section-kicker {
  font-family: 'Unbounded', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-red);
}

.page-label {
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: var(--c-white);
  margin: 0 0 6px;
}

.page-sub {
  font-size: 14px;
  color: var(--c-muted);
  margin: 0;
}

.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Две независимые колонки */
.profile-two-cols {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 20px;
  align-items: start;
}
.profile-col-l,
.profile-col-r {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.hero-card { /* hero всегда один */ }

.profile-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  justify-content: space-between;
}

/* Блок ранга в hero */
.hero-rank-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  width: 340px;
  flex-shrink: 0;
}
.hero-rank-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-rank-emoji { font-size: 28px; line-height: 1; flex-shrink: 0; }
.hero-rank-info { flex: 1; }
.hero-rank-count {
  font-size: 11px; font-weight: 700; color: #6b7280;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 3px 10px;
  flex-shrink: 0;
}
.hero-rank-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #e63946; margin-bottom: 2px;
}
.hero-rank-name {
  font-family: 'Unbounded', sans-serif;
  font-size: 15px; font-weight: 700; color: #e8eaf2;
}
.hero-rank-track {
  position: relative;
  padding-bottom: 4px;
}
.hero-rank-line-wrap {
  position: absolute;
  top: 9px;
  left: calc(100% / 10);
  right: calc(100% / 10);
  height: 3px;
  z-index: 0;
}
.hero-rank-line-bg {
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}
.hero-rank-line-fill {
  position: absolute; top: 0; left: 0; bottom: 0;
  background: #e63946;
  border-radius: 2px;
  transition: width 0.5s ease;
  max-width: 100%;
}
.hero-rank-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.hero-rank-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.hero-rank-step-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.2s;
  flex-shrink: 0;
}
.hero-rank-step--done .hero-rank-step-dot {
  background: #e63946;
  border-color: #e63946;
}
.hero-rank-step--current .hero-rank-step-dot {
  background: #e63946;
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(230,57,70,0.35);
  transform: scale(1.2);
}
.hero-rank-step-label {
  font-size: 10px; color: #6b7280; white-space: nowrap;
  transition: color 0.2s;
}
.hero-rank-step--done .hero-rank-step-label { color: #9ca3af; }
.hero-rank-step--current .hero-rank-step-label {
  color: #e63946; font-weight: 700;
}
.hero-rank-hint {
  font-size: 11px; color: #6b7280; text-align: center;
}
.hero-rank-hint--max { color: #f0bf00; }

/* avatar sizing — see .avatar-block .profile-avatar below */

.profile-head-copy {
  flex: 1;
}

.profile-head-copy h2,
.section-header h3 {
  font-family: 'Unbounded', sans-serif;
  color: var(--c-white);
  margin: 0;
}

.profile-head-copy h2 {
  font-size: 24px;
  margin-bottom: 6px;
}

.profile-head-copy p {
  font-size: 14px;
  color: var(--c-muted);
  margin: 0;
}

.profile-stats,
.links-grid,
.form-grid,
.meta-row {
  display: grid;
  gap: 12px;
}

.profile-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card,
.link-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--c-border);
  border-radius: 12px;
}

.stat-card {
  padding: 16px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--c-muted);
  margin-bottom: 8px;
}

.stat-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 22px;
  color: var(--c-white);
}

.section-header {
  margin-bottom: 16px;
}

.section-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-text {
  margin: 0;
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.7;
}

.section-note {
  margin: 0;
  font-size: 12px;
  color: var(--c-muted);
  line-height: 1.6;
}

.meta-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--c-border);
  font-size: 13px;
  color: var(--c-text);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-tag {
  font-size: 12px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(230, 57, 70, 0.1);
  color: #f87171;
  border: 1px solid rgba(230, 57, 70, 0.25);
}

.links-grid,
.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
}

.link-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(230, 57, 70, 0.12);
  border: 1px solid rgba(230, 57, 70, 0.18);
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.link-label,
.form-group label {
  display: block;
  font-size: 12px;
  color: var(--c-muted);
}

.link-value {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  color: var(--c-white);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.photo-slot {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.photo-slot.filled {
  border-style: solid;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-upload,
.photo-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: var(--c-muted);
}

.photo-upload {
  cursor: pointer;
}

.photo-upload input {
  display: none;
}

.photo-remove {
  position: absolute;
  right: 8px;
  bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(8, 12, 26, 0.75);
  color: var(--c-white);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 11px;
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  background: rgba(255, 255, 255, 0.03);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(230, 57, 70, 0.1);
}

.activity-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-copy strong {
  font-size: 14px;
  color: var(--c-white);
}

.activity-copy span,
.activity-status {
  font-size: 12px;
  color: var(--c-muted);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  outline: none;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: rgba(230, 57, 70, 0.4);
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  font-family: 'Onest', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  border: none;
  background: var(--c-red);
  color: #fff;
  padding: 10px 18px;
}

.btn-primary:hover {
  background: #c62d39;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-outline {
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--c-text);
  padding: 10px 18px;
}

.editing-actions {
  display: flex;
  gap: 10px;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(230, 57, 70, 0.4);
  background: rgba(230, 57, 70, 0.08);
  color: #f87171;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(230, 57, 70, 0.15);
  border-color: rgba(230, 57, 70, 0.6);
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #131a30;
  border: 1px solid rgba(230, 57, 70, 0.24);
  color: var(--c-white);
  padding: 14px 18px;
  border-radius: 12px;
  z-index: 220;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 980px) {
  .profile-layout,
  .links-grid,
  .form-grid,
  .meta-row {
    grid-template-columns: 1fr;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-inner {
    padding: 24px 18px 40px;
  }

  .page-header,
  .profile-header,
  .profile-stats {
    display: flex;
    flex-direction: column;
  }

  .photo-grid {
    grid-template-columns: 1fr;
  }
}


.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.profile-avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.profile-avatar--photo {
  border-color: rgba(230, 57, 70, 0.35);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.avatar-upload-btn,
.avatar-remove-btn {
  font-family: 'Onest', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 100px;
  padding: 8px 14px;
  border: none;
  transition: all 0.2s;
}

.avatar-upload-btn {
  background: var(--c-red);
  color: #fff;
}

.avatar-upload-btn:hover {
  background: #c62d39;
}

.avatar-upload-btn--ghost {
  background: rgba(255, 255, 255, 0.06);
  color: var(--c-text);
  border: 1px solid var(--c-border);
}

.avatar-remove-btn {
  background: transparent;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.university-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f87171;
  background: rgba(230, 57, 70, 0.12);
  border: 1px solid rgba(230, 57, 70, 0.28);
  border-radius: 100px;
  padding: 5px 12px;
  margin-bottom: 10px;
}

.education-line {
  font-size: 13px;
  color: var(--c-muted);
  margin-top: 4px;
}

.internal-note {
  font-size: 12px;
  color: var(--c-muted);
  margin: 0 0 4px;
  line-height: 1.5;
}

.name-grid {
  margin-top: 8px;
}

.skills-hint {
  font-size: 13px;
  color: var(--c-muted);
  margin: 0;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}
.skill-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.skill-group-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 14px;
  min-width: 80px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  color: #8891b2;
  font-family: 'Onest', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.skill-group-btn .sg-icon {
  font-size: 20px;
  line-height: 1;
}
.skill-group-btn .sg-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.skill-group-btn.active {
  background: rgba(99,102,241,0.14);
  border-color: rgba(99,102,241,0.45);
  color: #a5b4fc;
}
.skill-group-btn:hover:not(.active) {
  border-color: rgba(255,255,255,0.16);
  color: #e8eaf2;
  background: rgba(255,255,255,0.06);
}
.skill-tab {
  flex: 1;
  padding: 9px 0;
  border-radius: 10px;
  border: 1px solid var(--c-border);
  background: rgba(255,255,255,0.03);
  color: var(--c-muted);
  font-size: 13px;
  font-family: 'Onest', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.skill-tab.active {
  background: var(--c-red-dim);
  border-color: rgba(230,57,70,0.35);
  color: #f87171;
}
.skill-tab:hover:not(.active) {
  border-color: rgba(255,255,255,0.12);
  color: var(--c-text);
}
.skills-view-block { }
.skills-view-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}
.interest-tag--hard {
  background: rgba(59,130,246,0.1);
  color: #60a5fa;
  border-color: rgba(59,130,246,0.25);
}
.interest-tag--soft {
  background: rgba(168,85,247,0.1);
  color: #c084fc;
  border-color: rgba(168,85,247,0.25);
}

.skill-chip {
  font-family: 'Onest', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 100px;
  border: 1px solid var(--c-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--c-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.skill-chip:hover {
  color: var(--c-text);
  border-color: rgba(255, 255, 255, 0.15);
}

.skill-chip.selected {
  background: var(--c-red-dim);
  color: var(--c-red);
  border-color: rgba(230, 57, 70, 0.35);
}

.skills-count {
  font-size: 12px;
  color: var(--c-muted);
  margin: 0;
}

.skills-count.ok {
  color: #4ade80;
}

.profile-header {
  align-items: flex-start;
}

/* ── AI ADVISOR STYLES ── */
.ai-card {
  border-color: rgba(168, 85, 247, 0.25);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.04) 0%, var(--c-card) 60%);
}

.ai-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ai-kicker {
  color: #a855f7 !important;
}

.btn-ai {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-ai:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.22);
  border-color: rgba(168, 85, 247, 0.6);
}

.btn-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ai-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px dashed rgba(168, 85, 247, 0.35);
  background: transparent;
  color: #a78bfa;
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.btn-ai-ghost:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.08);
}

.btn-ai-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-top-color: #a855f7;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-empty p {
  font-size: 13px;
  color: var(--c-muted);
  margin: 0;
  line-height: 1.7;
}

.ai-error {
  font-size: 13px;
  color: #f87171;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.06);
}

.ai-recs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-rec-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  background: rgba(255,255,255,0.02);
  transition: background 0.15s;
}

.ai-rec--success {
  border-color: rgba(74, 222, 128, 0.2);
  background: rgba(74, 222, 128, 0.04);
}

.ai-rec--warning {
  border-color: rgba(251, 191, 36, 0.2);
  background: rgba(251, 191, 36, 0.04);
}

.ai-rec--tip {
  border-color: rgba(168, 85, 247, 0.2);
  background: rgba(168, 85, 247, 0.04);
}

.ai-rec-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.ai-rec-body {
  flex: 1;
}

.ai-rec-body strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-white);
  margin-bottom: 4px;
}

.ai-rec-body p {
  margin: 0;
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.6;
}

.ai-generate-bio {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.ai-bio-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--c-muted);
  text-align: center;
}

/* ── SKILL RADAR CHART ── */
.radar-card {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.05) 0%, rgba(124, 58, 237, 0.03) 100%);
  border-color: rgba(230, 57, 70, 0.15);
}

.radar-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--c-muted);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* Новая двухколоночная вёрстка */
.radar-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 20px 0;
  align-items: center;
}

.radar-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-canvas {
  width: 360px;
  height: 300px;
}

.radar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Процентные индикаторы навыков */
.skill-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-bar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.skill-bar-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}

.skill-bar-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-muted);
  min-width: 36px;
  text-align: right;
}

.skill-bar-value.high {
  color: #4ade80;
}

.skill-bar-value.medium {
  color: #fbbf24;
}

.skill-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}

.skill-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.6s ease;
  position: relative;
}

.skill-bar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Компактные метрики - одна строка */
.radar-metrics-row {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 4px;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--c-border);
  border-radius: 100px;
}

.metric-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-white);
}

.metric-label {
  font-size: 10px;
  color: var(--c-muted);
  text-transform: lowercase;
}

@media (max-width: 900px) {
  .radar-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .radar-canvas {
    width: 320px;
    height: 280px;
  }

  .radar-right {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .radar-metrics-row {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .radar-canvas {
    width: 280px;
    height: 240px;
  }

  .skill-bar-name {
    font-size: 12px;
  }

  .skill-bar-value {
    font-size: 11px;
  }

  .metric-pill {
    padding: 4px 10px;
  }

  .metric-value {
    font-size: 11px;
  }
}

/* Компактные контакты */
.contacts-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Resume section */
.resume-input { display: none; }

.resume-dropzone { margin-top: 4px; }
.resume-dropzone-label {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 7px; padding: 20px 20px; border-radius: 14px;
  border: 2px dashed rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.04);
  cursor: pointer; transition: all 0.2s; text-align: center;
}
.resume-dropzone-label:hover {
  border-color: rgba(99,102,241,0.6);
  background: rgba(99,102,241,0.09);
}
.resume-dropzone-icon { font-size: 24px; line-height: 1; }
.resume-dropzone-title {
  font-size: 15px; font-weight: 700; color: #e8eaf2;
}
.resume-dropzone-hint {
  font-size: 12px; color: #8891b2;
}

.resume-file-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; border-radius: 14px;
  background: rgba(59,130,246,0.07);
  border: 1px solid rgba(59,130,246,0.2);
  flex-wrap: wrap;
}
.resume-file-icon { font-size: 32px; flex-shrink: 0; }
.resume-file-info { flex: 1; min-width: 100px; }
.resume-file-name { font-size: 14px; font-weight: 700; color: #e8eaf2; }
.resume-file-type { font-size: 12px; color: #8891b2; margin-top: 2px; }
.resume-file-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.resume-action-btn {
  padding: 7px 14px; border-radius: 9px;
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: 'Onest', sans-serif; text-decoration: none;
  transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid transparent;
}
.resume-action-btn--view {
  background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: #e8eaf2;
}
.resume-action-btn--view:hover { background: rgba(255,255,255,0.11); }
.resume-action-btn--download {
  background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.3); color: #60a5fa;
}
.resume-action-btn--download:hover { background: rgba(59,130,246,0.22); }
.resume-action-btn--delete {
  background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.22); color: #f87171;
}
.resume-action-btn--delete:hover { background: rgba(239,68,68,0.18); }

.resume-replace-label {
  display: inline-flex; align-items: center; gap: 7px;
  margin-top: 12px; padding: 8px 18px; border-radius: 10px;
  border: 1px dashed rgba(255,255,255,0.15);
  color: #8891b2; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.resume-replace-label:hover { border-color: rgba(255,255,255,0.28); color: #e8eaf2; }

.links-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.link-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}

.link-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.link-chip-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(230, 57, 70, 0.15);
  color: #f87171;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}

.link-chip:nth-child(2) .link-chip-icon {
  background: rgba(29, 78, 216, 0.15);
  color: #60a5fa;
}

.link-chip-text {
  font-size: 13px;
  color: var(--c-text);
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-chip--empty {
  opacity: 0.5;
  cursor: default;
}

.link-chip--empty:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--c-border);
}

.link-chip--empty .link-chip-text {
  color: var(--c-muted);
  font-style: italic;
}

/* Двухколоночная вёрстка для Radar + Contacts+AI */
.profile-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .profile-columns { grid-template-columns: 1fr; }
  .profile-two-cols {
    grid-template-columns: 1fr;
  }
}

/* Слайдеры уровней навыков */
.skill-levels-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--c-border);
}

.skill-levels-hint {
  font-size: 12px;
  color: var(--c-muted);
  margin-bottom: 16px;
}

.skill-levels {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .skill-levels {
    grid-template-columns: 1fr;
  }
}

.skill-level-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--c-border);
  border-radius: 10px;
}

.skill-level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.skill-level-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}

.skill-level-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-white);
  min-width: 36px;
  text-align: right;
}

.skill-level-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.skill-level-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--slider-color, var(--c-red));
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s;
}

.skill-level-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.skill-level-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--slider-color, var(--c-red));
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.skill-level-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--c-muted);
  margin-top: 2px;
}

/* ===== RANK / ACHIEVEMENTS ===== */
.rank-card { overflow: visible; }
.rank-header { margin-bottom: 16px; }
.rank-title-row {
  display: flex; align-items: center; gap: 12px;
}
.rank-emoji { font-size: 32px; line-height: 1; }
.rank-name { margin: 0; font-size: 20px; }
.rank-count-badge {
  margin-left: auto;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px; padding: 4px 12px;
  font-size: 12px; font-weight: 700; color: #a0a8c8;
}

/* Track */
.rank-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding-bottom: 28px;
  margin-bottom: 8px;
}
.rank-track-line {
  position: absolute;
  bottom: 10px; left: 6%; right: 6%;
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  z-index: 0;
}
.rank-track-fill {
  height: 100%;
  background: linear-gradient(90deg, #e63946, #7c3aed);
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(.4,0,.2,1);
}
.rank-track-step {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; z-index: 1; flex: 1;
}
.rank-track-dot {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
}
.rank-track-step--done .rank-track-dot {
  background: rgba(230,57,70,0.18);
  border-color: rgba(230,57,70,0.5);
}
.rank-track-step--current .rank-track-dot {
  background: rgba(230,57,70,0.25);
  border-color: #e63946;
  box-shadow: 0 0 12px rgba(230,57,70,0.5);
  transform: scale(1.18);
}
.rank-track-emoji { font-size: 15px; line-height: 1; }
.rank-track-label {
  font-size: 9px; color: #6b7280; text-align: center;
  font-weight: 600; line-height: 1.2;
}
.rank-track-step--done .rank-track-label { color: #a0a8c8; }
.rank-track-step--current .rank-track-label { color: #e63946; }

.rank-hint {
  font-size: 12px; color: #6b7280; text-align: center;
  margin-top: 4px; margin-bottom: 12px;
}
.rank-hint--max { color: #f0bf00; }
.rank-detail-row {
  display: flex; gap: 16px; justify-content: center;
  margin-top: 4px;
}
.rank-detail-item { font-size: 12px; color: #8891b2; }
.rank-detail-item b { color: #e8eaf2; }

/* Rank-up уведомление */
.rank-up-notif {
  position: fixed; bottom: 24px; right: 24px; z-index: 999;
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(135deg, rgba(30,20,50,0.97), rgba(20,10,40,0.97));
  border: 1px solid rgba(230,57,70,0.4);
  border-radius: 16px; padding: 14px 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(230,57,70,0.2);
  cursor: pointer; min-width: 220px;
}
.rank-up-emoji { font-size: 36px; line-height: 1; }
.rank-up-title { font-size: 14px; font-weight: 700; color: #fff; }
.rank-up-sub { font-size: 12px; color: #a0a8c8; }
.rank-up-close {
  margin-left: auto; background: none; border: none;
  color: #6b7280; cursor: pointer; font-size: 14px;
}
.rank-up-anim-enter-active { animation: slideInUp 0.4s cubic-bezier(.4,0,.2,1); }
.rank-up-anim-leave-active { animation: slideInUp 0.3s reverse; }
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== GALLERY ===== */
.gallery-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 10px;
}
.gallery-grid--1 { grid-template-columns: repeat(1, 1fr); }
.gallery-grid--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-grid--3 { grid-template-columns: repeat(3, 1fr); }

.gallery-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
}
.gallery-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.gallery-thumb:hover .gallery-img { transform: scale(1.04); }
.gallery-del-btn {
  position: absolute; top: 5px; right: 5px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(220,30,30,0.82); border: none;
  color: #fff; font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
  z-index: 2;
}
.gallery-thumb:hover .gallery-del-btn { opacity: 1; }

/* Зона добавления — всегда видна */
.gallery-add-zone {
  display: flex; align-items: center;
  gap: 10px; padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px dashed rgba(255,255,255,0.13);
  cursor: pointer; transition: all 0.2s;
  background: rgba(255,255,255,0.02);
}
.gallery-add-zone:hover {
  border-color: rgba(230,57,70,0.4);
  background: rgba(230,57,70,0.05);
}
.gallery-add-zone-inner {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #8891b2;
  pointer-events: none;
}
.gallery-add-plus {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #e8eaf2; flex-shrink: 0;
}
.gallery-add-text { font-weight: 600; }

/* ===== LIGHTBOX ===== */
.lb-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.92); backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: center;
}
.lb-img {
  max-width: 88vw; max-height: 82vh;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7);
  object-fit: contain;
}
.lb-close {
  position: fixed; top: 20px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.lb-close:hover { background: rgba(255,255,255,0.2); }
.lb-arrow {
  position: fixed; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.lb-arrow:hover { background: rgba(255,255,255,0.2); }
.lb-arrow--prev { left: 20px; }
.lb-arrow--next { right: 20px; }
.lb-counter {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.7);
  font-size: 13px; padding: 6px 16px; border-radius: 20px;
}

</style>