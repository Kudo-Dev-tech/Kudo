import { Plugin } from "@elizaos/core";
import { balanceEvaluator } from "./evaluators/balance";
import { repayAction } from "./actions/repay";
import { balanceAction } from "./actions/balance.js";

export * as actions from "./actions/index.js";
export * as evaluators from "./evaluators/index.js";

export const TOPUP_INSUFFICIENT_BALANCE = "Maintain a minimum balance of";

export const balanceMonitorPlugin: Plugin = {
    name: "bootstrap",
    description:
        "Agent plugin for ensuring that it's balance is greater than some amount",
    actions: [repayAction, balanceAction],
    evaluators: [balanceEvaluator],
    providers: [],
};
export default balanceMonitorPlugin;
