# ProofPay - Conditional Scholarship Disbursements

ProofPay is a blockchain-based platform for managing conditional fund disbursements using Stellar Soroban smart contracts. It enables Funders to lock funds that are only released to Beneficiaries upon verification of proof by a designated Verifier.

## Features

- **Role-Based Access**:
  - **Funder**: Create funds, set conditions, and lock XLM.
  - **Beneficiary**: View assigned funds, submit proof (IPFS hash/description).
  - **Verifier**: Review proofs with AI assistance and approve/reject release.
- **Smart Contract Security**: Funds are held in a Soroban smart contract, ensuring trustless execution.
- **Zero-Backend Architecture**: Fund state is synchronized directly from the blockchain (simulated in Demo Mode).
- **AI Verification**: Advisory AI panel to assist Verifiers in analyzing submitted documents.

## Prerequisites

- **Node.js**: v18 or higher.
- **npm**: v9 or higher.
- **Freighter Wallet Extension** (for browser): Recommended for mainnet/testnet interaction.

## Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Application**:
    Double-click `start_app.bat` (Windows) or run:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5000`.

## Usage Guide

### Demo Mode
By default, the application runs in **Demo Mode** if no valid Contract ID is provided or if the configured ID is the default placeholder (`CD73R2Q3...`).
- **No real funds are moved.**
- Wallet connection simulates a test account.
- Contract interactions (Create, Submit, Approve) are mocked for instant feedback.

### Testnet Mode
To run on Stellar Futurenet/Testnet:
1.  Deploy the Soroban contract (see `src/lib.rs`).
2.  Update `.env` with your `VITE_CONTRACT_ID`.
3.  Ensure your Freighter wallet is connected to the correct network.

## Project Structure

- **client/**: React frontend with Shadcn UI.
  - `src/hooks/use-soroban.ts`: Core logic for contract interactions.
  - `src/lib/soroban-data.ts`: Mock data store for Demo Mode.
- **server/**: Lightweight Express server for serving the frontend and static assets.
- **src/**: Rust source code for the Soroban smart contract.

## Troubleshooting

- **"Wallet not connected"**: Ensure you have clicked "Connect Wallet" in the top right.
- **Build Errors**: Run `npm install` again to ensure all packages are consistent.
