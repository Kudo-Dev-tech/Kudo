import { DateTime } from "luxon";
import { COVENANT_NFT_ADDR } from "../constants";
import { Seaport } from "@opensea/seaport-js";
import { DeriveKeyProvider } from "@elizaos/plugin-tee";
import { IAgentRuntime } from "@elizaos/core";
import { WalletClient, keccak256 } from "viem";

export class OpenSeaClient {
    private walletClient: WalletClient;
    private runtime: IAgentRuntime;

    constructor(walletClient: WalletClient, runtime: IAgentRuntime) {
        this.walletClient = walletClient;
        this.runtime = runtime;
    }

    async list(
        tokenId: number,
        duration: number,
        tokenAddress: string,
        listPrice: string,
        recipient: string
    ) {
        // TODO:  Derive opensea and list price.  Opensea fee is 2.5%
        const walletSecretSalt = this.runtime.getSetting("WALLET_SECRET_SALT");
        if (!walletSecretSalt) {
            throw new Error(
                "WALLET_SECRET_SALT required when TEE_MODE is enabled"
            );
        }
        const deriveKeyProvider = new DeriveKeyProvider(
            process.env.TEE_MODE || "LOCAL"
        );
        const deriveKeyResponse = await deriveKeyProvider.rawDeriveKey(
            "/agent",
            walletSecretSalt
        );
        const privateKey = keccak256(deriveKeyResponse.asUint8Array());

        const startTime = DateTime.now().toUnixInteger() / 1000;
        const endTime = startTime + duration;
        const order = {
            orderType: 0,
            conduitKey:
                "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000" as `0x${string}`,
            salt: BigInt(
                "0x7465737400000000000000000000000000000000000000000000000000000000"
            ),
            zoneHash:
                "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
            startTime: BigInt(startTime),
            endTime: BigInt(endTime),
            totalOriginalConsiderationItems: BigInt(2),
            counter: BigInt("0"),
            zone: "0x0000000000000000000000000000000000000000" as `0x${string}`,
            offer: [
                {
                    itemType: 2,
                    token: COVENANT_NFT_ADDR as `0x${string}`,
                    startAmount: BigInt(1),
                    endAmount: BigInt(1),
                    identifierOrCriteria: BigInt(tokenId),
                },
            ],
            consideration: [
                {
                    itemType: 1,
                    token: tokenAddress as `0x${string}`,
                    startAmount: BigInt("9750000"),
                    endAmount: BigInt("9750000"),
                    recipient: recipient as `0x${string}`,
                    identifierOrCriteria: BigInt(0),
                },
                {
                    itemType: 1,
                    token: tokenAddress as `0x${string}`,
                    identifierOrCriteria: BigInt(0),
                    startAmount: BigInt("250000"),
                    endAmount: BigInt("250000"),
                    recipient:
                        "0x0000a26b00c1f0df003000390027140000faa719" as `0x${string}`,
                },
            ],
            offerer:
                "0xfAAB3B74DA4595275B777B6c81745b601fdC0Dfa" as `0x${string}`,
        };

        const signature = await this.walletClient.signTypedData({
            account: privateKey,
            domain: {
                name: "Seaport",
                version: "1.6", // Seaport version
                chainId: 84532,
                verifyingContract: "0x0000000000000068F116a894984e2DB1123eB395", // Seaport contract
            },
            types: {
                OrderComponents: [
                    { name: "offerer", type: "address" },
                    { name: "zone", type: "address" },
                    { name: "offer", type: "OfferItem[]" },
                    { name: "consideration", type: "ConsiderationItem[]" },
                    { name: "orderType", type: "uint8" },
                    { name: "startTime", type: "uint256" },
                    { name: "endTime", type: "uint256" },
                    { name: "zoneHash", type: "bytes32" },
                    { name: "salt", type: "uint256" },
                    { name: "conduitKey", type: "bytes32" },
                    { name: "counter", type: "uint256" },
                ],
                OfferItem: [
                    { name: "itemType", type: "uint8" },
                    { name: "token", type: "address" },
                    { name: "identifierOrCriteria", type: "uint256" },
                    { name: "startAmount", type: "uint256" },
                    { name: "endAmount", type: "uint256" },
                ],
                ConsiderationItem: [
                    { name: "itemType", type: "uint8" },
                    { name: "token", type: "address" },
                    { name: "identifierOrCriteria", type: "uint256" },
                    { name: "startAmount", type: "uint256" },
                    { name: "endAmount", type: "uint256" },
                    { name: "recipient", type: "address" },
                ],
            },
            primaryType: "OrderComponents",
            message: order,
        });

        await fetch(
            "https://testnets-api.opensea.io/api/v2/orders/base_sepolia/seaport/listings",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parameters: order,
                    protocol_address:
                        "0x0000000000000068f116a894984e2db1123eb395",
                    signature,
                }),
                redirect: "follow",
            }
        );
    }
}
