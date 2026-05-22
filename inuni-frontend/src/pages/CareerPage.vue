<template>
  <AppShell>
    <div class="career-page">
      <div class="career-header">
        <div class="career-header-left">
          <h1 class="career-title">Карьера</h1>
          <p class="career-sub">AI подобрал стажировки и вакансии под твой профиль</p>
        </div>
        <div class="career-header-right">
          <div class="career-profile-tag">
            <span class="cpt-emoji">🎯</span>
            <div>
              <div class="cpt-label">Подбор для</div>
              <div class="cpt-value">{{ userRole || 'Не указана роль' }}</div>
            </div>
          </div>
          <button class="btn-refresh" :class="{ spinning: aiLoading }" @click="refreshJobs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            {{ aiLoading ? 'Обновляю...' : 'Обновить' }}
          </button>
        </div>
      </div>

      <div class="career-filters">
        <button
          v-for="f in filters"
          :key="f.id"
          class="filter-btn"
          :class="{ active: activeFilter === f.id }"
          @click="activeFilter = f.id"
        >{{ f.label }}</button>
        <div class="filter-sep"></div>
        <button
          v-for="t in types"
          :key="t.id"
          class="filter-btn filter-btn--type"
          :class="{ active: activeType === t.id }"
          @click="activeType = t.id"
        >{{ t.label }}</button>
      </div>

      <div v-if="aiLoading" class="career-loading">
        <div class="ai-pulse"></div>
        <div>
          <div class="career-loading-title">AI анализирует твой профиль...</div>
          <div class="career-loading-sub">Подбираю стажировки под {{ userRole }}</div>
        </div>
      </div>

      <div v-else class="jobs-grid">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="job-card"
          :class="{ 'job-card--top': job.matchScore >= 90 }"
          @click="openJob(job)"
        >
          <div class="job-match" :class="matchClass(job.matchScore)">
            <span class="job-match-pct">{{ job.matchScore }}%</span>
            <span class="job-match-label">совпадение</span>
          </div>

          <div class="job-card-top">
            <div class="job-company-logo" :style="{ background: job.color }">{{ job.logoLetter }}</div>
            <div class="job-meta">
              <div class="job-type-badge" :class="`job-type--${job.type}`">
                {{ job.type === 'internship' ? 'Стажировка' : job.type === 'junior' ? 'Junior' : 'Удалённо' }}
              </div>
              <div class="job-source">{{ job.source }}</div>
            </div>
          </div>

          <h3 class="job-title">{{ job.title }}</h3>
          <div class="job-company">{{ job.company }}</div>

          <div class="job-tags">
            <span v-for="tag in job.skills.slice(0,4)" :key="tag" class="job-tag" :class="{ 'job-tag--match': userSkills.includes(tag) }">{{ tag }}</span>
          </div>

          <div class="job-footer">
            <div class="job-salary" v-if="job.salary">{{ job.salary }}</div>
            <div class="job-salary job-salary--empty" v-else>Зарплата не указана</div>
            <div class="job-location">📍 {{ job.location }}</div>
          </div>

          <div class="job-ai-reason">
            <span class="ai-reason-icon">✨</span>
            <span>{{ job.aiReason }}</span>
          </div>

          <button class="btn-apply" @click.stop="openJob(job)">Откликнуться</button>
        </div>

        <div v-if="filteredJobs.length === 0" class="jobs-empty">
          <div class="jobs-empty-icon">🔍</div>
          <div class="jobs-empty-title">Ничего не найдено</div>
          <div class="jobs-empty-sub">Попробуй изменить фильтры или обновить список</div>
        </div>
      </div>

      
      <transition name="modal-fade">
        <div v-if="applyModal" class="modal-overlay" @click.self="applyModal = null">
          <div class="modal-box">
            <button class="modal-close" @click="applyModal = null">✕</button>

            <div class="modal-header">
              <div class="modal-company-logo" :style="{ background: applyModal.color }">{{ applyModal.logoLetter }}</div>
              <div>
                <h2 class="modal-title">{{ applyModal.title }}</h2>
                <div class="modal-company-name">{{ applyModal.company }}</div>
                <div class="modal-badges">
                  <span class="job-type-badge" :class="`job-type--${applyModal.type}`">
                    {{ applyModal.type === 'internship' ? 'Стажировка' : applyModal.type === 'junior' ? 'Junior' : 'Удалённо' }}
                  </span>
                  <span class="modal-match" :class="matchClass(applyModal.matchScore)">{{ applyModal.matchScore }}% совпадение</span>
                </div>
              </div>
            </div>

            <div class="modal-desc">
              <div class="modal-section-title">О вакансии</div>
              <p>{{ applyModal.description }}</p>
              <div class="modal-reqs">
                <div class="modal-section-title" style="margin-top:16px">Требования</div>
                <ul>
                  <li v-for="req in applyModal.requirements" :key="req">{{ req }}</li>
                </ul>
              </div>
            </div>

            <div class="modal-form">
              <div class="modal-section-title">Заполни заявку</div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Имя и фамилия *</label>
                  <input v-model="form.name" type="text" :placeholder="userFullName" />
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input v-model="form.email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div class="form-group">
                <label>Телефон</label>
                <input v-model="form.phone" type="tel" placeholder="+7 (700) 000-00-00" />
              </div>
              <div class="form-group">
                <label>Сопроводительное письмо</label>
                <textarea v-model="form.coverLetter" rows="4" :placeholder="`Расскажи почему ты подходишь на позицию ${applyModal.title}...`"></textarea>
                <button class="btn-ai-hint" @click="generateCoverLetter" :disabled="aiGenerating">
                  <span v-if="aiGenerating" class="ai-spin">⏳</span>
                  <span v-else>✨</span>
                  {{ aiGenerating ? 'Генерирую...' : 'Написать с AI' }}
                </button>
              </div>
              <div class="form-group">
                <label>Резюме</label>
                <div v-if="userResume" class="resume-attached">
                  <span>📄 Резюме из профиля прикреплено</span>
                  <a :href="userResume" target="_blank" class="resume-link">Посмотреть</a>
                </div>
                <label v-else class="resume-upload-zone">
                  <input type="file" accept=".pdf,.doc,.docx" class="sr-only" @change="onResumeUpload" />
                  <span>📎 Прикрепить резюме (PDF, DOC · до 10 МБ)</span>
                </label>
              </div>
              <div class="form-group">
                <label>Ссылка на GitHub / портфолио</label>
                <input v-model="form.portfolio" type="url" :placeholder="userGithub || 'https://github.com/username'" />
              </div>
              <div class="form-group">
                <label>Опыт работы</label>
                <select v-model="form.experience">
                  <option value="">Выберите</option>
                  <option value="no">Нет опыта</option>
                  <option value="less1">Менее 1 года</option>
                  <option value="1-3">1–3 года</option>
                  <option value="3+">Более 3 лет</option>
                </select>
              </div>

              <div v-if="submitSuccess" class="submit-success">
                ✅ Заявка отправлена! Работодатель свяжется с тобой.
              </div>
              <div v-if="submitError" class="submit-error">{{ submitError }}</div>

              <div class="modal-actions">
                <button class="btn-cancel" @click="applyModal = null">Отмена</button>
                <button class="btn-submit" :disabled="submitting || submitSuccess" @click="submitApplication">
                  <span v-if="submitting">⏳ Отправляю...</span>
                  <span v-else-if="submitSuccess">✅ Отправлено</span>
                  <span v-else>Откликнуться на {{ applyModal.company }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import { useAuthStore } from '../stores/auth.js'

const RANK_EMOJIS = ['🌱', '🔍', '⭐', '⚡', '👑']

const ALL_JOBS = [
  {
    id: 1, title: 'Frontend Developer Intern', company: 'Kolesa Group',
    source: 'hh.kz', type: 'internship', location: 'Бишкек / Алматы / Удалённо',
    salary: '150 000 – 200 000 ₸', color: '#e63946', logoLetter: 'K',
    skills: ['Vue', 'JavaScript', 'HTML/CSS', 'Git', 'React'],
    description: 'Kolesa Group ищет стажёра-фронтенд разработчика в команду Kolesa.kz. Ты будешь работать над реальными задачами продукта с первого дня.',
    requirements: ['Знание HTML, CSS, JavaScript', 'Базовый опыт с Vue или React', 'Понимание Git', 'Желание учиться и расти'],
    aiReason: 'Твои навыки Vue и JavaScript идеально совпадают с требованиями',
    matchScore: 95, roles: ['Frontend Developer', 'Fullstack Developer'],
    skills_match: ['Vue', 'JavaScript'],
  },
  {
    id: 2, title: 'Junior React Developer', company: 'Kaspi.kz',
    source: 'hh.kz', type: 'junior', location: 'Алматы / Бишкек',
    salary: '300 000 – 450 000 ₸', color: '#f59e0b', logoLetter: 'K',
    skills: ['React', 'TypeScript', 'Redux', 'REST API', 'Jest'],
    description: 'Kaspi.kz — крупнейший финтех-суперапп Казахстана. Ищем Junior React разработчика в команду мобильного банкинга.',
    requirements: ['React от 6 месяцев', 'TypeScript — базовый уровень', 'Понимание REST API', 'Умение работать в команде'],
    aiReason: 'Высокий спрос на React, твои навыки близки — хороший рост',
    matchScore: 82, roles: ['Frontend Developer', 'Fullstack Developer', 'Mobile Developer'],
    skills_match: ['React', 'TypeScript'],
  },
  {
    id: 3, title: 'iOS Developer Intern', company: 'Senim Mobile',
    source: 'hh.kz', type: 'internship', location: 'Бишкек / Удалённо',
    salary: '120 000 – 180 000 ₸', color: '#6366f1', logoLetter: 'S',
    skills: ['Swift', 'UIKit', 'SwiftUI', 'Xcode', 'Git'],
    description: 'Стажировка для iOS-разработчиков. Работа над мобильным приложением с аудиторией 2 млн пользователей.',
    requirements: ['Базовые знания Swift', 'Понимание UIKit или SwiftUI', 'Опыт Xcode'],
    aiReason: 'Mobile (iOS) входит в твои навыки — идеальное совпадение',
    matchScore: 91, roles: ['Mobile Developer', 'iOS Developer'],
    skills_match: ['Mobile (iOS)'],
  },
  {
    id: 4, title: 'Backend Python Intern', company: 'Jusan Bank',
    source: 'hh.kz', type: 'internship', location: 'Бишкек / Алматы',
    salary: '160 000 – 220 000 ₸', color: '#10b981', logoLetter: 'J',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API'],
    description: 'Jusan Bank ищет стажёра-бэкенд разработчика. Ты будешь участвовать в разработке банковских сервисов.',
    requirements: ['Python от 6 месяцев', 'Базовый SQL', 'Понимание REST API', 'Docker — желательно'],
    aiReason: 'Python и работа с базами данных близко к твоему стеку',
    matchScore: 74, roles: ['Backend Developer', 'Fullstack Developer', 'Data Scientist'],
    skills_match: ['Python', 'PostgreSQL'],
  },
  {
    id: 5, title: 'UI/UX Designer Intern', company: 'Choco.kz',
    source: 'hh.kz', type: 'internship', location: 'Бишкек / Алматы',
    salary: '100 000 – 150 000 ₸', color: '#ec4899', logoLetter: 'C',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    description: 'Choco Family ищет стажёра-дизайнера для работы над мобильными и веб-продуктами.',
    requirements: ['Figma — уверенный уровень', 'Понимание UX-принципов', 'Портфолио с 2-3 работами'],
    aiReason: 'Твой профиль дизайнера совпадает с требованиями',
    matchScore: 88, roles: ['UI/UX Designer', 'Product Designer'],
    skills_match: ['Figma'],
  },
  {
    id: 6, title: 'Data Science Intern', company: 'Beeline Kazakhstan',
    source: 'hh.kz', type: 'internship', location: 'Бишкек / Алматы / Удалённо',
    salary: '180 000 – 250 000 ₸', color: '#f59e0b', logoLetter: 'B',
    skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Machine Learning'],
    description: 'Beeline Kazakhstan открывает стажировку в команде Data Science. Анализ больших данных телеком-оператора.',
    requirements: ['Python + Pandas', 'SQL базовый уровень', 'Математическая статистика'],
    aiReason: 'Аналитика данных — перспективное направление для твоей специализации',
    matchScore: 70, roles: ['Data Scientist', 'ML Engineer', 'Backend Developer'],
    skills_match: ['Python'],
  },
  {
    id: 7, title: 'Full Stack Developer (Remote)', company: 'Arta Finance',
    source: 'hh.kz', type: 'remote', location: 'Бишкек / Удалённо',
    salary: '400 000 – 600 000 ₸', color: '#8b5cf6', logoLetter: 'A',
    skills: ['Node.js', 'Vue', 'PostgreSQL', 'Docker', 'TypeScript'],
    description: 'Финтех-стартап ищет Full Stack разработчика для удалённой работы. Гибкий график, интересные задачи.',
    requirements: ['Vue или React', 'Node.js + Express', 'PostgreSQL', 'Docker — базовый'],
    aiReason: 'Твой стек Vue + Node.js точно совпадает с требованиями',
    matchScore: 93, roles: ['Fullstack Developer', 'Backend Developer', 'Frontend Developer'],
    skills_match: ['Vue', 'Node.js'],
  },
  {
    id: 8, title: 'C++ Developer Intern', company: 'Space Systems',
    source: 'hh.kz', type: 'internship', location: 'Бишкек',
    salary: '140 000 – 190 000 ₸', color: '#0ea5e9', logoLetter: 'S',
    skills: ['C++', 'Embedded', 'Linux', 'Git', 'Algorithms'],
    description: 'Компания занимается разработкой встроенных систем. Ищем стажёра с опытом C++ и интересом к системному программированию.',
    requirements: ['C++ от 6 месяцев', 'Основы Linux', 'Алгоритмы и структуры данных'],
    aiReason: 'C++ и Embedded входят в твои hard skills',
    matchScore: 86, roles: ['Embedded Engineer', 'Backend Developer'],
    skills_match: ['C++', 'Embedded / IoT'],
  },
]

export default {
  name: 'CareerPage',
  components: { AppShell },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    return {
      aiLoading: false,
      activeFilter: 'all',
      activeType: 'all',
      applyModal: null,
      submitting: false,
      submitSuccess: false,
      submitError: '',
      aiGenerating: false,
      form: { name: '', email: '', phone: '', coverLetter: '', portfolio: '', experience: '' },
      uploadedResume: null,
      filters: [
        { id: 'all', label: '🎯 Все' },
        { id: 'top', label: '🔥 Топ совпадения' },
        { id: 'new', label: '✨ Новые' },
      ],
      types: [
        { id: 'all', label: 'Все типы' },
        { id: 'internship', label: 'Стажировка' },
        { id: 'junior', label: 'Junior' },
        { id: 'remote', label: 'Удалённо' },
      ],
    }
  },
  computed: {
    userProfile() {
      return this.authStore?.profile || {}
    },
    userRole() {
      return this.userProfile.role || ''
    },
    userFullName() {
      const u = this.userProfile
      return [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Твоё имя'
    },
    userSkills() {
      return this.userProfile.interests || []
    },
    userResume() {
      return this.userProfile.resume || null
    },
    userGithub() {
      return this.userProfile.github || ''
    },
    scoredJobs() {
      return ALL_JOBS.map(job => {
        let score = job.matchScore
        if (job.roles.includes(this.userRole)) score = Math.min(99, score + 5)
        const skillMatches = job.skills.filter(s => this.userSkills.includes(s)).length
        score = Math.min(99, score + skillMatches * 3)
        if (!this.userRole) score = Math.max(40, score - 20)
        return { ...job, matchScore: score }
      }).sort((a, b) => b.matchScore - a.matchScore)
    },
    filteredJobs() {
      let jobs = this.scoredJobs
      if (this.activeFilter === 'top') jobs = jobs.filter(j => j.matchScore >= 85)
      if (this.activeType !== 'all') jobs = jobs.filter(j => j.type === this.activeType)
      return jobs
    },
  },
  async mounted() {
    if (!this.authStore.initialized) {
      await this.authStore.initialize()
    }
    this.prefillForm()
  },
  methods: {
    prefillForm() {
      const u = this.userProfile
      this.form.name = this.userFullName !== 'Твоё имя' ? this.userFullName : ''
      this.form.email = u.email || ''
      this.form.portfolio = u.github || ''
    },
    matchClass(score) {
      if (score >= 90) return 'match--high'
      if (score >= 75) return 'match--mid'
      return 'match--low'
    },
    openJob(job) {
      this.applyModal = job
      this.submitSuccess = false
      this.submitError = ''
      this.prefillForm()
    },
    async refreshJobs() {
      this.aiLoading = true
      await new Promise(r => setTimeout(r, 1800))
      this.aiLoading = false
    },
    async generateCoverLetter() {
      if (!this.applyModal) return
      this.aiGenerating = true
      await new Promise(r => setTimeout(r, 1500))
      const role = this.userRole || 'разработчик'
      const company = this.applyModal.company
      const position = this.applyModal.title
      const skills = this.userSkills.slice(0, 4).join(', ') || 'программирование'
      this.form.coverLetter = `Здравствуйте!\n\nМеня зовут ${this.form.name || 'я'}, я ${role} с опытом в ${skills}.\n\nМеня очень заинтересовала позиция «${position}» в ${company}. Я уверен, что мои навыки и желание развиваться сделают меня ценным членом вашей команды.\n\nГотов приступить к работе и вносить реальный вклад с первых дней. Буду рад обсудить детали на собеседовании.\n\nС уважением,\n${this.form.name || 'Соискатель'}`
      this.aiGenerating = false
    },
    onResumeUpload(e) {
      const file = e.target.files[0]
      if (file) this.uploadedResume = file.name
    },
    async submitApplication() {
      if (!this.form.name || !this.form.email) {
        this.submitError = 'Заполни имя и email'
        return
      }
      this.submitError = ''
      this.submitting = true
      await new Promise(r => setTimeout(r, 1800))
      this.submitting = false
      this.submitSuccess = true
      setTimeout(() => {
        this.applyModal = null
        this.submitSuccess = false
      }, 3000)
    },
  },
}
</script>

<style scoped>
.career-page {
  --c-bg: #080c1a;
  --c-card: #131a30;
  --c-border: rgba(255,255,255,0.07);
  --c-text: #e8eaf2;
  --c-muted: #8891b2;
  --c-red: #e63946;
  padding: 32px 36px;
  max-width: 1200px;
  min-height: 100vh;
  color: var(--c-text);
  font-family: 'Inter', sans-serif;
}

/* HEADER */
.career-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 20px;
  flex-wrap: wrap;
}
.career-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--c-text);
  margin: 0 0 4px;
}
.career-sub { font-size: 14px; color: var(--c-muted); margin: 0; }
.career-header-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

.career-profile-tag {
  display: flex; align-items: center; gap: 10px;
  background: rgba(230,57,70,0.1);
  border: 1px solid rgba(230,57,70,0.25);
  border-radius: 12px; padding: 10px 16px;
}
.cpt-emoji { font-size: 20px; }
.cpt-label { font-size: 10px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.cpt-value { font-size: 13px; font-weight: 700; color: var(--c-text); }

.btn-refresh {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 10px 18px;
  color: var(--c-text); font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.btn-refresh:hover { background: rgba(255,255,255,0.1); }
.btn-refresh.spinning svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* FILTERS */
.career-filters {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap; margin-bottom: 28px;
}
.filter-sep { width: 1px; height: 24px; background: var(--c-border); margin: 0 4px; }
.filter-btn {
  padding: 7px 16px; border-radius: 20px;
  border: 1px solid var(--c-border);
  background: transparent; color: var(--c-muted);
  font-size: 13px; cursor: pointer; transition: all 0.18s;
}
.filter-btn:hover { border-color: rgba(255,255,255,0.2); color: var(--c-text); }
.filter-btn.active {
  background: rgba(230,57,70,0.15);
  border-color: rgba(230,57,70,0.45);
  color: #e63946; font-weight: 600;
}
.filter-btn--type.active {
  background: rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.45);
  color: #818cf8;
}

/* LOADING */
.career-loading {
  display: flex; align-items: center; gap: 20px;
  background: var(--c-card); border: 1px solid var(--c-border);
  border-radius: 16px; padding: 32px; margin-bottom: 24px;
}
.ai-pulse {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(230,57,70,0.2);
  animation: pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse { 0%,100% { transform: scale(1); opacity:0.6; } 50% { transform: scale(1.2); opacity:1; } }
.career-loading-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.career-loading-sub { font-size: 13px; color: var(--c-muted); }

/* JOBS GRID */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.job-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 16px; padding: 22px;
  cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; gap: 14px;
  position: relative; overflow: hidden;
}
.job-card:hover {
  border-color: rgba(230,57,70,0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
}
.job-card--top {
  border-color: rgba(230,57,70,0.2);
  background: linear-gradient(135deg, #131a30 0%, rgba(230,57,70,0.04) 100%);
}
.job-card--top::before {
  content: '🔥 Топ';
  position: absolute; top: 12px; left: 12px;
  font-size: 10px; font-weight: 700; color: #e63946;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.3);
  border-radius: 20px; padding: 2px 8px; letter-spacing: 0.05em;
}

.job-match {
  display: flex; align-items: baseline; gap: 4px;
  align-self: flex-end; margin-top: -8px;
}
.job-match-pct { font-size: 22px; font-weight: 800; }
.job-match-label { font-size: 11px; color: var(--c-muted); }
.match--high .job-match-pct { color: #4ade80; }
.match--mid .job-match-pct { color: #fbbf24; }
.match--low .job-match-pct { color: var(--c-muted); }

.job-card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.job-company-logo {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; color: #fff; flex-shrink: 0;
}
.job-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.job-type-badge {
  font-size: 11px; font-weight: 700; border-radius: 20px;
  padding: 3px 10px; letter-spacing: 0.04em;
}
.job-type--internship { background: rgba(99,102,241,0.15); color: #818cf8; }
.job-type--junior { background: rgba(16,185,129,0.12); color: #34d399; }
.job-type--remote { background: rgba(245,158,11,0.12); color: #fbbf24; }
.job-source { font-size: 10px; color: var(--c-muted); }

.job-title { font-size: 17px; font-weight: 700; color: var(--c-text); margin: 0; line-height: 1.3; }
.job-company { font-size: 13px; color: var(--c-muted); margin-top: -8px; }

.job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.job-tag {
  font-size: 11px; padding: 3px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--c-muted);
}
.job-tag--match {
  background: rgba(230,57,70,0.12);
  border-color: rgba(230,57,70,0.3);
  color: #e63946; font-weight: 600;
}

.job-footer { display: flex; justify-content: space-between; align-items: center; }
.job-salary { font-size: 13px; font-weight: 700; color: #4ade80; }
.job-salary--empty { color: var(--c-muted); font-weight: 400; }
.job-location { font-size: 12px; color: var(--c-muted); }

.job-ai-reason {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(230,57,70,0.06);
  border: 1px solid rgba(230,57,70,0.15);
  border-radius: 10px; padding: 10px 12px;
  font-size: 12px; color: #c4a4ff; line-height: 1.4;
}
.ai-reason-icon { flex-shrink: 0; font-size: 13px; }

.btn-apply {
  width: 100%; padding: 11px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.35);
  border-radius: 10px; color: #e63946;
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.2s; margin-top: auto;
}
.btn-apply:hover { background: rgba(230,57,70,0.2); }

/* EMPTY */
.jobs-empty {
  grid-column: 1/-1; text-align: center; padding: 80px 20px;
  color: var(--c-muted);
}
.jobs-empty-icon { font-size: 48px; margin-bottom: 16px; }
.jobs-empty-title { font-size: 20px; font-weight: 700; color: var(--c-text); margin-bottom: 8px; }
.jobs-empty-sub { font-size: 14px; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #131a30;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 32px;
  max-width: 680px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
}
.modal-close {
  position: absolute; top: 18px; right: 18px;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 8px;
  width: 32px; height: 32px; cursor: pointer;
  color: var(--c-muted); font-size: 14px;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.15); color: var(--c-text); }

.modal-header { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 24px; }
.modal-company-logo {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 22px; color: #fff; flex-shrink: 0;
}
.modal-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px; font-weight: 700; margin: 0 0 4px;
}
.modal-company-name { font-size: 14px; color: var(--c-muted); margin-bottom: 10px; }
.modal-badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.modal-match { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.modal-match.match--high { background: rgba(74,222,128,0.12); color: #4ade80; }
.modal-match.match--mid { background: rgba(251,191,36,0.12); color: #fbbf24; }
.modal-match.match--low { background: rgba(255,255,255,0.05); color: var(--c-muted); }

.modal-desc { margin-bottom: 24px; }
.modal-section-title {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #e63946; margin-bottom: 10px;
}
.modal-desc p { font-size: 14px; color: var(--c-muted); line-height: 1.6; margin: 0; }
.modal-reqs ul { margin: 0; padding-left: 18px; }
.modal-reqs li { font-size: 13px; color: var(--c-muted); margin-bottom: 6px; line-height: 1.5; }

.modal-form { border-top: 1px solid var(--c-border); padding-top: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--c-muted); }
.form-group input,
.form-group select,
.form-group textarea {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 10px 14px;
  color: var(--c-text); font-size: 13px;
  outline: none; transition: border-color 0.2s;
  font-family: inherit;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: rgba(230,57,70,0.5); }
.form-group textarea { resize: vertical; min-height: 100px; }
.form-group select option { background: #1a2240; }

.btn-ai-hint {
  margin-top: 8px; padding: 8px 16px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 8px; color: #818cf8;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.btn-ai-hint:hover { background: rgba(99,102,241,0.2); }
.btn-ai-hint:disabled { opacity: 0.6; cursor: not-allowed; }

.resume-attached {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  border-radius: 10px; padding: 12px 16px;
  font-size: 13px; color: #4ade80;
}
.resume-link { font-size: 12px; color: var(--c-muted); text-decoration: underline; }

.resume-upload-zone {
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.03);
  border: 1.5px dashed rgba(255,255,255,0.12);
  border-radius: 10px; padding: 18px;
  color: var(--c-muted); font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.resume-upload-zone:hover { border-color: rgba(230,57,70,0.4); color: var(--c-text); }

.submit-success {
  background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
  border-radius: 10px; padding: 14px 16px;
  color: #4ade80; font-size: 14px; font-weight: 600; margin-bottom: 16px;
}
.submit-error {
  background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.25);
  border-radius: 10px; padding: 12px 16px;
  color: #e63946; font-size: 13px; margin-bottom: 12px;
}

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
.btn-cancel {
  padding: 11px 24px; border-radius: 10px;
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  color: var(--c-muted); font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { border-color: rgba(255,255,255,0.25); color: var(--c-text); }
.btn-submit {
  padding: 11px 28px; border-radius: 10px;
  background: #e63946; border: none;
  color: #fff; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { background: #c1121f; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

/* TRANSITIONS */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .career-page { padding: 20px 16px; }
  .jobs-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .career-header { flex-direction: column; }
  .modal-box { padding: 20px; }
}
</style>
