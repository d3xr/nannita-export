# Nannita Export - Проект миграции фронтенда

## 📋 О проекте

Проект **Nannita Export** представляет собой экспорт фронтенд-части платформы [nannita.ru](https://nannita.ru) с целью упрощения архитектуры и создания новой версии приложения.

**Цель:** Переработать фронтенд с упрощением зависимостей и технического стека, сохранив при этом визуальный дизайн, и создать новый бэкенд. Старый проект стал сложным и перегруженным.

**Приоритеты:**
1. 🎯 **Мобильное приложение на React Native** (основная цель)
2. 📱 **Мобильная версия сайта** (текущий этап)
3. 🖥️ **Десктопная версия** (расширенная версия)

## 📂 Структура проекта

```
Nanita_export/
├── nannita_react/          # React компоненты (приоритетная папка)
│   ├── components/         # Все компоненты
│   │   ├── pages/         # 11 страниц приложения
│   │   ├── ui/            # Shadcn UI компоненты (47 компонентов)
│   │   ├── Header.tsx     # Шапка
│   │   ├── Footer.tsx     # Футер
│   │   ├── InfoPage.tsx   # Шаблон инфо-страниц
│   │   ├── TabNavigation.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── RoleSwitcher.tsx
│   │   └── CookieBanner.tsx
│   ├── hooks/             # React хуки
│   ├── contexts/          # React контексты (Auth, Role)
│   ├── lib/               # Утилиты и queryClient
│   ├── types/             # TypeScript типы и Zod схемы
│   ├── styles/            # CSS стили (Tailwind)
│   ├── assets/            # Изображения
│   ├── package.json       # Зависимости
│   ├── tailwind.config.ts # Настройки Tailwind
│   ├── tsconfig.json      # Настройки TypeScript
│   └── README.md          # Документация React компонентов
│
└── nannita_static/         # Статический экспорт HTML/CSS/JS
    ├── *.html             # 11 HTML страниц
    ├── styles.css         # Единый файл стилей
    ├── script.js          # JavaScript для интерактивности
    ├── manifest.json      # PWA манифест
    ├── service-worker.js  # Service Worker для offline
    ├── images/            # Изображения и иконки
    └── README.md          # Документация PWA версии
```

## 🎨 Архитектура React версии (nannita_react)

### Технологический стек

**Core:**
- ⚛️ React 18.3.1
- 🔷 TypeScript 5.6.2
- 🎨 Tailwind CSS 3.4.13

**Routing & State:**
- 🛣️ Wouter 3.3.5 (легкий роутинг)
- 🔄 TanStack Query 5.56.2 (серверное состояние)

**UI Framework:**
- 🎭 Radix UI (UI primitives)
- 💎 Shadcn/ui (47 готовых компонентов)
- 🎯 Lucide React (иконки)

**Forms & Validation:**
- 📝 React Hook Form 7.53.0
- ✅ Zod 3.23.8 (валидация схем)

### Основные страницы (11 штук)

1. **home-v3.tsx** - Главная страница (36KB)
2. **auth-sms.tsx** - Авторизация через SMS (25KB)
3. **order-new.tsx** - Многошаговая форма создания заказа (80KB)
4. **search-results.tsx** - Каталог специалистов (5.5KB)
5. **nanny-profile.tsx** - Профиль няни (28KB)
6. **for-specialists.tsx** - Страница для специалистов (24KB)
7. **agreement.tsx** - Пользовательское соглашение (26KB)
8. **privacy.tsx** - Политика конфиденциальности (26KB)
9. **personal-data-consent.tsx** - Согласие на обработку данных (12KB)
10. **recommendations.tsx** - Рекомендательные технологии (10KB)
11. **offer.tsx** - Оферта (26KB)

### Типы данных (types/schema.ts)

Полная TypeScript/Zod схема базы данных включает:

**Основные сущности:**
- 👤 Users (мультиролевая система)
- 👶 Parent Profiles
- 👩‍🏫 Nanny Profiles (расширенная схема)
- 📋 Orders (заказы услуг)
- 💬 Messages & Conversations
- ⭐ Reviews
- 🔔 Notifications

**Специфичные типы:**
- 🎯 Specialist Types (няня, психолог, репетитор, логопед, дефектолог)
- 📊 Moderation Status
- 🔄 Order Status Flow
- 🎨 UI Helper Types для V2

### Компоненты UI (47 штук)

Полный набор Shadcn UI компонентов:
- Формы: input, select, checkbox, radio, slider
- Диалоги: dialog, alert-dialog, sheet, drawer
- Навигация: tabs, accordion, navigation-menu, breadcrumb
- Данные: table, card, badge, avatar
- Обратная связь: toast, alert, progress, skeleton
- И многое другое...

### Хуки (hooks/)

- `use-auth.ts` - Авторизация
- `use-mobile.ts` - Определение мобильных устройств
- `useRole.ts` - Управление ролями (клиент/специалист)
- `useFeatureFlag.ts` - Feature flags для V2
- `use-toast.ts` - Уведомления

### Контексты (contexts/)

- `AuthContext.tsx` - Контекст авторизации
- `RoleContext.tsx` - Контекст ролей пользователя

## 🚀 Как собрать новый фронтенд

### Вариант 1: Next.js (рекомендуется для SSR/SEO)

```bash
# 1. Создать проект Next.js
npx create-next-app@latest nannita-app --typescript --tailwind --app

# 2. Установить зависимости из nannita_react/package.json
cd nannita-app
npm install react-dom wouter @tanstack/react-query zod \
  @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select \
  @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar \
  @radix-ui/react-dropdown-menu react-hook-form @hookform/resolvers \
  lucide-react class-variance-authority clsx tailwind-merge date-fns

# 3. Скопировать компоненты
cp -r ../Nanita_export/nannita_react/components ./src/
cp -r ../Nanita_export/nannita_react/hooks ./src/
cp -r ../Nanita_export/nannita_react/contexts ./src/
cp -r ../Nanita_export/nannita_react/lib ./src/
cp -r ../Nanita_export/nannita_react/types ./src/
cp -r ../Nanita_export/nannita_react/styles ./src/
cp -r ../Nanita_export/nannita_react/assets ./public/

# 4. Настроить Tailwind
cp ../Nanita_export/nannita_react/tailwind.config.ts ./
cp ../Nanita_export/nannita_react/postcss.config.js ./

# 5. Импортировать стили в layout.tsx
# import '@/styles/index.css'
```

### Вариант 2: Vite (рекомендуется для SPA)

```bash
# 1. Создать проект Vite
npm create vite@latest nannita-app -- --template react-ts

# 2. Установить Tailwind
cd nannita-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Установить зависимости (см. выше)

# 4. Скопировать компоненты (см. выше)

# 5. Настроить path aliases в vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  }
})
```

### Вариант 3: React Native (основная цель)

```bash
# 1. Создать проект Expo
npx create-expo-app nannita-mobile -t expo-template-blank-typescript

# 2. Установить зависимости для React Native
cd nannita-mobile
npx expo install react-native-web @react-navigation/native \
  @react-navigation/stack @react-navigation/bottom-tabs \
  @tanstack/react-query zod react-hook-form @hookform/resolvers

# 3. Портировать компоненты
# - Заменить Radix UI на React Native Paper / Native Base
# - Адаптировать стили с Tailwind на StyleSheet / NativeWind
# - Использовать react-navigation вместо wouter

# 4. Использовать существующую схему данных (types/schema.ts)
# - Скопировать Zod схемы
# - Адаптировать для мобильного API
```

## 📱 Мобильная разработка

### Mobile-First подход (текущий)

Все компоненты в `nannita_react` уже используют mobile-first подход:

```tsx
// Пример из компонентов
<div className="px-4 md:px-6 lg:px-8"> {/* Mobile → Tablet → Desktop */}
  <h1 className="text-2xl md:text-3xl lg:text-4xl">...</h1>
</div>
```

### Адаптация для React Native

**Что нужно заменить:**

1. **UI компоненты:**
   - `@radix-ui/*` → `react-native-paper` или `native-base`
   - `lucide-react` → `react-native-vector-icons`
   - Tailwind CSS → NativeWind или StyleSheet

2. **Навигация:**
   - `wouter` → `@react-navigation/native`

3. **Платформенные API:**
   - Image handling → `expo-image`
   - Camera → `expo-camera`
   - File picker → `expo-document-picker`

## 🔧 Backend API

Компоненты ожидают следующие API endpoints:

```typescript
// Авторизация
POST /api/auth/otp-send       // Отправка OTP кода
POST /api/auth/otp-verify     // Проверка OTP кода
GET  /api/auth/me             // Текущий пользователь

// Специалисты
GET  /api/nannies             // Список нянь (с фильтрами)
GET  /api/nannies/:id         // Профиль няни

// Заказы
GET  /api/orders              // Список заказов
POST /api/orders              // Создание заказа
GET  /api/orders/:id          // Детали заказа

// Отклики
POST /api/applications        // Откликнуться на заказ
GET  /api/applications        // Мои отклики

// Избранное
POST /api/favorites           // Добавить в избранное
DELETE /api/favorites/:id     // Убрать из избранного
```

Полная схема API в `nannita_react/types/schema.ts` (997 строк)

## 🎯 План миграции

### Этап 1: Мобильный сайт (текущий)
✅ Экспорт React компонентов
✅ Статический HTML/CSS/JS PWA
✅ Mobile-first дизайн
✅ 11 готовых страниц

### Этап 2: Новый бэкенд
🔲 REST API на Node.js/Express или Go
🔲 PostgreSQL база данных (схема готова)
🔲 JWT авторизация
🔲 SMS/OTP интеграция (Sigma ProPush)
🔲 Файловое хранилище (S3/MinIO)

### Этап 3: React Native приложение
🔲 Портирование компонентов
🔲 Адаптация UI под нативные паттерны
🔲 Интеграция с нативными API
🔲 Push-уведомления
🔲 Публикация в App Store / Google Play

## 📊 Метрики проекта

**React версия:**
- 11 страниц
- 47 UI компонентов
- 8 хуков
- 2 контекста
- 997 строк схемы данных
- 100% TypeScript

**Зависимости:**
- Основные: 15 пакетов
- Dev: 6 пакетов
- Размер: ~50MB node_modules

**Статическая версия:**
- 11 HTML страниц
- 1 CSS файл (~15KB)
- 1 JS файл (~10KB)
- PWA готова к установке
- Offline режим

## 🔐 Безопасность

**Реализовано:**
- JWT токены для авторизации
- OTP/SMS верификация (эскалация: OTP → Voice → SMS)
- Zod валидация всех форм
- TypeScript для type safety
- HTTPS обязателен для production

**TODO:**
- Rate limiting
- CAPTCHA для форм
- CSP заголовки
- Input sanitization на бэкенде

## 📄 Лицензия и контакты

**Компания:** ООО «Экспресс-Трафик»
**ИНН:** 1683027906
**ОГРН:** 1251600026919
**Email:** support@nannita.ru
**Сайт:** https://nannita.ru

---

## 🚀 Быстрый старт для разработчиков

```bash
# 1. Клонировать репозиторий
git clone https://github.com/d3xr/nannita-export.git
cd nannita-export

# 2. Установить зависимости React версии
cd nannita_react
npm install

# 3. Запустить статическую версию для просмотра
cd ../nannita_static
python3 -m http.server 8000
# Открыть http://localhost:8000

# 4. Создать новый проект на базе компонентов (см. раздел выше)
```

## 📚 Дополнительная документация

- [nannita_react/README.md](nannita_react/README.md) - React компоненты
- [nannita_static/README.md](nannita_static/README.md) - PWA версия
- [types/schema.ts](nannita_react/types/schema.ts) - Схема данных

---

**Версия:** 1.0.0
**Дата:** 2025-10-03
**Статус:** Экспорт завершен, готов к миграции
