<template>
  <AppShell>
    <div class="events-page">
      <div class="page-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="page-content">
        
        <div class="page-header">
          <span class="section-label">МЕРОПРИЯТИЯ</span>
          <h1 class="page-title">Все события КБТУ</h1>
          <p class="page-subtitle">Хакатоны, воркшопы, лекции и митапы для студентов</p>
        </div>

        
        <div class="filters-bar">
          <div class="filter-group">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              :class="['filter-btn', { active: activeFilter === filter.value }]"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Загрузка мероприятий...</span>
        </div>

        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <AppIcon name="calendar" :size="48" />
          <h3>Пока нет мероприятий</h3>
          <p>Следите за обновлениями — скоро добавим новые события!</p>
        </div>

        <div v-else class="events-grid">
          <div 
            v-for="event in filteredEvents" 
            :key="event.id"
            class="event-card"
            @click="openEventModal(event)"
          >
            <div class="event-image" :style="getEventImageStyle(event)">
              <div class="event-badge" :class="event.status">
                {{ getStatusLabel(event.status) }}
              </div>
              <div class="event-format">
                <AppIcon :name="event.format === 'online' ? 'video' : 'map-pin'" :size="14" />
                {{ event.format === 'online' ? 'Онлайн' : 'Офлайн' }}
              </div>
            </div>
            
            <div class="event-content">
              <div class="event-meta">
                <span class="event-date">
                  <AppIcon name="calendar" :size="14" />
                  {{ formatDate(event.start_date) }}
                </span>
                <span class="event-location" v-if="event.location">
                  <AppIcon name="map-pin" :size="14" />
                  {{ event.location }}
                </span>
              </div>
              
              <h3 class="event-title">{{ event.title }}</h3>
              <p class="event-description">{{ truncateText(event.description, 120) }}</p>
              
              <div class="event-footer">
                <div class="event-prize" v-if="event.prize_fund">
                  <AppIcon name="trophy" :size="14" />
                  {{ event.prize_fund }}
                </div>
                <div class="event-teams" v-if="event.max_teams">
                  <AppIcon name="users" :size="14" />
                  {{ event.max_teams }} команд
                </div>
              </div>

              <div class="event-tech" v-if="event.technologies?.length">
                <span 
                  v-for="tech in event.technologies.slice(0, 3)" 
                  :key="tech"
                  class="tech-tag"
                >
                  {{ tech }}
                </span>
                <span v-if="event.technologies.length > 3" class="tech-more">
                  +{{ event.technologies.length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="selectedEvent" class="modal-overlay" @click.self="closeEventModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeEventModal">
          <AppIcon name="x" :size="24" />
        </button>
        
        <div class="modal-image" :style="getEventImageStyle(selectedEvent)">
          <div class="modal-badge" :class="selectedEvent.status">
            {{ getStatusLabel(selectedEvent.status) }}
          </div>
        </div>
        
        <div class="modal-body">
          <h2 class="modal-title">{{ selectedEvent.title }}</h2>
          
          <div class="modal-meta">
            <div class="meta-item">
              <AppIcon name="calendar" :size="18" />
              <div>
                <span class="meta-label">Дата</span>
                <span class="meta-value">{{ formatDateRange(selectedEvent.start_date, selectedEvent.end_date) }}</span>
              </div>
            </div>
            <div class="meta-item">
              <AppIcon name="map-pin" :size="18" />
              <div>
                <span class="meta-label">Формат</span>
                <span class="meta-value">{{ selectedEvent.format === 'online' ? 'Онлайн' : selectedEvent.location || 'КБТУ' }}</span>
              </div>
            </div>
            <div class="meta-item" v-if="selectedEvent.prize_fund">
              <AppIcon name="trophy" :size="18" />
              <div>
                <span class="meta-label">Призовой фонд</span>
                <span class="meta-value">{{ selectedEvent.prize_fund }}</span>
              </div>
            </div>
            <div class="meta-item" v-if="selectedEvent.team_size">
              <AppIcon name="users" :size="18" />
              <div>
                <span class="meta-label">Размер команды</span>
                <span class="meta-value">{{ selectedEvent.team_size }} человек</span>
              </div>
            </div>
          </div>

          <div class="modal-section" v-if="selectedEvent.full_description">
            <h3>О мероприятии</h3>
            <p>{{ selectedEvent.full_description }}</p>
          </div>
          <div class="modal-section" v-else-if="selectedEvent.description">
            <h3>О мероприятии</h3>
            <p>{{ selectedEvent.description }}</p>
          </div>

          <div class="modal-section" v-if="selectedEvent.requirements">
            <h3>Требования</h3>
            <p>{{ selectedEvent.requirements }}</p>
          </div>

          <div class="modal-section" v-if="selectedEvent.technologies?.length">
            <h3>Технологии</h3>
            <div class="tech-list">
              <span 
                v-for="tech in selectedEvent.technologies" 
                :key="tech"
                class="tech-tag large"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <div class="modal-section" v-if="selectedEvent.organizer_name">
            <h3>Организатор</h3>
            <p>{{ selectedEvent.organizer_name }}</p>
            <p v-if="selectedEvent.organizer_contact" class="contact-info">
              {{ selectedEvent.organizer_contact }}
            </p>
          </div>

          
          <div v-if="isRegistered(selectedEvent.id)" class="reg-success-block">
            <div class="reg-success-icon">
              <AppIcon name="check-circle" :size="28" />
            </div>
            <div>
              <div class="reg-success-title">Вы уже зарегистрированы!</div>
              <div class="reg-success-sub">Ваша заявка отправлена организаторам мероприятия</div>
            </div>
          </div>

          
          <div v-else-if="showRegForm" class="reg-form">
            <h3 class="reg-form-title">Регистрация на мероприятие</h3>

            <div v-if="regSuccess" class="reg-success-block">
              <div class="reg-success-icon"><AppIcon name="check-circle" :size="28" /></div>
              <div>
                <div class="reg-success-title">Заявка отправлена!</div>
                <div class="reg-success-sub">Ждите ответа от организаторов</div>
              </div>
            </div>

            <template v-else>

              <template v-if="selectedEvent.requires_team !== false">
                <div class="form-group">
                  <label>Название команды *</label>
                  <input v-model="regForm.team_name" type="text" placeholder="Например: KBTU Stars" required />
                </div>
                <div class="form-group">
                  <label>Количество участников</label>
                  <input v-model="regForm.team_size" type="number" min="1" max="10" placeholder="3" />
                </div>
                <div class="form-group">
                  <label>Контакт лидера *</label>
                  <input v-model="regForm.contact" type="text" placeholder="Telegram: @username или email" required />
                </div>
                <div class="form-group">
                  <label>О команде и идеях</label>
                  <textarea v-model="regForm.message" rows="3" placeholder="Расскажите о вашей команде, стеке и идеях..."></textarea>
                </div>
              </template>

              <template v-else>
                <div class="form-group">
                  <label>Имя и фамилия *</label>
                  <input v-model="regForm.full_name" type="text" placeholder="Например: Али Иванов" required />
                </div>
                <div class="form-group">
                  <label>Направление / факультет</label>
                  <input v-model="regForm.direction" type="text" placeholder="Например: Информатика" />
                </div>
                <div class="form-group">
                  <label>Курс</label>
                  <input v-model="regForm.course" type="text" placeholder="Например: 2" />
                </div>
                <div class="form-group">
                  <label>Контакт *</label>
                  <input v-model="regForm.contact" type="text" placeholder="Telegram: @username или email" required />
                </div>
                <div class="form-group">
                  <label>Комментарий (необязательно)</label>
                  <textarea v-model="regForm.message" rows="2" placeholder="Жду с нетерпением!"></textarea>
                </div>
              </template>

              <div v-if="regError" class="reg-error">{{ regError }}</div>
              <div class="reg-actions">
                <button class="btn-outline-sm" @click="closeRegForm">Отмена</button>
                <button class="btn-submit" @click="submitRegistration"
                  :disabled="regLoading || !regForm.contact || (selectedEvent.requires_team !== false && !regForm.team_name) || (selectedEvent.requires_team === false && !regForm.full_name)">
                  {{ regLoading ? 'Отправка...' : (selectedEvent.requires_team !== false ? 'Отправить заявку' : 'Зарегистрироваться') }}
                </button>
              </div>
            </template>
          </div>

          
          <div v-else class="modal-actions">
            <button
              v-if="selectedEvent.status === 'upcoming' || selectedEvent.status === 'active'"
              class="btn-primary"
              @click="openRegForm"
            >
              Зарегистрироваться
            </button>
            <button v-else class="btn-disabled" disabled>
              Регистрация закрыта
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import AppIcon from '../components/AppIcon.vue'
import { getHackathons } from '../api/admin.js'
import { useAuthStore } from '../stores/auth.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://backend-production-431c.up.railway.app' : 'http://localhost:8080')

export default {
  name: 'EventsPage',
  components: {
    AppShell,
    AppIcon,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    return {
      events: [],
      loading: true,
      activeFilter: 'all',
      selectedEvent: null,
      showRegForm: false,
      regLoading: false,
      regSuccess: false,
      regError: '',
      myRegistrations: {},
      regForm: {
        contact: '',
        message: '',
        team_name: '',
        team_size: '',
        full_name: '',
        course: '',
        direction: '',
      },
      filters: [
        { label: 'Все', value: 'all' },
        { label: 'Активные', value: 'active' },
        { label: 'Предстоящие', value: 'upcoming' },
        { label: 'Завершённые', value: 'completed' },
      ],
    }
  },
  computed: {
    filteredEvents() {
      if (this.activeFilter === 'all') return this.events
      return this.events.filter(e => e.status === this.activeFilter)
    },
  },
  async mounted() {
    await this.loadEvents()
  },
  methods: {
    async loadEvents() {
      this.loading = true
      try {
        const events = await getHackathons()
        this.events = events.map(e => ({
          ...e,
          status: this.determineStatus(e.start_date, e.end_date, e.registration_deadline),
        })).sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      } catch (err) {
        console.error('Failed to load events:', err)
        this.events = []
      } finally {
        this.loading = false
      }
    },
    determineStatus(startDate, endDate, deadline) {
      const now = new Date()
      const start = new Date(startDate)
      const end = new Date(endDate)
      const regDeadline = deadline ? new Date(deadline) : null
      
      if (now > end) return 'completed'
      if (now >= start && now <= end) return 'active'
      if (regDeadline && now > regDeadline) return 'registration_closed'
      return 'upcoming'
    },
    getStatusLabel(status) {
      const labels = {
        active: 'Идёт',
        upcoming: 'Скоро',
        completed: 'Завершено',
        registration_closed: 'Регистрация закрыта',
      }
      return labels[status] || status
    },
    formatDate(date) {
      if (!date) return 'Дата не указана'
      const d = new Date(date)
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
    formatDateRange(start, end) {
      if (!start) return 'Дата не указана'
      const s = new Date(start)
      const e = end ? new Date(end) : null
      
      if (!e || s.getTime() === e.getTime()) {
        return s.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
      
      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${s.getDate()}–${e.getDate()} ${s.toLocaleDateString('ru-RU', { month: 'long' })} ${s.getFullYear()}`
      }
      
      return `${s.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
    },
    truncateText(text, length) {
      if (!text) return ''
      if (text.length <= length) return text
      return text.slice(0, length) + '...'
    },
    getEventImageStyle(event) {
      if (event.image_url) {
        const url = event.image_url.startsWith('http') ? event.image_url : `${API_BASE}${event.image_url}`
        return { backgroundImage: `url(${url})` }
      }
      const gradients = {
        active: 'linear-gradient(135deg, #e63946 0%, #7c3aed 100%)',
        upcoming: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
        completed: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
        registration_closed: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      }
      return { background: gradients[event.status] || gradients.upcoming }
    },
    openEventModal(event) {
      this.selectedEvent = event
      document.body.style.overflow = 'hidden'
    },
    closeEventModal() {
      this.selectedEvent = null
      document.body.style.overflow = ''
    },
    openRegForm() {
      this.showRegForm = true
      this.regSuccess = false
      this.regError = ''
      const p = this.authStore.profile || {}
      this.regForm = {
        contact: '',
        message: '',
        team_name: '',
        team_size: '',
        full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        course: p.course || '',
        direction: p.direction || '',
      }
    },
    closeRegForm() {
      this.showRegForm = false
    },
    isRegistered(eventId) {
      return !!this.myRegistrations[eventId]
    },
    async checkRegistration(eventId) {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/api/events/${eventId}/my-registration`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.registered) {
          this.myRegistrations = { ...this.myRegistrations, [eventId]: data.registration }
        }
      } catch (e) {}
    },
    async submitRegistration() {
      if (!this.selectedEvent) return
      this.regLoading = true
      this.regError = ''
      try {
        const token = localStorage.getItem('accessToken')
        const isEvent = this.selectedEvent.requires_team === false
        const payload = isEvent
          ? {
              contact: this.regForm.contact,
              team_name: this.regForm.full_name,
              message: [
                this.regForm.direction ? `Направление: ${this.regForm.direction}` : '',
                this.regForm.course ? `Курс: ${this.regForm.course}` : '',
                this.regForm.message || '',
              ].filter(Boolean).join(' · ') || null,
            }
          : {
              team_name: this.regForm.team_name,
              team_size: this.regForm.team_size,
              contact: this.regForm.contact,
              message: this.regForm.message,
            }
        const res = await fetch(`${API_BASE}/api/events/${this.selectedEvent.id}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Ошибка регистрации')
        this.myRegistrations = { ...this.myRegistrations, [this.selectedEvent.id]: data.registration }
        this.regSuccess = true
      } catch (err) {
        this.regError = err.message
      } finally {
        this.regLoading = false
      }
    },
    async openEventModal(event) {
      this.selectedEvent = event
      this.showRegForm = false
      this.regSuccess = false
      document.body.style.overflow = 'hidden'
      await this.checkRegistration(event.id)
    },
  },
}
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #080c1a 0%, #0a0e1a 100%);
  color: #fff;
  overflow-x: hidden;
}

.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #e63946;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: #1d4ed8;
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.page-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-label {
  display: inline-block;
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e63946;
  margin-bottom: 16px;
}

.page-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.filters-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.filter-group {
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.05);
  padding: 6px;
  border-radius: 12px;
}

.filter-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}

.filter-btn.active {
  background: rgba(230, 57, 70, 0.2);
  color: #e63946;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  color: rgba(255,255,255,0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255,255,255,0.6);
}

.empty-state h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px;
  margin: 16px 0 8px;
  color: #fff;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.event-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.05);
  border-color: rgba(230, 57, 70, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.event-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.event-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.event-badge.active {
  background: #e63946;
  color: #fff;
}

.event-badge.upcoming {
  background: #1d4ed8;
  color: #fff;
}

.event-badge.completed {
  background: #059669;
  color: #fff;
}

.event-format {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.event-content {
  padding: 24px;
}

.event-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.event-date, .event-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

.event-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  line-height: 1.3;
}

.event-description {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
  margin: 0 0 16px;
}

.event-footer {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.event-prize, .event-teams {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}

.event-prize {
  color: #f59e0b;
}

.event-tech {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-tag {
  padding: 4px 10px;
  background: rgba(230, 57, 70, 0.15);
  color: #e63946;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
}

.tech-tag.large {
  padding: 6px 14px;
  font-size: 13px;
}

.tech-more {
  padding: 4px 10px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  border-radius: 6px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #0f1629;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(230, 57, 70, 0.8);
}

.modal-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 24px 24px 0 0;
}

.modal-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.modal-body {
  padding: 32px;
}

.modal-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px;
  line-height: 1.2;
}

.modal-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}

.meta-item > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.modal-section {
  margin-bottom: 24px;
}

.modal-section h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #e63946;
  margin: 0 0 12px;
}

.modal-section p {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

.contact-info {
  margin-top: 8px;
  color: rgba(255,255,255,0.6) !important;
  font-size: 14px !important;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.modal-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-primary {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(230, 57, 70, 0.3);
}

.btn-disabled {
  width: 100%;
  padding: 16px 24px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
}

/* Registration form */
.reg-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.reg-form-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #e63946;
  margin: 0 0 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
}

.form-group input,
.form-group textarea {
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e63946;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255,255,255,0.3);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.reg-error {
  padding: 12px 16px;
  background: rgba(230, 57, 70, 0.15);
  border: 1px solid rgba(230, 57, 70, 0.3);
  border-radius: 10px;
  color: #e63946;
  font-size: 14px;
  margin-bottom: 16px;
}

.reg-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-outline-sm {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-sm:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.btn-submit {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(230, 57, 70, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reg-success-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: 14px;
  margin-top: 24px;
}

.reg-success-icon {
  color: #059669;
  flex-shrink: 0;
}

.reg-success-title {
  font-weight: 700;
  font-size: 16px;
  color: #34d399;
  margin-bottom: 4px;
}

.reg-success-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-meta {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
