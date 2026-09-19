import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-[10px] border border-ink-500/20 bg-sky-50/60 dark:bg-white/5 px-3 py-2.5 text-sm text-ink-900 dark:text-sky-50 outline-none transition',
        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
