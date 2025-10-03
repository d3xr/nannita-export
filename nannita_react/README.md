# Nannita React Components

Экспорт React компонентов для Nannita платформы.

## Структура

```
components/
  pages/          # 11 страниц приложения
  ui/             # Shadcn UI компоненты
  Header.tsx      # Шапка сайта
  Footer.tsx      # Подвал
  InfoPage.tsx    # Шаблон инфо-страниц
  TabNavigation.tsx
  FavoriteButton.tsx
  RoleSwitcher.tsx
  CookieBanner.tsx
hooks/            # React хуки
contexts/         # React контексты (Auth, Role)
lib/              # Утилиты и queryClient
types/            # TypeScript типы и Zod схемы
styles/           # CSS стили (Tailwind)
assets/           # Изображения
```

## Установка

```bash
npm install
```

## Использование

### Импорт страницы:
```tsx
import HomeV3 from './components/pages/home-v3';
```

### Импорт компонента:
```tsx
import Header from './components/Header';
import { Button } from './components/ui/button';
```

### Импорт хука:
```tsx
import { useAuth } from './hooks/use-auth';
```

## Зависимости

Все необходимые пакеты указаны в package.json:
- React 18
- Wouter (роутинг)
- TanStack Query (state management)
- Radix UI (UI primitives)
- Tailwind CSS (стилизация)
- Zod (валидация)

## Страницы

1. **home-v3.tsx** - Главная страница
2. **agreement.tsx** - Пользовательское соглашение
3. **privacy.tsx** - Политика конфиденциальности
4. **personal-data-consent.tsx** - Согласие на обработку данных
5. **recommendations.tsx** - Рекомендательные технологии
6. **offer.tsx** - Оферта
7. **for-specialists.tsx** - Для специалистов
8. **order-new.tsx** - Создание заявки
9. **auth-sms.tsx** - Авторизация
10. **search-results.tsx** - Поиск нянь
11. **nanny-profile.tsx** - Профиль няни

## Настройка

### Tailwind CSS
Скопируйте `tailwind.config.ts` и `postcss.config.js` в корень проекта.

### TypeScript
Используйте `tsconfig.json` или настройте path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./components/*"],
      "@hooks/*": ["./hooks/*"],
      "@lib/*": ["./lib/*"]
    }
  }
}
```

### Стили
Импортируйте `styles/index.css` в главный файл приложения.

## Интеграция

### С Next.js:
```tsx
import HomeV3 from '@/components/pages/home-v3';

export default function Home() {
  return <HomeV3 />;
}
```

### С Vite:
```tsx
import { Route } from 'wouter';
import HomeV3 from './components/pages/home-v3';

function App() {
  return (
    <Route path="/" component={HomeV3} />
  );
}
```

### С Create React App:
```tsx
import { BrowserRouter, Route } from 'react-router-dom';
import HomeV3 from './components/pages/home-v3';

function App() {
  return (
    <BrowserRouter>
      <Route path="/" element={<HomeV3 />} />
    </BrowserRouter>
  );
}
```

## Backend API

Компоненты ожидают следующие API endpoints:

- `/api/auth/me` - текущий пользователь
- `/api/nannies` - список нянь
- `/api/orders` - заказы
- `/api/auth/otp-send` - отправка OTP кода
- `/api/auth/otp-verify` - проверка OTP кода

См. `types/schema.ts` для полных TypeScript типов.

## Поддержка

Эти компоненты экспортированы из Nannita платформы.
Для вопросов и поддержки обратитесь к основному репозиторию.
