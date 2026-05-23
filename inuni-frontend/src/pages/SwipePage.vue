<template>
  <AppShell>

    
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="grid-overlay"></div>
    </div>

        <transition name="match-pop">
      <div v-if="showIncomingModal && incomingModalUser" class="ipv-overlay" @click.self="showIncomingModal = false">
        <div class="ipv-card" @click.stop>

                    <button class="ipv-close" @click="showIncomingModal = false">✕</button>

                    <div class="ipv-avatar-ring"
            :style="ipvAllPhotos(incomingModalUser).length ? { cursor: 'zoom-in' } : {}"
            @click="ipvAllPhotos(incomingModalUser).length && openLightboxWithList(ipvAllPhotos(incomingModalUser), ipvPhotoIdx)">
            <div class="ipv-avatar-circle"
              :style="incomingModalUser.profilePhoto
                ? { backgroundImage: `url(${incomingModalUser.profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: incomingModalUser.color }">
              <span v-if="!incomingModalUser.profilePhoto" class="ipv-av-initials">{{ incomingModalUser.initials }}</span>
            </div>
          </div>

                    <h2 class="ipv-name">{{ incomingModalUser.name }}</h2>
          <div class="ipv-badges-row">
            <span class="ipv-role-badge">{{ incomingModalUser.role }}</span>
            <span class="ipv-rank-badge" v-if="incomingModalUser.rankLevel">
              <span class="ipv-rank-emoji">{{ incomingModalUser.rankEmoji }}</span>
              <span class="ipv-rank-name">{{ incomingModalUser.rankName }}</span>
            </span>
          </div>

                    <div class="ipv-section">
            <p class="ipv-bio">{{ incomingModalUser.bio || '' }}</p>
          </div>

                    <div class="ipv-section ipv-interests-block">
            <div class="ipv-section-title">Интересы и стек</div>
            <div class="ipv-chips" v-if="incomingModalUser.interests?.length">
              <span v-for="i in incomingModalUser.interests" :key="i" class="ipv-chip">{{ i }}</span>
            </div>
          </div>

        </div>

                <div class="ipv-btns">
          <button class="ipv-btn ipv-btn--skip" @click="rejectIncoming(incomingModalUser)" title="Отклонить">
            <AppIcon name="x" :size="20" />
          </button>
          <button class="ipv-btn ipv-btn--super" @click="showIncomingModal = false" title="Позже">
            <AppIcon name="star" :size="20" />
          </button>
          <button class="ipv-btn ipv-btn--like" @click="acceptIncoming(incomingModalUser)" title="Принять">
            <AppIcon name="heart" :size="20" />
          </button>
        </div>

      </div>
    </transition>

    
    <transition name="match-pop">
      <div v-if="lightboxUrl" class="sc-lightbox-overlay" @click.self="lightboxUrl = null">
        <button class="lb-close" @click="lightboxUrl = null">✕</button>
        <button v-if="lightboxPhotos.length > 1" class="lb-arrow lb-arrow--prev" @click="lightboxPrev">‹</button>
        <img :src="lightboxUrl" class="sc-lightbox-img" />
        <button v-if="lightboxPhotos.length > 1" class="lb-arrow lb-arrow--next" @click="lightboxNext">›</button>
        <div v-if="lightboxPhotos.length > 1" class="lb-counter">{{ lightboxIdx + 1 }} / {{ lightboxPhotos.length }}</div>
      </div>
    </transition>

    
    <transition name="match-pop">
      <div v-if="showMatch" class="match-overlay" @click="dismissMatch">
        <div class="match-modal" @click.stop>
          <div class="match-bg-blob"></div>
          <div class="match-emoji">🎉</div>
          <div class="match-title">Это мэтч!</div>
          <div class="match-sub">Вы и <strong>{{ matchedUser }}</strong> понравились друг другу</div>
          <div class="match-avatars">
            <div class="ma ma-you" :style="myAvatarStyle">
              <img v-if="myProfilePhoto" :src="myProfilePhoto" alt="" class="ma-img" />
              <span v-else>{{ myInitials }}</span>
            </div>
            <div class="ma-heart">❤️</div>
            <div class="ma ma-them" :style="matchedCardData?.profilePhoto ? { backgroundImage: `url(${matchedCardData.profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
              <span v-if="!matchedCardData?.profilePhoto">{{ matchedCardData?.initials || matchedUser?.substring(0,2).toUpperCase() }}</span>
            </div>
          </div>
          <div class="match-actions">
            <button class="btn-primary btn-lg" @click="openMatchChat()">Написать сообщение</button>
            <button class="btn-outline" @click="$router.push('/profile/' + matchedCardData?.id); dismissMatch()">Открыть профиль</button>
            <button class="btn-ghost" @click="dismissMatch">Продолжить</button>
          </div>
        </div>
      </div>
    </transition>

    <div class="page-inner">
      <div class="swipe-layout">

                <div class="swipe-area">
          <div class="swipe-header">
            <div>
              <div class="page-label">Нетворкинг</div>
              <h1 class="page-title">Знакомства</h1>
            </div>
            <div class="swipe-counter">
              <span class="counter-num">{{ cards.length }}</span>
              <span class="counter-label">в очереди</span>
            </div>
          </div>

          
          <div class="empty-state" v-if="loadingCards">
            <div class="empty-icon">⏳</div>
            <div class="empty-title">Загрузка...</div>
          </div>

          
          <div class="card-stack" v-else-if="cards.length > 0">
                        <div class="swipe-card swipe-card--back2" v-if="cards[2]">
              <div class="sc-avatar">{{ cards[2].initials }}</div>
            </div>
            <div class="swipe-card swipe-card--back1" v-if="cards[1]">
              <div class="sc-avatar">{{ cards[1].initials }}</div>
            </div>

                        <div
                class="swipe-card swipe-card--main"
                :class="{ 'swiping-left': swipeDir === 'left', 'swiping-right': swipeDir === 'right' }"
                :style="dragStyle"
                @mousedown="startDrag"
                @touchstart="startDragTouch"
            >
                            <div class="swipe-hint like" :class="{ show: dragX > 40 }">ЛАЙК ❤️</div>
              <div class="swipe-hint skip" :class="{ show: dragX < -40 }">ПРОПУСК 👋</div>

              <div class="sc-hero">
                <div class="sc-photo-ring">
                                    <div class="sc-photos-wrap">
                    <div
                      class="sc-photo-circle"
                      :class="{ 'sc-photo-circle--fallback': !allCardPhotos(currentCard).length }"
                      :style="currentCardPhotoStyle"
                      @click.stop="openCardLightbox(currentCard, currentPhotoIdx)"
                    >
                      <span v-if="!allCardPhotos(currentCard).length" class="sc-photo-initials">{{ currentCard.initials }}</span>
                    </div>
                                        <div v-if="allCardPhotos(currentCard).length > 1" class="sc-photo-dots">
                      <span
                        v-for="(p, i) in allCardPhotos(currentCard)"
                        :key="i"
                        class="sc-dot"
                        :class="{ active: i === currentPhotoIdx }"
                        @click.stop="currentPhotoIdx = i"
                      ></span>
                    </div>
                                        <button v-if="allCardPhotos(currentCard).length > 1 && currentPhotoIdx > 0"
                      class="sc-photo-arrow sc-photo-arrow--prev"
                      @click.stop="currentPhotoIdx--">‹</button>
                    <button v-if="allCardPhotos(currentCard).length > 1 && currentPhotoIdx < allCardPhotos(currentCard).length - 1"
                      class="sc-photo-arrow sc-photo-arrow--next"
                      @click.stop="currentPhotoIdx++">›</button>
                  </div>
                </div>
                <div class="sc-top sc-top--below">
                  <div class="sc-identity">
                    <div class="sc-name-row">
                      <h2 class="sc-name">{{ currentCard.name }}</h2>
                      <span class="sc-rank-emoji" :title="'Уровень ' + currentCard.rankLevel">{{ currentCard.rankEmoji }}</span>
                    </div>
                    <div class="sc-role-badge">{{ currentCard.role }}</div>
                  </div>
                </div>
              </div>

              <div class="sc-content">
                <div class="sc-bio-block">
                  <p class="sc-bio">{{ currentCard.bio }}</p>
                  <div class="sc-meta" v-if="currentCard.interests && currentCard.interests.length">
                    <span v-for="t in currentCard.interests.slice(0,3)" :key="t" class="sc-meta-item">{{ t }}</span>
                  </div>
                </div>

                <div class="sc-interests-panel">
                  <div class="interests-title">Интересы и стек</div>
                  <div class="sc-interests">
                    <span v-for="i in currentCard.interests" :key="i" class="sc-interest">{{ i }}</span>
                  </div>
                  <div class="sc-tags">
                    <span v-for="t in currentCard.stack" :key="t" class="sc-tag">{{ t }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div class="empty-state" v-else-if="!loadingCards">
            <div class="empty-icon"><AppIcon name="sparkles" :size="26" /></div>
            <div class="empty-title" v-if="allLoadedCards.length === 0">Пока никого нет</div>
            <div class="empty-sub" v-if="allLoadedCards.length === 0">Зарегистрируй друзей — и они появятся здесь</div>
            <div class="empty-title" v-else>Все просмотрены!</div>
            <div class="empty-sub" v-if="allLoadedCards.length > 0">Начни заново или возвращайся позже</div>
            <button class="btn-primary" @click="resetCards" v-if="allLoadedCards.length > 0">Начать заново</button>
          </div>

          
          <div class="swipe-btns" v-if="cards.length > 0">
            <button class="swipe-btn swipe-btn--skip" @click="skip" title="Пропустить">
              <AppIcon name="x" :size="18" />
            </button>
            <button class="swipe-btn swipe-btn--profile" @click="$router.push('/profile/' + currentCard.id)" title="Открыть профиль">
              <AppIcon name="user" :size="18" />
            </button>
            <button class="swipe-btn swipe-btn--super" @click="super_like" title="Супер-лайк">
              <AppIcon name="star" :size="18" />
            </button>
            <button class="swipe-btn swipe-btn--like" @click="like" title="Лайк">
              <AppIcon name="heart" :size="18" />
            </button>
          </div>

          
          <div class="drag-hint">← свайп для пропуска · свайп для лайка →</div>
        </div>

                <div class="info-panel">

          
          <div class="panel-section">
            <div class="panel-title">Фильтры</div>
            <div class="filter-group">
              <div class="filter-label">Роль</div>
              <div class="filter-chips">
                  <span
                      v-for="r in roleFilters"
                      :key="r"
                      class="filter-chip"
                      :class="{ active: activeRoles.includes(r) }"
                      @click="toggleRole(r)"
                  >{{ r }}</span>
              </div>
            </div>
            <div class="filter-group">
              <div class="filter-label">Интересы</div>
              <div class="filter-chips">
                  <span
                      v-for="i in interestFilters"
                      :key="i"
                      class="filter-chip"
                      :class="{ active: activeInterests.includes(i) }"
                      @click="toggleInterest(i)"
                  >{{ i }}</span>
              </div>
            </div>
          </div>

          
          <div class="panel-section">
            <div class="panel-title">
              Входящие запросы
              <span class="match-count" style="background:#e63946">{{ incomingRequests.length }}</span>
            </div>
            <div class="matches-list">
              <div v-for="req in incomingRequests" :key="req.id" class="match-item">
                <div class="match-avatar" :style="{ background: req.color }" style="cursor:pointer" @click="$router.push('/profile/' + req.id)">
                  <img v-if="req.profilePhoto" :src="req.profilePhoto" class="req-avatar-img" alt="" />
                  <span v-else>{{ req.initials }}</span>
                </div>
                <div class="match-info" style="cursor:pointer" @click="$router.push('/profile/' + req.id)">
                  <div class="match-name">{{ req.name }}</div>
                  <div class="match-role">{{ req.role }}</div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0">
                  <button class="match-msg-btn" title="Посмотреть карточку" @click="openIncomingModal(req)">
                    <AppIcon name="eye" :size="14" />
                  </button>
                  <button class="req-btn-x" title="Отклонить" @click="rejectIncoming(req)">
                    <AppIcon name="x" :size="14" />
                  </button>
                </div>
              </div>
              <div v-if="incomingRequests.length === 0" class="no-matches">
                Пока никто не лайкнул тебя
              </div>
            </div>
          </div>

          
          <div class="panel-section">
            <div class="panel-title">Мэтчи <span class="match-count">{{ matches.length }}</span></div>
            <div class="matches-list">
              <div v-for="m in matches" :key="m.name" class="match-item">
                <div class="match-avatar" :style="{ background: m.color }" style="cursor:pointer" @click="$router.push('/profile/' + m.id)">
                  <img v-if="m.profilePhoto" :src="m.profilePhoto" class="req-avatar-img" alt="" />
                  <span v-else>{{ m.initials }}</span>
                </div>
                <div class="match-info" style="cursor:pointer" @click="$router.push('/profile/' + m.id)">
                  <div class="match-name">{{ m.name }}</div>
                  <div class="match-role">{{ m.role }}</div>
                </div>
                <button class="match-msg-btn" title="Написать сообщение" @click="openMatchChat(m)">
                  <AppIcon name="chat" :size="14" />
                </button>
              </div>
              <div v-if="matches.length === 0" class="no-matches">
                Свайпай вправо — мэтчи появятся здесь
              </div>
            </div>
          </div>

          
          <div class="panel-section stats-section">
            <div class="panel-title">Твоя активность</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-num">{{ totalLikes }}</div>
                <div class="stat-label">лайков</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ matches.length }}</div>
                <div class="stat-label">мэтчей</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ totalSkips }}</div>
                <div class="stat-label">пропусков</div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-title">Твой профиль в знакомствах</div>
            <div class="profile-readiness">
              <div class="readiness-line">
                <span>Фото профиля</span>
                <strong>{{ userHasProfilePhoto ? "Да" : "Нет" }}</strong>
              </div>
              <div class="readiness-line">
                <span>Интересов</span>
                <strong>{{ currentUserProfile.interests.length }}</strong>
              </div>
              <div class="readiness-note">Загрузи фото в профиле — оно будет видно в знакомствах. Добавь минимум 3 навыка.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import AppShell from '../components/AppShell.vue'
import { createInitials, loadAppState } from '../lib/appState'
import { useAuthStore } from '../stores/auth.js'

const CARD_COLORS = [
  'linear-gradient(135deg,#e63946,#1d4ed8)',
  'linear-gradient(135deg,#7c3aed,#e63946)',
  'linear-gradient(135deg,#1d4ed8,#06b6d4)',
  'linear-gradient(135deg,#f97316,#e63946)',
  'linear-gradient(135deg,#059669,#1d4ed8)',
  'linear-gradient(135deg,#0891b2,#7c3aed)',
]

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://backend-production-431c.up.railway.app' : 'http://localhost:8080')

const RANK_EMOJIS = ['🌱','🔍','⭐','⚡','👑']
const RANK_NAMES = ['Новичок','Искатель','Звезда','Мастер','Легенда']

export default {
  name: 'SwipePage',
  components: {
    AppIcon,
    AppShell,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    const state = loadAppState()
    return {
      cards: [],
      allLoadedCards: [],
      loadingCards: true,
      dismissed: [],
      matches: [],
      incomingRequests: [],
      showIncomingModal: false,
      incomingModalUser: null,
      lightboxUrl: null,
      lightboxPhotos: [],
      lightboxIdx: 0,
      currentPhotoIdx: 0,
      ipvPhotoIdx: 0,
      currentUserProfile: state.profile,
      dragX: 0, dragY: 0,
      isDragging: false,
      startX: 0, startY: 0,
      swipeDir: null,
      showMatch: false,
      matchedUser: '',
      matchedCard: null,
      matchedCardData: null,
      totalLikes: 0,
      totalSkips: 0,
      roleFilters: ['Frontend','Backend','ML','Design','Product'],
      interestFilters: ['AI','Fintech','EdTech','Health','SaaS'],
      activeRoles: [],
      activeInterests: [],
    }
  },
  async mounted() {
    await this.loadProfiles()
    await this.loadMatches()
    await this.loadIncomingRequests()
  },
  computed: {
    currentCard() {
      return this.cards[0] || null
    },
    dragStyle() {
      if (!this.isDragging) return {};
      const rotate = this.dragX * 0.08;
      return { transform: `translate(${this.dragX}px, ${this.dragY}px) rotate(${rotate}deg)`, transition: 'none' };
    },
    currentCardPhotoStyle() {
      if (!this.currentCard) return {}
      const photos = this.allCardPhotos(this.currentCard)
      const url = photos[this.currentPhotoIdx] || ''
      if (url) return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      return { background: this.currentCard.color || 'linear-gradient(135deg,#e63946,#1d4ed8)' }
    },
    userHasProfilePhoto() {
      return Boolean(this.currentUserProfile.profilePhoto)
    },
    myProfilePhoto() {
      const p = this.authStore.profile
      const raw = p?.profile_photo || this.currentUserProfile.profilePhoto || ''
      if (!raw) return ''
      return raw.startsWith('http') ? raw : `${API_BASE}${raw}`
    },
    myInitials() {
      return createInitials(this.currentUserProfile.firstName, this.currentUserProfile.lastName)
    },
    myAvatarStyle() {
      if (this.myProfilePhoto) {
        return { backgroundImage: `url(${this.myProfilePhoto})` }
      }
      return { background: 'linear-gradient(135deg, #e63946, #1d4ed8)' }
    },
    incomingModalAvatarStyle() {
      const u = this.incomingModalUser
      if (!u) return {}
      if (u.profilePhoto) return { backgroundImage: `url(${u.profilePhoto})` }
      return { background: u.color || 'linear-gradient(135deg,#e63946,#1d4ed8)' }
    },
  },
  methods: {
    async like() {
      const card = this.cards[0];
      if (!card) return;
      this.totalLikes++;
      this.swipeDir = 'right';
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/api/swipe/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ toUserId: card.id })
        })
        const data = await res.json()
        if (data.match) {
          const mu = data.matchedUser
          const matchCard = {
            ...card,
            name: mu.name,
            role: mu.role,
            initials: createInitials(...(mu.name || '').split(' ')),
            profilePhoto: mu.profile_photo
              ? (mu.profile_photo.startsWith('http') ? mu.profile_photo : `${API_BASE}${mu.profile_photo}`)
              : '',
          }
          setTimeout(() => {
            this.cards.shift();
            this.swipeDir = null;
            this.matches.unshift(matchCard);
            this.matchedUser = matchCard.name;
            this.matchedCardData = matchCard;
            this.showMatch = true;
          }, 400);
          return;
        }
      } catch (e) {
        console.error('like error', e)
      }
      setTimeout(() => { this.cards.shift(); this.swipeDir = null; this.currentPhotoIdx = 0 }, 400);
    },
    async skip() {
      const card = this.cards[0];
      if (!card) return;
      this.totalSkips++;
      this.swipeDir = 'left';
      try {
        const token = localStorage.getItem('accessToken')
        await fetch(`${API_BASE}/api/swipe/skip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ toUserId: card.id })
        })
      } catch (e) {}
      setTimeout(() => { this.cards.shift(); this.swipeDir = null; this.currentPhotoIdx = 0 }, 400);
    },
    async super_like() {
      await this.like();
    },
    dismissMatch() {
      this.showMatch = false;
      this.matchedCardData = null;
    },
    openMatchChat(match) {
      const person = match || this.matchedCardData || this.matches[0];
      if (!person) return;
      this.showMatch = false;
      this.matchedCardData = null;
      this.$router.push({
        path: '/chat',
        query: {
          dm: person.name,
          dmUserId: person.id || '',
          initials: person.initials || createInitials(...(person.name || '').split(' ')),
          color: encodeURIComponent(person.color || CARD_COLORS[0]),
          role: person.role || '',
        },
      });
    },
    parsePgArray(val) {
      if (!val) return []
      if (Array.isArray(val)) return val
      if (typeof val === 'string') {
        if (val.startsWith('{') || val.startsWith('[')) {
          const content = val.slice(1, -1)
          if (!content) return []
          return content.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
        }
        try { return JSON.parse(val) } catch { return [val] }
      }
      return []
    },

    async loadIncomingRequests() {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          console.error('DEBUG: No token!')
          return
        }
        const res = await fetch(`${API_BASE}/api/swipe/incoming`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        console.log('🐛 INCOMING RAW:', res.status, JSON.stringify(data, null, 2))

        if (!Array.isArray(data)) {
          console.error('🐛 INCOMING не массив:', data)
          this.incomingRequests = []
          return
        }

        this.incomingRequests = data.map((u, i) => {
          const parsedInterests = this.parsePgArray(u.interests)
          const parsedPhotos = this.parsePgArray(u.photos)
          const rankLevel = u.rank_level || 1
          console.log(`🐛 User ${u.id}: interests=`, parsedInterests, 'photos=', parsedPhotos, 'rank=', rankLevel)
          return {
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
            role: u.role || 'Студент',
            bio: u.about || '',
            initials: createInitials(u.first_name, u.last_name),
            profilePhoto: u.profile_photo
              ? (u.profile_photo.startsWith('http') ? u.profile_photo : `${API_BASE}${u.profile_photo}`)
              : '',
            color: CARD_COLORS[i % CARD_COLORS.length],
            interests: parsedInterests,
            photos: parsedPhotos.map(ph => ph.startsWith('http') ? ph : `${API_BASE}${ph}`),
            likedAt: u.liked_at,
            rankLevel: rankLevel,
            rankEmoji: RANK_EMOJIS[rankLevel - 1] || '🌱',
            rankName: RANK_NAMES[rankLevel - 1] || 'Новичок',
          }
        })
        console.log('🐛 INCOMING PROCESSED:', this.incomingRequests.length, 'items')
      } catch (e) {
        console.error('🐛 loadIncomingRequests error:', e)
        this.incomingRequests = []
      }
    },

    openIncomingModal(req) {
      this.incomingModalUser = req
      this.ipvPhotoIdx = 0
      this.showIncomingModal = true
    },
    ipvAllPhotos(user) {
      if (!user) return []
      const main = user.profilePhoto || ''
      const extras = Array.isArray(user.photos) ? user.photos : []
      const all = main ? [main, ...extras.filter(p => p !== main)] : extras
      return all.filter(Boolean)
    },
    openLightboxWithList(photos, idx) {
      this.lightboxPhotos = photos
      this.lightboxIdx = idx
      this.lightboxUrl = photos[idx] || null
    },
    lightboxNext() {
      if (!this.lightboxPhotos.length) return
      this.lightboxIdx = (this.lightboxIdx + 1) % this.lightboxPhotos.length
      this.lightboxUrl = this.lightboxPhotos[this.lightboxIdx]
    },
    lightboxPrev() {
      if (!this.lightboxPhotos.length) return
      this.lightboxIdx = (this.lightboxIdx - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length
      this.lightboxUrl = this.lightboxPhotos[this.lightboxIdx]
    },

    async acceptIncoming(user) {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/api/swipe/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ toUserId: user.id })
        })
        const data = await res.json()
        this.incomingRequests = this.incomingRequests.filter(r => r.id !== user.id)
        this.showIncomingModal = false
        if (data.match) {
          this.matches.unshift(user)
          this.matchedUser = user.name
          this.matchedCardData = user
          this.showMatch = true
        }
      } catch (e) {
        console.error('acceptIncoming error', e)
      }
    },

    async rejectIncoming(user) {
      try {
        const token = localStorage.getItem('accessToken')
        await fetch(`${API_BASE}/api/swipe/skip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ toUserId: user.id })
        })
        this.incomingRequests = this.incomingRequests.filter(r => r.id !== user.id)
        this.showIncomingModal = false
      } catch (e) {
        console.error('rejectIncoming error', e)
      }
    },

    async loadMatches() {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/api/swipe/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.matches = data.map((u, i) => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          role: u.role || 'Студент',
          initials: createInitials(u.first_name, u.last_name),
          profilePhoto: u.profile_photo
            ? (u.profile_photo.startsWith('http') ? u.profile_photo : `${API_BASE}${u.profile_photo}`)
            : '',
          color: CARD_COLORS[i % CARD_COLORS.length],
          interests: u.interests || [],
        }))
      } catch (e) {
        console.error('loadMatches error', e)
      }
    },
    async loadProfiles() {
      this.loadingCards = true
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } })
        const profiles = await res.json()
        if (!res.ok) throw new Error(profiles.error)
        const cards = profiles.map((p, i) => ({
          id: p.id,
          initials: createInitials(p.first_name, p.last_name),
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Пользователь',
          role: p.role || 'Студент',
          bio: p.about || '',
          stack: [],
          interests: Array.isArray(p.interests) ? p.interests : (p.interests ? JSON.parse(p.interests) : []),
          profilePhoto: p.profile_photo
            ? (p.profile_photo.startsWith('http') ? p.profile_photo : `${API_BASE}${p.profile_photo}`)
            : '',
          photos: (p.photos || []).map(ph => ph.startsWith('http') ? ph : `${API_BASE}${ph}`),
          color: CARD_COLORS[i % CARD_COLORS.length],
          activePhoto: 0,
          rankEmoji: RANK_EMOJIS[Math.min((p.rank_level || 1) - 1, 4)],
          rankLevel: p.rank_level || 1,
        }))
        this.allLoadedCards = cards
        this.cards = [...cards]
      } catch (err) {
        console.error('loadProfiles error', err)
        this.cards = []
        this.allLoadedCards = []
      } finally {
        this.loadingCards = false
      }
    },
    resetCards() { this.cards = [...this.allLoadedCards]; this.currentPhotoIdx = 0 },
    allCardPhotos(card) {
      if (!card) return []
      const photos = Array.isArray(card.photos) ? card.photos : []
      const main = card.profilePhoto || ''
      const all = main ? [main, ...photos.filter(p => p !== main)] : photos
      return all.filter(Boolean)
    },
    openCardLightbox(card, idx) {
      const photos = this.allCardPhotos(card)
      if (photos.length) this.openLightboxWithList(photos, idx)
    },
    cardPhoto(card) {
      if (!card) return ''
      return card.profilePhoto || card.photos?.[0] || ''
    },
    cardPhotoStyle(card) {
      const url = this.cardPhoto(card)
      if (url) {
        return {
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      return { background: card.color || 'linear-gradient(135deg, #e63946, #1d4ed8)' }
    },
    startDrag(e) {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      const move = (e2) => {
        this.dragX = e2.clientX - this.startX;
        this.dragY = e2.clientY - this.startY;
      };
      const up = () => {
        this.isDragging = false;
        if (this.dragX > 80) this.like();
        else if (this.dragX < -80) this.skip();
        this.dragX = 0; this.dragY = 0;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    startDragTouch(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      const move = (e2) => {
        this.dragX = e2.touches[0].clientX - this.startX;
        this.dragY = e2.touches[0].clientY - this.startY;
      };
      const end = () => {
        this.isDragging = false;
        if (this.dragX > 80) this.like();
        else if (this.dragX < -80) this.skip();
        this.dragX = 0; this.dragY = 0;
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', end);
      };
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', end);
    },
    toggleRole(r) {
      const i = this.activeRoles.indexOf(r);
      i >= 0 ? this.activeRoles.splice(i,1) : this.activeRoles.push(r);
    },
    toggleInterest(i) {
      const idx = this.activeInterests.indexOf(i);
      idx >= 0 ? this.activeInterests.splice(idx,1) : this.activeInterests.push(i);
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Onest:wght@400;500;600;700&display=swap');

.page-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; }
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -100px; right: 0; animation: bf 8s ease-in-out infinite; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: 0; left: 100px; animation: bf 11s ease-in-out infinite reverse; }
.blob-3 { width: 300px; height: 300px; background: #7c3aed; top: 40%; right: 30%; animation: bf 9s ease-in-out infinite 2s; }
@keyframes bf { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.06)} }

.page-inner { position: relative; z-index: 1; padding: 40px; min-height: 100vh; }

/* LAYOUT */
.swipe-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 40px; align-items: start; }
.swipe-area { min-width: 0; }

.swipe-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
.page-label { font-family: 'Unbounded', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-red); margin-bottom: 8px; }
.page-title { font-family: 'Unbounded', sans-serif; font-size: 32px; font-weight: 800; color: var(--c-white); margin: 0; letter-spacing: -0.5px; }
.swipe-counter { text-align: right; }
.counter-num { font-family: 'Unbounded', sans-serif; font-size: 28px; font-weight: 800; color: var(--c-red); display: block; }
.counter-label { font-size: 12px; color: var(--c-muted); }

/* CARD STACK */
.card-stack { position: relative; min-height: 640px; width: min(100%, 380px); margin: 0 auto; }
.swipe-card {
  position: absolute; width: 100%;
  background: var(--c-card); border: 1px solid var(--c-border);
  border-radius: 24px; padding: 28px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.4s;
  user-select: none;
}
.swipe-card--back2 { top: 20px; left: 20px; transform: rotate(5deg); opacity: 0.3; }
.swipe-card--back1 { top: 10px; left: 10px; transform: rotate(2.5deg); opacity: 0.55; }
.swipe-card--main {
  top: 0; left: 0; z-index: 3; cursor: grab;
  background: var(--c-surface); border-color: rgba(255,255,255,0.1);
}
.swipe-card--main:active { cursor: grabbing; }
.swiping-left { transform: translateX(-120%) rotate(-20deg) !important; opacity: 0 !important; }
.swiping-right { transform: translateX(120%) rotate(20deg) !important; opacity: 0 !important; }

/* SWIPE HINTS */
.swipe-hint {
  position: absolute; top: 24px; padding: 6px 18px; border-radius: 100px;
  font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 800;
  opacity: 0; transition: opacity 0.15s; pointer-events: none;
  border: 3px solid;
}
.swipe-hint.like { right: 24px; color: #4ade80; border-color: #4ade80; }
.swipe-hint.skip { left: 24px; color: #f87171; border-color: #f87171; }
.swipe-hint.show { opacity: 1; }

/* CARD CONTENT */
.sc-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: -8px 0 8px;
  gap: 14px;
}

.sc-photo-ring {
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #1d4ed8, #7c3aed);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.sc-photo-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 4px solid var(--c-surface);
  background-size: cover;
  background-position: center;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.sc-photo-circle--fallback {
  border-color: rgba(255, 255, 255, 0.08);
}

.sc-photo-initials {
  font-family: 'Unbounded', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.sc-top--below {
  position: static;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
}

.sc-identity { min-width: 0; text-align: left; }
.sc-score { text-align: right; flex-shrink: 0; }
.score-num { font-family: 'Unbounded', sans-serif; font-size: 26px; font-weight: 800; color: var(--c-red); display: block; line-height: 1; }
.score-label { font-size: 11px; color: var(--c-muted); }
.sc-name-row { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; }
.sc-name { font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: var(--c-white); margin: 0; }
.sc-rank-emoji { font-size: 20px; line-height: 1; flex-shrink: 0; }
.sc-role-badge {
  display: inline-block; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 100px;
  background: rgba(255, 255, 255, 0.06); color: var(--c-text); border: 1px solid var(--c-border);
}

.ma-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}
.sc-content { display: grid; gap: 14px; }
.sc-bio-block,
.sc-interests-panel {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--c-border);
  background: rgba(255,255,255,0.03);
}
.sc-bio { font-size: 13px; line-height: 1.6; color: var(--c-muted); margin-bottom: 14px; }
.interests-title { font-size: 12px; font-weight: 700; color: var(--c-white); margin-bottom: 10px; }
.sc-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.sc-tag { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
.sc-interests { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.sc-interest { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(255,255,255,0.05); color: var(--c-muted); border: 1px solid var(--c-border); }
.sc-meta { display: flex; gap: 14px; flex-wrap: wrap; }
.sc-meta-item { font-size: 12px; color: var(--c-text); }

/* BUTTONS */
.swipe-btns { display: flex; justify-content: center; align-items: center; gap: 22px; margin-top: 8px; margin-bottom: 4px; padding: 8px 0 4px; position: relative; z-index: 4; }
.swipe-btn {
  width: 68px; height: 68px;
  -webkit-tap-highlight-color: transparent; border-radius: 50%; border: none; cursor: pointer;
  font-size: 22px; display: grid; place-items: center; transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.swipe-btn--skip { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12); }
.swipe-btn--skip:hover { background: rgba(248,113,113,0.1); border-color: #f87171; transform: scale(1.1); }
.swipe-btn--like { background: linear-gradient(135deg, #e63946, #f97316); }
.swipe-btn--like:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(230,57,70,0.4); }
.swipe-btn--super { background: linear-gradient(135deg, #7c3aed, #3b82f6); }
.swipe-btn--super:hover { transform: scale(1.1); }
.swipe-btn--profile {
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.14);
  color: #e8eaf2;
  width: 46px; height: 46px;
}
.swipe-btn--profile:hover { background: rgba(255,255,255,0.12); transform: scale(1.05); }
.drag-hint { text-align: center; font-size: 12px; color: var(--c-muted); margin-top: 16px; }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 16px; display: grid; place-items: center; background: rgba(255,255,255,0.04); color: var(--c-muted); }
.empty-title { font-family: 'Unbounded', sans-serif; font-size: 20px; font-weight: 700; color: var(--c-white); margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: var(--c-muted); margin-bottom: 24px; }

/* BUTTONS SHARED */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--c-red); color: #fff; font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 14px; padding: 10px 22px;
  border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: #c62d39; }
.btn-primary.btn-lg { font-size: 15px; padding: 13px 28px; }
.btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--c-text); font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 14px; padding: 12px 22px;
  border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent; cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.35); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--c-muted); font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 13px; padding: 10px 20px;
  border-radius: 8px; border: none;
  background: transparent; cursor: pointer; transition: color 0.2s;
}
.btn-ghost:hover { color: var(--c-text); }

/* INFO PANEL */
.info-panel { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 40px; }
.panel-section { background: var(--c-card); border: 1px solid var(--c-border); border-radius: var(--r); padding: 20px; }
.panel-title {
  font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 700;
  color: var(--c-white); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.match-count {
  background: var(--c-red); color: #fff; font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 100px;
}
.filter-group { margin-bottom: 14px; }
.filter-group:last-child { margin-bottom: 0; }
.filter-label { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.filter-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-chip {
  font-size: 12px; padding: 4px 12px; border-radius: 100px;
  border: 1px solid var(--c-border); color: var(--c-muted);
  cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover { color: var(--c-text); border-color: rgba(255,255,255,0.15); }
.filter-chip.active { background: var(--c-red-dim); color: var(--c-red); border-color: rgba(230,57,70,0.3); }

/* MATCHES */
.matches-list { display: flex; flex-direction: column; gap: 10px; }
.match-item { display: flex; align-items: center; gap: 10px; }
.match-avatar {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
}
.match-info { flex: 1; }
.match-name { font-size: 13px; font-weight: 600; color: var(--c-white); }
.match-role { font-size: 11px; color: var(--c-muted); }
.match-msg-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.75);
  cursor: pointer; font-size: 14px; display: grid; place-items: center;
  transition: all 0.2s;
}
.match-msg-btn:hover { border-color: rgba(230,57,70,0.4); background: rgba(230,57,70,0.15); color: #fff; }
.no-matches { font-size: 13px; color: var(--c-muted); text-align: center; padding: 12px 0; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.stat-box { text-align: center; padding: 12px 8px; background: var(--c-surface); border-radius: 10px; border: 1px solid var(--c-border); }
.stat-num { font-family: 'Unbounded', sans-serif; font-size: 22px; font-weight: 800; color: var(--c-white); }
.stat-label { font-size: 11px; color: var(--c-muted); margin-top: 2px; }

/* PHOTO SLIDESHOW */
.sc-photos-wrap { position: relative; width: 100%; height: 100%; }
.sc-photo-dots {
  position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 5px; z-index: 5;
}
.sc-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.2s;
}
.sc-dot.active { background: #fff; transform: scale(1.2); }
.sc-photo-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.45); border: none;
  color: #fff; font-size: 18px; cursor: pointer; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.sc-photo-arrow:hover { background: rgba(0,0,0,0.7); }
.sc-photo-arrow--prev { left: 8px; }
.sc-photo-arrow--next { right: 8px; }

/* LIGHTBOX */
.sc-lightbox-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,0.92); backdrop-filter: blur(18px);
  display: flex; align-items: center; justify-content: center;
}
.sc-lightbox-img {
  max-width: 88vw; max-height: 84vh;
  border-radius: 16px; object-fit: contain;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7);
}
.lb-close {
  position: fixed; top: 20px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: background 0.15s;
}
.lb-close:hover { background: rgba(255,255,255,0.2); }
.lb-arrow {
  position: fixed; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 28px; cursor: pointer; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.lb-arrow:hover { background: rgba(255,255,255,0.22); }
.lb-arrow--prev { left: 20px; }
.lb-arrow--next { right: 20px; }
.lb-counter {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.75);
  font-size: 13px; padding: 6px 16px; border-radius: 20px; z-index: 10;
}

/* INCOMING REQUESTS */
.req-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
.req-btn-x {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.req-btn-x:hover { background: rgba(230,57,70,0.15); border-color: rgba(230,57,70,0.3); color: #e63946; }

/* INCOMING PREVIEW — swipe card style */
.ipv-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.88); backdrop-filter: blur(16px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 28px; padding: 24px;
}
.ipv-card {
  position: relative;
  width: 340px; max-width: 92vw;
  background: var(--c-card, #1a1a2e);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 32px 24px 24px;
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}
.ipv-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.ipv-close:hover { background: rgba(255,255,255,0.14); color: #fff; }
.ipv-avatar-ring {
  width: 110px; height: 110px; border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #e63946, #7c3aed, #1d4ed8);
  margin-bottom: 4px;
}
.ipv-avatar-circle {
  width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.ipv-av-initials {
  font-family: 'Unbounded', sans-serif;
  font-size: 28px; font-weight: 800; color: #fff;
}
.ipv-name { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
.ipv-role-badge {
  font-size: 12px; font-weight: 600; color: #c4b5fd;
  background: rgba(124,58,237,0.18); border: 1px solid rgba(124,58,237,0.25);
  padding: 4px 14px; border-radius: 20px;
}
.ipv-badges-row {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  flex-wrap: wrap;
}
.ipv-rank-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600;
  background: rgba(230,57,70,0.15);
  border: 1px solid rgba(230,57,70,0.3);
  color: #e63946;
  padding: 4px 12px; border-radius: 20px;
}
.ipv-rank-emoji { font-size: 13px; }
.ipv-rank-name { font-size: 11px; }
.ipv-section {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 12px 16px; text-align: left;
}
.ipv-bio { font-size: 13px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.5; min-height: 18px; }
.ipv-interests-block { display: flex; flex-direction: column; gap: 8px; }
.ipv-section-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
.ipv-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ipv-chip {
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65);
  border: 1px solid rgba(255,255,255,0.08);
}
/* action buttons */
.ipv-btns {
  display: flex; align-items: center; justify-content: center; gap: 20px;
}
.ipv-btn {
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: #fff;
}
.ipv-btn--skip {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
}
.ipv-btn--skip:hover { background: rgba(230,57,70,0.25); color: #e63946; transform: scale(1.08); }
.ipv-btn--super {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(124,58,237,0.2);
  color: #a78bfa;
}
.ipv-btn--super:hover { background: rgba(124,58,237,0.35); transform: scale(1.08); }
.ipv-btn--like {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #f97316);
  box-shadow: 0 4px 20px rgba(230,57,70,0.45);
}
.ipv-btn--like:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(230,57,70,0.6); }

/* MATCH POPUP */
.match-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.match-modal {
  position: relative; overflow: hidden;
  background: var(--c-card); border: 1px solid rgba(230,57,70,0.3);
  border-radius: 24px; padding: 48px 40px; text-align: center;
  max-width: 380px; width: 90%;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(230,57,70,0.15);
}
.match-bg-blob {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(230,57,70,0.2) 0%, transparent 70%);
  top: -100px; left: 50%; transform: translateX(-50%); pointer-events: none;
}
.match-emoji { font-size: 48px; margin-bottom: 12px; animation: matchPop 0.6s cubic-bezier(.34,1.56,.64,1); }
@keyframes matchPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.match-title { font-family: 'Unbounded', sans-serif; font-size: 28px; font-weight: 800; color: var(--c-white); margin-bottom: 8px; }
.match-sub { font-size: 15px; color: var(--c-muted); margin-bottom: 24px; }
.match-sub strong { color: var(--c-white); }
.match-avatars { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 32px; }
.ma {
  width: 64px; height: 64px; border-radius: 18px;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: #fff;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}
.ma-you { background: linear-gradient(135deg, #e63946, #1d4ed8); }
.ma-them { background: linear-gradient(135deg, #7c3aed, #e63946); }
.ma-heart { font-size: 28px; }
.match-actions { display: flex; flex-direction: column; gap: 10px; }

/* TRANSITIONS */
.match-pop-enter-active, .match-pop-leave-active { transition: opacity 0.3s; }
.match-pop-enter-from, .match-pop-leave-to { opacity: 0; }

.profile-readiness {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.readiness-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--c-text);
}

.readiness-note {
  font-size: 12px;
  color: var(--c-muted);
  line-height: 1.6;
}

@media (max-width: 1280px) {
  .swipe-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 28px;
  }
}

@media (max-width: 1080px) {
  .page-inner {
    padding: 32px 24px 40px;
  }

  .swipe-layout {
    grid-template-columns: 1fr;
  }

  .info-panel {
    position: static;
    order: -1;
  }

  .card-stack {
    min-height: 700px;
  }
}

@media (max-width: 760px) {
  .page-inner {
    padding: 24px 16px 36px;
  }

  .swipe-header {
    flex-direction: column;
    gap: 16px;
  }

  .swipe-counter {
    text-align: left;
  }

  .page-title {
    font-size: 28px;
  }

  .card-stack {
    min-height: 660px;
    width: min(100%, 100%);
  }

  .swipe-card {
    padding: 20px;
    border-radius: 20px;
  }

  .sc-photo-shell {
    height: 220px;
    margin: -20px -20px 16px;
    border-radius: 20px 20px 16px 16px;
  }

  .sc-top {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }

  .sc-name {
    font-size: 18px;
  }

  .score-num {
    font-size: 24px;
  }

  .sc-meta {
    gap: 8px;
  }

  .sc-meta-item {
    width: 100%;
  }

  .photo-dot {
    width: 18px;
  }

  .swipe-btns {
    gap: 14px;
  }

  .swipe-btn {
    width: 54px;
    height: 54px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>