
import { api } from "../shared/routes";
import { insertFundSchema } from "../shared/schema";

const BASE_URL = "http://localhost:5000";

async function runTest() {
  console.log("Starting API Flow Test...");

  // 1. Create Fund
  console.log("\n1. Creating Fund...");
  const fundData = {
    funderAddress: "G_FUNDER_123",
    beneficiaryAddress: "G_STUDENT_456",
    verifierAddress: "G_VERIFIER_789",
    amount: "500",
    conditions: "Test Condition",
    deadline: "2025-12-31",
    requiredDocuments: "Doc1"
  };

  const createRes = await fetch(`${BASE_URL}${api.funds.create.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fundData)
  });

  if (!createRes.ok) {
    console.error("Create failed:", await createRes.text());
    return;
  }
  const fund = await createRes.json();
  console.log("Fund created:", fund.id, fund.status);

  // 2. List Funds (Beneficiary View)
  console.log("\n2. Listing Funds (Beneficiary)...");
  // Test without address to see if it returns all
  const listRes = await fetch(`${BASE_URL}${api.funds.list.path}?role=Beneficiary`);
  const funds = await listRes.json();
  const myFund = funds.find((f: any) => f.id === fund.id);
  
  if (myFund) {
    console.log("Fund found in list:", myFund.id);
  } else {
    console.error("Fund NOT found in list!");
  }

  // 3. Submit Proof
  console.log("\n3. Submitting Proof...");
  const proofRes = await fetch(`${BASE_URL}${api.funds.submitProof.path.replace(':id', fund.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proofDescription: "Here is my proof",
      ipfsHash: "QmHash123"
    })
  });

  if (!proofRes.ok) {
    console.error("Submit proof failed:", await proofRes.text());
    return;
  }
  const submittedFund = await proofRes.json();
  console.log("Proof submitted. New Status:", submittedFund.status);

  // 4. Verify and Release
  console.log("\n4. Verifying and Releasing...");

  // Check if Verifier can see the fund (simulating mismatched address by not sending one, or sending a wrong one if we were testing strictness)
  // The useFunds hook now omits address for Verifier, so we test fetching without address
  const verifierListRes = await fetch(`${BASE_URL}${api.funds.list.path}?role=Verifier`);
  const verifierFunds = await verifierListRes.json();
  const foundForVerifier = verifierFunds.find((f: any) => f.id === fund.id);
  
  if (foundForVerifier) {
    console.log("Fund visible to Verifier (Good)");
  } else {
    console.error("Fund NOT visible to Verifier!");
  }

  const verifyRes = await fetch(`${BASE_URL}${api.funds.verify.path.replace(':id', fund.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "Released"
    })
  });

  if (!verifyRes.ok) {
    console.error("Verify failed:", await verifyRes.text());
    return;
  }
  const verifiedFund = await verifyRes.json();
  console.log("Fund verified. Final Status:", verifiedFund.status);

  if (verifiedFund.status === "Released") {
    console.log("\nSUCCESS: Full flow completed!");
  } else {
    console.error("\nFAILURE: Status is not Released");
  }
}

runTest().catch(console.error);
