import { watchContractEvent, publicClient } from "../clients/moderatorKudo";
import { moderatorKudoABI } from "../clients/moderatorKudoABI";
import { createWalletClient, custom, http } from 'viem'
import { arbitrum } from 'viem/chains';
import { moderateGoalPostTemplate } from "../templates/index.ts"
import { Action,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    generateObjectDeprecated,
    type Client,
    UUID,
    stringToUuid,
} from "@elizaos/core";
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const transmitVerdictAction: Action = {
    name: "TRANSMIT_MESSAGE",
    similes: ["SEND_MESSAGE"],
    description: "Transmits a message to the contract.",
    validate: async () => {
        return true
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {

           
          const walletClient = createWalletClient({
            chain: arbitrum,
            transport: http(process.env.ETHEREUM_PROVIDER_ARBITRUM as string)
          })
           
          // Local Account
          const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

          const { request } = await publicClient.simulateContract({
            account,
            address: '0x530BEba1A237a01f342199Bf0d3FC5FE628e4cB8',
            abi: moderatorKudoABI,
            functionName: 'setCovenantStatus',
            args: 
          })
        await walletClient.writeContract(request)
    }
}

