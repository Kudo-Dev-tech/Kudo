import {
    type Client,
    type IAgentRuntime,
    UUID,
    Memory,
    stringToUuid,
    composeContext,
    ModelClass,
    generateMessageResponse,
    getEmbeddingZeroVector,
} from "@elizaos/core";
import {
    SupportedChain,
    WalletProvider,
    initWalletProvider,
} from "@elizaos/plugin-evm";
import {
    ByteArray,
    WalletClient,
    encodeFunctionData,
    getAddress,
    getContract,
} from "viem";
import { COVENANT_NFT_ADDR } from "../constants";
import { extractActionTemplate } from "../templates";
import { KudoABI } from "./KudoABI"

enum CovenantStatus {
    IN_PROGRESS = 0,
    DONE = 1,
    FAILED = 2,
}

export class KudoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;
    roomId: UUID;
    walletProvider: WalletProvider;
    wallet: WalletClient;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // start a loop that runs every x seconds
        this.interval = setInterval(
            async () => {
                this.performActionEvaluateLoop();
                return true;
            },
            5 * 60 * 1000
        ); // 5 minutes in milliseconds
    }

    async getWalletClient() {
        if (!this.wallet) {
            const chain = process.env.EVM_CHAIN as SupportedChain;
            this.walletProvider = await initWalletProvider(this.runtime);
            this.wallet = this.walletProvider.getWalletClient(
                chain || "arbitrum"
            );
        }
        return this.wallet;
    }

    async getCovenant(tokenId: number) {
        const client = await this.getWalletClient();
        const contract = getContract({
            address: getAddress(COVENANT_NFT_ADDR) as `0x${string}`,
            abi: KudoABI,
            client: {
                public: client as never,
            },
        }) as any;

        return await contract.read.getCovenant([tokenId]);
    }

    async settle(tokenId: number) {
        const covenant = await this.getCovenant(tokenId);
        const walletClient = await this.getWalletClient();
        const txnHash = await walletClient.sendTransaction({
            account: walletClient.account,
            to: getAddress(covenant.settlementAsset),
            value: 0,
            data: encodeFunctionData({
                abi: [
                    {
                        type: "function",
                        name: "approve",
                        inputs: [
                            {
                                name: "spender",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "amount",
                                type: "uint256",
                                internalType: "uint256",
                            },
                        ],
                        outputs: [],
                        stateMutability: "nonpayable",
                    },
                ],
                args: [
                    getAddress(COVENANT_NFT_ADDR),
                    covenant.settlementAmount,
                ],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        const publicClient = this.walletProvider.getPublicClient(
            (process.env.EVM_CHAIN as SupportedChain) || "arbitrum"
        );
        await publicClient.waitForTransactionReceipt({
            hash: txnHash,
        });

        const txnTwoHash = await walletClient.sendTransaction({
            account: walletClient.account,
            to: getAddress(COVENANT_NFT_ADDR),
            value: 0,
            data: encodeFunctionData({
                abi: [
                    {
                        "inputs": [
                          {
                            "internalType": "uint256",
                            "name": "nftId",
                            "type": "uint256"
                          },
                          {
                            "internalType": "enum CovenantNFT.CovenantStatus",
                            "name": "status",
                            "type": "uint8"
                          }
                        ],
                        "name": "setCovenantStatus",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                      }
                ],
                args: [tokenId, 1],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        await publicClient.waitForTransactionReceipt({
            hash: txnTwoHash,
        });
    }

    async isRegistered() {
        const client = await this.getWalletClient();
        const contract = getContract({
            address: getAddress(COVENANT_NFT_ADDR) as `0x${string}`,
            abi: KudoABI,
            client: {
                public: client as never,
            },
        }) as any;

        const isRegistered = await contract.read.isAgentRegistered([
            getAddress(client.account.address),
        ]);

        return isRegistered;
    }

    async registerAgent() {
        console.log("Registering Agent...");
        const wallet = await this.getWalletClient();
        const registerAgentHash = await wallet.sendTransaction({
            account: wallet.account,
            to: COVENANT_NFT_ADDR,
            value: 0,
            data: encodeFunctionData({
                abi: [{
                    "inputs": [
                      {
                        "internalType": "string",
                        "name": "teeId",
                        "type": "string"
                      },
                      {
                        "internalType": "string",
                        "name": "agentId",
                        "type": "string"
                      },
                      {
                        "internalType": "string",
                        "name": "agentName",
                        "type": "string"
                      }
                    ],
                    "name": "registerAgent",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }],
                args: [
                    this.runtime.agentId,
                    this.runtime.agentId,
                    this.runtime.character.name,
                ],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        return registerAgentHash;
    }

    async setSettlementData(nftId: number, settlementData: string) {
        const wallet = await this.getWalletClient();

        const txnHash = await wallet.sendTransaction({
            account: wallet.account,
            to: COVENANT_NFT_ADDR,
            value: 0,
            data: encodeFunctionData({
                abi: [
                    {
                        "inputs": [
                          {
                            "internalType": "uint256",
                            "name": "nftId",
                            "type": "uint256"
                          },
                          {
                            "internalType": "string",
                            "name": "data",
                            "type": "string"
                          }
                        ],
                        "name": "setSettlementData",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                      }
                ],
                args: [nftId, settlementData],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        const publicClient = this.walletProvider.getPublicClient(
            (process.env.EVM_CHAIN as SupportedChain) || "arbitrum"
        );
        await publicClient.waitForTransactionReceipt({
            hash: txnHash,
        });
    }

    async getSettlementData(nftId: number) {
        const client = await this.getWalletClient();
        const contract = getContract({
            address: getAddress(COVENANT_NFT_ADDR) as `0x${string}`,
            abi: KudoABI,
            client: {
                public: client as never,
            },
        }) as any;

        const settlementData = await contract.read.s_nftSettlementData([nftId]);
        return settlementData;
    }

    async registerCovenantToParent(
        type: number,
        goal: string,
        parentCovenantId: number,
        settlementAsset: string,
        settlementAmount: string,
        shouldWatch: boolean,
        data: string
    ) {
        const wallet = await this.getWalletClient();

        const registerCovenantHash = await wallet.sendTransaction({
            account: wallet.account,
            to: COVENANT_NFT_ADDR,
            value: 0,
            data: encodeFunctionData({
                abi: [{
                    "inputs": [
                      {
                        "internalType": "enum CovenantNFT.NftType",
                        "name": "nftType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "string",
                        "name": "task",
                        "type": "string"
                      },
                      {
                        "internalType": "uint256",
                        "name": "parentCovenantId",
                        "type": "uint256"
                      },
                      {
                        "internalType": "address",
                        "name": "settlementAsset",
                        "type": "address"
                      },
                      {
                        "internalType": "uint256",
                        "name": "settlementAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "bool",
                        "name": "shouldWatch",
                        "type": "bool"
                      },
                      {
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                      }
                    ],
                    "name": "registerCovenant",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }],
                args: [
                    type,
                    goal,
                    parentCovenantId,
                    getAddress(settlementAsset),
                    settlementAmount,
                    shouldWatch,
                    data,
                ],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        return registerCovenantHash;
    }

    async registerCovenant(
        type: number,
        goal: string,
        settlementAsset: string,
        settlementAmount: string,
        price: string,
        data: string,
        shouldWatch: boolean = true,
        minAbilityScore = BigInt(0)
    ) {
        const wallet = await this.getWalletClient();

        const registerCovenantHash = await wallet.sendTransaction({
            account: wallet.account,
            to: COVENANT_NFT_ADDR,
            value: 0,
            data: encodeFunctionData({
                abi: [{
                    "inputs": [
                      {
                        "internalType": "enum CovenantNFT.NftType",
                        "name": "nftType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "string",
                        "name": "task",
                        "type": "string"
                      },
                      {
                        "internalType": "address",
                        "name": "settlementAsset",
                        "type": "address"
                      },
                      {
                        "internalType": "uint256",
                        "name": "settlementAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minAbilityScore",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                      },
                      {
                        "internalType": "bool",
                        "name": "shouldWatch",
                        "type": "bool"
                      },
                      {
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                      }
                    ],
                    "name": "registerCovenant",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }],
                args: [
                    type,
                    goal,
                    getAddress(settlementAsset),
                    settlementAmount,
                    minAbilityScore,
                    price,
                    shouldWatch,
                    data,
                ],
            }),
            kzg: {
                blobToKzgCommitment: function (_: ByteArray): ByteArray {
                    throw new Error("Function not implemented.");
                },
                computeBlobKzgProof: function (
                    _blob: ByteArray,
                    _commitment: ByteArray
                ): ByteArray {
                    throw new Error("Function not implemented.");
                },
            },
            chain: undefined,
        });

        return registerCovenantHash;
    }

    async getCovenants() {
        const client = await this.getWalletClient();
        const contract = getContract({
            address: getAddress(COVENANT_NFT_ADDR) as `0x${string}`,
            abi: KudoABI,
            client: {
                public: client as never,
            },
        }) as any;

        const covenants = await contract.read.getAgentCovenantsData([
            getAddress(client.account.address),
        ]);

        return covenants.filter(
            (c) => c.status === CovenantStatus.IN_PROGRESS && !!c.goal
        );
    }

    async performActionEvaluateLoop() {
        const covenants = await this.getCovenants();


        for (const covenant of covenants) {
            const message: Memory = {
                agentId: this.runtime.agentId,
                userId: stringToUuid("Kudo"),
                roomId: stringToUuid("Kudo-Room"),
                content: {
                    text: `NFT ID: ${covenant.nftId}, Goal: ${covenant.goal}`,
                },
            };

            await this.runtime.messageManager.createMemory(message);
            const state = await this.runtime.composeState(message, {
                goal: covenant.goal,
            });

            const context = composeContext({
                state,
                template: extractActionTemplate,
            });

            const content = await generateMessageResponse({
                runtime: this.runtime,
                context,
                modelClass: ModelClass.LARGE,
            });

            const responseMsg: Memory = {
                userId: message.userId,
                agentId: message.agentId,
                roomId: message.roomId,
                content
            };

            await this.runtime.processActions(message, [responseMsg], state);
            await this.runtime.evaluate(message, state);
        }
        return 0;
    }
}

export const KudoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        await runtime.databaseAdapter.removeAllGoals(
            stringToUuid("BALANCE_ROOM")
        );
        console.log("Starting Kudo Client");
        const client = new KudoClient(runtime);
        if (!(await client.isRegistered())) {
            await client.registerAgent();
        }
        await client.performActionEvaluateLoop();
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoClientInterface;
