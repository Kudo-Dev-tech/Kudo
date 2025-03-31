export const KudoABI = [
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "donID",
                type: "bytes32",
            },
            {
                internalType: "uint64",
                name: "subsId",
                type: "uint64",
            },
            {
                internalType: "address",
                name: "router",
                type: "address",
            },
            {
                internalType: "address",
                name: "admin",
                type: "address",
            },
            {
                internalType: "uint48",
                name: "initialDelay",
                type: "uint48",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "AccessControlBadConfirmation",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint48",
                name: "schedule",
                type: "uint48",
            },
        ],
        name: "AccessControlEnforcedDefaultAdminDelay",
        type: "error",
    },
    {
        inputs: [],
        name: "AccessControlEnforcedDefaultAdminRules",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "defaultAdmin",
                type: "address",
            },
        ],
        name: "AccessControlInvalidDefaultAdmin",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "neededRole",
                type: "bytes32",
            },
        ],
        name: "AccessControlUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [],
        name: "AgentRegistered",
        type: "error",
    },
    {
        inputs: [],
        name: "CallerIsNotAuthorizedAgent",
        type: "error",
    },
    {
        inputs: [],
        name: "ConditionIsNotMet",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "ERC721IncorrectOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ERC721InsufficientApproval",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "approver",
                type: "address",
            },
        ],
        name: "ERC721InvalidApprover",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "ERC721InvalidOperator",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "ERC721InvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "ERC721InvalidReceiver",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "ERC721InvalidSender",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ERC721NonexistentToken",
        type: "error",
    },
    {
        inputs: [],
        name: "EmptyArgs",
        type: "error",
    },
    {
        inputs: [],
        name: "EmptySource",
        type: "error",
    },
    {
        inputs: [],
        name: "NoInlineSecrets",
        type: "error",
    },
    {
        inputs: [],
        name: "OnlyRouterCanFulfill",
        type: "error",
    },
    {
        inputs: [],
        name: "ReceiverIsNotWhitelisted",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "bits",
                type: "uint8",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "SafeCastOverflowedUintDowncast",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "length",
                type: "uint256",
            },
        ],
        name: "StringsInsufficientHexLength",
        type: "error",
    },
    {
        inputs: [],
        name: "StringsInvalidChar",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "approved",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "ApprovalForAll",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "DefaultAdminDelayChangeCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint48",
                name: "newDelay",
                type: "uint48",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "effectSchedule",
                type: "uint48",
            },
        ],
        name: "DefaultAdminDelayChangeScheduled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "DefaultAdminTransferCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint48",
                name: "acceptSchedule",
                type: "uint48",
            },
        ],
        name: "DefaultAdminTransferScheduled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "RequestFulfilled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "id",
                type: "bytes32",
            },
        ],
        name: "RequestSent",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32",
            },
        ],
        name: "RoleAdminChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleGranted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleRevoked",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "acceptDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
        ],
        name: "beginDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "cancelDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint48",
                name: "newDelay",
                type: "uint48",
            },
        ],
        name: "changeDefaultAdminDelay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdmin",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdminDelay",
        outputs: [
            {
                internalType: "uint48",
                name: "",
                type: "uint48",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "defaultAdminDelayIncreaseWait",
        outputs: [
            {
                internalType: "uint48",
                name: "",
                type: "uint48",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "agent",
                type: "address",
            },
        ],
        name: "getAgentCovenantsData",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "nftId",
                        type: "uint256",
                    },
                    {
                        internalType: "enum CovenantNFT.NftType",
                        name: "nftType",
                        type: "uint8",
                    },
                    {
                        internalType: "address",
                        name: "agentWallet",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "agentId",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "agentName",
                        type: "string",
                    },
                    {
                        internalType: "enum CovenantNFT.CovenantStatus",
                        name: "status",
                        type: "uint8",
                    },
                    {
                        internalType: "string",
                        name: "goal",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "settlementAsset",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "owner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "settlementAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "price",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "abilityScore",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[]",
                        name: "subgoalsId",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256",
                        name: "parentGoalId",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "settlementData",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "shouldWatch",
                        type: "bool",
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes",
                    },
                ],
                internalType: "struct CovenantNFT.CovenantDetails[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "agent",
                type: "address",
            },
        ],
        name: "getAgentDetails",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getApproved",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "nftId",
                type: "uint256",
            },
        ],
        name: "getCovenant",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "agentWallet",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "agentId",
                        type: "string",
                    },
                    {
                        internalType: "enum CovenantNFT.CovenantStatus",
                        name: "status",
                        type: "uint8",
                    },
                    {
                        internalType: "enum CovenantNFT.NftType",
                        name: "nftType",
                        type: "uint8",
                    },
                    {
                        internalType: "string",
                        name: "goal",
                        type: "string",
                    },
                    {
                        internalType: "uint256[]",
                        name: "subgoalsId",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256",
                        name: "price",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "parentGoalId",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "settlementAsset",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "settlementAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "minAbilityScore",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "abilityScore",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "shouldWatch",
                        type: "bool",
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes",
                    },
                ],
                internalType: "struct CovenantNFT.CovenantData",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getCovenantsDetails",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "nftId",
                        type: "uint256",
                    },
                    {
                        internalType: "enum CovenantNFT.NftType",
                        name: "nftType",
                        type: "uint8",
                    },
                    {
                        internalType: "address",
                        name: "agentWallet",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "agentId",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "agentName",
                        type: "string",
                    },
                    {
                        internalType: "enum CovenantNFT.CovenantStatus",
                        name: "status",
                        type: "uint8",
                    },
                    {
                        internalType: "string",
                        name: "goal",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "settlementAsset",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "owner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "settlementAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "price",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "abilityScore",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[]",
                        name: "subgoalsId",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256",
                        name: "parentGoalId",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "settlementData",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "shouldWatch",
                        type: "bool",
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes",
                    },
                ],
                internalType: "struct CovenantNFT.CovenantDetails[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
        ],
        name: "getRoleAdmin",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "requestId",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "response",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "err",
                type: "bytes",
            },
        ],
        name: "handleOracleFulfillment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "hasRole",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "agent",
                type: "address",
            },
        ],
        name: "isAgentRegistered",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ownerOf",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingDefaultAdmin",
        outputs: [
            {
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
            {
                internalType: "uint48",
                name: "schedule",
                type: "uint48",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingDefaultAdminDelay",
        outputs: [
            {
                internalType: "uint48",
                name: "newDelay",
                type: "uint48",
            },
            {
                internalType: "uint48",
                name: "schedule",
                type: "uint48",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "nftId",
                type: "uint256",
            },
        ],
        name: "purchase",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "teeId",
                type: "string",
            },
            {
                internalType: "string",
                name: "agentId",
                type: "string",
            },
            {
                internalType: "string",
                name: "agentName",
                type: "string",
            },
        ],
        name: "registerAgent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "enum CovenantNFT.NftType",
                name: "nftType",
                type: "uint8",
            },
            {
                internalType: "string",
                name: "task",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "parentCovenantId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "settlementAsset",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "settlementAmount",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "shouldWatch",
                type: "bool",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "registerCovenant",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "enum CovenantNFT.NftType",
                name: "nftType",
                type: "uint8",
            },
            {
                internalType: "string",
                name: "task",
                type: "string",
            },
            {
                internalType: "address",
                name: "settlementAsset",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "settlementAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minAbilityScore",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "shouldWatch",
                type: "bool",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "registerCovenant",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "rollbackDefaultAdminDelay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "s_nftId",
                type: "uint256",
            },
        ],
        name: "s_nftIdToCovenantData",
        outputs: [
            {
                internalType: "address",
                name: "agentWallet",
                type: "address",
            },
            {
                internalType: "string",
                name: "agentId",
                type: "string",
            },
            {
                internalType: "enum CovenantNFT.CovenantStatus",
                name: "status",
                type: "uint8",
            },
            {
                internalType: "enum CovenantNFT.NftType",
                name: "nftType",
                type: "uint8",
            },
            {
                internalType: "string",
                name: "goal",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "parentGoalId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "settlementAsset",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "settlementAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minAbilityScore",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "abilityScore",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "shouldWatch",
                type: "bool",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "cNftId",
                type: "uint256",
            },
        ],
        name: "s_nftSettlementData",
        outputs: [
            {
                internalType: "string",
                name: "settlemenData",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "requestId",
                type: "bytes32",
            },
        ],
        name: "s_requestIdToNftId",
        outputs: [
            {
                internalType: "uint256",
                name: "nftId",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "nftId",
                type: "uint256",
            },
            {
                internalType: "enum CovenantNFT.CovenantStatus",
                name: "status",
                type: "uint8",
            },
        ],
        name: "setCovenantStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "nftId",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "data",
                type: "string",
            },
        ],
        name: "setSettlementData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "tokenURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
