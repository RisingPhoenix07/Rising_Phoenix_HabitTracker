import { ClerkProvider } from '@clerk/nextjs';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={spaceGrotesk.className}>
        <body className="bg-slate-950 text-slate-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
