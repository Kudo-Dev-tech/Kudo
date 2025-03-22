// Under Construction

import { moderatorKudoABI } from "./moderatorKudoABI";
import { Client, IAgentRuntime, stringToUuid } from "@elizaos/core";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { Memory } from "@elizaos/core";

export const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(
        "https://arb-mainnet.g.alchemy.com/v2/Q5TxpTVf_JI2DtOAgZuy17s0Ln2HDrt7"
    ),
});

async function watchContractEvent(runtime: IAgentRuntime) {
    // Watch an Event

    const watcher = publicClient.watchContractEvent({
        address: "0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8",
        abi: moderatorKudoABI,
        onLogs: async (logs) => {
            const responseMsg: Memory = {
                userId: runtime.agentId,
                agentId: runtime.agentId,
                roomId: stringToUuid("roomIdWatchContractEvent"),
                content: {
                    /// Fill in the goal of the NFT
                    text: `Check the goal alignment."`,
                    action: "MODERATE",
                },
            };

            await runtime.messageManager.createMemory(responseMsg);
            await runtime.processActions(responseMsg, [responseMsg]);
        },
    });
}

export const KudoModeratorClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        await watchContractEvent(runtime);
        return null;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoModeratorClientInterface;
