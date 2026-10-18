"use client"

import { useState, useRef, useEffect } from "react"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export default function Header() {
  const { isSignedIn, isLoaded } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800/80 bg-black/60 backdrop-blur-md relative z-50">
      {/* Neon Glowing Blue Italic Cursive Title */}
      <h1 className="text-xl italic font-semibold tracking-wide text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] font-serif">
        Rising Phoenix
      </h1>

      {/* 3-Dot / Dash Dropdown Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-gray-900/80 border border-gray-700/60 text-gray-300 hover:text-white hover:border-cyan-500/50 transition flex items-center justify-center w-10 h-10 shadow-inner"
          aria-label="Menu"
        >
          {/* 3 horizontal dash / dot icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-950 border border-gray-800 shadow-2xl py-2 px-3 flex flex-col gap-2 backdrop-blur-xl">
            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-200">
                  <span className="text-xs text-gray-400 font-medium">Account</span>
                  <UserButton 
                    appearance={{
                      baseTheme: dark,
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full border border-cyan-500/30"
                      }
                    }} 
                  />
                </div>
              ) : (
                <div className="w-full">
                  <SignInButton mode="modal">
                    <button className="w-full text-center px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-sm font-medium transition">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </header>
  )
}
