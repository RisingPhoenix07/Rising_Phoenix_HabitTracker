import Header from "@/components/Header"
import SyncManager from "@/components/SyncManager"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-black text-white antialiased">
          <SyncManager />
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}