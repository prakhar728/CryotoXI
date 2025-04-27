# CryptoXI: Fantasy Cricket on Flare

CryptoXI is a decentralized fantasy cricket platform built on the Flare Network, utilizing Flare's Data Connector (FDC) to bring real-world cricket data on-chain in a verifiable manner.

## Overview

CryptoXI allows users to:

1. Create fantasy cricket contests for upcoming matches
2. Submit teams by selecting players and designating captain/vice-captain
3. Score teams based on actual player performance
4. Distribute prizes transparently based on team rankings

The platform leverages Flare's enshrined data protocols to ensure that all scoring and rewards are transparent, verifiable, and tamper-proof.

## Key Features

- **On-chain Verification**: All match data and scoring happens on-chain through Flare's Data Connector
- **Transparent Scoring**: Scoring rules are implemented in smart contracts and cannot be changed
- **Fair Rewarding**: Prize distribution follows pre-defined structures that are visible to all users
- **Low Fees**: Utilizing Flare's low-cost transactions for an affordable fantasy experience

## Project Structure

The project is organized into the following contracts:

- **ContestFactory.sol**: Main contract that manages contests, team submissions, and prize distribution
- **ContestData.sol**: Data structures for contests, teams, players, and performances
- **ScoringEngine.sol**: Handles fantasy point calculations based on player performances
- **FDCDataConsumer.sol**: Integrates with Flare Data Connector to bring cricket match data on-chain

## Smart Contract Architecture

```
ContestFactory
    ├── ScoringEngine
    └── FDCDataConsumer
```

Only the ContestFactory contract is deployed directly. The other contracts are created by the ContestFactory during deployment, resulting in a single deployment transaction.

## Attestation Process Workflow

1. **Request Preparation**:
   - Format a JsonApi attestation request with the cricket match ID
   - Specify JQ filters to extract relevant player performance data
   - Include ABI signature for decoding the data on-chain

2. **FDC Attestation**:
   - Submit the attestation request to FDC Hub
   - Request enters the current voting round for validation by FDC validators
   - Validators fetch the data and reach consensus

3. **Proof Retrieval**:
   - After the voting round is finalized, retrieve the attestation data and Merkle proof
   - Verify the proof on-chain using FdcVerification contract

4. **On-chain Processing**:
   - Extract player performance data from the verified response
   - Calculate fantasy points for each user's team
   - Update leaderboards and distribute rewards

## Setup Instructions

1. **Install Foundry**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cryptoxi
   cd cryptoxi
   ```

3. **Install dependencies**:
   ```bash
   forge install
   ```

4. **Configure environment variables**:
   Create a `.env` file with the following variables:
   ```
   PRIVATE_KEY=your_private_key
   CRICKET_API_KEY=your_cricket_api_key
   VERIFIER_API_KEY=your_verifier_api_key
   COSTON2_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
   FLARE_API_KEY=your_flare_api_key
   COSTON2_DA_LAYER_URL=https://fdc-da-layer-testnet.flare.network/
   X_API_KEY=your_da_layer_api_key
   ```

5. **Compile contracts**:
   ```bash
   forge build
   ```

## Deployment and Usage

### Deploy the contracts:

```bash
# Load environment variables
source .env

# Deploy the ContestFactory contract
forge script script/Deploy.s.sol:DeployScript --rpc-url $COSTON2_RPC_URL --private-key $PRIVATE_KEY --broadcast --ffi
```

### Create a new contest:

1. First upload the match data to IPFS and get the hash (you can use a service like Pinata)

2. Then create the contest:
```bash
# Set environment variables
export MATCH_ID="3659022a-de1d-48fe-b68a-c62197297408"
export IPFS_HASH="QmYourIPFSHash"
export ENTRY_FEE="0.5"  # 0.5 FLR
export START_TIME="1713974400"  # Unix timestamp
export END_TIME="1713988800"    # Unix timestamp

# Create the contest
forge script script/CreateContest.s.sol:CreateContestScript --rpc-url $COSTON2_RPC_URL --private-key $PRIVATE_KEY --broadcast --ffi
```

### Submit a team:

1. Create a file with the list of player IDs (one per line)

2. Then submit the team:
```bash
# Set environment variables
export CONTEST_ID="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
export PLAYER_IDS_FILE="data/my_team_players.txt"
export CAPTAIN_ID="a034346c-b408-4d29-a0f0-8b12430be28e"
export VICE_CAPTAIN_ID="de19a93e-06df-4597-9186-7a53c1613552"

# Submit the team
forge script script/SubmitTeam.s.sol:SubmitTeamScript --rpc-url $COSTON2_RPC_URL --private-key $PRIVATE_KEY --broadcast --ffi
```

### Request match data (after match):

```bash
# Set environment variables
export MATCH_ID="3659022a-de1d-48fe-b68a-c62197297408"
export CONTEST_ID="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Request match data from FDC
forge script script/RequestMatchData.s.sol:RequestMatchDataScript --rpc-url $COSTON2_RPC_URL --private-key $PRIVATE_KEY --broadcast --ffi
```

### Finalize scores and distribute prizes:

Wait for about 3 minutes after requesting match data, then:

```bash
# Set environment variables
export MATCH_ID="3659022a-de1d-48fe-b68a-c62197297408"
export CONTEST_ID="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Retrieve attestation proof, finalize scores, and distribute prizes
forge script script/RetrieveProof.s.sol:RetrieveProofScript --rpc-url $COSTON2_RPC_URL --private-key $PRIVATE_KEY --broadcast --ffi
```

## License

MIT

## LOCALHOST

Install the project dependencies.

```bash
forge soldeer install
```

You might have to modify the `remappings.txt` so that `/src` part of path is before the non src part
Like this

```bash
@openzeppelin-contracts/=dependencies/@openzeppelin-contracts-5.2.0-rc.1/
flare-periphery/=dependencies/flare-periphery-0.0.22/
forge-std/=dependencies/forge-std-1.9.5/src/
forge-std/=dependencies/forge-std-1.9.5/
surl/=dependencies/surl-0.0.0/src/
surl/=dependencies/surl-0.0.0/
```

Copy the `.env.example` to `.env` and fill in the `PRIVATE_KEY`


Deploying CryptoXI Fantasy Cricket Platform...
  Using cricket API key: XXXX
  ContestFactory deployed to: 0xDdA0258438aa2822b189D30fEAD3269B5E1C228a
  FDCDataConsumer deployed to: 0x1c11dE84e93157E5458045e7D394B3933A1512cC
