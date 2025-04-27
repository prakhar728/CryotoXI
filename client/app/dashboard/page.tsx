"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, PlusCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { CreateTournamentDialog } from "@/components/create-tournament";
import { useReadContract, useReadContracts } from "wagmi";
import contractConfig from "@/contracts";

export function AdminControls() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
  );
}

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [allMatches, setAllMatches] = useState([]);
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);

  const {
    data: contestIds,
    isLoading: isLoadingIds,
    error: readError,
  } = useReadContract({
    address: contractConfig.ContestFactoryAddress,
    abi: contractConfig.ContestFactory.abi,
    functionName: "getAllContests",
  });

  if (readError) console.log(readError);

  const {
    data: allContests,
    isLoading,
    error: multipleReadError,
  } = contractConfig.ContestFactory
    ? useReadContracts({
        contracts: (contestIds && contestIds.length ? contestIds : []).map(
          (id) => ({
            address: contractConfig.ContestFactoryAddress,
            abi: contractConfig.ContestFactory.abi,
            functionName: "getContest",
            args: [id],
          })
        ),
      })
    : { data: undefined, isLoading: false, error: undefined };

  useEffect(() => {
    const formatContests = async () => {
      if (!allContests || !allContests.length) return;
  
      // Create an array of promises
      const contestPromises = allContests.map(async (c) => {
        if (!(c.status === "success")) return null;
  
        try {
          let temp = c.result;
          let response = await fetch(`https://gateway.lighthouse.storage/ipfs/${temp.ipfsHash}`);
          let matchDetails = await response.json(); // Assuming it's JSON
          
          return {
            ...temp,
            ...matchDetails
          };
        } catch (error) {
          console.error("Error fetching match details:", error);
          return null;
        }
      });
  
      // Wait for all promises to resolve
      const formattedContests = await Promise.all(contestPromises);
      
      // Filter out null values (failed fetches)
      const validContests = formattedContests.filter(contest => contest !== null);
      
      // Set state with the formatted contests
      setAllMatches(validContests);
    };
  
    formatContests();
  }, [allContests]);

  useEffect(() => {
    if (!allMatches.length) return;

    const now = Date.now() / 1000; // Current time in seconds

    // Filter for ongoing matches (started but not ended)
    const ongoing = allMatches.filter(match => 
      Number(match.startTime) < now && Number(match.endTime) > now
    );
    
    // Filter for upcoming matches (not started yet)
    const upcoming = allMatches.filter(match => 
      Number(match.startTime) > now
    );
    
    // Filter for completed matches (ended or scores finalized)
    const completed = allMatches.filter(match => 
      Number(match.endTime) < now || match.scoresFinalized
    );

    setOngoingMatches(ongoing);
    setUpcomingMatches(upcoming);
    setCompletedMatches(completed);

  }, [allMatches]);

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Match Selection</h1>
          <p className="text-muted-foreground">
            Select a match to create your fantasy team or view your existing
            team
          </p>
        </div>

        {isAdmin && <AdminControls />}

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading matches...</div>
            ) : ongoingMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingMatches.map((match) => (
                  <MatchCard key={match.contestId} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No ongoing matches at the moment</div>
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading matches...</div>
            ) : upcomingMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.contestId} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No upcoming matches scheduled</div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading matches...</div>
            ) : completedMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMatches.map((match) => (
                  <MatchCard key={match.contestId} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No completed matches</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MatchCard({ match }) {
  // Format the time label based on match status
  const getTimeLabel = () => {
    const now = Date.now() / 1000; // Current time in seconds
    
    if (Number(match.startTime) > now) {
      return match.time; // Upcoming match - show scheduled time
    } else if (Number(match.endTime) < now || match.scoresFinalized) {
      return "Completed"; // Completed match
    } else {
      return "Live"; // Ongoing match
    }
  };

  // Check if user has a team for this match (placeholder logic)
  // In a real app, this would check against user's teams
  const hasTeam = false; // Replace with actual logic
  
  // Format prize pool to display with FLR
  const prizePool = `${match.prizePool} FLR`;
  
  // Format participants count (could be enhanced with actual count)
  const participants = `${match.participantCount || 0}/${match.maxParticipants}`;

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
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {match.type}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Prize Pool: {prizePool}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getTimeLabel()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Entry Fee: <span className="font-bold">{match.entryFee} FLR</span>
            </div>
            <div className="text-sm">
              Participants: <span className="font-bold">{participants}</span>
            </div>
          </div>
          <div className="text-sm line-clamp-2 text-muted-foreground">
            {match.venue && <span>Venue: {match.venue}</span>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/match/${match.contestId}`} className="w-full">
          <Button
            className={`w-full ${
              hasTeam
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            }`}
          >
            {hasTeam ? "View Team" : "Join Contest"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}