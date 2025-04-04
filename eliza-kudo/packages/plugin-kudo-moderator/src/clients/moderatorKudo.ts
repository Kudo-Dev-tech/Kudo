import { moderatorKudoABI } from "./moderatorKudoABI";
import { Client, IAgentRuntime, stringToUuid } from "@elizaos/core";
import { createPublicClient, decodeAbiParameters, http } from "viem";
import { arbitrum } from "viem/chains";
import { Memory } from "@elizaos/core";

export const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(process.env.ETHEREUM_PROVIDER_ARBITRUM),
});

async function watchContractEvent(runtime: IAgentRuntime) {
    // Watch an Event

    const watcher = publicClient.watchContractEvent({
        address: process.env.ARBITRUM_ONE_COVENANT_NFT_ADDR as `0x${string}`,
        abi: moderatorKudoABI,
        onLogs: async (logs: any[]) => {
            const evt = logs.find(
                (log) => log.eventName === "SettlementDataSet"
            );

            if (!evt) return

            const nftId = evt.args.nftId;

            const responseMsg: Memory = {
                userId: runtime.agentId,
                agentId: runtime.agentId,
                roomId: stringToUuid("roomIdWatchContractEvent"),
                content: {
                    /// Fill in the goal of the NFT
                    text: `Check the goal alignment for the NFT with ID ${nftId}`,
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
