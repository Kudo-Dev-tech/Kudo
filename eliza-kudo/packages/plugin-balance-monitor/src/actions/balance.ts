import {
    Goal,
    GoalStatus,
    ModelClass,
    composeContext,
    generateObjectDeprecated,
    getGoals,
    stringToUuid,
} from "@elizaos/core";
import { Action, IAgentRuntime, Memory, State } from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";
import { extractMinBalanceTemplate } from "../templates";
import { TOPUP_INSUFFICIENT_BALANCE } from "..";
import { Content } from "@elizaos/core";

export const balanceAction: Action = {
    name: "BALANCE",
    similes: ["KEEP_BALANCE_ABOVE", "ENSURE_BALANCE_GREATER_THAN"],
    suppressInitialMessage: true,
    description:
        "Maintain a balance above an amount of tokens on a chain for trading activities",
    validate: async (runtime: IAgentRuntime) => {
        const goals: Goal[] = (
            await getGoals({
                runtime,
                roomId: stringToUuid("BALANCE_ROOM"),
                onlyInProgress: true,
            })
        ).filter((goal) => goal.name.includes(TOPUP_INSUFFICIENT_BALANCE));

        if (goals.length == 0) return true;
        const lastGoal = goals[goals.length - 1];
        return lastGoal.status == GoalStatus.DONE;
    },
    handler: async (
        runtime: IAgentRuntime,
        _: Memory,
        state: State,
        __,
        callback?: any
    ) => {
        const context = composeContext({
            state,
            template: extractMinBalanceTemplate,
        });

        const response = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            amount: string;
            token: string;
            chain: string;
        };

        const description = `Mint CovenantNFT if agent balance is below ${response.amount} ${response.token} on ${response.chain}`;

        const goal: Goal = {
            roomId: stringToUuid("BALANCE_ROOM"),
            userId: uuidv4() as Goal["userId"],
            name:
                TOPUP_INSUFFICIENT_BALANCE +
                ` ${response.amount} ${response.token}`,
            status: GoalStatus.IN_PROGRESS,
            objectives: [
                {
                    description,
                    completed: false,
                },
            ],
        };

        await runtime.databaseAdapter.createGoal(goal);

        const responseContent: Content = {
            text: `I will try my best to keep my balance above ${response.amount} ${response.token}`,
        };
        callback && callback(responseContent);
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Maintain balance above {{amount}} {{currency}}",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Maintain balance of 100 USDC",
                    action: "BALANCE",
                },
            },
        ],
    ],
};
