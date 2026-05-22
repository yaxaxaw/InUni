# INUNI - Платформа для студентов

Платформа для студентов: хакатоны, команды, карьера, нетворкинг.

## Структура проекта

```
├── inuni-frontend/     # Vue.js фронтенд
├── backend/backend/    # Node.js бэкенд (основной API)
├── backend/src/        # Java бэкенд
├── docker-compose.yml  # Docker конфигурация
└── .env.example        # Пример переменных окружения
```

## Быстрый старт (локальная разработка)

### 1. Клонирование и настройка окружения

```bash
git clone <repo-url>
cd InUni

# Создай .env файл из примера
cp .env.example .env

# Отредактируй .env и заполни реальными значениями:
# - JWT_SECRET (минимум 32 символа)
# - JWT_REFRESH_SECRET (минимум 32 символа)
# - OPENAI_API_KEY (опционально)
# - GROQ_API_KEY (опционально)
```

### 2. Запуск через Docker

```bash
docker-compose up -d
```

Приложение будет доступно:
- Frontend: http://localhost
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5433
- pgAdmin: http://localhost:5050

### 3. Создание администратора

```bash
# Автоматически создаётся при первом запуске
# Логин: admin@inuni.com
# Пароль: admin123
```

## Переменные окружения

| Переменная | Описание | Обязательно |
|------------|----------|-------------|
| `JWT_SECRET` | Секрет для JWT токенов (мин. 32 символа) | ✅ Да |
| `JWT_REFRESH_SECRET` | Секрет для refresh токенов (мин. 32 символа) | ✅ Да |
| `DB_PASSWORD` | Пароль PostgreSQL | Для локальной разработки |
| `OPENAI_API_KEY` | API ключ OpenAI | ❌ Нет |
| `GROQ_API_KEY` | API ключ Groq (быстрый AI) | ❌ Нет |

## Деплой на Railway

### Шаг 1: Подготовка
- Убедись что у тебя есть аккаунт на [Railway](https://railway.app)
- Установи Railway CLI: `npm install -g @railway/cli`

### Шаг 2: Создание проекта
```bash
railway login
railway init
```

### Шаг 3: Настройка переменных окружения
В Railway Dashboard → Variables добавь:
```
JWT_SECRET=<генерируй случайную строку 32+ символов>
JWT_REFRESH_SECRET=<генерируй случайную строку 32+ символов>
OPENAI_API_KEY=<твой ключ OpenAI>
GROQ_API_KEY=<твой ключ Groq>
NODE_ENV=production
PORT=8080
```

### Шаг 4: Деплой
```bash
railway up
```

Railway автоматически:
- Создаст PostgreSQL базу данных
- Подставит DATABASE_URL
- Задеплоит бэкенд

## Безопасность

⚠️ **Важно**: Никогда не коммить файлы `.env` с реальными ключами!

В этом репозитории:
- ✅ Все API ключи читаются из `process.env`
- ✅ `.env` файлы добавлены в `.gitignore`
- ✅ `.env.example` показывает структуру без реальных значений
- ✅ Хардкод ключей удалён из кода

## Технологии

- **Frontend**: Vue 3, Pinia, Vue Router
- **Backend**: Node.js, Express, PostgreSQL
- **AI**: OpenAI API, Groq API
- **Auth**: JWT
- **Deploy**: Docker, Railway

## Лицензия

MIT
