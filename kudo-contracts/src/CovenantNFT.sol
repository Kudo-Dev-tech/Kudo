// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {ERC721, IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EnumerableSet} from "openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";
import {EnumerableMap} from "openzeppelin-contracts/contracts/utils/structs/EnumerableMap.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract CovenantNFT is ERC721, AccessControlDefaultAdminRules {
    bytes32 public constant EVALUATOR_CONTRACT_ROLE = keccak256("EVALUATOR_CONTRACT_ROLE");

    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableMap for EnumerableMap.AddressToBytes32Map;

    /// @notice Covenant NFT Status
    enum CovenantStatus {
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    /// @notice Covenant NFT id counter
    uint256 internal s_nftId;

    /// @notice Holds every agents id
    EnumerableSet.AddressSet s_agents;

    /// @notice Stores agent details mapped by their address
    mapping(address agentAddress => AgentManagement agentManagementInfo) private s_agentDetails;

    /// @notice Maps NFT ID to its corresponding Covenant data
    mapping(uint256 nftId => CovenantData cNFTDetails) private s_nftIdToCovenantData;

    /// @notice Links a Chainlink request ID to an NFT ID
    mapping(bytes32 requestId => uint256 nftId) internal s_requestIdToNftId;

    /// @notice Stores settlement data for a given Covenant NFT ID
    mapping(uint256 cNftId => string settlemenData) private s_nftSettlementData;

    /// @notice Emitted when new agent is registered
    /// @param agentWallet Agent registered wallet address
    /// @param agentName Agent registered name
    /// @param agentId Agent registered identifier
    /// @param teeId Agent registered tee identifier
    event AgentSet(address indexed agentWallet, string agentName, string agentId, string teeId);

    /// @notice Emitted when a new Covenant NFT is registered
    /// @param requestId ID for callback identfier
    /// @param agentWallet The wallet address of the agent who registered the covenant
    /// @param nftId The ID of the newly registered Covenant NFT
    event CovenantRegistered(bytes32 requestId, address indexed agentWallet, uint256 indexed nftId);

    /// @notice Emitted when settlement data is set for a Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    event SettlementDataSet(uint256 indexed nftId);

    /// @notice Emitted when the status of a Covenant NFT is updated
    /// @param nftId The ID of the Covenant NFT
    /// @param status The new status of the covenant (IN_PROGRESS, COMPLETED, or FAILED)
    event CovenantStatusSet(uint256 indexed nftId, CovenantStatus status);

    /// @notice Thrown when the caller is not an authorized agent
    error AccessForbidden();

    /// @notice Thrown when an agent is already registered
    error AgentRegistered();

    /// @notice Thrown when a required condition is not met
    error ConditionIsNotMet();

    /// @notice Covenant NFT details
    struct CovenantData {
        /// @notice Agent wallet address
        address agentWallet;
        /// @notice The current status of the covenant
        CovenantStatus status;
        /// @notice The description of the goal
        string goal;
        /// @notice The details of the goal
        string goalDetail;
        /// @notice List of subgoals cNFT id
        uint64[] subgoalsId;
        /// @notice Parent goal id
        uint64 parentGoalId;
        /// @notice The amount needed to purchase the NFT
        uint128 price;
        /// @notice The settlement details
        SettlementDetails settlementDetail;
        /// @notice agent minimum ability score to mint covenant
        uint128 minAbilityScore;
        /// @notice The ability score
        uint128 abilityScore;
        /// @notice Status of covenant's agent watch status
        bool shouldWatch;
        /// @notice Fund status is held in escrow within the contract.
        bool isEscrowed;
        /// @notice Arbitrary data that can be stored alongside the NFT
        bytes data;
    }

    /// @notice Covenant details for getter functions
    struct CovenantDetails {
        /// @notice covenant nft id
        uint256 nftId;
        /// @notice The agent name
        string agentName;
        /// @notice The agent identifier
        string agentId;
        /// @notice The owner of the covenant
        address owner;
        /// @notice Settlement data
        string settlementData;
        /// @notice Covenant NFT data
        CovenantData covenantData;
    }

    struct SettlementDetails {
        /// @notice The promised asset at settlement
        address settlementAsset;
        /// @notice The promised asset amount at settlement
        uint128 settlementAmount;
    }

    /// @notice Agent's management detail
    struct AgentManagement {
        /// @notice The TEE ID the agent is running in
        string teeId;
        /// @notice The ID of the agent
        string agentId;
        /// @notice The agent name
        string agentName;
        /// @notice The set of agents tasks id;
        uint256[] taskId;
    }

    constructor(address admin, uint48 initialDelay)
        ERC721("Covenant NFT", "cNFT")
        AccessControlDefaultAdminRules(initialDelay, admin)
    {}

    /// @notice Allows an agent to register themselves
    /// @param teeId TEE identifier of the agent
    /// @param agentId Unique identifier for the agent
    /// @param agentName Name of the agent
    function registerAgent(string calldata teeId, string calldata agentId, string calldata agentName) public {
        if (isAgentRegistered(msg.sender)) revert AgentRegistered();

        s_agentDetails[msg.sender].teeId = teeId;
        s_agentDetails[msg.sender].agentId = agentId;
        s_agentDetails[msg.sender].agentName = agentName;

        bool status = s_agents.add(msg.sender);

        if (status) {
            emit AgentSet(msg.sender, agentName, agentId, teeId);
        }
    }

    /// @notice Allows user to purchase Covenant NFT
    /// @param nftId The ID of the NFT being purchased
    function purchase(uint256 nftId, string memory goalDetail) external {
        CovenantData storage covenant = s_nftIdToCovenantData[nftId];
        covenant.goalDetail = goalDetail;
        IERC20(covenant.settlementDetail.settlementAsset).safeTransferFrom(msg.sender, _ownerOf(nftId), covenant.price);
        _update(msg.sender, nftId, address(0));
    }

    /// @notice Registers a new Covenant NFT
    /// @param task The covenant NFT goal
    /// @param settlementAsset The asset used for settlement
    /// @param settlementAmount The amount required for settlement
    /// @param minAbilityScore The minimum ability score required
    /// @param price The price of the Covenant NFT
    /// @param shouldWatch The covenant status for monitoring
    /// @param data Additional encoded data related to the covenant
    function registerCovenant(
        string calldata task,
        address settlementAsset,
        uint128 settlementAmount,
        uint128 minAbilityScore,
        uint128 price,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) public virtual returns (bytes32);

    /// @notice Registers as a subgoal for another Covenant NFT
    /// @param task Description of the covenant goal
    /// @param parentCovenantId The ID of the parent covenant
    /// @param settlementAsset The asset used for settlement
    /// @param settlementAmount The amount required for settlement
    /// @param shouldWatch The covenant status for monitoring
    /// @param data Additional encoded data related to the covenant
    function registerCovenant(
        string calldata task,
        uint128 parentCovenantId,
        address settlementAsset,
        uint128 settlementAmount,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) public virtual returns (bytes32);

    /// @notice Sets settlement data for a specific Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @param data Settlement data
    function setSettlementData(uint256 nftId, string calldata data) public {
        if (s_nftIdToCovenantData[nftId].agentWallet != msg.sender) {
            revert AccessForbidden();
        }

        s_nftSettlementData[nftId] = data;

        emit SettlementDataSet(nftId);
    }

    /// @notice Updates the status of Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @param status The new status of the covenant
    function setCovenantStatus(uint256 nftId, CovenantStatus status) external onlyRole(EVALUATOR_CONTRACT_ROLE) {
        s_nftIdToCovenantData[nftId].status = status;

        if (status == CovenantStatus.COMPLETED) {
            for (uint256 i; i < s_nftIdToCovenantData[nftId].subgoalsId.length; ++i) {
                if (
                    s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].subgoalsId[i]].status != CovenantStatus.COMPLETED
                ) revert ConditionIsNotMet();
            }

            _burn(nftId);
        }

        emit CovenantStatusSet(nftId, status);
    }

    function _handleCovenantRegistration(
        bytes32 requestId,
        string calldata task,
        address settlementAsset,
        uint128 settlementAmount,
        uint128 minAbilityScore,
        uint128 price,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) internal returns (bytes32) {
        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = uint64(s_nftId);
        s_nftIdToCovenantData[s_nftId].settlementDetail.settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementDetail.settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].minAbilityScore = minAbilityScore;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;
        s_nftIdToCovenantData[s_nftId].isEscrowed = isEscrowed;
        s_nftIdToCovenantData[s_nftId].price = uint128(price);

        s_agentDetails[msg.sender].taskId.push(s_nftId);

        _mint(address(this), s_nftId);

        emit CovenantRegistered(requestId, msg.sender, s_nftId);

        s_nftId++;

        return requestId;
    }

    function _handleSubgoalCovenantRegistration(
        bytes32 requestId,
        string calldata task,
        uint128 parentCovenantId,
        address settlementAsset,
        uint128 settlementAmount,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) internal returns (bytes32) {
        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = uint64(parentCovenantId);
        s_nftIdToCovenantData[s_nftId].settlementDetail.settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementDetail.settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;
        s_nftIdToCovenantData[s_nftId].isEscrowed = isEscrowed;

        _mint(address(this), s_nftId);

        emit CovenantRegistered(requestId, msg.sender, s_nftId);

        s_nftId++;

        return requestId;
    }

    function _processCallback(uint128 abilityScore, uint256 nftId) internal {
        if (abilityScore < s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].minAbilityScore) {
            _burn(nftId);
            return;
        }
        s_nftIdToCovenantData[nftId].abilityScore = abilityScore;
        if (nftId != s_nftIdToCovenantData[nftId].parentGoalId) {
            s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].subgoalsId.push(uint64(nftId));
            s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].taskId.push(nftId);
        }
        _transfer(address(this), s_nftIdToCovenantData[nftId].agentWallet, nftId);
    }

    /// @notice Checks if an agent is registered
    /// @param agent The address of the agent to verify
    /// @return Returns agent register status
    function isAgentRegistered(address agent) public view returns (bool) {
        return s_agents.contains(agent);
    }

    /// @notice Retrieves details of a registered agent
    /// @param agent The address of the agent wallet
    /// @return string The unique identifier of the agent tee id
    /// @return uint256[] An array of Covenant NFT IDs associated with the agent
    function getAgentDetails(address agent) public view returns (string memory, uint256[] memory) {
        return (s_agentDetails[agent].teeId, s_agentDetails[agent].taskId);
    }

    /// @notice Retrieves agent assigned covenants details
    /// @param agent Agent wallet address
    /// @return CovenantDetails[] Details of agent assigned covenant NFT
    function getAgentCovenantsData(address agent) public view returns (CovenantDetails[] memory) {
        uint256 agentTaskAmt = s_agentDetails[agent].taskId.length;
        CovenantDetails[] memory data = new CovenantDetails[](agentTaskAmt);

        string memory agentName = s_agentDetails[agent].agentName;
        for (uint256 i; i < agentTaskAmt; ++i) {
            uint256 currentNftId = s_agentDetails[agent].taskId[i];
            data[i].agentName = agentName;
            data[i].nftId = currentNftId;
            data[i].owner = _ownerOf(currentNftId);
            data[i].settlementData = s_nftSettlementData[currentNftId];
            data[i].covenantData = s_nftIdToCovenantData[currentNftId];
        }

        return data;
    }

    /// @notice Retrieves desired covenants details
    /// @param nftId The ID of the target NFT for retrieving covenant details
    /// @return CovenantDetails Details of specific NFT
    function getCovenantDetails(uint256 nftId) public view returns (CovenantDetails memory) {
        CovenantDetails memory data = CovenantDetails({
            nftId: nftId,
            agentName: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].agentName,
            agentId: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].agentId,
            owner: _ownerOf(nftId),
            settlementData: s_nftSettlementData[nftId],
            covenantData: s_nftIdToCovenantData[nftId]
        });

        return data;
    }

    /// @notice Retrieves all of the covenants details
    /// @return CovenantDetails[] Details of all covenant NFT
    function getCovenantsDetails() external view returns (CovenantDetails[] memory) {
        CovenantDetails[] memory data = new CovenantDetails[](s_nftId);

        for (uint256 i; i < s_nftId; ++i) {
            address agentWallet = s_nftIdToCovenantData[i].agentWallet;
            data[i].nftId = i;
            data[i].agentName = s_agentDetails[agentWallet].agentName;
            data[i].agentId = s_agentDetails[agentWallet].agentId;
            data[i].owner = _ownerOf(i);
            data[i].settlementData = s_nftSettlementData[i];
            data[i].covenantData = s_nftIdToCovenantData[i];
        }

        return data;
    }

    /// @notice Retrieves details of a specific Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @return CovenantData Covenant NFT details
    function getCovenant(uint256 nftId) external view returns (CovenantData memory) {
        return s_nftIdToCovenantData[nftId];
    }

    /// @notice Checks if the contract supports a specific interface
    /// @param interfaceId The ID of the interface to check
    /// @return Returns whether the interface is supported
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlDefaultAdminRules, ERC721)
        returns (bool)
    {
        return interfaceId == type(IAccessControlDefaultAdminRules).interfaceId
            || interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC721Metadata).interfaceId;
    }
}
