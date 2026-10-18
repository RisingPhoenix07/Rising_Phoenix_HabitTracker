import Header from "@/components/Header"
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
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
