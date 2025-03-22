import {
    GoalStatus,
    Memory,
    ModelClass,
    composeContext,
    generateObjectDeprecated,
    getGoals,
    stringToUuid,
    updateGoal,
} from "@elizaos/core";
import { Goal } from "@elizaos/core";
import { State } from "@elizaos/core";
import { IAgentRuntime } from "@elizaos/core";
import { Evaluator } from "@elizaos/core";
import { initWalletProvider } from "@elizaos/plugin-evm";
import { formatUnits, parseUnits } from "viem";
import { extractMinBalanceTemplate } from "../templates";
import { TOPUP_INSUFFICIENT_BALANCE } from "..";
import { DateTime } from "luxon";
import { HandlerCallback } from "@elizaos/core";

const DEFAULT_CHAIN = "ARBITRUM";
const DEFAULT_TOKEN = 6;

const CONTRACT_ADDRESSES = {
    ARBITRUM: {
        USDC: {
            address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            decimals: 6,
        },
    },
    SONIC: {
        USDC: {
            address: "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            decimals: 6,
        },
    },
    INJEVM: {
        USDC: {},
    },
};

export const balanceEvaluator: Evaluator = {
    name: "TOKEN_BALANCE",
    similes: [],
    description: "",
    alwaysRun: true,
    validate: async (runtime: IAgentRuntime) => {
        const goals: Goal[] = await getGoals({
            runtime,
            roomId: stringToUuid("BALANCE_ROOM"),
            onlyInProgress: true,
        });

        return (
            goals.filter((goal) =>
                goal.name.includes(TOPUP_INSUFFICIENT_BALANCE)
            ).length > 0
        );
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        const goals: Goal[] = (
            await getGoals({
                runtime,
                roomId: stringToUuid("BALANCE_ROOM"),
                onlyInProgress: true,
            })
        ).filter((goal) => goal.name.includes(TOPUP_INSUFFICIENT_BALANCE));

        const lastGoal = goals[goals.length - 1];

        /// Skip if objective one has been completed i.e NFT has been minted
        if (lastGoal.objectives[0].completed) return;

        const context = composeContext({
            state,
            template: extractMinBalanceTemplate,
        });

        const goalObj = (await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        })) as {
            amount: string;
            chain: string | null;
            token: string | null;
            tokenDecimals: number;
            tokenAddress: string;
        };

        goalObj.tokenAddress =
            CONTRACT_ADDRESSES[goalObj.chain.toUpperCase() || DEFAULT_CHAIN][
                goalObj.token.toUpperCase() || DEFAULT_TOKEN
            ].address;
        goalObj.tokenDecimals =
            CONTRACT_ADDRESSES[goalObj.chain.toUpperCase() || DEFAULT_CHAIN][
                goalObj.token.toUpperCase() || DEFAULT_TOKEN
            ].decimals;

        const wallet = await initWalletProvider(runtime);
        const walletBalance = await wallet.getWalletERC20Balance(
            goalObj.tokenAddress,
            goalObj.tokenDecimals
        );
        const erc20Balance = parseUnits(walletBalance, goalObj.tokenDecimals);
        const minBalance = parseUnits(goalObj.amount, goalObj.tokenDecimals);

        if (erc20Balance < minBalance) {
            const amountToBorrow = minBalance - erc20Balance;

            const maturityDate = DateTime.now().plus({ minutes: 5 });

            const interestRate = BigInt(11);
            const settlementAmount =
                (amountToBorrow * interestRate) / BigInt(10);

            const responseMsg = {
                ...message,
                content: {
                    /// Fill in the goal of the NFT
                    text: `Goal: "Repay ${formatUnits(settlementAmount, goalObj.tokenDecimals)} ${goalObj.token} for a ${formatUnits(amountToBorrow, goalObj.tokenDecimals)} ${goalObj.token} loan on ${maturityDate.toFormat("dd LLLL yyyy HH:mm z")} on ${goalObj.chain}" Token Address: ${goalObj.tokenAddress} Price: ${amountToBorrow.toString()} Chain: ${goalObj.chain} Settlment Amount: ${settlementAmount.toString()}`,
                    action: "REGISTER_COVENANT",
                },
            };

            await runtime.messageManager.createMemory(responseMsg);
            await runtime.processActions(responseMsg, [responseMsg]);

            // Mark first objective as completed as NFT has been successfully minted
            lastGoal.objectives[0].completed = true;

            updateGoal({
                runtime,
                goal: lastGoal,
            });
        }
        return 0;
    },
    examples: [],
};
