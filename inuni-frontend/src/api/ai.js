import { postJson } from './client'

const GROQ_API_KEY = 'import.meta.env.VITE_GROQ_API_KEY || '''

export async function analyzeProfile(profile) {
  const prompt = `Проанализируй профиль разработчика и дай 3 конкретных рекомендации по развитию:

Имя: ${profile.first_name} ${profile.last_name}
Роль: ${profile.role || 'Не указана'}
Навыки: ${profile.interests?.join(', ') || 'Не указаны'}
О себе: ${profile.about || 'Не заполнено'}

Дай ответ в формате JSON:
{
  "recommendations": [
    {"category": "навык", "title": "...", "description": "..."},
    {"category": "проект", "title": "...", "description": "..."},
    {"category": "карьера", "title": "...", "description": "..."}
  ]
}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Ты карьерный консультант для IT-специалистов. Давай краткие, практичные рекомендации на русском языке.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    })

    if (!res.ok) throw new Error('Groq API error')
    
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
    }
    
    return {
      recommendations: [
        { category: 'навык', title: 'Развивайте навыки', description: 'Продолжайте изучать новые технологии в вашей области' },
        { category: 'проект', title: 'Практика', description: 'Работайте над реальными проектами для портфолио' },
        { category: 'карьера', title: 'Нетворкинг', description: 'Участвуйте в хакатонах и IT-сообществах' }
      ]
    }
  } catch (err) {
    console.error('AI analyze error:', err)
    return {
      recommendations: [
        { category: 'навык', title: 'JavaScript/TypeScript', description: 'Углубите знания в современном JS и TypeScript' },
        { category: 'проект', title: 'Pet-проекты', description: 'Создайте 2-3 проекта для портфолио на GitHub' },
        { category: 'карьера', title: 'Хакатоны', description: 'Участвуйте в InUni хакатонах для нетворкинга' }
      ]
    }
  }
}

export function generateProfileBio(profile) {
  return postJson('/api/ai/profile/generate-bio', { profile })
}

export function getChatSuggestions(message) {
  return postJson('/api/ai/chat/suggestions', { message })
}

export function enrichChatMessage(message) {
  return postJson('/api/ai/chat/enrich', { message })
}

/**
 * AI Team Builder — подбор команды по описанию проекта
 * @param {string} query — описание проекта/ролей
 * @param {Array} requiredRoles — массив ролей (optional)
 * @returns {Promise<{candidates: Array, teamFit: number, analysis: string}>}
 */
export function findTeamCandidates(query, requiredRoles = []) {
  return postJson('/api/ai/team/build', { query, requiredRoles })
}
