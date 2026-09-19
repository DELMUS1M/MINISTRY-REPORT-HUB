import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-semibold text-ink-700 dark:text-sky-100/80', className)}
      {...props}
    />
  );
}
