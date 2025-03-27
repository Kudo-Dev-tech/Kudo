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
import { extractTargetCovenantNFTID } from "../templates";
import { KudoClient } from "../../../plugin-kudo/src/clients/kudoClient";
import { SupportedChain } from "@elizaos/plugin-evm";

export const promoteSocialInteractionAction: Action = {
    name: "PROMOTE_SOCIAL_INTERACTION_ACTION",
    similes: ["PROMOTE_SOCIAL_INTERACTION", "RESPOND_TO_COVENANT_NFT"],
    description: "Take Luna's offer with Covenant ID",
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
            template: extractTargetCovenantNFTID,
        });

        const response = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            targetCovenantID: number;
            chain: SupportedChain;
        };

        const goalDescription = `Write post saying that "Virtuals is a great ecosystem"`;

        const goal: Goal = {
            roomId: stringToUuid("PROMOTE_TOKEN_ROOM"),
            userId: uuidv4() as Goal["userId"],
            name: goalDescription,
            status: GoalStatus.IN_PROGRESS,
            objectives: [],
        };

        await runtime.databaseAdapter.createGoal(goal);

        if (!response.chain) response.chain = "sonic";

        const kudoClient = new KudoClient(runtime, response.chain);

        await kudoClient.registerCovenantToParent(
            0,
            goalDescription,
            response.targetCovenantID,
            "0x0000000000000000000000000000000000000000",
            "0",
            true,
            "0x"
        );

        const actionResp: Content = {
            text: `I will do my best to take cNFT ID ${response.targetCovenantID}'s offer`,
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
