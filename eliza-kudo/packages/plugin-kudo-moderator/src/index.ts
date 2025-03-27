import type { Plugin } from "@elizaos/core";
import KudoModeratorClientInterface from "./clients/moderatorKudo";
import { moderateGoalPostAction } from "./actions/checkGoalAlignment";

export const kudoModeratorPlugin: Plugin = {
    name: "kudo-moderator",
    description: "Kudo moderator plugin",
    providers: [],
    evaluators: [],
    services: [],
    actions: [moderateGoalPostAction],
    clients: [KudoModeratorClientInterface],
};

export default kudoModeratorPlugin;


