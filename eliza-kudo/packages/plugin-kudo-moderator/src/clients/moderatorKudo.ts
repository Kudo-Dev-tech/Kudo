// Under Construction

import { createConfig, http } from '@wagmi/core'
import { arbitrum } from '@wagmi/core/chains'
import { watchContractEvent } from '@wagmi/core'
import { moderatorKudoABI } from "./moderatorKudoABI"
import { Client, IAgentRuntime } from '@elizaos/core';
import { type CreateConfigParameters } from '@wagmi/core'

const config = createConfig({
    chains: [arbitrum],
    transports: {
        [arbitrum.id]: http()
    }

})

async function watchEvent() {
    const unwatch = watchContractEvent(config, {
        abi: moderatorKudoABI,
        address: '0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8',
        onLogs(logs) {
          console.log('watchEvent Triggered!')
        },
      })
    console.log(unwatch)
}

export const KudoModeratorClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        await watchEvent()
        return null;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoModeratorClientInterface;
