import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight, Shield, MessageSquare, Star, AlertTriangle, Heart, Building, FileText, User, Settings, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Markdown from 'markdown-to-jsx';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { isV2EligibleRoute } from '@/utils/v2Routes';

// Функция для рендеринга текста с поддержкой markdown
function renderContentWithMarkdown(content: string) {
  // Обработка ссылок вида "text: url" для внутренних ссылок
  const processedContent = content.replace(/^•\s*([^:]+):\s*(https?:\/\/[^\s]+)$/gm, (match, title, url) => {
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    return `• [${title.trim()}](${path})`;
  });
  
  return (
    <Markdown 
      options={{
        overrides: {
          a: {
            component: ({ href, children, ...props }) => {
              // Внутренние ссылки через wouter Link
              if (href && href.startsWith('/')) {
                return <Link href={href} className="text-nannita-orange hover:underline font-medium" {...props}>{children}</Link>;
              }
              // Внешние ссылки
              return <a href={href} className="text-nannita-orange hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
            }
          },
          strong: {
            component: ({ children, ...props }) => <strong className="font-semibold text-gray-900" {...props}>{children}</strong>
          },
          p: {
            component: ({ children, ...props }) => <div className="mb-2 text-gray-700" {...props}>{children}</div>
          },
          ul: {
            component: ({ children, ...props }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1" {...props}>{children}</ul>
          },
          li: {
            component: ({ children, ...props }) => <li className="text-gray-700" {...props}>{children}</li>
          }
        }
      }}
      className="text-gray-700 leading-relaxed"
    >
      {processedContent}
    </Markdown>
  );
}

interface InfoPageProps {
  content: {
    hero: {
      title: string;
      subtitle?: string;
      description?: string;
    };
    sections: Array<{
      title?: string;
      content?: string | React.ReactNode;
      type?: 'text' | 'list' | 'cards' | 'highlight';
      items?: Array<{
        title?: string;
        content: string;
        icon?: React.ReactNode;
      }>;
    }>;
  };
  icon?: React.ReactNode;
}

const menuItems = [
  {
    path: '/about',
    title: 'О нас'
  },
  {
    path: '/specialists-online',
    title: 'Специалисты на связи'
  },
  {
    path: '/safety',
    title: 'Безопасность'
  },
  {
    path: '/reviews',
    title: 'Настоящие отзывы'
  },
  {
    path: '/registry',
    title: 'Реестр отстраненных'
  },
  {
    path: '/legal',
    title: 'Правовая информация'
  }
];

const legalDocuments = [
  {
    path: '/agreement',
    title: 'Пользовательское соглашение'
  },
  {
    path: '/privacy',
    title: 'Политика конфиденциальности'
  },
  {
    path: '/personal-data-consent',
    title: 'Согласие на обработку данных'
  },
  {
    path: '/recommendations',
    title: 'Рекомендательные технологии'
  },
  {
    path: '/offer',
    title: 'Оферта'
  }
];

export default function InfoPage({ content, icon }: InfoPageProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // V2 Mobile Header Logic
  const isMobile = useIsMobile();
  const { isEnabled: isV2Enabled } = useFeatureFlag('MOBILE_V2');
  const shouldUseV2 = isMobile && isV2Enabled && isV2EligibleRoute(location);
  
  // Функция для обработки кликов на кнопки заказа
  const handleOrderClick = () => {
    if (user) {
      // Если авторизован - в личный кабинет
      setLocation('/dashboard?tab=create_order');
    } else {
      // Если не авторизован - на форму без меню
      setLocation('/order');
    }
  };
  
  // SEO and scroll to top
  useEffect(() => {
    document.title = content.hero.title + ' | Nannita';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content.hero.description) {
      metaDesc.setAttribute('content', content.hero.description);
    }
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [content.hero.title, content.hero.description]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldUseV2 && <Header />}
      
      {/* Breadcrumbs */}
      <div className={`bg-white border-b ${shouldUseV2 ? 'mt-0' : 'mt-[73px]'}`}>
        <div className="container mx-auto px-4 max-w-6xl py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Главная</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/legal" className="text-gray-500 hover:text-gray-700">Правовая информация</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{content.hero.title.replace(/\*\*/g, '')}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 sticky top-24">
              <h3 className="font-heading font-medium text-xl mb-6" style={{color: '#1d222f'}}>О сервисе</h3>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item.path}>
                    <Link 
                      href={item.path}
                      className={`block px-3 py-3 text-base transition-colors rounded ${
                        location === item.path || (item.path === '/legal' && legalDocuments.some(doc => doc.path === location))
                          ? 'bg-blue-50 text-nannita-blue font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.title}
                    </Link>
                    
                    {/* Показываем подразделы для Правовой информации */}
                    {item.path === '/legal' && (location === '/legal' || legalDocuments.some(doc => doc.path === location)) && (
                      <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-100 pl-4">
                        {legalDocuments.map((doc) => (
                          <Link 
                            key={doc.path}
                            href={doc.path}
                            className={`block px-3 py-2 text-sm transition-colors rounded ${
                              location === doc.path 
                                ? 'bg-orange-50 text-nannita-orange font-medium' 
                                : 'text-gray-600 hover:text-nannita-blue hover:bg-gray-50'
                            }`}
                          >
                            {doc.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Section */}
            <div className="mb-8">
              <div className="text-xl lg:text-2xl font-heading font-medium mb-4" style={{color: '#1d222f'}}>
                {renderContentWithMarkdown(content.hero.title)}
              </div>
              {content.hero.subtitle && (
                <p className="text-base text-gray-700 mb-4 leading-relaxed">{content.hero.subtitle}</p>
              )}
              {content.hero.description && (
                <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{content.hero.description}</p>
              )}
            </div>

            {/* Content Sections - Desktop version */}
            <div className="hidden lg:block space-y-8">
              {content.sections.map((section, index) => (
                <div key={index} className="max-w-4xl">
                  {section.title && (
                    <div className="text-lg font-heading font-medium mb-4" style={{color: '#1d222f'}}>
                      {renderContentWithMarkdown(section.title)}
                    </div>
                  )}
                  
                  {section.type === 'text' && (
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {typeof section.content === 'string' ? renderContentWithMarkdown(section.content) : section.content}
                    </div>
                  )}
                  
                  {section.type === 'list' && section.items && (
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          {item.title && (
                            <div className="text-base font-heading font-medium mb-2" style={{color: '#1d222f'}}>
                              {renderContentWithMarkdown(item.title)}
                            </div>
                          )}
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {renderContentWithMarkdown(item.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.type === 'cards' && section.items && (
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          {item.title && (
                            <div className="text-base font-heading font-medium mb-2" style={{color: '#1d222f'}}>
                              {renderContentWithMarkdown(item.title)}
                            </div>
                          )}
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {renderContentWithMarkdown(item.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.type === 'highlight' && (
                    <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-nannita-blue">
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {typeof section.content === 'string' ? section.content : section.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Content Sections - Mobile version */}
            <div className="lg:hidden space-y-6">
              {content.sections.map((section, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  {section.title && (
                    <div className="text-lg font-heading font-medium mb-3 text-gray-900">
                      {renderContentWithMarkdown(section.title)}
                    </div>
                  )}
                  
                  {section.type === 'text' && (
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {typeof section.content === 'string' ? renderContentWithMarkdown(section.content) : section.content}
                    </div>
                  )}
                  
                  {section.type === 'list' && section.items && (
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          {item.title && (
                            <div className="font-medium text-gray-800 mb-2 text-sm">
                              {renderContentWithMarkdown(item.title)}
                            </div>
                          )}
                          <div className="text-gray-600 leading-relaxed text-sm">
                            {renderContentWithMarkdown(item.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.type === 'cards' && section.items && (
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-l-4 border-nannita-light-blue pl-3">
                          {item.title && (
                            <div className="font-medium text-gray-800 mb-2 text-sm">
                              {renderContentWithMarkdown(item.title)}
                            </div>
                          )}
                          <div className="text-gray-600 leading-relaxed text-sm">
                            {renderContentWithMarkdown(item.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.type === 'highlight' && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-nannita-blue">
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {typeof section.content === 'string' ? section.content : section.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Banner */}
            <div className="bg-gradient-to-r from-nannita-blue to-purple-600 rounded-xl p-4 lg:p-6 mt-6 lg:mt-8 text-white overflow-hidden relative mb-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-heading font-medium mb-2 text-white">
                    Готовы начать?
                  </h2>
                  <p className="text-white opacity-90 mb-4 text-sm lg:text-base">
                    Выберите подходящий для вас вариант
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button 
                      onClick={handleOrderClick}
                      className="w-full sm:w-auto bg-white text-nannita-blue px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm lg:text-base"
                    >
                      Найти своего человека
                    </button>
                    <Link href="/for-specialists">
                      <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-nannita-blue transition-colors text-sm lg:text-base">
                        Стать частью команды специалистов
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* App Download Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 lg:p-6 mt-6 lg:mt-8 text-white overflow-hidden relative">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-heading font-medium mb-2 text-white">
                    Скачайте приложение Nannita
                  </h2>
                  <p className="text-white opacity-90 mb-4 text-sm lg:text-base">
                    Быстрый поиск специалистов в вашем телефоне
                  </p>
                  <div className="flex flex-row gap-3 justify-center lg:justify-start">
                    <a href="#" className="inline-block transition-transform hover:scale-105">
                      <img 
                        src="/attached_assets/appstore_1754215364742.png" 
                        alt="App Store" 
                        className="h-10 w-auto"
                      />
                    </a>
                    <a href="#" className="inline-block transition-transform hover:scale-105">
                      <img 
                        src="/attached_assets/googleplay_1754215364742.png" 
                        alt="Google Play" 
                        className="h-10 w-auto"
                      />
                    </a>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <img 
                    src="/attached_assets/qr_1754215364743.png" 
                    alt="QR код для скачивания приложения Nannita" 
                    className="h-32 w-32 object-contain bg-white rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gray-100 rounded-xl p-6 mt-6 text-center">
              <p className="text-gray-700 mb-2">Есть вопросы или проблемы?</p>
              <a href="mailto:support@nannita.ru" className="text-orange-500 hover:underline font-medium">
                support@nannita.ru
              </a>
              <p className="text-sm text-gray-600 mt-4">
                Заказать - удобно. Специалистов проверяем!
              </p>
            </div>
          </main>
        </div>
      </div>

      {!shouldUseV2 && <Footer />}
    </div>
  );
}