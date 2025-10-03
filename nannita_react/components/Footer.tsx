import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'wouter';

export default function Footer() {
  const [selectedCity, setSelectedCity] = useState("Казань");
  const [showFooterCityDropdown, setShowFooterCityDropdown] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();
  
  // Проверяем, находимся ли на главной странице
  const isHomePage = location === '/';
  
  const cities = ["Казань", "Москва", "Санкт-Петербург"];

  return (
    <footer className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Верхний блок */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
          
          {/* Левая часть: Логотип и ссылки */}
          <div className="flex flex-col items-start mb-6 lg:mb-0">
            {/* Логотип */}
            <div className="mb-4">
              <img 
                src='/logo-black.png'
                alt="Nannita" 
                className="h-6"
              />
            </div>
            
            {/* Ссылки под логотипом */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
              <a href="/about" className="text-gray-700 hover:text-orange-500 transition-colors">О нас</a>
              <a href="/blog" className="text-gray-700 hover:text-orange-500 transition-colors">База знаний</a>
              <a href="/legal" className="text-gray-700 hover:text-orange-500 transition-colors">Правовая информация</a>
              <a href="/for-specialists" className="text-gray-700 hover:text-orange-500 transition-colors">Для специалистов</a>
              <a href="/auth?returnUrl=/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">Вход для специалистов</a>
            </div>
          </div>

          {/* Правая часть: Служба поддержки - только на главной странице */}
          {isHomePage && (
            <div className="flex flex-col items-start lg:items-center">
              <h6 className="font-semibold mb-3 text-base text-gray-800">Служба поддержки</h6>
              <button 
                onClick={() => {
                  // Загружаем JivoSite если еще не загружен
                  if (typeof window !== 'undefined' && !(window as any).jivo_api) {
                    const script = document.createElement('script');
                    script.src = '//code.jivo.ru/widget/mHU6TTQ4wg';
                    script.async = true;
                    script.onload = () => {
                      // После загрузки ждем немного и открываем чат
                      setTimeout(() => {
                        if ((window as any).jivo_api) {
                          (window as any).jivo_api.open();
                        }
                      }, 1000);
                    };
                    document.head.appendChild(script);
                  } else {
                    // JivoSite уже загружен, открываем чат
                    if ((window as any).jivo_api) {
                      (window as any).jivo_api.open();
                    } else if ((window as any).$_Tawk) {
                      (window as any).$_Tawk.maximize();
                    } else {
                      // Fallback - попытка найти и кликнуть на виджет Jivo
                      const jivoWidget = document.querySelector('[data-jivo-widget], .ji-chat-button, #jivo-iframe-container button, .jivo-btn');
                      if (jivoWidget) {
                        (jivoWidget as HTMLElement).click();
                      }
                    }
                  }
                }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-base font-medium"
              >
                Написать в чат
              </button>
            </div>
          )}
        </div>
        
        {/* Разделительная линия */}
        <div className="border-t border-gray-300 pt-4">
          
          {/* Нижний блок - одна строка */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            
            {/* Слева: Дропдаун города */}
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setShowFooterCityDropdown(!showFooterCityDropdown)}
              >
                <span className="font-semibold mr-1 text-gray-700">
                  {selectedCity}
                </span>
                <svg 
                  className="w-4 h-4 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showFooterCityDropdown && (
                <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-40">
                  {cities.map((city) => (
                    <div
                      key={city}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                      onClick={() => {
                        setSelectedCity(city);
                        setShowFooterCityDropdown(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Центр: Ссылки */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 text-sm">
              <a href="/agreement" className="text-gray-700 hover:text-orange-500 transition-colors">Пользовательское соглашение</a>
              <span className="text-gray-700">Применяются <a href="/recommendations" className="text-gray-700 hover:text-orange-500 transition-colors">рекомендательные технологии</a></span>
            </div>

            {/* Справа: Email поддержки */}
            <div className="text-sm text-gray-700">
              <span>По всем вопросам → </span>
              <a href="mailto:support@nannita.ru" className="text-orange-500 hover:underline">support@nannita.ru</a>
            </div>
          </div>

          {/* Копирайт */}
          <div className="text-xs text-gray-500">
            <span>© Nannita 2025. Все права защищены.<br/>Проект компании «АСИ-Инвест»</span>
          </div>
        </div>
      </div>
    </footer>
  );
}