'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full border border-white/35 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15"
    >
      Log out
    </button>
  );
}
