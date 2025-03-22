export * from "./actions/socialInteractionAction";
export * from "./actions/verifyAction";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { socialInteractionAction } from "./actions/socialInteractionAction";
import { postSocialInteraction } from "./actions/postSocialInteraction";
import { promoteSocialInteractionAction } from "./actions/promoteSocialInteractionAction";
import { verifyAction } from "./actions/verifyAction";
import { reactToSocialInteractionAction } from "./actions/reactToSocialInteractionAction";

export const tokenPromoterPlugin: Plugin = {
    name: "employer",
    description: "Employer integration plugin",
    providers: [],
    evaluators: [],
    services: [],
    actions: [
        socialInteractionAction,
        verifyAction,
        postSocialInteraction,
        promoteSocialInteractionAction,
        reactToSocialInteractionAction,
    ],
    clients: [],
};

export default tokenPromoterPlugin;
