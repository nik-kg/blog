# Инструкции по развертыванию блога

## Подготовка окружения

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте PostgreSQL базу данных:

```bash
createdb nextjs_blog
```

Скопируйте `.env.example` в `.env` и настройте:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nextjs_blog?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Сгенерируйте секретный ключ:

```bash
openssl rand -base64 32
```

### 3. Применение миграций

```bash
npx prisma generate
npx prisma migrate deploy
```

Или для разработки:

```bash
npx prisma migrate dev
```

### 4. Заполнение тестовыми данными

```bash
npx prisma db seed
```

Будет создан пользователь:
- Email: `admin@blog.com`
- Password: `admin123`

## Запуск проекта

### Режим разработки

```bash
npm run dev
```

Откройте http://localhost:3000

### Production сборка

```bash
npm run build
npm start
```

## Развертывание на сервере

### С помощью PM2

```bash
npm install -g pm2
npm run build
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

### SSL с Certbot

```bash
sudo certbot --nginx -d yourdomain.com
```

## Структура проекта

```
/
├── pages/              # Next.js страницы
│   ├── api/           # API endpoints
│   │   ├── auth/      # Аутентификация
│   │   ├── posts/     # CRUD постов
│   │   ├── categories/# CRUD категорий
│   │   ├── tags/      # CRUD тегов
│   │   └── images/    # Загрузка изображений
│   ├── admin/         # Админ панель
│   │   ├── posts/     # Управление постами
│   │   ├── categories.js
│   │   └── tags.js
│   ├── auth/          # Login/Register
│   └── posts/         # Публичные посты
├── components/        # React компоненты
├── lib/               # Утилиты
├── prisma/            # Схема БД и миграции
├── styles/            # CSS модули
└── public/            # Статика
    └── uploads/       # Загруженные файлы
```

## API Endpoints

### Публичные
- `GET /api/posts` - Список постов
- `GET /api/posts/[id]` - Получить пост
- `GET /api/posts/search?q=query` - Поиск
- `GET /api/categories` - Список категорий
- `GET /api/tags` - Список тегов

### Защищенные (требуют авторизации)
- `POST /api/posts` - Создать пост
- `PUT /api/posts/[id]` - Обновить пост
- `DELETE /api/posts/[id]` - Удалить пост
- `POST /api/categories` - Создать категорию
- `POST /api/tags` - Создать тег
- `POST /api/images/upload` - Загрузить изображение

## Следующие шаги

После успешного развертывания базовой версии, можно:

1. **Phase 7: Добавить TipTap редактор**
   - Заменить textarea на богатый текстовый редактор
   - Добавить toolbar с кнопками форматирования
   - Интегрировать загрузку изображений в редактор

2. **Phase 8: Дополнительные функции**
   - Поиск по фильтрам
   - Пагинация на frontend
   - Сортировка постов

3. **Phase 9: Улучшения**
   - Оптимизация производительности
   - SEO метатеги
   - Sitemap
   - RSS feed

4. **Phase 10: Тестирование и мониторинг**
   - Unit тесты
   - E2E тесты
   - Логирование
   - Мониторинг ошибок

## Возможные проблемы

### Prisma не может подключиться к БД

Проверьте:
- Правильность DATABASE_URL в .env
- Что PostgreSQL запущен
- Что база данных создана

### Ошибка "Cannot find module @prisma/client"

```bash
npx prisma generate
```

### 403 при загрузке изображений

Убедитесь что директория `public/uploads` существует и имеет права на запись.

## Полезные команды

```bash
# Prisma Studio (GUI для БД)
npx prisma studio

# Сброс БД (удалит все данные!)
npx prisma migrate reset

# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Проверка статуса миграций
npx prisma migrate status
```
