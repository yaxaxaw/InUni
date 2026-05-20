import { apiRequest, postJson } from './client.js'

export function adminLogin(email, password) {
  return postJson('/api/admin/login', { email, password })
}

export function getAdminStats() {
  return apiRequest('/api/admin/stats')
}

export function getHackathons() {
  return apiRequest('/api/hackathons')
}

export function createHackathon(data) {
  return apiRequest('/api/hackathons', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateHackathon(id, data) {
  return apiRequest(`/api/hackathons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export function deleteHackathon(id) {
  return apiRequest(`/api/hackathons/${id}`, {
    method: 'DELETE'
  })
}
