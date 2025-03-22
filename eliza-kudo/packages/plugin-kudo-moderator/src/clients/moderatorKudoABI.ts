export const moderatorKudoABI = [
    {
        type: "function",
        name: "DEFAULT_ADMIN_ROLE",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "EVALUATOR_CONTRACT_ROLE",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "acceptDefaultAdminTransfer",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "approve",
        inputs: [
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "beginDefaultAdminTransfer",
        inputs: [
            {
                name: "newAdmin",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "cancelDefaultAdminTransfer",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "changeDefaultAdminDelay",
        inputs: [
            {
                name: "newDelay",
                type: "uint48",
                internalType: "uint48",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "defaultAdmin",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "defaultAdminDelay",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint48",
                internalType: "uint48",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "defaultAdminDelayIncreaseWait",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint48",
                internalType: "uint48",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getAgentCovenantsData",
        inputs: [
            {
                name: "agent",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct CovenantNFT.CovenantDetails[]",
                components: [
                    {
                        name: "nftId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "agentName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "agentId",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "owner",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "settlementData",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "covenantData",
                        type: "tuple",
                        internalType: "struct CovenantNFT.CovenantData",
                        components: [
                            {
                                name: "agentWallet",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "status",
                                type: "uint8",
                                internalType: "enum CovenantNFT.CovenantStatus",
                            },
                            {
                                name: "goal",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "goalDetail",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "subgoalsId",
                                type: "uint64[]",
                                internalType: "uint64[]",
                            },
                            {
                                name: "parentGoalId",
                                type: "uint64",
                                internalType: "uint64",
                            },
                            {
                                name: "price",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "settlementDetail",
                                type: "tuple",
                                internalType:
                                    "struct CovenantNFT.SettlementDetails",
                                components: [
                                    {
                                        name: "settlementAsset",
                                        type: "address",
                                        internalType: "address",
                                    },
                                    {
                                        name: "settlementAmount",
                                        type: "uint128",
                                        internalType: "uint128",
                                    },
                                ],
                            },
                            {
                                name: "minAbilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "abilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "shouldWatch",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "isEscrowed",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "data",
                                type: "bytes",
                                internalType: "bytes",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getAgentDetails",
        inputs: [
            {
                name: "agent",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
            {
                name: "",
                type: "uint256[]",
                internalType: "uint256[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getApproved",
        inputs: [
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getCovenant",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct CovenantNFT.CovenantData",
                components: [
                    {
                        name: "agentWallet",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "status",
                        type: "uint8",
                        internalType: "enum CovenantNFT.CovenantStatus",
                    },
                    {
                        name: "goal",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "goalDetail",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "subgoalsId",
                        type: "uint64[]",
                        internalType: "uint64[]",
                    },
                    {
                        name: "parentGoalId",
                        type: "uint64",
                        internalType: "uint64",
                    },
                    {
                        name: "price",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "settlementDetail",
                        type: "tuple",
                        internalType: "struct CovenantNFT.SettlementDetails",
                        components: [
                            {
                                name: "settlementAsset",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "settlementAmount",
                                type: "uint128",
                                internalType: "uint128",
                            },
                        ],
                    },
                    {
                        name: "minAbilityScore",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "abilityScore",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "shouldWatch",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "isEscrowed",
                        type: "bool",
                        internalType: "bool",
                    },
                    {
                        name: "data",
                        type: "bytes",
                        internalType: "bytes",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getCovenantDetails",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct CovenantNFT.CovenantDetails",
                components: [
                    {
                        name: "nftId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "agentName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "agentId",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "owner",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "settlementData",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "covenantData",
                        type: "tuple",
                        internalType: "struct CovenantNFT.CovenantData",
                        components: [
                            {
                                name: "agentWallet",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "status",
                                type: "uint8",
                                internalType: "enum CovenantNFT.CovenantStatus",
                            },
                            {
                                name: "goal",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "goalDetail",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "subgoalsId",
                                type: "uint64[]",
                                internalType: "uint64[]",
                            },
                            {
                                name: "parentGoalId",
                                type: "uint64",
                                internalType: "uint64",
                            },
                            {
                                name: "price",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "settlementDetail",
                                type: "tuple",
                                internalType:
                                    "struct CovenantNFT.SettlementDetails",
                                components: [
                                    {
                                        name: "settlementAsset",
                                        type: "address",
                                        internalType: "address",
                                    },
                                    {
                                        name: "settlementAmount",
                                        type: "uint128",
                                        internalType: "uint128",
                                    },
                                ],
                            },
                            {
                                name: "minAbilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "abilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "shouldWatch",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "isEscrowed",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "data",
                                type: "bytes",
                                internalType: "bytes",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getCovenantsDetails",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                internalType: "struct CovenantNFT.CovenantDetails[]",
                components: [
                    {
                        name: "nftId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "agentName",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "agentId",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "owner",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "settlementData",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "covenantData",
                        type: "tuple",
                        internalType: "struct CovenantNFT.CovenantData",
                        components: [
                            {
                                name: "agentWallet",
                                type: "address",
                                internalType: "address",
                            },
                            {
                                name: "status",
                                type: "uint8",
                                internalType: "enum CovenantNFT.CovenantStatus",
                            },
                            {
                                name: "goal",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "goalDetail",
                                type: "string",
                                internalType: "string",
                            },
                            {
                                name: "subgoalsId",
                                type: "uint64[]",
                                internalType: "uint64[]",
                            },
                            {
                                name: "parentGoalId",
                                type: "uint64",
                                internalType: "uint64",
                            },
                            {
                                name: "price",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "settlementDetail",
                                type: "tuple",
                                internalType:
                                    "struct CovenantNFT.SettlementDetails",
                                components: [
                                    {
                                        name: "settlementAsset",
                                        type: "address",
                                        internalType: "address",
                                    },
                                    {
                                        name: "settlementAmount",
                                        type: "uint128",
                                        internalType: "uint128",
                                    },
                                ],
                            },
                            {
                                name: "minAbilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "abilityScore",
                                type: "uint128",
                                internalType: "uint128",
                            },
                            {
                                name: "shouldWatch",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "isEscrowed",
                                type: "bool",
                                internalType: "bool",
                            },
                            {
                                name: "data",
                                type: "bytes",
                                internalType: "bytes",
                            },
                        ],
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getRoleAdmin",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "grantRole",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "hasRole",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "isAgentRegistered",
        inputs: [
            {
                name: "agent",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "isApprovedForAll",
        inputs: [
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
            {
                name: "operator",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "ownerOf",
        inputs: [
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "pendingDefaultAdmin",
        inputs: [],
        outputs: [
            {
                name: "newAdmin",
                type: "address",
                internalType: "address",
            },
            {
                name: "schedule",
                type: "uint48",
                internalType: "uint48",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "pendingDefaultAdminDelay",
        inputs: [],
        outputs: [
            {
                name: "newDelay",
                type: "uint48",
                internalType: "uint48",
            },
            {
                name: "schedule",
                type: "uint48",
                internalType: "uint48",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "purchase",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "goalDetail",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "registerAgent",
        inputs: [
            {
                name: "teeId",
                type: "string",
                internalType: "string",
            },
            {
                name: "agentId",
                type: "string",
                internalType: "string",
            },
            {
                name: "agentName",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "registerCovenant",
        inputs: [
            {
                name: "task",
                type: "string",
                internalType: "string",
            },
            {
                name: "parentCovenantId",
                type: "uint128",
                internalType: "uint128",
            },
            {
                name: "settlementAsset",
                type: "address",
                internalType: "address",
            },
            {
                name: "settlementAmount",
                type: "uint128",
                internalType: "uint128",
            },
            {
                name: "shouldWatch",
                type: "bool",
                internalType: "bool",
            },
            {
                name: "isEscrowed",
                type: "bool",
                internalType: "bool",
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "registerCovenant",
        inputs: [
            {
                name: "task",
                type: "string",
                internalType: "string",
            },
            {
                name: "settlementAsset",
                type: "address",
                internalType: "address",
            },
            {
                name: "settlementAmount",
                type: "uint128",
                internalType: "uint128",
            },
            {
                name: "minAbilityScore",
                type: "uint128",
                internalType: "uint128",
            },
            {
                name: "price",
                type: "uint128",
                internalType: "uint128",
            },
            {
                name: "shouldWatch",
                type: "bool",
                internalType: "bool",
            },
            {
                name: "isEscrowed",
                type: "bool",
                internalType: "bool",
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "renounceRole",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "revokeRole",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "rollbackDefaultAdminDelay",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "safeTransferFrom",
        inputs: [
            {
                name: "from",
                type: "address",
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "safeTransferFrom",
        inputs: [
            {
                name: "from",
                type: "address",
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setApprovalForAll",
        inputs: [
            {
                name: "operator",
                type: "address",
                internalType: "address",
            },
            {
                name: "approved",
                type: "bool",
                internalType: "bool",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setCovenantStatus",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "status",
                type: "uint8",
                internalType: "enum CovenantNFT.CovenantStatus",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setSettlementData",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "data",
                type: "string",
                internalType: "string",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "supportsInterface",
        inputs: [
            {
                name: "interfaceId",
                type: "bytes4",
                internalType: "bytes4",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "tokenURI",
        inputs: [
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "transferFrom",
        inputs: [
            {
                name: "from",
                type: "address",
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "AgentSet",
        inputs: [
            {
                name: "agentWallet",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "agentName",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "agentId",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "teeId",
                type: "string",
                indexed: false,
                internalType: "string",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Approval",
        inputs: [
            {
                name: "owner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "approved",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ApprovalForAll",
        inputs: [
            {
                name: "owner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "operator",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "approved",
                type: "bool",
                indexed: false,
                internalType: "bool",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "CovenantRegistered",
        inputs: [
            {
                name: "requestId",
                type: "bytes32",
                indexed: false,
                internalType: "bytes32",
            },
            {
                name: "agentWallet",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "nftId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "CovenantStatusSet",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "status",
                type: "uint8",
                indexed: false,
                internalType: "enum CovenantNFT.CovenantStatus",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultAdminDelayChangeCanceled",
        inputs: [],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultAdminDelayChangeScheduled",
        inputs: [
            {
                name: "newDelay",
                type: "uint48",
                indexed: false,
                internalType: "uint48",
            },
            {
                name: "effectSchedule",
                type: "uint48",
                indexed: false,
                internalType: "uint48",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultAdminTransferCanceled",
        inputs: [],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultAdminTransferScheduled",
        inputs: [
            {
                name: "newAdmin",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "acceptSchedule",
                type: "uint48",
                indexed: false,
                internalType: "uint48",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RoleAdminChanged",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                indexed: true,
                internalType: "bytes32",
            },
            {
                name: "previousAdminRole",
                type: "bytes32",
                indexed: true,
                internalType: "bytes32",
            },
            {
                name: "newAdminRole",
                type: "bytes32",
                indexed: true,
                internalType: "bytes32",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RoleGranted",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                indexed: true,
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "sender",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RoleRevoked",
        inputs: [
            {
                name: "role",
                type: "bytes32",
                indexed: true,
                internalType: "bytes32",
            },
            {
                name: "account",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "sender",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "SettlementDataSet",
        inputs: [
            {
                name: "nftId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Transfer",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "error",
        name: "AccessControlBadConfirmation",
        inputs: [],
    },
    {
        type: "error",
        name: "AccessControlEnforcedDefaultAdminDelay",
        inputs: [
            {
                name: "schedule",
                type: "uint48",
                internalType: "uint48",
            },
        ],
    },
    {
        type: "error",
        name: "AccessControlEnforcedDefaultAdminRules",
        inputs: [],
    },
    {
        type: "error",
        name: "AccessControlInvalidDefaultAdmin",
        inputs: [
            {
                name: "defaultAdmin",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "AccessControlUnauthorizedAccount",
        inputs: [
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
            {
                name: "neededRole",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
    },
    {
        type: "error",
        name: "AccessForbidden",
        inputs: [],
    },
    {
        type: "error",
        name: "AgentRegistered",
        inputs: [],
    },
    {
        type: "error",
        name: "ConditionIsNotMet",
        inputs: [],
    },
    {
        type: "error",
        name: "ERC721IncorrectOwner",
        inputs: [
            {
                name: "sender",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InsufficientApproval",
        inputs: [
            {
                name: "operator",
                type: "address",
                internalType: "address",
            },
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InvalidApprover",
        inputs: [
            {
                name: "approver",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InvalidOperator",
        inputs: [
            {
                name: "operator",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InvalidOwner",
        inputs: [
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InvalidReceiver",
        inputs: [
            {
                name: "receiver",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721InvalidSender",
        inputs: [
            {
                name: "sender",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC721NonexistentToken",
        inputs: [
            {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
    },
    {
        type: "error",
        name: "SafeCastOverflowedUintDowncast",
        inputs: [
            {
                name: "bits",
                type: "uint8",
                internalType: "uint8",
            },
            {
                name: "value",
                type: "uint256",
                internalType: "uint256",
            },
        ],
    },
    {
        type: "error",
        name: "SafeERC20FailedOperation",
        inputs: [
            {
                name: "token",
                type: "address",
                internalType: "address",
            },
        ],
    },
];
