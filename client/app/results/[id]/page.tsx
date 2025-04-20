"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Crown, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResultsPage({ params }: { params: { id: string } }) {
  const matchId = params.id
  const [loading, setLoading] = useState(true)
  const [resultsFinalized, setResultsFinalized] = useState(false)

  // Simulate loading and results calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      // Check if this match has finalized results
      setResultsFinalized(["6", "7"].includes(matchId))
    }, 2000)

    return () => clearTimeout(timer)
  }, [matchId])

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Match Results</h1>
        </div>

        {loading ? (
          <LoadingResults />
        ) : resultsFinalized ? (
          <FinalizedResults matchId={matchId} />
        ) : (
          <CalculatingResults />
        )}
      </div>
    </div>
  )
}

function LoadingResults() {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
      <CardHeader>
        <CardTitle>Loading Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CalculatingResults() {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Calculating Results...</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <p>The match has ended and we're calculating the final results and rewards.</p>
          <p className="text-muted-foreground">
            This usually takes a few minutes. Check back soon or we'll notify you when the results are ready.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
        </div>
      </CardContent>
    </Card>
  )
}

function FinalizedResults({ matchId }: { matchId: string }) {
  const userRank = 245
  const totalParticipants = 15300
  const rewardsEarned = 12.5

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-md ${
                    entry.isUser ? "bg-primary/10 border border-primary/30" : index < 3 ? "bg-muted/50" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-muted"
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${entry.initials}`} />
                    <AvatarFallback>{entry.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {entry.username}
                      {entry.isUser && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Team: {entry.teamName}</div>
                  </div>
                  <div className="font-bold">{entry.points} pts</div>
                  {index < 3 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>{entry.reward} FLR</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30 sticky top-20">
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                  <Crown className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">#{userRank}</div>
                <div className="text-sm text-muted-foreground">Out of {totalParticipants} participants</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Points</span>
                <span className="font-bold text-xl">347</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rewards Earned</span>
                <span className="font-bold text-xl text-green-500">{rewardsEarned} FLR</span>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium mb-2">Top Performers in Your Team</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>VK</AvatarFallback>
                    </Avatar>
                    <span>V. Kohli</span>
                  </div>
                  <span className="font-bold">87 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>JB</AvatarFallback>
                    </Avatar>
                    <span>J. Bumrah</span>
                  </div>
                  <span className="font-bold">75 pts</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                Claim Rewards
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const leaderboard = [
  {
    rank: 1,
    username: "CryptoKing",
    initials: "CK",
    teamName: "Royal Challengers",
    points: 423,
    reward: 100,
    isUser: false,
  },
  {
    rank: 2,
    username: "BlockchainBaller",
    initials: "BB",
    teamName: "Super Kings",
    points: 412,
    reward: 75,
    isUser: false,
  },
  {
    rank: 3,
    username: "TokenTiger",
    initials: "TT",
    teamName: "Mumbai Indians",
    points: 398,
    reward: 50,
    isUser: false,
  },
  {
    rank: 4,
    username: "NFTNinja",
    initials: "NN",
    teamName: "Knight Riders",
    points: 387,
    reward: 25,
    isUser: false,
  },
  {
    rank: 245,
    username: "CryptoPlayer",
    initials: "CP",
    teamName: "Web3 Warriors",
    points: 347,
    reward: 12.5,
    isUser: true,
  },
]
