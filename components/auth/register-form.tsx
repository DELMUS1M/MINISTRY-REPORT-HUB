'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/toaster';
import type { Category, Role } from '@/lib/types';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function resizeToDataUrl(file: File, size = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('resize failed'))), 'image/jpeg', 0.85);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [role, setRole] = useState<Role>('publisher');
  const [category, setCategory] = useState<Category>('publisher');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  function handleNameInput() {
    if (!usernameTouched && usernameRef.current && nameRef.current) {
      usernameRef.current.value = slugify(nameRef.current.value);
    }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const full_name = nameRef.current?.value.trim() ?? '';
    const username = slugify(usernameRef.current?.value ?? '');
    const email = emailRef.current?.value.trim() ?? '';
    const password = passwordRef.current?.value ?? '';

    if (!full_name || !username || !email || password.length < 6) {
      setError('Fill in your name, username, email and a password of at least 6 characters.');
      return;
    }
    if (role === 'secretary' && !codeRef.current?.value.trim()) {
      setError('Enter the secretary access code, or switch to a Publisher account.');
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
      if (existing) {
        setError('That username is taken — please choose another.');
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, username, category: role === 'secretary' ? null : category } }
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) {
        showToast('Check your email to confirm your account, then log in.');
        router.push('/login');
        return;
      }

      if (photoFile) {
        const blob = await resizeToDataUrl(photoFile);
        const path = `${userId}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
        if (!uploadError) {
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
          await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', userId);
        }
      }

      if (role === 'secretary') {
        const { error: fnError } = await supabase.functions.invoke('assign-role', {
          body: { code: codeRef.current?.value.trim() }
        });
        if (fnError) {
          setError('Account created, but the secretary code was incorrect. You were registered as a Publisher instead.');
        }
      }

      showToast('Account created — welcome!');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3.5">
        {photoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="" className="h-14 w-14 rounded-full border object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full border-2 border-dashed border-ink-500/30 bg-sky-50 dark:bg-white/5" />
        )}
        <div>
          <input type="file" accept="image/*" onChange={handlePhoto} className="text-xs" />
          <p className="mt-1 text-[11px] text-ink-500">Optional profile picture</p>
        </div>
      </div>

      <div className="mb-3.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" ref={nameRef} onInput={handleNameInput} placeholder="e.g. John Mwangi" required />
      </div>

      <div className="mb-3.5">
        <Label htmlFor="username">Username (public handle)</Label>
        <Input
          id="username"
          ref={usernameRef}
          onInput={() => setUsernameTouched(true)}
          placeholder="e.g. john-mwangi"
          required
        />
      </div>

      <div className="mb-3.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" ref={emailRef} type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>

      <div className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input id="password" ref={passwordRef} type="password" autoComplete="new-password" placeholder="At least 6 characters" required />
      </div>

      <div className="mb-4">
        <Label>Account type</Label>
        <div className="flex gap-2">
          {(['publisher', 'secretary'] as Role[]).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 rounded-[10px] border-[1.5px] p-2.5 text-[12.5px] font-semibold transition ${
                role === r
                  ? 'border-blue-500 bg-sky-50 text-blue-700 dark:bg-white/10 dark:text-sky-100'
                  : 'border-ink-500/15 bg-sky-50/40 text-ink-700 dark:bg-white/5 dark:text-sky-100/70'
              }`}
            >
              {r === 'publisher' ? 'Publisher' : 'Secretary / Elder'}
            </button>
          ))}
        </div>
      </div>

      {role === 'publisher' ? (
        <div className="mb-5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            <option value="publisher">Publisher</option>
            <option value="regular_pioneer">Regular Pioneer</option>
            <option value="auxiliary_pioneer">Auxiliary Pioneer</option>
            <option value="special_pioneer">Special Pioneer</option>
          </Select>
        </div>
      ) : (
        <div className="mb-5">
          <Label htmlFor="code">Secretary access code</Label>
          <Input id="code" ref={codeRef} placeholder="Provided by the body of elders" />
          <p className="mt-1.5 text-[11.5px] text-ink-500">Ask the current secretary/body of elders for this code.</p>
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
