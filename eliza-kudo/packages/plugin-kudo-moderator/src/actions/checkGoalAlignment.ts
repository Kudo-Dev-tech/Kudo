import { publicClient } from "../clients/moderatorKudo";
import { moderatorKudoABI } from "../clients/moderatorKudoABI";
import { createPublicClient, http } from "viem";
import { createWalletClient } from "viem";
import { arbitrum } from "viem/chains";
import {
    moderateGoalPostTemplate,
    moderateMessageFooter,
} from "../templates/index.ts";
import { privateKeyToAccount } from "viem/accounts";
import {
    Action,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";
import { smartScraper } from "scrapegraph-js";

enum CovenantStatus {
    COMPLETED = 1,
    FAILED = 2,
}

export const moderateGoalPostAction: Action = {
    name: "MODERATE",
    similes: ["CHECK"],
    description: "Checks for post and goal alignment",
    validate: async () => {
        return true;
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        const { nftId } = (await generateObjectDeprecated({
            runtime,
            context: `
                Determine the nftId to analyze based on the sentence below

                ${message.content.text}

                Output your response as a JSON as shown below

                \`\`\`json
                {
                    "nftId": number
                }
                \`\`\`

            `,
            modelClass: ModelClass.LARGE,
        })) as {
            nftId: number;
        };

        console.log(`Checking goal alignment for NFT with ID ${nftId}`);

        const data = (await publicClient.readContract({
            address: process.env
                .ARBITRUM_ONE_COVENANT_NFT_ADDR as `0x${string}`,
            abi: moderatorKudoABI,
            functionName: "getCovenantDetails",
            args: [nftId],
        })) as {
            settlementData: string;
            covenantData: {
                goal: string;
            };
        };

        const covPostURL = data.settlementData.match(/(https?:\/\/[^ ]*)/);
        console.log("The extracted URL from given string is:- " + covPostURL);

        let response = {
            isAligned: false,
        };
        if (covPostURL) {
            const smartScraperResponse = await smartScraper(
                process.env.SCRAPE_JS_API_KEY,
                covPostURL[0],
                `Go to the link and check if the goal has been achieved or not.

                Goal: ${data.covenantData.goal}
                ` + moderateMessageFooter
            );

            response = smartScraperResponse.result;
        } else {
            const context = composeContext({
                state: {
                    ...state,
                    post: data.settlementData,
                    goal: data.covenantData.goal,
                },
                template: moderateGoalPostTemplate,
            });

            response = await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            });
        }

        console.log("Goal is aligned: ", response.isAligned);

        const walletClient = createWalletClient({
            chain: arbitrum,
            transport: http(process.env.ETHEREUM_PROVIDER_ARBITRUM),
        });

        const account = privateKeyToAccount(
            process.env.EVM_PRIVATE_KEY as `0x${string}`
        );

        const result = response.isAligned
            ? CovenantStatus.COMPLETED
            : CovenantStatus.FAILED;

        console.log(`Setting covenant status to ${result} for nftId ${nftId}`);

        const { request } = await publicClient.simulateContract({
            account,
            address: process.env
                .ARBITRUM_ONE_COVENANT_NFT_ADDR as `0x${string}`,
            abi: moderatorKudoABI,
            functionName: "setCovenantStatus",
            args: [nftId, result],
        });
        await walletClient.writeContract(request);
    },

    examples: [],
};
