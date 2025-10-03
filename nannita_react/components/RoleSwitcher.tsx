import { useState } from 'react';
import { useRole, type MobileRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { User, UserCheck, Users, ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RoleSwitcherProps {
  variant?: 'segmented' | 'sheet' | 'compact';
  onRoleChange?: () => void;
  className?: string;
}

const ROLE_CONFIG = {
  client: {
    label: 'Клиент',
    icon: Users,
    description: 'Поиск и заказ услуг няни',
  },
  pro: {
    label: 'Специалист',
    icon: UserCheck,
    description: 'Предоставление услуг няни',
  },
} as const;

export default function RoleSwitcher({ 
  variant = 'segmented', 
  onRoleChange,
  className 
}: RoleSwitcherProps) {
  const { currentRole, availableRoles, switchToRole, hasMultipleRoles } = useRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Не показываем, если нет множественных ролей
  if (!hasMultipleRoles) return null;

  const handleRoleSwitch = async (role: MobileRole) => {
    if (role === currentRole || isLoading) return;
    
    setIsLoading(true);
    try {
      await switchToRole(role);
      
      toast({
        title: "Роль изменена",
        description: `Вы переключились на роль ${ROLE_CONFIG[role].label}`,
      });
      
      onRoleChange?.();
    } catch (error) {
      console.error('Failed to switch role:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось переключить роль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const otherRole = availableRoles.find(r => r !== currentRole);
          if (otherRole) handleRoleSwitch(otherRole);
        }}
        disabled={isLoading}
        className={cn("h-8 px-3", className)}
        data-testid="role-switcher-compact"
      >
        <ArrowUpDown className="h-3 w-3 mr-1" />
        {ROLE_CONFIG[currentRole].label}
      </Button>
    );
  }

  if (variant === 'sheet') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Переключить роль
        </div>
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          const isActive = role === currentRole;
          
          return (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                "border border-gray-200 dark:border-gray-700",
                isActive
                  ? "bg-nannita-orange text-white border-nannita-orange"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              data-testid={`role-option-${role}`}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive
                    ? "bg-white/20"
                    : "bg-gray-100 dark:bg-gray-700"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className={cn(
                    "text-sm",
                    isActive
                      ? "text-white/80"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {config.description}
                  </div>
                </div>
              </div>
              {isActive && (
                <Check className="h-5 w-5" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Segmented control (default)
  return (
    <div className={cn(
      "inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1",
      className
    )}>
      {availableRoles.map((role) => {
        const config = ROLE_CONFIG[role];
        const Icon = config.icon;
        const isActive = role === currentRole;
        
        return (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm relative",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isActive 
                ? "bg-white dark:bg-gray-700 text-nannita-orange shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
            data-testid={`role-tab-${role}`}
          >
            <Icon className="h-4 w-4" />
            {config.label}
            {isLoading && isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-nannita-orange border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}