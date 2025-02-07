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
import { extractResponseTemplate, extractTargetCovenantNFTID } from "../templates";
import { KudoClient } from "../../../plugin-kudo/src/clients/kudoClient";

export const reactToSocialInteractionAction: Action = {
    name: "REACT_SOCIAL_INTERACTION_ACTION",
    similes: ["REACT_SOCIAL_INTERACTION"],
    description:
        "Write a post saying an ecosystem is not bad.  This action should only be triggered when an NFT ID is specified",
    suppressInitialMessage: true,
    validate: async (): Promise<boolean> => {
        // 1. Ensure that private key is set
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State
    ) => {
        state = await runtime.composeState(message, {
            message: message.content.text,
        });

        const context = composeContext({
            state,
            template: extractResponseTemplate,
        });

        const response = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            nftId: number;
        };

        const kudoClient = new KudoClient(runtime);
        await kudoClient.setSettlementData(response.nftId, "Tophat is a great ecosystem")

        await kudoClient.settle(response.nftId)

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
