import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const authStore = useAuthStore()
authStore.init()

const _origFetch = window.fetch
window.fetch = async (...args) => {
  const res = await _origFetch(...args)
  if (res.status === 401) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
    if (!url.includes('/api/auth/')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }
  return res
}

app.mount('#app')
