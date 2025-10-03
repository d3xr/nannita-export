# Инструкция по синхронизации статических страниц с React версией

## 🎯 Основная задача

Обновить **ВСЕ** статические HTML страницы (`nannita_static/*.html`) на основе React компонентов (`nannita_react/components/pages/*.tsx`), обеспечив консистентный дизайн и функциональность на всех страницах.

## 📋 Список страниц для синхронизации

### Приоритет 1 (Критические страницы)
1. ✅ **index.html** ← `home-v3.tsx` - Главная страница
2. ✅ **auth.html** ← `auth-sms.tsx` - Авторизация через SMS
3. ✅ **order-new.html** ← `order-new.tsx` - Создание заявки (многошаговая форма)
4. ✅ **search-results.html** ← `search-results.tsx` - Каталог специалистов
5. ✅ **nanny-profile.html** ← `nanny-profile.tsx` - Профиль няни

### Приоритет 2 (Информационные страницы)
6. ✅ **for-specialists.html** ← `for-specialists.tsx` - Для специалистов
7. ✅ **agreement.html** ← `agreement.tsx` - Пользовательское соглашение
8. ✅ **privacy.html** ← `privacy.tsx` - Политика конфиденциальности
9. ✅ **personal-data-consent.html** ← `personal-data-consent.tsx` - Согласие на обработку данных
10. ✅ **recommendations.html** ← `recommendations.tsx` - Рекомендательные технологии
11. ✅ **offer.html** ← `offer.tsx` - Оферта

## 🎨 Требования к консистентности дизайна

### Единые компоненты на всех страницах

#### 1. Header (Шапка)
**Источник:** `/nannita_react/components/Header.tsx`

**Обязательные элементы:**
- Логотип Nannita (кликабельный, ведет на главную)
- **HH-style переключатель ролей** (Ищу специалиста / Ищу работу)
- Навигационное меню (десктоп)
- Мобильное меню (гамбургер)
- Кнопки:
  - "Войти" (если не авторизован)
  - Аватар пользователя (если авторизован)

**HTML структура:**
```html
<header class="header">
  <div class="container">
    <a href="/" class="logo">
      <img src="/images/logo-black.png" alt="Nannita">
    </a>

    <!-- HH-style Role Dropdown -->
    <div class="role-dropdown">
      <button class="role-dropdown-trigger" id="roleDropdownBtn">
        <span id="roleDropdownText">Ищу специалиста</span>
        <svg class="chevron-icon">...</svg>
      </button>
      <div class="role-dropdown-menu" id="roleDropdownMenu">
        <button data-role="client">Ищу специалиста</button>
        <button data-role="pro">Ищу работу</button>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <nav class="nav-desktop">
      <a href="/search-results.html">Найти специалиста</a>
      <a href="/for-specialists.html">Для специалистов</a>
      <a href="/order-new.html">Разместить заявку</a>
    </nav>

    <!-- Mobile Menu Toggle -->
    <button class="mobile-menu-toggle" id="mobileMenuBtn">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Auth Button -->
    <a href="/auth.html" class="btn-auth">Войти</a>
  </div>

  <!-- Mobile Navigation -->
  <nav class="nav-mobile" id="mobileMenu">
    <a href="/search-results.html">Найти специалиста</a>
    <a href="/for-specialists.html">Для специалистов</a>
    <a href="/order-new.html">Разместить заявку</a>
    <a href="/auth.html">Войти</a>
  </nav>
</header>
```

#### 2. Footer (Подвал)
**Источник:** `/nannita_react/components/Footer.tsx`

**Обязательные элементы:**
- Логотип Nannita
- 4 колонки навигации:
  - **Сервис** (О нас, Контакты, FAQ)
  - **Для клиентов** (Найти специалиста, Создать заявку, Тарифы)
  - **Для специалистов** (Стать специалистом, Как это работает, Правила)
  - **Документы** (Оферта, Политика, Соглашение)
- Социальные сети (если есть)
- Copyright © 2025 ООО «Экспресс-Трафик»
- ИНН, ОГРН

#### 3. Cookie Banner
**Источник:** `/nannita_react/components/CookieBanner.tsx`

**На всех страницах** (кроме юридических):
```html
<div class="cookie-banner" id="cookieBanner">
  <div class="cookie-content">
    <p>Мы используем файлы cookie для улучшения работы сайта.
       Продолжая использовать сайт, вы соглашаетесь с
       <a href="/privacy.html">политикой конфиденциальности</a>.</p>
    <button class="btn-primary" id="acceptCookies">Принять</button>
  </div>
</div>
```

### Единая цветовая схема

```css
:root {
  /* Primary Colors */
  --color-primary: #FF6B35;        /* Оранжевый - основной */
  --color-primary-hover: #E55A24;  /* Оранжевый темнее */
  --color-secondary: #004E89;      /* Синий */
  --color-secondary-hover: #003D6D;

  /* Status Colors */
  --color-success: #10B981;        /* Зелёный */
  --color-warning: #F59E0B;        /* Желтый */
  --color-error: #EF4444;          /* Красный */
  --color-info: #3B82F6;           /* Голубой */

  /* Neutral Colors */
  --color-white: #FFFFFF;
  --color-black: #000000;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
}
```

### Единые UI компоненты

#### Кнопки
```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-gray-700);
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost:hover {
  background: var(--color-gray-100);
}
```

#### Карточки
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
}
.card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-gray-900);
}

.card-description {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  line-height: 1.6;
}
```

#### Формы
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input.error {
  border-color: var(--color-error);
}

.form-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: 0.25rem;
}
```

#### Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.badge-primary {
  background: rgba(255, 107, 53, 0.1);
  color: var(--color-primary);
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}
```

## 📱 Mobile-First подход

### Брейкпоинты (обязательны на всех страницах)

```css
/* Mobile (базовый) - 0-767px */
.container {
  padding: 0 1rem;
  max-width: 100%;
}

/* Tablet - 768px+ */
@media (min-width: 768px) {
  .container {
    padding: 0 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop - 1024px+ */
@media (min-width: 1024px) {
  .container {
    padding: 0 2rem;
    max-width: 1024px;
  }
}

/* Large Desktop - 1280px+ */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### Адаптивная типографика

```css
/* Headings */
h1 {
  font-size: 2rem;      /* 32px mobile */
  line-height: 1.2;
}

@media (min-width: 768px) {
  h1 { font-size: 2.5rem; }  /* 40px tablet */
}

@media (min-width: 1024px) {
  h1 { font-size: 3rem; }    /* 48px desktop */
}

h2 {
  font-size: 1.5rem;    /* 24px mobile */
  line-height: 1.3;
}

@media (min-width: 768px) {
  h2 { font-size: 2rem; }    /* 32px tablet */
}

@media (min-width: 1024px) {
  h2 { font-size: 2.25rem; } /* 36px desktop */
}
```

## 🔧 JavaScript функциональность

### Обязательный функционал на всех страницах

#### 1. Role Switcher (Переключатель ролей)
```javascript
// В script.js
document.addEventListener('DOMContentLoaded', function() {
  // Role Switcher
  const roleDropdownBtn = document.getElementById('roleDropdownBtn');
  const roleDropdownMenu = document.getElementById('roleDropdownMenu');
  const roleDropdownText = document.getElementById('roleDropdownText');

  // Загрузить текущую роль из localStorage
  const currentRole = localStorage.getItem('userRole') || 'client';
  updateRoleDisplay(currentRole);

  // Toggle dropdown
  roleDropdownBtn?.addEventListener('click', function(e) {
    e.stopPropagation();
    roleDropdownMenu.classList.toggle('active');
  });

  // Переключение роли
  roleDropdownMenu?.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
      const newRole = this.dataset.role;
      localStorage.setItem('userRole', newRole);
      updateRoleDisplay(newRole);
      roleDropdownMenu.classList.remove('active');

      // Опционально: редирект или обновление контента
      updatePageForRole(newRole);
    });
  });

  // Закрыть при клике вне
  document.addEventListener('click', function() {
    roleDropdownMenu?.classList.remove('active');
  });

  function updateRoleDisplay(role) {
    const text = role === 'client' ? 'Ищу специалиста' : 'Ищу работу';
    if (roleDropdownText) {
      roleDropdownText.textContent = text;
    }
  }

  function updatePageForRole(role) {
    // Здесь логика обновления контента страницы под роль
    // Например, показать/скрыть определенные блоки
  }
});
```

#### 2. Mobile Menu
```javascript
// Мобильное меню
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn?.addEventListener('click', function() {
  this.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open');
});

// Закрыть меню при клике на ссылку
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function() {
    mobileMenuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
  });
});
```

#### 3. Cookie Banner
```javascript
// Cookie Banner
const cookieBanner = document.getElementById('cookieBanner');
const acceptCookiesBtn = document.getElementById('acceptCookies');

if (!localStorage.getItem('cookiesAccepted')) {
  cookieBanner?.classList.add('show');
}

acceptCookiesBtn?.addEventListener('click', function() {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.classList.remove('show');
});
```

#### 4. Form Validation
```javascript
// Валидация форм (пример)
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let isValid = true;
    const inputs = form.querySelectorAll('.form-input[required]');

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error');
        showError(input, 'Это поле обязательно');
        isValid = false;
      } else {
        input.classList.remove('error');
        hideError(input);
      }
    });

    if (isValid) {
      // Отправить форму
      form.submit();
    }
  });
}

function showError(input, message) {
  let errorDiv = input.nextElementSibling;
  if (!errorDiv || !errorDiv.classList.contains('form-error')) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }
  errorDiv.textContent = message;
}

function hideError(input) {
  const errorDiv = input.nextElementSibling;
  if (errorDiv?.classList.contains('form-error')) {
    errorDiv.remove();
  }
}
```

## 📄 Пошаговая инструкция для каждой страницы

### Шаг 1: Анализ React компонента
1. Открыть соответствующий `.tsx` файл из `/nannita_react/components/pages/`
2. Изучить структуру JSX
3. Выписать все используемые компоненты
4. Определить state и логику

### Шаг 2: Конвертация структуры
1. JSX → HTML5 семантическая разметка
2. Сохранить иерархию элементов
3. Заменить React компоненты на HTML:
   - `<Button>` → `<button class="btn-primary">`
   - `<Card>` → `<div class="card">`
   - `<Input>` → `<input class="form-input">`
   - `<Badge>` → `<span class="badge">`

### Шаг 3: Стили
1. Tailwind классы → CSS классы в `styles.css`
2. Использовать CSS переменные из единой схемы
3. Применить mobile-first подход

### Шаг 4: JavaScript
1. React hooks (`useState`, `useEffect`) → vanilla JS
2. Event handlers → `addEventListener`
3. Условный рендеринг → `display: none/block`

### Шаг 5: Тестирование
1. Проверить на мобильном (< 768px)
2. Проверить на планшете (768px - 1023px)
3. Проверить на десктопе (> 1024px)
4. Проверить все интерактивные элементы

## 🎯 Специфика по страницам

### 1. index.html (Главная)
**Особенности:**
- Hero секция с градиентом
- 4 карточки преимуществ с иконками
- Секция "Как это работает" (3 шага)
- Отзывы (слайдер опционально)
- CTA секция внизу

**Ключевые элементы из home-v3.tsx:**
- `HHStyleRoleDropdown` - обязательно!
- Кнопки с правильными ссылками
- Иконки из `/images/Shield_icon_*.png`, `/images/Users_icon_*.png` и т.д.

### 2. auth.html (Авторизация)
**Особенности:**
- Форма ввода телефона
- OTP код (6 цифр)
- Таймер повторной отправки
- Эскалация: OTP → Voice → SMS

**Из auth-sms.tsx:**
- Multi-step форма
- Валидация телефона (маска +7)
- InputOTP компонент (6 полей)
- Логика таймера

### 3. order-new.html (Создание заявки)
**Особенности:**
- Многошаговая форма (4-5 шагов)
- Progress bar вверху
- Условные поля (зависят от выбора)
- Сохранение в localStorage

**Из order-new.tsx:**
- Stepper navigation
- Form validation на каждом шаге
- Данные детей (динамические поля)
- Календарь выбора даты

### 4. search-results.html (Каталог)
**Особенности:**
- Фильтры (sidebar на десктопе)
- Карточки специалистов
- Пагинация
- Избранное (иконка сердца)

**Из search-results.tsx:**
- Filter panel
- Nanny cards с фото и рейтингом
- "Добавить в избранное" функция

### 5. nanny-profile.html (Профиль няни)
**Особенности:**
- Фото и основная информация
- Табы (О себе, Отзывы, Портфолио)
- Кнопка "Написать" / "Предложить заказ"
- Рейтинг и отзывы

**Из nanny-profile.tsx:**
- Tabs navigation
- Reviews section
- Contact buttons

### 6. for-specialists.html (Для специалистов)
**Особенности:**
- Тарифные планы (3 колонки)
- FAQ аккордеон
- Форма регистрации
- Преимущества работы

**Из for-specialists.tsx:**
- Pricing cards с hover эффектами
- Accordion для FAQ
- Registration CTA

### 7-11. Юридические страницы
**Особенности:**
- Простая типографика
- Оглавление (Table of Contents)
- Якорные ссылки
- Без Cookie Banner

**Из InfoPage.tsx:**
- TOC navigation (sticky на десктопе)
- Structured content sections
- Last updated date

## ✅ Чек-лист для каждой страницы

### HTML
- [ ] Валидный HTML5 (проверить на validator.w3.org)
- [ ] Семантические теги (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`)
- [ ] Атрибуты `alt` для всех изображений
- [ ] Meta теги (title, description, og:image)
- [ ] Canonical URL
- [ ] Favicon и app icons

### CSS
- [ ] Mobile-first медиа-запросы
- [ ] Использованы CSS переменные
- [ ] Все цвета из единой палитры
- [ ] Hover эффекты на интерактивных элементах
- [ ] Transitions для плавности
- [ ] Нет inline стилей

### JavaScript
- [ ] Нет ошибок в консоли
- [ ] Все event listeners работают
- [ ] localStorage используется корректно
- [ ] Форм валидация работает
- [ ] Работает без JS (progressive enhancement)

### Компоненты
- [ ] Header идентичен на всех страницах
- [ ] Footer идентичен на всех страницах
- [ ] Role Switcher работает везде
- [ ] Mobile menu работает
- [ ] Cookie banner показывается

### Дизайн
- [ ] Консистентные отступы
- [ ] Одинаковые border-radius
- [ ] Единые тени (shadows)
- [ ] Одинаковые кнопки
- [ ] Совпадающая типографика

### Доступность (A11y)
- [ ] Контраст текста минимум 4.5:1
- [ ] Все кнопки имеют aria-label (если нужно)
- [ ] Формы имеют labels
- [ ] Фокус виден (outline)
- [ ] Можно навигировать с клавиатуры

### Производительность
- [ ] Изображения оптимизированы
- [ ] CSS минифицирован (для продакшена)
- [ ] JS минифицирован (для продакшена)
- [ ] Lazy loading для изображений
- [ ] Preload для критичных ресурсов

### PWA
- [ ] manifest.json подключен
- [ ] service-worker.js зарегистрирован
- [ ] Страница добавлена в urlsToCache
- [ ] Работает offline

## 🚀 Порядок выполнения

### Этап 1: Критические страницы (1-2 дня)
1. index.html (главная) - **самый высокий приоритет**
2. auth.html (авторизация)
3. order-new.html (создание заявки)
4. search-results.html (каталог)
5. nanny-profile.html (профиль)

### Этап 2: Остальные страницы (1 день)
6. for-specialists.html
7-11. Юридические страницы (можно параллельно)

### Этап 3: Полировка (0.5 дня)
- Финальная проверка всех страниц
- Тестирование на реальных устройствах
- Исправление багов
- Оптимизация производительности

## 📚 Справочные материалы

### Исходные файлы React
```
/nannita_react/
  components/
    pages/
      home-v3.tsx          → index.html
      auth-sms.tsx         → auth.html
      order-new.tsx        → order-new.html
      search-results.tsx   → search-results.html
      nanny-profile.tsx    → nanny-profile.html
      for-specialists.tsx  → for-specialists.html
      agreement.tsx        → agreement.html
      privacy.tsx          → privacy.html
      personal-data-consent.tsx → personal-data-consent.html
      recommendations.tsx  → recommendations.html
      offer.tsx            → offer.html
    Header.tsx
    Footer.tsx
    CookieBanner.tsx
    RoleSwitcher.tsx
    FavoriteButton.tsx
    TabNavigation.tsx
  styles/
    index.css
```

### Целевые файлы
```
/nannita_static/
  *.html          (все 11 страниц)
  styles.css      (единый файл стилей)
  script.js       (единый файл JS)
  images/         (иконки и изображения)
  manifest.json
  service-worker.js
```

## 🎯 Критерии успеха

### Визуальная идентичность
✅ Статическая версия **визуально идентична** React версии
✅ Все компоненты выглядят одинаково на всех страницах
✅ Цвета, шрифты, отступы совпадают

### Функциональность
✅ Все интерактивные элементы работают
✅ Формы валидируются корректно
✅ Навигация работает без ошибок
✅ Mobile menu работает плавно

### Адаптивность
✅ Отлично выглядит на мобильных (320px - 767px)
✅ Корректно отображается на планшетах (768px - 1023px)
✅ Красиво на десктопе (1024px+)
✅ Нет горизонтального скролла

### Производительность
✅ Lighthouse Score > 90 (Performance)
✅ Страницы загружаются < 2 сек на 3G
✅ PWA готова к установке
✅ Работает offline

### Качество кода
✅ Валидный HTML5
✅ Читаемый CSS (с комментариями)
✅ Чистый JavaScript (без багов)
✅ SEO оптимизация

## 🔥 Начни с главной страницы!

**Первая задача:** Синхронизировать `index.html` с `home-v3.tsx`

1. Прочитай `/nannita_react/components/pages/home-v3.tsx`
2. Прочитай `/nannita_react/components/Header.tsx`
3. Прочитай `/nannita_react/components/Footer.tsx`
4. Обнови `/nannita_static/index.html`
5. Обнови `/nannita_static/styles.css`
6. Обнови `/nannita_static/script.js`
7. Протестируй на разных устройствах

**После этого переходи к остальным страницам по очереди!**

---

## 📞 Контакты для вопросов

Если возникнут вопросы по дизайну или функциональности, обратись к исходным React компонентам - они содержат все ответы.

**Главное правило:** React версия - источник истины. Статическая версия должна максимально точно повторять функциональность и дизайн.

---

**Версия инструкции:** 1.0
**Дата:** 2025-10-03
**Статус:** Актуально
