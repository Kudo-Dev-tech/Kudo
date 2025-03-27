import type { Plugin } from "@elizaos/core";
import KudoModeratorClientInterface from "./clients/moderatorKudo";

export const kudoModeratorPlugin: Plugin = {
    name: "kudo-moderator",
    description: "Kudo moderator plugin",
    providers: [],
    evaluators: [],
    services: [],
    actions: [],
    clients: [KudoModeratorClientInterface],
};

export default kudoModeratorPlugin;
