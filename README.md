ProofPay
Overview

ProofPay is a trust-minimized, on-chain scholarship and grant disbursement system built on the Stellar blockchain (Soroban).
It ensures that funds are locked transparently, released only after proof-based approval, and automatically recoverable if conditions are not met.

ProofPay replaces manual, opaque, and delay-prone payment processes with verifiable, rule-enforced fund flows.

Problem Statement

Scholarships, grants, and aid programs suffer from:

Delayed or manual disbursement

Lack of transparency for beneficiaries

Risk of misallocation or fund leakage

No cryptographic guarantee of compliance

Existing systems rely on trust and manual enforcement.

ProofPay enforces rules on-chain.

Core Idea (Plain English)

A funder locks money into a smart contract.

The money cannot move unless predefined conditions are met.

A beneficiary submits proof (hash only).

A verifier reviews the proof and approves using their wallet.

Funds are released instantly on-chain — or refunded if deadlines expire.

No backend custody. No manual payouts.

System Architecture
User Wallet (Albedo)
        |
        v
Frontend (React)
        |
        v
Soroban Smart Contract (On-Chain Escrow)
        |
        v
Stellar Ledger (Final Settlement)


Key Properties

No backend servers

No database for funds

No custodial wallets

All money lives on-chain

UI reads blockchain state directly

Smart Contract Design

Funds are escrowed on-chain using Soroban smart contracts

State Machine:

PENDING

PROOF_SUBMITTED

APPROVED

RELEASED

REFUNDED

Role-based authorization:

Funder creates and can refund

Beneficiary submits proof and claims funds

Verifier approves proof

Deadlines enforced on-chain

Typed errors, no panic paths

Funds can never be trapped

Application Flow
Funder

Connect wallet

Create a fund

Funds lock on-chain

Wait for approval or refund after deadline

Beneficiary

Sees scholarship notification

Submits proof hash

Tracks status

Claims funds after approval

Verifier

Sees pending proofs

Reviews submitted hash

Optionally uses AI advisory panel

Approves via wallet signature

AI Verification (Advisory Only)

AI assists verifiers off-chain

Extracts fields (e.g. GPA, institution)

Highlights red flags

Provides confidence score

Important:
AI never approves funds, signs transactions, or touches the smart contract.
Only human wallet signatures trigger on-chain actions.

Wallet & Security Model

Wallet: Albedo (Testnet)

No private key handling

No seed phrase storage

No auto-signing

One action = one explicit wallet signature

Separation of approval and fund release

This design is safe for real fund workflows.

Read-Only Indexing & Sync

Frontend polls Soroban RPC & Horizon

No backend indexing service

UI updates only after on-chain confirmation

Explorer links shown for every transaction

Blockchain is the source of truth

Failure Handling

Human-readable error messages

Demo failure simulation mode

Explicit handling for:

Deadline expiry

Unauthorized actions

Invalid state transitions

Funds always remain recoverable

Tech Stack

Blockchain: Stellar Testnet

Smart Contracts: Soroban (Rust)

Wallet: Albedo

Frontend: React + TypeScript

Styling: Utility-first CSS

Backend: None (by design)

What This Project Is NOT

No backend servers

No custodial wallets

No KYC or identity system

No auto-approval

No database for funds

No DAO or governance layer

Demo & Testing

Connect Albedo wallet (Testnet)

Create a fund as Funder

Switch wallet to Beneficiary → submit proof

Switch wallet to Verifier → approve

Switch back to Beneficiary → claim funds

View transactions on Stellar Explorer

Roadmap (Conceptual)

Institutional verifier wallets

Batched scholarship creation

Time-based escalation policies

Enhanced AI advisory models

These are not yet implemented.

Disclaimer

This project is a prototype for demonstration and educational purposes.
It is not financial advice and has not undergone a formal security audit.

ProofPay

Replacing trust-based payments with proof-based automation.
