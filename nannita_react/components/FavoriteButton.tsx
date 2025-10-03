import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { authClient } from '@/lib/auth-client';

interface FavoriteButtonProps {
  nannyId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ 
  nannyId, 
  size = 'sm', 
  variant = 'ghost',
  className,
  showText = false
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Используем правильную проверку JWT аутентификации
  const hasValidJWT = authClient.hasValidToken();
  const isReallyAuthenticated = !!user && hasValidJWT;
  
  // Проверяем статус избранного только для пользователей с валидным JWT
  const { data: favoriteStatus } = useQuery<{isFavorite: boolean}>({
    queryKey: ['/api/favorites', nannyId, 'status'],
    enabled: isReallyAuthenticated,
  });
  
  const isFavorite = favoriteStatus?.isFavorite || false;
  
  // Мутация для переключения избранного
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => 
      isFavorite 
        ? apiRequest('DELETE', `/api/favorites/${nannyId}`)
        : apiRequest('POST', `/api/favorites/${nannyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', nannyId, 'status'] });
      toast({
        title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
        description: isFavorite 
          ? "Няня удалена из вашего списка избранного" 
          : "Няня добавлена в избранное"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive"
      });
    }
  });

  // Обработчик клика
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Если не авторизован или нет валидного JWT - редирект на авторизацию
    if (!isReallyAuthenticated) {
      setLocation('/auth-sms?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    // Если авторизован с валидным JWT - переключаем избранное
    toggleFavoriteMutation.mutate();
  };
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  return (
    <Button
      variant={variant}
      size={showText ? "default" : "icon"}
      onClick={handleClick}
      disabled={isReallyAuthenticated && toggleFavoriteMutation.isPending}
      className={cn(
        !showText && sizeClasses[size],
        "transition-all",
        className
      )}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          // Для авторизованных с валидным JWT показываем статус, для остальных - серое сердце
          isReallyAuthenticated && isFavorite 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-400',
          'transition-colors',
          showText && 'mr-2'
        )} 
      />
      {showText && (
        <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
      )}
    </Button>
  );
}