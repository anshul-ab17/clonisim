import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-bg-base border border-border-subtle rounded-lg px-4 py-2.5 text-white text-sm outline-none placeholder-gray-500 focus:border-primary transition-colors",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
