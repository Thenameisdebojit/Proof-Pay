import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  isConnected,
  requestAccess,
  signAuthEntry,
  signTransaction as freighterSignTransaction,
  getNetwork,
  getPublicKey,
  signMessage,
} from '@stellar/freighter-api';
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
      if (storedAddress && (await isConnected())) {
        const key = await getPublicKey();
        if (key === storedAddress) {
            // Validate network
            const currentNetwork = await getNetwork();
            setNetwork(currentNetwork);
            if (currentNetwork.toLowerCase() !== requiredNetwork.toLowerCase()) {
                console.warn("Network mismatch on restore");
                // Don't auto-connect if network is wrong, or handle gracefully
            }
            setAddress(key);
            setConnected(true);
            fetchBalance(key);
        }
      }
    };
    checkConnection();
  }, [requiredNetwork]);

  const fetchBalance = async (pubKey: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HORIZON}/accounts/${pubKey}`);
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

  // Helper to prevent hanging promises
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 30000, errorMsg: string = "Operation timed out"): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs))
    ]);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      let installed = await isConnected();
      if (!installed) {
        // Retry once in case of slow injection
        await new Promise(r => setTimeout(r, 1000));
        installed = await isConnected();
      }

      if (!installed) {
        toast({
          title: "Freighter not found",
          description: "Please install Freighter wallet extension.",
          variant: "destructive",
        });
        setIsConnecting(false); // Ensure state reset
        return;
      }

      // Notify user to check extension
      toast({
          title: "Requesting Access",
          description: "Please check the Freighter popup to grant access.",
      });

      const allowed = await withTimeout(requestAccess(), 60000, "Access request timed out. Please unlock Freighter.");
      console.log("Access result:", allowed);
      
      if (!allowed) {
        toast({
            title: "Access Denied",
            description: "User denied wallet access.",
            variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }

      const key = await withTimeout(getPublicKey(), 10000, "Failed to get public key");
      console.log("Wallet Address:", key);
      
      const userNetwork = await withTimeout(getNetwork(), 10000, "Failed to get network");
      console.log("Wallet Network:", userNetwork);
      
      // Loose check for network to avoid blocking if string format differs
      // Accept 'Testnet', 'TESTNET', 'Test SDF Network ; September 2015', etc.
      if (!userNetwork || !userNetwork.toLowerCase().includes('testnet')) {
        toast({
          title: "Wrong Network",
          description: `Please switch Freighter to Testnet (Current: ${userNetwork || 'Unknown'}).`,
          variant: "destructive",
        });
        // We allow connection but warn user? No, for safety we should probably return or force switch.
        // But let's fail gracefully.
        setIsConnecting(false);
        return;
      }

      // Login Challenge
      const timestamp = new Date().toISOString();
      const message = `Login to ProofPay at ${timestamp}`;
      
      try {
           toast({
             title: "Sign to Login",
             description: "Please sign the challenge message in Freighter.",
           });

           console.log("Requesting signature...");
           const signature = await withTimeout(signMessage(message), 60000, "Signature timed out");
           
           console.log("Login signature:", signature);
           
           setAddress(key);
           setConnected(true);
           setNetwork(userNetwork);
           localStorage.setItem('walletAddress', key);
           fetchBalance(key);
           
           toast({
            title: "Wallet Connected",
            description: `Connected to ${key.substring(0, 4)}...${key.substring(key.length - 4)}`,
           });
      } catch (err: any) {
           console.error("Login signature failed:", err);
            toast({
             title: "Login Failed",
             description: err.message || "User rejected the login signature.",
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
      const signedXdr = await freighterSignTransaction(xdr, { network: requiredNetwork.toUpperCase() as any });
      return signedXdr;
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
