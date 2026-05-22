# InUni Database Schema - Complete Analysis

## Выполнено: Полный анализ фронтенда

### Таблицы, которые нужно создать в Supabase:

#### 1. **profiles** - Профили пользователей
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK, ссылка на auth.users | Вход, профиль |
| first_name | TEXT | Имя | RegisterPage, ProfilePage |
| last_name | TEXT | Фамилия | RegisterPage, ProfilePage |
| email | TEXT | Email | RegisterPage, ProfilePage |
| role | TEXT | Роль (Frontend Dev и т.д.) | ProfilePage |
| direction | TEXT | Направление | ProfilePage |
| course | TEXT | Курс | ProfilePage |
| university | TEXT | Университет (default: Satbayev) | ProfilePage |
| about | TEXT | О себе | ProfilePage |
| interests | TEXT[] | Массив навыков | ProfilePage, TeamsPage |
| skill_levels | JSONB | Уровни для Radar | ProfilePage |
| github | TEXT | GitHub URL | ProfilePage |
| linkedin | TEXT | LinkedIn URL | ProfilePage |
| profile_photo | TEXT | URL фото | ProfilePage, Storage |
| account_type | TEXT | student/admin/org | TeamsPage (права) |

#### 2. **teams** - Команды/проекты
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK | TeamsPage |
| name | TEXT | Название команды | TeamsPage (создание) |
| description | TEXT | Описание | TeamsPage |
| category | TEXT | hackathon/project/startup | TeamsPage |
| owner_id | UUID | Создатель (FK profiles) | TeamsPage |
| required_roles | TEXT[] | Нужные роли | TeamsPage (создание) |
| tags | TEXT[] | Теги для поиска | TeamsPage |
| is_active | BOOLEAN | Активна ли | TeamsPage |
| is_looking_for_members | BOOLEAN | Ищет участников | TeamsPage |
| max_members | INTEGER | Макс. участников | TeamsPage |
| stage | TEXT | Idea/MVP/Beta/Production | TeamsPage |
| is_hot | BOOLEAN | Популярная | TeamsPage |

#### 3. **team_members** - Участники команд
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK | TeamsPage |
| team_id | UUID | FK teams | TeamsPage |
| user_id | UUID | FK profiles | TeamsPage |
| role | TEXT | Роль в команде | TeamsPage |
| status | TEXT | pending/accepted/rejected | TeamsPage |
| joined_at | TIMESTAMP | Дата | TeamsPage |

#### 4. **applications** - Заявки на вступление
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK | TeamsPage |
| team_id | UUID | FK teams | TeamsPage (отклик) |
| applicant_id | UUID | FK profiles | TeamsPage |
| role | TEXT | На какую роль | TeamsPage |
| message | TEXT | Сообщение | TeamsPage |
| status | TEXT | pending/accepted/rejected | TeamsPage |

#### 5. **messages** - Чат
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK | ChatPage |
| team_id | UUID | FK teams | ChatPage |
| sender_id | UUID | FK profiles | ChatPage |
| content | TEXT | Текст | ChatPage |
| message_type | TEXT | text/file/system | ChatPage |
| created_at | TIMESTAMP | Дата | ChatPage |

#### 6. **hackathons** - Мероприятия
| Поле | Тип | Описание | Использование |
|------|-----|----------|---------------|
| id | UUID | PK | TeamsPage |
| title | TEXT | Название | TeamsPage |
| description | TEXT | Описание | TeamsPage |
| start_date | TIMESTAMP | Начало | TeamsPage |
| end_date | TIMESTAMP | Конец | TeamsPage |
| is_active | BOOLEAN | Активно | TeamsPage |
| is_featured | BOOLEAN | Избранное | TeamsPage |

#### 7. **notifications** - Уведомления (future)
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | PK |
| user_id | UUID | FK profiles |
| title | TEXT | Заголовок |
| message | TEXT | Текст |
| type | TEXT | Тип события |
| is_read | BOOLEAN | Прочитано |

### Storage Buckets:
1. **profile-photos** - Фото профилей (public)
2. **team-files** - Файлы команд (private)

### Индексы:
- profiles: role, interests, university
- teams: category, owner_id, tags, is_active
- team_members: team_id, user_id, status
- applications: team_id, applicant_id, status
- messages: team_id, created_at

### RLS Policies:
- profiles: все видят, редактирует только владелец
- teams: все видят активные, создаёт/редактирует владелец
- team_members: все видят, добавляет сам пользователь, обновляет владелец команды
- applications: видит applicant и owner, создаёт applicant, обновляет owner
- messages: видят только members, пишут members

### Триггеры:
- Автосоздание profiles при регистрации (auth.users -> profiles)
- Auto-updated_at на всех таблицах

## Файл для выполнения:
`/Users/emo/Desktop/InUni/supabase-complete-schema.sql`

**Запусти этот SQL в Supabase SQL Editor — и все таблицы будут созданы!** 🚀
