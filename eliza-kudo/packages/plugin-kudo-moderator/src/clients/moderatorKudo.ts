// Under Construction

import { watchContractEvent } from '@wagmi/core'
import { moderatorKudoABI } from "./moderatorKudoABI"
import { Client, IAgentRuntime } from '@elizaos/core';


/**
 * async watchEvent() {
    const event = watchContractEvent(config,
        {address: "0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8",
        moderatorKudoABI,
        eventName: "SettlementDataSet"
        },
        (type, name) => { // Obtain the covenant details
            console.log("Evaluator Function Triggered");
            const details = getCovenantDetails(type, name); //Need some help here - where to import
            return details
        }
    )
}
 */

export const KudoModeratorClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        console.log("Starting Kudo Moderator Client");
        return null;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoModeratorClientInterface;
