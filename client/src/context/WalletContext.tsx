import React, { createContext, useContext, useState, useEffect } from 'react';
import albedo from '@albedo-link/intent';
import { useToast } from "@/hooks/use-toast";
import { Horizon } from '@stellar/stellar-sdk';

// Initialize Horizon server (Testnet)
const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isDemoMode: boolean; // Keep for compatibility if needed, but we want real wallet
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isConnecting: false,
  address: null,
  balance: '0 XLM',
  network: 'testnet',
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isDemoMode: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0 XLM');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for existing session
    const savedAddress = localStorage.getItem('proofpay_wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      fetchBalance(savedAddress);
    }
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const account = await server.loadAccount(addr);
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native')?.balance || '0';
      setBalance(`${parseFloat(xlmBalance).toFixed(2)} XLM`);
    } catch (error) {
      console.error("Failed to fetch balance", error);
      // If account not found (404), it means it's unfunded on testnet
      setBalance('0 XLM (Unfunded)'); 
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const result = await albedo.publicKey({
        token: 'proofpay_auth_' + Date.now(), // Random token to prevent replay
      });
      
      const pubKey = result.pubkey;
      setAddress(pubKey);
      setIsConnected(true);
      localStorage.setItem('proofpay_wallet_address', pubKey);
      
      toast({ title: "Wallet Connected", description: `Connected to ${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4)}` });
      
      await fetchBalance(pubKey);
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      toast({ variant: "destructive", title: "Connection Failed", description: error.message || "Could not connect to Albedo" });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setBalance('0 XLM');
    localStorage.removeItem('proofpay_wallet_address');
    toast({ title: "Wallet Disconnected" });
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      isConnecting,
      address,
      balance,
      network: 'testnet', // Force testnet for now as per requirements
      connectWallet,
      disconnectWallet,
      isDemoMode: false
    }}>
      {children}
    </WalletContext.Provider>
  );
};
