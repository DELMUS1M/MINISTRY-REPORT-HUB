import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 dark:bg-white/5 px-3 py-2.5 text-sm text-ink-900 dark:text-sky-50 outline-none transition placeholder:text-ink-500/70',
        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
