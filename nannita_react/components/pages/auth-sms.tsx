import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Phone, PhoneCall, MessageSquare, User, Shield, Timer, Smartphone, Volume2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { isV2EligibleRoute } from "@/utils/v2Routes";
import { normalizePhone, formatPhoneInput } from "@shared/phone-utils";
import { authClient } from "@/lib/auth-client";

const phoneSchema = z.object({
  phone: z.string().min(10, "Введите корректный номер телефона"),
  role: z.enum(["parent", "nanny"]),
  agreements: z.boolean().refine(val => val === true, "Необходимо принять соглашения"),
});

const codeSchema = z.object({
  code: z.string().regex(/^\d{4,6}$/, "Код должен содержать от 4 до 6 цифр"),
});

const profileSchema = z.object({
  firstName: z.string().min(2, "Введите имя"),
  lastName: z.string().optional(),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type CodeFormData = z.infer<typeof codeSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

type AuthMethod = 'otp' | 'voice' | 'sms' | 'flashcall';

export default function AuthSmsPage() {
  const [location, setLocation] = useLocation();
  const { setUser, isAuthenticated } = useAuth();
  
  // V2 Mobile Header Logic
  const isMobile = useIsMobile();
  const { isEnabled: isV2Enabled } = useFeatureFlag('MOBILE_V2');
  const shouldUseV2 = isMobile && isV2Enabled && isV2EligibleRoute(location);

  // SEO для страницы авторизации
  useEffect(() => {
    import('../utils/seo').then(({ useSEO }) => {
      useSEO('auth');
    });
  }, []);
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');
  const [lastCode, setLastCode] = useState<string>('');
  const [attemptCounts, setAttemptCounts] = useState({ otp: 0, voice: 0, sms: 0, flashcall: 0 });
  const [nextMethod, setNextMethod] = useState<AuthMethod>('otp');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
      role: "parent",
      agreements: false,
    },
  });

  // Получаем параметры из URL для pre-fill формы
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const phoneParam = urlParams.get('phone');
    const roleParam = urlParams.get('role') as 'parent' | 'nanny';
    
    if (phoneParam) {
      phoneForm.setValue('phone', phoneParam);
    }
    if (roleParam && (roleParam === 'parent' || roleParam === 'nanny')) {
      phoneForm.setValue('role', roleParam);
    }
  }, [phoneForm]);

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Перенаправляем авторизованных пользователей на соответствующую страницу
  useEffect(() => {
    if (isAuthenticated) {
      // Редирект будет обработан useRoleRedirect хуком
      return;
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    document.title = "Вход через звонок/SMS — Nannita";
    
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Генерируем случайный 4-значный код
  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendVerification = async (phone: string, role: string, method: string = 'sms') => {
    const response = await fetch('/api/auth/otp-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        role,
        method
      })
    });
    return response;
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Сброс счетчиков при новой авторизации
      setAttemptCounts({ otp: 0, voice: 0, sms: 0, flashcall: 0 });
      
      // Первый вызов - теперь SMS как основной метод
      const response = await sendVerification(data.phone, data.role, 'sms');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отправить код верификации');
      }
      
      const result = await response.json();
      
      setAuthMethod('sms');
      setAttemptCounts({ otp: 0, voice: 0, sms: 1, flashcall: 0 }); // Первая попытка SMS
      setLastCode(result.code || '');
      setPhoneData(data);
      setStep('code');
      setTimer(30); // 30 секунд для повторной отправки
      
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedPhone = normalizePhone(phoneData!.phone);
      
      // Проверяем введенный пользователем код напрямую
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: normalizedPhone,
          code: data.code, // Используем код, введенный пользователем
          role: phoneData!.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Неверный код');
      }

      // ИСПРАВЛЕНИЕ: Сохраняем JWT токены для Enterprise authentication
      if (result.accessToken) {
        authClient.saveAccessTokenToStorage({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          tokenType: result.tokenType
        });
        console.log('🔐 JWT tokens saved to localStorage after authentication');
      }

      if (result.isNewUser) {
        setStep('profile');
      } else {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        setUser(result.user);
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        if (returnUrl) {
          setLocation(returnUrl);
        } else {
          const redirectUrl = result.user.activeRole === 'nanny' ? '/nanny-dashboard' : '/my-orders';
          setLocation(redirectUrl);
        }
      }
    } catch (error) {
      setError('Неверный код. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedPhone = normalizePhone(phoneData!.phone);
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: normalizedPhone,
          role: phoneData!.role,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка регистрации');
      }

      const result = await response.json();
      
      // ИСПРАВЛЕНИЕ: Сохраняем JWT токены для Enterprise authentication
      if (result.accessToken) {
        authClient.saveAccessTokenToStorage({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          tokenType: result.tokenType
        });
        console.log('🔐 JWT tokens saved to localStorage after registration');
      }
      
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      setUser(result.user);
      
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      if (returnUrl) {
        setLocation(returnUrl);
      } else {
        if (phoneData!.role === 'nanny') {
          setLocation('/nanny-onboarding');
        } else {
          setLocation('/my-orders');
        }
      }
    } catch (error) {
      setError('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (timer > 0 || !phoneData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let newMethod: AuthMethod = authMethod;
      let newAttempts = { ...attemptCounts };
      
      // АВТОМАТИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ: После 3 попыток SMS переходим на flashcall
      if (authMethod === 'sms' && attemptCounts.sms >= 3) {
        newMethod = 'flashcall';
        newAttempts.flashcall += 1;
        console.log('🔄 Auto-switching to flashcall after 3 SMS attempts');
        // Показываем уведомление о переключении
        setError('Переключаемся на Flash Call после 3 попыток SMS. Сейчас вам поступит звонок.');
      } else {
        // Увеличиваем счетчик текущего метода
        newAttempts[authMethod] += 1;
      }
      
      const response = await sendVerification(phoneData.phone, phoneData.role, newMethod);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отправить код повторно');
      }
      
      const result = await response.json();
      
      setAuthMethod(newMethod);
      setAttemptCounts(newAttempts);
      setLastCode(result.code || '');
      setTimer(30); // 30 секунд таймер
      
    } catch (error: any) {
      setError(error.message || 'Ошибка повторной отправки. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };



  // Мгновенное перенаправление авторизованных пользователей
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  // Не показываем форму авторизации, если пользователь уже авторизован
  if (isAuthenticated) {
    return null; // Компонент не отображается, так как идет перенаправление
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldUseV2 && <Header />}
      
      <main className={`${shouldUseV2 ? 'pt-0' : 'pt-[73px]'} pb-16`}>
        <div className="container mx-auto px-4 max-w-md lg:max-w-lg">
          <Card className="mt-8">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-nannita-orange">
                {step === 'phone' ? (
                  <Smartphone className="h-6 w-6 text-white" />
                ) : step === 'code' ? (
                  <MessageSquare className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <CardTitle className="text-xl lg:text-2xl font-heading text-gray-900">
                {step === 'phone' && 'Безопасная авторизация'}
                {step === 'code' && (
                  authMethod === 'sms' ? 'SMS код' : 
                  authMethod === 'flashcall' ? 'Flash call' : 
                  'Код верификации'
                )}
                {step === 'profile' && 'Завершение регистрации'}
              </CardTitle>
              <div className="text-sm text-gray-600 space-y-1">
                {step === 'phone' && (
                  <p>Получите SMS код для входа в сервис</p>
                )}
                {step === 'code' && (
                  <p className="text-gray-700">
                    {authMethod === 'sms' ? 'SMS код отправлен на' : 
                     authMethod === 'flashcall' ? 'Flash call на номер' : 
                     'Код отправлен на'} {phoneData?.phone}
                    {authMethod === 'flashcall' && (
                      <span className="block text-sm text-gray-500 mt-1">
                        Введите последние 4 цифры номера звонящего
                      </span>
                    )}
                  </p>
                )}
                {step === 'profile' && (
                  <p>Расскажите немного о себе</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {step === 'phone' && (
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Я —</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="parent">Клиент (ищу специалиста)</SelectItem>
                              <SelectItem value="nanny">Специалист (хочу работать)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Номер телефона</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+7 (999) 123-45-67"
                              {...field}
                              type="tel"
                              onChange={(e) => {
                                const formatted = formatPhoneInput(e.target.value);
                                field.onChange(formatted);
                              }}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Соглашения */}
                    <FormField
                      control={phoneForm.control}
                      name="agreements"
                      render={({ field }) => (
                        <FormItem className="border-t pt-4">
                          <div className="flex items-start space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="agreements"
                                className="mt-0.5"
                              />
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-nannita-orange hover:bg-nannita-orange-dark"
                      data-testid="button-submit"
                    >
                      {isLoading ? "Отправляем SMS..." : "Получить SMS код"}
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'code' && (
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-6">
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-gray-900">
                            {authMethod === 'flashcall' ? 'Последние 4 цифры звонящего' : 'Код из SMS'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0000"
                              {...field}
                              maxLength={4}
                              className="text-center text-2xl tracking-[0.5em] font-bold h-14 bg-gray-50 border border-gray-200 focus:border-nannita-orange focus:bg-white transition-colors"
                              data-testid="input-code"
                              autoComplete="one-time-code"
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full bg-nannita-orange hover:bg-nannita-orange-dark"
                      data-testid="button-verify"
                    >
                      {isLoading ? "Проверяем..." : "Подтвердить"}
                    </Button>

                    <div className="text-center">
                      {timer > 0 ? (
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Timer className="h-4 w-4" />
                          Повторить через {timer} сек
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={resendCode}
                            disabled={isLoading}
                            className="text-sm"
                            data-testid="button-resend"
                          >
                            {authMethod === 'flashcall' ? 'Повторить звонок' : 'Отправить SMS повторно'}
                          </Button>
                          

                        </div>
                      )}
                      

                    </div>
                  </form>
                </Form>
              )}

              {step === 'profile' && (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ваше имя" data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Фамилия (необязательно)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ваша фамилия" data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (необязательно)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="your@email.com" type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full bg-nannita-orange hover:bg-nannita-orange-dark"
                      data-testid="button-complete"
                    >
                      {isLoading ? "Завершаем..." : "Завершить регистрацию"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {!shouldUseV2 && <Footer />}
    </div>
  );
}