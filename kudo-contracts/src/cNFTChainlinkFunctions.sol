// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./cNFT.sol";
import {FunctionsClient} from "chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

contract CovenantNFTCLFunctions is CovenantNFT, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    /// @notice Gas limit for Chainlink callback
    uint32 constant GAS_LIMIT = 300000;

    /// @notice Chainlink Functions source code for API request
    string constant SOURCE = "const address = args[0];" "const minScore = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://kudo-client.vercel.app/api/verification`," "method: 'POST'," "headers: {"
        "'Content-Type': 'application/json'," "}," "data: {" "address: `${address}`," "minAbilityScore: `${minScore}`"
        "}});" "if (apiResponse.error) { throw Error('Error');}" "const { data } = apiResponse;"
        "return Functions.encodeString(data.abilityScore);";
    bytes32 constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    /// @notice Chainlink DON identifier
    bytes32 i_donID;

    /// @notice Chainlink functions router
    address s_router;

    /// @notice Chainlink functions subscription id
    uint64 s_subsId;

    constructor(bytes32 donId, uint64 subsId, address router, address admin, uint48 initialDelay)
        CovenantNFT(admin, initialDelay)
        FunctionsClient(router)
    {
        s_router = router;
        i_donID = donId;
        s_subsId = subsId;
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
        string[] memory input = new string[](2);

        input[0] = Strings.toHexString(uint256(uint160(msg.sender)), 20);
        input[1] = Strings.toString(minAbilityScore);

        bytes32 requestId = sendRequest(s_subsId, input);

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
        string[] memory input = new string[](2);

        input[0] = Strings.toHexString(uint256(uint160(msg.sender)), 20);
        input[1] = Strings.toString(s_nftIdToCovenantData[parentCovenantId].minAbilityScore);

        bytes32 requestId = sendRequest(s_subsId, input);

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

    /// @inheritdoc FunctionsClient
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory) internal override {
        uint256 nftId = s_requestIdToNftId[requestId];
        uint128 abilityScore = uint128(Strings.parseUint(string(response)));

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

    /// @notice Sends an HTTP request for character information
    /// @param subscriptionId The ID for the Chainlink subscription
    /// @param args The arguments to pass to the HTTP request
    /// @return requestId Request ID to Chainlink functions
    function sendRequest(uint64 subscriptionId, string[] memory args) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req = FunctionsRequest.Request(
            FunctionsRequest.Location.Inline,
            FunctionsRequest.Location.Inline,
            FunctionsRequest.CodeLanguage.JavaScript,
            "",
            "",
            new string[](0),
            new bytes[](0)
        );
        req.initializeRequestForInlineJavaScript(SOURCE); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        return _sendRequest(req.encodeCBOR(), subscriptionId, GAS_LIMIT, i_donID);
    }
}
