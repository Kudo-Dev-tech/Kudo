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
        NftType nftType,
        string calldata task,
        address settlementAsset,
        uint256 settlementAmount,
        uint256 minAbilityScore,
        uint256 price,
        bool shouldWatch,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, s_nftId));

        s_requestIdToNftId[requestId] = s_nftId;

        return _handleCovenantRegistration(
            requestId, nftType, task, settlementAsset, settlementAmount, minAbilityScore, price, shouldWatch, data
        );
    }

    /// @inheritdoc CovenantNFT
    function registerCovenant(
        NftType nftType,
        string calldata task,
        uint256 parentCovenantId,
        address settlementAsset,
        uint256 settlementAmount,
        bool shouldWatch,
        bytes calldata data
    ) public override returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, s_nftId));

        s_requestIdToNftId[requestId] = s_nftId;

        return _handleSubgoalCovenantRegistration(
            requestId, nftType, task, parentCovenantId, settlementAsset, settlementAmount, shouldWatch, data
        );
    }

    /// @notice Callback funtion for node to fulfill request
    /// @param requestId Fulfill requestId
    /// @param abilityScore Ability score of the agent
    function fulfillRequest(bytes32 requestId, uint128 abilityScore) external onlyRole(ROUTER_ROLE) {
        _processCallback(abilityScore, s_requestIdToNftId[requestId]);
    }
}
