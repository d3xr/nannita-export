import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

// Страницы, НЕДОСТУПНЫЕ для роли (остальные доступны)
const RESTRICTED_PAGES = {
  parent: [
    '/nanny-dashboard', '/available-orders', '/nanny-orders', '/nanny-orders-new', 
    '/nanny-offers', '/my-responses', '/nanny-onboarding', '/nanny-profile-edit'
  ],
  nanny: [
    '/my-orders', '/order', '/offers', '/favorites'
  ],
  admin: [],
  moderator: []
};

// Главные страницы для каждой роли (должно совпадать с AuthContext)
const HOME_PAGES = {
  parent: '/my-orders',
  nanny: '/nanny-dashboard',
  admin: '/admin',
  moderator: '/admin'
};

export function useRoleRedirect() {
  const { activeRole, isAuthenticated, user } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Проверяем только для авторизованных пользователей с активной ролью
    if (!isAuthenticated || !activeRole) {
      return;
    }

    const currentPath = location.split('?')[0]; // Убираем query parameters
    
    // Если мы на странице авторизации с returnUrl - не редиректим
    if (currentPath === '/auth-sms' && location.includes('returnUrl=')) {
      return;
    }
    
    // Специальная проверка для админки - только пользователи с правами могут туда зайти
    if (currentPath === '/admin' || currentPath === '/admin-dashboard' || currentPath.startsWith('/admin/')) {
      const hasAdminAccess = user?.roles?.includes('admin') || user?.roles?.includes('moderator');
      const cleanPhone = user?.phone?.replace(/[+\s()-]/g, '');
      const isSuperUser = cleanPhone === '79046612477' || cleanPhone === '89046612477' || cleanPhone === '79046675449';
      
      if (hasAdminAccess || isSuperUser) {
        return; // Разрешаем доступ к админке
      } else {
        // Нет прав доступа к админке - редиректим на домашнюю страницу
        const homePage = HOME_PAGES[activeRole as keyof typeof HOME_PAGES];
        console.log(`⛔ Access denied: ${currentPath} for role ${activeRole}, redirecting to ${homePage}`);
        navigate(homePage);
        return;
      }
    }
    
    // Проверяем только СТРОГО ЗАПРЕЩЕННЫЕ страницы для данной роли
    const restrictedPages = RESTRICTED_PAGES[activeRole as keyof typeof RESTRICTED_PAGES] || [];
    
    const isPageRestricted = restrictedPages.some(restrictedPath => {
      if (restrictedPath === currentPath) return true;
      // Динамические маршруты
      if (restrictedPath === '/order-detail' && currentPath.startsWith('/order-detail/')) return true;
      return false;
    });

    // Только если страница СТРОГО ЗАПРЕЩЕНА - делаем редирект
    if (isPageRestricted) {
      const homePage = HOME_PAGES[activeRole as keyof typeof HOME_PAGES];
      console.log(`⛔ Restricted page: ${currentPath} for role ${activeRole}, redirecting to ${homePage}`);
      navigate(homePage);
    }
  }, [activeRole, location, isAuthenticated, navigate, user]);
}