import { createRouter, createWebHistory } from 'vue-router'

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function getUser() {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

const routes = [
  { path: '/', component: () => import('../pages/HomePage.vue') },
  { path: '/login', component: () => import('../pages/LoginPage.vue'), meta: { guestOnly: true } },
  { path: '/register', component: () => import('../pages/RegisterPage.vue'), meta: { guestOnly: true } },

  { path: '/teams', component: () => import('../pages/TeamsPage.vue'), meta: { requiresAuth: true } },
  { path: '/hackathons', redirect: (to) => ({ path: '/teams', query: { ...to.query, tab: 'hackathon' } }) },
  { path: '/projects', redirect: (to) => ({ path: '/teams', query: { ...to.query, tab: 'all' } }) },

  { path: '/profile', component: () => import('../pages/ProfilePage.vue'), meta: { requiresAuth: true } },
  { path: '/profile/:userId', component: () => import('../pages/UserProfilePage.vue'), meta: { requiresAuth: true } },
  { path: '/events', component: () => import('../pages/EventsPage.vue'), meta: { requiresAuth: true } },
  { path: '/swipe', component: () => import('../pages/SwipePage.vue'), meta: { requiresAuth: true } },
  { path: '/chat', component: () => import('../pages/ChatPage.vue'), meta: { requiresAuth: true } },
  { path: '/friends', component: () => import('../pages/FriendsPage.vue'), meta: { requiresAuth: true } },
  { path: '/career', component: () => import('../pages/CareerPage.vue'), meta: { requiresAuth: true } },
  
  { path: '/admin', component: () => import('../pages/AdminPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/login', component: () => import('../pages/AdminLoginPage.vue') },
  { path: '/admin/events', component: () => import('../pages/AdminEventsPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  const user = getUser()
  const isAuthenticated = !!token && !!user
  const isAdmin = !!user?.is_admin

  if (to.meta.requiresAdmin) {
    if (!isAuthenticated) return next('/admin/login')
    if (!isAdmin) return next('/')
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return next(isAdmin ? '/admin' : '/teams')
  }

  next()
})

export default router
