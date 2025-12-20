
import { StellarWalletsKit, Networks } from '@creit-tech/stellar-wallets-kit';
import { AlbedoModule } from '@creit-tech/stellar-wallets-kit/modules/albedo';
import { FreighterModule } from '@creit-tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit-tech/stellar-wallets-kit/modules/xbull';

// Initialize the kit with default modules (Albedo, Freighter, etc.)
export const kit = new StellarWalletsKit({
    modules: [
        new AlbedoModule(),
        new FreighterModule(),
        new xBullModule(),
    ],
    network: Networks.TESTNET,
    selectedWalletId: "albedo", // Defaulting to Albedo as requested, but user can change
});

export const walletService = {
    // Connect Wallet (Supports multiple wallets via modal)
    connect: async (): Promise<string> => {
        try {
            await kit.openModal({
                modalTitle: "Connect to ProofPay",
                modalTheme: "light",
            });
            const { address } = await kit.getAddress();
            return address;
        } catch (error) {
            console.error("Wallet connection failed:", error);
            throw error;
        }
    },

    // Get Address (if already connected)
    getAddress: async (): Promise<string | null> => {
        try {
            const { address } = await kit.getAddress();
            return address;
        } catch (error) {
            return null;
        }
    },

    // Sign and Submit Transaction
    // For payments, we construct the XDR and ask the kit to sign it
    sendPayment: async (destination: string, amount: string) => {
        try {
            // Note: In a real production app, we should construct the transaction XDR here using stellar-sdk
            // However, the kit also provides helper methods or we can use the specific wallet's method if exposed.
            // But the most robust way with the kit is to build XDR and call signTransaction.
            
            // For simplicity in this hackathon context and to avoid heavy stellar-sdk deps if possible,
            // we will use the kit's signTransaction.
            // BUT, we first need to build the transaction.
            // Let's assume we use a helper or just rely on the wallet's own "pay" intent if the kit wraps it?
            // The kit abstracts signing. Let's look at the docs provided by the user.
            // User docs say: StellarWalletsKit.signTransaction(tx.toXDR(), ...);
            
            // To do this properly, we need `stellar-sdk` to build the transaction.
            // Since we might not want to refactor everything to include stellar-sdk just yet,
            // let's check if the kit has a "requestPayment" or similar?
            // The docs only show `signTransaction`.
            
            // WAIT! The user specifically said "focus on Albedo only" but "use this documentation so it support multiple".
            // If we use the kit, we MUST build the XDR.
            // Let's import stellar-sdk. It should be installed as a dependency of the kit.
            
            const { TransactionBuilder, Asset, Operation, Networks, Server } = await import('@stellar/stellar-sdk');
            
            const server = new Server('https://horizon-testnet.stellar.org');
            const { address: sourceAddress } = await kit.getAddress();
            
            const account = await server.loadAccount(sourceAddress);
            
            const tx = new TransactionBuilder(account, {
                fee: '100',
                networkPassphrase: Networks.TESTNET
            })
            .addOperation(Operation.payment({
                destination: destination,
                asset: Asset.native(),
                amount: amount
            }))
            .setTimeout(30)
            .build();

            const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
                networkPassphrase: Networks.TESTNET,
                address: sourceAddress
            });

            // Submit the signed transaction
            const result = await server.submitTransaction(new TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET));
            return result;

        } catch (error) {
            console.error("Payment failed:", error);
            throw error;
        }
    }
};
