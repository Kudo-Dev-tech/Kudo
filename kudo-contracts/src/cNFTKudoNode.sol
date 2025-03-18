// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./CovenantNFT.sol";

contract CovenantNFTKudoNode is CovenantNFT {
    bytes32 constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    constructor(address router, address admin, uint48 initialDelay) CovenantNFT(admin, initialDelay) {
        _grantRole(ROUTER_ROLE, router);
    }

    /// @inheritdoc CovenantNFT
    function registerCovenant(
        string calldata task,
        address settlementAsset,
        uint128 settlementAmount,
        uint128 minAbilityScore,
        uint128 price,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, s_nftId));

        s_requestIdToNftId[requestId] = s_nftId;

        return _handleCovenantRegistration(
            requestId, task, settlementAsset, settlementAmount, minAbilityScore, price, shouldWatch, isEscrowed, data
        );
    }

    /// @inheritdoc CovenantNFT
    function registerCovenant(
        string calldata task,
        uint128 parentCovenantId,
        address settlementAsset,
        uint128 settlementAmount,
        bool shouldWatch,
        bool isEscrowed,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, s_nftId));

        s_requestIdToNftId[requestId] = s_nftId;

        return _handleSubgoalCovenantRegistration(
            requestId, task, parentCovenantId, settlementAsset, settlementAmount, shouldWatch, isEscrowed, data
        );
    }

    /// @notice Callback funtion for node to fulfill request
    /// @param requestId Fulfill requestId
    /// @param abilityScore Ability score of the agent
    function fulfillRequest(bytes32 requestId, uint128 abilityScore) external onlyRole(ROUTER_ROLE) {
        _processCallback(abilityScore, s_requestIdToNftId[requestId]);
    }
}
