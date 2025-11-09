# Next.js Blog with TipTap Editor

Полнофункциональный блог на Next.js с CRUD операциями и богатым текстовым редактором TipTap.

## Технологии

- **Frontend:** Next.js 15 (Pages Router), React 18
- **База данных:** PostgreSQL с Prisma ORM
- **Аутентификация:** NextAuth.js
- **Редактор:** TipTap (будет добавлен в Phase 7)
- **Стилизация:** CSS Modules

## Возможности

- ✅ CRUD операции для постов
- ✅ Категории и теги
- ✅ Система черновиков и публикаций
- ✅ Загрузка изображений
- ✅ Поиск по постам
- ✅ Фильтрация и сортировка
- ✅ Простая аутентификация
- 🚧 Богатый текстовый редактор TipTap (в разработке)

## Требования

- Node.js 18+
- PostgreSQL 12+
- npm или yarn

## Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd blog
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

Создайте PostgreSQL базу данных:

```bash
createdb nextjs_blog
```

Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/nextjs_blog?schema=public"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Применение миграций

```bash
npx prisma migrate deploy
```

Или для разработки:

```bash
npx prisma migrate dev
```

### 5. Заполнение тестовыми данными (опционально)

```bash
npx prisma db seed
```

Будет создан тестовый пользователь:
- Email: `admin@blog.com`
- Password: `admin123`

### 6. Генерация Prisma Client

```bash
npx prisma generate
```

## Запуск

### Режим разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Production сборка

```bash
npm run build
npm start
```

## Структура проекта

```
/
├── pages/              # Next.js страницы
│   ├── api/           # API endpoints
│   ├── admin/         # Админ панель
│   ├── auth/          # Страницы аутентификации
│   ├── posts/         # Страницы постов
│   ├── categories/    # Страницы категорий
│   └── tags/          # Страницы тегов
├── components/        # React компоненты
├── lib/               # Утилиты и хелперы
│   ├── prisma.js     # Prisma client
│   ├── auth.js       # Утилиты аутентификации
│   ├── slugify.js    # Генерация slug
│   ├── date.js       # Форматирование дат
│   ├── validation.js # Валидация
│   └── api-error.js  # Обработка ошибок API
├── prisma/            # Prisma schema и миграции
│   ├── schema.prisma # Схема базы данных
│   ├── migrations/   # Миграции
│   └── seed.js       # Seed данные
├── styles/            # CSS файлы
└── public/            # Статические файлы
    └── uploads/       # Загруженные изображения
```

## База данных

### Модели

- **User** - Пользователи системы
- **Post** - Статьи блога
- **Category** - Категории
- **Tag** - Теги
- **PostCategory** - Связь постов и категорий (many-to-many)
- **PostTag** - Связь постов и тегов (many-to-many)
- **Image** - Загруженные изображения

### Prisma команды

```bash
# Создать миграцию
npx prisma migrate dev --name migration_name

# Применить миграции
npx prisma migrate deploy

# Открыть Prisma Studio (GUI для БД)
npx prisma studio

# Сгенерировать Prisma Client
npx prisma generate

# Сбросить БД (удалит все данные!)
npx prisma migrate reset
```

## API Endpoints

### Аутентификация
- `POST /api/auth/signin` - Вход
- `POST /api/auth/signout` - Выход

### Посты
- `GET /api/posts` - Список постов
- `GET /api/posts/[id]` - Получить пост
- `POST /api/posts` - Создать пост (требует авторизации)
- `PUT /api/posts/[id]` - Обновить пост (требует авторизации)
- `DELETE /api/posts/[id]` - Удалить пост (требует авторизации)

### Категории
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию (требует авторизации)
- `PUT /api/categories/[id]` - Обновить категорию (требует авторизации)
- `DELETE /api/categories/[id]` - Удалить категорию (требует авторизации)

### Теги
- `GET /api/tags` - Список тегов
- `POST /api/tags` - Создать тег (требует авторизации)
- `PUT /api/tags/[id]` - Обновить тег (требует авторизации)
- `DELETE /api/tags/[id]` - Удалить тег (требует авторизации)

### Изображения
- `POST /api/images/upload` - Загрузить изображение (требует авторизации)

## Разработка

План разработки доступен в файле [todo.md](./todo.md)

### Текущий статус

- ✅ Phase 1: Initial Setup (завершена)
- ✅ Phase 2: Database Schema (завершена)
- 🚧 Phase 3: Authentication (в процессе)
- ⏳ Phase 4-10: Запланированы

## Деплой

### Подготовка

1. Установите переменные окружения на production сервере
2. Настройте PostgreSQL базу данных
3. Соберите проект: `npm run build`

### С помощью PM2

```bash
npm install -g pm2
pm2 start npm --name "nextjs-blog" -- start
pm2 save
pm2 startup
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Лицензия

MIT
