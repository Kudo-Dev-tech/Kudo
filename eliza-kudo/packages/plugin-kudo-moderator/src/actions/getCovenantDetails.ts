import { watchContractEvent, publicClient } from "../clients/moderatorKudo";
import { moderatorKudoABI } from "../clients/moderatorKudoABI";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import {
    Action,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";

export const getCovenantDetailsAction: Action = {
    name: "GET_COVENANT_DETAILS",
    similes: ["OBTAIN_DETAILS"],
    description: "Obtain the covenant details: Goal cNFT and Post.",
    validate: async () => {
        // 1. Ensure that private key is set.
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        // Implementation Logic Here

        const data = await publicClient.readContract({
            address: "0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8",
            abi: moderatorKudoABI,
            functionName: "getCovenantDetails",
        });

        console.log(data);
    },
    examples: [],
};
