// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {ERC721, IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";
import {EnumerableSet} from "openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import {FunctionsClient} from "chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract CovenantNFT is ERC721, AccessControlDefaultAdminRules, FunctionsClient {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 i_donID;

    address s_router;

    string constant source = "const address = args[0];" "const minScore = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://kudo-client.vercel.app/api/verification`," "method: 'POST'," "headers: {"
        "'Content-Type': 'application/json'," "}," "data: {" "address: `${address}`," "minAbilityScore: `${minScore}`"
        "}});" "if (apiResponse.error) { throw Error('Error');}" "const { data } = apiResponse;"
        "return Functions.encodeString(data.abilityScore);";

    uint32 constant gasLimit = 300000;

    uint64 s_subsId;

    enum CovenantStatus {
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    enum NftType {
        EMPLOYMENT,
        LOAN
    }

    error CallerIsNotAuthorizedAgent();

    error AgentRegistered();

    error ReceiverIsNotWhitelisted();

    error ConditionIsNotMet();

    uint256 s_nftId;

    uint256 s_requestCnfId;

    /// hold every agents id
    EnumerableSet.AddressSet s_agents;

    mapping(address agentAddress => AgentManagement agentManagementInfo) internal s_agentDetails;

    mapping(uint256 s_nftId => CovenantData cNFTDetails) public s_nftIdToCovenantData;

    mapping(bytes32 requestId => uint256 nftId) public s_requestIdToNftId;

    mapping(uint256 cNftId => string settlemenData) public s_nftSettlementData;

    struct CovenantData {
        /// @notice Agent wallet address
        address agentWallet;
        /// @notice The agent ID
        string agentId;
        /// @notice The current status of the covenant
        CovenantStatus status;
        /// @notice The covenant nft type
        NftType nftType;
        /// @notice The description of the goal
        string goal;
        /// @notice List of subgoals cNFT id
        uint256[] subgoalsId;
        /// @notice The amount needed to purchase the NFT
        uint256 price;
        /// @notice Parent goal id
        uint256 parentGoalId;
        /// @notice The promised asset at settlement
        address settlementAsset;
        /// @notice The promised asset amount at settlement
        uint256 settlementAmount;
        /// @notice agent minimum ability score to mint covenant
        uint256 minAbilityScore;
        /// @notice The ability score
        uint256 abilityScore;
        /// @notice Status of covenant's agent watch status
        bool shouldWatch;
        /// @notice Arbitrary data that can be stored alongside the NFT
        bytes data;
    }

    struct CovenantDetails {
        /// @notice covenant nft id
        uint256 nftId;
        /// @notice The covenant nft type
        NftType nftType;
        /// @notice Agent wallet address
        address agentWallet;
        /// @notice The agent ID
        string agentId;
        /// @notice The agent name
        string agentName;
        /// @notice The current status of the covenant
        CovenantStatus status;
        /// @notice The description of the goal
        string goal;
        /// @notice The promised asset at settlement
        address settlementAsset;
        /// @notice The owner of the covenant
        address owner;
        /// @notice The promised asset amount at settlement
        uint256 settlementAmount;
        /// @notice The amount needed to purchase the NFT
        uint256 price;
        /// @notice The ability score
        uint256 abilityScore;
        /// @notice List of subgoals cNFT id
        uint256[] subgoalsId;
        /// @notice Parent goal id
        uint256 parentGoalId;
        /// @notice Settlement data
        string settlementData;
        /// @notice Status of covenant's agent watch status
        bool shouldWatch;
        /// @notice Arbitrary data that can be stored alongside the NFT
        bytes data;
    }

    struct AgentManagement {
        /// @notice The TEE ID the agent is running in
        string teeId;
        /// @notice The ID of the agent
        string agentId;
        /// @notice The agent name
        string agentName;
        /// @notice The set of agents tasks id;
        EnumerableSet.UintSet taskId;
    }

    constructor(bytes32 donID, uint64 subsId, address router, address admin, uint48 initialDelay)
        ERC721("Covenant NFT", "cNFT")
        AccessControlDefaultAdminRules(initialDelay, admin)
        FunctionsClient(router)
    {
        s_router = router;
        i_donID = donID;
        s_subsId = subsId;
    }

    /// Agent will call this function to register themself
    function registerAgent(string calldata teeId, string calldata agentId, string calldata agentName) public {
        if (isAgentRegistered(msg.sender)) revert AgentRegistered();

        s_agentDetails[msg.sender].teeId = teeId;
        s_agentDetails[msg.sender].agentId = agentId;
        s_agentDetails[msg.sender].agentName = agentName;

        s_agents.add(msg.sender);
    }

    function purchase(uint256 nftId) external {
        CovenantData storage covenant = s_nftIdToCovenantData[nftId];
        IERC20(covenant.settlementAsset).transferFrom(msg.sender, _ownerOf(nftId), covenant.price);
        _update(msg.sender, nftId, address(0));
    }

    function registerCovenant(
        NftType nftType,
        string calldata task,
        address settlementAsset,
        uint256 settlementAmount,
        uint256 minAbilityScore,
        uint256 price,
        bool shouldWatch,
        bytes calldata data
    ) public {
        string[] memory input = new string[](2);

        input[0] = Strings.toHexString(uint256(uint160(msg.sender)), 20);
        input[1] = Strings.toString(minAbilityScore);

        bytes32 requestId = sendRequest(s_subsId, input);

        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].agentId = s_agentDetails[msg.sender].agentId;
        s_nftIdToCovenantData[s_nftId].nftType = nftType;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = s_nftId;
        s_nftIdToCovenantData[s_nftId].settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].minAbilityScore = minAbilityScore;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;
        s_nftIdToCovenantData[s_nftId].price = price;

        s_agentDetails[msg.sender].taskId.add(s_nftId);

        _mint(address(this), s_nftId);
        s_nftId++;
    }

    function registerCovenant(
        NftType nftType,
        string calldata task,
        uint256 parentCovenantId,
        address settlementAsset,
        uint256 settlementAmount,
        bool shouldWatch,
        bytes calldata data
    ) public {
        string[] memory input = new string[](2);

        input[0] = Strings.toHexString(uint256(uint160(msg.sender)), 20);
        input[1] = Strings.toString(s_nftIdToCovenantData[parentCovenantId].minAbilityScore);

        bytes32 requestId = sendRequest(s_subsId, input);

        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].agentId = s_agentDetails[msg.sender].agentId;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].nftType = nftType;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = parentCovenantId;
        s_nftIdToCovenantData[s_nftId].settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;

        _mint(address(this), s_nftId);
        s_nftId++;
    }

    function setSettlementData(uint256 nftId, string memory data) public {
        if (s_nftIdToCovenantData[nftId].agentWallet != msg.sender) {
            revert CallerIsNotAuthorizedAgent();
        }

        s_nftSettlementData[nftId] = data;
    }

    function setCovenantStatus(uint256 nftId, CovenantStatus status) public {
        if (s_nftIdToCovenantData[nftId].parentGoalId == nftId) {
            if (s_nftIdToCovenantData[nftId].agentWallet != msg.sender) {
                revert CallerIsNotAuthorizedAgent();
            }
        } else {
            if (s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].agentWallet != msg.sender) {
                revert CallerIsNotAuthorizedAgent();
            }
        }

        s_nftIdToCovenantData[nftId].status = status;

        if (status == CovenantStatus.COMPLETED) {
            for (uint256 i; i < s_nftIdToCovenantData[nftId].subgoalsId.length; ++i) {
                if (
                    s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].subgoalsId[i]].status != CovenantStatus.COMPLETED
                ) revert ConditionIsNotMet();
            }

            address settlementAsset = s_nftIdToCovenantData[nftId].settlementAsset;
            if (settlementAsset != address(0)) {
                IERC20(s_nftIdToCovenantData[nftId].settlementAsset).transferFrom(
                    s_nftIdToCovenantData[nftId].agentWallet,
                    ownerOf(nftId),
                    s_nftIdToCovenantData[nftId].settlementAmount
                );
            }

            _burn(nftId);
        }
    }

    function isAgentRegistered(address agent) public view returns (bool) {
        return s_agents.contains(agent);
    }

    function getAgentDetails(address agent) public view returns (string memory, uint256[] memory) {
        uint256[] memory taskId = new uint256[](s_agentDetails[agent].taskId.length());

        for (uint256 i; i < s_agentDetails[agent].taskId.length(); ++i) {
            taskId[i] = s_agentDetails[agent].taskId.at(i);
        }

        return (s_agentDetails[agent].teeId, taskId);
    }

    function getAgentCovenantsData(address agent) public view returns (CovenantDetails[] memory) {
        uint256 agentTaskAmt = s_agentDetails[agent].taskId.length();
        CovenantDetails[] memory data = new CovenantDetails[](agentTaskAmt);

        string memory agentId = s_agentDetails[agent].agentId;
        string memory agentName = s_agentDetails[agent].agentName;
        for (uint256 i; i < agentTaskAmt; ++i) {
            uint256 currentNftId = s_agentDetails[agent].taskId.at(i);
            data[i].agentName = agentName;
            data[i].agentId = agentId;
            data[i].nftId = currentNftId;
            data[i].nftType = s_nftIdToCovenantData[currentNftId].nftType;
            data[i].agentWallet = s_nftIdToCovenantData[currentNftId].agentWallet;
            data[i].goal = s_nftIdToCovenantData[currentNftId].goal;
            data[i].settlementAsset = s_nftIdToCovenantData[currentNftId].settlementAsset;
            data[i].settlementAmount = s_nftIdToCovenantData[currentNftId].settlementAmount;
            data[i].data = s_nftIdToCovenantData[currentNftId].data;
            data[i].status = s_nftIdToCovenantData[currentNftId].status;
            data[i].shouldWatch = s_nftIdToCovenantData[currentNftId].shouldWatch;
            data[i].price = s_nftIdToCovenantData[currentNftId].price;
            data[i].subgoalsId = s_nftIdToCovenantData[currentNftId].subgoalsId;
            data[i].abilityScore = s_nftIdToCovenantData[currentNftId].abilityScore;
            data[i].owner = _ownerOf(currentNftId);
            data[i].settlementData = s_nftSettlementData[currentNftId];
        }

        return data;
    }

    function getCovenantsDetails() public view returns (CovenantDetails[] memory) {
        CovenantDetails[] memory data = new CovenantDetails[](s_nftId);

        for (uint256 i; i < s_nftId; ++i) {
            address agentWallet = s_nftIdToCovenantData[i].agentWallet;
            string memory agentId = s_agentDetails[agentWallet].agentId;
            string memory agentName = s_agentDetails[agentWallet].agentName;
            data[i].nftId = i;
            data[i].agentName = agentName;
            data[i].agentId = agentId;
            data[i].nftType = s_nftIdToCovenantData[i].nftType;
            data[i].agentWallet = agentWallet;
            data[i].goal = s_nftIdToCovenantData[i].goal;
            data[i].settlementAsset = s_nftIdToCovenantData[i].settlementAsset;
            data[i].settlementAmount = s_nftIdToCovenantData[i].settlementAmount;
            data[i].data = s_nftIdToCovenantData[i].data;
            data[i].status = s_nftIdToCovenantData[i].status;
            data[i].shouldWatch = s_nftIdToCovenantData[i].shouldWatch;
            data[i].price = s_nftIdToCovenantData[i].price;
            data[i].abilityScore = s_nftIdToCovenantData[i].abilityScore;
            data[i].parentGoalId = s_nftIdToCovenantData[i].parentGoalId;
            data[i].subgoalsId = s_nftIdToCovenantData[i].subgoalsId;
            data[i].owner = _ownerOf(i);
        }

        return data;
    }

    function getCovenant(uint256 nftId) public view returns (CovenantData memory) {
        return s_nftIdToCovenantData[nftId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlDefaultAdminRules, ERC721)
        returns (bool)
    {
        return interfaceId == type(IAccessControlDefaultAdminRules).interfaceId || super.supportsInterface(interfaceId)
            || interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC721Metadata).interfaceId
            || super.supportsInterface(interfaceId);
    }

    /**
     * @notice Sends an HTTP request for character information
     * @param subscriptionId The ID for the Chainlink subscription
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function sendRequest(uint64 subscriptionId, string[] memory args) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        return _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, i_donID);
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory) internal override {
        uint256 nftId = s_requestIdToNftId[requestId];
        uint256 abilityScore = uint256(Strings.parseUint(string(response)));

        if (abilityScore < s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].minAbilityScore) {
            _burn(nftId);
            return;
        }

        s_nftIdToCovenantData[nftId].abilityScore = abilityScore;

        if (nftId != s_nftIdToCovenantData[nftId].parentGoalId) {
            s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].subgoalsId.push(nftId);
            s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].taskId.add(s_nftId);
        }

        _transfer(address(this), s_nftIdToCovenantData[nftId].agentWallet, nftId);
    }
}
