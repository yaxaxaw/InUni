import {
  buildEducation,
  buildFullName,
  parseFullName,
  UNIVERSITY_NAME,
} from './universityProfile'

const BASE_STORAGE_KEY = 'inuni-app-state'

function getStorageKey() {
  try {
    const userStr = window.localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.id) return `${BASE_STORAGE_KEY}:${user.id}`
    }
  } catch {}
  return BASE_STORAGE_KEY
}

const defaultState = () => ({
  profile: {
    firstName: '',
    lastName: '',
    fullName: '',
    role: '',
    direction: '',
    course: '',
    education: '',
    email: '',
    about: '',
    interests: [],
    profilePhoto: '',
    github: '',
    linkedin: '',
    skillLevels: {
      frontend: { name: 'Frontend', value: 30, color: '#e63946' },
      backend: { name: 'Backend', value: 30, color: '#1d4ed8' },
      design: { name: 'Design', value: 30, color: '#7c3aed' },
      mobile: { name: 'Mobile', value: 30, color: '#059669' },
      devops: { name: 'DevOps', value: 30, color: '#ea580c' },
      ml: { name: 'AI/ML', value: 30, color: '#0891b2' },
    },
  },
  teamApplications: [],
  createdSlots: [],
})

function migrateProfile(raw = {}) {
  const base = defaultState().profile
  const parsed = parseFullName(raw.fullName || '')
  const firstName = raw.firstName ?? parsed.firstName ?? base.firstName
  const lastName = raw.lastName ?? parsed.lastName ?? base.lastName
  const direction = raw.direction ?? base.direction
  const course = raw.course ?? base.course
  const profilePhoto = raw.profilePhoto || (Array.isArray(raw.photos) ? raw.photos[0] : '') || ''

  const skillLevels = raw.skillLevels || {
    frontend: { name: 'Frontend', value: 30, color: '#e63946' },
    backend: { name: 'Backend', value: 30, color: '#1d4ed8' },
    design: { name: 'Design', value: 30, color: '#7c3aed' },
    mobile: { name: 'Mobile', value: 30, color: '#059669' },
    devops: { name: 'DevOps', value: 30, color: '#ea580c' },
    ml: { name: 'AI/ML', value: 30, color: '#0891b2' },
  }

  return {
    ...base,
    ...raw,
    firstName,
    lastName,
    skillLevels,
    fullName: buildFullName(firstName, lastName) || base.fullName,
    direction,
    course,
    education: buildEducation(direction, course),
    interests: Array.isArray(raw.interests) ? raw.interests : base.interests,
    profilePhoto,
  }
}

function migrateLegacyApplications(parsed) {
  if (parsed.teamApplications?.length) return parsed.teamApplications

  const fromHackathons = (parsed.hackathonApplications || []).map((item) => ({
    id: item.id || `event-${Date.now()}-${Math.random()}`,
    kind: 'event',
    category: 'hackathon',
    title: item.hackathonName || item.title || 'Хакатон',
    icon: '🏆',
    role: item.role || 'Участник',
    teamName: item.teamName,
    fileName: item.fileName,
    status: item.status || 'pending',
    statusLabel: item.statusLabel || 'На рассмотрении',
    createdAt: item.createdAt,
  }))

  const fromProjects = (parsed.projectApplications || []).map((item) => ({
    id: item.id || `slot-${Date.now()}-${Math.random()}`,
    kind: 'slot',
    category: item.category || 'startup',
    title: item.project || item.title || 'Проект',
    icon: item.icon || '🚀',
    role: item.role || 'Участник',
    status: item.status || 'pending',
    statusLabel: item.statusLabel || 'На рассмотрении',
  }))

  return [...fromHackathons, ...fromProjects]
}

export function loadAppState() {
  if (typeof window === 'undefined') return defaultState()

  try {
    const key = getStorageKey()
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return defaultState()
    }

    const parsed = JSON.parse(raw)
    const teamApplications = migrateLegacyApplications(parsed).filter(
      a => !['seed-1', 'seed-2'].includes(a.id)
    )
    const createdSlots = parsed.createdSlots || parsed.createdProjects || []

    return {
      ...defaultState(),
      ...parsed,
      profile: migrateProfile(parsed.profile),
      teamApplications,
      createdSlots,
    }
  } catch {
    return defaultState()
  }
}

export function saveAppState(nextState) {
  if (typeof window === 'undefined') return nextState
  const key = getStorageKey()
  window.localStorage.setItem(key, JSON.stringify(nextState))
  window.dispatchEvent(new CustomEvent('inuni-state-changed', { detail: nextState }))
  return nextState
}

export function patchAppState(patch) {
  const current = loadAppState()
  const next = {
    ...current,
    ...patch,
    profile: migrateProfile({
      ...current.profile,
      ...(patch.profile || {}),
    }),
  }
  return saveAppState(next)
}

export function clearAppState() {
  if (typeof window === 'undefined') return
  const key = getStorageKey()
  window.localStorage.removeItem(key)
}

export function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export function createInitials(firstName, lastName) {
  if (lastName === undefined && typeof firstName === 'string' && firstName.includes(' ')) {
    const parsed = parseFullName(firstName)
    return createInitials(parsed.firstName, parsed.lastName)
  }
  return [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.trim()[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getHandle(url) {
  try {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '')
    return pathname || url
  } catch {
    return url
  }
}

export { UNIVERSITY_NAME }
