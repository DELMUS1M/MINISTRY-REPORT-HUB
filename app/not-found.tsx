import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <div className="mx-auto -mt-8 max-w-lg px-5 pb-24">
      <Card>
        <CardBody className="text-center">
          <div className="text-4xl">🧭</div>
          <h1 className="font-head mt-3 text-2xl font-extrabold text-navy-900 dark:text-white">
            We can&apos;t find that page
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            The link may be old, or the page may have moved. Head back to your dashboard and try again.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="primary">Back to home</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
