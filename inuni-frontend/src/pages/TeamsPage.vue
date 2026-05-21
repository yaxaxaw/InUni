<template>
  <AppShell>
    <div class="page-bg">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="grid-overlay" />
    </div>

    <transition name="modal-fade">
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Создать командный слот</h2>
            <button type="button" class="modal-close" @click="showCreateModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Тип</label>
              <div class="tag-select">
                <span
                    v-for="t in slotCategoryOptions"
                    :key="t.key"
                    class="tag-option"
                    :class="{ selected: newSlot.category === t.key }"
                    @click="newSlot.category = t.key"
                >{{ t.label }}</span>
              </div>
              <p v-if="!isAdminOrOrg" class="hint-text">
                💡 Только организации и администраторы могут создавать хакатонные слоты
              </p>
            </div>
            <div class="form-group">
              <label>Название</label>
              <input v-model="newSlot.name" type="text" placeholder="Например: AI-ассистент для студентов" />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="newSlot.desc" placeholder="Идея, стек, цели..." />
            </div>
            <div class="form-group">
              <label>Тематика</label>
              <div class="tag-select">
                <span
                    v-for="t in themeTags"
                    :key="t"
                    class="tag-option"
                    :class="{ selected: newSlot.tags.includes(t) }"
                    @click="toggleNewTag(t)"
                >{{ t }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Нужны в команду</label>
              <div class="tag-select">
                <span
                    v-for="r in roleOptions"
                    :key="r"
                    class="tag-option role-option"
                    :class="{ selected: newSlot.roles.includes(r) }"
                    @click="toggleNewRole(r)"
                >{{ r }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" @click="showCreateModal = false">Отмена</button>
            <button type="button" class="btn-primary" @click="createSlot">Опубликовать →</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showApplyModal" class="modal-overlay" @click="showApplyModal = false">
        <div class="modal modal--sm" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Отклик на слот</h2>
            <button type="button" class="modal-close" @click="showApplyModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="apply-target-name">{{ applyingTo?.name }}</div>
            <div class="form-group">
              <label>Роль</label>
              <div class="tag-select">
                <span
                    v-for="r in applyingTo?.roles || []"
                    :key="r"
                    class="tag-option role-option"
                    :class="{ selected: applyRole === r }"
                    @click="applyRole = r"
                >{{ r }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Сообщение (необязательно)</label>
              <textarea v-model="applyMessage" placeholder="Почему хочешь в команду..." />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" @click="showApplyModal = false">Отмена</button>
            <button type="button" class="btn-primary" @click="submitSlotApply">Отправить →</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showEventModal" class="modal-overlay" @click="closeEventModal">
        <div class="modal modal--wide" @click.stop>
          <div class="modal-header">
            <div>
              <div class="modal-label">Заявка на событие</div>
              <h2 class="modal-title">{{ selectedEvent?.name }}</h2>
            </div>
            <button type="button" class="modal-close" @click="closeEventModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-summary">
              <span class="summary-item"><AppIcon name="map-pin" :size="14" />{{ selectedEvent?.location }}</span>
              <span class="summary-item"><AppIcon name="calendar" :size="14" />{{ selectedEvent?.date }}</span>
              <span class="summary-item"><AppIcon name="users" :size="14" />{{ selectedEvent?.teamSize }}</span>
              <span class="summary-item"><AppIcon name="wallet" :size="14" />{{ selectedEvent?.prize }}</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Имя и фамилия</label>
                <input v-model="eventForm.fullName" type="text" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="eventForm.email" type="email" />
              </div>
              <div class="form-group">
                <label>Университет</label>
                <input v-model="eventForm.organization" type="text" />
              </div>
              <div class="form-group">
                <label>Роль в команде</label>
                <select v-model="eventForm.role">
                  <option disabled value="">Выберите роль</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>ML Engineer</option>
                  <option>Designer</option>
                  <option>Product / PM</option>
                </select>
              </div>
              <div class="form-group">
                <label>Название команды</label>
                <input v-model="eventForm.teamName" type="text" placeholder="Или «Ищу команду»" />
              </div>
              <div class="form-group">
                <label>Размер команды</label>
                <input v-model="eventForm.teamSize" type="number" min="1" max="5" />
              </div>
            </div>
            <div class="form-group">
              <label>О себе</label>
              <textarea v-model="eventForm.bio" rows="3" />
            </div>
            <div class="form-group">
              <label>Идея / мотивация</label>
              <textarea v-model="eventForm.idea" rows="3" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" @click="closeEventModal">Отмена</button>
            <button type="button" class="btn-primary" @click="submitEventApplication">Отправить заявку →</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showSkillsModal && selectedIncomingApp" class="modal-overlay" @click="showSkillsModal = false">
        <div class="modal modal--sm" @click.stop>
          <div class="modal-header">
            <div>
              <div class="modal-label">Заявка на вступление</div>
              <h2 class="modal-title">{{ selectedIncomingApp.applicantName }}</h2>
            </div>
            <button type="button" class="modal-close" @click="showSkillsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="applicant-profile">
              <div class="applicant-av" :style="{ background: selectedIncomingApp.applicantColor }">
                {{ selectedIncomingApp.applicantInitials }}
              </div>
              <div class="applicant-info">
                <div class="applicant-name">{{ selectedIncomingApp.applicantName }}</div>
                <div class="applicant-meta">
                  <span><AppIcon name="graduation-cap" :size="13" />{{ selectedIncomingApp.university }}</span>
                  <span><AppIcon name="briefcase" :size="13" />{{ selectedIncomingApp.role }}</span>
                </div>
              </div>
            </div>

            <div class="incoming-slot-info">
              <span class="incoming-slot-label">Хочет в проект</span>
              <span class="incoming-slot-name">{{ selectedIncomingApp.slotName }}</span>
              <span class="cat-badge" :class="selectedIncomingApp.slotCategory">
                {{ categoryLabel(selectedIncomingApp.slotCategory) }}
              </span>
            </div>

            <div v-if="selectedIncomingApp.message" class="form-group">
              <label>Сообщение</label>
              <div class="applicant-message">{{ selectedIncomingApp.message }}</div>
            </div>

            <div class="form-group">
              <label>Навыки</label>
              <div class="skills-grid">
                <span v-for="skill in selectedIncomingApp.skills" :key="skill" class="skill-chip">{{ skill }}</span>
              </div>
            </div>

            <div v-if="selectedIncomingApp.github || selectedIncomingApp.portfolio" class="form-group">
              <label>Ссылки</label>
              <div class="links-row">
                <a v-if="selectedIncomingApp.github" :href="selectedIncomingApp.github" target="_blank" class="link-chip">
                  <AppIcon name="github" :size="13" /> GitHub
                </a>
                <a v-if="selectedIncomingApp.portfolio" :href="selectedIncomingApp.portfolio" target="_blank" class="link-chip">
                  <AppIcon name="external-link" :size="13" /> Portfolio
                </a>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-outline" @click="showSkillsModal = false">Закрыть</button>
            <button
                v-if="selectedIncomingApp.status === 'pending'"
                type="button"
                class="btn-danger"
                @click="rejectApplication(selectedIncomingApp); showSkillsModal = false"
            >Отклонить</button>
            <button
                v-if="selectedIncomingApp.status === 'pending'"
                type="button"
                class="btn-success"
                @click="acceptApplication(selectedIncomingApp); showSkillsModal = false"
            >Принять в команду ✓</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showAiTeamModal" class="modal-overlay" @click="closeAiTeamModal">
        <div class="modal modal--wide ai-team-modal" @click.stop>
          <div class="modal-header">
            <div class="ai-header">
              <div class="ai-icon-large">🤖</div>
              <div>
                <div class="modal-label">AI Team Builder</div>
                <h2 class="modal-title">Собери идеальную команду</h2>
                <p class="ai-subtitle">Опиши проект — AI подберёт участников с нужными навыками</p>
              </div>
            </div>
            <button type="button" class="modal-close" @click="closeAiTeamModal">✕</button>
          </div>

          <div class="modal-body">
            <div v-if="!aiTeamResults" class="ai-input-section">
              <div class="form-group">
                <label>Опиши свой проект или команду</label>
                <textarea
                  v-model="aiTeamQuery"
                  class="ai-textarea"
                  placeholder="Например: Делаю EdTech стартап для онлайн-обучения. Нужны frontend (Vue), backend (Python) и дизайнер. Хакатон через 2 недели..."
                  rows="4"
                />
                <p class="ai-hint">💡 Чем подробнее описание — тем точнее подбор</p>
              </div>

              <div class="form-group">
                <label>Или выбери роли вручную</label>
                <div class="tag-select ai-role-select">
                  <span
                    v-for="role in aiRoleOptions"
                    :key="role"
                    class="tag-option role-option"
                    :class="{ selected: selectedAiRoles.includes(role) }"
                    @click="toggleAiRole(role)"
                  >{{ role }}</span>
                </div>
              </div>

              <div class="ai-templates">
                <span class="templates-label">Быстрые шаблоны:</span>
                <button
                  v-for="template in aiTemplates"
                  :key="template.name"
                  class="template-chip"
                  @click="applyAiTemplate(template)"
                >{{ template.icon }} {{ template.name }}</button>
              </div>
            </div>

            <div v-else class="ai-results">
              <div class="ai-summary">
                <div class="summary-score">
                  <div class="score-circle" :class="getScoreClass(aiTeamResults.teamFit)">
                    <span class="score-value">{{ aiTeamResults.teamFit }}%</span>
                    <span class="score-label">Match</span>
                  </div>
                  <div class="summary-text">
                    <div class="summary-title">{{ aiTeamResults.analysis }}</div>
                    <div class="summary-subtitle">Найдено {{ aiTeamResults.candidates.length }} кандидатов</div>
                  </div>
                </div>
              </div>

              <div class="candidates-grid">
                <div
                  v-for="candidate in aiTeamResults.candidates"
                  :key="candidate.name"
                  class="candidate-card"
                  :class="{ 'candidate-selected': selectedCandidates.includes(candidate) }"
                  @click="toggleCandidateSelection(candidate)"
                >
                  <div class="cand-header">
                    <div class="cand-avatar" :style="{ background: candidate.color }">{{ candidate.initials }}</div>
                    <div class="cand-info">
                      <div class="cand-name">{{ candidate.name }}</div>
                      <div class="cand-role">{{ candidate.role }}</div>
                    </div>
                    <div class="cand-match" :class="{ 'match-high': candidate.match >= 80, 'match-medium': candidate.match >= 60 && candidate.match < 80 }">
                      {{ candidate.match }}%
                    </div>
                    <div class="cand-check" v-if="selectedCandidates.includes(candidate)">✓</div>
                  </div>
                  <div class="cand-about">{{ candidate.about }}</div>
                  <div class="cand-skills">{{ candidate.skills }}</div>
                  <div class="cand-reason">💡 {{ candidate.reason }}</div>
                </div>
              </div>

              <div v-if="selectedCandidates.length > 0" class="selected-team">
                <div class="selected-header">
                  <span class="selected-label">Выбранная команда:</span>
                  <span class="selected-count">{{ selectedCandidates.length }} из {{ aiTeamResults.candidates.length }}</span>
                </div>
                <div class="selected-chips">
                  <span v-for="c in selectedCandidates" :key="c.name" class="selected-chip" :style="{ background: c.color }">
                    {{ c.initials }} {{ c.name.split(' ')[0] }}
                    <button class="chip-remove" @click.stop="toggleCandidateSelection(c)">×</button>
                  </span>
                </div>
              </div>

              <div v-if="selectedCandidates.length > 0" class="ai-pitch-section">
                <div class="pitch-header">
                  <div class="pitch-title">
                    <span class="pitch-icon">✨</span>
                    <span>AI Pitch Generator</span>
                  </div>
                  <button
                    type="button"
                    class="btn-pitch-generate"
                    :disabled="pitchLoading"
                    @click="generatePitch"
                  >
                    <span v-if="pitchLoading" class="ai-loading">
                      <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
                    </span>
                    <span v-else>{{ generatedPitch ? '↻ Обновить' : '⚡ Сгенерировать Pitch' }}</span>
                  </button>
                </div>

                <div v-if="generatedPitch" class="pitch-content">
                  <div class="pitch-card">
                    <div class="pitch-section">
                      <span class="pitch-label">🎯 Проблема</span>
                      <p class="pitch-text">{{ generatedPitch.problem }}</p>
                    </div>
                    <div class="pitch-section">
                      <span class="pitch-label">💡 Решение</span>
                      <p class="pitch-text">{{ generatedPitch.solution }}</p>
                    </div>
                    <div class="pitch-section">
                      <span class="pitch-label">👥 Команда</span>
                      <p class="pitch-text">{{ generatedPitch.team }}</p>
                    </div>
                    <div class="pitch-section">
                      <span class="pitch-label">⚡ Преимущество</span>
                      <p class="pitch-text">{{ generatedPitch.advantage }}</p>
                    </div>
                    <div class="pitch-elevator">
                      <span class="pitch-label">🎤 Elevator Pitch</span>
                      <p class="pitch-elevator-text">{{ generatedPitch.elevator }}</p>
                    </div>
                  </div>
                  <div class="pitch-actions">
                    <button type="button" class="btn-copy" @click="copyPitch">
                      <span v-if="pitchCopied">✓ Скопировано!</span>
                      <span v-else>📋 Копировать текст</span>
                    </button>
                  </div>
                </div>

                <div v-else-if="!pitchLoading" class="pitch-hint">
                  Сгенерируйте готовый pitch для хакатона или инвесторов на основе выбранной команды
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer ai-footer">
            <button type="button" class="btn-outline" @click="closeAiTeamModal">Отмена</button>
            <button
              v-if="!aiTeamResults"
              type="button"
              class="btn-ai-primary"
              :disabled="!canSearchAiTeam"
              @click="searchAiTeam"
            >
              <span v-if="aiTeamLoading" class="ai-loading">
                <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
              </span>
              <span v-else>🔍 Подобрать команду</span>
            </button>
            <template v-else>
              <button type="button" class="btn-outline" @click="resetAiTeamSearch">← Новый поиск</button>
              <button
                type="button"
                class="btn-success"
                :disabled="selectedCandidates.length === 0"
                @click="inviteSelectedCandidates"
              >
                Пригласить {{ selectedCandidates.length }} чел. →
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-fade">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </transition>

    <div class="page-inner">
      <header class="page-header">
        <div>
          <div class="page-label">Команды и возможности</div>
          <h1 class="page-title">Найди команду</h1>
          <p class="page-sub">
            Хакатоны, стартапы и pet-проекты в одном месте — официальные события и слоты от студентов.
          </p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-primary btn-lg" @click="showCreateModal = true">+ Создать слот</button>
        </div>
      </header>

      <div class="tabs-row">
        <button
            v-for="tab in computedTabs"
            :key="tab.key"
            type="button"
            class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.key === 'incoming' && pendingIncomingCount > 0" class="tab-badge">
            {{ pendingIncomingCount }}
          </span>
        </button>
        <div class="tab-spacer" />
        <div class="search-bar">
          <AppIcon name="search" :size="15" />
          <input v-model="searchQuery" type="text" placeholder="Поиск..." />
        </div>
      </div>

      <section v-if="activeTab === 'my'" class="my-apps">
        <div v-if="!applications.length" class="empty-state">
          <div class="empty-icon"><AppIcon name="folder" :size="26" /></div>
          <div class="empty-title">Заявок пока нет</div>
          <p class="empty-sub">Участвуй в хакатонах или откликайся на слоты — всё появится здесь</p>
        </div>
        <article v-for="item in applications" :key="item.id" class="app-item">
          <span class="app-icon">{{ item.icon }}</span>
          <div class="app-info">
            <div class="app-name-row">
              <span class="app-name">{{ item.title }}</span>
              <span class="kind-badge" :class="item.kind">{{ item.kind === 'event' ? 'Событие' : 'Слот' }}</span>
              <span v-if="item.category" class="cat-badge" :class="item.category">{{ categoryLabel(item.category) }}</span>
            </div>
            <p class="app-role">Роль: {{ item.role }}</p>
            <p v-if="item.teamName" class="app-meta">Команда: {{ item.teamName }}</p>
          </div>
          <span class="app-status" :class="item.status">{{ item.statusLabel }}</span>
        </article>
      </section>

      <section v-else-if="activeTab === 'myslots'" class="feed-section">
        <div v-if="!createdSlots.length" class="empty-state">
          <div class="empty-icon"><AppIcon name="layers" :size="26" /></div>
          <div class="empty-title">Слотов пока нет</div>
          <p class="empty-sub">Создай командный слот — он появится здесь</p>
          <button type="button" class="btn-primary" style="margin-top:16px" @click="showCreateModal = true">+ Создать слот</button>
        </div>
        <div v-else class="cards-grid">
          <article v-for="slot in createdSlots" :key="slot.id" class="slot-card slot-card--mine">
            <div class="card-top">
              <span class="card-icon">{{ slot.icon }}</span>
              <div class="card-badges">
                <span class="my-slot-badge">✦ Мой слот</span>
                <span class="cat-badge" :class="slot.category">{{ slot.categoryLabel }}</span>
              </div>
            </div>
            <h3 class="card-name">{{ slot.name }}</h3>
            <p class="card-desc">{{ slot.desc }}</p>
            <p class="roles-label">Ищут в команду:</p>
            <div class="roles-row">
              <span v-for="r in slot.roles" :key="r" class="role-chip">+ {{ r }}</span>
            </div>
            <div class="card-tags">
              <span v-for="t in slot.tags" :key="t" class="card-tag">{{ t }}</span>
            </div>
            <div class="card-actions">
              <button type="button" class="btn-delete" @click="deleteSlot(slot)">Удалить слот</button>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="activeTab === 'incoming'" class="incoming-section">
        <div class="incoming-header">
          <div>
            <h2 class="section-heading" style="margin:0 0 4px">
              <AppIcon name="inbox" :size="18" />
              Входящие заявки
              <span class="section-count">{{ incomingApplications.length }}</span>
            </h2>
            <p class="incoming-sub">Люди, которые хотят вступить в твои проекты</p>
          </div>
          <div class="incoming-filters">
            <button
                v-for="f in incomingFilters"
                :key="f.key"
                type="button"
                class="filter-btn"
                :class="{ active: incomingFilter === f.key }"
                @click="incomingFilter = f.key"
            >{{ f.label }}</button>
          </div>
        </div>

        <div v-if="!filteredIncoming.length" class="empty-state">
          <div class="empty-icon"><AppIcon name="inbox" :size="26" /></div>
          <div class="empty-title">Пока заявок нет</div>
          <p class="empty-sub">Когда кто-то откликнется на твой проект — заявка появится здесь</p>
        </div>

        <div v-else class="incoming-list">
          <article v-for="app in filteredIncoming" :key="app.id" class="incoming-item">
            <div class="incoming-av" :style="{ background: app.applicantColor }">
              {{ app.applicantInitials }}
            </div>

            <div class="incoming-info">
              <div class="incoming-name-row">
                <span class="incoming-name">{{ app.applicantName }}</span>
                <span class="incoming-uni">{{ app.university }}</span>
                <span class="incoming-date">{{ app.createdAt }}</span>
              </div>
              <div class="incoming-meta">
                <span class="incoming-slot-pill">
                  <AppIcon name="layers" :size="11" />{{ app.slotName }}
                </span>
                <span class="incoming-role-pill">
                  <AppIcon name="user" :size="11" />{{ app.role }}
                </span>
              </div>
              <p v-if="app.message" class="incoming-message">{{ app.message }}</p>
              <div class="incoming-skills-preview">
                <span v-for="skill in app.skills.slice(0, 4)" :key="skill" class="skill-chip skill-chip--sm">{{ skill }}</span>
                <span v-if="app.skills.length > 4" class="skill-chip skill-chip--sm skill-chip--more">+{{ app.skills.length - 4 }}</span>
              </div>
            </div>

            <div class="incoming-actions">
              <span class="app-status" :class="app.status">{{ statusLabel(app.status) }}</span>
              <div v-if="app.status === 'pending'" class="action-btns">
                <button type="button" class="btn-skills" @click="openSkillsModal(app)">
                  <AppIcon name="star" :size="13" /> Навыки
                </button>
                <button type="button" class="btn-accept" @click="acceptApplication(app)">
                  <AppIcon name="check" :size="13" /> Принять
                </button>
                <button type="button" class="btn-reject" @click="rejectApplication(app)">
                  <AppIcon name="x" :size="13" />
                </button>
              </div>
              <div v-else class="action-btns">
                <button type="button" class="btn-skills" @click="openSkillsModal(app)">
                  <AppIcon name="eye" :size="13" /> Профиль
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <template v-else>
        <section v-if="hackathons.length && (activeTab === 'all' || activeTab === 'hackathon')" class="feed-section">
          <h2 class="section-heading">
            <AppIcon name="trophy" :size="18" />
            Хакатоны
            <span class="section-count">{{ hackathons.length }}</span>
          </h2>
          <div class="cards-grid">
            <article
                v-for="h in hackathons"
                :key="h.id"
                class="event-card"
            >
              <div class="card-top">
                <span class="card-icon">🏆</span>
                <div class="card-badges">
                  <span class="badge-format offline">Офлайн</span>
                  <span class="kind-badge event">Хакатон</span>
                </div>
              </div>
              <h3 class="card-name">{{ h.title }}</h3>
              <p class="card-desc">{{ h.description || 'Описание появится позже' }}</p>
              <div class="card-meta">
                <span><AppIcon name="calendar" :size="13" />{{ formatDateRange(h.start_date, h.end_date) }}</span>
                <span><AppIcon name="users" :size="13" />{{ h.max_teams }} команд</span>
              </div>
              <div class="card-actions">
                <button type="button" class="btn-primary action-main" @click="openHackathonModal(h)">
                  Участвовать →
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="filteredSlots.length" class="feed-section">
          <h2 class="section-heading">
            <AppIcon name="users" :size="18" />
            Слоты от студентов
            <span class="section-count">{{ filteredSlots.length }}</span>
          </h2>
          <div class="cards-grid">
            <article
                v-for="slot in filteredSlots"
                :key="slot.id"
                class="slot-card"
                :class="{ 'slot-card--hot': slot.hot }"
            >
              <div class="card-top">
                <span class="card-icon">{{ slot.icon }}</span>
                <div class="card-badges">
                  <span class="cat-badge" :class="slot.category">{{ slot.categoryLabel }}</span>
                  <span class="kind-badge slot">Слот</span>
                  <span v-if="slot.hot" class="badge-hot">Top</span>
                </div>
              </div>
              <h3 class="card-name">{{ slot.name }}</h3>
              <p class="card-desc">{{ slot.desc }}</p>
              <p class="roles-label">Ищут в команду:</p>
              <div class="roles-row">
                <span
                    v-for="r in slot.roles"
                    :key="r"
                    class="role-chip"
                    :class="{ filled: slot.filledRoles?.includes(r) }"
                >{{ slot.filledRoles?.includes(r) ? '✓' : '+' }} {{ r }}</span>
              </div>
              <div class="slot-team">
                <div class="team-avatars">
                  <div
                      v-for="m in slot.team"
                      :key="m.initials"
                      class="team-av"
                      :style="{ background: m.color }"
                  >{{ m.initials }}</div>
                </div>
                <span class="team-leader">{{ slot.leader.name }}</span>
              </div>
              <div class="card-meta">
                <span><AppIcon name="calendar" :size="13" />{{ slot.deadline }}</span>
                <span><AppIcon name="briefcase" :size="13" />{{ slot.stage }}</span>
              </div>
              <div class="card-tags">
                <span v-for="t in slot.tags" :key="t" class="card-tag">{{ t }}</span>
              </div>
              <div class="card-actions">
                <template v-if="isMyCreatedSlot(slot)">
                  <span class="my-slot-badge">✦ Мой слот</span>
                  <button type="button" class="btn-outline btn-delete" @click="deleteSlot(slot)">Удалить</button>
                </template>
                <template v-else>
                  <button type="button" class="btn-primary action-main" @click="openSlotApply(slot)">Откликнуться</button>
                  <button
                      type="button"
                      class="btn-icon"
                      :class="{ faved: favoritesArr.includes(slot.id) }"
                      @click="toggleFavorite(slot.id)"
                      :title="favoritesArr.includes(slot.id) ? 'В избранном' : 'В избранное'"
                  >
                    <AppIcon :name="favoritesArr.includes(slot.id) ? 'check' : 'bookmark'" :size="16" />
                  </button>
                </template>
              </div>
            </article>
          </div>
        </section>

        <div v-if="!filteredEvents.length && !filteredSlots.length && activeTab !== 'favorites'" class="empty-state">
          <div class="empty-icon"><AppIcon name="search" :size="26" /></div>
          <div class="empty-title">Ничего не найдено</div>
          <p class="empty-sub">Попробуй другой фильтр или поисковый запрос</p>
        </div>

        <section v-if="activeTab === 'favorites'" class="favorites-section">
          <div v-if="favoriteItems.events.length === 0 && favoriteItems.slots.length === 0" class="empty-state">
            <div class="empty-icon"><AppIcon name="bookmark" :size="26" /></div>
            <div class="empty-title">Избранное пусто</div>
            <p class="empty-sub">Нажми на закладку на любом событии или слоте — оно появится здесь</p>
          </div>

          <div v-if="favoriteItems.events.length" class="feed-section">
            <h2 class="section-heading">
              <AppIcon name="trophy" :size="18" />
              Хакатоны
              <span class="section-count">{{ favoriteItems.events.length }}</span>
            </h2>
            <div class="cards-grid">
              <article
                  v-for="event in favoriteItems.events"
                  :key="event.id"
                  class="event-card"
                  :class="{ 'event-card--hot': event.hot }"
              >
                <div class="card-top">
                  <span class="card-icon">{{ event.icon }}</span>
                  <div class="card-badges">
                    <span v-if="event.hot" class="badge-hot">Приоритет</span>
                    <span class="badge-format" :class="event.format">{{ event.formatLabel }}</span>
                    <span class="kind-badge event">Событие</span>
                  </div>
                </div>
                <h3 class="card-name">{{ event.name }}</h3>
                <p class="card-desc">{{ event.desc }}</p>
                <div class="card-meta">
                  <span><AppIcon name="calendar" :size="13" />{{ event.date }}</span>
                  <span><AppIcon name="wallet" :size="13" />{{ event.prize }}</span>
                  <span><AppIcon name="map-pin" :size="13" />{{ event.location }}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="btn-primary action-main" @click="openEventModal(event)">Участвовать</button>
                  <button
                      type="button"
                      class="btn-icon faved"
                      @click="toggleFavorite(event.id)"
                      title="Убрать из избранного"
                  >
                    <AppIcon name="check" :size="16" />
                  </button>
                </div>
              </article>
            </div>
          </div>

          <div v-if="favoriteItems.slots.length" class="feed-section">
            <h2 class="section-heading">
              <AppIcon name="users" :size="18" />
              Слоты
              <span class="section-count">{{ favoriteItems.slots.length }}</span>
            </h2>
            <div class="cards-grid">
              <article
                  v-for="slot in favoriteItems.slots"
                  :key="slot.id"
                  class="slot-card"
              >
                <div class="card-top">
                  <span class="card-icon">{{ slot.icon }}</span>
                  <div class="card-badges">
                    <span class="cat-badge" :class="slot.category">{{ slot.categoryLabel }}</span>
                    <span class="kind-badge slot">Слот</span>
                  </div>
                </div>
                <h3 class="card-name">{{ slot.name }}</h3>
                <p class="card-desc">{{ slot.desc }}</p>
                <p class="roles-label">Ищут в команду:</p>
                <div class="roles-row">
                  <span v-for="r in slot.roles" :key="r" class="role-chip">+ {{ r }}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="btn-primary action-main" @click="openSlotApply(slot)">Откликнуться</button>
                  <button
                      type="button"
                      class="btn-icon faved"
                      @click="toggleFavorite(slot.id)"
                      title="Убрать из избранного"
                  >
                    <AppIcon name="check" :size="16" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </template>
    </div>

    <div v-if="selectedHackathon" class="hk-overlay" @click.self="selectedHackathon = null">
      <div class="hk-modal">
        <button class="hk-close" @click="selectedHackathon = null">
          <AppIcon name="x" :size="22" />
        </button>

        <div class="hk-hero" :style="selectedHackathon.image_url ? `background-image:url(${selectedHackathon.image_url})` : ''">
          <div class="hk-hero-overlay"></div>
          <div class="hk-hero-content">
            <span class="hk-kind-badge">🏆 Хакатон</span>
            <h2 class="hk-title">{{ selectedHackathon.title }}</h2>
          </div>
        </div>

        <div class="hk-body">
          <div class="hk-info-grid">
            <div class="hk-info-item">
              <AppIcon name="calendar" :size="18" />
              <div>
                <span class="hk-info-label">Даты</span>
                <span class="hk-info-value">{{ formatDateRange(selectedHackathon.start_date, selectedHackathon.end_date) }}</span>
              </div>
            </div>
            <div class="hk-info-item" v-if="selectedHackathon.location">
              <AppIcon name="map-pin" :size="18" />
              <div>
                <span class="hk-info-label">Место</span>
                <span class="hk-info-value">{{ selectedHackathon.location }}</span>
              </div>
            </div>
            <div class="hk-info-item" v-if="selectedHackathon.prize_fund">
              <AppIcon name="trophy" :size="18" />
              <div>
                <span class="hk-info-label">Призовой фонд</span>
                <span class="hk-info-value hk-prize">{{ selectedHackathon.prize_fund }}</span>
              </div>
            </div>
            <div class="hk-info-item" v-if="selectedHackathon.team_size">
              <AppIcon name="users" :size="18" />
              <div>
                <span class="hk-info-label">Размер команды</span>
                <span class="hk-info-value">{{ selectedHackathon.team_size }} чел.</span>
              </div>
            </div>
            <div class="hk-info-item" v-if="selectedHackathon.difficulty_level">
              <AppIcon name="chart" :size="18" />
              <div>
                <span class="hk-info-label">Уровень</span>
                <span class="hk-info-value">{{ { beginner: 'Начинающий', intermediate: 'Средний', advanced: 'Продвинутый' }[selectedHackathon.difficulty_level] || selectedHackathon.difficulty_level }}</span>
              </div>
            </div>
            <div class="hk-info-item" v-if="selectedHackathon.max_teams">
              <AppIcon name="bookmark" :size="18" />
              <div>
                <span class="hk-info-label">Макс. команд</span>
                <span class="hk-info-value">{{ selectedHackathon.max_teams }}</span>
              </div>
            </div>
          </div>

          <div class="hk-desc" v-if="selectedHackathon.full_description || selectedHackathon.description">
            <h3>О хакатоне</h3>
            <p>{{ selectedHackathon.full_description || selectedHackathon.description }}</p>
          </div>

          <div class="hk-desc" v-if="selectedHackathon.requirements">
            <h3>Требования к участникам</h3>
            <p>{{ selectedHackathon.requirements }}</p>
          </div>

          <div class="hk-tech" v-if="selectedHackathon.technologies?.length">
            <h3>Технологии</h3>
            <div class="hk-tech-list">
              <span v-for="t in selectedHackathon.technologies" :key="t" class="hk-tech-tag">{{ t }}</span>
            </div>
          </div>

          <div v-if="hackathonRegistrations[selectedHackathon.id]" class="hk-reg-done">
            <AppIcon name="check-circle" :size="28" />
            <div>
              <div class="hk-reg-done-title">Заявка отправлена!</div>
              <div class="hk-reg-done-sub">Команда «{{ hackathonRegistrations[selectedHackathon.id].team_name }}» зарегистрирована. Ждите ответа организаторов.</div>
            </div>
          </div>

          <div v-else class="hk-reg-form">
            <div class="hk-reg-header">
              <AppIcon name="edit" :size="20" />
              <h3>Регистрация команды</h3>
            </div>

            <div v-if="hackathonRegSuccess" class="hk-reg-done">
              <AppIcon name="check-circle" :size="28" />
              <div>
                <div class="hk-reg-done-title">Заявка отправлена!</div>
                <div class="hk-reg-done-sub">Ждите ответа от организаторов хакатона.</div>
              </div>
            </div>

            <template v-else>
              <div class="hk-form-grid">
                <div class="hk-form-group hk-full">
                  <label>Название команды *</label>
                  <input v-model="hackathonRegForm.team_name" type="text" placeholder="Например: KBTU Stars" />
                </div>

                <div class="hk-form-group">
                  <label>Тимлид (ФИО) *</label>
                  <input v-model="hackathonRegForm.team_lead" type="text" placeholder="Иванов Иван Иванович" />
                </div>

                <div class="hk-form-group">
                  <label>Контакт тимлида *</label>
                  <input v-model="hackathonRegForm.contact" type="text" placeholder="Telegram: @username" />
                </div>

                <div class="hk-form-group hk-full">
                  <label>Участники команды</label>
                  <div class="hk-members-list">
                    <div v-for="(m, i) in hackathonRegForm.members" :key="i" class="hk-member-row">
                      <input v-model="m.name" type="text" placeholder="ФИО участника" class="hk-member-name" />
                      <select v-model="m.role" class="hk-member-role">
                        <option value="">Роль</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="fullstack">Fullstack</option>
                        <option value="mobile">Mobile</option>
                        <option value="ml">ML / AI</option>
                        <option value="design">Дизайнер</option>
                        <option value="pm">Project Manager</option>
                        <option value="analyst">Аналитик</option>
                        <option value="devops">DevOps</option>
                        <option value="other">Другое</option>
                      </select>
                      <button class="hk-remove-member" @click="hackathonRegForm.members.splice(i, 1)" v-if="hackathonRegForm.members.length > 1" type="button">
                        <AppIcon name="x" :size="14" />
                      </button>
                    </div>
                    <button class="hk-add-member" @click="hackathonRegForm.members.push({ name: '', role: '' })" type="button">
                      + Добавить участника
                    </button>
                  </div>
                </div>

                <div class="hk-form-group hk-full">
                  <label>Технологический стек</label>
                  <input v-model="hackathonRegForm.tech_stack" type="text" placeholder="Vue.js, Node.js, PostgreSQL, Docker..." />
                </div>

                <div class="hk-form-group hk-full">
                  <label>Идея / проект *</label>
                  <textarea v-model="hackathonRegForm.idea" rows="3" placeholder="Опишите вашу идею или проект, который планируете представить на хакатоне..."></textarea>
                </div>

                <div class="hk-form-group hk-full">
                  <label>Опыт команды</label>
                  <textarea v-model="hackathonRegForm.experience" rows="2" placeholder="Предыдущие хакатоны, проекты, достижения команды..."></textarea>
                </div>
              </div>

              <div v-if="hackathonRegError" class="hk-reg-error">{{ hackathonRegError }}</div>

              <div class="hk-reg-actions">
                <button class="hk-btn-cancel" @click="selectedHackathon = null" type="button">Отмена</button>
                <button
                  class="hk-btn-submit"
                  @click="submitHackathonReg"
                  :disabled="hackathonRegLoading || !hackathonRegForm.team_name || !hackathonRegForm.team_lead || !hackathonRegForm.contact || !hackathonRegForm.idea"
                  type="button"
                >
                  {{ hackathonRegLoading ? 'Отправка...' : '🚀 Подать заявку на хакатон' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import AppShell from '../components/AppShell.vue'
import { createInitials, loadAppState, patchAppState } from '../lib/appState'
import { buildFullName } from '../lib/universityProfile'
import { useAuthStore } from '../stores/auth.js'
import { createTeam as apiCreateTeam, getTeams, deleteTeam, createApplication, getTeamApplications, getOwnerApplications, getUserApplications, updateApplicationStatus } from '../api/index.js'
import { getHackathons } from '../api/admin.js'
import {
  CATEGORY_TABS,
  COMMUNITY_SLOTS,
  FEATURED_EVENT,
  OFFICIAL_EVENTS,
  ROLE_OPTIONS,
  THEME_TAGS,
} from '../lib/teamsCatalog'

const emptyEventForm = () => ({
  fullName: '',
  email: '',
  organization: '',
  role: '',
  teamName: '',
  teamSize: '',
  bio: '',
  idea: '',
})

const CATEGORY_LABELS = {
  hackathon: 'Хакатон',
  project: 'Проект',
  startup: 'Проект',
  pet: 'Проект',
  project: 'Проект',
}

const DEMO_INCOMING = [
  {
    id: 'inc-demo-1',
    slotId: null,
    slotName: 'AI-ассистент для студентов',
    slotCategory: 'startup',
    applicantName: 'Айгерим Жаксыбекова',
    applicantInitials: 'АЖ',
    applicantColor: 'linear-gradient(135deg,#7c3aed,#db2777)',
    role: 'Frontend Developer',
    message: 'Хочу применить свои навыки React и Vue в реальном проекте. Есть опыт работы с AI API.',
    skills: ['React', 'Vue.js', 'TypeScript', 'Figma', 'CSS', 'REST API'],
    university: 'КБТУ',
    github: 'https://github.com',
    portfolio: null,
    status: 'pending',
    createdAt: '18 май',
  },
  {
    id: 'inc-demo-2',
    slotId: null,
    slotName: 'AI-ассистент для студентов',
    slotCategory: 'startup',
    applicantName: 'Данияр Сейткали',
    applicantInitials: 'ДС',
    applicantColor: 'linear-gradient(135deg,#0891b2,#0d9488)',
    role: 'Backend Developer',
    message: 'Строю API на FastAPI и Node.js. Интересна тема EdTech.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
    university: 'Назарбаев Университет',
    github: 'https://github.com',
    portfolio: null,
    status: 'pending',
    createdAt: '17 май',
  },
  {
    id: 'inc-demo-3',
    slotId: null,
    slotName: 'Маркетплейс студенческих услуг',
    slotCategory: 'pet',
    applicantName: 'Зарина Ахметова',
    applicantInitials: 'ЗА',
    applicantColor: 'linear-gradient(135deg,#d97706,#dc2626)',
    role: 'Designer',
    message: 'UX/UI дизайнер, работала с несколькими стартапами. Дизайню в Figma.',
    skills: ['Figma', 'UX Research', 'Motion Design', 'Prototyping'],
    university: 'ВШЭ',
    github: null,
    portfolio: 'https://behance.net',
    status: 'accepted',
    createdAt: '14 май',
  },
]

export default {
  name: 'TeamsPage',
  components: { AppIcon, AppShell },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    const state = loadAppState()

    const savedIncoming = state.incomingApplications
    const incomingApplications = savedIncoming !== undefined
        ? savedIncoming
        : DEMO_INCOMING

    return {
      activeTab: 'all',
      searchQuery: '',
      themeTags: THEME_TAGS,
      roleOptions: ROLE_OPTIONS,
      officialEvents: OFFICIAL_EVENTS,
      featuredEvent: FEATURED_EVENT,
      communitySlots: [],
      hackathons: [],
      selectedHackathon: null,
      hackathonRegForm: {
        team_name: '',
        team_lead: '',
        members: [{ name: '', role: '' }],
        contact: '',
        tech_stack: '',
        idea: '',
        experience: '',
      },
      hackathonRegLoading: false,
      hackathonRegSuccess: false,
      hackathonRegError: '',
      hackathonRegistrations: {},
      loadingSlots: false,
      createdSlots: state.createdSlots || [],
      applications: state.teamApplications || [],
      incomingApplications,
      profile: state.profile,
      favoritesArr: state.favoritesArr || [],
      countdown: { days: 12, hours: 7, mins: 43 },

      incomingFilter: 'all',
      incomingFilters: [
        { key: 'all', label: 'Все' },
        { key: 'pending', label: 'Ожидают' },
        { key: 'accepted', label: 'Принятые' },
        { key: 'rejected', label: 'Отклонённые' },
      ],

      showCreateModal: false,
      showApplyModal: false,
      showEventModal: false,
      showSkillsModal: false,

      applyingTo: null,
      applyRole: '',
      applyMessage: '',
      selectedEvent: null,
      selectedIncomingApp: null,
      eventForm: emptyEventForm(),
      newSlot: { name: '', desc: '', tags: [], roles: [], category: 'project' },
      toastMessage: '',
      toastTimer: null,
      countdownTimer: null,
      searchDebounceTimer: null,

      showAiTeamModal: false,
      aiTeamQuery: '',
      selectedAiRoles: [],
      aiRoleOptions: ['Frontend Dev', 'Backend Dev', 'Project Manager', 'DevSecOps', 'AI Engineer'],
      aiTemplates: [
        { name: 'AI проект', icon: '🤖', query: 'Собираю команду для AI проекта на хакатон. Нужны AI Engineer и Frontend Dev со знанием Python и React.', roles: ['AI Engineer', 'Frontend Dev'] },
        { name: 'Web стартап', icon: '🚀', query: 'Делаю SaaS стартап. Ищу Fullstack разработчика и Project Manager.', roles: ['Frontend Dev', 'Backend Dev', 'Project Manager'] },
        { name: 'Secure App', icon: '🔒', query: 'Разрабатываю приложение с акцентом на безопасность. Нужны DevSecOps и Backend.', roles: ['DevSecOps', 'Backend Dev'] },
        { name: 'Full Team', icon: '👥', query: 'Собираю полноценную команду для стартапа: Frontend, Backend, PM, DevSecOps, AI Engineer.', roles: ['Frontend Dev', 'Backend Dev', 'Project Manager', 'DevSecOps', 'AI Engineer'] },
      ],
      aiTeamLoading: false,
      aiTeamResults: null,
      selectedCandidates: [],
      pitchLoading: false,
      generatedPitch: null,
      pitchCopied: false,
    }
  },
  computed: {
    isAdminOrOrg() {
      const accountType = this.profile?.accountType || 'student'
      return accountType === 'admin' || accountType === 'organization'
    },

    canSearchAiTeam() {
      return this.aiTeamQuery.trim().length > 10 || this.selectedAiRoles.length > 0
    },

    slotCategoryOptions() {
      const all = [
        { key: 'hackathon', label: 'Под хакатон' },
        { key: 'project', label: 'Проект' },
      ]
      return this.isAdminOrOrg ? all : all.filter(o => o.key !== 'hackathon')
    },

    computedTabs() {
      const base = [
        { key: 'all', label: 'Все' },
        { key: 'hackathon', label: 'Хакатоны' },
        { key: 'project', label: 'Проекты' },
        { key: 'my', label: 'Мои заявки' },
      ]
      if (this.favoritesArr.length > 0) {
        base.push({ key: 'favorites', label: '⭐ Избранное' })
      }
      if (this.createdSlots.length > 0) {
        base.push({ key: 'myslots', label: 'Мои слоты' })
      }
      if (this.createdSlots.length > 0) {
        base.push({ key: 'incoming', label: 'Входящие заявки' })
      }
      return base
    },

    favoriteItems() {
      const events = this.officialEvents.filter(e => this.favoritesArr.includes(e.id))
      const slots = this.allSlots.filter(s => this.favoritesArr.includes(s.id))
      return { events, slots }
    },

    pendingIncomingCount() {
      return this.incomingApplications.filter(a => a.status === 'pending').length
    },

    filteredIncoming() {
      if (this.incomingFilter === 'all') return this.incomingApplications
      return this.incomingApplications.filter(a => a.status === this.incomingFilter)
    },

    allSlots() {
      return [...this.communitySlots, ...this.createdSlots]
    },
    showFeatured() {
      return this.activeTab === 'all' || this.activeTab === 'hackathon'
    },
    filteredEvents() {
      if (this.activeTab === 'project' || this.activeTab === 'favorites') return []
      const q = this.searchQuery.trim().toLowerCase()
      return this.officialEvents.filter((e) => {
        if (q && !`${e.name} ${e.desc}`.toLowerCase().includes(q)) return false
        if (this.activeTab === 'hackathon') return true
        return true
      })
    },
    filteredSlots() {
      const q = this.searchQuery.trim().toLowerCase()
      if (this.activeTab === 'favorites') return []
      return this.allSlots.filter((s) => {
        if (q && !`${s.name} ${s.desc}`.toLowerCase().includes(q)) return false
        if (this.activeTab === 'all') return true
        if (this.activeTab === 'hackathon') return s.category === 'hackathon'
        if (this.activeTab === 'project') return ['project','startup','pet'].includes(s.category)
        return true
      })
    },
  },
  watch: {
    activeTab(newTab) {
      if (['all', 'hackathon', 'project'].includes(newTab)) {
        this.loadTeams()
      }
      if (newTab === 'incoming') {
        this.loadIncomingApplications()
      }
      if (newTab === 'my') {
        this.loadUserApplications()
      }
    },
    searchQuery() {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = setTimeout(() => {
        this.loadTeams()
      }, 300)
    }
  },
  async mounted() {
    const tab = this.$route.query.tab
    const validTabs = ['all','hackathon','project','my','favorites','myslots','incoming']
    if (tab && validTabs.includes(tab)) {
      this.activeTab = tab
    }
    
    await this.loadTeams()
    await this.loadIncomingApplications()
    await this.loadUserApplications()
    await this.loadHackathons()
    
    this.countdownTimer = setInterval(() => {
      if (this.countdown.mins > 0) {
        this.countdown.mins -= 1
        return
      }
      this.countdown.mins = 59
      if (this.countdown.hours > 0) {
        this.countdown.hours -= 1
        return
      }
      this.countdown.hours = 23
      if (this.countdown.days > 0) this.countdown.days -= 1
    }, 60000)
  },
  beforeUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
    if (this.toastTimer) clearTimeout(this.toastTimer)
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer)
  },
  methods: {
    async loadTeams() {
      this.loadingSlots = true
      try {
        let categoryFilter = ''
        if (this.activeTab === 'hackathon') categoryFilter = 'hackathon'
        else if (this.activeTab === 'project') categoryFilter = 'project'
        
        const apiTeams = await getTeams(this.searchQuery, categoryFilter)
        
        const teams = apiTeams.map(team => ({
          id: team.id,
          hot: true,
          category: team.category || 'project',
          categoryLabel: CATEGORY_LABELS[team.category] || 'Проект',
          name: team.name,
          desc: team.description || 'Описание пока не добавлено.',
          roles: ['Frontend Dev', 'Backend Dev'],
          filledRoles: [],
          team: [],
          tags: ['SaaS'],
          deadline: 'открыт',
          stage: 'Idea',
          leader: {
            initials: '??',
            name: 'Владелец',
            color: 'linear-gradient(135deg,#e63946,#1d4ed8)',
          },
        }))
        
        this.communitySlots = teams.length > 0 ? teams : COMMUNITY_SLOTS
        
        patchAppState({ teams: this.communitySlots })
      } catch (err) {
        console.error('Failed to load teams:', err)
        const state = loadAppState()
        this.communitySlots = state.teams || COMMUNITY_SLOTS
      } finally {
        this.loadingSlots = false
      }
    },

    isMyCreatedSlot(slot) {
      return this.createdSlots.some(s => s.id === slot.id)
    },

    async loadIncomingApplications() {
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId
        
        console.log('DEBUG loadIncomingApplications: userId =', userId)
        
        if (!userId) {
          console.log('DEBUG: No userId, skipping load')
          return
        }
        
        const apps = await getOwnerApplications(userId)
        console.log('DEBUG: owner applications =', apps)
        
        const allApplications = apps.map(app => ({
          id: app.id,
          applicantName: `${app.first_name} ${app.last_name}`,
          initials: createInitials(app.first_name, app.last_name),
          role: app.role,
          skills: app.interests || [],
          slotName: app.team_name,
          slotId: app.team_id,
          status: app.status,
          message: app.message,
        }))
        
        this.incomingApplications = allApplications
        patchAppState({ incomingApplications: allApplications })
      } catch (err) {
        console.error('Failed to load incoming applications:', err)
        const state = loadAppState()
        this.incomingApplications = state.incomingApplications || []
      }
    },

    async loadUserApplications() {
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId
        
        if (!userId) return
        
        const rows = await getUserApplications(userId)
        this.applications = rows.map(a => ({
          id: a.id,
          kind: 'slot',
          category: a.team_category || 'project',
          title: a.team_name || 'Команда',
          role: a.role || a.message || '—',
          status: a.status,
          statusLabel: { pending: 'На рассмотрении', accepted: 'Принята', rejected: 'Отклонена' }[a.status] || a.status,
          teamName: a.team_name,
        }))
      } catch (err) {
        console.error('Failed to load user applications:', err)
      }
    },

    async loadHackathons() {
      try {
        const hackathons = await getHackathons()
        this.hackathons = hackathons.filter(h => h.status === 'upcoming' || h.status === 'active')
        console.log('Loaded hackathons:', this.hackathons.length)
      } catch (err) {
        console.error('Failed to load hackathons:', err)
      }
    },

    async deleteSlot(slot) {
      try {
        await deleteTeam(slot.id)
        
        this.createdSlots = this.createdSlots.filter(s => s.id !== slot.id)
        this.communitySlots = this.communitySlots.filter(s => s.id !== slot.id)
        patchAppState({ createdSlots: this.createdSlots })
        
        this.showToast("Слот удалён")
      } catch (err) {
        console.error('Failed to delete slot:', err)
        this.showToast('Ошибка удаления: ' + err.message)
      }
    },
    categoryLabel(cat) {
      return CATEGORY_LABELS[cat] || cat
    },

    statusLabel(status) {
      const map = { pending: 'Ожидает', accepted: 'Принят', rejected: 'Отклонён' }
      return map[status] || status
    },

    toggleFavorite(id) {
      const idx = this.favoritesArr.indexOf(id)
      if (idx >= 0) {
        this.favoritesArr.splice(idx, 1)
      } else {
        this.favoritesArr.push(id)
      }
      patchAppState({ favoritesArr: this.favoritesArr })
    },
    toggleNewTag(t) {
      const i = this.newSlot.tags.indexOf(t)
      if (i >= 0) this.newSlot.tags.splice(i, 1)
      else this.newSlot.tags.push(t)
    },
    toggleNewRole(r) {
      const i = this.newSlot.roles.indexOf(r)
      if (i >= 0) this.newSlot.roles.splice(i, 1)
      else this.newSlot.roles.push(r)
    },

    async createSlot() {
      if (this.newSlot.category === 'hackathon' && !this.isAdminOrOrg) {
        this.showToast('Создание хакатонов доступно только для организаций')
        return
      }
      
      try {
        const authStore = useAuthStore()
        const teamData = {
          name: this.newSlot.name || 'Новый проект',
          description: this.newSlot.desc || 'Описание пока не добавлено.',
          category: this.newSlot.category,
          owner_id: authStore.userId
        }
        
        const apiTeam = await apiCreateTeam(teamData)
        
        const cat = this.slotCategoryOptions.find((o) => o.key === this.newSlot.category)
        const created = {
          id: apiTeam.id,
          hot: true,
          category: this.newSlot.category,
          categoryLabel: cat?.label || 'Слот',
          name: apiTeam.name,
          desc: apiTeam.description,
          roles: this.newSlot.roles.length ? [...this.newSlot.roles] : ['Frontend Dev'],
          filledRoles: [],
          team: [
            {
              initials: createInitials(this.profile.firstName, this.profile.lastName),
              color: 'linear-gradient(135deg,#e63946,#1d4ed8)',
            },
          ],
          tags: this.newSlot.tags.length ? [...this.newSlot.tags] : ['SaaS'],
          deadline: 'открыт',
          stage: 'Idea',
          leader: {
            initials: createInitials(this.profile.firstName, this.profile.lastName),
            name: buildFullName(this.profile.firstName, this.profile.lastName),
            color: 'linear-gradient(135deg,#e63946,#1d4ed8)',
          },
        }
        
        this.createdSlots.unshift(created)
        this.communitySlots.unshift(created)
        
        const state = loadAppState()
        const teams = state.teams || []
        teams.unshift(created)
        patchAppState({ createdSlots: this.createdSlots, teams })
        
        this.showCreateModal = false
        this.newSlot = { name: '', desc: '', tags: [], roles: [], category: 'project' }
        this.showToast('Команда создана ✓')
        this.activeTab = 'myslots'
      } catch (err) {
        console.error('Failed to create team:', err)
        this.showToast('Ошибка создания команды: ' + err.message)
      }
    },

    openSlotApply(slot) {
      this.applyingTo = slot
      this.applyRole = ''
      this.applyMessage = ''
      this.showApplyModal = true
    },

    async submitSlotApply() {
      if (!this.applyRole || !this.applyingTo) return
      
      try {
        const authStore = useAuthStore()
        const userId = authStore.userId
        
        console.log('DEBUG: Applying to team:', this.applyingTo.id)
        console.log('DEBUG: User ID:', userId)
        console.log('DEBUG: Role:', this.applyRole)
        console.log('DEBUG: Message:', this.applyMessage)
        
        if (!userId) {
          throw new Error('Пользователь не авторизован. Пожалуйста, войдите снова.')
        }
        
        const message = this.applyMessage || `Роль: ${this.applyRole}`
        const result = await createApplication(this.applyingTo.id, userId, message)
        console.log('DEBUG: Application created:', result)
        
        await this.loadUserApplications()
        this.showToast(`Отклик на «${this.applyingTo.name}» отправлен ✓`)
      } catch (err) {
        console.error('Failed to apply:', err)
        this.showToast('Ошибка отправки заявки: ' + err.message)
      }
      
      this.showApplyModal = false
    },

    // ======= Входящие заявки =======
    openSkillsModal(app) {
      this.selectedIncomingApp = app
      this.showSkillsModal = true
    },

    async acceptApplication(app) {
      try {
        await updateApplicationStatus(app.id, 'accepted')
        
        const idx = this.incomingApplications.findIndex(a => a.id === app.id)
        if (idx !== -1) {
          this.incomingApplications[idx] = { ...this.incomingApplications[idx], status: 'accepted' }
          this.incomingApplications = [...this.incomingApplications]
          patchAppState({ incomingApplications: this.incomingApplications })
        }
        
        this.showToast(`${app.applicantName} принят в команду ✓`)
      } catch (err) {
        console.error('Failed to accept application:', err)
        this.showToast('Ошибка принятия заявки: ' + err.message)
      }
    },

    async rejectApplication(app) {
      try {
        await updateApplicationStatus(app.id, 'rejected')
        
        const idx = this.incomingApplications.findIndex(a => a.id === app.id)
        if (idx !== -1) {
          this.incomingApplications[idx] = { ...this.incomingApplications[idx], status: 'rejected' }
          this.incomingApplications = [...this.incomingApplications]
          patchAppState({ incomingApplications: this.incomingApplications })
        }
        
        this.showToast(`Заявка ${app.applicantName} отклонена`)
      } catch (err) {
        console.error('Failed to reject application:', err)
        this.showToast('Ошибка отклонения заявки: ' + err.message)
      }
    },

    // ======= Хакатон =======
    openEventModal(event) {
      this.selectedEvent = event
      this.eventForm = {
        ...emptyEventForm(),
        fullName: this.profile.fullName,
        email: this.profile.email,
        organization: this.profile.education,
        bio: this.profile.about,
      }
      this.showEventModal = true
    },
    closeEventModal() {
      this.showEventModal = false
      this.selectedEvent = null
      this.eventForm = emptyEventForm()
    },
    submitEventApplication() {
      const entry = {
        id: `app-event-${Date.now()}`,
        kind: 'event',
        category: 'hackathon',
        title: this.selectedEvent?.name,
        icon: '🏆',
        role: this.eventForm.role || 'Участник',
        teamName: this.eventForm.teamName,
        status: 'pending',
        statusLabel: 'На рассмотрении',
        createdAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
      }
      this.applications = [entry, ...this.applications]
      patchAppState({ teamApplications: this.applications })
      this.showToast(`Заявка на «${this.selectedEvent?.name}» отправлена`)
      this.closeEventModal()
    },

    // ======= Хакатоны из API =======
    formatDateRange(start, end) {
      if (!start || !end) return 'Дата уточняется'
      const s = new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      const e = new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      return `${s} — ${e}`
    },
    async openHackathonModal(hackathon) {
      this.selectedHackathon = hackathon
      this.hackathonRegSuccess = false
      this.hackathonRegError = ''
      this.hackathonRegForm = {
        team_name: '',
        team_lead: '',
        members: [{ name: '', role: '' }],
        contact: '',
        tech_stack: '',
        idea: '',
        experience: '',
      }
      document.body.style.overflow = 'hidden'
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`/api/events/${hackathon.id}/my-registration`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.registered) {
          this.hackathonRegistrations = { ...this.hackathonRegistrations, [hackathon.id]: data.registration }
        }
      } catch (e) {}
    },
    async submitHackathonReg() {
      if (!this.selectedHackathon) return
      this.hackathonRegLoading = true
      this.hackathonRegError = ''
      try {
        const token = localStorage.getItem('accessToken')
        const payload = {
          team_name: this.hackathonRegForm.team_name,
          contact: this.hackathonRegForm.contact,
          message: JSON.stringify({
            team_lead: this.hackathonRegForm.team_lead,
            members: this.hackathonRegForm.members,
            tech_stack: this.hackathonRegForm.tech_stack,
            idea: this.hackathonRegForm.idea,
            experience: this.hackathonRegForm.experience,
          }),
          team_size: this.hackathonRegForm.members.length + 1,
        }
        const res = await fetch(`/api/events/${this.selectedHackathon.id}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Ошибка регистрации')
        this.hackathonRegistrations = { ...this.hackathonRegistrations, [this.selectedHackathon.id]: data.registration }
        this.hackathonRegSuccess = true
      } catch (err) {
        this.hackathonRegError = err.message
      } finally {
        this.hackathonRegLoading = false
      }
    },

    showToast(message) {
      this.toastMessage = message
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.toastMessage = ''
      }, 2600)
    },

    // ======= AI TEAM BUILDER =======
    openAiTeamBuilder() {
      this.showAiTeamModal = true
      this.aiTeamQuery = ''
      this.selectedAiRoles = []
      this.aiTeamResults = null
      this.selectedCandidates = []
    },
    closeAiTeamModal() {
      this.showAiTeamModal = false
    },
    toggleAiRole(role) {
      const idx = this.selectedAiRoles.indexOf(role)
      if (idx >= 0) {
        this.selectedAiRoles.splice(idx, 1)
      } else {
        this.selectedAiRoles.push(role)
      }
    },
    applyAiTemplate(template) {
      this.aiTeamQuery = template.query
      this.selectedAiRoles = [...template.roles]
    },
    async searchAiTeam() {
      if (!this.canSearchAiTeam) return
      this.aiTeamLoading = true

      try {
        const query = this.aiTeamQuery.toLowerCase()
        const selectedRoles = this.selectedAiRoles

        const mockCandidates = [
          { id: '1', first_name: 'Данияр', last_name: 'Куатов', role: 'Frontend Dev', interests: ['Vue', 'React', 'TypeScript'], about: 'Фронтенд разработчик с 2 годами опыта' },
          { id: '2', first_name: 'Елена', last_name: 'Смирнова', role: 'Backend Dev', interests: ['Python', 'Node.js', 'PostgreSQL'], about: 'Бэкенд разработчик' },
          { id: '3', first_name: 'Максим', last_name: 'Козлов', role: 'Designer', interests: ['Figma', 'UI/UX', 'Design'], about: 'UI/UX дизайнер' },
          { id: '4', first_name: 'Анна', last_name: 'Петрова', role: 'AI Engineer', interests: ['Python', 'ML', 'AI'], about: 'ML инженер' },
          { id: '5', first_name: 'Дмитрий', last_name: 'Иванов', role: 'DevOps', interests: ['Docker', 'Kubernetes', 'AWS'], about: 'DevOps инженер' },
        ]

        let candidates = mockCandidates
        if (selectedRoles.length > 0) {
          candidates = candidates.filter(c => selectedRoles.includes(c.role))
        }

        const formattedCandidates = candidates.map(p => {
          const fullName = `${p.first_name} ${p.last_name}`
          const initials = this.createInitials(p.first_name, p.last_name)
          const skills = p.interests.join(', ')
          
          let match = 70 + Math.floor(Math.random() * 20)
          if (p.interests.some(i => query.includes(i.toLowerCase()))) {
            match += 10
          }
          match = Math.min(98, Math.max(60, match))

          return {
            id: p.id,
            name: fullName,
            initials: initials,
            role: p.role,
            skills: skills,
            about: p.about,
            color: this.getProfileColor(p.role),
            match: match,
            reason: `Навыки: ${p.interests.slice(0, 2).join(', ')}`,
            profilePhoto: null,
            interests: p.interests,
          }
        })

        const sortedCandidates = formattedCandidates
          .sort((a, b) => b.match - a.match)
          .slice(0, 5)

        const avgMatch = sortedCandidates.length > 0
          ? Math.round(sortedCandidates.reduce((sum, c) => sum + c.match, 0) / sortedCandidates.length)
          : 0

        this.aiTeamResults = {
          teamFit: avgMatch,
          analysis: this.generateAiAnalysis(sortedCandidates, this.aiTeamQuery),
          candidates: sortedCandidates,
        }
        this.selectedCandidates = [...sortedCandidates]
      } catch (e) {
        console.error('AI Team search error:', e)
        this.showToast('Ошибка поиска: ' + e.message)
      } finally {
        this.aiTeamLoading = false
      }
    },

    getProfileColor(role) {
      const colors = {
        'Frontend Dev': 'linear-gradient(135deg,#059669,#1d4ed8)',
        'Backend Dev': 'linear-gradient(135deg,#e63946,#1d4ed8)',
        'Project Manager': 'linear-gradient(135deg,#7c3aed,#e63946)',
        'DevSecOps': 'linear-gradient(135deg,#059669,#06b6d4)',
        'AI Engineer': 'linear-gradient(135deg,#1d4ed8,#06b6d4)',
      }
      return colors[role] || 'linear-gradient(135deg,#e63946,#1d4ed8)'
    },

    createInitials(firstName, lastName) {
      const f = firstName?.[0] || ''
      const l = lastName?.[0] || ''
      return (f + l).toUpperCase() || '??'
    },
    generateAiAnalysis(candidates, query) {
      const roles = [...new Set(candidates.map(c => c.role))]
      if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('ml')) {
        return 'Отличная команда для AI проекта: ML инженер + Backend + Frontend'
      } else if (query.toLowerCase().includes('мобил') || query.toLowerCase().includes('app')) {
        return 'Сильный мобильный стек: Mobile Dev + Backend + Design'
      } else if (query.toLowerCase().includes('веб') || query.toLowerCase().includes('web') || query.toLowerCase().includes('saas')) {
        return 'Идеальный состав для Web/SaaS: Frontend + Backend + Design'
      }
      return `Сбалансированная команда: ${roles.slice(0, 3).join(', ')}`
    },
    getScoreClass(score) {
      if (score >= 85) return 'score-excellent'
      if (score >= 70) return 'score-good'
      return 'score-average'
    },
    toggleCandidateSelection(candidate) {
      const idx = this.selectedCandidates.findIndex(c => c.name === candidate.name)
      if (idx >= 0) {
        this.selectedCandidates.splice(idx, 1)
      } else {
        this.selectedCandidates.push(candidate)
      }
    },
    resetAiTeamSearch() {
      this.aiTeamResults = null
      this.selectedCandidates = []
      this.generatedPitch = null
    },

    async generatePitch() {
      if (this.selectedCandidates.length === 0) return

      this.pitchLoading = true

      try {
        await new Promise(r => setTimeout(r, 1200))

        const roles = [...new Set(this.selectedCandidates.map(c => c.role))]
        const roleNames = roles.join(', ')
        const query = this.aiTeamQuery.toLowerCase()

        let projectType = 'технологический проект'
        let problem = 'Студентам сложно быстро находить команду для хакатонов и стартапов'
        let solution = 'AI-платформа автоматически подбирает участников по навыкам'

        if (query.includes('edtech') || query.includes('образование')) {
          projectType = 'EdTech стартап'
          problem = 'Студенты тратят недели на поиск команды для учебных проектов'
          solution = 'AI анализирует навыки и мгновенно формирует сбалансированные команды'
        } else if (query.includes('health') || query.includes('здоров')) {
          projectType = 'HealthTech проект'
          problem = 'Сложность в разработке медицинских решений из-за разрозненной экспертизы'
          solution = 'Кросс-функциональная команда объединяет медицинские и технические знания'
        } else if (query.includes('ai') || query.includes('ml') || query.includes('искусственный интеллект')) {
          projectType = 'AI продукт'
          problem = 'AI-стартапы требуют редкого сочетания ML-инженеров и продактов'
          solution = 'Алгоритмы подбирают ML-разработчиков с совместимыми навыками'
        } else if (query.includes('мобил') || query.includes('app')) {
          projectType = 'мобильное приложение'
          problem = 'Мобильная разработка требует синергии дизайна, frontend и backend'
          solution = 'Команда mobile-разработчиков с полным циклом создания продукта'
        }

        const teamDesc = this.selectedCandidates.map(c => `${c.name} (${c.role})`).join(', ')

        this.generatedPitch = {
          problem: `${problem}. Каждый третий студент бросает хакатон из-за неподходящей команды.`,
          solution: `${solution}. Платформа анализирует 15+ параметров совместимости и формирует команды за 30 секунд.`,
          team: `Команда из ${this.selectedCandidates.length} специалистов: ${teamDesc}. ${roleNames} — оптимальный состав для ${projectType}.`,
          advantage: `Скорость подбора в 50 раз быстрее ручного поиска. Match-score 85%+ гарантирует совместимость команды.`,
          elevator: `Мы помогаем студентам собирать идеальные команды для хакатонов с помощью AI. Наша платформа анализирует навыки и подбирает совместимых тиммейтов за 30 секунд вместо недель поиска. С ${roleNames} вы готовы к победе! 🚀`,
        }
      } catch (e) {
        this.showToast('Ошибка генерации pitch: ' + e.message)
      } finally {
        this.pitchLoading = false
      }
    },

    async copyPitch() {
      if (!this.generatedPitch) return

      const text = `🎯 ${this.generatedPitch.problem}\n\n💡 ${this.generatedPitch.solution}\n\n👥 ${this.generatedPitch.team}\n\n⚡ ${this.generatedPitch.advantage}\n\n🎤 ${this.generatedPitch.elevator}`

      try {
        await navigator.clipboard.writeText(text)
        this.pitchCopied = true
        this.showToast('Pitch скопирован в буфер обмена!')
        setTimeout(() => {
          this.pitchCopied = false
        }, 2000)
      } catch (e) {
        this.showToast('Не удалось скопировать')
      }
    },

    inviteSelectedCandidates() {
      const names = this.selectedCandidates.map(c => c.name.split(' ')[0]).join(', ')
      this.showToast(`Приглашения отправлены: ${names}`)

      const groupName = `Команда ${this.aiTeamQuery.slice(0, 20)}...`
      this.showToast(`Создана группа "${groupName}"`)

      this.closeAiTeamModal()

      this.$router.push('/chat')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Onest:wght@400;500;600;700&display=swap');

.page-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; animation: blobFloat 8s ease-in-out infinite; }
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -150px; right: -100px; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: 100px; left: 100px; animation-delay: 3s; animation-direction: reverse; }
@keyframes blobFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px) scale(1.06)} }

.page-inner { position: relative; z-index: 1; padding: 40px 40px 60px; max-width: 1160px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; flex-wrap: wrap; }
.page-label { font-family: 'Unbounded', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-red); margin-bottom: 8px; }
.page-title { font-family: 'Unbounded', sans-serif; font-size: 32px; font-weight: 800; color: var(--c-white); margin: 0 0 6px; }
.page-sub { font-size: 14px; color: var(--c-muted); margin: 0; line-height: 1.6; max-width: 520px; }

/* Hint text in modal */
.hint-text { font-size: 12px; color: var(--c-muted); margin: 6px 0 0; padding: 8px 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); border-radius: 8px; }

/* Tabs */
.tabs-row { display: flex; align-items: center; gap: 4px; margin-bottom: 28px; border-bottom: 1px solid var(--c-border); flex-wrap: wrap; }
.tab { position: relative; padding: 10px 18px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; font-family: 'Onest', sans-serif; font-size: 14px; font-weight: 500; color: var(--c-muted); transition: color 0.2s, border-color 0.2s; }
.tab:hover { color: var(--c-text); }
.tab.active { color: var(--c-red); border-bottom-color: var(--c-red); }
.tab-spacer { flex: 1; min-width: 12px; }
.tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: var(--c-red); color: #fff; font-size: 10px; font-weight: 700; border-radius: 50%; margin-left: 6px; vertical-align: middle; }

.search-bar { display: flex; align-items: center; gap: 8px; background: var(--c-card); border: 1px solid var(--c-border); border-radius: 8px; padding: 8px 14px; margin-bottom: 8px; }
.search-bar input { background: none; border: none; outline: none; font-family: 'Onest', sans-serif; font-size: 13px; color: var(--c-text); width: 180px; }
.search-bar input::placeholder { color: var(--c-muted); }

.feed-section { margin-bottom: 36px; }
.section-heading { display: flex; align-items: center; gap: 10px; font-family: 'Unbounded', sans-serif; font-size: 16px; font-weight: 700; color: var(--c-white); margin: 0 0 20px; }
.section-count { font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 100px; background: var(--c-red-dim); color: var(--c-red); }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

.event-card, .slot-card {
  background: var(--c-card); border: 1px solid var(--c-border); border-radius: var(--r);
  padding: 24px; display: flex; flex-direction: column; gap: 12px;
  transition: border-color 0.2s, transform 0.2s;
}
.event-card:hover, .slot-card:hover { border-color: rgba(230,57,70,0.3); transform: translateY(-3px); }
.event-card--hot, .slot-card--hot { border-color: rgba(230,57,70,0.22); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.card-icon { font-size: 28px; }
.card-badges { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
.card-name { font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; color: var(--c-white); margin: 0; line-height: 1.35; }
.card-desc { font-size: 13px; line-height: 1.6; color: var(--c-muted); margin: 0; }
.card-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--c-text); }
.card-meta span { display: inline-flex; align-items: center; gap: 6px; }
.card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.card-tag { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(59,130,246,0.08); color: #93c5fd; border: 1px solid rgba(59,130,246,0.15); }

.kind-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.04em; }
.kind-badge.event { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
.kind-badge.slot { background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }

.cat-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; border: 1px solid; }
.cat-badge.hackathon { background: rgba(251,191,36,0.08); color: #fbbf24; border-color: rgba(251,191,36,0.2); }
.cat-badge.project { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.2); }
.cat-badge.startup { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.2); }
.cat-badge.pet { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.2); }
.favorites-section { display: flex; flex-direction: column; gap: 32px; }

.badge-hot { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; background: rgba(230,57,70,0.15); color: var(--c-red); border: 1px solid rgba(230,57,70,0.25); }
.badge-format { font-size: 11px; padding: 4px 10px; border-radius: 100px; border: 1px solid var(--c-border); color: var(--c-muted); }
.badge-format.online { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.2); }
.badge-format.offline { background: rgba(251,146,60,0.08); color: #fb923c; border-color: rgba(251,146,60,0.2); }

.progress-wrap { margin-top: auto; }
.progress-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); margin-bottom: 6px; }
.progress-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--c-red), #f97316); }

.roles-label { font-size: 11px; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }
.roles-row { display: flex; flex-wrap: wrap; gap: 6px; }
.role-chip { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: rgba(230,57,70,0.1); color: #f87171; border: 1px solid rgba(230,57,70,0.25); }
.role-chip.filled { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.2); }

.slot-team { display: flex; align-items: center; gap: 10px; }
.team-avatars { display: flex; }
.team-av { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; font-family: 'Unbounded', sans-serif; font-size: 9px; font-weight: 700; color: #fff; margin-right: -8px; border: 2px solid var(--c-card); }
.team-leader { font-size: 12px; color: var(--c-muted); margin-left: 12px; }

.card-actions { display: flex; gap: 10px; margin-top: 4px; }
.action-main { flex: 1; }

/* Featured */
.featured-banner {
  position: relative; overflow: hidden; display: flex; gap: 32px; align-items: center;
  background: var(--c-card); border: 1px solid rgba(230,57,70,0.25); border-radius: 20px;
  padding: 32px 36px; margin-bottom: 32px;
}
.featured-bg-blob { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%); top: -100px; right: -80px; pointer-events: none; }
.featured-content, .featured-visual { position: relative; z-index: 1; }
.featured-content { flex: 1; }
.featured-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #f87171; padding: 5px 14px; border-radius: 100px; background: rgba(230,57,70,0.12); border: 1px solid rgba(230,57,70,0.3); margin-bottom: 14px; }
.badge-dot { width: 6px; height: 6px; background: var(--c-red); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.featured-title { font-family: 'Unbounded', sans-serif; font-size: 22px; font-weight: 800; color: var(--c-white); margin: 0 0 10px; }
.featured-desc { font-size: 14px; color: var(--c-muted); line-height: 1.6; margin: 0 0 16px; }
.featured-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
.meta-item { font-size: 13px; color: var(--c-text); display: inline-flex; align-items: center; gap: 6px; }
.featured-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.countdown-block { padding: 18px 22px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); border-radius: 14px; text-align: center; }
.countdown-label { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
.countdown-nums { display: flex; align-items: center; gap: 4px; justify-content: center; }
.cd-unit { display: flex; flex-direction: column; align-items: center; }
.cd-num { font-family: 'Unbounded', sans-serif; font-size: 26px; font-weight: 800; color: var(--c-white); }
.cd-sub { font-size: 10px; color: var(--c-muted); }
.cd-sep { font-size: 22px; color: var(--c-red); margin-bottom: 14px; }

/* Мои заявки */
.my-apps { display: flex; flex-direction: column; gap: 12px; }
.app-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--c-card); border: 1px solid var(--c-border); border-radius: var(--r); }
.app-icon { font-size: 24px; }
.app-info { flex: 1; min-width: 0; }
.app-name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 4px; }
.app-name { font-size: 15px; font-weight: 600; color: var(--c-white); }
.app-role, .app-meta { font-size: 13px; color: var(--c-muted); margin: 0; }
.app-status { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; white-space: nowrap; }
.app-status.pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
.app-status.accepted { background: rgba(34,197,94,0.1); color: #4ade80; }
.app-status.rejected { background: rgba(255,255,255,0.05); color: var(--c-muted); }

/* ====== ВХОДЯЩИЕ ЗАЯВКИ ====== */
.incoming-section { display: flex; flex-direction: column; gap: 20px; }
.incoming-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.incoming-sub { font-size: 13px; color: var(--c-muted); margin: 0; }
.incoming-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-btn { font-family: 'Onest', sans-serif; font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 100px; border: 1px solid var(--c-border); background: transparent; color: var(--c-muted); cursor: pointer; transition: all 0.2s; }
.filter-btn:hover { color: var(--c-text); border-color: rgba(255,255,255,0.25); }
.filter-btn.active { background: var(--c-red-dim); color: var(--c-red); border-color: rgba(230,57,70,0.3); }

.incoming-list { display: flex; flex-direction: column; gap: 10px; }
.incoming-item {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 18px 20px; background: var(--c-card); border: 1px solid var(--c-border);
  border-radius: var(--r); transition: border-color 0.2s;
}
.incoming-item:hover { border-color: rgba(230,57,70,0.2); }

.incoming-av {
  width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.incoming-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.incoming-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.incoming-name { font-size: 15px; font-weight: 600; color: var(--c-white); }
.incoming-uni { font-size: 12px; color: var(--c-muted); }
.incoming-date { font-size: 12px; color: var(--c-muted); margin-left: auto; }
.incoming-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.incoming-slot-pill {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500;
  padding: 3px 10px; border-radius: 100px; background: rgba(59,130,246,0.08); color: #93c5fd;
  border: 1px solid rgba(59,130,246,0.15);
}
.incoming-role-pill {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500;
  padding: 3px 10px; border-radius: 100px; background: rgba(230,57,70,0.08); color: #f87171;
  border: 1px solid rgba(230,57,70,0.2);
}
.incoming-message { font-size: 13px; color: var(--c-text); line-height: 1.5; margin: 0; }
.incoming-skills-preview { display: flex; flex-wrap: wrap; gap: 5px; }

.incoming-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
.action-btns { display: flex; align-items: center; gap: 6px; }

/* Кнопки действий в входящих */
.btn-skills {
  display: inline-flex; align-items: center; gap: 5px; font-family: 'Onest', sans-serif;
  font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer;
  border: 1px solid var(--c-border); background: transparent; color: var(--c-muted);
  transition: all 0.2s;
}
.btn-skills:hover { color: var(--c-text); border-color: rgba(255,255,255,0.25); }

.btn-accept {
  display: inline-flex; align-items: center; gap: 5px; font-family: 'Onest', sans-serif;
  font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer;
  border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.1); color: #4ade80;
  transition: all 0.2s;
}
.btn-accept:hover { background: rgba(34,197,94,0.18); }

.btn-reject {
  display: inline-flex; align-items: center; justify-content: center; font-family: 'Onest', sans-serif;
  font-size: 12px; font-weight: 600; width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--c-muted);
  transition: all 0.2s;
}
.btn-reject:hover { border-color: rgba(230,57,70,0.3); color: #f87171; background: rgba(230,57,70,0.08); }

/* Chips */
.skill-chip { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 100px; background: rgba(255,255,255,0.05); color: var(--c-text); border: 1px solid var(--c-border); }
.skill-chip--sm { font-size: 10px; padding: 3px 8px; }
.skill-chip--more { color: var(--c-muted); }
.skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }

/* Modal: Applicant profile */
.applicant-profile { display: flex; align-items: center; gap: 14px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); border-radius: 12px; }
.applicant-av { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
.applicant-name { font-size: 16px; font-weight: 700; color: var(--c-white); margin-bottom: 6px; }
.applicant-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--c-muted); }
.applicant-meta span { display: inline-flex; align-items: center; gap: 5px; }
.applicant-message { font-size: 13px; color: var(--c-text); line-height: 1.6; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); border-radius: 10px; }
.incoming-slot-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.incoming-slot-label { font-size: 12px; color: var(--c-muted); }
.incoming-slot-name { font-size: 13px; font-weight: 600; color: var(--c-white); }

/* Links */
.links-row { display: flex; gap: 8px; }
.link-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--c-border); color: var(--c-muted); text-decoration: none; transition: all 0.2s; }
.link-chip:hover { color: var(--c-text); border-color: rgba(255,255,255,0.25); }

/* Modal buttons */
.btn-success {
  display: inline-flex; align-items: center; gap: 6px; font-family: 'Onest', sans-serif; font-weight: 600;
  cursor: pointer; font-size: 13px; padding: 10px 18px; border-radius: 8px; transition: all 0.2s;
  background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);
}
.btn-success:hover { background: rgba(34,197,94,0.2); }
.btn-danger {
  display: inline-flex; align-items: center; gap: 6px; font-family: 'Onest', sans-serif; font-weight: 600;
  cursor: pointer; font-size: 13px; padding: 10px 18px; border-radius: 8px; transition: all 0.2s;
  background: transparent; color: #f87171; border: 1px solid rgba(230,57,70,0.3);
}
.btn-danger:hover { background: rgba(230,57,70,0.1); }

/* Empty state */
.empty-state { text-align: center; padding: 48px 20px; }
.empty-icon { width: 52px; height: 52px; margin: 0 auto 12px; border-radius: 14px; display: grid; place-items: center; background: rgba(255,255,255,0.04); color: var(--c-muted); }
.empty-title { font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: var(--c-white); margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: var(--c-muted); margin: 0; }

/* Buttons */
.btn-primary, .btn-outline, .btn-icon {
  font-family: 'Onest', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; border-radius: 8px;
}
.btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--c-red); color: #fff; font-size: 13px; padding: 10px 18px; border: none; }
.btn-primary:hover { background: #c62d39; }
.btn-primary.btn-lg { font-size: 15px; padding: 13px 26px; }
.btn-outline { display: inline-flex; align-items: center; gap: 8px; color: var(--c-text); font-size: 14px; padding: 10px 18px; border: 1px solid rgba(255,255,255,0.15); background: transparent; }
.btn-outline:hover { border-color: rgba(255,255,255,0.35); }
.btn-icon { width: 40px; height: 40px; border: 1px solid var(--c-border); background: transparent; color: var(--c-muted); display: grid; place-items: center; }
.btn-icon.faved { color: #4ade80; border-color: rgba(74,222,128,0.25); }
.my-slot-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #fbbf24; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.25); padding: 6px 12px; border-radius: 8px; flex: 1; }
.btn-delete { font-size: 12px; padding: 7px 14px; color: #f87171; border-color: rgba(230,57,70,0.3); }
.btn-delete:hover { background: rgba(230,57,70,0.1); border-color: rgba(230,57,70,0.5); }

.my-slot-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #fbbf24; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.25); padding: 3px 10px; border-radius: 100px; }
.slot-card--mine { border-color: rgba(251,191,36,0.2); }
.btn-delete { display: inline-flex; align-items: center; gap: 6px; font-family: 'Onest', sans-serif; font-weight: 600; cursor: pointer; font-size: 13px; padding: 9px 16px; border-radius: 8px; transition: all 0.2s; background: transparent; color: #f87171; border: 1px solid rgba(230,57,70,0.3); }
.btn-delete:hover { background: rgba(230,57,70,0.1); border-color: rgba(230,57,70,0.5); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal { background: var(--c-card); border: 1px solid var(--c-border); border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow: auto; }
.modal--sm { max-width: 480px; }
.modal--wide { max-width: 720px; }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 26px; border-bottom: 1px solid var(--c-border); gap: 16px; }
.modal-label { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.modal-title { font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: var(--c-white); margin: 6px 0 0; }
.modal-close { background: none; border: none; color: var(--c-muted); font-size: 18px; cursor: pointer; }
.modal-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 18px 26px; border-top: 1px solid var(--c-border); }
.modal-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); border-radius: 12px; }
.summary-item { font-size: 13px; display: inline-flex; align-items: center; gap: 6px; color: var(--c-text); }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.form-group input, .form-group textarea, .form-group select {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px; padding: 10px 14px;
  font-family: 'Onest', sans-serif; font-size: 14px; color: var(--c-text); outline: none;
}
.form-group textarea { resize: vertical; min-height: 72px; }
.tag-select { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-option { font-size: 12px; padding: 5px 12px; border-radius: 100px; border: 1px solid var(--c-border); color: var(--c-muted); cursor: pointer; }
.tag-option.selected { background: var(--c-red-dim); color: var(--c-red); border-color: rgba(230,57,70,0.3); }
.role-option.selected { background: rgba(59,130,246,0.1); color: #93c5fd; border-color: rgba(59,130,246,0.3); }
.apply-target-name { font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; color: var(--c-white); }

/* Toast */
.toast {
  position: fixed; right: 24px; bottom: 24px; z-index: 220;
  background: #131a30; border: 1px solid rgba(230,57,70,0.24); color: var(--c-white);
  padding: 14px 18px; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.35);
}
.modal-fade-enter-active, .modal-fade-leave-active, .toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to, .toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .featured-banner { flex-direction: column; }
  .form-grid, .modal-summary { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
  .incoming-header { flex-direction: column; }
}
@media (max-width: 760px) {
  .page-inner { padding: 24px 16px 40px; }
  .cards-grid { grid-template-columns: 1fr; }
  .app-item { flex-direction: column; align-items: flex-start; }
  .incoming-item { flex-direction: column; }
  .incoming-actions { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
  .incoming-date { margin-left: 0; }
}

/* ===== AI TEAM BUILDER ===== */
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.btn-ai-team {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(124,58,237,0.1) 100%);
  border: 1px solid rgba(230,57,70,0.3);
  color: #f87171;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ai-team:hover {
  background: linear-gradient(135deg, rgba(230,57,70,0.25) 0%, rgba(124,58,237,0.15) 100%);
  border-color: rgba(230,57,70,0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(230,57,70,0.2);
}
.ai-icon { font-size: 16px; }

.ai-team-modal { max-width: 800px; }
.ai-header { display: flex; align-items: center; gap: 16px; }
.ai-icon-large {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(230,57,70,0.2), rgba(124,58,237,0.15));
  border: 1px solid rgba(230,57,70,0.3);
  display: grid; place-items: center;
  font-size: 28px;
  flex-shrink: 0;
}
.ai-subtitle { font-size: 13px; color: var(--c-muted); margin: 4px 0 0; }

.ai-input-section { display: flex; flex-direction: column; gap: 20px; }
.ai-textarea {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  color: var(--c-text);
  resize: vertical;
  min-height: 100px;
  outline: none;
  transition: border-color 0.2s;
}
.ai-textarea:focus { border-color: rgba(230,57,70,0.4); }
.ai-hint { font-size: 12px; color: var(--c-muted); margin: 6px 0 0; font-style: italic; }

.ai-templates { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.templates-label { font-size: 12px; color: var(--c-muted); }
.template-chip {
  font-family: 'Onest', sans-serif;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 100px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  cursor: pointer;
  transition: all 0.2s;
}
.template-chip:hover {
  background: rgba(230,57,70,0.1);
  border-color: rgba(230,57,70,0.3);
  color: #f87171;
}

.ai-role-select { margin-top: 4px; }

.ai-results { display: flex; flex-direction: column; gap: 20px; }
.ai-summary {
  background: linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(124,58,237,0.05) 100%);
  border: 1px solid rgba(230,57,70,0.2);
  border-radius: 16px;
  padding: 20px 24px;
}
.summary-score { display: flex; align-items: center; gap: 20px; }
.score-circle {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: conic-gradient(var(--c-red) calc(var(--score, 0) * 3.6deg), rgba(255,255,255,0.1) 0);
  position: relative;
}
.score-circle::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--c-card);
}
.score-value {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px; font-weight: 800; color: var(--c-white);
  position: relative; z-index: 1;
}
.score-label {
  font-size: 10px; color: var(--c-muted); text-transform: uppercase;
  position: relative; z-index: 1;
}
.score-excellent { --score: 90; color: #4ade80; }
.score-good { --score: 75; color: #fbbf24; }
.score-average { --score: 60; color: var(--c-red); }

.summary-text { flex: 1; }
.summary-title { font-family: 'Unbounded', sans-serif; font-size: 15px; font-weight: 700; color: var(--c-white); margin: 0 0 4px; }
.summary-subtitle { font-size: 13px; color: var(--c-muted); }

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.candidate-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.candidate-card:hover { border-color: rgba(230,57,70,0.3); transform: translateY(-2px); }
.candidate-selected {
  border-color: rgba(230,57,70,0.5);
  background: linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(124,58,237,0.05) 100%);
}

.cand-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.cand-avatar {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.cand-info { flex: 1; min-width: 0; }
.cand-name { font-size: 15px; font-weight: 700; color: var(--c-white); }
.cand-role { font-size: 12px; color: var(--c-muted); }
.cand-match {
  font-family: 'Unbounded', sans-serif;
  font-size: 14px; font-weight: 800;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  color: var(--c-muted);
}
.match-high { background: rgba(34,197,94,0.15) !important; color: #4ade80 !important; }
.match-medium { background: rgba(251,191,36,0.15) !important; color: #fbbf24 !important; }
.cand-check {
  position: absolute;
  top: 12px; right: 12px;
  width: 24px; height: 24px; border-radius: 6px;
  background: var(--c-red);
  color: #fff;
  display: grid; place-items: center;
  font-size: 12px; font-weight: 700;
}
.cand-about { font-size: 13px; color: var(--c-text); line-height: 1.5; margin-bottom: 10px; }
.cand-skills {
  font-size: 11px; color: var(--c-muted);
  padding: 6px 10px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  margin-bottom: 10px;
}
.cand-reason { font-size: 12px; color: #fbbf24; font-style: italic; }

.selected-team {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 20px;
}
.selected-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.selected-label { font-size: 13px; font-weight: 600; color: var(--c-muted); }
.selected-count { font-size: 12px; color: var(--c-red); font-weight: 700; }
.selected-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.selected-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: #fff;
  padding: 6px 12px;
  border-radius: 100px;
}
.chip-remove {
  background: none; border: none; color: rgba(255,255,255,0.7);
  font-size: 14px; cursor: pointer; padding: 0; width: 16px; height: 16px;
  display: grid; place-items: center;
}
.chip-remove:hover { color: #fff; }

.ai-footer { justify-content: space-between; }
.btn-ai-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #e63946 0%, #c62d39 100%);
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(230,57,70,0.35);
}
.btn-ai-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(230,57,70,0.45);
}
.btn-ai-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.ai-loading { display: flex; align-items: center; gap: 4px; }
.ai-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
  animation: aiBounce 1.4s ease-in-out infinite;
}
.ai-dot:nth-child(2) { animation-delay: 0.2s; }
.ai-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes aiBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.btn-success {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(34,197,94,0.35);
}
.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(34,197,94,0.45);
}
.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255,255,255,0.1);
  box-shadow: none;
}

/* ===== AI PITCH GENERATOR ===== */
.ai-pitch-section {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(230, 57, 70, 0.05) 100%);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
  padding: 20px 24px;
  margin-top: 8px;
}

.pitch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.pitch-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-white);
}

.pitch-icon {
  font-size: 20px;
}

.btn-pitch-generate {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(230, 57, 70, 0.15) 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #c084fc;
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pitch-generate:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(230, 57, 70, 0.2) 100%);
  border-color: rgba(168, 85, 247, 0.6);
  transform: translateY(-1px);
}

.btn-pitch-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pitch-hint {
  font-size: 13px;
  color: var(--c-muted);
  text-align: center;
  padding: 16px;
  font-style: italic;
}

.pitch-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pitch-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pitch-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pitch-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-red);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pitch-text {
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.6;
  margin: 0;
}

.pitch-elevator {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%);
  border: 1px solid rgba(230, 57, 70, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 4px;
}

.pitch-elevator .pitch-label {
  color: #fbbf24;
}

.pitch-elevator-text {
  font-size: 15px;
  color: var(--c-white);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.pitch-actions {
  display: flex;
  justify-content: center;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

@media (max-width: 600px) {
  .ai-pitch-section {
    padding: 16px;
  }

  .pitch-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .pitch-title {
    font-size: 14px;
  }
}

/* ===== HACKATHON MODAL ===== */
.hk-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.hk-modal {
  background: #0f1629;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.hk-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.hk-close:hover { background: var(--c-red); }

.hk-hero {
  height: 180px;
  background: linear-gradient(135deg, #e63946 0%, #7c3aed 100%);
  background-size: cover;
  background-position: center;
  border-radius: 24px 24px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
}
.hk-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15,22,41,0.9) 0%, transparent 60%);
  border-radius: 24px 24px 0 0;
}
.hk-hero-content {
  position: relative;
  z-index: 1;
  padding: 24px 28px;
  width: 100%;
}
.hk-kind-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fbbf24;
  margin-bottom: 8px;
}
.hk-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.hk-body {
  padding: 28px;
}

.hk-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
.hk-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.6);
}
.hk-info-item > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.hk-info-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
}
.hk-info-value {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.hk-prize { color: #fbbf24 !important; }

.hk-desc, .hk-tech {
  margin-bottom: 20px;
}
.hk-desc h3, .hk-tech h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-red);
  margin: 0 0 10px;
}
.hk-desc p {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255,255,255,0.75);
  margin: 0;
}
.hk-tech-list { display: flex; flex-wrap: wrap; gap: 8px; }
.hk-tech-tag {
  padding: 5px 12px;
  background: rgba(230,57,70,0.12);
  color: #e63946;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Registration form */
.hk-reg-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.hk-reg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--c-red);
}
.hk-reg-header h3 {
  font-family: 'Unbounded', sans-serif;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.hk-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.hk-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hk-form-group.hk-full { grid-column: 1 / -1; }
.hk-form-group label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.hk-form-group input,
.hk-form-group textarea,
.hk-form-group select {
  padding: 11px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-family: 'Onest', sans-serif;
  transition: border-color 0.2s;
}
.hk-form-group input:focus,
.hk-form-group textarea:focus,
.hk-form-group select:focus { outline: none; border-color: var(--c-red); }
.hk-form-group input::placeholder,
.hk-form-group textarea::placeholder { color: rgba(255,255,255,0.25); }
.hk-form-group textarea { resize: vertical; min-height: 80px; }
.hk-form-group select option { background: #0f1629; }

/* Members list */
.hk-members-list { display: flex; flex-direction: column; gap: 8px; }
.hk-member-row {
  display: grid;
  grid-template-columns: 1fr 180px 32px;
  gap: 8px;
  align-items: center;
}
.hk-member-name, .hk-member-role {
  padding: 10px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  font-family: 'Onest', sans-serif;
}
.hk-member-name:focus, .hk-member-role:focus { outline: none; border-color: var(--c-red); }
.hk-member-name::placeholder { color: rgba(255,255,255,0.25); }
.hk-member-role option { background: #0f1629; }
.hk-remove-member {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(230,57,70,0.15);
  color: var(--c-red);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.hk-remove-member:hover { background: rgba(230,57,70,0.3); }
.hk-add-member {
  align-self: flex-start;
  padding: 8px 14px;
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-family: 'Onest', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.hk-add-member:hover { border-color: var(--c-red); color: var(--c-red); }

.hk-reg-error {
  margin-top: 14px;
  padding: 12px 16px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.3);
  border-radius: 10px;
  color: var(--c-red);
  font-size: 14px;
}

.hk-reg-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.hk-btn-cancel {
  padding: 12px 20px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 14px; font-weight: 600;
  font-family: 'Onest', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.hk-btn-cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }
.hk-btn-submit {
  flex: 1;
  padding: 13px 20px;
  background: linear-gradient(135deg, #e63946 0%, #c62d39 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 15px; font-weight: 700;
  font-family: 'Onest', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(230,57,70,0.3);
}
.hk-btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(230,57,70,0.45);
}
.hk-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

.hk-reg-done {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  background: rgba(5,150,105,0.1);
  border: 1px solid rgba(5,150,105,0.3);
  border-radius: 14px;
  color: #34d399;
}
.hk-reg-done-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.hk-reg-done-sub { font-size: 13px; color: rgba(255,255,255,0.55); }

@media (max-width: 640px) {
  .hk-info-grid { grid-template-columns: 1fr 1fr; }
  .hk-form-grid { grid-template-columns: 1fr; }
  .hk-member-row { grid-template-columns: 1fr 140px 32px; }
}

</style>