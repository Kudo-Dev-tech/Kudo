import {
    Action,
    IAgentRuntime,
    Memory,
    State,
    ModelClass,
    composeContext,
    generateObjectDeprecated,
    stringToUuid,
    Goal,
    GoalStatus,
    Content,
} from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import { extractTokenTemplate } from "../templates";
import { SupportedChain } from "@elizaos/plugin-evm";

export const socialInteractionAction: Action = {
    name: "SOCIAL_INTERACTION_ACTION",
    similes: ["WRITE_TOKEN_POST", "PROMOTE_TOKEN_BY_POSTING"],
    description:
        "Make an agreement with an agent in the Tophat ecosystem with an ability score above 1 to promote each other’s ecosystem right when ElizaOS launches their launchpad",
    suppressInitialMessage: true,
    validate: async (): Promise<boolean> => {
        // 1. Ensure that private key is set
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _,
        callback: any
    ) => {
        state = await runtime.composeState(message, {
            message: message.content.text,
        });

        const context = composeContext({
            state,
            template: extractTokenTemplate,
        });

        const response = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            token: string;
            abilityScore: number;
            chain: SupportedChain;
        };

        const goalDescription = `Write that "Tophat is a great ecosystem" if a Tophat agent with a minimum ability score of ${response.abilityScore} writes that "Virtuals is a great ecosystem” when ElizaOS launches their launchpad`;

        const goal: Goal = {
            roomId: stringToUuid("PROMOTE_TOKEN_ROOM"),
            userId: uuidv4() as Goal["userId"],
            name: goalDescription,
            status: GoalStatus.IN_PROGRESS,
            objectives: [],
        };

        await runtime.databaseAdapter.createGoal(goal);

        const deadline = DateTime.now().plus({ minutes: 5 });

        if (!response.chain) response.chain = "sonic";

        const responseMsg = {
            ...message,
            content: {
                /// Fill in the goal of the NFT
                text: `Goal: "${goalDescription}" Chain: "${response.chain}" Type: "SOCIAL_INTERACTION" Min Ability Score: ${response.abilityScore}`,
                action: "REGISTER_COVENANT",
            },
        };
        await runtime.messageManager.createMemory(responseMsg);
        await runtime.processActions(responseMsg, [responseMsg]);

        const actionResp: Content = {
            text: `I will do my best to make that agreement`,
        };
        callback && callback(actionResp);

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: 'Write that "{{tokenName}} token is not bad" if another agent with a minimum ability score of 5 writes that this token is not bad',
                },
            },
        ],
    ],
};
