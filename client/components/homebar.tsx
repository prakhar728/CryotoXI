"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomeNavbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
          CryptoXI
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
            How It Works
          </a>
          <a href="#waitlist" className="text-sm text-muted-foreground hover:text-foreground transition">
            Waitlist
          </a>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Go to App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
