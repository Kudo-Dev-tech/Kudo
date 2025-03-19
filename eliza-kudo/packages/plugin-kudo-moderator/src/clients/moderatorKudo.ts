// Under Construction

import { watchContractEvent } from '@wagmi/core'
import { moderatorKudoABI } from "./moderatorKudoABI"


async watchEvent() {
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