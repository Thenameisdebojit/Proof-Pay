// Mock Stellar Service
// Simulates wallet connection and basic crypto interactions

const MOCK_DELAY = 800;

export const stellarService = {
  // Simulate connecting to a wallet like Freighter
  connectWallet: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Random mock address
        const mockAddress = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        resolve({
          address: mockAddress,
          isConnected: true,
          balance: "1,250.00 XLM"
        });
      }, MOCK_DELAY);
    });
  },

  // Simulate signing a transaction (for funding or approving)
  signTransaction: async (type, details) => {
    console.log(`[Stellar Mock] Signing ${type} transaction:`, details);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: `tx_${Math.random().toString(36).substring(2)}`,
          status: "success",
          timestamp: new Date().toISOString()
        });
      }, MOCK_DELAY * 2); // Takes a bit longer
    });
  },

  // Format address for display
  shortenAddress: (address) => {
    if (!address) return "";
    if (address.length < 10) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
};
