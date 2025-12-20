import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for persisted connection
    const savedAddress = localStorage.getItem('proofpay_wallet_address');
    if (savedAddress) {
        setAddress(savedAddress);
        setIsConnected(true);
        // Mock balance fetch
        setBalance("1,250 XLM"); 
    }
    
    // Check demo mode
    const demo = localStorage.getItem('proofpay_demo_failures') === 'true';
    setIsDemoMode(demo);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
        // Mock connection for now
        await new Promise(r => setTimeout(r, 1000));
        
        // Simulating successful connection
        const mockAddress = "GDAX...7J4Z"; 
        setAddress(mockAddress);
        setIsConnected(true);
        setBalance("1,250 XLM");
        localStorage.setItem('proofpay_wallet_address', mockAddress);
        
    } catch (error) {
        console.error("Connection failed", error);
    } finally {
        setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setBalance("0 XLM");
    localStorage.removeItem('proofpay_wallet_address');
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
