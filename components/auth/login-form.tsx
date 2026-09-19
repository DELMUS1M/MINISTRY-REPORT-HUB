'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailRef.current?.value.trim() ?? '',
      password: passwordRef.current?.value ?? ''
    });
    setLoading(false);
    if (error) {
      setError('Incorrect email or password.');
      return;
    }
    const { data } = await supabase.auth.getUser();
    let destination = '/dashboard';
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile?.role === 'secretary') destination = '/secretary';
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="mb-3.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" ref={emailRef} type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <div className="mb-5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" ref={passwordRef} type="password" autoComplete="current-password" placeholder="Your password" required />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}
