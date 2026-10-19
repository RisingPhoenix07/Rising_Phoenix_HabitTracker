import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-['Comic_Sans_MS',_'Comic_Sans',_cursive]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
