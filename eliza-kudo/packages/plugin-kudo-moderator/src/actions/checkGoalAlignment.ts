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
    UUID,
    stringToUuid,
} from "@elizaos/core";
import {smartScraper} from 'scrapegraph-js';

export const moderateGoalPostAction: Action = {
    name: "MODERATE",
    similes: ["CHECK"],
    description: "Checks for post and goal alignment",
    validate: async () => {
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const data = (await publicClient.readContract({
            address: process.env.ARBISCAN_ADDRESS as `0x${string}`,
            abi: moderatorKudoABI,
            functionName: "getCovenantDetails",
            args: ["1"],
        })) as any;

        // Get Covenant Details will get the goal and post

        // Link to Post
        const covPost = "https://x.com/HighyieldHarry/status/1902830412079988746" //data.settlementData;
        const covGoal = "Go to the link to see if the there is a goal alignment for the following goal: 'Write a post about how out of touch Americans are." //data.covenantData.goal;

        // Post and Goal
        //const covPost = "The ETH Token is really great."
        //const covGoal = "Create a post promoting the ETH Token."

        //Extract data
        const covPostURL = covPost.match(/(https?:\/\/[^ ]*)/); // Extract URL
        console.log("The extracted URL from given string is:- " + covPostURL);

        if (covPostURL === null) {

            const state = await runtime.composeState(message, {
                post: covPost,
                goal: covGoal,
            });

            const context = composeContext({
                state,
                template: moderateGoalPostTemplate,
            });

            const response = await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            });

            console.log(response);

            var goal_alignment = response.goal_alignment
        } else {

        const apiKey = process.env.SCRAPE_JS_API_KEY;
        const websiteURL = covPostURL[0];
        const prompt = covGoal
        const response = await smartScraper(apiKey, websiteURL, prompt);
        var goal_alignment = response.result.goal_alignment
        console.log(response.result)
        }

        console.log(goal_alignment.result)

        // setCovenantStatus

        const walletClient = createWalletClient({
            chain: arbitrum,
            transport: http(process.env.ETHEREUM_PROVIDER_ARBITRUM),
        });

        // Local Account
        const account = privateKeyToAccount(
            process.env.PRIVATE_KEY as `0x${string}`
        );

        if (goal_alignment === "Yes"){
            var result = "1"
        } else {
            var result = "2"
        }

        const { request } = await publicClient.simulateContract({
            account,
            address: process.env.ARBISCAN_ADDRESS as `0x${string}`,
            abi: moderatorKudoABI,
            functionName: "setCovenantStatus",
            args: ["1", result], // NFTID, Status (1 (Completed) or 2 (Fail) ) - Arguments: Have to be dynamically put in
        });
        await walletClient.writeContract(request);
    },

    examples: [],
};
