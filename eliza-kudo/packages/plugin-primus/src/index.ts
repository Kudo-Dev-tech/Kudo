import { Plugin } from "@elizaos/core";
import { postTweetAction } from "./actions/postTweetAction.ts";
import { PrimusAdapter } from "./adapter/primusAdapter.ts";

export const twitterPlugin: Plugin = {
    name: "twitter",
    description:
        "Twitter integration plugin for posting tweets with proof generated by primus",
    actions: [postTweetAction],
    evaluators: [],
    providers: [],
};

export default twitterPlugin;
export { PrimusAdapter };
