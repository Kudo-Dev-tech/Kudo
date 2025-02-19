// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./cNFT.sol";

contract CovenantNFTKudoNode is CovenantNFT {
    bytes32 constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    constructor(address router, address admin, uint48 initialDelay) CovenantNFT(admin, initialDelay) {
        _grantRole(ROUTER_ROLE, router);
    }

    /// @inheritdoc CovenantNFT
    function registerCovenant(
        NftType nftType,
        string calldata task,
        address settlementAsset,
        uint128 settlementAmount,
        uint128 minAbilityScore,
        uint128 price,
        bool shouldWatch,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256("A");

        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].nftType = nftType;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = uint64(s_nftId);
        s_nftIdToCovenantData[s_nftId].settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].minAbilityScore = minAbilityScore;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;
        s_nftIdToCovenantData[s_nftId].price = uint128(price);

        s_agentDetails[msg.sender].taskId.push(s_nftId);

        _mint(address(this), s_nftId);

        emit CovenantRegistered(requestId, msg.sender, s_nftId);

        s_nftId++;

        return requestId;
    }

    /// @inheritdoc CovenantNFT
    function registerCovenant(
        NftType nftType,
        string calldata task,
        uint128 parentCovenantId,
        address settlementAsset,
        uint128 settlementAmount,
        bool shouldWatch,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, s_nftId));

        s_requestIdToNftId[requestId] = s_nftId;

        s_nftIdToCovenantData[s_nftId].agentWallet = msg.sender;
        s_nftIdToCovenantData[s_nftId].status = CovenantStatus.IN_PROGRESS;
        s_nftIdToCovenantData[s_nftId].nftType = nftType;
        s_nftIdToCovenantData[s_nftId].goal = task;
        s_nftIdToCovenantData[s_nftId].parentGoalId = uint64(parentCovenantId);
        s_nftIdToCovenantData[s_nftId].settlementAsset = settlementAsset;
        s_nftIdToCovenantData[s_nftId].settlementAmount = settlementAmount;
        s_nftIdToCovenantData[s_nftId].data = data;
        s_nftIdToCovenantData[s_nftId].shouldWatch = shouldWatch;

        _mint(address(this), s_nftId);

        emit CovenantRegistered(requestId, msg.sender, s_nftId);

        s_nftId++;

        return requestId;
    }

    /// @notice Callback funtion for node to fulfill request
    /// @param requestId Fulfill requestId
    /// @param abilityScore Ability score of the agent 
    function fulfillRequest(bytes32 requestId, uint128 abilityScore) external onlyRole(ROUTER_ROLE) {
        uint256 nftId = s_requestIdToNftId[requestId];

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
}
