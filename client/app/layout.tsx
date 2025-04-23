import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoXI - Web3 Fantasy Cricket",
  description: "Play fantasy cricket and earn crypto rewards",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get('cookie')


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ContextProvider cookies={cookies}>
            <div className="min-h-screen bg-gradient-to-b from-background to-background/90 bg-fixed">
              <Navbar />
              <main>{children}</main>
            </div>
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import ContextProvider from "@/context";import { headers } from "next/headers";

