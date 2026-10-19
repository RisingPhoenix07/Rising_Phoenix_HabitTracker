"use client"

import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { Cinzel } from "next/font/google"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "800"],
})

export default function Header() {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800/80 bg-black/80 backdrop-blur-md relative z-50">
      {/* Mythical Title with Cinzel Font & Cyan Glow */}
      <h1 className={`${cinzel.className} text-xl font-bold tracking-wider text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]`}>
        Rising Phoenix
      </h1>

      {/* Direct Auth Controls */}
      <div className="flex items-center gap-4">
        {isLoaded && (
          isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-sm font-medium transition cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          )
        )}
      </div>
    </header>
  )
}
