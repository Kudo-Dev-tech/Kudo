require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios"); // For making API calls

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.WebSocketProvider(process.env.RPC_URL);

const contractAddress = process.env.CONTRACT_ADDRESS;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contractABI = [
  "event CovenantRegistered(bytes32 requestId, address indexed agentWallet, uint256 indexed nftId)",
  "function fulfillRequest(bytes32 requestId, uint128 abilityScore) external",
];

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const filter = contract.filters.CovenantRegistered();

contract.on(filter, async (log) => {
  console.log("Event detected");
  console.log("Request ID:", log.args[0]);
  console.log("Agent Wallet", log.args[1]);

  const requestId = log.args[0];
  const agentWallet = log.args[1];

  const apiUrl = process.env.API_URL;
  const requestData = {
    address: agentWallet,
    minAbilityScore: 0,
  };

  const response = await axios.post(apiUrl, requestData, {
    headers: { "Content-Type": "application/json" },
  });

  const abilityScore = response.data.abilityScore;

  try {
    await retry(async () => {
      console.log("Calling fulfillRequest...");
      const tx = await contract.fulfillRequest(requestId, abilityScore);
      console.log("Transaction sent, awaiting confirmation...");
      await tx.wait(-1);
      console.log("Transaction confirmed. Fulfilled request.");
    });
  } catch (error) {
    console.error("Error fulfilling request:", error);
  }
});

console.log("Listening for events...");

const retry = async (action, maxRetries = process.env.MAX_RETRIES) => {
  let attempts = 0;
  let delay = 1000;

  do {
    try {
      return await action();
    } catch (error) {
      attempts++;
      console.error("Error fulfilling request:", error);
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  } while (attempts < maxRetries);

  throw new Error("Failed");
};
