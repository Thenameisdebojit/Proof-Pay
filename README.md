```markdown
# ProofPay

**Conditional scholarship & grant disbursement with on-chain escrow and cryptographic proof verification**

## Problem Statement

Traditional grant disbursement requires either:
- **Trust-based release**: Funds sent upfront with no recourse if milestones aren't met
- **Centralized escrow**: Third-party custody introduces counterparty risk and operational overhead

ProofPay solves this by locking funds on-chain in a Soroban smart contract, releasing them only when verifiable proof of milestone completion is submitted and approved by a designated verifier. Funders retain automatic refund rights if conditions aren't met.

## How ProofPay Works

1. **Funder** creates a grant agreement via ProofPay frontend and deposits funds into a Soroban escrow contract
2. **Beneficiary** receives notification and accepts terms (on-chain signature required)
3. **Beneficiary** uploads proof of milestone completion (documents, reports, certifications)
4. **Verifier** (designated authority) reviews submitted proof and either:
   - Approves release → Funds transfer to beneficiary
   - Rejects submission → Beneficiary can resubmit or funder can claim refund
5. **Refund Path**: If deadline passes without approval, funder can reclaim locked funds

All state transitions require explicit wallet signatures. No automated approvals.

## Core Guarantees & Security Model

- ✅ Funds locked on-chain only (Stellar Testnet)
- ✅ Non-custodial: No private keys, no seed phrases stored
- ✅ Every transaction requires wallet signature (Albedo integration)
- ✅ No backend custody or database for funds
- ✅ Smart contract enforces time-bound refund rights
- ✅ AI never approves funds or triggers releases

## Smart Contract Overview

**Contract Type**: Soroban (Rust), deployed on Stellar Testnet  
**State Machine**:
```
Created → Accepted → ProofSubmitted → Approved/Rejected → Released/Refunded
```

**Authorization Roles**:
- **Funder**: Deposits funds, can refund after deadline
- **Beneficiary**: Accepts agreement, submits proof, receives payout
- **Verifier**: Reviews proof, approves/rejects release

**Refund Guarantees**:
- Automatic eligibility after deadline expiration
- Requires funder's wallet signature to execute
- Funds remain locked until explicit action (approval or refund)

## AI Usage (Advisory Only)

**What AI Does**:
- Extracts text from uploaded documents (PDFs, images)
- Provides summary analysis of submitted proof
- Flags potential discrepancies for verifier review

**What AI Does NOT Do**:
- ❌ Approve or reject fund releases
- ❌ Sign transactions
- ❌ Make custody decisions
- ❌ Access private keys
- ❌ Trigger smart contract functions

AI output is **advisory metadata only**. All approval decisions are human-executed via wallet signatures.

## Frontend & Wallet Integration

- **Wallet**: Albedo (Stellar testnet, non-custodial)
- **RPC**: Read-only Soroban RPC + Horizon API for indexing
- **No Backend**: All state read from blockchain; no server-side database for funds
- **Transaction Flow**: Frontend constructs transaction → User signs in Albedo → Broadcast to Stellar network

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Soroban (Rust) |
| Blockchain | Stellar Testnet |
| Wallet | Albedo (non-custodial) |
| Frontend | React + Stellar SDK |
| Indexing | Soroban RPC (read-only) |
| AI (Optional) | Off-chain document analysis |

## What This Project Does NOT Do

- ❌ Custodial wallets or key management
- ❌ Automated AI-driven approvals
- ❌ Mainnet deployment (testnet only)
- ❌ Backend fund storage or private databases
- ❌ Multi-sig recovery (funds locked to contract logic only)

## Current Status

⚠️ **Prototype / Testnet Only**  
- Not audited
- Not production-ready
- For demonstration and testing purposes
- Testnet XLM has no real value

---

**License**: MIT  
**Network**: Stellar Testnet  
**Contract Language**: Rust (Soroban)
``````markdown
# ProofPay

**Conditional scholarship & grant disbursement with on-chain escrow and cryptographic proof verification**

## Problem Statement

Traditional grant disbursement requires either:
- **Trust-based release**: Funds sent upfront with no recourse if milestones aren't met
- **Centralized escrow**: Third-party custody introduces counterparty risk and operational overhead

ProofPay solves this by locking funds on-chain in a Soroban smart contract, releasing them only when verifiable proof of milestone completion is submitted and approved by a designated verifier. Funders retain automatic refund rights if conditions aren't met.

## How ProofPay Works

1. **Funder** creates a grant agreement via ProofPay frontend and deposits funds into a Soroban escrow contract
2. **Beneficiary** receives notification and accepts terms (on-chain signature required)
3. **Beneficiary** uploads proof of milestone completion (documents, reports, certifications)
4. **Verifier** (designated authority) reviews submitted proof and either:
   - Approves release → Funds transfer to beneficiary
   - Rejects submission → Beneficiary can resubmit or funder can claim refund
5. **Refund Path**: If deadline passes without approval, funder can reclaim locked funds

All state transitions require explicit wallet signatures. No automated approvals.

## Core Guarantees & Security Model

- ✅ Funds locked on-chain only (Stellar Testnet)
- ✅ Non-custodial: No private keys, no seed phrases stored
- ✅ Every transaction requires wallet signature (Albedo integration)
- ✅ No backend custody or database for funds
- ✅ Smart contract enforces time-bound refund rights
- ✅ AI never approves funds or triggers releases

## Smart Contract Overview

**Contract Type**: Soroban (Rust), deployed on Stellar Testnet  
**State Machine**:
```
Created → Accepted → ProofSubmitted → Approved/Rejected → Released/Refunded
```

**Authorization Roles**:
- **Funder**: Deposits funds, can refund after deadline
- **Beneficiary**: Accepts agreement, submits proof, receives payout
- **Verifier**: Reviews proof, approves/rejects release

**Refund Guarantees**:
- Automatic eligibility after deadline expiration
- Requires funder's wallet signature to execute
- Funds remain locked until explicit action (approval or refund)

## AI Usage (Advisory Only)

**What AI Does**:
- Extracts text from uploaded documents (PDFs, images)
- Provides summary analysis of submitted proof
- Flags potential discrepancies for verifier review

**What AI Does NOT Do**:
- ❌ Approve or reject fund releases
- ❌ Sign transactions
- ❌ Make custody decisions
- ❌ Access private keys
- ❌ Trigger smart contract functions

AI output is **advisory metadata only**. All approval decisions are human-executed via wallet signatures.

## Frontend & Wallet Integration

- **Wallet**: Albedo (Stellar testnet, non-custodial)
- **RPC**: Read-only Soroban RPC + Horizon API for indexing
- **No Backend**: All state read from blockchain; no server-side database for funds
- **Transaction Flow**: Frontend constructs transaction → User signs in Albedo → Broadcast to Stellar network

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Soroban (Rust) |
| Blockchain | Stellar Testnet |
| Wallet | Albedo (non-custodial) |
| Frontend | React + Stellar SDK |
| Indexing | Soroban RPC (read-only) |
| AI (Optional) | Off-chain document analysis |

## What This Project Does NOT Do

- ❌ Custodial wallets or key management
- ❌ Automated AI-driven approvals
- ❌ Backend fund storage or private databases
- ❌ Multi-sig recovery (funds locked to contract logic only)

## Current Status

⚠️ **Prototype / Testnet Only**  
- Not audited
- Not production-ready
- For demonstration and testing purposes
- Testnet XLM has no real value

---

**License**: MIT  
**Network**: Stellar Testnet  
**Contract Language**: Rust (Soroban)
```
