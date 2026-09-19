import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { monthKeyFromDate } from '@/lib/constants';
import { PublisherDashboard } from '@/components/dashboard/publisher-dashboard';
import type { Profile, Report } from '@/lib/types';

export const metadata: Metadata = {
  title: 'My dashboard',
  robots: { index: false, follow: false }
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = profileData as Profile | null;
  if (!profile) redirect('/login');
  if (profile.role === 'secretary') redirect('/secretary');

  const monthKey = monthKeyFromDate(new Date());

  const [{ data: currentReportData }, { data: historyData }] = await Promise.all([
    supabase.from('reports').select('*').eq('user_id', user.id).eq('month_key', monthKey).maybeSingle(),
    supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('month_key', { ascending: false })
      .limit(12)
  ]);

  const currentReport = currentReportData as Report | null;
  const history = (historyData as Report[] | null) ?? [];

  return (
    <PublisherDashboard profile={profile} monthKey={monthKey} currentReport={currentReport} history={history} />
  );
}
