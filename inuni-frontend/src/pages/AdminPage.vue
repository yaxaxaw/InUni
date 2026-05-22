<template>
  <AppShell>
    <div class="admin-page">
      
      <div class="page-bg">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="grid-overlay" />
      </div>

      
      <header class="admin-header">
        <div class="header-content">
          <h1>🛠️ Admin Panel</h1>
          <div class="header-actions">
            <span class="admin-badge">Administrator</span>
            <button class="btn-logout" @click="logout">Выйти</button>
          </div>
        </div>
      </header>

      
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ stats.total_users || 0 }}</div>
            <div class="stat-label">Пользователей</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🚀</div>
            <div class="stat-value">{{ stats.total_teams || 0 }}</div>
            <div class="stat-label">Команд</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value">{{ stats.total_applications || 0 }}</div>
            <div class="stat-label">Заявок</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">{{ stats.total_hackathons || 0 }}</div>
            <div class="stat-label">Хакатонов</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">⏳</div>
            <div class="stat-value">{{ stats.pending_applications || 0 }}</div>
            <div class="stat-label">Ожидают</div>
          </div>
        </div>
      </section>

      
      <section class="hackathons-section">
        <div class="section-header">
          <h2>🏆 Управление хакатонами</h2>
          <button class="btn-primary" @click="showCreateModal = true">
            + Создать хакатон
          </button>
        </div>

        <div class="hackathons-list">
          <div v-if="loading" class="loading">Загрузка...</div>
          
          <div v-else-if="hackathons.length === 0" class="empty-state">
            Нет хакатонов. Создайте первый!
          </div>

          <div v-else class="hackathon-cards">
            <div 
              v-for="hackathon in hackathons" 
              :key="hackathon.id"
              class="hackathon-card"
              :class="hackathon.status"
            >
              
              <div class="card-image-section" v-if="hackathon.image_url">
                <img :src="hackathon.image_url" :alt="hackathon.title">
              </div>
              
              <div class="card-content">
                <div class="card-header">
                  <h3>{{ hackathon.title }}</h3>
                  <span class="status-badge" :class="hackathon.status">
                    {{ getStatusText(hackathon.status) }}
                  </span>
                </div>
                
                
                <div class="tech-tags" v-if="hackathon.technologies?.length">
                  <span v-for="tech in hackathon.technologies.slice(0, 5)" :key="tech" class="tech-tag">
                    {{ tech }}
                  </span>
                </div>
                
                
                <p class="description">{{ hackathon.description || 'Описание отсутствует' }}</p>
                
                
                <div class="full-description" v-if="hackathon.full_description">
                  <details>
                    <summary>Подробное описание</summary>
                    <p>{{ hackathon.full_description }}</p>
                  </details>
                </div>
                
                
                <div class="prize-section" v-if="hackathon.prize_fund">
                  <div class="prize-header">
                    <span class="prize-icon">🏆</span>
                    <span class="prize-amount">{{ hackathon.prize_fund }}</span>
                  </div>
                  <p v-if="hackathon.prize_description" class="prize-details">
                    {{ hackathon.prize_description }}
                  </p>
                </div>
                
                
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <div class="detail-content">
                      <span class="detail-label">Проведение</span>
                      <span class="detail-value">{{ formatDate(hackathon.start_date) }} — {{ formatDate(hackathon.end_date) }}</span>
                    </div>
                  </div>
                  
                  <div class="detail-item" v-if="hackathon.registration_deadline">
                    <span class="detail-icon">⏰</span>
                    <div class="detail-content">
                      <span class="detail-label">Регистрация до</span>
                      <span class="detail-value">{{ formatDate(hackathon.registration_deadline) }}</span>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-icon">👥</span>
                    <div class="detail-content">
                      <span class="detail-label">Команды</span>
                      <span class="detail-value">До {{ hackathon.max_teams }} команд по {{ hackathon.team_size || '3-5' }} чел.</span>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <div class="detail-content">
                      <span class="detail-label">Формат</span>
                      <span class="detail-value">{{ getFormatText(hackathon.format) }} {{ hackathon.location ? '· ' + hackathon.location : '' }}</span>
                    </div>
                  </div>
                </div>
                
                
                <div class="requirements-section" v-if="hackathon.requirements">
                  <h4>📋 Требования к участникам</h4>
                  <p>{{ hackathon.requirements }}</p>
                </div>
                
                
                <div class="audience-section" v-if="hackathon.target_audience">
                  <h4>🎯 Целевая аудитория</h4>
                  <p>{{ hackathon.target_audience }}</p>
                </div>
                
                
                <div class="difficulty-badge" v-if="hackathon.difficulty_level" :class="hackathon.difficulty_level">
                  Уровень: {{ getDifficultyText(hackathon.difficulty_level) }}
                </div>
                
                
                <div class="organizer-section" v-if="hackathon.organizer_name">
                  <h4>👤 Организатор</h4>
                  <p>{{ hackathon.organizer_name }}</p>
                  <a v-if="hackathon.website_url" :href="hackathon.website_url" target="_blank" class="website-link">
                    🌐 Перейти на сайт
                  </a>
                </div>
                
                <div class="card-actions">
                  <button class="btn-participants" @click="openParticipants(hackathon)">
                    <span>👥</span> Участники
                    <span class="reg-count" v-if="registrationCounts[hackathon.id] !== undefined">{{ registrationCounts[hackathon.id] }}</span>
                  </button>
                  <button class="btn-edit" @click="editHackathon(hackathon)">
                    <span>✏️</span> Изменить
                  </button>
                  <button class="btn-delete" @click="deleteHackathon(hackathon.id)">
                    <span>🗑️</span> Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <div v-if="showParticipantsModal" class="modal-overlay" @click.self="showParticipantsModal = false">
        <div class="modal modal-large">
          <div class="modal-header">
            <h3>👥 Участники — {{ selectedHackathonTitle }}</h3>
            <button class="btn-close" @click="showParticipantsModal = false">×</button>
          </div>
          <div class="modal-body">
            <div v-if="participantsLoading" class="loading">Загрузка...</div>
            <div v-else-if="participants.length === 0" class="empty-state">Пока никто не зарегистрировался</div>
            <table v-else class="participants-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Участник</th>
                  <th>Роль</th>
                  <th>Команда</th>
                  <th>Кол-во</th>
                  <th>Контакт</th>
                  <th>Сообщение</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in participants" :key="p.id">
                  <td>{{ i + 1 }}</td>
                  <td class="p-name">{{ p.first_name }} {{ p.last_name }}</td>
                  <td>{{ p.role || '—' }}</td>
                  <td>{{ p.team_name || parsedField(p.message, 'team_lead') || '—' }}</td>
                  <td>{{ p.team_size || '—' }}</td>
                  <td class="p-contact">{{ p.contact || parsedField(p.message, 'contact') || '—' }}</td>
                  <td class="p-msg">
                    <div v-if="isJson(p.message)" class="msg-parsed">
                      <div v-if="parsedField(p.message,'idea')"><b>Идея:</b> {{ parsedField(p.message,'idea') }}</div>
                      <div v-if="parsedField(p.message,'tech_stack')"><b>Стек:</b> {{ parsedField(p.message,'tech_stack') }}</div>
                      <div v-if="parsedField(p.message,'experience')"><b>Опыт:</b> {{ parsedField(p.message,'experience') }}</div>
                      <div v-if="parsedField(p.message,'members')"><b>Участники:</b>
                        <span v-for="m in parsedField(p.message,'members')" :key="m.name"> {{ m.name }} ({{ m.role }})</span>
                      </div>
                    </div>
                    <span v-else>{{ p.message || '—' }}</span>
                  </td>
                  <td class="p-date">{{ formatDate(p.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="showCreateModal || editingHackathon" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal-large">
          <div class="modal-header">
            <h3>{{ editingHackathon ? '✏️ Изменить хакатон' : '🏆 Создать новый хакатон' }}</h3>
            <button class="btn-close" @click="closeModal">×</button>
          </div>
          
          <form @submit.prevent="saveHackathon">
            
            <div class="form-section">
              <h4 class="form-section-title">📋 Основная информация</h4>
              
              <div class="form-group">
                <label>Название хакатона *</label>
                <input v-model="form.title" type="text" required placeholder="Например: AI Challenge 2025">
              </div>
              
              <div class="form-row two-col">
                <div class="form-group">
                  <label>Краткое описание *</label>
                  <textarea v-model="form.description" rows="3" required placeholder="2-3 предложения о хакатоне..."></textarea>
                </div>
                <div class="form-group">
                  <label>Полное описание</label>
                  <textarea v-model="form.full_description" rows="3" placeholder="Подробное описание, правила, ожидания..."></textarea>
                </div>
              </div>
            </div>

            
            <div class="form-section">
              <h4 class="form-section-title">📅 Даты проведения</h4>
              
              <div class="form-row three-col">
                <div class="form-group">
                  <label>Дата начала *</label>
                  <input v-model="form.start_date" type="date" required>
                </div>
                <div class="form-group">
                  <label>Дата окончания *</label>
                  <input v-model="form.end_date" type="date" required>
                </div>
                <div class="form-group">
                  <label>Дедлайн регистрации</label>
                  <input v-model="form.registration_deadline" type="date">
                </div>
              </div>
              
              <div class="form-row three-col">
                <div class="form-group">
                  <label>Формат *</label>
                  <select v-model="form.format" required>
                    <option value="offline">🏢 Офлайн</option>
                    <option value="online">💻 Онлайн</option>
                    <option value="hybrid">🌐 Гибрид</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Локация</label>
                  <input v-model="form.location" type="text" placeholder="Например: КБТУ, Алматы">
                </div>
                <div class="form-group">
                  <label>Статус *</label>
                  <select v-model="form.status" required>
                    <option value="upcoming">🔵 Предстоящий</option>
                    <option value="active">🟢 Активный</option>
                    <option value="completed">⚪ Завершенный</option>
                    <option value="cancelled">🔴 Отмененный</option>
                  </select>
                </div>
              </div>
            </div>

            
            <div class="form-section">
              <h4 class="form-section-title">👥 Команды и участники</h4>
              
              <div class="form-row three-col">
                <div class="form-group">
                  <label>Макс. команд *</label>
                  <input v-model.number="form.max_teams" type="number" min="1" max="500" required>
                </div>
                <div class="form-group">
                  <label>Размер команды</label>
                  <input v-model="form.team_size" type="text" placeholder="Например: 3-5">
                </div>
                <div class="form-group">
                  <label>Уровень сложности</label>
                  <select v-model="form.difficulty_level">
                    <option value="beginner">🟢 Начинающие</option>
                    <option value="intermediate">🟡 Средний</option>
                    <option value="advanced">🔴 Продвинутый</option>
                    <option value="all">⚪ Любой</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Требования к участникам</label>
                <textarea v-model="form.requirements" rows="2" placeholder="Кто может участвовать? Например: студенты 2-4 курса IT специальностей"></textarea>
              </div>
              
              <div class="form-group">
                <label>Целевая аудитория</label>
                <input v-model="form.target_audience" type="text" placeholder="Например: Backend разработчики, ML инженеры">
              </div>
            </div>

            
            <div class="form-section">
              <h4 class="form-section-title">💰 Призовой фонд</h4>
              
              <div class="form-row two-col">
                <div class="form-group">
                  <label>Общий призовой фонд</label>
                  <input v-model="form.prize_fund" type="text" placeholder="Например: 1 000 000 ₸">
                </div>
                <div class="form-group">
                  <label>Распределение призов</label>
                  <textarea v-model="form.prize_description" rows="2" placeholder="1 место: 500K, 2 место: 300K, 3 место: 200K..."></textarea>
                </div>
              </div>
            </div>

            
            <div class="form-section">
              <h4 class="form-section-title">🛠️ Технологии и темы</h4>
              
              <div class="form-group">
                <label>Технологии (через запятую)</label>
                <input 
                  v-model="technologiesInput" 
                  type="text" 
                  placeholder="Python, TensorFlow, React, Node.js..."
                  @change="updateTechnologies"
                >
                <small class="hint">Введите технологии через запятую</small>
              </div>
            </div>

            
            <div class="form-section">
              <h4 class="form-section-title">👤 Организатор</h4>
              
              <div class="form-row two-col">
                <div class="form-group">
                  <label>Название организатора</label>
                  <input v-model="form.organizer_name" type="text" placeholder="Например: КБТУ + TechHub">
                </div>
                <div class="form-group">
                  <label>Контакт организатора</label>
                  <input v-model="form.organizer_contact" type="text" placeholder="email или телефон">
                </div>
              </div>
              
              <div class="form-row two-col">
                <div class="form-group">
                  <label>Сайт мероприятия</label>
                  <input v-model="form.website_url" type="url" placeholder="https://...">
                </div>
                <div class="form-group">
                  <label>URL изображения</label>
                  <input v-model="form.image_url" type="url" placeholder="https://...">
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">
                <span>✕</span> Отмена
              </button>
              <button type="submit" class="btn-primary btn-large" :disabled="saving">
                <span v-if="saving">⏳</span>
                <span v-else>💾</span>
                {{ saving ? 'Сохранение...' : (editingHackathon ? 'Сохранить изменения' : 'Создать хакатон') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue'
import { useAuthStore } from '../stores/auth.js'
import { getAdminStats, getHackathons, createHackathon, updateHackathon, deleteHackathon as apiDeleteHackathon } from '../api/admin.js'

export default {
  name: 'AdminPage',
  components: { AppShell },
  
  data() {
    return {
      stats: {},
      hackathons: [],
      loading: true,
      saving: false,
      showCreateModal: false,
      editingHackathon: null,
      showParticipantsModal: false,
      selectedHackathonTitle: '',
      selectedHackathonId: null,
      participants: [],
      participantsLoading: false,
      registrationCounts: {},
      technologiesInput: '',
      form: {
        title: '',
        description: '',
        full_description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        status: 'upcoming',
        format: 'offline',
        location: '',
        max_teams: 30,
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
        image_url: ''
      }
    }
  },
  
  async mounted() {
    this.checkAdmin()
    await this.loadStats()
    await this.loadHackathons()
    this.$forceUpdate()
  },
  
  methods: {
    checkAdmin() {
      const authStore = useAuthStore()
      if (!authStore.isAdmin) {
        this.$router.push('/login')
      }
    },
    
    async loadStats() {
      try {
        const stats = await getAdminStats()
        console.log('Stats loaded:', stats)
        this.stats = {
          total_users: parseInt(stats.total_users) || 0,
          total_teams: parseInt(stats.total_teams) || 0,
          total_applications: parseInt(stats.total_applications) || 0,
          total_hackathons: parseInt(stats.total_hackathons) || 0,
          pending_applications: parseInt(stats.pending_applications) || 0
        }
      } catch (e) {
        console.error('Failed to load stats:', e)
        this.stats = {}
      }
    },
    
    async loadHackathons() {
      this.loading = true
      try {
        const hackathons = await getHackathons()
        this.hackathons = hackathons
        this.loadRegistrationCounts(hackathons)
      } catch (e) {
        console.error('Failed to load hackathons:', e)
      } finally {
        this.loading = false
      }
    },

    async loadRegistrationCounts(hackathons) {
      const token = localStorage.getItem('accessToken')
      const counts = {}
      await Promise.all(hackathons.map(async (h) => {
        try {
          const res = await fetch(`/api/events/${h.id}/registrations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            counts[h.id] = data.length
          }
        } catch (e) {}
      }))
      this.registrationCounts = counts
    },

    isJson(str) {
      if (!str || typeof str !== 'string') return false
      const s = str.trim()
      return s.startsWith('{') || s.startsWith('[')
    },
    parsedField(str, field) {
      try {
        const obj = JSON.parse(str)
        return obj[field] ?? null
      } catch { return null }
    },

    async openParticipants(hackathon) {
      this.selectedHackathonTitle = hackathon.title
      this.selectedHackathonId = hackathon.id
      this.participants = []
      this.participantsLoading = true
      this.showParticipantsModal = true
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`/api/events/${hackathon.id}/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          this.participants = await res.json()
        }
      } catch (e) {
        console.error('Failed to load participants:', e)
      } finally {
        this.participantsLoading = false
      }
    },

    editHackathon(hackathon) {
      this.editingHackathon = hackathon
      this.form = { 
        title: hackathon.title || '',
        description: hackathon.description || '',
        full_description: hackathon.full_description || '',
        start_date: hackathon.start_date || '',
        end_date: hackathon.end_date || '',
        registration_deadline: hackathon.registration_deadline || '',
        status: hackathon.status || 'upcoming',
        format: hackathon.format || 'offline',
        location: hackathon.location || '',
        max_teams: hackathon.max_teams || 30,
        team_size: hackathon.team_size || '3-5',
        prize_fund: hackathon.prize_fund || '',
        prize_description: hackathon.prize_description || '',
        requirements: hackathon.requirements || '',
        target_audience: hackathon.target_audience || '',
        difficulty_level: hackathon.difficulty_level || 'intermediate',
        technologies: hackathon.technologies || [],
        organizer_name: hackathon.organizer_name || '',
        organizer_contact: hackathon.organizer_contact || '',
        website_url: hackathon.website_url || '',
        image_url: hackathon.image_url || ''
      }
      this.technologiesInput = (hackathon.technologies || []).join(', ')
      this.showCreateModal = true
    },
    
    updateTechnologies() {
      this.form.technologies = this.technologiesInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    },
    
    async saveHackathon() {
      this.saving = true
      
      this.updateTechnologies()
      
      try {
        if (this.editingHackathon) {
          await updateHackathon(this.editingHackathon.id, this.form)
          alert('✅ Хакатон успешно обновлен!')
        } else {
          await createHackathon(this.form)
          alert('✅ Хакатон успешно создан!')
        }
        this.closeModal()
        await this.loadHackathons()
        await this.loadStats()
      } catch (e) {
        alert('❌ Ошибка сохранения: ' + e.message)
      } finally {
        this.saving = false
      }
    },
    
    async deleteHackathon(id) {
      if (!confirm('Удалить хакатон?')) return
      
      try {
        await apiDeleteHackathon(id)
        await this.loadHackathons()
        await this.loadStats()
      } catch (e) {
        alert('Ошибка удаления: ' + e.message)
      }
    },
    
    closeModal() {
      this.showCreateModal = false
      this.editingHackathon = null
      this.technologiesInput = ''
      this.form = {
        title: '',
        description: '',
        full_description: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        status: 'upcoming',
        format: 'offline',
        location: '',
        max_teams: 30,
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
        image_url: ''
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('ru-RU')
    },
    
    getStatusText(status) {
      const map = {
        upcoming: '🔵 Предстоящий',
        active: '🟢 Активный',
        completed: '⚪ Завершенный',
        cancelled: '🔴 Отмененный'
      }
      return map[status] || status
    },
    
    getFormatText(format) {
      const map = {
        offline: '🏢 Офлайн',
        online: '💻 Онлайн',
        hybrid: '🌐 Гибрид'
      }
      return map[format] || 'Офлайн'
    },
    
    getDifficultyText(level) {
      const map = {
        beginner: '🟢 Начинающие',
        intermediate: '🟡 Средний',
        advanced: '🔴 Продвинутый',
        all: '⚪ Любой уровень'
      }
      return map[level] || 'Средний'
    },
    
    async logout() {
      const authStore = useAuthStore()
      await authStore.logout()
      window.location.href = '/admin/login'
    }
  }
}
</script>

<style scoped>
/* ===== CSS VARIABLES ===== */
.admin-page {
  --c-bg: #080c1a;
  --c-surface: #0f1629;
  --c-card: #131a30;
  --c-border: rgba(255, 255, 255, 0.07);
  --c-red: #e63946;
  --c-red-dim: rgba(230, 57, 70, 0.15);
  --c-blue: #1d4ed8;
  --c-blue-dim: rgba(29, 78, 216, 0.15);
  --c-purple: #7c3aed;
  --c-text: #e8eaf2;
  --c-muted: #8891b2;
  --c-white: #ffffff;

  position: relative;
  min-height: 100vh;
  padding: 24px;
  font-family: 'Onest', sans-serif;
  color: var(--c-text);
  z-index: 1;
}

/* ===== BACKGROUND ===== */
.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
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

/* ===== HEADER ===== */
.admin-header {
  position: relative;
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.3) 0%, rgba(29, 78, 216, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 32px;
  color: white;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-badge {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #4ade80;
}

.btn-logout {
  background: rgba(230, 57, 70, 0.2);
  border: 1px solid rgba(230, 57, 70, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-logout:hover {
  background: rgba(230, 57, 70, 0.3);
  transform: translateY(-1px);
}

/* Stats */
.stats-section {
  margin-bottom: 32px;
  position: relative;
  z-index: 2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: var(--c-card);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid var(--c-border);
  transition: all 0.2s;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  position: relative;
  z-index: 2;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-card.warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, var(--c-card) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--c-white);
  margin-bottom: 4px;
  font-family: 'Unbounded', sans-serif;
}

.stat-card.warning .stat-value {
  color: #fbbf24;
}

.stat-label {
  font-size: 14px;
  color: var(--c-muted);
}

/* Hackathons Section */
.hackathons-section {
  background: var(--c-card);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid var(--c-border);
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: var(--c-white);
}

.btn-primary {
  background: linear-gradient(135deg, var(--c-red) 0%, var(--c-blue) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Onest', sans-serif;
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(230, 57, 70, 0.45);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--c-muted);
}

.empty-state h3 {
  font-size: 20px;
  color: var(--c-white);
  margin: 0 0 8px 0;
}

/* Hackathon Cards */
.hackathon-cards {
  display: grid;
  gap: 20px;
}

.hackathon-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.hackathon-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.hackathon-card.upcoming {
  border-left: 4px solid var(--c-blue);
}

.hackathon-card.active {
  border-left: 4px solid #22c55e;
}

.hackathon-card.completed {
  border-left: 4px solid var(--c-muted);
}

.hackathon-card.cancelled {
  border-left: 4px solid var(--c-red);
}

/* Card Image Section */
.card-image-section {
  margin: -24px -24px 20px -24px;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  max-height: 200px;
}

.card-image-section img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Tech Tags */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tech-tag {
  background: var(--c-blue-dim);
  color: var(--c-blue);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Description */
.description {
  color: var(--c-text);
  margin-bottom: 16px;
  line-height: 1.6;
  font-size: 15px;
}

/* Full Description Accordion */
.full-description {
  margin-bottom: 16px;
}

.full-description details {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 12px 16px;
}

.full-description summary {
  color: var(--c-blue);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

.full-description p {
  color: var(--c-muted);
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
}

/* Prize Section */
.prize-section {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.prize-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.prize-icon {
  font-size: 24px;
}

.prize-amount {
  font-size: 20px;
  font-weight: 700;
  color: #fbbf24;
  font-family: 'Unbounded', sans-serif;
}

.prize-details {
  color: var(--c-muted);
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--c-card);
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--c-border);
}

.detail-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: var(--c-muted);
}

.detail-value {
  font-size: 14px;
  color: var(--c-text);
  font-weight: 500;
}

/* Requirements & Audience Sections */
.requirements-section,
.audience-section,
.organizer-section {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.requirements-section h4,
.audience-section h4,
.organizer-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--c-white);
  font-weight: 600;
}

.requirements-section p,
.audience-section p,
.organizer-section p {
  margin: 0;
  color: var(--c-muted);
  font-size: 14px;
  line-height: 1.6;
}

/* Difficulty Badge */
.difficulty-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.difficulty-badge.beginner {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.difficulty-badge.intermediate {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.difficulty-badge.advanced {
  background: rgba(230, 57, 70, 0.15);
  color: var(--c-red);
}

.difficulty-badge.all {
  background: rgba(136, 145, 178, 0.15);
  color: var(--c-muted);
}

/* Website Link */
.website-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--c-blue);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.website-link:hover {
  color: #60a5fa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--c-white);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.upcoming {
  background: var(--c-blue-dim);
  color: var(--c-blue);
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.completed {
  background: rgba(136, 145, 178, 0.15);
  color: var(--c-muted);
}

.status-badge.cancelled {
  background: var(--c-red-dim);
  color: var(--c-red);
}

.description {
  color: var(--c-muted);
  margin-bottom: 12px;
  line-height: 1.5;
}

.dates, .meta {
  font-size: 14px;
  color: var(--c-muted);
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.btn-participants {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-participants:hover {
  background: rgba(99, 102, 241, 0.22);
}

.reg-count {
  background: #6366f1;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.participants-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.participants-table th {
  text-align: left;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.participants-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: var(--c-text);
  vertical-align: top;
}

.participants-table tr:hover td {
  background: rgba(255,255,255,0.02);
}

.p-name { font-weight: 600; white-space: nowrap; }
.p-contact { color: #60a5fa; white-space: nowrap; }
.p-date { white-space: nowrap; color: rgba(255,255,255,0.45); font-size: 12px; }
.p-msg {
  max-width: 240px;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
}
.msg-parsed div {
  margin-bottom: 3px;
}
.msg-parsed b {
  color: rgba(255,255,255,0.5);
  font-weight: 600;
  margin-right: 4px;
}

.btn-edit {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--c-text);
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Onest', sans-serif;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-delete {
  background: var(--c-red-dim);
  border: 1px solid rgba(230, 57, 70, 0.3);
  color: var(--c-red);
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Onest', sans-serif;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: rgba(230, 57, 70, 0.25);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--c-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--c-white);
}

.btn-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: var(--c-muted);
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--c-red-dim);
  color: var(--c-red);
  border-color: rgba(230, 57, 70, 0.3);
}

/* Form Sections */
.form-section {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-white);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint {
  display: block;
  margin-top: 6px;
  color: var(--c-muted);
  font-size: 12px;
}

.form-row.two-col {
  grid-template-columns: repeat(2, 1fr);
}

.form-row.three-col {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .form-row.two-col,
  .form-row.three-col {
    grid-template-columns: 1fr;
  }
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--c-white);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: var(--c-text);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  font-size: 14px;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--c-red);
  box-shadow: 0 0 0 3px var(--c-red-dim);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--c-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--c-text);
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Onest', sans-serif;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--c-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
