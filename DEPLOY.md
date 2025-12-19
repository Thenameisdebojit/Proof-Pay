# Deployment Guide for ProofPay

This guide covers how to deploy the ProofPay Web3 prototype to production-like environments.

## 1. Environment Configuration (.env)

Create a `.env` file in the root directory (or configure these in your deployment platform's secrets manager).

```ini
# Server Configuration
PORT=5000
NODE_ENV=production

# Network Configuration (Testnet)
VITE_NETWORK=testnet
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org
VITE_HORIZON=https://horizon-testnet.stellar.org

# Smart Contract ID (Must be deployed on Testnet)
# Replace with your actual contract ID
VITE_CONTRACT_ID=CD73R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3
```

## 2. Deployment Options

### Option A: Replit (Recommended for Full Stack)
ProofPay uses an Express backend to serve the React frontend, making Replit an ideal host.

1. **Import Repository**: Create a new Repl and import this GitHub repository.
2. **Install Dependencies**: Replit should automatically run `npm install`. If not, run it manually in the Shell.
3. **Configure Secrets**:
   - Go to "Secrets" (Lock icon) in the sidebar.
   - Add all variables from the `.env` section above.
4. **Run**: Click the green "Run" button.
   - Replit will execute `npm run start` (which builds and serves).
   - If you need to rebuild manually, run `npm run build` in the Shell.

### Option B: Render / Railway (Node.js Service)
1. **Connect Repository**: Connect your GitHub repo to Render or Railway.
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run start`
4. **Environment Variables**: Add the variables from `.env` in the dashboard.

### Option C: Vercel / Netlify (Frontend Only)
*Note: This project is set up as a monolithic Node.js app. To deploy on Vercel/Netlify, you typically deploy only the `client` directory, but you would lose the Express backend unless you refactor API routes to Serverless Functions.*

**If you must use Vercel for the frontend:**
1. Set "Root Directory" to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. You will need a separate backend URL if your app relies on the Express server APIs. (Currently, the prototype uses in-memory storage on the Express server).

## 3. Testnet Safety Checklist

Before sharing your prototype:

- [ ] **Network Check**: Ensure `VITE_NETWORK` is set to `testnet`.
- [ ] **Contract ID**: Verify `VITE_CONTRACT_ID` matches the contract deployed on Testnet, not Mainnet.
- [ ] **Wallet Isolation**: Ensure you are using a Testnet-only Freighter account. Never mix Mainnet private keys with development.
- [ ] **Funds**: Use the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet) to fund test accounts. Do not send real XLM.
- [ ] **RPC URL**: Confirm `VITE_SOROBAN_RPC` points to `https://soroban-testnet.stellar.org`.

## 4. Local Development

To run locally:
1. `npm install`
2. `npm run dev` (Starts frontend and backend in development mode)
3. Open `http://localhost:5000`
