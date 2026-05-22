<template>
  <AppShell>
    <div class="admin-events-page">
      <div class="page-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="page-content">
        
        <div class="page-header">
          <div class="header-left">
            <span class="section-label">АДМИН ПАНЕЛЬ</span>
            <h1 class="page-title">Управление мероприятиями</h1>
          </div>
          <button class="btn-primary" @click="openCreateModal">
            <AppIcon name="plus" :size="18" />
            Добавить мероприятие
          </button>
        </div>

        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <AppIcon name="calendar" :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">Всего мероприятий</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon upcoming">
              <AppIcon name="clock" :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.upcoming }}</span>
              <span class="stat-label">Предстоящих</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">
              <AppIcon name="play" :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.active }}</span>
              <span class="stat-label">Активных</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon completed">
              <AppIcon name="check-circle" :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.completed }}</span>
              <span class="stat-label">Завершённых</span>
            </div>
          </div>
        </div>

        
        <div class="table-container">
          <div class="table-header">
            <h3>Список мероприятий</h3>
            <div class="table-actions">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Поиск..." 
                class="search-input"
              />
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Загрузка...</span>
          </div>

          <div v-else-if="filteredEvents.length === 0" class="empty-state">
            <AppIcon name="calendar" :size="48" />
            <p>Нет мероприятий</p>
          </div>

          <table v-else class="events-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Формат</th>
                <th>Команды</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td>
                  <div class="event-cell">
                    <div class="event-image-small" :style="getEventImageStyle(event)"></div>
                    <div class="event-info">
                      <span class="event-name">{{ event.title }}</span>
                      <span class="event-tech" v-if="event.technologies?.length">
                        {{ event.technologies.slice(0, 2).join(', ') }}
                        <span v-if="event.technologies.length > 2">+{{ event.technologies.length - 2 }}</span>
                      </span>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(event.start_date) }}</td>
                <td>
                  <span class="status-badge" :class="getStatus(event)">
                    {{ getStatusLabel(getStatus(event)) }}
                  </span>
                </td>
                <td>{{ event.format === 'online' ? 'Онлайн' : 'Офлайн' }}</td>
                <td>{{ event.max_teams || '–' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" @click="openEditModal(event)" title="Редактировать">
                      <AppIcon name="edit" :size="16" />
                    </button>
                    <button class="btn-icon danger" @click="deleteEvent(event)" title="Удалить">
                      <AppIcon name="trash" :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingEvent ? 'Редактировать' : 'Создать' }} мероприятие</h2>
            <button class="modal-close" @click="closeModal">
              <AppIcon name="x" :size="24" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="form-grid">

                
                <div class="form-group full-width">
                  <label>Тип мероприятия *</label>
                  <div class="type-select">
                    <button type="button" :class="['type-btn', { active: form.event_type === 'hackathon' }]"
                      @click="form.event_type = 'hackathon'; form.requires_team = true">
                      🏆 Хакатон / Конкурс
                    </button>
                    <button type="button" :class="['type-btn', { active: form.event_type === 'event' }]"
                      @click="form.event_type = 'event'; form.requires_team = false">
                      🎉 Мероприятие
                    </button>
                  </div>
                  <p class="type-hint" v-if="form.event_type === 'hackathon'">Участие командой, есть призы и рейтинг</p>
                  <p class="type-hint" v-else>Концерт, воркшоп, лекция — индивидуальная запись</p>
                </div>

                <div class="form-group">
                  <label>Название *</label>
                  <input v-model="form.title" type="text" required placeholder="Название мероприятия" />
                </div>

                <div class="form-group">
                  <label>Краткое описание</label>
                  <input v-model="form.description" type="text" placeholder="Краткое описание для карточки" />
                </div>

                <div class="form-group full-width">
                  <label>Полное описание</label>
                  <textarea v-model="form.full_description" rows="4" placeholder="Подробное описание мероприятия"></textarea>
                </div>

                <div class="form-group">
                  <label>Дата начала *</label>
                  <input v-model="form.start_date" type="date" required />
                </div>

                <div class="form-group">
                  <label>Дата окончания *</label>
                  <input v-model="form.end_date" type="date" required />
                </div>

                <div class="form-group">
                  <label>Дедлайн регистрации</label>
                  <input v-model="form.registration_deadline" type="date" />
                </div>

                <div class="form-group">
                  <label>Формат</label>
                  <select v-model="form.format">
                    <option value="offline">Офлайн</option>
                    <option value="online">Онлайн</option>
                    <option value="hybrid">Гибрид</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Место проведения</label>
                  <input v-model="form.location" type="text" placeholder="Аудитория / Zoom / Discord" />
                </div>

                
                <template v-if="form.event_type === 'hackathon'">
                  <div class="form-group">
                    <label>Макс. команд</label>
                    <input v-model.number="form.max_teams" type="number" min="1" placeholder="50" />
                  </div>
                  <div class="form-group">
                    <label>Размер команды</label>
                    <input v-model="form.team_size" type="text" placeholder="3-5" />
                  </div>
                  <div class="form-group">
                    <label>Призовой фонд</label>
                    <input v-model="form.prize_fund" type="text" placeholder="500 000 ₸" />
                  </div>
                  <div class="form-group">
                    <label>Описание призов</label>
                    <input v-model="form.prize_description" type="text" placeholder="1 место: 200K, 2 место: 150K..." />
                  </div>
                </template>

                
                <div class="form-group" v-if="form.event_type === 'event'">
                  <label>Макс. участников</label>
                  <input v-model.number="form.max_teams" type="number" min="1" placeholder="200" />
                </div>

                <div class="form-group full-width">
                  <label>Требования к участникам</label>
                  <textarea v-model="form.requirements" rows="3" placeholder="Требования, ограничения, необходимые навыки"></textarea>
                </div>

                <div class="form-group full-width">
                  <label>Целевая аудитория</label>
                  <input v-model="form.target_audience" type="text" placeholder="Студенты 2-4 курсов, все направления" />
                </div>

                <div class="form-group">
                  <label>Уровень сложности</label>
                  <select v-model="form.difficulty_level">
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>

                <div class="form-group full-width">
                  <label>Технологии (через запятую)</label>
                  <input v-model="technologiesInput" type="text" placeholder="Vue.js, React, Python, AI/ML" />
                </div>

                <div class="form-group">
                  <label>Организатор</label>
                  <input v-model="form.organizer_name" type="text" placeholder="Название организации" />
                </div>

                <div class="form-group">
                  <label>Контакт организатора</label>
                  <input v-model="form.organizer_contact" type="text" placeholder="email или телефон" />
                </div>

                <div class="form-group">
                  <label>Сайт мероприятия</label>
                  <input v-model="form.website_url" type="url" placeholder="https://..." />
                </div>

                <div class="form-group full-width">
                  <label>Фото мероприятия</label>
                  <div class="image-upload-wrap">
                    <div v-if="form.image_url" class="image-preview">
                      <img :src="form.image_url" alt="preview" class="image-preview-img" />
                      <button type="button" class="image-remove-btn" @click="form.image_url = ''">✕</button>
                    </div>
                    <label v-else class="image-upload-btn">
                      <input type="file" accept="image/*" class="sr-only" :key="imgInputKey" @change="uploadEventPhoto" />
                      <span v-if="uploadingPhoto">⏳ Загрузка...</span>
                      <span v-else>+ Добавить фото</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-outline" @click="closeModal">Отмена</button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  {{ saving ? 'Сохранение...' : (editingEvent ? 'Сохранить' : 'Создать') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-dialog">
          <h3>Удалить мероприятие?</h3>
          <p>Вы уверены, что хотите удалить «{{ eventToDelete?.title }}»? Это действие нельзя отменить.</p>
          <div class="confirm-actions">
            <button class="btn-outline" @click="showDeleteConfirm = false">Отмена</button>
            <button class="btn-danger" @click="confirmDelete">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import AppIcon from '../components/AppIcon.vue'
import { getHackathons, createHackathon, updateHackathon, deleteHackathon } from '../api/admin.js'

export default {
  name: 'AdminEventsPage',
  components: {
    AppShell,
    AppIcon,
  },
  data() {
    return {
      events: [],
      loading: true,
      searchQuery: '',
      showModal: false,
      editingEvent: null,
      saving: false,
      showDeleteConfirm: false,
      eventToDelete: null,
      technologiesInput: '',
      uploadingPhoto: false,
      imgInputKey: 0,
      form: {
        title: '',
        description: '',
        full_description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        format: 'offline',
        location: '',
        max_teams: 50,
        team_size: '3-5',
        prize_fund: '',
        prize_description: '',
        requirements: '',
        target_audience: '',
        difficulty_level: 'intermediate',
        technologies: [],
        organizer_name: '',
        organizer_contact: '',
        website_url: '',
        image_url: '',
        event_type: 'hackathon',
        requires_team: true,
      },
    }
  },
  computed: {
    filteredEvents() {
      if (!this.searchQuery) return this.events
      const q = this.searchQuery.toLowerCase()
      return this.events.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      )
    },
    stats() {
      return {
        total: this.events.length,
        upcoming: this.events.filter(e => this.getStatus(e) === 'upcoming').length,
        active: this.events.filter(e => this.getStatus(e) === 'active').length,
        completed: this.events.filter(e => this.getStatus(e) === 'completed').length,
      }
    },
  },
  async mounted() {
    await this.loadEvents()
  },
  methods: {
    async loadEvents() {
      this.loading = true
      try {
        this.events = await getHackathons()
      } catch (err) {
        console.error('Failed to load events:', err)
        alert('Ошибка загрузки мероприятий')
      } finally {
        this.loading = false
      }
    },
    getStatus(event) {
      const now = new Date()
      const start = new Date(event.start_date)
      const end = new Date(event.end_date)
      
      if (now > end) return 'completed'
      if (now >= start && now <= end) return 'active'
      return 'upcoming'
    },
    getStatusLabel(status) {
      const labels = {
        active: 'Идёт',
        upcoming: 'Скоро',
        completed: 'Завершено',
      }
      return labels[status] || status
    },
    formatDate(date) {
      if (!date) return '–'
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
    getEventImageStyle(event) {
      if (event.image_url) {
        return { backgroundImage: `url(${event.image_url})` }
      }
      return { background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)' }
    },
    openCreateModal() {
      this.editingEvent = null
      this.resetForm()
      this.showModal = true
    },
    openEditModal(event) {
      this.editingEvent = event
      this.form = { ...event }
      this.technologiesInput = event.technologies?.join(', ') || ''
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingEvent = null
      this.resetForm()
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        full_description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        format: 'offline',
        location: '',
        max_teams: 50,
        team_size: '3-5',
        prize_fund: '',
        prize_description: '',
        requirements: '',
        target_audience: '',
        difficulty_level: 'intermediate',
        technologies: [],
        organizer_name: '',
        organizer_contact: '',
        website_url: '',
        image_url: '',
        event_type: 'hackathon',
        requires_team: true,
      }
      this.technologiesInput = ''
    },
    async uploadEventPhoto(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploadingPhoto = true
      try {
        const formData = new FormData()
        formData.append('photo', file)
        const token = localStorage.getItem('accessToken')
        const res = await fetch('/api/events/upload-photo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        const data = await res.json()
        if (data.photoUrl) this.form.image_url = data.photoUrl
      } catch (err) {
        alert('Ошибка загрузки фото')
      } finally {
        this.uploadingPhoto = false
        this.imgInputKey++
      }
    },
    async saveEvent() {
      this.saving = true
      try {
        const data = {
          ...this.form,
          technologies: this.technologiesInput.split(',').map(t => t.trim()).filter(Boolean),
        }

        if (this.editingEvent) {
          await updateHackathon(this.editingEvent.id, data)
        } else {
          await createHackathon(data)
        }

        await this.loadEvents()
        this.closeModal()
      } catch (err) {
        console.error('Failed to save event:', err)
        alert('Ошибка сохранения: ' + err.message)
      } finally {
        this.saving = false
      }
    },
    deleteEvent(event) {
      this.eventToDelete = event
      this.showDeleteConfirm = true
    },
    async confirmDelete() {
      if (!this.eventToDelete) return
      
      try {
        await deleteHackathon(this.eventToDelete.id)
        await this.loadEvents()
        this.showDeleteConfirm = false
        this.eventToDelete = null
      } catch (err) {
        console.error('Failed to delete event:', err)
        alert('Ошибка удаления: ' + err.message)
      }
    },
  },
}
</script>

<style scoped>
.admin-events-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #080c1a 0%, #0a0e1a 100%);
  color: #fff;
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
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: #1d4ed8;
  bottom: -50px;
  left: -50px;
}

.page-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e63946;
}

.page-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(230, 57, 70, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(230, 57, 70, 0.15);
  color: #e63946;
  border-radius: 12px;
}

.stat-icon.upcoming {
  background: rgba(29, 78, 216, 0.15);
  color: #1d4ed8;
}

.stat-icon.active {
  background: rgba(230, 57, 70, 0.15);
  color: #e63946;
}

.stat-icon.completed {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
}

.stat-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}

.table-container {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.table-header h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  margin: 0;
}

.search-input {
  padding: 10px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  width: 250px;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.4);
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
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

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th,
.events-table td {
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
}

.events-table th {
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.events-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.2s;
}

.events-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.events-table tbody tr:last-child {
  border-bottom: none;
}

.event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-image-small {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-name {
  font-weight: 600;
}

.event-tech {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.upcoming {
  background: rgba(29, 78, 216, 0.15);
  color: #1d4ed8;
}

.status-badge.active {
  background: rgba(230, 57, 70, 0.15);
  color: #e63946;
}

.status-badge.completed {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.btn-icon.danger:hover {
  background: rgba(230, 57, 70, 0.2);
  color: #e63946;
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
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.modal-header h2 {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(230, 57, 70, 0.8);
}

.modal-body {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e63946;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255,255,255,0.4);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.type-select {
  display: flex;
  gap: 10px;
}

.type-btn {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.type-btn.active {
  background: rgba(230,57,70,0.15);
  border-color: #e63946;
  color: #f28b93;
}

.type-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: rgba(255,255,255,0.05);
}

.btn-danger {
  padding: 12px 24px;
  background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Confirm Dialog */
.confirm-dialog {
  background: #0f1629;
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.1);
}

.confirm-dialog h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  margin: 0 0 12px;
}

.confirm-dialog p {
  color: rgba(255,255,255,0.7);
  margin: 0 0 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.image-upload-wrap { width: 100%; }
.image-upload-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 120px;
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 12px;
  color: rgba(255,255,255,0.4); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.image-upload-btn:hover { border-color: rgba(230,57,70,0.4); color: #f87171; }
.image-preview {
  position: relative; width: 100%; height: 160px;
  border-radius: 12px; overflow: hidden;
}
.image-preview-img { width: 100%; height: 100%; object-fit: cover; }
.image-remove-btn {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.6); border: none;
  color: #fff; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .events-table {
    font-size: 12px;
  }
  
  .events-table th,
  .events-table td {
    padding: 12px 16px;
  }
}
</style>
