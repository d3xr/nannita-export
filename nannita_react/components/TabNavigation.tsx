import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  countColor?: string;
}

interface TabNavigationProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
  variant?: 'default' | 'underline' | 'pills';
}

export default function TabNavigation({ 
  items, 
  activeTab, 
  onTabChange, 
  className = "",
  variant = 'underline'
}: TabNavigationProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'pills':
        return {
          container: "flex gap-1 bg-gray-100 p-1 rounded-lg",
          tab: "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
          active: "bg-white text-gray-900 shadow-sm",
          inactive: "text-gray-600 hover:text-gray-900 hover:bg-white/50"
        };
      case 'underline':
        return {
          container: "flex border-b border-gray-200",
          tab: "px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
          active: "text-blue-600 border-blue-600",
          inactive: "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
        };
      default:
        return {
          container: "flex gap-2",
          tab: "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          active: "bg-blue-50 text-blue-700 border border-blue-200",
          inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        };
    }
  };

  const styles = getVariantStyles();

  const getCountColor = (item: TabItem, isActive: boolean) => {
    if (item.countColor) return item.countColor;
    
    if (variant === 'underline') {
      return isActive 
        ? "bg-blue-100 text-blue-700" 
        : "bg-gray-100 text-gray-600";
    }
    
    return isActive 
      ? "bg-blue-200 text-blue-800" 
      : "bg-gray-200 text-gray-600";
  };

  return (
    <nav className={cn(styles.container, className)}>
      {items.map((item) => {
        const isActive = activeTab === item.key;
        
        return (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={cn(
              styles.tab,
              isActive ? styles.active : styles.inactive
            )}
            data-testid={`tab-${item.key}`}
          >
            <span className="flex items-center gap-2">
              {item.label}
              {item.count !== undefined && (
                <span 
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    getCountColor(item, isActive)
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}