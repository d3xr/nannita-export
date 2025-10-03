import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Plus, X, Baby, Clock, MapPin, Heart, Shield, Star, User, Phone, Sparkles, CheckCircle, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { normalizePhone, formatPhoneInput } from '../../../shared/phone-utils';
import { useAuth } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { authClient } from '@/lib/auth-client';

// Схемы валидации
const step1Schema = z.object({
  serviceType: z.string().min(1, 'Выберите тип услуги'),
  children: z.array(z.object({
    gender: z.string(),
    age: z.number().min(0).max(17),
  })).min(1, 'Добавьте хотя бы одного ребёнка'),
  startDate: z.string().min(1, 'Укажите дату начала'),
  startTime: z.string().min(1, 'Укажите время начала'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  city: z.string().min(1, 'Укажите город'),
  metro: z.string().optional(),
  street: z.string().min(1, 'Укажите улицу'),
  house: z.string().min(1, 'Укажите номер дома'),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  entrance: z.string().optional(),
});

const step2Schema = z.object({
  tasks: z.array(z.string()).min(1, 'Выберите хотя бы одну задачу'),
  additionalTasks: z.array(z.string()),
  additionalTasksOther: z.string().optional(),
  healthFeatures: z.array(z.string()),
  healthFeaturesOther: z.string().optional(),
  pets: z.string(),
  paymentMethod: z.string().optional(),
  budgetAmount: z.number().optional(),
  budgetPeriod: z.string().min(1, 'Выберите период оплаты'),
});

const step3Schema = z.object({
  nannyAgeMin: z.number().min(18).max(65),
  nannyAgeMax: z.number().min(18).max(65),
  education: z.string().optional(),
  requirements: z.array(z.string()),
  experienceYears: z.number().min(0).optional(),
  languages: z.string().optional(),
  citizenship: z.string().optional(),
  maritalStatus: z.string().optional(),
  comment: z.string().optional(),
});

const step4Schema = z.object({
  firstName: z.string().min(2, 'Введите имя'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  recipientPhone: z.string().optional(),
  smsCode: z.string().optional(),
  isOtherPersonOrder: z.boolean().optional(),
  otherPersonName: z.string().optional(),
  otherPersonPhone: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

interface Child {
  gender: string;
  age: number;
}

// Константы
const SERVICE_TYPES = [
  'С проживанием',
  'Без проживания', 
  'Разовая помощь',
  'Сопровождение в поездках'
];

const TASKS = [
  'Уход за ребёнком',
  'Кормление',
  'Помощь с уроками',
  'Прогулки',
  'Укладывание спать',
  'Гигиенические процедуры',
  'Уборка игрушек',
  'Транспортировка',
  'Прочее'
];

const ADDITIONAL_TASKS = [
  'Домашние поручения',
  'Мытьё посуды',
  'Приготовление еды',
  'Прочее'
];

const HEALTH_FEATURES = [
  'Астма',
  'Диабет', 
  'Расстройства аутистического спектра',
  'Неврологические заболевания',
  'Ограниченные возможности здоровья',
  'Простудные заболевания',
  'Другие особенности'
];

const PAYMENT_METHODS = [
  'Наличные',
  'На карту',
  'По счету',
  'По договоренности'
];

const BUDGET_PERIODS = [
  'за час',
  'в день', 
  'в месяц'
];

const REQUIREMENTS = [
  'Медицинская книжка',
  'Рекомендации',
  'Педагогическое образование',
  'Водительские права',
  'Готовность к проживанию'
];

// Вспомогательные функции
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const generateHours = (): string[] => {
  const hours = [];
  for (let i = 8; i < 22; i++) {
    hours.push(i.toString().padStart(2, '0'));
  }
  return hours;
};

const generateMinutes = (): string[] => {
  return ['00', '15', '30', '45'];
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
};

export default function OrderNewPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [showHealthFeatures, setShowHealthFeatures] = useState(false);
  const [showAdditionalPreferences, setShowAdditionalPreferences] = useState(false);
  const [showOtherPersonOrder, setShowOtherPersonOrder] = useState(false);
  const [otherPersonName, setOtherPersonName] = useState('');
  const [otherPersonPhone, setOtherPersonPhone] = useState('');
  const [children, setChildren] = useState<Child[]>([{ gender: 'Мальчик', age: 2.5 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCode, setLastCode] = useState<string>('');
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const [location, setLocation] = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Проверяем параметр edit в URL и загружаем данные заказа
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    
    if (editId) {
      setIsEditMode(true);
      setEditOrderId(editId);
      loadOrderForEdit(editId);
    }
  }, [location]);

  // Функция загрузки данных заказа для редактирования
  const loadOrderForEdit = async (orderId: string) => {
    setIsLoadingOrder(true);
    try {
      // FIXED: Now uses AuthClient for protected endpoint
      const response = await authClient.authenticatedRequest(`/api/orders/${orderId}`);
      
      if (response.ok) {
        const order = await response.json();
        
        // Заполняем форму шага 1
        step1Form.reset({
          serviceType: order.serviceType || '',
          children: order.childrenAges?.map((age: string, index: number) => ({
            gender: order.childrenGenders?.[index] || 'Мальчик',
            age: parseFloat(age) || 2.5
          })) || [{ gender: 'Мальчик', age: 2.5 }],
          startDate: order.startDate ? new Date(order.startDate).toISOString().split('T')[0] : getTomorrowDate(),
          startTime: order.startTime || '09:00',
          endDate: order.endDate ? new Date(order.endDate).toISOString().split('T')[0] : getTomorrowDate(),
          endTime: order.endTime || '18:00',
          city: order.city || 'Казань',
          metro: order.metro || '',
          street: order.address?.split(',')[0]?.trim() || '',
          house: order.address?.split(',')[1]?.trim() || '',
          apartment: order.address?.split(',')[2]?.trim() || '',
          floor: order.floor || '',
          entrance: order.entrance || ''
        });
        
        // Обновляем состояние детей
        const childrenData = order.childrenAges?.map((age: string, index: number) => ({
          gender: order.childrenGenders?.[index] || 'Мальчик',
          age: parseFloat(age) || 2.5
        })) || [{ gender: 'Мальчик', age: 2.5 }];
        setChildren(childrenData);
        
        // Заполняем форму шага 2
        step2Form.reset({
          tasks: order.tasks || [],
          additionalTasks: order.additionalTasks || [],
          additionalTasksOther: order.additionalTasksOther || '',
          healthFeatures: order.healthFeatures || [],
          healthFeaturesOther: order.healthFeaturesOther || '',
          pets: order.pets || '',
          paymentMethod: order.paymentMethod || '',
          budgetAmount: parseFloat(order.totalPrice) || 400,
          budgetPeriod: order.paymentType === 'hourly' ? 'за час' : 'в день'
        });
        
        // Заполняем форму шага 3
        console.log('🔍 Order medical requirements:', {
          medicalBookRequired: order.medicalBookRequired,
          recommendationsRequired: order.recommendationsRequired,
          medicalEducationRequired: order.medicalEducationRequired
        });
        
        const requirements = [];
        if (order.medicalBookRequired === true || order.medicalBookRequired === 't') requirements.push('Медицинская книжка');
        if (order.recommendationsRequired === true || order.recommendationsRequired === 't') requirements.push('Рекомендации');
        if (order.medicalEducationRequired === true || order.medicalEducationRequired === 't') requirements.push('Педагогическое образование');
        
        console.log('🔍 Converted requirements array:', requirements);
        
        step3Form.reset({
          nannyAgeMin: order.preferredAgeMin || 18,
          nannyAgeMax: order.preferredAgeMax || 55,
          education: order.educationLevel || '',
          requirements: requirements,
          experienceYears: order.experienceYears || 2,
          languages: order.russianLevelRequired || '',
          citizenship: order.citizenship || '',
          maritalStatus: order.maritalStatus || '',
          comment: order.purposeText || ''
        });
        
        // Заполняем форму шага 4
        step4Form.reset({
          firstName: user?.firstName || '',
          phone: order.phone || '',
          recipientPhone: order.recipientPhone || '',
          smsCode: '',
          isOtherPersonOrder: order.isOtherPersonOrder || false,
          otherPersonName: order.otherPersonName || '',
          otherPersonPhone: order.otherPersonPhone || ''
        });
        
      } else {
        throw new Error('Не удалось загрузить данные заказа');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные заказа для редактирования",
        variant: "destructive"
      });
      setLocation('/my-orders');
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // SEO
  useEffect(() => {
    import('../utils/seo').then(({ useSEO }) => {
      useSEO('orderNew');
    });
  }, []);

  // Прокрутка к началу формы при загрузке и смене шагов
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Синхронизируем начальное состояние детей с формой
  useEffect(() => {
    if (children.length > 0) {
      step1Form.setValue('children', children);
    }
  }, []);

  // Таймер для повторной отправки SMS
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      serviceType: '',
      children: [{ gender: 'Мальчик', age: 2.5 }],
      startDate: getTomorrowDate(),
      startTime: '09:00',
      endDate: getTomorrowDate(),
      endTime: '18:00',
      city: 'Казань',
      metro: '',
      street: '',
      house: '',
      apartment: '',
      floor: '',
      entrance: '',
    }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      tasks: [],
      additionalTasks: [],
      additionalTasksOther: '',
      healthFeatures: [],
      healthFeaturesOther: '',
      pets: '',
      paymentMethod: '',
      budgetAmount: 400,
      budgetPeriod: 'за час',
    }
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      nannyAgeMin: 18,
      nannyAgeMax: 55,
      education: '',
      requirements: [],
      experienceYears: 2,
      languages: '',
      citizenship: '',
      maritalStatus: '',
      comment: '',
    }
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      firstName: '',
      phone: '',
      recipientPhone: '',
      smsCode: '',
      isOtherPersonOrder: false,
      otherPersonName: '',
      otherPersonPhone: '',
    }
  });

  // Обработка добавления детей
  const addChild = () => {
    if (children.length < 5) {
      const newChild = { gender: 'Мальчик', age: 2.5 };
      const newChildren = [...children, newChild];
      setChildren(newChildren);
      step1Form.setValue('children', newChildren);
    }
  };

  const removeChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
    step1Form.setValue('children', newChildren);
  };

  const updateChild = (index: number, field: keyof Child, value: string | number) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
    step1Form.setValue('children', newChildren);
  };

  // Функции обработки шагов
  const onStep1Submit = (data: Step1Data) => {
    console.log('Шаг 1:', data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    console.log('Шаг 2:', data);
    setCurrentStep(3);
  };

  const onStep3Submit = (data: Step3Data) => {
    console.log('Шаг 3:', data);
    // Если пользователь авторизован - сразу создаем заказ
    if (user) {
      handleFinalSubmit();
    } else {
      setCurrentStep(4);
    }
  };

  const sendSmsCode = async () => {
    setIsSubmitting(true);
    try {
      const phoneData = step4Form.getValues();
      const normalizedPhone = normalizePhone(phoneData.phone);
      
      // Используем тот же эндпойнт что и auth-sms
      const response = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone,
          role: 'parent',
          method: 'sms'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCodeSent(true);
        // Сохраняем код для проверки (как в auth-sms)
        setLastCode(result.code || '');
        setTimer(30); // 30 секунд для повторной отправки
        toast({
          title: "SMS отправлен",
          description: "Введите код из SMS для подтверждения",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Не удалось отправить SMS');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить SMS",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStep4Submit = async (data: Step4Data) => {
    if (!codeSent) {
      await sendSmsCode();
      return;
    }
    
    setIsLoading(true);
    try {
      const normalizedPhone = normalizePhone(data.phone);
      
      // Проверяем код на нашей стороне (как в auth-sms)
      if (data.smsCode !== lastCode) {
        throw new Error('Неверный код');
      }
      
      // Создаем фиктивный код для нашего backend'а (как в auth-sms)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Сохраняем код в нашей системе
      await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          role: 'parent',
          skipSending: true, // флаг чтобы не отправлять реальное SMS
          customCode: verificationCode
        }),
      });
      
      // Проверяем код в нашей системе
      const verifyResponse = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          phone: normalizedPhone, 
          code: verificationCode,
          role: 'parent'
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Неверный код подтверждения');
      }

      const result = await verifyResponse.json();
      console.log('Verification result:', result);
      
      // Если это новый пользователь, создаем его
      if (result.isNewUser) {
        const createUserResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: data.firstName,
            phone: normalizedPhone,
            activeRole: 'parent'
          }),
        });

        if (!createUserResponse.ok) {
          throw new Error('Не удалось создать пользователя');
        }

        const newUser = await createUserResponse.json();
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } else if (result.user) {
        // Обновляем существующего пользователя в контексте
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        setUser(result.user);
      }

      await handleFinalSubmit();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (timer > 0) return;
    
    setIsSubmitting(true);
    try {
      const phoneData = step4Form.getValues();
      const normalizedPhone = normalizePhone(phoneData.phone);
      
      // Повторно отправляем SMS через Sigma
      const response = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone,
          role: 'parent',
          method: 'sms'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastCode(result.code || '');
        setTimer(30); // 30 секунд таймер
        toast({
          title: "SMS отправлен",
          description: "Новый код отправлен",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Не удалось отправить код повторно');
      }
    } catch (error) {
      console.error('Resend SMS error:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка повторной отправки",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // Собираем все данные из форм
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();
      
      const orderData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
        phone: user ? user.phone : normalizePhone(step4Form.getValues().phone),
        userId: user?.id, // Убираем fallback к пустой строке
        isOtherPersonOrder: showOtherPersonOrder,
        otherPersonName: showOtherPersonOrder ? otherPersonName : '',
        otherPersonPhone: showOtherPersonOrder ? otherPersonPhone : '',
      };

      console.log(isEditMode ? "Редактирование заказа:" : "Создание заказа:", orderData);

      // Выбираем URL и метод в зависимости от режима
      const url = isEditMode ? `/api/orders/${editOrderId}` : '/api/orders';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Не удалось обновить заказ' : 'Не удалось создать заказ');
      }

      const result = await response.json();
      
      // Обновляем списки заказов для автоматического обновления
      await queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/orders/available'] });
      if (isEditMode && editOrderId) {
        await queryClient.invalidateQueries({ queryKey: ['/api/orders', editOrderId] });
      }
      
      toast({
        title: isEditMode ? '✅ Заказ обновлён!' : '🎉 Заказ создан!',
        description: isEditMode ? 'Изменения в заказе сохранены' : 'Мы подбираем подходящих нянь и скоро с вами свяжемся',
      });
      
      // Редирект в зависимости от режима
      if (isEditMode && editOrderId) {
        setLocation(`/order-detail/${editOrderId}`);
      } else {
        setLocation("/dashboard?tab=nannies");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: isEditMode ? "Не удалось обновить заказ" : "Не удалось создать заказ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const maxSteps = user ? 3 : 4;
  const progressPercentage = (currentStep / maxSteps) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
          
          {/* Заголовок и прогресс */}
          <div className="text-center mb-4">
            {isLoadingOrder ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Загрузка данных заказа...</p>
              </div>
            ) : (
              <>
                <h1 className="text-xl lg:text-2xl font-heading font-medium text-nannita-dark-blue mb-2">
                  {isEditMode ? 'Редактирование заказа' : 'Найдём идеальную няню'}
                </h1>
                <p className="text-gray-600 mb-4 text-sm">
                  Шаг {currentStep} из {maxSteps}: {
                    currentStep === 1 ? 'Основная информация' :
                    currentStep === 2 ? 'Задачи и условия' : 
                    currentStep === 3 ? 'Пожелания к няне' : 'Ваши контакты'
                  }
                </p>
                
                <div className="max-w-sm mx-auto">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </>
            )}
          </div>

          {/* Основная форма */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6 lg:p-8">
              
              {/* ШАГ 1: ОСНОВНОЕ */}
              {currentStep === 1 && (
                <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                  
                  {/* Тип услуги */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-nannita-dark-blue">
                      Тип услуги *
                    </Label>
                    <Select onValueChange={(value) => step1Form.setValue('serviceType', value)} value={step1Form.watch('serviceType')}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                        <SelectValue placeholder="Выберите тип услуги" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step1Form.formState.errors.serviceType && (
                      <p className="text-red-500 text-sm">{step1Form.formState.errors.serviceType.message}</p>
                    )}
                  </div>

                  {/* Дети */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold text-nannita-dark-blue">
                        Дети *
                      </Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addChild} 
                        disabled={children.length >= 5}
                        className="rounded-xl hover:bg-nannita-orange hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {children.map((child, index) => (
                        <div key={index} className="border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div>
                              <Label className="text-sm text-gray-700 mb-1 block">Пол</Label>
                              <Select value={child.gender} 
                                      onValueChange={(value) => updateChild(index, 'gender', value)}>
                                <SelectTrigger className="h-10 rounded-lg focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Мальчик">Мальчик</SelectItem>
                                  <SelectItem value="Девочка">Девочка</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-700 mb-1 block">Возраст</Label>
                              <Input 
                                type="number" 
                                min={0.1}
                                max={17} 
                                step={0.1}
                                value={child.age || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '') {
                                    updateChild(index, 'age', 0); // используем 0 вместо null
                                  } else {
                                    const age = parseFloat(value);
                                    if (!isNaN(age) && age >= 0.1) {
                                      updateChild(index, 'age', age);
                                    }
                                  }
                                }}
                                placeholder="2 года" 
                                className="h-10 rounded-lg focus:ring-0"
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeChild(index)}
                              className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {children.length === 0 && (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <Baby className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Добавьте информацию о детях</p>
                        </div>
                      )}
                    </div>
                    {step1Form.formState.errors.children && (
                      <p className="text-red-500 text-sm">{step1Form.formState.errors.children.message}</p>
                    )}
                  </div>

                  {/* Дата и время */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-nannita-orange" />
                      <Label className="text-base lg:text-lg font-semibold text-nannita-dark-blue">
                        Когда нужна няня *
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-sm text-gray-700 mb-2 block">
                          Дата начала *
                        </Label>
                        <Input 
                          {...step1Form.register('startDate')} 
                          type="date" 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none bg-white text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield',
                            appearance: 'none',
                            backgroundColor: 'white',
                            color: '#111827'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          По умолчанию завтра — {formatDateForDisplay(getTomorrowDate())}
                        </p>
                        {step1Form.formState.errors.startDate && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.startDate.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="startTime" className="text-sm text-gray-700 mb-2 block">
                          Время начала *
                        </Label>
                        <Input 
                          {...step1Form.register('startTime')} 
                          type="time" 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none bg-white text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield',
                            appearance: 'none',
                            backgroundColor: 'white',
                            color: '#111827'
                          }}
                        />
                        {step1Form.formState.errors.startTime && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.startTime.message}</p>
                        )}
                      </div>
                    </div>

                    {step1Form.watch('serviceType') !== 'Разовая помощь' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="endDate" className="text-sm text-gray-700 mb-2 block">
                              Дата окончания
                            </Label>
                            <Input 
                              {...step1Form.register('endDate')} 
                              type="date" 
                              className="h-12 w-full rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none bg-white text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                appearance: 'none',
                                backgroundColor: 'white',
                                color: '#111827'
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endTime" className="text-sm text-gray-700 mb-2 block">
                              Время окончания
                            </Label>
                            <Input 
                              {...step1Form.register('endTime')} 
                              type="time" 
                              className="h-12 w-full rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none bg-white text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                appearance: 'none',
                                backgroundColor: 'white',
                                color: '#111827'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Адрес */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-nannita-orange" />
                      <Label className="text-base lg:text-lg font-semibold text-nannita-dark-blue">
                        Адрес *
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm text-gray-700 mb-2 block">Город *</Label>
                        <Input 
                          {...step1Form.register('city')} 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                          placeholder="Казань"
                        />
                      </div>
                      <div>
                        <Label htmlFor="metro" className="text-sm text-gray-700 mb-2 block">Метро</Label>
                        <Input 
                          {...step1Form.register('metro')} 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                          placeholder="Кремлевская"
                        />
                      </div>
                      <div>
                        <Label htmlFor="street" className="text-sm text-gray-700 mb-2 block">Улица *</Label>
                        <Input 
                          {...step1Form.register('street')} 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                          placeholder="ул. Пушкина"
                        />
                        {step1Form.formState.errors.street && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.street.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="house" className="text-sm text-gray-700 mb-2 block">Дом *</Label>
                        <Input 
                          {...step1Form.register('house')} 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                          placeholder="5А"
                        />
                        {step1Form.formState.errors.house && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.house.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setShowAddressDetails(!showAddressDetails)}
                      className="text-nannita-orange hover:text-nannita-orange-dark p-0 h-auto font-semibold"
                    >
                      {showAddressDetails ? '- Скрыть дополнительный адрес' : '+ Добавить квартиру, этаж, подъезд'}
                    </Button>
                    {showAddressDetails && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <Label htmlFor="apartment" className="text-sm text-gray-700 mb-2 block">Квартира</Label>
                          <Input 
                            {...step1Form.register('apartment')} 
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <Label htmlFor="floor" className="text-sm text-gray-700 mb-2 block">Этаж</Label>
                          <Input 
                            {...step1Form.register('floor')} 
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                            placeholder="5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="entrance" className="text-sm text-gray-700 mb-2 block">Подъезд</Label>
                          <Input 
                            {...step1Form.register('entrance')} 
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                            placeholder="1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Заказ для другого человека */}
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => {
                        const newState = !showOtherPersonOrder;
                        setShowOtherPersonOrder(newState);
                        if (!newState) {
                          setOtherPersonName('');
                          setOtherPersonPhone('');
                        }
                      }}
                      className="text-nannita-orange hover:text-nannita-orange-dark p-0 h-auto font-semibold"
                    >
                      {showOtherPersonOrder ? '- Скрыть заказ для другого' : '+ Заказ для другого человека'}
                    </Button>
                    
                    {showOtherPersonOrder && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <Label htmlFor="otherPersonName" className="text-sm font-medium text-gray-700 mb-2 block">
                            Имя заказчика *
                          </Label>
                          <Input 
                            value={otherPersonName}
                            onChange={(e) => setOtherPersonName(e.target.value)}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none text-base"
                            placeholder="Например: Мария Ивановна"
                          />
                        </div>
                        <div>
                          <Label htmlFor="otherPersonPhone" className="text-sm font-medium text-gray-700 mb-2 block">
                            Телефон заказчика *
                          </Label>
                          <Input 
                            value={otherPersonPhone}
                            onChange={(e) => {
                              const formatted = formatPhoneInput(e.target.value);
                              setOtherPersonPhone(formatted);
                            }}
                            type="tel"
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none text-base"
                            placeholder="+7 (999) 123-45-67"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Контакт того, кто будет общаться с няней (без SMS проверки)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-6">
                    <div></div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-nannita-orange hover:bg-nannita-orange-dark text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* ШАГ 2: ЗАДАЧИ И УСЛОВИЯ */}
              {currentStep === 2 && (
                <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                  
                  {/* Задачи для няни */}
                  <div className="space-y-4">
                    <Label className="text-base lg:text-lg font-semibold text-nannita-dark-blue">
                      Задачи для няни *
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Укажите хотя бы одно задание — так мы найдём подходящего человека
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                      {TASKS.map((task) => (
                        <div key={task} className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                          <Checkbox 
                            id={task}
                            checked={step2Form.watch('tasks').includes(task)}
                            onCheckedChange={(checked) => {
                              const current = step2Form.getValues('tasks');
                              if (checked) {
                                step2Form.setValue('tasks', [...current, task]);
                              } else {
                                step2Form.setValue('tasks', current.filter(t => t !== task));
                              }
                            }}
                          />
                          <Label htmlFor={task} className="text-sm flex-1 cursor-pointer">{task}</Label>
                        </div>
                      ))}
                    </div>
                    
                    {step2Form.watch('tasks').includes('Прочее') && (
                      <Textarea 
                        placeholder="Опишите дополнительные задачи для няни..."
                        className="rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none"
                        onChange={(e) => {
                          step2Form.setValue('additionalTasksOther', e.target.value);
                        }}
                      />
                    )}
                    {step2Form.formState.errors.tasks && (
                      <p className="text-red-500 text-sm">{step2Form.formState.errors.tasks.message}</p>
                    )}
                  </div>

                  {/* Дополнительно */}
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setShowAdditional(!showAdditional)}
                      className="text-nannita-orange hover:text-nannita-orange-dark p-0 h-auto font-semibold"
                    >
                      {showAdditional ? '- Скрыть дополнительные задачи' : '+ Дополнительные задачи'}
                    </Button>
                    {showAdditional && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 p-3 bg-gray-50 rounded-xl">
                        {ADDITIONAL_TASKS.map((task) => (
                          <div key={task} className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                            <Checkbox 
                              id={`additional-${task}`}
                              checked={step2Form.watch('additionalTasks').includes(task)}
                              onCheckedChange={(checked) => {
                                const current = step2Form.getValues('additionalTasks');
                                if (checked) {
                                  step2Form.setValue('additionalTasks', [...current, task]);
                                } else {
                                  step2Form.setValue('additionalTasks', current.filter(t => t !== task));
                                }
                              }}
                            />
                            <Label htmlFor={`additional-${task}`} className="text-sm flex-1 cursor-pointer">{task}</Label>
                          </div>
                        ))}
                        {showAdditional && step2Form.watch('additionalTasks').includes('Прочее') && (
                          <div className="col-span-full mt-2">
                            <Textarea 
                              {...step2Form.register('additionalTasksOther')}
                              placeholder="Опишите дополнительные задачи..."
                              className="rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Особенности здоровья */}
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setShowHealthFeatures(!showHealthFeatures)}
                      className="text-nannita-orange hover:text-nannita-orange-dark p-0 h-auto font-semibold"
                    >
                      {showHealthFeatures ? '- Скрыть особенности здоровья' : '+ Особенности здоровья ребёнка'}
                    </Button>
                    {showHealthFeatures && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 p-3 bg-gray-50 rounded-xl">
                        {HEALTH_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                            <Checkbox 
                              id={`health-${feature}`}
                              checked={step2Form.watch('healthFeatures').includes(feature)}
                              onCheckedChange={(checked) => {
                                const current = step2Form.getValues('healthFeatures');
                                if (checked) {
                                  step2Form.setValue('healthFeatures', [...current, feature]);
                                } else {
                                  step2Form.setValue('healthFeatures', current.filter(t => t !== feature));
                                }
                              }}
                            />
                            <Label htmlFor={`health-${feature}`} className="text-sm flex-1 cursor-pointer">{feature}</Label>
                          </div>
                        ))}
                        {showHealthFeatures && step2Form.watch('healthFeatures').includes('Другие особенности') && (
                          <div className="col-span-full mt-2">
                            <Textarea 
                              {...step2Form.register('healthFeaturesOther')}
                              placeholder="Опишите особенности здоровья..."
                              className="rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Домашние животные */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-nannita-dark-blue">
                      Наличие домашних животных
                    </Label>
                    <Select onValueChange={(value) => step2Form.setValue('pets', value)} value={step2Form.watch('pets')}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0">
                        <SelectValue placeholder="Есть ли домашние животные?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Да">Да, есть</SelectItem>
                        <SelectItem value="Нет">Нет</SelectItem>
                        <SelectItem value="Уточню позже">Уточню позже</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Оплата */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-nannita-dark-blue">
                        Способ оплаты
                      </Label>
                      <Select onValueChange={(value) => step2Form.setValue('paymentMethod', value)} value={step2Form.watch('paymentMethod')}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                          <SelectValue placeholder="Как будете платить?" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {step2Form.formState.errors.paymentMethod && (
                        <p className="text-red-500 text-sm">{step2Form.formState.errors.paymentMethod.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-nannita-dark-blue">
                        Бюджет
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                          type="number"
                          min={1}
                          value={step2Form.watch('budgetAmount') || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              step2Form.setValue('budgetAmount', undefined);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                step2Form.setValue('budgetAmount', numValue);
                              }
                            }
                          }}
                          placeholder="400"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none flex-1"
                        />
                        <Select 
                          onValueChange={(value) => step2Form.setValue('budgetPeriod', value)}
                          value={step2Form.watch('budgetPeriod') || 'за час'}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus-visible:outline-none focus-visible:ring-0 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUDGET_PERIODS.map(period => (
                              <SelectItem key={period} value={period}>{period}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {step2Form.watch('budgetAmount') && step2Form.watch('budgetAmount')! < 300 && step2Form.watch('budgetPeriod') === 'за час' && (
                        <p className="text-amber-600 text-sm flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Рекомендуем от 400 ₽/час для качественного ухода
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goBack}
                      className="rounded-xl border-2 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-nannita-orange hover:bg-nannita-orange-dark text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* ШАГ 3: ПОЖЕЛАНИЯ К НЯНЕ */}
              {currentStep === 3 && (
                <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-4">
                  
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Ваши пожелания не обязательны, но помогут найти идеального кандидата
                    </p>
                  </div>

                  {/* Возраст няни */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-nannita-dark-blue">
                      Предпочтительный возраст няни
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nannyAgeMin" className="text-sm text-gray-700 mb-2 block">От</Label>
                        <Input 
                          type="number" 
                          min={18} 
                          max={65}
                          {...step3Form.register('nannyAgeMin', { valueAsNumber: true })}
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nannyAgeMax" className="text-sm text-gray-700 mb-2 block">До</Label>
                        <Input 
                          type="number" 
                          min={18} 
                          max={65}
                          {...step3Form.register('nannyAgeMax', { valueAsNumber: true })}
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none"
                          placeholder="55"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Требования */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-nannita-dark-blue">
                      Требования к няне
                    </Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {REQUIREMENTS.map((requirement) => (
                        <div key={requirement} className="flex items-center space-x-2 p-1 hover:bg-green-50 rounded-lg transition-colors">
                          <Checkbox 
                            id={`req-${requirement}`}
                            checked={step3Form.watch('requirements').includes(requirement)}
                            onCheckedChange={(checked) => {
                              const current = step3Form.getValues('requirements');
                              if (checked) {
                                step3Form.setValue('requirements', [...current, requirement]);
                              } else {
                                step3Form.setValue('requirements', current.filter(r => r !== requirement));
                              }
                            }}
                          />
                          <Label htmlFor={`req-${requirement}`} className="text-sm flex-1 cursor-pointer">{requirement}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Опыт работы */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-nannita-dark-blue">
                      Минимальный опыт работы
                    </Label>
                    <Input 
                      type="number" 
                      min={0}
                      {...step3Form.register('experienceYears', { valueAsNumber: true })}
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none max-w-xs"
                      placeholder="2 года"
                    />
                    <p className="text-xs text-gray-500">Укажите количество лет</p>
                  </div>

                  {/* Дополнительные пожелания */}
                  {!showAdditionalPreferences && (
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setShowAdditionalPreferences(true)}
                      className="text-nannita-orange hover:text-nannita-orange-dark p-0 h-auto"
                    >
                      + Показать дополнительные пожелания
                    </Button>
                  )}
                  
                  {showAdditionalPreferences && (
                    <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-nannita-dark-blue">Дополнительные пожелания</h4>
                      
                      <div>
                        <Label htmlFor="languages" className="text-sm text-gray-700 mb-2 block">
                          Знание иностранных языков
                        </Label>
                        <Input 
                          {...step3Form.register('languages')} 
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none" 
                          placeholder="Например, английский, немецкий"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">Гражданство</Label>
                          <Select onValueChange={(value) => step3Form.setValue('citizenship', value)} value={step3Form.watch('citizenship')}>
                            <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                              <SelectValue placeholder="Не важно" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="РФ">Российская Федерация</SelectItem>
                              <SelectItem value="СНГ">СНГ</SelectItem>
                              <SelectItem value="Другое">Другое</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-700 mb-2 block">Семейное положение</Label>
                          <Select onValueChange={(value) => step3Form.setValue('maritalStatus', value)} value={step3Form.watch('maritalStatus')}>
                            <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                              <SelectValue placeholder="Не важно" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Не замужем">Не замужем</SelectItem>
                              <SelectItem value="Замужем">Замужем</SelectItem>
                              <SelectItem value="Не важно">Не важно</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Комментарий */}
                  <div className="space-y-3">
                    <Label htmlFor="comment" className="text-base font-semibold text-nannita-dark-blue">
                      Комментарий к заказу
                    </Label>
                    <Textarea 
                      {...step3Form.register('comment')}
                      placeholder="Расскажите о дополнительных пожеланиях, особенностях ребёнка или семьи, что важно знать няне..."
                      className="rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 min-h-[120px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">До 500 символов</p>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goBack}
                      className="rounded-xl border-2 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {isEditMode ? 'Обновляем...' : 'Создаём заказ...'}
                        </>
                      ) : user ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isEditMode ? 'Сохранить изменения' : 'Создать заказ'}
                        </>
                      ) : (
                        <>
                          Далее
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ШАГ 4: КОНТАКТЫ (только для неавторизованных) */}
              {currentStep === 4 && !user && (
                <form onSubmit={step4Form.handleSubmit(onStep4Submit)} className="space-y-4">

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName" className="text-base font-semibold text-nannita-dark-blue mb-3 block">
                        Как к вам обращаться? *
                      </Label>
                      <Input 
                        {...step4Form.register('firstName')}
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none text-base"
                        placeholder="Введите ваше имя"
                      />
                      {step4Form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{step4Form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-base font-semibold text-nannita-dark-blue mb-3 block">
                        Номер телефона *
                      </Label>
                      <Input 
                        {...step4Form.register('phone')}
                        type="tel"
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none text-base"
                        placeholder="+7 999 123-45-67"
                        onChange={(e) => {
                          const formatted = formatPhoneInput(e.target.value);
                          e.target.value = formatted;
                          step4Form.setValue('phone', formatted);
                        }}
                        onKeyDown={(e) => {
                          // Разрешаем удаление даже если поле начинается с +7
                          if (e.key === 'Backspace' && e.currentTarget.value === '+7 ') {
                            e.currentTarget.value = '';
                            step4Form.setValue('phone', '');
                            e.preventDefault();
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        На этот номер придёт код подтверждения
                      </p>
                      {step4Form.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{step4Form.formState.errors.phone.message}</p>
                      )}
                    </div>
                    
                    {codeSent && (
                      <div>
                        <Label htmlFor="smsCode" className="text-base font-semibold text-nannita-dark-blue mb-3 block">
                          Код из SMS
                        </Label>
                        <Input 
                          {...step4Form.register('smsCode')}
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-nannita-orange focus:ring-0 focus:outline-none text-base text-center text-2xl tracking-widest"
                          placeholder="0000"
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Введите код из SMS
                        </p>
                        
                        {/* Таймер и кнопка повторной отправки */}
                        <div className="text-center mt-3">
                          {timer > 0 ? (
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                              <Timer className="h-4 w-4" />
                              Повторить через {timer} сек
                            </p>
                          ) : (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={resendCode}
                              disabled={isSubmitting}
                              className="text-sm text-nannita-orange hover:text-nannita-orange-dark"
                            >
                              Отправить SMS повторно
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Согласия на обработку данных */}
                  <div className="space-y-3 border-t pt-6">
                    <p className="text-sm font-medium text-nannita-dark-blue">Для создания заказа необходимо принять соглашения:</p>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="agreements" className="mt-0.5" />
                      <Label htmlFor="agreements" className="text-sm leading-relaxed">
                        Я принимаю условия{' '}
                        <a href="/agreement" target="_blank" className="text-orange-500 hover:underline">
                          Пользовательского соглашения
                        </a>
                        {' '}и даю{' '}
                        <a href="/personal-data-consent" target="_blank" className="text-orange-500 hover:underline">
                          согласие на обработку персональных данных
                        </a>
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goBack}
                      className="rounded-xl border-2 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting || isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Отправка...
                        </>
                      ) : isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {isEditMode ? 'Обновление...' : 'Создание...'}
                        </>
                      ) : codeSent ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isEditMode ? 'Сохранить изменения' : 'Создать заказ'}
                        </>
                      ) : (
                        <>
                          Далее
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Отступ перед подвалом */}
          <div className="h-24 lg:h-32"></div>

          {/* Дополнительная информация */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 mr-2" />
                Все няни проверены
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 mr-2" />
                Ответ в течение часа
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 mr-2" />
                300+ довольных семей
              </Badge>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}