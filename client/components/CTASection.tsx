"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

export default function CTASection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        throw new Error()
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="py-12 md:py-24 bg-gradient-to-t from-purple-900/20 to-cyan-900/20 relative" id="waitlist">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ready to Play and Earn?
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Join thousands of players already earning crypto rewards through fantasy cricket.
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl mx-auto mt-6 flex flex-col md:flex-row items-center gap-4 bg-card/40 backdrop-blur-md border border-muted/30 rounded-2xl p-4 shadow-lg"
          >
            <Input
              type="email"
              required
              placeholder="Enter your email to join the waitlist"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background border border-muted placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {status === "loading" ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
              <CheckCircle className="h-4 w-4" /> You're on the list!
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <XCircle className="h-4 w-4" /> Something went wrong. Try again.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
