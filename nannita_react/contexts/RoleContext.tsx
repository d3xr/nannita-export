import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'wouter';

export type MobileRole = 'client' | 'pro';

interface RoleContextType {
  currentRole: MobileRole;
  availableRoles: MobileRole[];
  switchToRole: (role: MobileRole) => void;
  isRoleAvailable: (role: MobileRole) => boolean;
  hasMultipleRoles: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Маппинг мобильных ролей на системные роли
const ROLE_MAPPING = {
  client: 'parent',
  pro: 'nanny'
} as const;

// Обратный маппинг для определения мобильной роли из системной
const REVERSE_ROLE_MAPPING = {
  parent: 'client',
  nanny: 'pro'
} as const;

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, switchRole, activeRole } = useAuth();
  const [, setLocation] = useLocation();
  const [urlRoleProcessed, setUrlRoleProcessed] = useState(false);

  // Определяем текущую мобильную роль на основе активной роли из AuthContext
  const getCurrentMobileRole = (): MobileRole => {
    if (activeRole === 'parent') return 'client';
    if (activeRole === 'nanny') return 'pro';
    // Fallback к client если роль неизвестна
    return 'client';
  };

  // Определяем доступные мобильные роли на основе ролей пользователя
  const getAvailableRoles = (): MobileRole[] => {
    if (!user?.roles) return [];
    
    const mobileRoles: MobileRole[] = [];
    
    if (user.roles.includes('parent')) {
      mobileRoles.push('client');
    }
    
    if (user.roles.includes('nanny')) {
      mobileRoles.push('pro');
    }
    
    return mobileRoles;
  };

  const currentRole = getCurrentMobileRole();
  const availableRoles = getAvailableRoles();

  const isRoleAvailable = (role: MobileRole): boolean => {
    return availableRoles.includes(role);
  };

  const hasMultipleRoles = availableRoles.length > 1;

  const switchToRole = async (role: MobileRole) => {
    if (!isRoleAvailable(role)) {
      console.warn(`Role ${role} is not available for this user`);
      return;
    }

    const systemRole = ROLE_MAPPING[role];
    
    try {
      await switchRole(systemRole);
      console.log(`🔄 Mobile role switched to ${role} (system: ${systemRole})`);
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  // Обработка URL параметра ?role=client|pro при загрузке страницы
  useEffect(() => {
    if (!user || urlRoleProcessed) return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role') as MobileRole | null;
    
    if (urlRole && (urlRole === 'client' || urlRole === 'pro')) {
      if (isRoleAvailable(urlRole) && urlRole !== currentRole) {
        console.log(`🌐 Switching to role from URL parameter: ${urlRole}`);
        
        // Переключаем роль
        switchToRole(urlRole);
        
        // Очищаем URL параметр
        urlParams.delete('role');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
    
    setUrlRoleProcessed(true);
  }, [user, currentRole, availableRoles, urlRoleProcessed]);

  // Сбрасываем флаг при смене пользователя
  useEffect(() => {
    setUrlRoleProcessed(false);
  }, [user?.id]);

  return (
    <RoleContext.Provider value={{
      currentRole,
      availableRoles,
      switchToRole,
      isRoleAvailable,
      hasMultipleRoles
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}