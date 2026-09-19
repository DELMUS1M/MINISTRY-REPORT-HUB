import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { monthKeyFromDate } from '@/lib/constants';
import { SecretaryDashboard } from '@/components/secretary/secretary-dashboard';
import type { Profile } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Secretary dashboard',
  robots: { index: false, follow: false }
};

export default async function SecretaryPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = profileData as Profile | null;
  if (!profile || profile.role !== 'secretary') redirect('/dashboard');

  return <SecretaryDashboard monthKey={monthKeyFromDate(new Date())} />;
}
