import albedo from '@albedo-link/intent';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CD73R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3";
const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || "testnet";

export const stellarService = {
  
  // Generic Soroban Invocation
  invokeContract: async (method: string, args: any[]) => {
    try {
      console.log(`Invoking ${method} on ${CONTRACT_ID} with args:`, args);
      
      // For demo purposes, if we are in "Mock Mode" (detected by the dummy contract ID),
      // we simulate the success. In production, this calls Albedo.
      if (CONTRACT_ID.startsWith("CD73R2Q3")) {
        console.log("Mock Mode: Simulating Albedo signature...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { txHash: "mock_tx_hash_" + Date.now(), status: "success" };
      }

      const result = await (albedo as any).invoke({
        network: NETWORK,
        contractId: CONTRACT_ID,
        method: method,
        args: args // args need to be ScVal XDR strings or recognized types
      });

      return result;
    } catch (error) {
      console.error(`Error invoking ${method}:`, error);
      throw error;
    }
  },

  submitProof: async (fundId: number, proofHash: string) => {
    // args: [fund_id (u64), proof_hash (bytes32)]
    // Note: Albedo expects specific formatting for args.
    // Since we can't easily generate ScVal XDR here without complex logic,
    // we will assume the Albedo intent handles basic types or we pass raw values if supported.
    // For this strict environment, we'll try to pass structured args if possible, 
    // or rely on the mock mode if strict types aren't available.
    
    return await stellarService.invokeContract('submit_proof', [
      { type: 'u64', value: fundId },
      { type: 'bytes', value: proofHash } // hex string
    ]);
  },

  approveProof: async (fundId: number) => {
    return await stellarService.invokeContract('approve_proof', [
      { type: 'u64', value: fundId }
    ]);
  },

  releaseFunds: async (fundId: number) => {
    return await stellarService.invokeContract('release_funds', [
      { type: 'u64', value: fundId }
    ]);
  },

  // Direct Payment (For demo/hackathon simplicity where Verifier pays directly)
  transferFunds: async (destination: string, amount: string) => {
    try {
      console.log(`Initiating transfer of ${amount} XLM to ${destination}`);
      const result = await (albedo as any).pay({
        amount: amount,
        destination: destination,
        network: NETWORK,
        asset_code: 'XLM' // Native Lumens
      });
      return result;
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  }
};
