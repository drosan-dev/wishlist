import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://drosan-dev.github.io/wishlist/'),
  title: 'Вишлист Антона — подарки с личным смыслом',
  description: 'Не инструкция, а источник вдохновения для подарков, выбранных с душой.',
  openGraph: {
    title: 'Подарки — это немного магия',
    description: 'Вишлист Антона: идеи для подарков, выбранных с душой.',
    type: 'website',
    url: 'https://drosan-dev.github.io/wishlist/',
    images: [{ url: 'https://drosan-dev.github.io/wishlist/og.png', width: 1792, height: 938, alt: 'Подарки — это немного магия' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Подарки — это немного магия',
    description: 'Вишлист Антона: идеи для подарков, выбранных с душой.',
    images: ['https://drosan-dev.github.io/wishlist/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
