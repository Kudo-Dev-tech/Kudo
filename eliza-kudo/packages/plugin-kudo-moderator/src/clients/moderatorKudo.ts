// Under Construction


import { moderatorKudoABI } from "./moderatorKudoABI"
import { Client, IAgentRuntime } from '@elizaos/core';
import { createPublicClient, http } from 'viem'
import { arbitrum } from 'viem/chains'

const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http("https://arb-mainnet.g.alchemy.com/v2/Q5TxpTVf_JI2DtOAgZuy17s0Ln2HDrt7")
})

async function watchContractEvent() {
    // Watch an Event

    const watcher = publicClient.watchContractEvent({
        address: '0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8',
        abi: moderatorKudoABI,
        onLogs: logs => {
            console.log('watchEvent Triggered!')
          }
    })

    return "TRIGGERED"
}

export const KudoModeratorClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const data = await watchContractEvent()
        console.log(data)
        return null;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Kudo client does not support stopping yet");
        return true;
    },
};

export default KudoModeratorClientInterface;
