import { useState, useEffect, useCallback } from 'react';
import { isFeatureEnabled, getFeatureFlagInfo, FeatureFlagKey, FEATURE_FLAGS } from '@/utils/featureFlags';
import { useLocation } from 'wouter';

export interface UseFeatureFlagResult {
  isEnabled: boolean;
  isLoading: boolean;
  debugInfo?: ReturnType<typeof getFeatureFlagInfo>;
}

export interface UseFeatureFlagOptions {
  enableDebug?: boolean; // Включает дополнительную отладочную информацию
  reCheckOnResize?: boolean; // Перепроверять при изменении размера экрана
  reCheckOnUrlChange?: boolean; // Перепроверять при изменении URL
  reCheckOnNavigation?: boolean; // Перепроверять при wouter навигации
}

/**
 * React хук для проверки фичефлагов
 * 
 * @param flagKey - Ключ фичефлага
 * @param options - Дополнительные опции
 * @returns Объект с информацией о состоянии фичефлага
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled, isLoading } = useFeatureFlag('MOBILE_ORDERS_V2');
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return isEnabled ? <NewOrdersInterface /> : <OldOrdersInterface />;
 * }
 * ```
 */
export function useFeatureFlag(
  flagKey: FeatureFlagKey,
  options: UseFeatureFlagOptions = {}
): UseFeatureFlagResult {
  const {
    enableDebug = false,
    reCheckOnResize = true,
    reCheckOnUrlChange = true,
    reCheckOnNavigation = true
  } = options;

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<ReturnType<typeof getFeatureFlagInfo>>();
  const [currentLocation] = useLocation();

  // Функция для проверки фичефлага
  const checkFeatureFlag = useCallback(() => {
    try {
      const enabled = isFeatureEnabled(flagKey, { enableDebugLog: enableDebug });
      setIsEnabled(enabled);
      
      if (enableDebug) {
        const info = getFeatureFlagInfo(flagKey);
        setDebugInfo(info);
        if (import.meta.env.DEV) {
          console.log(`🏳️ Feature flag "${flagKey}" check:`, info);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error checking feature flag "${flagKey}":`, error);
      }
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [flagKey, enableDebug]);

  // Первоначальная проверка при монтировании
  useEffect(() => {
    checkFeatureFlag();
  }, [checkFeatureFlag]);

  // Перепроверка при wouter навигации
  useEffect(() => {
    if (!reCheckOnNavigation) return;
    
    const config = FEATURE_FLAGS[flagKey];
    // Проверяем ROLLBACK_V1 для MOBILE_ORDERS_V2
    const rollbackConfig = flagKey === 'MOBILE_ORDERS_V2' ? FEATURE_FLAGS['ROLLBACK_V1'] : null;
    const needsRecheck = config?.urlParamOverride || config?.abTestingEnabled || rollbackConfig?.urlParamOverride;
    
    if (!needsRecheck) {
      return; // Не нужно перепроверять если нет URL созависимых логик
    }
    
    checkFeatureFlag();
  }, [currentLocation, reCheckOnNavigation, checkFeatureFlag, flagKey]);

  // Обработчик изменения размера экрана
  useEffect(() => {
    if (!reCheckOnResize) return;

    const config = FEATURE_FLAGS[flagKey];
    if (!config?.deviceRestriction || config.deviceRestriction === 'all') {
      return; // Не нужно отслеживать resize если нет device restriction
    }

    let timeoutId: number;
    
    const handleResize = () => {
      // Дебаунс для производительности
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        checkFeatureFlag();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(timeoutId);
    };
  }, [flagKey, reCheckOnResize, checkFeatureFlag]);

  // Обработчик изменения URL (для URL параметров)
  useEffect(() => {
    if (!reCheckOnUrlChange) return;

    const config = FEATURE_FLAGS[flagKey];
    // Проверяем ROLLBACK_V1 для MOBILE_ORDERS_V2
    const rollbackConfig = flagKey === 'MOBILE_ORDERS_V2' ? FEATURE_FLAGS['ROLLBACK_V1'] : null;
    const hasUrlOverride = config?.urlParamOverride || rollbackConfig?.urlParamOverride;
    
    if (!hasUrlOverride) {
      return; // Не нужно отслеживать URL если нет URL override
    }

    const handlePopState = () => {
      checkFeatureFlag();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [flagKey, reCheckOnUrlChange, checkFeatureFlag]);

  return {
    isEnabled,
    isLoading,
    ...(enableDebug && { debugInfo })
  };
}

/**
 * Хук для проверки специфического фичефлага MOBILE_ORDERS_V2
 * Включает автоматическую конфигурацию для мобильных заказов
 * 
 * @example
 * ```tsx
 * function MyOrdersPage() {
 *   const { isEnabled, isLoading } = useMobileOrdersV2();
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return isEnabled ? <MobileOrdersV2 /> : <StandardOrders />;
 * }
 * ```
 */
export function useMobileOrdersV2(options: Omit<UseFeatureFlagOptions, 'reCheckOnResize'> = {}) {
  return useFeatureFlag('MOBILE_ORDERS_V2', {
    ...options,
    reCheckOnResize: true, // Всегда отслеживаем resize для мобильного флага
    reCheckOnNavigation: true, // Также перепроверяем при навигации
  });
}

/**
 * Хук для проверки специфического фичефлага MOBILE_ORDER_DETAIL_V2
 * Включает автоматическую конфигурацию для мобильной детальной страницы заказа
 * 
 * @example
 * ```tsx
 * function OrderDetailPage() {
 *   const { isEnabled, isLoading } = useMobileOrderDetailV2();
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return isEnabled ? <OrderDetailMobileV2 /> : <StandardOrderDetail />;
 * }
 * ```
 */
export function useMobileOrderDetailV2(options: Omit<UseFeatureFlagOptions, 'reCheckOnResize'> = {}) {
  return useFeatureFlag('MOBILE_ORDER_DETAIL_V2', {
    ...options,
    reCheckOnResize: true, // Всегда отслеживаем resize для мобильного флага
    reCheckOnNavigation: true, // Также перепроверяем при навигации
  });
}

/**
 * Хук для проверки специфического фичефлага MOBILE_NANNY_PROFILE_V2
 * Включает автоматическую конфигурацию для мобильной детальной страницы профиля няни
 * 
 * @example
 * ```tsx
 * function NannyProfilePage() {
 *   const { isEnabled, isLoading } = useMobileNannyProfileV2();
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return isEnabled ? <NannyProfileMobileV2 /> : <StandardNannyProfile />;
 * }
 * ```
 */
export function useMobileNannyProfileV2(options: Omit<UseFeatureFlagOptions, 'reCheckOnResize'> = {}) {
  return useFeatureFlag('MOBILE_NANNY_PROFILE_V2', {
    ...options,
    reCheckOnResize: true, // Всегда отслеживаем resize для мобильного флага
    reCheckOnNavigation: true, // Также перепроверяем при навигации
  });
}

/**
 * Хук для проверки специфического фичефлага MOBILE_MY_RESPONSES_V2
 * Включает автоматическую конфигурацию для мобильной страницы откликов специалистов
 * 
 * @example
 * ```tsx
 * function MyResponsesPage() {
 *   const { isEnabled, isLoading } = useMobileMyResponsesV2();
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return isEnabled ? <MyResponsesMobileV2 /> : <StandardMyResponses />;
 * }
 * ```
 */
export function useMobileMyResponsesV2(options: Omit<UseFeatureFlagOptions, 'reCheckOnResize'> = {}) {
  return useFeatureFlag('MOBILE_MY_RESPONSES_V2', {
    ...options,
    reCheckOnResize: true, // Всегда отслеживаем resize для мобильного флага
    reCheckOnNavigation: true, // Также перепроверяем при навигации
  });
}

/**
 * Утилитарный хук для проверки нескольких фичефлагов одновременно
 * 
 * @param flagKeys - Массив ключей фичефлагов
 * @returns Объект с результатами проверки для каждого флага
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const flags = useMultipleFeatureFlags([
 *     'MOBILE_ORDERS_V2',
 *     'NEW_SEARCH_INTERFACE'
 *   ]);
 *   
 *   return (
 *     <div>
 *       {flags.MOBILE_ORDERS_V2?.isEnabled && <MobileFeature />}
 *       {flags.NEW_SEARCH_INTERFACE?.isEnabled && <NewSearch />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleFeatureFlags(
  flagKeys: FeatureFlagKey[],
  options: UseFeatureFlagOptions = {}
): Record<FeatureFlagKey, UseFeatureFlagResult> {
  const [results, setResults] = useState<Record<string, UseFeatureFlagResult>>({});

  useEffect(() => {
    const newResults: Record<string, UseFeatureFlagResult> = {};
    
    flagKeys.forEach(flagKey => {
      try {
        const enabled = isFeatureEnabled(flagKey);
        newResults[flagKey] = {
          isEnabled: enabled,
          isLoading: false,
          ...(options.enableDebug && { debugInfo: getFeatureFlagInfo(flagKey) })
        };
      } catch (error) {
        console.error(`Error checking feature flag "${flagKey}":`, error);
        newResults[flagKey] = {
          isEnabled: false,
          isLoading: false
        };
      }
    });

    setResults(newResults);
  }, [flagKeys.join(','), options.enableDebug]);

  return results as Record<FeatureFlagKey, UseFeatureFlagResult>;
}

/**
 * Хук для принудительного обновления фичефлагов
 * Полезен при динамических изменениях или тестировании
 * 
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const refreshFlags = useRefreshFeatureFlags();
 *   
 *   return (
 *     <button onClick={refreshFlags}>
 *       Обновить фичефлаги
 *     </button>
 *   );
 * }
 * ```
 */
export function useRefreshFeatureFlags() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return refresh;
}