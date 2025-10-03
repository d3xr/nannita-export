import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, User, LogOut, UserCheck, Users, Menu, MapPin } from 'lucide-react';

export default function Header() {
  const [selectedCity, setSelectedCity] = useState("Казань");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, activeRole, logout, switchRole, getHomePageForRole } = useAuth();
  
  const cities = ["Казань", "Москва", "Санкт-Петербург"];
  const isHomePage = location === '/';

  // Алерт статуса профиля няни теперь отображается в админском блоке nanny-dashboard.tsx

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHomePage 
        ? (isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent')
        : 'bg-white shadow-sm'
    }`}>
      <div className="container-lg">
        <div className="flex items-center justify-between py-4">
          
          {/* Logo */}
          <Link href="/">
            <img 
              src="/logo-black.png"
              alt="Nannita" 
              className="h-6 cursor-pointer"
            />
          </Link>
          
          {/* Right side */}
          <div className="flex items-center space-x-6">
            
            {/* Алерт статуса няни перенесен в админский блок */}
            
            {/* City Selector */}
            <div className="relative">
              <div 
                className="hidden md:flex items-center cursor-pointer"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
              >
                <span className="font-semibold mr-1 transition-colors duration-300 text-gray-700">
                  {selectedCity}
                </span>
                <svg 
                  className="w-4 h-4 transition-colors duration-300 text-gray-600"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showCityDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-40">
                  {cities.map((city) => (
                    <div
                      key={city}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityDropdown(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Desktop User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden md:flex items-center gap-1 text-sm transition-colors hover:opacity-80 text-gray-600">
                  {user?.firstName || user?.phone?.slice(-4) || 'Войти'}
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => {
                      const homePage = getHomePageForRole(activeRole || 'parent');
                      window.location.href = homePage;
                    }} 
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </DropdownMenuItem>
                  {activeRole === 'nanny' && (
                    <DropdownMenuItem onClick={() => window.location.href = '/nanny-onboarding'} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Редактировать профиль
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        const currentRole = activeRole || 'parent';
                        const newRole = currentRole === 'parent' ? 'nanny' : 'parent';
                        await switchRole(newRole);
                      } catch (error) {
                        console.error('Error switching role:', error);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {activeRole === 'parent' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      <span>Переключить на {activeRole === 'parent' ? 'Специалиста' : 'Клиента'}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await logout();
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Error logging out:', error);
                      }
                    }}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href={`/auth-sms?returnUrl=${encodeURIComponent(getHomePageForRole('parent'))}`} 
                className="hidden md:block text-sm transition-colors text-gray-600 hover:text-gray-800">
                Войти
              </Link>
            )}

            {/* Mobile Logout Button - VISIBLE ON MOBILE */}
            {isAuthenticated && user && (
              <button
                onClick={async () => {
                  try {
                    await logout();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Error logging out:', error);
                  }
                }}
                className="md:hidden px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                data-testid="button-logout-mobile"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="md:hidden">
                <Menu className="w-6 h-6 transition-colors text-gray-700" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Меню</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* City Selector Mobile */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Город</span>
                    </div>
                    <div className="space-y-2">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCity === city 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Алерт статуса няни перенесен в админский блок */}

                  {/* User Menu Mobile */}
                  <div className="space-y-2">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center mb-3">
                          <User className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {user?.firstName || user?.phone?.slice(-4) || 'Пользователь'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            const homePage = getHomePageForRole(activeRole || 'parent');
                            window.location.href = homePage;
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2 inline" />
                          Личный кабинет
                        </button>
                        
                        {activeRole === 'nanny' && (
                          <button
                            onClick={() => {
                              window.location.href = '/nanny-onboarding';
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4 mr-2 inline" />
                            Редактировать профиль
                          </button>
                        )}
                        
                        <button
                          onClick={async () => {
                            try {
                              const currentRole = activeRole || 'parent';
                              const newRole = currentRole === 'parent' ? 'nanny' : 'parent';
                              await switchRole(newRole);
                              setIsMobileMenuOpen(false);
                            } catch (error) {
                              console.error('Error switching role:', error);
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {activeRole === 'parent' ? (
                            <Users className="h-4 w-4 mr-2 inline" />
                          ) : (
                            <UserCheck className="h-4 w-4 mr-2 inline" />
                          )}
                          Переключить на {activeRole === 'parent' ? 'Специалиста' : 'Клиента'}
                        </button>
                        
                        <button
                          onClick={async () => {
                            try {
                              await logout();
                              window.location.href = '/';
                              setIsMobileMenuOpen(false);
                            } catch (error) {
                              console.error('Error logging out:', error);
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2 inline" />
                          Выйти
                        </button>
                      </>
                    ) : (
                      <Link href={`/auth-sms?returnUrl=${encodeURIComponent(getHomePageForRole('parent'))}`}>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2 inline" />
                          Войти в кабинет
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}