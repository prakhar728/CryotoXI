"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const matchId = params.id
  const match = getMatchById(matchId)
  const [hasTeam, setHasTeam] = useState(match?.hasTeam || false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [captain, setCaptain] = useState<string | null>(null)
  const [viceCaptain, setViceCaptain] = useState<string | null>(null)
  const [budget, setBudget] = useState(100)
  const [activeTab, setActiveTab] = useState("all")

  const handlePlayerSelection = (playerId: string, cost: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId))
      setBudget(budget + cost)
      if (captain === playerId) setCaptain(null)
      if (viceCaptain === playerId) setViceCaptain(null)
    } else {
      if (selectedPlayers.length >= 11) return
      if (budget < cost) return
      setSelectedPlayers([...selectedPlayers, playerId])
      setBudget(budget - cost)
    }
  }

  const setCaptainRole = (playerId: string) => {
    if (captain === playerId) {
      setCaptain(null)
    } else {
      setCaptain(playerId)
      if (viceCaptain === playerId) setViceCaptain(null)
    }
  }

  const setViceCaptainRole = (playerId: string) => {
    if (viceCaptain === playerId) {
      setViceCaptain(null)
    } else {
      setViceCaptain(playerId)
      if (captain === playerId) setCaptain(null)
    }
  }

  const submitTeam = () => {
    if (selectedPlayers.length !== 11) return
    if (!captain || !viceCaptain) return
    setHasTeam(true)
  }

  if (!match) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold">Match not found</h1>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {match.teamA} vs {match.teamB}
          </h1>
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
            {match.type}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{match.status === "live" ? "LIVE" : match.date + " • " + match.time}</span>
          </div>
          <div>Entry Fee: {match.entryFee} FLR</div>
          <div>Prize Pool: {match.prizePool} FLR</div>
        </div>

        {hasTeam ? (
          <TeamView match={match} selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Players</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Selected:</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {selectedPlayers.length}/11
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Select 11 players within the budget and choose a captain and vice-captain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="bat">BAT</TabsTrigger>
                      <TabsTrigger value="bowl">BOWL</TabsTrigger>
                      <TabsTrigger value="ar">AR</TabsTrigger>
                      <TabsTrigger value="wk">WK</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((player) => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            isSelected={selectedPlayers.includes(player.id)}
                            isCaptain={captain === player.id}
                            isViceCaptain={viceCaptain === player.id}
                            onSelect={() => handlePlayerSelection(player.id, player.cost)}
                            onCaptainSelect={() => setCaptainRole(player.id)}
                            onViceCaptainSelect={() => setViceCaptainRole(player.id)}
                            disabled={
                              !selectedPlayers.includes(player.id) &&
                              (selectedPlayers.length >= 11 || budget < player.cost)
                            }
                          />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="bat" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players
                          .filter((player) => player.role === "BAT")
                          .map((player) => (
                            <PlayerCard
                              key={player.id}
                              player={player}
                              isSelected={selectedPlayers.includes(player.id)}
                              isCaptain={captain === player.id}
                              isViceCaptain={viceCaptain === player.id}
                              onSelect={() => handlePlayerSelection(player.id, player.cost)}
                              onCaptainSelect={() => setCaptainRole(player.id)}
                              onViceCaptainSelect={() => setViceCaptainRole(player.id)}
                              disabled={
                                !selectedPlayers.includes(player.id) &&
                                (selectedPlayers.length >= 11 || budget < player.cost)
                              }
                            />
                          ))}
                      </div>
                    </TabsContent>

                    {/* Similar TabsContent for other roles (bowl, ar, wk) */}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-card/30 backdrop-blur-sm border-muted/30 sticky top-20">
                <CardHeader>
                  <CardTitle>Team Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Budget Remaining</span>
                      <span className="font-bold">{budget.toFixed(1)} FLR</span>
                    </div>
                    <Progress value={(budget / 100) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">BAT</div>
                      <div className="font-bold">
                        {selectedPlayers.filter((id) => players.find((p) => p.id === id)?.role === "BAT").length}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">BOWL</div>
                      <div className="font-bold">
                        {selectedPlayers.filter((id) => players.find((p) => p.id === id)?.role === "BOWL").length}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">AR</div>
                      <div className="font-bold">
                        {selectedPlayers.filter((id) => players.find((p) => p.id === id)?.role === "AR").length}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">WK</div>
                      <div className="font-bold">
                        {selectedPlayers.filter((id) => players.find((p) => p.id === id)?.role === "WK").length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>Captain</span>
                      <span className="ml-auto font-bold">
                        {captain ? players.find((p) => p.id === captain)?.name : "Not Selected"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-gray-400" />
                      <span>Vice Captain</span>
                      <span className="ml-auto font-bold">
                        {viceCaptain ? players.find((p) => p.id === viceCaptain)?.name : "Not Selected"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={submitTeam}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    disabled={selectedPlayers.length !== 11 || !captain || !viceCaptain}
                  >
                    Submit Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCard({
  player,
  isSelected,
  isCaptain,
  isViceCaptain,
  onSelect,
  onCaptainSelect,
  onViceCaptainSelect,
  disabled,
}: {
  player: any
  isSelected: boolean
  isCaptain: boolean
  isViceCaptain: boolean
  onSelect: () => void
  onCaptainSelect: () => void
  onViceCaptainSelect: () => void
  disabled: boolean
}) {
  return (
    <Card
      className={`overflow-hidden transition-colors ${
        isSelected
          ? "bg-primary/10 border-primary/30"
          : disabled
            ? "bg-card/30 border-muted/30 opacity-50"
            : "bg-card/30 backdrop-blur-sm border-muted/30 hover:border-primary/20"
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${player.initials}`} />
            <AvatarFallback>{player.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold flex items-center gap-2">
              {player.name}
              {isCaptain && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  C
                </Badge>
              )}
              {isViceCaptain && (
                <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                  VC
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{player.team}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs py-0 h-5">
                {player.role}
              </Badge>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={isSelected ? "bg-primary/20 text-primary border-primary/30" : ""}>
          {player.cost} FLR
        </Badge>
      </div>
      <div className="bg-muted/30 p-3 grid grid-cols-3 text-center text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Points</div>
          <div className="font-medium">{player.points}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Form</div>
          <div className="font-medium">{player.form}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Selected</div>
          <div className="font-medium">{player.selected}%</div>
        </div>
      </div>
      {isSelected && (
        <div className="p-3 bg-card/50 grid grid-cols-3 gap-2">
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelect}
            className={isSelected ? "bg-primary/90 hover:bg-primary/80" : ""}
          >
            {isSelected ? "Remove" : "Select"}
          </Button>
          <Button
            variant={isCaptain ? "default" : "outline"}
            size="sm"
            onClick={onCaptainSelect}
            className={isCaptain ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            disabled={!isSelected}
          >
            Captain
          </Button>
          <Button
            variant={isViceCaptain ? "default" : "outline"}
            size="sm"
            onClick={onViceCaptainSelect}
            className={isViceCaptain ? "bg-gray-500 hover:bg-gray-600" : ""}
            disabled={!isSelected}
          >
            Vice
          </Button>
        </div>
      )}
      {!isSelected && (
        <div className="p-3 bg-card/50">
          <Button variant="outline" size="sm" onClick={onSelect} className="w-full" disabled={disabled}>
            Select Player
          </Button>
        </div>
      )}
    </Card>
  )
}

function TeamView({ match, selectedPlayers, captain, viceCaptain }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Team</CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                Team Submitted
              </Badge>
            </div>
            <CardDescription>
              Your team for {match.teamA} vs {match.teamB}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlayers.map((playerId: string) => {
                  const player = players.find((p) => p.id === playerId)
                  if (!player) return null
                  return (
                    <Card key={player.id} className="overflow-hidden bg-card/30 backdrop-blur-sm border-muted/30">
                      <div
                        className={`p-4 flex justify-between items-center ${
                          captain === player.id
                            ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20"
                            : viceCaptain === player.id
                              ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20"
                              : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${player.initials}`} />
                            <AvatarFallback>{player.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {player.name}
                              {captain === player.id && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                                >
                                  C
                                </Badge>
                              )}
                              {viceCaptain === player.id && (
                                <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  VC
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{player.team}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                {player.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold">{player.livePoints || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 grid grid-cols-3 text-center text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Runs</div>
                          <div className="font-medium">{player.stats?.runs || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Wickets</div>
                          <div className="font-medium">{player.stats?.wickets || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Catches</div>
                          <div className="font-medium">{player.stats?.catches || 0}</div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30 sticky top-20">
          <CardHeader>
            <CardTitle>Match Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Your Points</span>
                <span className="font-bold text-xl">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Current Rank</span>
                <span className="font-bold">#1,245 / 10,500</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Live Score</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{match.teamA}</AvatarFallback>
                  </Avatar>
                  <span>{match.teamA}</span>
                </div>
                <span className="font-bold">245/6</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{match.teamB}</AvatarFallback>
                  </Avatar>
                  <span>{match.teamB}</span>
                </div>
                <span className="font-bold">187/8</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">{match.teamA} needs 43 runs from 24 balls</div>
            </div>

            <Link href="/leaderboard">
              <Button className="w-full">View Leaderboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getMatchById(id: string) {
  const allMatches = [...ongoingMatches, ...upcomingMatches, ...completedMatches]
  return allMatches.find((match) => match.id === id)
}

const ongoingMatches = [
  {
    id: "1",
    teamA: "IND",
    teamB: "AUS",
    type: "T20",
    date: "Today",
    time: "Live",
    status: "live",
    entryFee: 5,
    prizePool: 1000,
    participants: "10.5K",
    hasTeam: true,
  },
  {
    id: "2",
    teamA: "ENG",
    teamB: "NZ",
    type: "ODI",
    date: "Today",
    time: "Live",
    status: "live",
    entryFee: 3,
    prizePool: 750,
    participants: "8.2K",
    hasTeam: false,
  },
]

const upcomingMatches = [
  {
    id: "3",
    teamA: "SA",
    teamB: "PAK",
    type: "Test",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "upcoming",
    entryFee: 2,
    prizePool: 500,
    participants: "5.7K",
    hasTeam: false,
  },
]

const completedMatches = [
  {
    id: "6",
    teamA: "IND",
    teamB: "PAK",
    type: "T20",
    date: "Jun 10, 2023",
    time: "Completed",
    status: "completed",
    entryFee: 5,
    prizePool: 1200,
    participants: "15.3K",
    hasTeam: true,
  },
]

const players = [
  {
    id: "p1",
    name: "Virat Kohli",
    initials: "VK",
    team: "IND",
    role: "BAT",
    points: 87,
    form: "↑",
    selected: 78,
    cost: 10.5,
    livePoints: 42,
    stats: { runs: 78, wickets: 0, catches: 1 },
  },
  {
    id: "p2",
    name: "Rohit Sharma",
    initials: "RS",
    team: "IND",
    role: "BAT",
    points: 82,
    form: "→",
    selected: 65,
    cost: 9.8,
    livePoints: 35,
    stats: { runs: 45, wickets: 0, catches: 0 },
  },
  {
    id: "p3",
    name: "Jasprit Bumrah",
    initials: "JB",
    team: "IND",
    role: "BOWL",
    points: 75,
    form: "↑",
    selected: 72,
    cost: 9.2,
    livePoints: 55,
    stats: { runs: 0, wickets: 3, catches: 1 },
  },
  {
    id: "p4",
    name: "Ravindra Jadeja",
    initials: "RJ",
    team: "IND",
    role: "AR",
    points: 70,
    form: "↑",
    selected: 58,
    cost: 8.5,
    livePoints: 30,
    stats: { runs: 24, wickets: 1, catches: 0 },
  },
  {
    id: "p5",
    name: "Rishabh Pant",
    initials: "RP",
    team: "IND",
    role: "WK",
    points: 68,
    form: "→",
    selected: 45,
    cost: 8.0,
    livePoints: 25,
    stats: { runs: 32, wickets: 0, catches: 2 },
  },
  {
    id: "p6",
    name: "Steve Smith",
    initials: "SS",
    team: "AUS",
    role: "BAT",
    points: 85,
    form: "↑",
    selected: 70,
    cost: 10.2,
    livePoints: 15,
    stats: { runs: 22, wickets: 0, catches: 0 },
  },
  {
    id: "p7",
    name: "Pat Cummins",
    initials: "PC",
    team: "AUS",
    role: "BOWL",
    points: 78,
    form: "→",
    selected: 62,
    cost: 9.5,
    livePoints: 45,
    stats: { runs: 0, wickets: 2, catches: 1 },
  },
  {
    id: "p8",
    name: "Glenn Maxwell",
    initials: "GM",
    team: "AUS",
    role: "AR",
    points: 72,
    form: "↓",
    selected: 48,
    cost: 8.8,
    livePoints: 0,
    stats: { runs: 0, wickets: 0, catches: 0 },
  },
]
