"use client"

import { UserButton, SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs"

export default function Header() {
  const { isLoaded } = useAuth()

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-background/50 backdrop-blur-md">
      <h1 className="text-xl font-bold tracking-wider text-amber-500">Rising Phoenix</h1>
      <div>
        {isLoaded && (
          <>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </>
        )}
      </div>
    </header>
  )
}
