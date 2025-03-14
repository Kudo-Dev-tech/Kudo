require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios"); // For making API calls
const WebSocket = require("ws");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ws = new WebSocket(process.env.RPC_URL);
const provider = new ethers.WebSocketProvider(ws);

const contractAddress = process.env.CONTRACT_ADDRESS;
const wallet = new ethers.Wallet(
  PRIVATE_KEY,
  new ethers.JsonRpcProvider(process.env.HTTP_RPC_URL)
);

const contractABI = [
  "event CovenantRegistered(bytes32 requestId, address indexed agentWallet, uint256 indexed nftId)",
  "function fulfillRequest(bytes32 requestId, uint128 abilityScore) external",
];

const event = new ethers.Contract(contractAddress, contractABI, provider);

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const filter = contract.filters.CovenantRegistered();

event.on(filter, async (log) => {
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

  let response;

  try {
    await retry(async () => {
      console.log("Calling API...");
      response = await axios.post(apiUrl, requestData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("API call successful...");
    });
  } catch (error) {
    console.log("Error requesting ability point...");
  }

  const abilityScore = BigInt(response.data.abilityScore);

  try {
    await retry(async () => {
      console.log("Calling fulfillRequest...");
      const tx = await contract.fulfillRequest(requestId, abilityScore);
      console.log("Transaction sent, awaiting confirmation...");
      await tx.wait(-1);
      console.log("Transaction confirmed. Fulfilled request...");
    });
  } catch (error) {
    console.error("Error fulfilling request:", error);
  }
});

// WebSocket event handlers
ws.on("open", () => {
  console.log("WebSocket connected. Listening for events...");
  reconnectAttempts = 0; // Reset reconnect attempts on successful connection
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
  reconnectWebSocket();
});

ws.on("close", (code, reason) => {
  console.log(`WebSocket closed: ${code} - ${reason}`);
  reconnectWebSocket();
});

setInterval(async () => {
  try {
    await provider.getBlockNumber(); // Simple request to keep the WebSocket alive
    console.log("Ping sent to WebSocket by requesting block number");
  } catch (error) {
    console.error("WebSocket ping failed:", error);
  }
  console.log("Ping sent to WebSocket");
}, process.env.PING_INTERVAL);

console.log("Listening for events...");

const retry = async (action, maxRetries = process.env.MAX_RETRIES) => {
  let attempts = 0;
  let delay = process.env.RETRY_DELAY;

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

async function reconnectWebSocket() {
  let reconnectAttempts = 0;

  do {
    reconnectAttempts++;

    if (provider) {
      provider.destroy(); // Clean up old provider
      provider = null;
    }

    setupWebSocket();

    await new Promise((resolve) => setTimeout(resolve, delay));
  } while (reconnectAttempts < process.env.MAX_RETRIES);

  console.error("Max reconnect attempts reached. Exiting...");
  process.exit(1);
}
