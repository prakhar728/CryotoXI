"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Menu, Wallet } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false)

  const connectWallet = () => {
    setWalletConnected(true)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text">
              CryptoXI
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Matches
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">
              Leaderboard
            </Link>
            <Link href="/rewards" className="text-sm font-medium transition-colors hover:text-primary">
              Rewards
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {walletConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <span className="hidden sm:inline-block">0x7E3...F9c2</span>
                  <span className="sm:hidden">Wallet</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <div className="flex items-center justify-between w-full">
                    <span>Balance:</span>
                    <span className="font-bold">245.8 FLR</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>View Transactions</DropdownMenuItem>
                <DropdownMenuItem>Disconnect</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={connectWallet} className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline-block">Connect Wallet</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>

          {walletConnected && (
            <Avatar className="hidden md:flex h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">JD</AvatarFallback>
            </Avatar>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                  Matches
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">
                  Leaderboard
                </Link>
                <Link href="/rewards" className="text-sm font-medium transition-colors hover:text-primary">
                  Rewards
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
