import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'gold' | 'good' | 'bad' | 'muted';

const toneClasses: Record<Tone, string> = {
  blue: 'bg-sky-50 text-blue-700 dark:bg-white/10 dark:text-sky-100',
  gold: 'bg-[#FBF0D6] text-[#8A6414] dark:bg-gold-500/20 dark:text-gold-300',
  good: 'bg-[#E1F5EA] text-[#1C8A5C] dark:bg-emerald-500/15 dark:text-emerald-300',
  bad: 'bg-[#FBE7E4] text-[#C0392B] dark:bg-red-500/15 dark:text-red-300',
  muted: 'bg-sky-50 text-ink-500 dark:bg-white/5 dark:text-sky-100/60'
};

export function Badge({
  tone = 'blue',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-1 text-[11px] font-bold',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
