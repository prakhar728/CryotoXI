import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoXI - Web3 Fantasy Cricket",
  description: "Play fantasy cricket and earn crypto rewards",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="min-h-screen bg-gradient-to-b from-background to-background/90 bg-fixed">
            <Navbar />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'