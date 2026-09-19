import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your Ministry Report Hub account as a publisher, pioneer, or congregation secretary.',
  alternates: { canonical: '/register' }
};

export default function RegisterPage() {
  return (
    <div className="mx-auto -mt-8 max-w-md px-5 pb-24">
      <Card>
        <CardBody>
          <h1 className="font-head mb-5 text-center text-xl font-bold text-navy-900 dark:text-white">Create your account</h1>
          <RegisterForm />
          <p className="mt-5 text-center text-sm text-ink-500">
            Already registered? <Link href="/login" className="font-semibold text-blue-500">Log in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
