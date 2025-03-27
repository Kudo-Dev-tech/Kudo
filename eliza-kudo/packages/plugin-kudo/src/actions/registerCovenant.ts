import {
    Action,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";
import { KudoClient } from "../clients/kudoClient";
import { extractGoalMessageTemplate } from "../templates";
import { SupportedChain, initWalletProvider } from "..";
import { parseEther } from "viem";

export const registerCovenantAction: Action = {
    name: "REGISTER_COVENANT",
    similes: ["REGISTER_GOAL", "CREATE_COVENANT", "MAKE_NEW_GOAL"],
    description: "Creates a new covenant in order to achieve another goal",
    validate: async () => {
        // 1. Ensure that private key is set
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        const context = composeContext({
            state,
            template: extractGoalMessageTemplate,
        });

        const {
            tokenAddress,
            settlementAmount,
            type,
            price,
            goal,
            minAbilityScore,
            chain,
        } = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            goal: string;
            data: string | null;
            tokenAddress: string;
            settlementAmount: string;
            price: string;
            type: "LOAN" | "SOCIAL_INTERACTION";
            minAbilityScore: number;
            chain: SupportedChain;
        };

        const kudoClient = new KudoClient(runtime, chain);
        const isSocialInteraction = type.toUpperCase() === "SOCIAL_INTERACTION";
        const covenantMinAbilityScore = parseEther(
            (minAbilityScore || 0).toString(),
            "wei"
        );

        await kudoClient.registerCovenant(
            isSocialInteraction ? 0 : 1,
            goal,
            tokenAddress || "0x0000000000000000000000000000000000000000",
            settlementAmount || "0",
            price || "0",
            "0x",
            !isSocialInteraction,
            covenantMinAbilityScore
        );

        return 0;
    },
    examples: [],
};
