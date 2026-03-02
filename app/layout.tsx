import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ecsendia Autos — Quality Used Cars in Nigeria',
    template: '%s | Ecsendia Autos',
  },
  description:
    'Browse our quality selection of used cars. Find your perfect vehicle with Ecsendia Autos — trusted auto dealer in Nigeria.',
  keywords: ['used cars Nigeria', 'buy car Lagos', 'car dealer Nigeria', 'Ecsendia Autos'],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Ecsendia Autos',
    title: 'Ecsendia Autos — Quality Used Cars in Nigeria',
    description: 'Browse our quality selection of used cars in Nigeria.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white text-gray-900">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
