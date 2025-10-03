import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Star, CheckCircle, Car, FileText, Users, MessageCircle, ArrowLeft, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useMobileNannyProfileV2 } from "@/hooks/useFeatureFlag";
import { NannyProfileMobileV2 } from "@/components/mobile-v2";

// Полный перевод всех навыков и обязанностей
const DUTY_TRANSLATIONS: Record<string, string> = {
  // Основные обязанности
  'walks': 'Прогулки',
  'activities': 'Развивающие занятия',
  'homework': 'Помощь с уроками', 
  'bedtime': 'Укладывание',
  'cooking_kids': 'Приготовление детского питания',
  'cleaning_room': 'Уборка детской',
  'dishes_kids': 'Мытьё детской посуды',
  // Дополнительные обязанности
  'laundry_kids': 'Стирка детской одежды',
  'bathing': 'Купание ребёнка',
  'school_prep': 'Подготовка к школе',
  'school_escort': 'Сопровождение в сад/школу',
  'errands': 'Разовые поручения',
  'cooking_family': 'Приготовление еды для всей семьи',
  'dishes_family': 'Мытьё семейной посуды',
  // Медицинские навыки
  'first_aid': 'Первая помощь',
  'fever': 'Высокая температура',
  'injuries': 'Травмы (ожоги/порезы/ушибы)',
  'medications': 'Прием лекарств',
  'allergies': 'Работа с аллергиями',
  // Прочие навыки
  'feeding': 'Кормление',
  'hygiene': 'Гигиенические процедуры',
  'toys_cleanup': 'Уборка игрушек',
  'transport': 'Транспортировка',
  'other': 'Прочее'
};

const EDUCATION_TRANSLATIONS: Record<string, string> = {
  'higher': 'Высшее',
  'specialized_secondary': 'Среднее специальное',
  'secondary': 'Среднее',
  'incomplete_higher': 'Неполное высшее'
};

// Расширенный тип для профиля няни
interface Nanny {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  age: number | null;
  birthDate?: string;
  citizenship?: string;
  experience: number | null;
  rating: string | null;
  hourlyRate: string | null;
  description: string | null;
  profileImageUrl: string | null;
  isVerified: boolean | null;
  isAvailable: boolean | null;
  city: string | null;
  district?: string;
  bio?: string;
  
  // Профессиональная информация
  specialization?: string;
  education?: string;
  
  // Специализация и навыки
  ageGroups?: string[];
  basicDuties?: string[];
  additionalDuties?: string[];
  medicalSkills?: string[];
  specialSkills?: string[];
  pedagogicalMethods?: string[];
  languages?: Array<{language: string; level: string}>;
  
  // Документы и проверки
  documentsInfo?: Record<string, boolean>;
  documentsUploaded?: boolean;
  
  // Расписание и тарифы
  schedule?: Record<string, {enabled: boolean; from: string; to: string}>;
  ratesInfo?: {
    hourlyRate?: number;
    minimumHours?: number;
    overtime?: number;
    holidays?: number;
  };
  minOrderHours?: number;
  
  // Тарифы
  rateOneChild?: number;
  rateTwoChildren?: number;
  rateThreeChildren?: number;
  monthlyRate?: number;
  
  // Дополнительная информация
  additionalInfo?: {
    hasOwnCar?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    allergies?: string;
    selfEmployed?: boolean;
  };
  
  // Системные поля
  profileCompleted?: boolean;
  profileCompleteness?: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const stockAvatars = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
];

export default function NannyProfilePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Feature flag for Mobile V2
  const { isEnabled: mobileV2Enabled, isLoading: featureFlagLoading } = useMobileNannyProfileV2({
    enableDebug: import.meta.env.DEV, // Debug only in dev mode
    reCheckOnNavigation: true
  });

  const { data: nanny, isLoading } = useQuery<Nanny>({
    queryKey: ['/api/nannies', id],
    enabled: !!id,
  });

  // Feature flag conditional rendering
  if (!featureFlagLoading && mobileV2Enabled) {
    return <NannyProfileMobileV2 />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {(!featureFlagLoading && !mobileV2Enabled) && <Header />}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        {(!featureFlagLoading && !mobileV2Enabled) && <Footer />}
      </div>
    );
  }

  if (!nanny) {
    return (
      <div className="min-h-screen bg-gray-50">
        {(!featureFlagLoading && !mobileV2Enabled) && <Header />}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Специалист не найден</h1>
            <Button onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к поиску
            </Button>
          </div>
        </main>
        {(!featureFlagLoading && !mobileV2Enabled) && <Footer />}
      </div>
    );
  }

  const avatarUrl = nanny.profileImageUrl || stockAvatars[parseInt(nanny.id.slice(-1)) % stockAvatars.length];

  return (
    <div className="min-h-screen bg-gray-50">
      {(!featureFlagLoading && !mobileV2Enabled) && <Header />}
      <div className="lg:flex">
        <Sidebar />
        <main className="flex-1 pt-20 pb-16 px-4 lg:pt-24 lg:pb-20 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Кнопка назад */}
            <Button 
              variant="ghost" 
              className="mb-6 text-gray-600 hover:text-gray-900"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            {/* Основная карточка профиля */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Фото и основная информация */}
                  <div className="flex flex-col items-center lg:items-start">
                    <Avatar className="w-32 h-32 mb-4">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-nannita-dark-blue text-white text-2xl font-semibold">
                        {nanny.firstName?.[0] || 'Н'}{nanny.lastName?.[0] || 'Н'}
                      </AvatarFallback>
                    </Avatar>
                  
                  {/* Рейтинг временно скрыт */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">Рейтинг скоро появится</span>
                  </div>

                  {nanny.isVerified && (
                    <Badge className="bg-green-100 text-green-800 border-0 mb-4">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Верифицирован
                    </Badge>
                  )}
                  </div>

                  {/* Информация о специалисте */}
                  <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {nanny.firstName || 'Няня'} {nanny.middleName ? `${nanny.lastName} ${nanny.firstName} ${nanny.middleName}` : `${nanny.firstName} ${nanny.lastName}`}
                      </h1>
                      <div className="flex flex-wrap gap-3 lg:gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{nanny.age} лет</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Опыт: {nanny.experience} лет</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{nanny.city}{nanny.district ? `, ${nanny.district}` : ''}</span>
                        </div>
                        {nanny.specialization && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{nanny.specialization}</span>
                          </div>
                        )}
                      </div>
                      {nanny.education && (
                        <p className="text-sm text-gray-500 mb-2">Образование: {EDUCATION_TRANSLATIONS[nanny.education] || nanny.education}</p>
                      )}
                      {nanny.citizenship && (
                        <p className="text-sm text-gray-500 mb-2">Гражданство: {nanny.citizenship}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-3xl font-bold text-nannita-orange mb-2">
                        {nanny.hourlyRate} ₽/час
                      </p>
                      {nanny.isAvailable && (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          Доступна
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* О себе */}
                  {nanny.bio && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">О себе</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {nanny.bio}
                      </p>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="bg-nannita-orange hover:bg-nannita-orange-dark text-white px-6"
                      onClick={() => setLocation(`/order-new?nannyId=${nanny.id}`)}
                    >
                      Выбрать специалиста
                    </Button>
                    <Button variant="outline" className="px-6">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Написать сообщение
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные карточки */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Услуги и специализация */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Основные услуги</h3>
                <div className="space-y-3">
                  {nanny.basicDuties && nanny.basicDuties.length > 0 ? (
                    nanny.basicDuties.map((duty, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{DUTY_TRANSLATIONS[duty] || duty}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Присмотр за детьми</span>
                    </div>
                  )}
                </div>
                
                {nanny.additionalDuties && nanny.additionalDuties.length > 0 && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Дополнительные услуги</h4>
                    <div className="space-y-3">
                      {nanny.additionalDuties.map((duty, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">{DUTY_TRANSLATIONS[duty] || duty}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {nanny.ageGroups && nanny.ageGroups.length > 0 && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Возрастные группы</h4>
                    <div className="space-y-3">
                      {(() => {
                        // Сортируем возрастные группы правильно
                        const sortOrder = ['0-1', '1-3', '4-7', '7-11', '11-18'];
                        const sorted = [...nanny.ageGroups].sort((a, b) => {
                          const indexA = sortOrder.indexOf(a);
                          const indexB = sortOrder.indexOf(b);
                          if (indexA === -1 && indexB === -1) return 0;
                          if (indexA === -1) return 1;
                          if (indexB === -1) return -1;
                          return indexA - indexB;
                        });
                        return sorted.map((ageGroup, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            <span className="text-gray-700">{ageGroup}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Документы и навыки */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Документы и навыки</h3>
                <div className="space-y-3">
                  {nanny.documentsInfo && Object.entries(nanny.documentsInfo).map(([doc, hasDoc]) => {
                    if (!hasDoc) return null;
                    const docNames: Record<string, string> = {
                      medicalBook: 'Медицинская книжка',
                      criminalRecord: 'Справка о несудимости',
                      education: 'Диплом об образовании',
                      references: 'Рекомендации'
                    };
                    return (
                      <div key={doc} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{docNames[doc] || doc}</span>
                      </div>
                    );
                  })}
                  
                  {((nanny.medicalSkills && nanny.medicalSkills.length > 0) || (nanny.specialSkills && nanny.specialSkills.length > 0)) && (
                    <>
                      <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Медицинские навыки</h4>
                      <div className="space-y-3">
                        {(nanny.medicalSkills || nanny.specialSkills || []).map((skill, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <span className="text-gray-700">{DUTY_TRANSLATIONS[skill] || skill}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {nanny.pedagogicalMethods && nanny.pedagogicalMethods.length > 0 && (
                    <>
                      <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Педагогические методы</h4>
                      <div className="space-y-3">
                        {nanny.pedagogicalMethods.map((method, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <span className="text-gray-700">{method}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Языки */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Языки</h3>
                <div className="space-y-2">
                  {nanny.languages && nanny.languages.length > 0 ? (
                    nanny.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{lang.language}</span>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {lang.level}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Русский
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Расписание и дополнительная информация */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Расписание работы</h3>
                <div className="space-y-2">
                  {nanny.schedule && Object.entries(nanny.schedule).length > 0 ? (
                    (() => {
                      const dayNames: Record<string, string> = {
                        monday: 'Понедельник',
                        tuesday: 'Вторник', 
                        wednesday: 'Среда',
                        thursday: 'Четверг',
                        friday: 'Пятница',
                        saturday: 'Суббота',
                        sunday: 'Воскресенье'
                      };
                      
                      // Порядок дней недели
                      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      
                      // Фильтруем только дни с enabled: true и сортируем по порядку
                      const workingDays = dayOrder.filter(day => {
                        const dayData = nanny.schedule?.[day];
                        return dayData && dayData.enabled === true && dayData.from && dayData.to;
                      });
                      
                      return workingDays.length > 0 ? workingDays.map(day => {
                        const dayData = nanny.schedule?.[day];
                        return (
                          <div key={day} className="flex justify-between items-center">
                            <span className="text-gray-600">{dayNames[day]}</span>
                            <Badge className="border-0 bg-green-100 text-green-800">
                              {dayData?.from} - {dayData?.to}
                            </Badge>
                          </div>
                        );
                      }) : <p className="text-gray-500">Рабочие дни не указаны</p>;
                    })()
                  ) : (
                    <p className="text-gray-500">Расписание не указано</p>
                  )}
                </div>

                {(nanny.rateOneChild || nanny.rateTwoChildren || nanny.rateThreeChildren || nanny.monthlyRate || nanny.ratesInfo) && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Тарифы</h4>
                    <div className="space-y-2 text-sm">
                      {nanny.rateOneChild && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">За 1 ребенка:</span>
                          <span className="font-medium">{nanny.rateOneChild} ₽/час</span>
                        </div>
                      )}
                      {nanny.rateTwoChildren && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">За 2 детей:</span>
                          <span className="font-medium">{nanny.rateTwoChildren} ₽/час</span>
                        </div>
                      )}
                      {nanny.rateThreeChildren && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">За 3 детей:</span>
                          <span className="font-medium">{nanny.rateThreeChildren} ₽/час</span>
                        </div>
                      )}
                      {nanny.monthlyRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Помесячно:</span>
                          <span className="font-medium">{nanny.monthlyRate} ₽/мес</span>
                        </div>
                      )}
                      {nanny.minOrderHours && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Минимальный заказ:</span>
                          <span className="font-medium">{nanny.minOrderHours} часа</span>
                        </div>
                      )}
                      {nanny.ratesInfo?.overtime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Переработка:</span>
                          <span className="font-medium">{nanny.ratesInfo.overtime} ₽/час</span>
                        </div>
                      )}
                      {nanny.ratesInfo?.holidays && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Праздничные дни:</span>
                          <span className="font-medium">{nanny.ratesInfo.holidays} ₽/час</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {nanny.additionalInfo && Object.keys(nanny.additionalInfo).length > 0 && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Дополнительно</h4>
                    <div className="space-y-2">
                      {nanny.additionalInfo.hasOwnCar && (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600">Есть автомобиль</span>
                        </div>
                      )}
                      {nanny.additionalInfo.petsAllowed && (
                        <div className="flex items-center gap-2">
                          <Dog className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Работает с домашними животными</span>
                        </div>
                      )}
                      {nanny.additionalInfo.selfEmployed && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                          <span className="text-gray-600">Самозанятая</span>
                        </div>
                      )}
                      {!nanny.additionalInfo.smokingAllowed && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Не курит</span>
                        </div>
                      )}
                      {nanny.additionalInfo.allergies && nanny.additionalInfo.allergies !== 'Нет' && (
                        <div className="text-sm text-gray-500">
                          <strong>Аллергии:</strong> {nanny.additionalInfo.allergies}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        </main>
      </div>
      {(!featureFlagLoading && !mobileV2Enabled) && <Footer />}
    </div>
  );
}