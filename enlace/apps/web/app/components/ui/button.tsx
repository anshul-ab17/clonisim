import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        ghost: "text-gray-400 hover:text-white hover:bg-bg-input",
        outline: "border border-border-subtle text-gray-300 hover:bg-bg-input hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-700",
        secondary: "bg-black text-gray-200 hover:bg-[#111111]",
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
