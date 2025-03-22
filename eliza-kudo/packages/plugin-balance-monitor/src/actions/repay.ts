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
import { extractRepaymentParamsTemplate } from "../templates";
import { DateTime } from "luxon";
import { SupportedChain } from "@elizaos/plugin-kudo";

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

export const repayAction: Action = {
    name: "REPAY",
    similes: [
        "REPAY_LOAN",
        "LOAN_REPAYMENT",
        "REPAY_COVENANT_NFT",
        "COVENANT_NFT_REPAYMENT",
    ],
    description:
        "Repay some USDC at a certain time after borrowing some amount of USDC",
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
            template: extractRepaymentParamsTemplate,
        });

        const settleParams = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            amount: string;
            nftId: number;
            chain: SupportedChain;
        };

        const kudo = new kudoClient.KudoClient(
            runtime,
            settleParams.chain || "sonic"
        );
        await kudo.settle(settleParams.nftId);
    },
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Repay 1 USDC on 01-23-2025",
                },
            },
            {
                user: "user1",
                content: {
                    text: "Goal: Repay 1 USDC on 01-23-2025 to owner of CovenantNFT",
                },
            },
            {
                user: stringToUuid("Kudo"),
                content: {
                    text: "Goal: Repay 5 USDC on 01-23-2025 17:43 Asia/Jakarta Token Address: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 Amount: 5000000",
                },
            },
        ],
    ],
};
