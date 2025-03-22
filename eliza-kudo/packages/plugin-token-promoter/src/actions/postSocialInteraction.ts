import {
    Action,
    GoalStatus,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
    stringToUuid,
} from "@elizaos/core";
import { initWalletProvider } from "@elizaos/plugin-evm";
import { SupportedChain, kudoClient } from "@elizaos/plugin-kudo";
import { extractSocialInteractionTargetTemplate } from "../templates";
import { DateTime } from "luxon";

const generateTemplate = (message: string): string => {
    return `
        You are an AI Agent that specialized in extracting the maturity date of a task.
        Your task is to extract the maturity date from the statement below and output the day, month,
        year, hours, minutes and timezone.  All fields are required

        "${message}"

        Please fill in the object below by assigning the relevant fields

        \`\`\`json
            {
                "day": number,
                "month": number,
                "year": number,
                "hours": number,
                "minutes": number,
                "timezone": string
            }
        \`\`\`
    `;
};

export const postSocialInteraction: Action = {
    name: "POST_SOCIAL_INTERACTION",
    similes: ["POST_TWITTER"],
    description: "Write post saying that an ecosystem is great",
    validate: async () => {
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        state = await runtime.composeState(message, {
            message: message.content.text,
        });

        const context = composeContext({
            state,
            template: extractSocialInteractionTargetTemplate,
        });

        const { post, nftId, chain } = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            post: string;
            nftId: number;
            chain: SupportedChain;
        };

        const kudo = new kudoClient.KudoClient(runtime, chain);
        const settlementData = await kudo.getSettlementData(nftId);
        if (!settlementData) {
            await kudo.setSettlementData(nftId, post);
        }
    },
    examples: [[]],
};
