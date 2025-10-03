import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'wouter';
import { getCookieConsent, setCookieConsent, createConsent } from '@/lib/cookie-utils';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие ранее
    const consent = getCookieConsent();
    if (!consent) {
      // Показываем баннер через небольшую задержку для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent(createConsent(true, true, true));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    setCookieConsent(createConsent(true, false, false));
    setIsVisible(false);
  };



  const handleClose = () => {
    // При закрытии сохраняем минимальное согласие (только необходимые cookies)
    // чтобы баннер больше не появлялся
    setCookieConsent(createConsent(true, false, false));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      data-testid="cookie-banner"
    >
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Текст и ссылка */}
          <div className="flex-1 pr-4">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Файлы cookie помогают нам в оптимизации оформления и улучшении производительности веб-сайта. 
              Продолжая использовать сайт, вы даете согласие на использование файлов cookie и обработку своих данных. 
              Измените свои настройки или узнайте подробности в{' '}
              <Link 
                href="/privacy" 
                className="text-orange-500 hover:text-orange-600 underline font-medium"
                data-testid="link-privacy-policy"
              >
                Политике использования файлов cookie.
              </Link>
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <Button
              onClick={handleAcceptAll}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 text-sm font-medium"
              data-testid="button-accept-all"
            >
              Принять все
            </Button>
            
            <Button
              onClick={handleAcceptNecessary}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 text-sm font-medium"
              data-testid="button-accept-necessary"
            >
              Принять необходимые
            </Button>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 lg:relative lg:top-0 lg:right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
            data-testid="button-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}