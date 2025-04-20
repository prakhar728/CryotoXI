import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Trophy, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Fantasy Cricket Meets Web3
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Build your dream team, track live scores, and earn crypto rewards in a transparent, decentralized
                platform.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet & Start Playing
              </Button>
              <Button size="lg" variant="outline">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/5"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-24 relative">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Four simple steps to start earning crypto rewards through fantasy cricket
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {howItWorks.map((step, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border-muted/30 overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                    <step.icon className="h-8 w-8 text-primary" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols Used Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-background/50 to-background relative">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Protocols Used
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Built on cutting-edge Web3 technology for security, transparency, and fairness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protocols.map((protocol, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border-muted/30">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      <protocol.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{protocol.name}</h3>
                      <p className="text-sm text-muted-foreground">{protocol.shortDesc}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{protocol.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 relative">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Experience fantasy cricket like never before with our Web3-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border-muted/30">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-gradient-to-t from-purple-900/20 to-cyan-900/20 relative">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Ready to Play and Earn?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join thousands of players already earning crypto rewards through fantasy cricket
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet & Start Playing
              </Button>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Browse Matches <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-bold text-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text">
              CryptoXI
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} CryptoXI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const howItWorks = [
  {
    icon: Trophy,
    title: "Select Match",
    description: "Choose from ongoing and upcoming cricket matches across different leagues and tournaments.",
  },
  {
    icon: Shield,
    title: "Build Team",
    description: "Select your dream team of 11 players within the budget and designate a captain and vice-captain.",
  },
  {
    icon: CheckCircle,
    title: "Track Scores",
    description: "Watch your players earn points in real-time as the match progresses.",
  },
  {
    icon: Wallet,
    title: "Win Rewards",
    description: "Earn FLR tokens based on your team's performance and leaderboard position.",
  },
]

const protocols = [
  {
    icon: Shield,
    name: "Flare Decentralized Contracts (FDC)",
    shortDesc: "Smart Contract Platform",
    description: "Secure, transparent smart contracts that handle team creation, scoring, and reward distribution.",
  },
  {
    icon: CheckCircle,
    name: "Random Number Generator (RNG)",
    shortDesc: "Verifiable Randomness",
    description: "Ensures fair contest creation and transparent team selection verification.",
  },
  {
    icon: Trophy,
    name: "Flare Time Series Oracle (FTSO)",
    shortDesc: "Data Verification",
    description: "Provides accurate, tamper-proof cricket data and player statistics for fair scoring.",
  },
]

const features = [
  {
    title: "Real-Time Data",
    description: "Get live updates on player performance and fantasy points as the match progresses.",
  },
  {
    title: "Crypto Rewards",
    description: "Earn FLR tokens based on your team's performance and leaderboard position.",
  },
  {
    title: "Transparent Scoring",
    description: "All scoring is handled by smart contracts with full transparency and verification.",
  },
  {
    title: "Low Entry Fees",
    description: "Join contests with minimal entry fees and maximize your potential rewards.",
  },
  {
    title: "Global Competitions",
    description: "Compete with fantasy cricket enthusiasts from around the world.",
  },
  {
    title: "Mobile Responsive",
    description: "Enjoy the full experience on any device, from desktop to mobile.",
  },
]
