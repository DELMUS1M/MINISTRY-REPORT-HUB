import { createClient } from '@/lib/supabase/server';
import { CATEGORY_LABELS, CONGREGATION_NAME } from '@/lib/constants';
import type { Profile } from '@/lib/types';
import { SignOutButton } from '@/components/sign-out-button';

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data as Profile | null;
  }

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-blue-700 to-blue-500 px-5 pb-11 pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[15%] -top-[40%] h-[180%] w-[70%] rotate-[18deg] bg-gradient-to-r from-white/10 to-transparent"
      />
      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-xl shadow-lg">
            📖
          </div>
          <div className="text-white">
            <div className="font-head text-lg font-extrabold leading-tight">Ministry Report Hub</div>
            <div className="text-xs text-sky-100/80">{CONGREGATION_NAME}</div>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-3.5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={`${profile.full_name}'s profile photo`}
                className="h-8 w-8 rounded-full border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-[#3a2a00]">
                {profile.full_name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="leading-tight text-white">
              <div className="text-[13px] font-semibold">{profile.full_name}</div>
              <div className="text-[11px] text-sky-100/80">
                {profile.role === 'secretary' ? 'Secretary' : CATEGORY_LABELS[profile.category ?? 'publisher']}
              </div>
            </div>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
