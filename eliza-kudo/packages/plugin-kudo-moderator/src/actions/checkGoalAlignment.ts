import { publicClient } from "../clients/moderatorKudo";
import { moderatorKudoABI } from "../clients/moderatorKudoABI";
import { createPublicClient, http } from "viem";
import { createWalletClient } from "viem";
import { arbitrum } from "viem/chains";
import { moderateGoalPostTemplate } from "../templates/index.ts";
import { privateKeyToAccount } from "viem/accounts";
import {
    Action,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
    type Client,
    UUID,
    stringToUuid,
} from "@elizaos/core";

export const moderateGoalPostAction: Action = {
    name: "MODERATE",
    similes: ["CHECK"],
    description: "Checks for post and goal alignment",
    validate: async () => {
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        console.log("Hello World! checkGoalAlignment");
        const data = (await publicClient.readContract({
            address: "0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8",
            abi: moderatorKudoABI,
            functionName: "getCovenantDetails",
            args: ["1"],
        })) as any;

        console.log(data);

        // Get Covenant Details will get the goal and post

        const covPost = data.settlementData;
        const covGoal = data.covenantData.goal;

        const state = await runtime.composeState(message, {
            post: covPost,
            goal: covGoal,
        });

        const context = composeContext({
            state,
            template: moderateGoalPostTemplate,
        });

        const verdict = await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        });

        console.log(verdict);

        // transmitVerdict

        const walletClient = createWalletClient({
            chain: arbitrum,
            transport: http(process.env.ETHEREUM_PROVIDER_ARBITRUM as string),
        });

        // Local Account
        const account = privateKeyToAccount(
            process.env.PRIVATE_KEY as `0x${string}`
        );

        const { request } = await publicClient.simulateContract({
            account,
            address: "0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8",
            abi: moderatorKudoABI,
            functionName: "setCovenantStatus",
            args: ["1", "2"], // NFTID, Status (1 or 2) - Arguments: Have to be dynamically put in
        });
        await walletClient.writeContract(request);
    },

    examples: [],
};
