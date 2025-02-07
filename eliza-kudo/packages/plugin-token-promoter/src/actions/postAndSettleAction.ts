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
import { kudoClient } from "@elizaos/plugin-kudo";
import { extractSocialInteractionTargetTemplate } from "../templates";
import { DateTime } from "luxon";

const generateTemplate = (message: string): string => {
    return `
        You are an AI Agent that specialized in extracting the maturity date of a loan.
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
    name: "POST_AND_SETTLE",
    similes: ["POST_TWITTER"],
    description: "Make a post on twitter ",
    validate: async () => {
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        const maturityDateContext = composeContext({
            state,
            template: generateTemplate(message.content.text),
        });

        const { day, month, year, hours, minutes, timezone } =
            (await generateObjectDeprecated({
                runtime,
                context: maturityDateContext,
                modelClass: ModelClass.LARGE,
            })) as {
                day: number;
                month: number;
                year: number;
                hours: number;
                minutes: number;
                timezone: string;
            };

        const maturityDate = DateTime.fromObject(
            { day, month, year, hours, minutes },
            { zone: timezone, numberingSystem: "beng" }
        );
        const now = DateTime.now().setZone(timezone);

        if (maturityDate.toUnixInteger() > now.toUnixInteger()) return;

        const context = composeContext({
            state,
            template: extractSocialInteractionTargetTemplate,
        });

        const { post, nftId } = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            post: string;
            nftId: number;
        };

        console.log("POST", post);
        console.log("NFTID", nftId);

        const walletProvider = await initWalletProvider(runtime);
        walletProvider.switchChain(process.env.EVM_CHAIN as any);

        const kudo = new kudoClient.KudoClient(runtime);
        await kudo.setSettlementData(nftId, post);
        await kudo.settle(nftId);
    },
    examples: [[]],
};
