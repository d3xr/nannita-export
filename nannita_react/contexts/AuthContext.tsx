import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient, isAuthenticated as hasJWTToken } from '@/lib/auth-client';
import { useLocation } from 'wouter';

interface User {
  id: string;
  firstName: string;
  phone: string;
  email?: string;
  roles: string[];
  activeRole: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeRole: string | null;
  switchRole: (role: string) => Promise<void>;
  getHomePageForRole: (role: string) => string;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  login: (phone: string, code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Главные страницы для каждой роли
  const HOME_PAGES = {
    parent: '/my-orders',
    nanny: '/nanny-dashboard',
    admin: '/admin',
    moderator: '/admin'
  };

  const getHomePageForRole = (role: string): string => {
    return HOME_PAGES[role as keyof typeof HOME_PAGES] || '/my-orders';
  };

  // JWT-based authentication check using AuthClient (replaces legacy)
  const jwtAuthCheck = async () => {
    try {
      const response = await authClient.authenticatedRequest('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        const userRole = data.activeRole || userData.activeRole || 'parent';
        
        setUser(userData);
        setActiveRole(userRole);
        // Синхронизируем с localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('activeRole', userRole);
        
        console.log('🔐 JWT Authentication: User authenticated via AuthClient');
        return true;
      } else {
        console.log('🔐 JWT Authentication: Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('JWT auth check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // 🔐 Enterprise-grade authentication check with Bootstrap (JWT + PostgreSQL sessions)
    const checkAuth = async () => {
      // 🚨 FORCE LOGOUT VERSION - ТОЛЬКО ПРИ ПЕРВОЙ ЗАГРУЗКЕ
      const FORCE_LOGOUT_VERSION = '2025-09-19-v2';
      const savedVersion = localStorage.getItem('forceLogoutVersion');
      
      // ✅ ИСПРАВЛЕНИЕ: Принудительный разлогин только если version разные И нет признака completed
      const forceLogoutCompleted = sessionStorage.getItem('forceLogoutCompleted');
      
      if (savedVersion !== FORCE_LOGOUT_VERSION && !forceLogoutCompleted) {
        console.log('🚨 FORCE LOGOUT: Clearing all authentication data');
        
        // Очищаем все данные авторизации
        localStorage.removeItem('currentUser');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionId');
        
        // Очищаем cookies через logout API
        try {
          await authClient.logout();
        } catch (err) {
          console.log('Force logout API call failed, but continuing');
        }
        
        // Сохраняем новую версию и отмечаем завершение
        localStorage.setItem('forceLogoutVersion', FORCE_LOGOUT_VERSION);
        sessionStorage.setItem('forceLogoutCompleted', 'true');
        
        // Устанавливаем состояние как не авторизованный
        setUser(null);
        setActiveRole(null);
        setIsLoading(false);
        
        console.log('🚨 FORCE LOGOUT COMPLETED - all users logged out');
        return; // Прекращаем дальнейшие проверки авторизации
      }
      
      // 🔐 BOOTSTRAP: Try seamless auto-authentication FIRST
      try {
        console.log('🔐 [BOOTSTRAP] Attempting seamless auto-authentication...');
        const bootstrapResult = await authClient.bootstrap();
        
        if (bootstrapResult.authenticated) {
          // Bootstrap succeeded - set user state directly from response
          setUser(bootstrapResult.user);
          setActiveRole(bootstrapResult.activeRole);
          
          // Sync with localStorage
          localStorage.setItem('currentUser', JSON.stringify(bootstrapResult.user));
          localStorage.setItem('activeRole', bootstrapResult.activeRole);
          
          console.log('🔐 [BOOTSTRAP] Seamless authentication successful - session restored!');
          setIsLoading(false);
          return; // Exit early - no need for fallback logic
        } else {
          console.log('🔐 [BOOTSTRAP] Bootstrap failed - user is guest');
          // НЕ показываем ошибку - пользователь просто не авторизован
          setIsLoading(false);
          return; // Прекращаем дальнейшие попытки авторизации
        }
      } catch (error) {
        console.log('🔐 [BOOTSTRAP] Bootstrap error - user is guest');
        // НЕ показываем ошибку - пользователь просто не авторизован
        setIsLoading(false);
        return; // Прекращаем дальнейшие попытки авторизации
      }

      // FALLBACK: Original authentication logic if bootstrap fails
      const savedUser = localStorage.getItem('currentUser');
      const savedRole = localStorage.getItem('activeRole');
      
      try {
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setActiveRole(savedRole || parsedUser.activeRole || 'parent');
          } catch (parseError) {
            console.error('Failed to parse saved user:', parseError);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('activeRole');
          }
        }
        
        // Проверяем JWT токены и получаем актуальные данные пользователя
        if (hasJWTToken()) {
          try {
            const userData = await authClient.getCurrentUser();
            const userRole = userData.activeRole || userData.activeRole || 'parent';
            
            setUser(userData);
            setActiveRole(userRole);
            // Синхронизируем с localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('activeRole', userRole);
            
            console.log('🔐 JWT Authentication: User authenticated');
          } catch (error) {
            console.error('JWT auth check failed:', error);
            // Fallback на JWT-based проверку через AuthClient
            const jwtSuccess = await jwtAuthCheck();
            if (!jwtSuccess && !savedUser) {
              setUser(null);
              setActiveRole(null);
            }
          }
        } else {
          // Fallback на JWT-based проверку через AuthClient
          const jwtSuccess = await jwtAuthCheck();
          if (!jwtSuccess && !savedUser) {
            setUser(null);
            setActiveRole(null);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error checking auth:', error);
        // В случае ошибки сети или сервера, используем данные из localStorage
        // НЕ очищаем localStorage - пользователь останется авторизованным
        if (savedUser) {
          console.log('Используем данные из localStorage (сервер недоступен)');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Слушаем изменения в localStorage для синхронизации между вкладками
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Failed to parse user from storage event:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setActiveRole(newUser.activeRole);
      localStorage.setItem('activeRole', newUser.activeRole);
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('activeRole');
      setActiveRole(null);
    }
    
    // Принудительное обновление для всех вкладок
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'currentUser',
      newValue: newUser ? JSON.stringify(newUser) : null,
      oldValue: localStorage.getItem('currentUser')
    }));
  };

  const switchRole = async (role: string) => {
    try {
      const response = await authClient.authenticatedRequest('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        // Сервер успешно переключил роль
        const data = await response.json();
        setActiveRole(role);
        localStorage.setItem('activeRole', role);
        
        // Обновляем пользователя с новой активной ролью
        if (user) {
          const updatedUser = { ...user, activeRole: role };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      } else if (response.status === 401) {
        // Сервер не авторизован, переключаем роль локально
        console.log('Server session expired, switching role locally');
        setActiveRole(role);
        localStorage.setItem('activeRole', role);
        
        // Обновляем пользователя с новой активной ролью
        if (user) {
          const updatedUser = { ...user, activeRole: role };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      } else {
        throw new Error(`Failed to switch role: ${response.status}`);
      }
      
      // После успешного переключения роли - сразу переходим на домашнюю страницу новой роли
      const homePage = getHomePageForRole(role);
      console.log(`✅ Role switched to ${role}, redirecting to ${homePage}`);
      setLocation(homePage);
      
    } catch (error) {
      console.error('Error switching role:', error);
      // В случае сетевой ошибки тоже переключаем локально
      console.log('Network error, switching role locally');
      setActiveRole(role);
      localStorage.setItem('activeRole', role);
      
      if (user) {
        const updatedUser = { ...user, activeRole: role };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Даже при ошибке делаем redirect
      const homePage = getHomePageForRole(role);
      console.log(`✅ Role switched locally to ${role}, redirecting to ${homePage}`);
      setLocation(homePage);
    }
  };

  // 🔐 Enterprise JWT login function
  const login = async (phone: string, code: string): Promise<boolean> => {
    try {
      const authResponse = await authClient.login(phone, code);
      
      if (authResponse.success) {
        setUser(authResponse.user);
        setActiveRole(authResponse.user.activeRole || 'parent');
        
        // Синхронизируем с localStorage
        localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
        localStorage.setItem('activeRole', authResponse.user.activeRole || 'parent');
        
        console.log('🔐 Enterprise login successful:', authResponse.user.id);
        
        // ИСПРАВЛЕНИЕ: Добавляем редирект после успешного логина
        const userRole = authResponse.user.activeRole || 'parent';
        const homePage = getHomePageForRole(userRole);
        console.log(`✅ Login successful, redirecting to ${homePage} for role ${userRole}`);
        
        // Небольшая задержка для показа спиннера пользователю
        setTimeout(() => {
          setLocation(homePage);
        }, 500);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Enterprise login failed:', error);
      return false;
    }
  };

  // 🔐 Enterprise logout function
  const logout = async () => {
    try {
      // Используем enterprise logout с JWT поддержкой
      await authClient.logout();
    } catch (error) {
      console.error('Error during enterprise logout:', error);
    }
    
    // Очищаем все данные при явном logout
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeRole');
    
    console.log('🔐 Enterprise logout completed');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      setUser: updateUser,
      activeRole,
      switchRole,
      getHomePageForRole,
      isAuthenticated,
      logout,
      login
    }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nannita-orange"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}