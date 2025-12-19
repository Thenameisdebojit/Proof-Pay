import { useState } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';

const {
  Contract,
  TransactionBuilder,
  xdr,
  TimeoutInfinite,
  Address,
  nativeToScVal
} = StellarSdk;

// Safe access to SorobanRpc
// @ts-ignore
const SorobanRpc = StellarSdk.SorobanRpc || StellarSdk.rpc;
const Server = SorobanRpc?.Server;

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CD73R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3";
const RPC_URL = import.meta.env.VITE_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"; // Testnet

console.log("Soroban Config:", { CONTRACT_ID, RPC_URL, ServerExists: !!Server });

const hexToBytes = (hex: string) => {
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

export function useSoroban() {
  const { address, signTransaction, isConnected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  let server: any = null;
  try {
      if (Server) server = new Server(RPC_URL);
  } catch (error) {
      console.error("Failed to initialize Soroban Server:", error);
  }

  const submitTx = async (tx: any) => {
    if (!server) {
        toast({ title: "Configuration Error", description: "Soroban RPC not initialized", variant: "destructive" });
        throw new Error("Soroban RPC not initialized");
    }

    try {
      const simulated = await server.simulateTransaction(tx);
      
      if (SorobanRpc.Api.isSimulationError(simulated)) {
         throw new Error(`Simulation failed: ${simulated.error}`);
      }

      const prepared = await server.prepareTransaction(tx);
      const signedXdr = await signTransaction(prepared.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(signedTx);

      if (response.status !== 'PENDING') {
        throw new Error(`Submission failed: ${response.status}`);
      }

      let statusResponse;
      let status = response.status;
      const hash = response.hash;

      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 2000));
        statusResponse = await server.getTransaction(hash);
        if (statusResponse.status !== 'NOT_FOUND' && statusResponse.status !== 'PENDING') {
            status = statusResponse.status;
            break;
        }
      }

      if (status === 'SUCCESS') {
          return { status: 'success', hash };
      } else {
          throw new Error(`Transaction failed with status: ${status}`);
      }

    } catch (err: any) {
      console.error("Transaction Error:", err);
      toast({
        title: "Transaction Failed",
        description: err.message || "Unknown error occurred",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createFund = async (
    beneficiary: string,
    verifier: string,
    amount: string,
    deadlineTimestamp: number,
    requirementHash: string
  ) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!server) return;

    setIsLoading(true);
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);
      const amountStroops = BigInt(parseFloat(amount) * 10_000_000);

      if (requirementHash.length !== 64) {
          requirementHash = "0".repeat(64); 
      }
      
      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "create_fund",
            new Address(address).toScVal(),
            new Address(beneficiary).toScVal(),
            new Address(verifier).toScVal(),
            nativeToScVal(amountStroops, { type: 'i128' }),
            nativeToScVal(deadlineTimestamp, { type: 'u64' }),
            xdr.ScVal.scvBytes(hexToBytes(requirementHash))
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Fund Created", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e) {
      // Error handled in submitTx
    } finally {
      setIsLoading(false);
    }
  };

  const submitProof = async (fundId: number, proofHash: string) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!server) return;

    setIsLoading(true);
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      if (proofHash.length !== 64) {
          proofHash = "0".repeat(64);
      }

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "submit_proof",
            new Address(address).toScVal(),
            nativeToScVal(fundId, { type: 'u64' }),
            xdr.ScVal.scvBytes(hexToBytes(proofHash))
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Proof Submitted", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const approveProof = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!server) return;

    setIsLoading(true);
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "approve_proof",
            new Address(address).toScVal(),
            nativeToScVal(fundId, { type: 'u64' })
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Proof Approved", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const releaseFunds = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!server) return;

    setIsLoading(true);
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "release_funds",
            nativeToScVal(fundId, { type: 'u64' })
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Funds Released", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const refundFunder = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }
    if (!server) return;

    setIsLoading(true);
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "refund_funder",
            nativeToScVal(fundId, { type: 'u64' })
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Funder Refunded", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createFund,
    submitProof,
    approveProof,
    releaseFunds,
    refundFunder,
    isLoading
  };
}
