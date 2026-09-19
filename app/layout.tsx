import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { CONGREGATION_NAME } from '@/lib/constants';
import { SiteHeader } from '@/components/site-header';
import { ToastProvider } from '@/components/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ministry-report-hub.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ministry Report Hub',
    template: '%s · Ministry Report Hub'
  },
  description:
    'Submit and track monthly field ministry reports for publishers and pioneers, with a live roll-up dashboard for the congregation secretary.',
  applicationName: 'Ministry Report Hub',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico']
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Ministry Report Hub',
    description: 'Monthly field ministry reports for publishers and pioneers, compiled automatically.',
    siteName: 'Ministry Report Hub',
    images: ['/og-image.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ministry Report Hub',
    description: 'Monthly field ministry reports for publishers and pioneers, compiled automatically.',
    images: ['/og-image.png']
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F2A52' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1526' }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-body min-h-screen">
        <ToastProvider>
          <SiteHeader />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
