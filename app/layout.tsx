import { ClerkProvider } from '@clerk/nextjs';
import { Space_Grotesk } from 'next/font/google';
import SyncManager from "@/components/SyncManager";
import Header from "@/components/Header";
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceGrotesk.variable} ${spaceGrotesk.className}`}>
        <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
          <SyncManager />
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
