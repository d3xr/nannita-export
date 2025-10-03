import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, ChevronDown, Search, MapPin, Star, Heart } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";
import shieldIcon from "@assets/generated_images/Shield_icon_Nannita_style_3133951c.png";
import usersIcon from "@assets/generated_images/Users_icon_Nannita_style_64086c64.png";
import checkmarkIcon from "@assets/generated_images/Checkmark_icon_Nannita_style_5e03753c.png";
import clockIcon from "@assets/generated_images/Clock_icon_Nannita_style_eeb916b4.png";
import Footer from "@/components/Footer";
import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { isV2EligibleRoute } from "@/utils/v2Routes";
import { useRole, type MobileRole } from '@/hooks/useRole';

// HH.ru Style Role Dropdown
function HHStyleRoleDropdown() {
  const { currentRole, switchToRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSwitch = async (newRole: MobileRole) => {
    if (isLoading || newRole === currentRole) {
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    try {
      await switchToRole(newRole);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentText = currentRole === 'client' ? 'Ищу специалиста' : 'Ищу работу';
  
  return (
    <div className="relative">
      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-left text-gray-800 text-base font-medium"
        data-testid="button-role-dropdown"
        disabled={isLoading}
      >
        <span>{currentText}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 min-w-max"
          data-testid="dropdown-role-menu"
        >
          <button
            onClick={() => handleRoleSwitch('client')}
            className={`w-full px-4 py-3 text-left text-base hover:bg-gray-50 transition-colors ${
              currentRole === 'client' ? 'bg-gray-50 font-medium' : ''
            }`}
            data-testid="option-client"
          >
            Ищу специалиста
          </button>
          <button
            onClick={() => handleRoleSwitch('pro')}
            className={`w-full px-4 py-3 text-left text-base hover:bg-gray-50 transition-colors border-t border-gray-100 ${
              currentRole === 'pro' ? 'bg-gray-50 font-medium' : ''
            }`}
            data-testid="option-pro"
          >
            Ищу работу
          </button>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default function HomeV3() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Казань");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showHeaderCityDropdown, setShowHeaderCityDropdown] = useState(false);
  const [showBurgerCityDropdown, setShowBurgerCityDropdown] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  
  // Состояние для динамического количества отображаемых специалистов
  const [visibleCount, setVisibleCount] = useState(4);
  
  // Проверяем нужно ли показывать V2 layout
  const isMobile = useIsMobile();
  const { isEnabled: isV2Enabled } = useFeatureFlag('MOBILE_V2');
  const shouldUseV2 = isMobile && isV2Enabled && isV2EligibleRoute(location);
  
  const cities = ["Казань", "Москва", "Санкт-Петербург", "Екатеринбург", "Нижний Новгород"];
  
  // SEO: Устанавливаем SEO теги для v3 страницы
  useEffect(() => {
    import('../utils/seo').then(({ useSEO }) => {
      useSEO('home');
    });
  }, []);

  // Функция для определения количества колонок на основе breakpoint'ов
  const getColumnsFromBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return 2; // SSR fallback
    
    if (window.matchMedia('(min-width: 1280px)').matches) return 5; // xl
    if (window.matchMedia('(min-width: 1024px)').matches) return 4; // lg
    if (window.matchMedia('(min-width: 640px)').matches) return 3;  // sm
    return 2; // mobile
  }, []);

  // Debounce функция для обновления visibleCount
  const updateVisibleCount = useCallback(() => {
    const columns = getColumnsFromBreakpoint();
    const newVisibleCount = columns * 2; // 2 ряда максимум
    setVisibleCount(newVisibleCount);
  }, [getColumnsFromBreakpoint]);

  // Отслеживание изменений размера экрана с debounce
  useEffect(() => {
    // Устанавливаем начальное значение
    updateVisibleCount();
    
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVisibleCount, 150); // debounce 150ms
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateVisibleCount]);

  // Обработка поиска
  const handleSearch = (query?: string) => {
    if (user) {
      if (query) {
        setLocation(`/dashboard?tab=create_order&query=${encodeURIComponent(query)}`);
      } else {
        setLocation('/dashboard?tab=create_order');
      }
    } else {
      if (query) {
        setLocation(`/order?query=${encodeURIComponent(query)}`);
      } else {
        setLocation('/order');
      }
    }
  };

  // Популярные запросы (аналог "часто ищут" от hh.ru)
  const popularSearches = [
    "Няня на час",
    "Репетитор по математике", 
    "Детский психолог",
    "Логопед"
  ];

  // Статичные данные нянь как из API /search-results для v3
  const specialists = [
    {
      id: "nanny_001",
      slug: "alsu-kazan-nanny",
      name: "Алсу",
      age: 33,
      location: "Казань",
      service: "Няня",
      additionalServices: "Развивающие игры, прогулки, помощь с домашними заданиями",
      rating: 4.9,
      reviews: 127,
      price: "от 400 ₽/час",
      rateOneChild: 400,
      rateTwoChildren: 600,
      monthlyRate: 35000,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "nanny_002", 
      slug: "alvina-kazan-nanny",
      name: "Альвина",
      age: 42,
      location: "Казань",
      service: "Няня",
      additionalServices: "Подготовка к школе, творческое развитие, кулинария с детьми",
      rating: 4.8,
      reviews: 89,
      price: "от 450 ₽/час",
      rateOneChild: 450,
      rateTwoChildren: 650,
      monthlyRate: 38000,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "tutor_003",
      slug: "elena-kazan-tutor",
      name: "Елена",
      age: 29,
      location: "Казань", 
      service: "Репетитор математики",
      additionalServices: "ЕГЭ, ОГЭ, олимпиады, индивидуальный подход",
      rating: 5.0,
      reviews: 156,
      price: "от 800 ₽/час",
      rateOneChild: 800,
      rateTwoChildren: 1200,
      monthlyRate: 25000,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "psychologist_004",
      slug: "anna-kazan-psychologist",
      name: "Анна",
      age: 35,
      location: "Казань",
      service: "Детский психолог", 
      additionalServices: "Работа со страхами, адаптация к школе, семейное консультирование",
      rating: 4.9,
      reviews: 93,
      price: "от 1200 ₽/час",
      rateOneChild: 1200,
      rateTwoChildren: 1800,
      monthlyRate: 40000,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "nanny_005",
      slug: "maria-kazan-nanny",
      name: "Мария",
      age: 28,
      location: "Казань",
      service: "Няня",
      additionalServices: "Раннее развитие, музыкальные занятия, английский для малышей",
      rating: 4.7,
      reviews: 64,
      price: "от 380 ₽/час",
      rateOneChild: 380,
      rateTwoChildren: 550,
      monthlyRate: 32000,
      image: "https://images.unsplash.com/photo-1525130413817-d45c1d127c42?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "tutor_006",
      slug: "olga-kazan-english-tutor",
      name: "Ольга",
      age: 31,
      location: "Казань",
      service: "Репетитор английского",
      additionalServices: "Подготовка к международным экзаменам, разговорная практика",
      rating: 4.8,
      reviews: 112,
      price: "от 700 ₽/час",
      rateOneChild: 700,
      rateTwoChildren: 1000,
      monthlyRate: 22000,
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "nanny_007",
      slug: "svetlana-kazan-medical-nanny",
      name: "Светлана",
      age: 45,
      location: "Казань",
      service: "Няня с медобразованием",
      additionalServices: "Уход за детьми с особыми потребностями, массаж, ЛФК",
      rating: 4.9,
      reviews: 203,
      price: "от 500 ₽/час",
      rateOneChild: 500,
      rateTwoChildren: 750,
      monthlyRate: 42000,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "speech_008",
      slug: "yulia-kazan-speech-therapist",
      name: "Юлия",
      age: 26,
      location: "Казань",
      service: "Логопед",
      additionalServices: "Коррекция речи, постановка звуков, развитие речи",
      rating: 4.6,
      reviews: 75,
      price: "от 900 ₽/час",
      rateOneChild: 900,
      rateTwoChildren: 1300,
      monthlyRate: 28000,
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "nanny_009",
      slug: "tatiana-kazan-educator-nanny",
      name: "Татьяна",
      age: 39,
      location: "Казань",
      service: "Няня-воспитатель",
      additionalServices: "Дошкольная подготовка, развитие мелкой моторики, чтение",
      rating: 4.8,
      reviews: 148,
      price: "от 420 ₽/час",
      rateOneChild: 420,
      rateTwoChildren: 620,
      monthlyRate: 36000,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    },
    {
      id: "governess_010",
      slug: "valentina-kazan-governess",
      name: "Валентина",
      age: 37,
      location: "Казань",
      service: "Гувернантка",
      additionalServices: "Этикет, иностранные языки, культурное развитие, манеры",
      rating: 4.9,
      reviews: 184,
      price: "от 600 ₽/час",
      rateOneChild: 600,
      rateTwoChildren: 900,
      monthlyRate: 45000,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=face&auto=format&q=80"
    }
  ];

  // Не показываем V2 layout для V3 страницы
  if (shouldUseV2) {
    // На V3 странице принудительно используем обычный лейаут
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Простое меню в стиле hh.ru */}
      <header className="relative border-b border-gray-200">
        <div className="container-lg">
          
          {/* Mobile Header - HH.ru Style */}
          <div className="md:hidden px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" data-testid="link-logo">
              <img 
                src="/logo.png"
                alt="Nannita" 
                className="w-10 h-10 object-contain"
                data-testid="img-logo"
                onError={(e) => {
                  e.currentTarget.src = '/logo-nannita-new.png';
                }}
              />
            </Link>
            
            {/* Role Dropdown - HH.ru style */}
            <div className="flex-1 ml-4 mr-2">
              <HHStyleRoleDropdown />
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              {/* Login Button */}
              <Link href="/auth-sms" className="text-gray-800 text-base font-medium" data-testid="link-login">
                Войти
              </Link>
              
              {/* Mobile Menu */}
              <button 
                className="flex flex-col gap-1 relative z-50" 
                data-testid="button-menu"
                onClick={() => setIsBurgerOpen(!isBurgerOpen)}
              >
                <div className={`w-5 h-0.5 bg-gray-800 rounded transition-transform duration-300 ${
                  isBurgerOpen ? 'transform rotate-45 translate-y-1.5' : ''
                }`}></div>
                <div className={`w-5 h-0.5 bg-gray-800 rounded transition-opacity duration-300 ${
                  isBurgerOpen ? 'opacity-0' : ''
                }`}></div>
                <div className={`w-5 h-0.5 bg-gray-800 rounded transition-transform duration-300 ${
                  isBurgerOpen ? 'transform -rotate-45 -translate-y-1.5' : ''
                }`}></div>
              </button>
            </div>
          </div>

          {/* Desktop Header - HH.ru Style */}
          <div className="hidden md:flex items-center justify-between py-4">
            {/* Left Navigation */}
            <div className="flex items-center gap-8">
              {/* City Dropdown */}
              <div className="relative">
                <div 
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors text-sm cursor-pointer"
                  onClick={() => setShowHeaderCityDropdown(!showHeaderCityDropdown)}
                >
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </div>
                {showHeaderCityDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 min-w-40">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowHeaderCityDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg text-sm"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                О нас
              </Link>
            </div>
            
            {/* Center - Logo */}
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/logo-black.png"
                alt="Nannita" 
                className="h-8 cursor-pointer"
                onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </Link>
            
            {/* Right side */}
            <div className="flex items-center gap-8">
              <Link href="/blog" className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                База знаний
              </Link>
              <Link href="/auth-sms" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
                Войти
              </Link>
            </div>
          </div>
          
        </div>
        
        {/* Burger Menu Dropdown */}
        {isBurgerOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="px-4 py-2">
              {/* City Dropdown in Burger Menu */}
              <div className="relative">
                <div 
                  className="flex items-center justify-between py-3 text-gray-800 font-medium border-b border-gray-100 cursor-pointer"
                  onClick={() => setShowBurgerCityDropdown(!showBurgerCityDropdown)}
                >
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                {showBurgerCityDropdown && (
                  <div className="bg-gray-50 border-b border-gray-100">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowBurgerCityDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                href="/about" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100"
                data-testid="menu-about"
                onClick={() => setIsBurgerOpen(false)}
              >
                О нас
              </Link>
              
              <Link 
                href="/blog" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100"
                data-testid="menu-blog"
                onClick={() => setIsBurgerOpen(false)}
              >
                База знаний
              </Link>
              
              <Link 
                href="/for-specialists" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100"
                data-testid="menu-for-specialists"
                onClick={() => setIsBurgerOpen(false)}
              >
                Для специалистов
              </Link>
              
              <Link 
                href="/auth?returnUrl=/dashboard" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100"
                data-testid="menu-specialist-login"
                onClick={() => setIsBurgerOpen(false)}
              >
                Вход для специалистов
              </Link>
              
              <Link 
                href="/auth-sms" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100"
                data-testid="menu-register"
                onClick={() => setIsBurgerOpen(false)}
              >
                Зарегистрироваться
              </Link>
              
              <Link 
                href="/auth-sms" 
                className="block py-3 text-gray-800 font-medium border-b border-gray-100 last:border-b-0"
                data-testid="menu-login"
                onClick={() => setIsBurgerOpen(false)}
              >
                Войти
              </Link>
            </div>
          </div>
        )}
        
        {/* Backdrop to close burger menu */}
        {isBurgerOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-25 md:hidden" 
            onClick={() => setIsBurgerOpen(false)}
          />
        )}
      </header>
      {/* Hero секция в стиле hh.ru */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="container-lg text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Проверенные специалисты<br />для ваших детей
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Находите проверенных нянь и детских специалистов в вашем городе
          </p>
          
          <Button 
            onClick={() => handleSearch()}
            size="lg"
            className="bg-nannita-orange hover:bg-nannita-orange-dark text-white text-lg px-12 py-4 rounded-xl mb-16"
            data-testid="button-create-order"
          >
            Разместить заказ
          </Button>
        </div>
      </section>
      {/* Поисковая секция */}
      <section className="py-12 bg-gray-50">
        <div className="container-lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium text-center text-gray-900 mb-12">
              Какие специалисты<br />нужны ребенку?
            </h2>
            
            <div className="p-6">
              {/* Мобилка: колонки, ПК: строка */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Услуга или специалист"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-nannita-orange text-base"
                    data-testid="input-search-query"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                  />
                </div>
                
                <div className="flex-1 relative">
                  <div 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between text-base"
                    data-testid="dropdown-city-trigger"
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                  >
                    <span className="text-gray-700">Выберите город</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900" data-testid="text-selected-city">{selectedCity}</span>
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          data-testid={`button-city-option-${city.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleSearch(searchQuery)}
                  size="lg"
                  className="md:flex-shrink-0 bg-nannita-orange hover:bg-nannita-orange-dark text-white text-base py-3 px-8 rounded-lg"
                  data-testid="button-search-specialists"
                >Найти специалиста</Button>
              </div>
            </div>
            
            {/* Часто ищут в стиле hh.ru - поисковые саджесты */}
            <div className="mt-12 text-center">
              <h3 className="text-base md:text-lg font-medium text-gray-700 mb-6">Часто ищут</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setSearchQuery(search);
                    }}
                    data-testid={`button-popular-search-${search.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 text-sm font-medium"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Специалисты */}
      <section className="py-16">
        <div className="container-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Рекомендуем
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {specialists.slice(0, visibleCount).map((specialist) => (
              <div key={specialist.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100" data-testid={`card-specialist-${specialist.id}`}>
                <div className="aspect-[4/5] relative bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={specialist.image}
                    alt={specialist.name}
                    className="w-full h-full object-cover"
                  />
                  {/* WB-style badge */}
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ✓ Проверена
                  </div>
                  {/* Heart (favorites) in top-right */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 p-1.5 rounded-full hover:bg-white cursor-pointer transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1" data-testid={`text-specialist-service-${specialist.id}`}>{specialist.service}</div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1" data-testid={`text-specialist-name-${specialist.id}`}>{specialist.name}, {specialist.age}</h3>
                  <p className="text-xs text-gray-600 mb-2" data-testid={`text-specialist-location-${specialist.id}`}>{specialist.location}</p>
                  
                  {/* WB-style price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900" data-testid={`text-specialist-price-${specialist.id}`}>{specialist.price}</span>
                  </div>
                  
                  {/* Rating and reviews in one line */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium" data-testid={`text-specialist-rating-${specialist.id}`}>{specialist.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500" data-testid={`text-specialist-reviews-${specialist.id}`}>({specialist.reviews} отзывов)</span>
                  </div>
                  
                  {/* WB-style button */}
                  <button 
                    onClick={() => handleSearch()}
                    className="w-full bg-nannita-orange hover:bg-nannita-orange-dark text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                    data-testid={`button-offer-order-${specialist.id}`}
                  >
                    Предложить заказ
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/find-nanny">
              <Button variant="outline" size="lg" className="border-nannita-orange text-nannita-orange hover:bg-nannita-orange hover:text-white rounded-xl px-8" data-testid="button-view-all-specialists">
                Посмотреть всех специалистов
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Trust Section (стиль hh.ru) */}
      <section className="py-12 bg-gray-50/50">
        <div className="container-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              Специалисты нам доверяют
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8">
              <span className="text-nannita-blue-dark font-medium">Nannita занимает лидирующее место в России среди сайтов по поиску детских специалистов и нянь по скорости добавления нового функционала</span>
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm" data-testid="stat-card-resumes">
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2" data-testid="stat-number-resumes">~25 тысяч</div>
                <div className="text-gray-600" data-testid="stat-description-resumes">резюме размещено на сервисе</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm" data-testid="stat-card-verified">
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2" data-testid="stat-number-verified">95%+</div>
                <div className="text-gray-600" data-testid="stat-description-verified">специалистов с подтвержденными телефонами</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm" data-testid="stat-card-response">
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2" data-testid="stat-number-response">Быстро</div>
                <div className="text-gray-600" data-testid="stat-description-response">специалисты отвечают на предложения</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm" data-testid="stat-card-authentic">
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2" data-testid="stat-number-authentic">Реальные</div>
                <div className="text-gray-600" data-testid="stat-description-authentic">анкеты с фото и отзывами</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Форма регистрации для специалистов (стиль hh.ru) */}
      <section className="py-16 bg-gray-50">
        <div className="container-lg">
          <div className="max-w-md md:max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-left md:text-center leading-tight">
              Напишите телефон, чтобы работодатели могли предложить вам работу
            </h2>
            
            <form className="space-y-6" data-testid="specialist-registration-form">
              <div>
                <input
                  type="tel"
                  placeholder="Номер телефона"
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="input-phone"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-nannita-orange hover:bg-nannita-orange-dark text-white font-medium text-lg py-4 px-6 rounded-lg transition-colors"
                data-testid="button-continue"
              >
                Продолжить
              </button>
            </form>
            
            
            <div className="mt-6 text-sm text-gray-600 leading-relaxed">
              Нажимая «Продолжить», вы подтверждаете, что полностью принимаете условия{" "}
              <Link href="/legal/user-agreement" className="text-blue-600 hover:underline">
                Пользовательского соглашения
              </Link>{" "}
              и ознакомились с{" "}
              <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">
                политикой конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Используем стандартный Footer компонент вместо встроенного */}
      <Footer />
    </div>
  );
}