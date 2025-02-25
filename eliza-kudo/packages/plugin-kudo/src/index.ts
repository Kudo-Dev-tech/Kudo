export * from "./providers/wallet";
export * from "./actions/registerCovenant";
export * as kudoConstants from "./constants";
export * as kudoClient from "./clients/kudoClient";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { evmWalletProvider } from "./providers/wallet";
import { registerCovenantAction } from "./actions/registerCovenant";
import KudoClientInterface from "./clients/kudoClient";

export const kudoPlugin: Plugin = {
    name: "kudo",
    description: "Kudo integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [registerCovenantAction],
    clients: [KudoClientInterface],
};

export default kudoPlugin;
