import {
    Action,
    IAgentRuntime,
    Memory,
    State,
    ModelClass,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
} from "@elizaos/core";
import { extractTweetAndNFTID, extractIsValidSubject, extractTargetCovenantNFTID } from "../templates";
import { kudoClient } from "@elizaos/plugin-kudo";

export const verifyAction: Action = {
    name: "VERIFY_ACTION",
    similes: [],
    description: `Write that "Tophat is a great ecosystem" if an agent with a minimum ability score writes that "Virtuals is a great ecosystem” when ElizaOS launches their launchpad`,
    validate: async (): Promise<boolean> => {
        // 1. Ensure that private key is set
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {

        state = await runtime.composeState(message, {
            message: message.content.text
        })

        const context = composeContext({
            state,
            template: extractTargetCovenantNFTID
        })

        const { targetCovenantID } =
            (await generateObjectDeprecated({
                runtime,
                context: context,
                modelClass: ModelClass.LARGE,
            })) as {
                targetCovenantID: number
            };

        const kudo = new kudoClient.KudoClient(runtime);
        const covenant = await kudo.getCovenant(targetCovenantID)
        const subgoalIds = covenant.subgoalsId
        for (const subgoal of subgoalIds) {
            const settlementData = await kudo.getSettlementData(subgoal)

            if (!settlementData) return

            state = await runtime.composeState(message, {
                message: settlementData
            })
            const isValidContext = composeContext({
                state,
                template: extractIsValidSubject,
            });

            const { hasMetMinimumLength, isPromotingToken } =
                (await generateObjectDeprecated({
                    runtime,
                    context: isValidContext,
                    modelClass: ModelClass.LARGE,
                })) as {
                    hasMetMinimumLength: boolean;
                    isPromotingToken: boolean;
                };

            if (!hasMetMinimumLength || !isPromotingToken) return

            await kudo.settle(subgoal)
        }

        await kudo.setSettlementData(targetCovenantID, "Tophat is a great ecosystem")
        await kudo.settle(targetCovenantID);

        return false;
    },
    examples: [],
};
