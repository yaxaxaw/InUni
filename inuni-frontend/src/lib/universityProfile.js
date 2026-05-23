/** InUni — только для одного университета (внутреннее использование) */
export const UNIVERSITY_NAME = 'AIU'
export const UNIVERSITY_TAGLINE = 'Закрытая сеть для студентов AIU'

export const COURSE_OPTIONS = [
  '1 курс',
  '2 курс',
  '3 курс',
  '4 курс',
  '5 курс',
  '6 курс',
  'Магистратура 1 курс',
  'Магистратура 2 курс',
  'Аспирантура',
]

export const DIRECTION_OPTIONS = [
  'Информатика и вычислительная техника',
  'Компьютерная инженерия',
  'Прикладная математика',
  'Электроника и наноэлектроника',
  'Промышленное проектирование',
  'Искусственный интеллект',
  'Общая медицина',
  'Педиатрия',
  'Экономика',
  'Менеджмент',
  'Международные отношения',
  'Международное право',
  'Бизнес-право',
  'Журналистика',
  'Медиа и визуальное искусство',
  'Психология',
  'Педагогика',
  'Лингвистика',
  'Английский язык и литература',
  'Синхронный перевод',
  'Китайский язык и литература',
  'Тюркология',
]

export const HARD_SKILL_GROUPS = [
  {
    id: 'it', icon: '💻', label: 'IT', skills: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go',
      'Vue', 'React', 'Node.js', 'FastAPI', 'Django',
      'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'Linux',
      'AWS', 'DevOps', 'Cybersecurity', 'ML / AI', 'Data Science',
      'Mobile (iOS)', 'Mobile (Android)', 'Flutter', 'Figma', 'UI/UX',
    ],
  },
  {
    id: 'engineering', icon: '🔧', label: 'Инженерия', skills: [
      'AutoCAD', 'SolidWorks', 'MATLAB', 'Электроника', 'Схемотехника',
      'Робототехника', 'Автоматизация', '3D-моделирование', 'Embedded / IoT',
    ],
  },
  {
    id: 'medicine', icon: '🩺', label: 'Медицина', skills: [
      'Анатомия', 'Физиология', 'Фармакология', 'Биохимия',
      'Клиническая диагностика', 'Первая помощь', 'Медицинская статистика',
      'Медицинские информационные системы',
    ],
  },
  {
    id: 'law', icon: '⚖️', label: 'Право', skills: [
      'Гражданское право', 'Уголовное право', 'Международное право',
      'Конституционное право', 'Корпоративное право', 'Трудовое право',
      'Юридическое письмо', 'Арбитраж',
    ],
  },
  {
    id: 'economics', icon: '📊', label: 'Экономика', skills: [
      'Финансовый анализ', 'Бухгалтерский учёт', 'Эконометрика',
      'Excel / Power BI', 'Маркетинг', 'SMM', 'Agile / Scrum',
      'Управление проектами', 'Финансовое моделирование', '1С',
    ],
  },
  {
    id: 'education', icon: '🎓', label: 'Педагогика', skills: [
      'Разработка учебных программ', 'Педагогические технологии',
      'Психодиагностика', 'Психологическое консультирование',
      'Когнитивная психология', 'Тренинги и фасилитация',
    ],
  },
  {
    id: 'media', icon: '🎨', label: 'Медиа', skills: [
      'Журналистика', 'Копирайтинг', 'Видеомонтаж',
      'Adobe Premiere', 'Photoshop', 'Illustrator',
      'Фотография', 'Академическое письмо',
    ],
  },
  {
    id: 'math', icon: '🔢', label: 'Математика', skills: [
      'Математический анализ', 'Линейная алгебра',
      'Теория вероятностей', 'Статистика', 'Численные методы',
    ],
  },
]

export const SOFT_SKILL_GROUPS = [
  {
    id: 'personal', icon: '🧠', label: 'Личные', skills: [
      'Лидерство', 'Командная работа', 'Коммуникация', 'Эмпатия',
      'Активное слушание', 'Эмоциональный интеллект', 'Адаптивность',
      'Стрессоустойчивость', 'Самоорганизация', 'Тайм-менеджмент',
      'Критическое мышление', 'Креативность', 'Дизайн-мышление',
    ],
  },
  {
    id: 'professional', icon: '💼', label: 'Профессиональные', skills: [
      'Публичные выступления', 'Переговоры', 'Медиация', 'Нетворкинг',
      'Менторство', 'Управление командой', 'Стратегическое мышление',
      'Решение проблем', 'Предпринимательство', 'Стартапы',
      'Исследования', 'Гранты и конкурсы', 'Волонтёрство',
    ],
  },
  {
    id: 'languages', icon: '🌐', label: 'Языки', skills: [
      'Казахский язык', 'Русский язык', 'Английский язык',
      'Китайский язык', 'Немецкий язык', 'Деловая переписка',
      'Академический английский', 'Межкультурная коммуникация',
    ],
  },
]

export const SOFT_SKILLS = SOFT_SKILL_GROUPS.flatMap(g => g.skills)
export const HARD_SKILLS = HARD_SKILL_GROUPS.flatMap(g => g.skills)
export const SKILL_OPTIONS = [...HARD_SKILLS, ...SOFT_SKILLS]

export const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Data Scientist',
  'ML Engineer',
  'Product Manager',
  'Project Manager',
  'UI/UX Designer',
  'Security Engineer',
  'System Administrator',
  'Database Administrator',
  'Economist',
  'Manager',
  'Marketing Specialist',
  'Financial Analyst',
  'Accountant',
  'Business Analyst',
  'HR Specialist',
  'Sales Manager',
  'Entrepreneur',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Civil Engineer',
  'Chemical Engineer',
  'Industrial Designer',
  'Automation Engineer',
  'Medical Doctor',
  'Nurse',
  'Pharmacist',
  'Dentist',
  'Medical Researcher',
  'Teacher',
  'Educator',
  'Psychologist',
  'School Counselor',
  'Special Education Teacher',
  'Child Psychologist',
  'Lawyer',
  'Legal Advisor',
  'Corporate Lawyer',
  'Human Rights Advocate',
  'Journalist',
  'PR Specialist',
  'Content Manager',
  'Video Producer',
  'Photographer',
  'Social Media Manager',
  'Translator',
  'Interpreter',
  'Linguist',
  'Language Teacher',
  'Graphic Designer',
  'Architect',
  'Artist',
  'Musician',
  'Art Director',
  'Researcher',
  'Physicist',
  'Chemist',
  'Biologist',
  'Mathematician',
  'Research Assistant',
  'Student',
  'Graduate Student',
  'Intern',
  'Administrative Staff',
  'Librarian',
  'Coach',
  'Athlete',
]

export function parseFullName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function buildFullName(firstName, lastName) {
  return [firstName, lastName].map((p) => p?.trim()).filter(Boolean).join(' ')
}

export function buildEducation(direction, course) {
  const parts = [UNIVERSITY_NAME, direction, course].filter(Boolean)
  return parts.join(' • ')
}
