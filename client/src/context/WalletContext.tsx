import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAllowed, setAllowed, getUserInfo } from "@stellar/freighter-api";

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isConnecting: false,
  address: null,
  balance: "0",
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isDemoMode: false,
  toggleDemoMode: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0 XLM");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if previously connected
    const checkConnection = async () => {
      try {
        if (await isAllowed()) {
          const info = await getUserInfo();
          if (info?.publicKey) {
            setAddress(info.publicKey);
            setIsConnected(true);
            // In a real app, we would fetch the balance here
            setBalance("1,250 XLM"); // Mock balance for now
          }
        }
      } catch (e) {
        console.error("Failed to restore connection:", e);
      }
    };
    checkConnection();

    // Check demo mode
    const demo = localStorage.getItem('proofpay_demo_failures') === 'true';
    setIsDemoMode(demo);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const allowed = await setAllowed();
      if (allowed) {
        const info = await getUserInfo();
        if (info?.publicKey) {
          setAddress(info.publicKey);
          setIsConnected(true);
          setBalance("1,250 XLM"); // Mock balance
        }
      }
    } catch (error) {
      console.error("Connection failed", error);
      // Fallback for demo/testing if Freighter is not installed
      // alert("Freighter not detected. Using demo account.");
      const mockAddress = "GDAX...7J4Z"; 
      setAddress(mockAddress);
      setIsConnected(true);
      setBalance("1,250 XLM");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setBalance("0 XLM");
    // Freighter doesn't have a strict "disconnect" API that revokes permission easily from client,
    // but we can clear our local state.
  };

  const toggleDemoMode = () => {
      const newVal = !isDemoMode;
      setIsDemoMode(newVal);
      localStorage.setItem('proofpay_demo_failures', String(newVal));
  };

  return (
    <WalletContext.Provider value={{ 
        isConnected, 
        isConnecting, 
        address, 
        balance, 
        connectWallet, 
        disconnectWallet,
        isDemoMode,
        toggleDemoMode
    }}>
      {children}
    </WalletContext.Provider>
  );
};
