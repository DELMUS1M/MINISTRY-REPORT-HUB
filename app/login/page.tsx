import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Ministry Report Hub to submit your monthly field service report.',
  alternates: { canonical: '/login' }
};

export default function LoginPage() {
  return (
    <div className="mx-auto -mt-8 max-w-md px-5 pb-24">
      <Card>
        <CardBody>
          <h1 className="font-head mb-5 text-center text-xl font-bold text-navy-900 dark:text-white">Log in</h1>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-ink-500">
            New here? <Link href="/register" className="font-semibold text-blue-500">Create an account</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
