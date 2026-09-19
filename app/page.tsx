import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import type { Profile } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Ministry Report Hub lets every publisher and pioneer submit their monthly field service report online, while the secretary gets a live, exportable roll-up for the whole congregation.',
  alternates: { canonical: '/' }
};

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    redirect((profile as Profile)?.role === 'secretary' ? '/secretary' : '/dashboard');
  }

  return (
    <div className="mx-auto -mt-8 max-w-3xl px-5 pb-20">
      <Card className="relative">
        <CardBody className="text-center">
          <h1 className="font-head text-3xl font-extrabold text-navy-900 dark:text-white">
            One place for every field service report
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-ink-500">
            Publishers report a simple yes or no. Regular, auxiliary and special pioneers log hours and
            Bible studies. The secretary sees it all roll up automatically — no more chasing paper slips.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register"><Button variant="primary">Create an account</Button></Link>
            <Link href="/login"><Button variant="secondary">Log in</Button></Link>
          </div>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            <Feature icon="✅" title="Quick monthly reports" text="One form per category, locked after submitting." />
            <Feature icon="📊" title="Live congregation totals" text="Hours, studies and participation, always current." />
            <Feature icon="⬇️" title="Export anytime" text="Download a shareable report card, Excel, or PDF." />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-md border border-ink-500/10 bg-sky-50/60 p-4 dark:bg-white/5">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 font-head text-sm font-bold text-navy-900 dark:text-white">{title}</div>
      <div className="mt-1 text-[13px] text-ink-500">{text}</div>
    </div>
  );
}
