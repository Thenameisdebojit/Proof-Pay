import React, { createContext, useContext, useEffect, useState } from 'react';
import albedo from '@albedo-link/intent';
import { useToast } from '@/hooks/use-toast';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  balance: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>('0 XLM');
  const { toast } = useToast();

  const requiredNetwork = import.meta.env.VITE_NETWORK || 'testnet';

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      const storedAddress = localStorage.getItem('walletAddress');
      if (storedAddress) {
          // Verify session or just restore
          setAddress(storedAddress);
          setConnected(true);
          setNetwork(requiredNetwork); // Albedo doesn't expose network state persistently easily without re-auth
          fetchBalance(storedAddress);
      }
    };
    checkConnection();
  }, [requiredNetwork]);

  const fetchBalance = async (pubKey: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HORIZON || 'https://horizon-testnet.stellar.org'}/accounts/${pubKey}`);
      if (response.ok) {
        const data = await response.json();
        const xlmBalance = data.balances.find((b: any) => b.asset_type === 'native');
        if (xlmBalance) {
          setBalance(`${parseFloat(xlmBalance.balance).toFixed(2)} XLM`);
        } else {
            setBalance('0 XLM');
        }
      } else {
          // Account might not be funded yet
          setBalance('0 XLM');
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance('0 XLM'); // Fallback
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Login Challenge
      const timestamp = new Date().toISOString();
      const message = `Login to ProofPay at ${timestamp}`;
      
      try {
           toast({
             title: "Connecting to Albedo",
             description: "Please approve the connection in the Albedo popup.",
           });

           console.log("Requesting access from Albedo...");
           
           const result = await albedo.publicKey({
               token: message 
           });
           
           console.log("Albedo result:", result);
           
           const key = result.pubkey;
           const signedMessage = result.signature; // Albedo returns signature if token is provided
           
           if (!key) throw new Error("No public key returned");

           setAddress(key);
           setConnected(true);
           setNetwork('testnet'); // Albedo generally defaults to mainnet but we can force operations to testnet
           localStorage.setItem('walletAddress', key);
           fetchBalance(key);
           
           toast({
            title: "Wallet Connected",
            description: `Connected to ${key.substring(0, 4)}...${key.substring(key.length - 4)}`,
           });
      } catch (err: any) {
           console.error("Albedo connection failed:", err);
            toast({
             title: "Connection Failed",
             description: err.message || "User rejected the connection.",
             variant: "destructive"
           });
           setConnected(false); // Reset if signature fails
           setAddress(null);
           return;
      }

    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect wallet.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress(null);
    setNetwork(null);
    setBalance('0 XLM');
    localStorage.removeItem('walletAddress');
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully.",
    });
  };

  const signTransaction = async (xdr: string) => {
    try {
      const result = await albedo.tx({
          xdr: xdr,
          network: requiredNetwork // 'testnet' or 'public'
      });
      return result.signed_envelope_xdr;
    } catch (error) {
      console.error("Signing error:", error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: connected,
        isConnecting,
        address,
        network,
        connectWallet,
        disconnectWallet,
        signTransaction,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
