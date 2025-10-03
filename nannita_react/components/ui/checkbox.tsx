import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md border border-gray-300/80 bg-white/90 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-indigo-500 data-[state=checked]:to-indigo-600 data-[state=checked]:border-indigo-500 data-[state=checked]:text-white data-[state=checked]:shadow-sm data-[state=checked]:shadow-indigo-200/50 select-none",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current transition-all duration-300 ease-out data-[state=checked]:scale-100 data-[state=unchecked]:scale-75 data-[state=checked]:opacity-100 data-[state=unchecked]:opacity-0 pointer-events-none select-none")}
    >
      <Check className="h-3.5 w-3.5 font-medium stroke-[2.5] pointer-events-none drop-shadow-sm" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
