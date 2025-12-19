
/**
 * Formats a Soroban/Stellar error into a human-readable string.
 */
export function formatError(error: any): string {
  if (!error) return "Unknown error occurred";

  const msg = error.message || error.toString();

  // User rejection
  if (msg.includes("User rejected") || msg.includes("User declined")) {
    return "Transaction cancelled by user.";
  }

  // Soroban Host Errors
  if (msg.includes("Error(10)")) {
    return "Fund already exists or ID collision.";
  }
  if (msg.includes("Error(11)")) {
    return "Fund is not initialized.";
  }
  
  // Custom Contract Errors (if we had specific error codes defined in Rust)
  // For now, we map common patterns.

  // Network/RPC Errors
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return "Network connection failed. Please check your internet or the Soroban RPC status.";
  }
  if (msg.includes("Transaction expired")) {
    return "Transaction time-bound expired. Please try again.";
  }
  if (msg.includes("tx failed")) {
    return "Transaction failed during simulation or execution. Check inputs and balance.";
  }

  // Fallback cleanup
  // Remove "Error: " prefix if present
  return msg.replace(/^Error:\s*/, "");
}
