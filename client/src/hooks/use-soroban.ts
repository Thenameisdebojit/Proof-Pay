import { useState } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { sorobanData } from '@/lib/soroban-data';
import { formatError } from '@/lib/error-utils';

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

const NATIVE_TOKEN_ADDRESS = "CDLZFC3SYJYDNOEV54ow426AV33M777AA6V33M777AA6V33M777AA6"; // Stellar Testnet Native Token

export type TxStatus = 'idle' | 'simulating' | 'signing' | 'submitting' | 'polling' | 'success' | 'error';

export function useSoroban() {
  const { address, signTransaction, isConnected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  let server: any = null;
  try {
      if (Server) server = new Server(RPC_URL);
  } catch (error) {
      console.error("Failed to initialize Soroban Server:", error);
  }

  // Initialize the contract (Admin function, technically)
  const initializeContract = async () => {
    if (!isConnected || !address) return;
    
    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
         toast({ title: "Demo Mode", description: "Contract not deployed. Skipping initialization." });
         return;
    }

    if (!server) return;
    setIsLoading(true);
    setTxStatus('simulating');
    try {
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);
      
      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "initialize",
            new Address(NATIVE_TOKEN_ADDRESS).toScVal()
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      await submitTx(tx);
      toast({ title: "Contract Initialized" });
    } catch (e: any) {
       console.error("Init failed", e);
       // Ignore "AlreadyInitialized" error (Error 10)
       if (!e.message?.includes("Error(10)")) {
          toast({ title: "Initialization Failed", description: e.message, variant: "destructive" });
          setTxStatus('error');
       } else {
          setTxStatus('success');
       }
    } finally {
      setIsLoading(false);
      if (txStatus !== 'error') setTxStatus('idle');
    }
  };

  const transferXLM = async (to: string, amount: string) => {
    if (!isConnected || !address || !server) return;
    setIsLoading(true);
    setTxStatus('signing');
    try {
      const account = await server.getAccount(address);
      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: to,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(TimeoutInfinite)
        .build();
        
      const preparedXdr = tx.toXDR();
      const signedXdr = await signTransaction(preparedXdr);
      
      setTxStatus('submitting');
      const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(signedTx);
      
      if (response.status === 'ERROR') throw new Error("Transaction Error");
      
      setTxStatus('success');
      toast({ title: "Transfer Sent", description: `Sent ${amount} XLM to ${to}` });
      return { status: 'success', hash: response.hash };
      
    } catch (e: any) {
        setTxStatus('error');
        toast({ title: "Transfer Failed", description: e.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
        setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  const submitTx = async (tx: any) => {
    if (!server) {
        toast({ title: "Configuration Error", description: "Soroban RPC not initialized", variant: "destructive" });
        throw new Error("Soroban RPC not initialized");
    }

    try {
      setTxStatus('simulating');
      const simulated = await server.simulateTransaction(tx);
      
      if (SorobanRpc.Api.isSimulationError(simulated)) {
         throw new Error(`Simulation failed: ${simulated.error}`);
      }

      const prepared = await server.prepareTransaction(tx);
      
      setTxStatus('signing');
      const signedXdr = await signTransaction(prepared.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      
      setTxStatus('submitting');
      const response = await server.sendTransaction(signedTx);

      if (response.status !== 'PENDING') {
        throw new Error(`Submission failed: ${response.status}`);
      }

      let statusResponse;
      let status = response.status;
      const hash = response.hash;

      setTxStatus('polling');
      // Poll for 30 seconds (15 retries * 2s)
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        statusResponse = await server.getTransaction(hash);
        if (statusResponse.status !== 'NOT_FOUND' && statusResponse.status !== 'PENDING') {
            status = statusResponse.status;
            break;
        }
      }

      if (status === 'SUCCESS') {
          setTxStatus('success');
          return { status: 'success', hash, resultMetaXdr: statusResponse.resultMetaXdr };
      } else {
          throw new Error(`Transaction failed with status: ${status}`);
      }

    } catch (err: any) {
      setTxStatus('error');
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
      throw new Error("Wallet not connected");
    }
    
    // DEMO MODE: If Contract ID is the placeholder, simulate success
    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
        console.warn("Using Dummy Contract ID - Simulating Fund Creation");
        setIsLoading(true);
        setTxStatus('simulating');
        await new Promise(r => setTimeout(r, 500));
        setTxStatus('signing');
        await new Promise(r => setTimeout(r, 500));
        setTxStatus('submitting');
        
        const newId = sorobanData.mockCreateFund({
            funderAddress: address,
            beneficiaryAddress: beneficiary,
            verifierAddress: verifier,
            amount: amount,
            deadline: new Date(deadlineTimestamp * 1000).toISOString(),
            requirementHash: requirementHash
        });

        toast({ title: "Demo Mode", description: "Contract not deployed. Simulating creation.", variant: "default" });
        await new Promise(r => setTimeout(r, 1000)); // Fake delay
        setTxStatus('success');
        setIsLoading(false);
        setTimeout(() => setTxStatus('idle'), 2000);
        return { status: 'success', hash: 'mock_tx_hash_' + Date.now(), id: newId };
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
            nativeToScVal(BigInt(deadlineTimestamp), { type: 'u64' }),
            xdr.ScVal.scvBytes(hexToBytes(requirementHash) as any) // Cast to any to avoid Buffer vs Uint8Array mismatch
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Fund Created", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e: any) {
      console.error("Create Fund Failed:", e);
      toast({ 
        title: "Release Failed", 
        description: formatError(e), 
        variant: "destructive" 
      });
      throw e;
    } finally {
      setIsLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  const submitProof = async (fundId: number, proofHash: string) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      throw new Error("Wallet not connected");
    }
    
    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
         setIsLoading(true);
         setTxStatus('signing');
         await new Promise(r => setTimeout(r, 500));
         
         sorobanData.mockUpdateFundStatus(fundId, "Pending Verification", proofHash);
         toast({ title: "Demo Mode", description: "Simulating Proof Submission." });
         await new Promise(r => setTimeout(r, 1000));
         
         setTxStatus('success');
         setIsLoading(false);
         setTimeout(() => setTxStatus('idle'), 2000);
         return { status: 'success', hash: 'mock_proof_hash_' + Date.now() };
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
            nativeToScVal(BigInt(fundId), { type: 'u64' }),
            xdr.ScVal.scvBytes(hexToBytes(proofHash))
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Proof Submitted", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e: any) {
      toast({ 
        title: "Proof Submission Failed", 
        description: formatError(e), 
        variant: "destructive" 
      });
      throw e;
    } finally {
      setIsLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  const approveProof = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      throw new Error("Wallet not connected");
    }

    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
         setIsLoading(true);
         setTxStatus('signing');
         await new Promise(r => setTimeout(r, 500));
         
         sorobanData.mockUpdateFundStatus(fundId, "Approved");
         toast({ title: "Demo Mode", description: "Simulating Approval." });
         await new Promise(r => setTimeout(r, 1000));
         
         setTxStatus('success');
         setIsLoading(false);
         setTimeout(() => setTxStatus('idle'), 2000);
         return { status: 'success', hash: 'mock_approve_hash_' + Date.now() };
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
            nativeToScVal(BigInt(fundId), { type: 'u64' })
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
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  const releaseFunds = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }

    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
         setIsLoading(true);
         setTxStatus('signing');
         await new Promise(r => setTimeout(r, 500));
         
         sorobanData.mockUpdateFundStatus(fundId, "Released");
         toast({ title: "Demo Mode", description: "Simulating Fund Release." });
         await new Promise(r => setTimeout(r, 1000));
         
         setTxStatus('success');
         setIsLoading(false);
         setTimeout(() => setTxStatus('idle'), 2000);
         return { status: 'success', hash: 'mock_release_hash_' + Date.now() };
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
            new Address(address).toScVal(),
            nativeToScVal(BigInt(fundId), { type: 'u64' })
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Funds Released", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e: any) {
      console.error("Release Funds Error:", e);
      setTxStatus('error');
      toast({ 
        title: "Release Failed", 
        description: formatError(e), 
        variant: "destructive" 
      });
      throw e;
    } finally {
      setIsLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  const refundFunder = async (fundId: number) => {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      throw new Error("Wallet not connected");
    }

    if (CONTRACT_ID.startsWith("CD73R2Q3")) {
         setIsLoading(true);
         setTxStatus('signing');
         await new Promise(r => setTimeout(r, 500));
         
         sorobanData.mockUpdateFundStatus(fundId, "Rejected");
         toast({ title: "Demo Mode", description: "Simulating Refund." });
         await new Promise(r => setTimeout(r, 1000));
         
         setTxStatus('success');
         setIsLoading(false);
         setTimeout(() => setTxStatus('idle'), 2000);
         return { status: 'success', hash: 'mock_refund_hash_' + Date.now() };
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
            new Address(address).toScVal(),
            nativeToScVal(BigInt(fundId), { type: 'u64' })
          )
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const result = await submitTx(tx);
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result?.hash}`;
      toast({ title: "Funder Refunded", description: `Tx: ${result?.hash} - Check Explorer: ${explorerUrl}` });
      return result;
    } catch (e: any) {
      console.error("Refund Error:", e);
      setTxStatus('error');
      toast({ 
        title: "Refund Failed", 
        description: formatError(e), 
        variant: "destructive" 
      });
      throw e;
    } finally {
      setIsLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  return {
    createFund,
    submitProof,
    approveProof,
    releaseFunds,
    refundFunder,
    initializeContract,
    transferXLM,
    isLoading,
    txStatus
  };
}
