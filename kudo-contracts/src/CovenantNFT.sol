// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {ERC721, IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20, IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
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

    /// @notice NFT Type counter
    uint256 private s_nftTypeCounter;

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

    /// @notice Maps an NFT type ID to its corresponding NFT type name
    mapping(uint256 nftType => string nftTypeName) private s_nftTypeIdToNftTypeName;

    /// @notice Stores nft type name status
    mapping(string nftTypeName => bool nftTypeNameStatus) private s_nftTypeNameStatus;

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

    /// @notice Emitted when the NFT Type is set
    /// @param nftTypeId  The nft type id
    /// @param nftTypeName Nft type name
    event NftTypeNameSet(uint256 indexed nftTypeId, string nftTypeName);

    /// @notice Thrown when the caller is not an authorized agent
    error AccessForbidden();

    /// @notice Thrown when an agent is already registered
    error AgentRegistered();

    /// @notice Thrown when a required condition is not met
    error ConditionIsNotMet();

    /// @notice Thrown when a nft type name is already added
    error NftTypeExist();

    /// @notice Covenant NFT details
    struct CovenantData {
        /// @notice Agent wallet address
        address agentWallet;
        /// @notice The current status of the covenant
        CovenantStatus status;
        /// @notice The Covenant NFT Type
        string nftType;
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
        /// @notice Settlement status
        string settlementStatus;
        /// @notice Array of subgoals agent
        string[] subgoalAgents;
        /// @notice
        string parentGoalAgent;
        /// @notice Covenant NFT data
        CovenantData covenantData;
    }

    struct SettlementDetails {
        /// @notice The promised asset at settlement
        address settlementAsset;
        /// @notice The promised asset decimals
        uint8 settlementAssetDecimals;
        /// @notice The promised asset symbol
        string settlementAssetSymbol;
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

    constructor(string[] memory nftTypeName, address admin, uint48 initialDelay)
        ERC721("Covenant NFT", "cNFT")
        AccessControlDefaultAdminRules(initialDelay, admin)
    {
        _addNftType(nftTypeName);
    }

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

    /// @notice Adds new NFT types
    /// @param nftTypeName An array of NFT type names to be added
    function addNftType(string[] memory nftTypeName) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _addNftType(nftTypeName);
    }

    /// @notice Update NFT type name based on the NFT type id
    /// @param id NFT Type id
    /// @param nftTypeName New NFT type name
    function setNftTypeName(uint256 id, string memory nftTypeName) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_nftTypeNameStatus[s_nftTypeIdToNftTypeName[id]];
        s_nftTypeIdToNftTypeName[id] = nftTypeName;
        s_nftTypeNameStatus[nftTypeName] = true;

        emit NftTypeNameSet(id, nftTypeName);
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
        uint256 nftType,
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
        uint256 nftType,
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

            address agentWallet = s_nftIdToCovenantData[nftId].agentWallet;

            if (s_nftIdToCovenantData[nftId].isEscrowed) {
                IERC20(s_nftIdToCovenantData[nftId].settlementDetail.settlementAsset).safeTransfer(
                    ownerOf(nftId), s_nftIdToCovenantData[nftId].settlementDetail.settlementAmount
                );
            } else {
                //slither-disable-next-line arbitrary-send-erc20
                IERC20(s_nftIdToCovenantData[nftId].settlementDetail.settlementAsset).safeTransferFrom(
                    agentWallet, ownerOf(nftId), s_nftIdToCovenantData[nftId].settlementDetail.settlementAmount
                );
            }

            _burn(nftId);
        }

        emit CovenantStatusSet(nftId, status);
    }

    /// @notice Handles the registration of a Covenant
    /// @dev Processes covenant-related data and determines settlement parameters
    /// @param requestId The unique identifier for the request
    /// @param task The task associated with the subgoal
    /// @param nftTypeId The NFT type ID
    /// @param settlementAsset The asset used for settlement
    /// @param settlementAmount The amount required for settlement
    /// @param minAbilityScore The minimum ability score to take the Covenant NFT task
    /// @param price The purchase price for the Covenant NFT
    /// @param shouldWatch Indicates whether the covenant should be monitored by evaluator agent
    /// @param isEscrowed Specifies if the settlement amount is escrowed
    /// @param data Additional data related to the Covenant NFT
    /// @return bytes32 Id for API call request
    function _handleCovenantRegistration(
        bytes32 requestId,
        string calldata task,
        uint256 nftTypeId,
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
        s_nftIdToCovenantData[s_nftId].nftType = s_nftTypeIdToNftTypeName[nftTypeId];
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

    /// @notice Handles the registration of a subgoal covenant.
    /// @dev Processes covenant-related data and determines settlement parameters.
    /// @param requestId The unique identifier for the request
    /// @param task The task associated with the subgoal
    /// @param nftTypeId The NFT type ID
    /// @param parentCovenantId The parent covenant ID
    /// @param settlementAsset The asset used for settlement
    /// @param settlementAmount The amount required for settlement
    /// @param shouldWatch Indicates whether the covenant should be monitored by evaluator agent
    /// @param isEscrowed Specifies if the settlement amount is escrowed
    /// @param data Additional data related to the Covenant NFT
    /// @return bytes32 Id for API call request
    function _handleSubgoalCovenantRegistration(
        bytes32 requestId,
        string calldata task,
        uint256 nftTypeId,
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
        s_nftIdToCovenantData[s_nftId].nftType = s_nftTypeIdToNftTypeName[nftTypeId];
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

    /// @notice Process a callback with ability score and NFT ID.
    /// @dev Handles logic related to ability scores and specific NFTs.
    /// @param abilityScore The ability score associated with the NFT.
    /// @param nftId The unique identifier of the NFT.
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

    /// @notice Adds new NFT types
    /// @param nftTypeName An array of NFT type names to be added
    function _addNftType(string[] memory nftTypeName) internal {
        for (uint256 i; i < nftTypeName.length; ++i) {
            if (s_nftTypeNameStatus[nftTypeName[i]]) revert NftTypeExist();
            s_nftTypeNameStatus[nftTypeName[i]] = true;
            s_nftTypeIdToNftTypeName[s_nftTypeCounter] = nftTypeName[i];

            emit NftTypeNameSet(s_nftTypeCounter, nftTypeName[i]);

            ++s_nftTypeCounter;
        }
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
        string[] memory subgoalsAgents = new string[](s_nftIdToCovenantData[nftId].subgoalsId.length);
        for (uint256 i; i < s_nftIdToCovenantData[nftId].subgoalsId.length; ++i) {
            subgoalsAgents[i] =
                s_agentDetails[s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].subgoalsId[i]].agentWallet].agentName;
        }

        CovenantDetails memory data = CovenantDetails({
            nftId: nftId,
            agentName: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].agentName,
            agentId: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet].agentId,
            owner: _ownerOf(nftId),
            settlementData: s_nftSettlementData[nftId],
            settlementStatus: uint8(s_nftIdToCovenantData[nftId].status) == 1 ? "Settled" : "Pending",
            subgoalAgents: subgoalsAgents,
            parentGoalAgent: s_agentDetails[s_nftIdToCovenantData[s_nftIdToCovenantData[nftId].parentGoalId].agentWallet]
                .agentName,
            covenantData: s_nftIdToCovenantData[nftId]
        });

        data.covenantData.settlementDetail.settlementAssetDecimals =
            IERC20Metadata(data.covenantData.settlementDetail.settlementAsset).decimals();
        data.covenantData.settlementDetail.settlementAssetSymbol =
            IERC20Metadata(data.covenantData.settlementDetail.settlementAsset).symbol();

        return data;
    }

    /// @notice Retrieves all of the covenants details
    /// @return CovenantDetails[] Details of all covenant NFT
    function getCovenantsDetails() external view returns (CovenantDetails[] memory) {
        CovenantDetails[] memory data = new CovenantDetails[](s_nftId);

        for (uint256 i; i < s_nftId; ++i) {
            string[] memory subgoalsAgents = new string[](s_nftIdToCovenantData[i].subgoalsId.length);
            for (uint256 u; u < s_nftIdToCovenantData[i].subgoalsId.length; ++u) {
                subgoalsAgents[u] =
                    s_agentDetails[s_nftIdToCovenantData[s_nftIdToCovenantData[i].subgoalsId[u]].agentWallet].agentName;
            }

            address agentWallet = s_nftIdToCovenantData[i].agentWallet;
            data[i].nftId = i;
            data[i].agentName = s_agentDetails[agentWallet].agentName;
            data[i].agentId = s_agentDetails[agentWallet].agentId;
            data[i].owner = _ownerOf(i);
            data[i].settlementData = s_nftSettlementData[i];
            data[i].settlementStatus = uint8(s_nftIdToCovenantData[i].status) == 1 ? "Settled" : "Pending";
            data[i].subgoalAgents = subgoalsAgents;
            data[i].parentGoalAgent =
                s_agentDetails[s_nftIdToCovenantData[s_nftIdToCovenantData[i].parentGoalId].agentWallet].agentName;
            data[i].covenantData = s_nftIdToCovenantData[i];
            data[i].covenantData.settlementDetail.settlementAssetDecimals =
                IERC20Metadata(data[i].covenantData.settlementDetail.settlementAsset).decimals();
            data[i].covenantData.settlementDetail.settlementAssetSymbol =
                IERC20Metadata(data[i].covenantData.settlementDetail.settlementAsset).symbol();
        }

        return data;
    }

    /// @notice Retrieves details of a specific Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @return CovenantData Covenant NFT details
    function getCovenant(uint256 nftId) external view returns (CovenantData memory) {
        return s_nftIdToCovenantData[nftId];
    }

    /// @notice Retrieves the name of an NFT type based on its ID.
    /// @param id The NFT type ID.
    /// @return The name of the NFT type.
    function getNftTypeName(uint256 id) external view returns (string memory) {
        return s_nftTypeIdToNftTypeName[id];
    }

    /// @notice Retrieves all NFT type names.
    /// @return Array of NFT type names
    function getAllNftTypeNames() external view returns (string[] memory) {
        string[] memory nftTypeNames = new string[](s_nftTypeCounter);

        for (uint256 i; i < s_nftTypeCounter; ++i) {
            nftTypeNames[i] = s_nftTypeIdToNftTypeName[i];
        }

        return nftTypeNames;
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
