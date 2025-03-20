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
        [arbitrum.id]: http("https://arb-mainnet.g.alchemy.com/v2/Q5TxpTVf_JI2DtOAgZuy17s0Ln2HDrt7")
    }

})

async function watchEvent() {
    const unwatch = watchContractEvent(config, {
        moderatorKudoABI,
        args: { 
          to: '0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8', 
        }, 
        onLogs(logs) {
          console.log('watchEvent Triggered!')
        },
      })
    console.log(unwatch)
}



export const KudoModeratorClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        watchEvent()
        return null;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoModeratorClientInterface;
