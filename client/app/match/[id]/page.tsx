"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useReadContract, useWriteContract } from "wagmi";
import contractConfig from "@/contracts";
import { getMatchSquad } from "@/lib/cricketApiService";
import { parseEther } from "viem";

export default function MatchDetailPage() {
  const params = useParams();
  const contestId = params.id as string;

  const [hasTeam, setHasTeam] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [contest, setContest] = useState<any>(null);
  const [squads, setSquads] = useState<any[]>([]);
  const [isLoadingSquad, setIsLoadingSquad] = useState(true);
  const [playersData, setPlayersData] = useState<any[]>([]);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Contract write hook
  const { writeContractAsync, isPending, error: writeError } = useWriteContract();

  if (writeError) console.log(writeError);
  

  // Read contest data from blockchain
  const {
    data: contestData,
    isLoading: isLoadingIds,
    error: readError,
  } = useReadContract({
    address: contractConfig.ContestFactoryAddress,
    abi: contractConfig.ContestFactory.abi,
    functionName: "getContest",
    args: [contestId],
  });

  // Format contest data
  useEffect(() => {
    const formatContestData = async () => {
      if (!contestData) return;
      try {
        const response = await fetch(
          `https://gateway.lighthouse.storage/ipfs/${contestData.ipfsHash}`
        );
        const data = await response.text();
        const parsedData = JSON.parse(data);

        const formattedData = {
          ...contestData,
          ...parsedData,
        };

        setContest(formattedData);

        // Fetch squad data once we have the contest
        fetchSquadData(formattedData.matchId);
      } catch (error) {
        console.error("Error fetching contest data:", error);
      }
    };

    if (contestData) {
      formatContestData();
    }
  }, [contestData]);

  // Fetch squad data using the API
  const fetchSquadData = async (matchId: string) => {
    setIsLoadingSquad(true);
    try {
      const squadData = await getMatchSquad(matchId);
      setSquads(squadData.data);

      // Process players data for our UI
      const allPlayers = processPlayersData(squadData.data);
      setPlayersData(allPlayers);

      setIsLoadingSquad(false);
    } catch (error) {
      console.error("Error fetching squad data:", error);
      setIsLoadingSquad(false);
    }
  };

  // Process players data to format needed for our UI
  const processPlayersData = (squads: any[]) => {
    const processedPlayers: any[] = [];

    squads.forEach((team) => {
      team.players.forEach((player: any) => {
        // Map role from API to our format (BAT, BOWL, AR, WK)
        let role = "BAT";
        if (player.role === "Bowler") role = "BOWL";
        else if (
          player.role === "Bowling Allrounder" ||
          player.role === "Batting Allrounder"
        )
          role = "AR";
        else if (player.role.includes("WK")) role = "WK";

        // Generate a consistent cost based on player id
        // This is a placeholder - in a real app, this would come from your backend
        const idSum = player.id
          .split("-")[0]
          .split("")
          .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const cost = (idSum % 6) + 5; // Generate a cost between 5-10

        processedPlayers.push({
          id: player.id,
          name: player.name,
          initials: player.name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
          team: team.shortname,
          role: role,
          cost: cost,
          battingStyle: player.battingStyle,
          bowlingStyle: player.bowlingStyle,
          country: player.country,
          playerImg: player.playerImg,
        });
      });
    });

    return processedPlayers;
  };

  const handlePlayerSelection = (playerId: string, cost: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
    } else {
      if (selectedPlayers.length >= 11) return;
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const setCaptainRole = (playerId: string) => {
    if (captain === playerId) {
      setCaptain(null);
    } else {
      setCaptain(playerId);
      if (viceCaptain === playerId) setViceCaptain(null);
    }
  };

  const setViceCaptainRole = (playerId: string) => {
    if (viceCaptain === playerId) {
      setViceCaptain(null);
    } else {
      setViceCaptain(playerId);
      if (captain === playerId) setCaptain(null);
    }
  };

  const submitTeam = async () => {
    if (selectedPlayers.length !== 11) return;
    if (!captain || !viceCaptain) return;
    
    setSubmittingTeam(true);
    
    try {
      await writeContractAsync({
        abi: contractConfig.ContestFactory.abi,
        address: contractConfig.ContestFactoryAddress,
        functionName: "submitTeam",
        args: [
          contestId,
          selectedPlayers,
          captain,
          viceCaptain,
        ],
        value: parseEther(contest.entryFee)
      });
      setHasTeam(true);
    } catch (error) {
      console.error("Error submitting team:", error);
    } finally {
      setSubmittingTeam(false);
    }
  };

  if (isLoadingIds || !contest) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold">Loading contest information...</h1>
      </div>
    );
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
            {contest.teamAFull} vs {contest.teamBFull}
          </h1>
          <Badge
            variant="outline"
            className="ml-2 bg-primary/10 text-primary border-primary/20"
          >
            {contest.type}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {contest.date} • {contest.time}
            </span>
          </div>
          <div>Entry Fee: {contest.entryFee} FLR</div>
          <div>Prize Pool: {contest.prizePool} FLR</div>
          <div>Venue: {contest.venue}</div>
        </div>
        {hasTeam ? (
          <TeamView
            contest={contest}
            selectedPlayers={selectedPlayers}
            captain={captain}
            viceCaptain={viceCaptain}
            playersData={playersData}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Players</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Selected:</span>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {selectedPlayers.length}/11
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Select 11 players and choose a captain and vice-captain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSquad ? (
                    <div className="text-center py-10">
                      <p>Loading players...</p>
                    </div>
                  ) : (
                    <Tabs
                      defaultValue="all"
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-5 mb-6">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="bat">BAT</TabsTrigger>
                        <TabsTrigger value="bowl">BOWL</TabsTrigger>
                        <TabsTrigger value="ar">AR</TabsTrigger>
                        <TabsTrigger value="wk">WK</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playersData.map((player) => (
                            <PlayerCard
                              key={player.id}
                              player={player}
                              isSelected={selectedPlayers.includes(player.id)}
                              isCaptain={captain === player.id}
                              isViceCaptain={viceCaptain === player.id}
                              onSelect={() =>
                                handlePlayerSelection(player.id, player.cost)
                              }
                              onCaptainSelect={() => setCaptainRole(player.id)}
                              onViceCaptainSelect={() =>
                                setViceCaptainRole(player.id)
                              }
                              disabled={
                                !selectedPlayers.includes(player.id) &&
                                selectedPlayers.length >= 11
                              }
                            />
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="bat" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playersData
                            .filter((player) => player.role === "BAT")
                            .map((player) => (
                              <PlayerCard
                                key={player.id}
                                player={player}
                                isSelected={selectedPlayers.includes(player.id)}
                                isCaptain={captain === player.id}
                                isViceCaptain={viceCaptain === player.id}
                                onSelect={() =>
                                  handlePlayerSelection(player.id, player.cost)
                                }
                                onCaptainSelect={() =>
                                  setCaptainRole(player.id)
                                }
                                onViceCaptainSelect={() =>
                                  setViceCaptainRole(player.id)
                                }
                                disabled={
                                  !selectedPlayers.includes(player.id) &&
                                  selectedPlayers.length >= 11
                                }
                              />
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="bowl" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playersData
                            .filter((player) => player.role === "BOWL")
                            .map((player) => (
                              <PlayerCard
                                key={player.id}
                                player={player}
                                isSelected={selectedPlayers.includes(player.id)}
                                isCaptain={captain === player.id}
                                isViceCaptain={viceCaptain === player.id}
                                onSelect={() =>
                                  handlePlayerSelection(player.id, player.cost)
                                }
                                onCaptainSelect={() =>
                                  setCaptainRole(player.id)
                                }
                                onViceCaptainSelect={() =>
                                  setViceCaptainRole(player.id)
                                }
                                disabled={
                                  !selectedPlayers.includes(player.id) &&
                                  selectedPlayers.length >= 11
                                }
                              />
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="ar" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playersData
                            .filter((player) => player.role === "AR")
                            .map((player) => (
                              <PlayerCard
                                key={player.id}
                                player={player}
                                isSelected={selectedPlayers.includes(player.id)}
                                isCaptain={captain === player.id}
                                isViceCaptain={viceCaptain === player.id}
                                onSelect={() =>
                                  handlePlayerSelection(player.id, player.cost)
                                }
                                onCaptainSelect={() =>
                                  setCaptainRole(player.id)
                                }
                                onViceCaptainSelect={() =>
                                  setViceCaptainRole(player.id)
                                }
                                disabled={
                                  !selectedPlayers.includes(player.id) &&
                                  selectedPlayers.length >= 11
                                }
                              />
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="wk" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playersData
                            .filter((player) => player.role === "WK")
                            .map((player) => (
                              <PlayerCard
                                key={player.id}
                                player={player}
                                isSelected={selectedPlayers.includes(player.id)}
                                isCaptain={captain === player.id}
                                isViceCaptain={viceCaptain === player.id}
                                onSelect={() =>
                                  handlePlayerSelection(player.id, player.cost)
                                }
                                onCaptainSelect={() =>
                                  setCaptainRole(player.id)
                                }
                                onViceCaptainSelect={() =>
                                  setViceCaptainRole(player.id)
                                }
                                disabled={
                                  !selectedPlayers.includes(player.id) &&
                                  selectedPlayers.length >= 11
                                }
                              />
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="bg-card/30 backdrop-blur-sm border-muted/30 sticky top-20">
                <CardHeader>
                  <CardTitle>Team Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">BAT</div>
                      <div className="font-bold">
                        {
                          selectedPlayers.filter(
                            (id) =>
                              playersData.find((p) => p.id === id)?.role ===
                              "BAT"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">BOWL</div>
                      <div className="font-bold">
                        {
                          selectedPlayers.filter(
                            (id) =>
                              playersData.find((p) => p.id === id)?.role ===
                              "BOWL"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">AR</div>
                      <div className="font-bold">
                        {
                          selectedPlayers.filter(
                            (id) =>
                              playersData.find((p) => p.id === id)?.role ===
                              "AR"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">WK</div>
                      <div className="font-bold">
                        {
                          selectedPlayers.filter(
                            (id) =>
                              playersData.find((p) => p.id === id)?.role ===
                              "WK"
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>Captain</span>
                      <span className="ml-auto font-bold">
                        {captain
                          ? playersData.find((p) => p.id === captain)?.name
                          : "Not Selected"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-gray-400" />
                      <span>Vice Captain</span>
                      <span className="ml-auto font-bold">
                        {viceCaptain
                          ? playersData.find((p) => p.id === viceCaptain)?.name
                          : "Not Selected"}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={submitTeam}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    disabled={
                      selectedPlayers.length !== 11 || 
                      !captain || 
                      !viceCaptain || 
                      submittingTeam || 
                      isPending
                    }
                  >
                    {submittingTeam || isPending ? "Submitting..." : "Submit Team"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
  player: any;
  isSelected: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  onSelect: () => void;
  onCaptainSelect: () => void;
  onViceCaptainSelect: () => void;
  disabled: boolean;
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
            {player.playerImg &&
            player.playerImg !== "https://h.cricapi.com/img/icon512.png" ? (
              <AvatarImage src={player.playerImg} />
            ) : (
              <AvatarImage
                src={`/placeholder.svg?height=40&width=40&text=${player.initials}`}
              />
            )}
            <AvatarFallback>{player.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold flex items-center gap-2">
              {player.name}
              {isCaptain && (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                >
                  C
                </Badge>
              )}
              {isViceCaptain && (
                <Badge
                  variant="outline"
                  className="bg-gray-500/20 text-gray-400 border-gray-500/30"
                >
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
      </div>
      <div className="bg-muted/30 p-3 grid grid-cols-3 text-center text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Team</div>
          <div className="font-medium">{player.team}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Batting</div>
          <div className="font-medium">
            {player.battingStyle?.substring(0, 5) || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Country</div>
          <div className="font-medium">{player.country?.substring(0, 5) || "N/A"}</div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={onSelect}
            className="w-full"
            disabled={disabled}
          >
            Select Player
          </Button>
        </div>
      )}
    </Card>
  );
}

function TeamView({
  contest,
  selectedPlayers,
  captain,
  viceCaptain,
  playersData,
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Team</CardTitle>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/30"
              >
                Team Submitted
              </Badge>
            </div>
            <CardDescription>
              Your team for {contest.teamAFull} vs {contest.teamBFull}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlayers.map((playerId: string) => {
                  const player = playersData.find((p) => p.id === playerId);
                  if (!player) return null;
                  return (
                    <Card
                      key={player.id}
                      className="overflow-hidden bg-card/30 backdrop-blur-sm border-muted/30"
                    >
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
                            {player.playerImg &&
                            player.playerImg !==
                              "https://h.cricapi.com/img/icon512.png" ? (
                              <AvatarImage src={player.playerImg} />
                            ) : (
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${player.initials}`}
                              />
                            )}
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
                                <Badge
                                  variant="outline"
                                  className="bg-gray-500/20 text-gray-400 border-gray-500/30"
                                >
                                  VC
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{player.team}</span>
                              <span>•</span>
                              <Badge
                                variant="outline"
                                className="text-xs py-0 h-5"
                              >
                                {player.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3 grid grid-cols-3 text-center text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Country
                          </div>
                          <div className="font-medium">{player.country}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Batting
                          </div>
                          <div className="font-medium">
                            {player.battingStyle?.substring(0, 5) || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Bowling
                          </div>
                          <div className="font-medium">
                            {player.bowlingStyle?.substring(0, 5) || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="bg-card/30 backdrop-blur-sm border-muted/30 sticky top-20">
          <CardHeader>
            <CardTitle>Contest Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Team Status</span>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/30"
                >
                  Submitted
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Match Details</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{contest.teamA}</AvatarFallback>
                  </Avatar>
                  <span>{contest.teamAFull}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{contest.teamB}</AvatarFallback>
                  </Avatar>
                  <span>{contest.teamBFull}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {contest.venue}
              </div>
              <div className="text-sm text-muted-foreground">
                {contest.date} • {contest.time}
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <div className="text-sm font-medium mb-2">Team Composition</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center bg-card/50 p-2 rounded-md">
                  <div className="text-sm text-muted-foreground">BAT</div>
                  <div className="font-bold">
                    {
                      selectedPlayers.filter(
                        (id) =>
                          playersData.find((p) => p.id === id)?.role === "BAT"
                      ).length
                    }
                  </div>
                </div>
                <div className="flex flex-col items-center bg-card/50 p-2 rounded-md">
                  <div className="text-sm text-muted-foreground">BOWL</div>
                  <div className="font-bold">
                    {
                      selectedPlayers.filter(
                        (id) =>
                          playersData.find((p) => p.id === id)?.role === "BOWL"
                      ).length
                    }
                  </div>
                </div>
                <div className="flex flex-col items-center bg-card/50 p-2 rounded-md">
                  <div className="text-sm text-muted-foreground">AR</div>
                  <div className="font-bold">
                    {
                      selectedPlayers.filter(
                        (id) =>
                          playersData.find((p) => p.id === id)?.role === "AR"
                      ).length
                    }
                  </div>
                </div>
                <div className="flex flex-col items-center bg-card/50 p-2 rounded-md">
                  <div className="text-sm text-muted-foreground">WK</div>
                  <div className="font-bold">
                    {
                      selectedPlayers.filter(
                        (id) =>
                          playersData.find((p) => p.id === id)?.role === "WK"
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>
            <Link href="/leaderboard">
              <Button className="w-full mt-4">View Leaderboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}