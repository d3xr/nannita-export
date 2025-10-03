import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown, Check, Star, Shield, Clock, TrendingUp, Users, Award, Heart, Calendar, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { isV2EligibleRoute } from "@/utils/v2Routes";

export default function ForSpecialists() {
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { isEnabled: isV2Enabled } = useFeatureFlag('MOBILE_V2');
  const shouldUseV2 = isMobile && isV2Enabled && isV2EligibleRoute(location);

  useEffect(() => {
    import('../utils/seo').then(({ useSEO }) => {
      useSEO('forSpecialists');
    });
  }, []);

  const handlePhoneRegistration = () => {
    if (phone.trim()) {
      // Перенаправляем на страницу SMS авторизации с ролью няни
      setLocation(`/auth-sms?phone=${encodeURIComponent(phone)}&role=nanny&returnUrl=${encodeURIComponent('/nanny-onboarding')}`);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Клиенты создают заказы —",
      description: "описывают детали и предлагают цену"
    },
    {
      number: 2,
      title: "Вы выбираете интересные заказы",
      description: "по специализации, возрасту детей и удобному времени"
    },
    {
      number: 3,
      title: "Откликаетесь и договариваетесь с клиентом",
      description: "о цене и деталях в чате"
    },
    {
      number: 4,
      title: "Выполняете заказы и получаете",
      description: "оплату напрямую от клиентов"
    }
  ];

  const pricingPlans = [
    { name: "Старт", price: "99₽", count: "7 откликов" },
    { name: "Базовый", price: "290₽", count: "21 отклик" },
    { name: "Профи", price: "590₽", count: "49 откликов" },
    { name: "Безлимитный", price: "990₽", count: "неограниченное количество" }
  ];



  const faqItems = [
    {
      question: "Как начать зарабатывать на платформе Nannita? Это просто!",
      answer: "1. Находите подходящие заказы|Листайте ленту заказов на сайте или в приложении — здесь множество задач, соответствующих вашему профилю.|2. Отправляйте отклики|Оставьте отклик на заказ или напишите сообщение заказчику.|3. Договоритесь и выполните работу|Если заказчик выбрал вас — отлично! Выполните работу качественно и профессионально.|4. Получите оплату|Заказчик оплачивает ваши услуги напрямую удобным для вас способом (наличные, перевод и т.д). Мы не взимаем комиссию с вашего заработка!"
    },
    {
      question: "Зачем платить и как это помогает?",
      answer: "Ваша плата за отклики — это инвестиция в привлечение клиентов. Эти средства мы направляем на:|● Рекламу сервиса, чтобы привлечь больше родителей, ищущих специалистов для своих детей.|● Развитие платформы, чтобы сайт и приложение были удобными, быстрыми и помогали вам выделиться.|● Поддержку пользователей: наша команда всегда готова помочь вам с любым вопросом по работе с платформой.|Мы работаем, чтобы вы тратили меньше времени на поиск клиентов и больше на любимое дело!"
    },
    {
      question: "Зачем нужна проверка паспорта? Безопасно ли это?",
      answer: "Проверка паспорта обеспечивает доверие родителей. Работа с детьми — большая ответственность, а проверка подтверждает вашу надежность и служит «знаком качества» на платформе. Родители охотнее выбирают проверенных специалистов.|Ваши данные полностью защищены. Мы используем надежные системы шифрования, ваши паспортные данные никогда не публикуются и не передаются третьим лицам. Они необходимы только для однократной внутренней проверки."
    },
    {
      question: "Кто оплачивает мою работу?",
      answer: "Ваши услуги оплачивают родители напрямую после выполнения работы удобным для вас способом. Мы не выступаем посредником в расчетах и не взимаем комиссию с вашего гонорара."
    },
    {
      question: "Я только начинаю, у меня пока мало отзывов. Меня выберут?",
      answer: "Безусловно! Отзывы важны, но не единственный фактор выбора. Родители обращают внимание на:|● Подробную анкету: расскажите о себе, своем образовании, опыте и подходе к детям. Добавьте фото. Чем подробнее анкета, тем больше доверия она вызывает.|● Первое сообщение (отклик): будьте доброжелательны, покажите, что понимаете запрос родителя и позаботитесь о ребенке.|● Навыки общения: умение расположить к себе родителя и ребенка — ваш плюс.|● Четкие условия: опишите свои услуги, предложите адекватные цены и гибкое расписание.|Каждый специалист начинал с нуля. Главное — ваша компетентность и умение себя презентовать."
    },
    {
      question: "Что делать, если родитель не отвечает после отклика или договоренностей?",
      answer: "Иногда планы родителей меняются: дети болеют, возникают срочные дела. Это вне нашего контроля. Наши советы:|● Будьте на связи: оперативно отвечайте на сообщения.|● Уточняйте планы: если чувствуете неопределенность, вежливо спросите, актуален ли запрос.|● Просите уведомлять: мягко попросите родителей сообщать о переносе или отмене встречи, чтобы лучше планировать свое время."
    },
    {
      question: "Кто размещает заказы?",
      answer: "Все заказы создают реальные родители, ищущие специалистов для своих детей. Вы можете проверить:|● Подтвержден ли аккаунт родителя (например, через телефон или социальные сети).|● Есть ли у родителя отзывы от других специалистов, если он уже пользовался платформой."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!shouldUseV2 && <Header />}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-background">
          <div className="nannita-container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl font-heading text-nannita-dark-blue leading-tight">
                    Nannita: зарабатывайте больше на любимом деле
                  </h1>
                  <p className="text-xl text-nannita-gray leading-relaxed">
                    Мы создали место, где специалист — не «услуга», а человек, которого ждут.
                  </p>
                </div>
              </div>
              
              {/* Right image */}
              <div className="relative order-first lg:order-last">
                <img 
                  src="/attached_assets/generated_images/Professional_nanny_portrait_0053060f.png"
                  alt="Профессиональная няня"
                  className="w-full h-[250px] sm:h-[300px] lg:h-[350px] object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
            
            {/* Registration block */}
            <div className="mt-20">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Registration form */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-2xl md:text-3xl font-heading text-nannita-dark-blue">
                        Зарегистрируйтесь по номеру телефона
                      </h2>
                      <p className="text-nannita-gray text-base">
                        Отправим СМС с кодом подтверждения. Присылать рекламу не будем.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-gray-200 rounded-2xl focus-within:border-nannita-dark-blue transition-colors">
                        <input
                          placeholder="+7 123 456 78 90"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-base px-4 py-4 border-0 outline-none bg-transparent rounded-2xl"
                          type="tel"
                        />
                      </div>
                      <Button 
                        onClick={handlePhoneRegistration}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-base rounded-2xl h-auto font-semibold"
                      >
                        Продолжить
                      </Button>
                    </div>
                  </div>
                  
                  {/* QR Code - скрыт на мобильной версии */}
                  <div className="text-center space-y-4 hidden md:block">
                    <div className="w-40 h-40 bg-white rounded-2xl mx-auto p-3 border border-gray-100">
                      <img 
                        src="/attached_assets/qr_1754215364743.png" 
                        alt="QR код для скачивания приложения" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-nannita-gray max-w-[160px] mx-auto leading-relaxed text-center">
                      Наведите камеру телефона, чтобы отсканировать QR-код и скачать приложение
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-8 bg-gradient-blue">
          <div className="nannita-container">
            <h2 className="text-3xl font-heading text-nannita-dark-blue mb-10">
              Как это работает?
            </h2>
            
            <div className="relative">
              {/* Timeline container */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                {/* Horizontal line behind numbers - only on desktop */}
                <div className="hidden md:block absolute top-6 left-6 right-6 h-px bg-gray-300 z-0"></div>
                
                {steps.map((step) => (
                  <div key={step.number} className="relative z-10">
                    {/* Number circle */}
                    <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-nannita-dark-blue mb-6">
                      {step.number}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-nannita-dark-blue text-base leading-tight">
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-sm text-nannita-gray leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-8 bg-background">
          <div className="nannita-container max-w-6xl">
            <h2 className="text-3xl font-heading text-nannita-dark-blue mb-10">
              Тарифы
            </h2>
            
            <div className="border border-gray-200 rounded-2xl p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <h3 className="text-2xl font-heading text-nannita-dark-blue">
                    Платите только за отклики на заказы
                  </h3>
                  <p className="text-nannita-gray text-lg leading-relaxed">
                    Без подписок и скрытых комиссий. Контролируйте бюджет — каждый отклик приближает заказ
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {pricingPlans.map((plan, index) => (
                      <div key={index} className="flex justify-between items-start py-3">
                        <div className="flex-1">
                          <div className="font-medium text-nannita-dark-blue text-lg">{plan.name}</div>
                          <div className="text-nannita-gray text-sm mt-1">{plan.count}</div>
                        </div>
                        <div className="text-nannita-dark-blue font-semibold text-lg ml-8">
                          {plan.price}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-500 text-sm text-center">
                      Действуют 30 дней с момента активации
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-white">
          <div className="nannita-container max-w-4xl">
            <h2 className="text-3xl font-heading text-nannita-dark-blue mb-8">
              Давайте разберем частые вопросы вместе!
            </h2>
            
            <div className="space-y-4 mb-16">
              {faqItems.map((item, index) => (
                <Collapsible
                  key={index}
                  open={openFaq === index}
                  onOpenChange={(open) => setOpenFaq(open ? index : null)}
                >
                  <div className="nannita-card">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-0 hover:bg-transparent focus:outline-none">
                      <span className="text-lg font-medium text-nannita-dark-blue pr-4">
                        {item.question}
                      </span>
                      <ChevronDown 
                        className={`h-5 w-5 text-nannita-gray transition-transform ${
                          openFaq === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="text-nannita-dark-blue leading-relaxed space-y-3 text-sm">
                        {item.answer.split('|').map((part, idx) => {
                          // Handle numbered lists (1. 2. 3.)
                          if (/^\d+\.\s/.test(part.trim())) {
                            const match = part.match(/^(\d+)\.\s(.+)/);
                            if (match) {
                              const number = match[1];
                              const fullText = match[2];
                              // Split by first sentence for title
                              const firstSentenceMatch = fullText.match(/^([^.!?]+[.!?]?)\s*(.*)/);
                              if (firstSentenceMatch) {
                                const title = firstSentenceMatch[1];
                                const description = firstSentenceMatch[2];
                                return (
                                  <div key={idx} className="flex gap-2 items-start">
                                    <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                      {number}
                                    </span>
                                    <div className="flex-1">
                                      <span className="text-nannita-dark-blue text-sm font-semibold block">{title}</span>
                                      {description && <span className="text-nannita-dark-blue text-sm block mt-1">{description}</span>}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={idx} className="flex gap-2 items-start">
                                    <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                      {number}
                                    </span>
                                    <span className="flex-1 text-nannita-dark-blue text-sm font-semibold">{fullText}</span>
                                  </div>
                                );
                              }
                            }
                          }
                          
                          // Handle bullet points (●)
                          if (/^●\s/.test(part.trim())) {
                            const match = part.match(/^●\s(.+)/);
                            if (match) {
                              const text = match[1];
                              const colonIndex = text.indexOf(':');
                              if (colonIndex > 0) {
                                return (
                                  <div key={idx} className="flex gap-2 items-start">
                                    <span className="text-orange-600 flex-shrink-0 text-sm leading-relaxed">●</span>
                                    <div className="flex-1">
                                      <span className="font-semibold text-nannita-dark-blue text-sm">{text.substring(0, colonIndex + 1)}</span>
                                      <span className="text-nannita-dark-blue text-sm"> {text.substring(colonIndex + 1).trim()}</span>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={idx} className="flex gap-2 items-start">
                                    <span className="text-orange-600 flex-shrink-0 text-sm leading-relaxed">●</span>
                                    <span className="flex-1 text-nannita-dark-blue text-sm">{text}</span>
                                  </div>
                                );
                              }
                            }
                          }
                          
                          // Regular paragraphs
                          if (part.trim()) {
                            return <div key={idx} className="text-nannita-dark-blue text-sm">{part.trim()}</div>;
                          }
                          
                          return null;
                        }).filter(Boolean)}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>

            <div className="text-center space-y-8">
              <h3 className="text-2xl font-heading text-nannita-dark-blue">
                Создайте профиль, которому доверяют
              </h3>
              
              <Button 
                onClick={() => setLocation('/nanny-onboarding')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 text-lg rounded-lg font-semibold"
              >
                Зарегистрироваться
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}