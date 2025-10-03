import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authClient } from "./auth-client";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use JWT authenticated request from authClient
  const res = await authClient.authenticatedRequest(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // ИСПРАВЛЕНИЕ: Используем только первый элемент queryKey как URL
    // Остальные элементы (фильтры, объекты) игнорируем при формировании URL
    const url = queryKey[0] as string;
    
    // Use JWT authenticated request from authClient
    const res = await authClient.authenticatedRequest(url, {
      method: "GET",
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Включаем обновление при фокусе
      staleTime: 30000, // 30 секунд - данные считаются свежими
      retry: false,
    },
    mutations: {
      retry: false,
      onSuccess: () => {
        // Глобальная инвалидация кеша заказов после любой мутации
        console.log('🔄 Global cache invalidation after mutation...');
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        queryClient.invalidateQueries({ queryKey: ['/api/orders/available'] });
        queryClient.invalidateQueries({ queryKey: ['/api/orders/favorites'] });
      }
    },
  },
});
