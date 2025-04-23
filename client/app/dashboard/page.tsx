'use client';

import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Clock, PlusCircle, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { CreateTournamentDialog } from "@/components/create-tournament"

export function AdminControls() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </div>
      
      <CreateTournamentDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </>
  )
}

export default function DashboardPage() {
  const [isAdmin, setisAdmin] = useState(true);

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Match Selection</h1>
          <p className="text-muted-foreground">Select a match to create your fantasy team or view your existing team</p>
        </div>

        {isAdmin && <AdminControls />}

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: any }) {
  return (
    <Card className="overflow-hidden bg-card/30 backdrop-blur-sm border-muted/30 hover:border-primary/50 transition-colors group">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full bg-gradient-to-r from-purple-900/50 to-cyan-900/50">
          <Image
            src="/placeholder.svg?height=160&width=400"
            alt={`${match.teamA} vs ${match.teamB}`}
            fill
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-card/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=64&width=64&text=${match.teamA}`}
                    alt={match.teamA}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="mt-1 font-semibold">{match.teamA}</span>
              </div>
              <div className="text-xl font-bold">VS</div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-card/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=64&width=64&text=${match.teamB}`}
                    alt={match.teamB}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="mt-1 font-semibold">{match.teamB}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {match.type}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Prize Pool: {match.prizePool} FLR</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{match.time}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Entry Fee: <span className="font-bold">{match.entryFee} FLR</span>
            </div>
            <div className="text-sm">
              Participants: <span className="font-bold">{match.participants}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/match/${match.id}`} className="w-full">
          <Button
            className={`w-full ${match.hasTeam ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"}`}
          >
            {match.hasTeam ? "View Team" : "Join Contest"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

const ongoingMatches = [
  {
    id: "1",
    teamA: "IND",
    teamB: "AUS",
    type: "T20",
    date: "Today",
    time: "Live",
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
    entryFee: 2,
    prizePool: 500,
    participants: "5.7K",
    hasTeam: false,
  },
  {
    id: "4",
    teamA: "WI",
    teamB: "SL",
    type: "T20",
    date: "Jun 18, 2023",
    time: "2:30 PM",
    entryFee: 1,
    prizePool: 250,
    participants: "3.1K",
    hasTeam: false,
  },
  {
    id: "5",
    teamA: "BAN",
    teamB: "AFG",
    type: "ODI",
    date: "Jun 20, 2023",
    time: "9:00 AM",
    entryFee: 1.5,
    prizePool: 300,
    participants: "2.8K",
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
    entryFee: 5,
    prizePool: 1200,
    participants: "15.3K",
    hasTeam: true,
  },
  {
    id: "7",
    teamA: "AUS",
    teamB: "ENG",
    type: "ODI",
    date: "Jun 8, 2023",
    time: "Completed",
    entryFee: 4,
    prizePool: 900,
    participants: "12.7K",
    hasTeam: true,
  },
]
