import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSiteUrl, generateWebSiteJsonLd, generatePersonJsonLd } from '@/lib/seo';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Anuj Yadav — Full-Stack Engineer & Architect',
    template: '%s | Anuj Yadav',
  },
  description:
    'Full-Stack Developer, Systems Architect & Open Source Contributor. Explore portfolio projects, technical writings, and research.',
  keywords: [
    'Anuj Yadav',
    'Full-Stack Developer',
    'Systems Architect',
    'Software Engineer',
    'Next.js',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Distributed Systems',
  ],
  authors: [{ name: 'Anuj Yadav', url: siteUrl }],
  creator: 'Anuj Yadav',
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': [{ url: `${siteUrl}/feed.xml`, title: 'Anuj Yadav RSS Feed' }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Anuj Yadav Portfolio',
    title: 'Anuj Yadav — Full-Stack Engineer & Architect',
    description:
      'Full-Stack Developer, Systems Architect & Open Source Contributor. Explore portfolio projects, technical writings, and research.',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Anuj Yadav Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anuj Yadav — Full-Stack Engineer & Architect',
    description: 'Full-Stack Developer, Systems Architect & Open Source Contributor.',
    creator: '@anujyadav',
    images: [`${siteUrl}/twitter-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = generateWebSiteJsonLd();
  const personSchema = generatePersonJsonLd();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={websiteSchema} />
        <JsonLd data={personSchema} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
