"use client"

import { useState } from "react"
import { Bell, ChevronDown, Moon, Sun, Wallet } from "lucide-react"
import Image from "next/image"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"

export default function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [selectedTab, setSelectedTab] = useState("my-team")
  const [walletConnected, setWalletConnected] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const connectWallet = () => {
    setWalletConnected(true)
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Navigation Bar */}
      <nav
        className={`flex items-center justify-between p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-2">
          <div className="font-bold text-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text">
            CryptoXI
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-4 flex items-center gap-2">
                IND vs AUS <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>IND vs AUS</DropdownMenuItem>
              <DropdownMenuItem>ENG vs NZ</DropdownMenuItem>
              <DropdownMenuItem>SA vs PAK</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Toggle aria-label="Toggle theme" pressed={theme === "dark"} onPressedChange={toggleTheme}>
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Toggle>

          <Button
            variant={walletConnected ? "outline" : "default"}
            size="sm"
            onClick={connectWallet}
            className={`flex items-center gap-2 ${walletConnected && theme === "dark" ? "bg-gray-700" : ""}`}
          >
            <Wallet className="h-4 w-4" />
            {walletConnected ? "0x7E3...F9c2" : "Connect Wallet"}
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fantasy Points and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fantasy Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                  347.5
                </div>
                <p className="text-xs text-muted-foreground mt-1">+24.5 from last match</p>
              </CardContent>
            </Card>

            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold">2.4 ETH</div>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    10.5 ETH Total
                  </Badge>
                </div>
                <Progress value={23} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="my-team" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="my-team">My Team</TabsTrigger>
              <TabsTrigger value="leaderboard">Live Leaderboard</TabsTrigger>
              <TabsTrigger value="match-info">Match Info</TabsTrigger>
            </TabsList>

            <TabsContent value="my-team" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} theme={theme} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardPanel theme={theme} />
            </TabsContent>

            <TabsContent value="match-info">
              <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <CardTitle>Match Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          width={40}
                          height={40}
                          alt="India"
                          className="rounded-full"
                        />
                        <span className="font-medium">India</span>
                      </div>
                      <div className="text-xl font-bold">245/6</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          width={40}
                          height={40}
                          alt="Australia"
                          className="rounded-full"
                        />
                        <span className="font-medium">Australia</span>
                      </div>
                      <div className="text-xl font-bold">187/8</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">India needs 43 runs from 24 balls</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Score Card */}
          <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : ""} overflow-hidden`}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4">
              <h3 className="font-bold text-white">LIVE SCORE</h3>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">IND</span>
                </div>
                <div className="text-xl font-bold text-white">245/6</div>
              </div>
              <div className="text-xs text-white/80 mt-1">Overs: 42.3/50</div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>VK</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">V. Kohli</span>
                  </div>
                  <div className="text-sm font-bold">78(56)</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>HP</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">H. Pandya</span>
                  </div>
                  <div className="text-sm font-bold">34(28)</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>PC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">P. Cummins</span>
                  </div>
                  <div className="text-sm font-bold">3/42</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Panel (only on mobile) */}
          <div className="lg:hidden">
            <LeaderboardPanel theme={theme} />
          </div>

          {/* Leaderboard Panel (only on desktop) */}
          <div className="hidden lg:block">
            <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>{performer.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{performer.name}</div>
                          <div className="text-xs text-muted-foreground">{performer.role}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold">{performer.points} pts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Player Card Component
function PlayerCard({ player, theme }: { player: any; theme: string }) {
  return (
    <Card className={`overflow-hidden ${theme === "dark" ? "bg-gray-800 border-gray-700" : ""}`}>
      <div
        className={`p-3 flex justify-between items-center ${player.selected ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-gray-500 to-gray-600"}`}
      >
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
            <AvatarFallback>{player.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-white">{player.name}</div>
            <div className="text-xs text-white/80">
              {player.team} • {player.role}
            </div>
          </div>
        </div>
        <Badge
          variant={player.selected ? "outline" : "secondary"}
          className={player.selected ? "border-white/20 text-white" : ""}
        >
          {player.cost} ETH
        </Badge>
      </div>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Points</div>
            <div className="font-bold">{player.points}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Form</div>
            <div className="font-bold">{player.form}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Selected</div>
            <div className="font-bold">{player.selectionPercentage}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Leaderboard Panel Component
function LeaderboardPanel({ theme }: { theme: string }) {
  return (
    <Card className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
      <CardHeader>
        <CardTitle>Live Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback>{entry.initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{entry.username}</div>
              </div>
              <div className="text-sm font-bold">{entry.points} pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Sample Data
const players = [
  {
    id: 1,
    name: "Virat Kohli",
    initials: "VK",
    team: "IND",
    role: "Batter",
    points: 87,
    form: "↑",
    selectionPercentage: 78,
    cost: 3.2,
    selected: true,
  },
  {
    id: 2,
    name: "Jasprit Bumrah",
    initials: "JB",
    team: "IND",
    role: "Bowler",
    points: 65,
    form: "→",
    selectionPercentage: 62,
    cost: 2.8,
    selected: true,
  },
  {
    id: 3,
    name: "Steve Smith",
    initials: "SS",
    team: "AUS",
    role: "Batter",
    points: 72,
    form: "↑",
    selectionPercentage: 54,
    cost: 2.5,
    selected: false,
  },
  {
    id: 4,
    name: "Pat Cummins",
    initials: "PC",
    team: "AUS",
    role: "Bowler",
    points: 58,
    form: "↓",
    selectionPercentage: 45,
    cost: 2.2,
    selected: false,
  },
]

const leaderboard = [
  { username: "CryptoKing", initials: "CK", points: 423 },
  { username: "BlockchainBaller", initials: "BB", points: 412 },
  { username: "TokenTiger", initials: "TT", points: 398 },
  { username: "NFTNinja", initials: "NN", points: 387 },
  { username: "MetaMaster", initials: "MM", points: 376 },
  { username: "EtherExpert", initials: "EE", points: 365 },
  { username: "SatoshiSlayer", initials: "SS", points: 354 },
]

const topPerformers = [
  { name: "Virat Kohli", initials: "VK", role: "Batter", points: 87 },
  { name: "Jasprit Bumrah", initials: "JB", role: "Bowler", points: 65 },
  { name: "Rohit Sharma", initials: "RS", role: "Batter", points: 62 },
  { name: "Pat Cummins", initials: "PC", role: "Bowler", points: 58 },
]
