import type { Category } from '@/lib/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  publisher: 'Publisher',
  regular_pioneer: 'Regular Pioneer',
  auxiliary_pioneer: 'Auxiliary Pioneer',
  special_pioneer: 'Special Pioneer'
};

/** 'yesno' categories report a single participation flag; 'hours'
 *  categories report hours + studies + an optional comment. */
export function categoryFieldType(category: Category): 'yesno' | 'hours' {
  return category === 'publisher' ? 'yesno' : 'hours';
}

export const CONGREGATION_NAME = process.env.NEXT_PUBLIC_CONGREGATION_NAME ?? 'Your Congregation';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}
