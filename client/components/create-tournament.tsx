import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  Loader2,
  Search,
  Badge,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getMatchInfo, formatMatchDataForForm } from "@/lib/cricketApiService";
import { uploadText } from "@/utils/ipfs";
import { useWriteContract } from "wagmi";
import contractConfig from "../contracts/index";
import { parseEther } from "viem";

export function CreateTournamentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (flag: boolean) => {};
}) {
  const { writeContractAsync, error: contractError } = useWriteContract();

  if (contractError) console.log(contractError);

  const [step, setStep] = useState(1);
  const [matchId, setMatchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchPreview, setMatchPreview] = useState(null);
  const [error, setError] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    matchId: "",
    teamA: "",
    teamB: "",
    teamAFull: "",
    teamBFull: "",
    type: "T20",
    date: "",
    time: "",
    venue: "",
    entryFee: "2",
    prizePool: "500",
    maxParticipants: "10000",
    description: "",
    unixStartTime: 0,
    apiData: null, // Store the full API response here
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setMatchId("");
      setIsLoading(false);
      setMatchPreview(null);
      setError("");
      setUploadSuccess(false);
      setIpfsHash("");
      setFormData({
        matchId: "",
        teamA: "",
        teamB: "",
        teamAFull: "",
        teamBFull: "",
        type: "T20",
        date: "",
        time: "",
        venue: "",
        entryFee: "2",
        prizePool: "500",
        maxParticipants: "10000",
        description: "",
        unixStartTime: 0,
        apiData: null,
      });
    }
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload all data to IPFS
      const ipfsResult = await uploadText(JSON.stringify(formData));
      console.log(ipfsResult);
      console.log(formData);

      setUploadSuccess(true);

      // After successful upload

      console.log({
        args: [
          matchId,
          ipfsResult,
          parseEther(formData.entryFee.toString()),
          BigInt(Math.floor(Date.now() / 1000) + 600),
          BigInt(Math.floor(Date.now() / 1000) + 960),
          // formData.unixStartTime,
          // formData.unixStartTime + 10800,
        ],
      });

      await writeContractAsync({
        abi: contractConfig.ContestFactory.abi,
        address: contractConfig.ContestFactoryAddress,
        functionName: "createContest",
        args: [
          matchId,
          ipfsResult,
          parseEther(formData.entryFee.toString()),
          BigInt(Math.floor(Date.now() / 1000) + 600),
          BigInt(Math.floor(Date.now() / 1000) + 960),
          // formData.unixStartTime,
          // formData.unixStartTime + 10800,
        ],
      });

      onOpenChange(false);
    } catch (err) {
      setError("Failed to upload data to IPFS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (e: any) => {
    e.preventDefault();
    setStep((prev) => Math.min(prev + 1, 2));
  };
  const prevStep = (e: any) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const fetchMatchInfo = async () => {
    if (!matchId.trim()) {
      setError("Please enter a valid match ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setUploadSuccess(false);

    try {
      const response = await getMatchInfo(matchId.trim());
      const formattedData = formatMatchDataForForm(response);
      setMatchPreview(formattedData);

      // Update form data with API response and store the full API response
      setFormData({
        matchId: matchId.trim(),
        teamA: formattedData.teamA || "",
        teamB: formattedData.teamB || "",
        teamAFull: formattedData.teamAFull || "",
        teamBFull: formattedData.teamBFull || "",
        type: formattedData.type || "T20",
        date: formattedData.date || "",
        time: formattedData.time || "",
        venue: formattedData.venue || "",
        entryFee: "1",
        prizePool: "500",
        maxParticipants: "10000",
        description: formattedData.description || "",
        unixStartTime: formattedData.unixTime,
        apiData: response, // Store the complete API response
      });
    } catch (err) {
      console.error("Error fetching match info:", err);
      setError(
        "Failed to fetch match information. Please try again or enter details manually."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-muted/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Create Tournament
          </DialogTitle>
          <DialogDescription>
            Set up a new fantasy cricket tournament for users to join.
          </DialogDescription>
        </DialogHeader>

        {/* Match ID Input Section */}
        <div className="mb-6 border border-muted/40 rounded-lg p-4 bg-black/5">
          <h3 className="text-sm font-semibold mb-2">
            Quick Setup with Match ID
          </h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter Cricket API Match ID"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={fetchMatchInfo}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Fetch
            </Button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {uploadSuccess && (
            <div className="flex items-center text-green-500 text-sm mt-2">
              <Check className="h-4 w-4 mr-1" />
              Data uploaded to IPFS successfully!
            </div>
          )}
          {matchPreview && (
            <div className="mt-3 p-3 bg-muted/20 rounded-md">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Match Preview
              </h4>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-bold">
                      {matchPreview.teamA}
                    </span>
                  </div>
                  <span className="text-xs">vs</span>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-bold">
                      {matchPreview.teamB}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {matchPreview.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                <span>{matchPreview.date}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{matchPreview.time}</span>
              </div>
              <div className="text-xs mt-1 text-muted-foreground truncate">
                {matchPreview.venue}
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-2 mb-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted/50">
            <div
              className="h-1 bg-gradient-to-r from-purple-600 to-cyan-600 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                ${
                  step >= 1
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium">Basic Info</span>
            </div>
            <div className="text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                ${
                  step >= 2
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium">Tournament Details</span>
            </div>
          </div>
        </div>

        <form>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamA">Team A</Label>
                  <Input
                    id="teamA"
                    placeholder="Enter team name"
                    value={formData.teamA}
                    onChange={(e) => handleChange("teamA", e.target.value)}
                    required
                  />
                  {formData.teamAFull && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.teamAFull}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamB">Team B</Label>
                  <Input
                    id="teamB"
                    placeholder="Enter team name"
                    value={formData.teamB}
                    onChange={(e) => handleChange("teamB", e.target.value)}
                    required
                  />
                  {formData.teamBFull && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.teamBFull}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchType">Match Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T20">T20</SelectItem>
                    <SelectItem value="ODI">ODI</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      required
                    />
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="Enter match venue"
                  value={formData.venue || ""}
                  onChange={(e) => handleChange("venue", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee (FLR)</Label>
                  <div className="relative">
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.entryFee}
                      onChange={(e) => handleChange("entryFee", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prizePool">Prize Pool (FLR)</Label>
                  <div className="relative">
                    <Input
                      id="prizePool"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.prizePool}
                      onChange={(e) =>
                        handleChange("prizePool", e.target.value)
                      }
                      required
                    />
                    <Trophy className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <div className="relative">
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    placeholder="Enter max participants"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleChange("maxParticipants", e.target.value)
                    }
                    required
                  />
                  <Users className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add match description, rules or other information..."
                  className="h-24"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {ipfsHash && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <p className="font-medium text-green-800">IPFS Hash:</p>
                  <p className="text-green-700 break-all mt-1">{ipfsHash}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                type="button"
                className="ml-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                onClick={nextStep}
                disabled={!formData.teamA || !formData.teamB}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                className="ml-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                disabled={isLoading}
                onClick={(e) => {
                  if (!isLoading) handleSubmit(e);
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Create & Upload"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
