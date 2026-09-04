import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Janmashtami Dahi Handi 3D',
  description: 'Interactive 3D WebGL Janmashtami celebration and Dahi Handi pyramid experience powered by Three.js.',
  openGraph: {
    title: 'Janmashtami Dahi Handi 3D',
    description: 'Interactive 3D WebGL Janmashtami celebration and Dahi Handi pyramid experience powered by Three.js.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janmashtami Dahi Handi 3D',
    description: 'Interactive 3D WebGL Janmashtami celebration and Dahi Handi pyramid experience powered by Three.js.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
