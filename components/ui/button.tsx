import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-blue-700 to-navy-900 text-white shadow-[0_6px_16px_rgba(27,79,145,0.35)] hover:brightness-110',
  secondary:
    'border border-ink-500/20 bg-transparent text-ink-700 dark:text-sky-100 hover:bg-sky-50 dark:hover:bg-white/5',
  gold: 'bg-gradient-to-br from-gold-300 to-gold-500 text-[#3a2a00] hover:brightness-105',
  ghost: 'bg-transparent text-blue-700 dark:text-sky-100 hover:bg-sky-50 dark:hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
