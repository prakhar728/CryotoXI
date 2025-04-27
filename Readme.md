# 🏏 CryptoXI: Decentralized Fantasy Cricket on Flare

---

## 🎯 Vision

**CryptoXI** is a **next-generation decentralized fantasy cricket platform** built on **Flare’s enshrined data protocols**.

Think Dream11 — but **trustless**, **transparent**, **crypto-native**, and **community-owned**.

We are reimagining how fans engage with their favorite sport, combining **real-time cricket data**, **provably fair smart contracts**, and **crypto rewards** — all while giving players true economic participation and ownership.

---

## ❓ What Problem Does CryptoXI Solve?

Traditional fantasy platforms (like Dream11, MPL, etc.) suffer from:

- Centralized and opaque scoring systems.
- Limited innovation in gameplay.
- Zero transparency in fund management.
- Users having no say or ownership.

**CryptoXI** changes the game by offering:

- 📜 **Transparent**, **on-chain scoring** and **reward distribution**.
- 🔗 **Verifiable**, **real-time sports data** through Flare’s FDC (Flare Data Connector).
- 🎲 **Provably fair randomness** via Flare's RNG.
- 🏆 **Real economic incentives** — users earn in **FLR tokens**.
- 👥 **Community governance** and player-owned economy.

---

## 🚀 How CryptoXI Works

Here’s how the user flow looks:

### 1. Landing Page
- Clean, futuristic UI.
- Guides users:  
  _Select Match → Build Team → Lock Team → Track Points → Win FLR_.
- Explains decentralization, Web3 benefits, and wallet integration.

### 2. Match Selection
- Displays current and upcoming matches.
- Each match shows:
  - Match details (teams, start time).
  - Entry fee (in FLR).
  - "Join" or "View Team" button.

### 3. Team Building (`/match/:id`)
- 22 players available (11 from each team).
- Users:
  - Select 11 players within a given budget.
  - Choose a **Captain** (2x points) and **Vice-Captain** (1.5x points).
  - Submit their team via wallet signature.

> _Note: Only one team per match per user (for now)._

### 4. Waiting for Match to End
- After locking the team, users just wait and track live points.

### 5. Match End: Calculation Phase
- Once the match ends:
  - **Admins initiate score fetching** via Flare FDC.
  - Scorecard data is fetched, verified with proof, and updated on-chain.
  - **Points calculated per player** (e.g., 1 Run = 1 Point, 1 Six = +3 Points, etc.)
  - **User points summed up**, leaderboard prepared.

### 6. Rewards Distribution
- Rewards distributed from the contest prize pool.
- **10% platform fee** is deducted for sustainability.
- Users receive FLR directly into their wallets according to their rank.

---

## 🔗 Flare Protocol Integrations

| Flare Service | Usage in CryptoXI |
| :--- | :--- |
| **FDC (Flare Data Connector)** | Fetches real-time cricket scores and player stats |
| **RNG (Random Number Generator)** | For random bonuses, tie-breakers, and loot events |
| **FTSO (Time Series Oracle)** | Dynamically adjusts entry fees and prize pools based on live FLR prices |

---

## 🧠 Why CryptoXI + Why Flare?

### Why CryptoXI?
- **Transparency**: All match data, points, and payouts are visible on-chain.
- **Ownership**: You control your teams, rewards, and assets.
- **No Hidden Manipulations**: Smart contracts do the math, not centralized servers.
- **Play-to-Earn**: Your fantasy skills now directly earn you crypto.

### Why Flare?
- **Built-in Data Integration**: Flare’s FDC makes Web2 → Web3 bridging seamless.
- **Low Gas Fees**: Affordable for millions of micro-transactions like fantasy games.
- **Fast Finality**: Near-instant confirmation for real-time gaming experiences.
- **Native Support for Oracles**: Time series, randomness, external data — all in one.

---

## 📈 Market Size & Opportunity

**Fantasy Sports** is exploding, especially in cricket-crazy markets like **India**:

- India's fantasy sports market is projected to reach **$6.5 Billion** by 2027.
- **Dream11**, the largest platform, boasts **30+ million active users per match**.
- On Dream11:
  - Entry fee: ~$0.50 per user.
  - ~30M users per contest → **$15M pooled**.
  - Actual rewards distributed: Only about **$100K** (~0.66% payout).
  - Rest? **Platform profit.** Centralized control.

> _With CryptoXI, we bring fairness, transparency, and true economic participation back to the players._

Even capturing **0.5%** of Dream11’s market could translate to **hundreds of thousands** of Web3 native players and millions in on-chain volume.

---

## 🛠️ Development Roadmap

- [x] Finalize platform architecture (frontend + smart contracts).
- [x] Integrate real-time cricket APIs via FDC.
- [x] Build team-building flow (React + Tailwind).
- [ ] Deploy smart contracts for:
  - Team locking.
  - Points calculation.
  - Reward distribution.
- [ ] Launch Alpha Tournament.
- [ ] User Testing + Mainnet Launch.

---

## 📜 Summary

**CryptoXI** isn’t just another fantasy app.  
It’s a **decentralized revolution** where sports fans finally get a **fair**, **transparent**, and **rewarding** experience.

Built with Flare.  
Built for the Future.  
Built for Fans.

---
