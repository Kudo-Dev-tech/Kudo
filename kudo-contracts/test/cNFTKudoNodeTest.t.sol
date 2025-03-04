// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {CovenantNFT} from "../src/CovenantNFT.sol";
import {CovenantNFTKudoNode} from "../src/cNFTKudoNode.sol";
import {MockRouter} from "./mock/mockRouter.sol";
import {ERC721, IERC721, IERC721Metadata, IERC721Errors} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {
    IAccessControl,
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract CounterTest is Test {
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");

    uint48 constant INITIAL_DELAY = 60;
    uint128 constant SETTLEMENT_TARGET = 10 ether;
    uint128 constant PRICE = 1_000_000;

    bool constant SHOULD_WATCH = true;

    address constant STRANGER = address(10000);
    address constant AGENT_WALLET_ONE = address(101);
    address constant AGENT_WALLET_TWO = address(102);

    address constant EVALUATOR_ONE = address(201);

    address constant OWNER = address(1);

    CovenantNFTKudoNode public s_cNft;

    MockRouter public s_router;

    string public s_tee;
    string public s_agentId;

    string public s_goal;

    ERC20Mock public s_testToken;

    function setUp() public {
        s_router = new MockRouter();

        s_cNft = new CovenantNFTKudoNode(address(s_router), OWNER, INITIAL_DELAY);

        s_tee = "TEE 101";
        s_agentId = "Agent ID";

        s_goal = "Earn 10 Test Token";

        s_testToken = new ERC20Mock();
    }

    function test_RevertWhen_RegisterAgentCalledByRegisteredAgent() public registerAgent(AGENT_WALLET_ONE, s_tee) {
        vm.startPrank(AGENT_WALLET_ONE);
        vm.expectRevert(CovenantNFT.AgentRegistered.selector);
        s_cNft.registerAgent(s_tee, s_agentId, "Agent Name");
    }

    function test_RegisterAgent() public registerAgent(AGENT_WALLET_ONE, s_tee) {
        string memory teeId;
        uint256[] memory taskId;

        (teeId, taskId) = s_cNft.getAgentDetails(AGENT_WALLET_ONE);

        assertEq(teeId, s_tee);
        assertEq(taskId, new uint256[](0));
    }

    function test_RegisterCovenant()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        assertEq(s_cNft.getCovenant(0).agentWallet, AGENT_WALLET_ONE);
        assertEq(s_cNft.getCovenant(0).goal, s_goal);
        assertEq(s_cNft.getCovenant(0).data, bytes(""));
        assertEq(s_cNft.getCovenant(0).shouldWatch, SHOULD_WATCH);
        assertEq(uint256(s_cNft.getCovenant(0).status), 0);
    }

    function test_RegisterSubgoalsCovenant()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerSubgoalCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        assertEq(s_cNft.getCovenant(1).agentWallet, AGENT_WALLET_ONE);
        assertEq(s_cNft.getCovenant(1).goal, s_goal);
        assertEq(s_cNft.getCovenant(1).data, bytes(""));
        assertEq(uint256(s_cNft.getCovenant(1).status), 0);
        assertEq(s_cNft.getCovenant(0).subgoalsId[0], 1);
    }

    function test_RevertWhenCovenantStatusCalledByNonAgent()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerEvaluator(EVALUATOR_ONE)
    {
        vm.startPrank(STRANGER);
        vm.expectRevert(CovenantNFT.CallerIsNotAuthorized.selector);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);
    }

    function test_RevertWhenCovenantStatusIsSetCompletedWithUnfinishedSubgoals()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerSubgoalCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerEvaluator(EVALUATOR_ONE)
    {
        vm.startPrank(EVALUATOR_ONE);
        vm.expectRevert(CovenantNFT.ConditionIsNotMet.selector);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);
    }

    function test_UpdateCovenantStatus()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerEvaluator(EVALUATOR_ONE)
    {
        s_testToken.mint(AGENT_WALLET_ONE, 10 ether);

        vm.startPrank(AGENT_WALLET_ONE);
        s_testToken.approve(address(s_cNft), UINT256_MAX);

        vm.startPrank(EVALUATOR_ONE);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);

        assertEq(uint256(s_cNft.getCovenant(0).status), 1);
    }

    function test_RevertWhenUpdateSettlementDataByUnauthorizedWallet()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        vm.startPrank(AGENT_WALLET_ONE);

        vm.expectRevert(CovenantNFT.CallerIsNotAuthorized.selector);
        s_cNft.setSettlementData(1, "THIS IS THE SETTLEMENT DATA");
    }

    function test_UpdateSettlementData()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        vm.startPrank(AGENT_WALLET_TWO);
        s_cNft.setSettlementData(1, "THIS IS THE SETTLEMENT DATA");

        assertEq("THIS IS THE SETTLEMENT DATA", s_cNft.s_nftSettlementData(1));
    }

    function test_UpdateCovenantStatusWithSubgoals()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
        registerEvaluator(EVALUATOR_ONE)
    {
        s_testToken.mint(AGENT_WALLET_ONE, 10 ether);
        s_testToken.mint(AGENT_WALLET_TWO, 10 ether);

        vm.startPrank(AGENT_WALLET_TWO);
        s_testToken.approve(address(s_cNft), UINT256_MAX);

        vm.startPrank(AGENT_WALLET_ONE);
        s_testToken.approve(address(s_cNft), UINT256_MAX);

        vm.startPrank(EVALUATOR_ONE);
        s_cNft.setCovenantStatus(1, CovenantNFT.CovenantStatus.COMPLETED);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);

        assertEq(uint256(s_cNft.getCovenant(1).status), 1);
        assertEq(uint256(s_cNft.getCovenant(0).status), 1);
    }

    function test_IsAgentRegistered_WhenAgentIsNotRegistered() public view {
        assertEq(s_cNft.isAgentRegistered(AGENT_WALLET_ONE), false);
    }

    function test_Purchase()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        s_testToken.mint(AGENT_WALLET_TWO, 10 ether);

        vm.startPrank(AGENT_WALLET_TWO);
        s_testToken.approve(address(s_cNft), UINT256_MAX);
        s_cNft.purchase(0, "This is the detailed goal");

        assertEq(s_cNft.ownerOf(0), AGENT_WALLET_TWO);
    }

    function test_IsAgentRegistered_WhenAgentIsRegistered() public registerAgent(AGENT_WALLET_ONE, s_tee) {
        assertEq(s_cNft.isAgentRegistered(AGENT_WALLET_ONE), true);
    }

    function test_GetAgentCovenantsData()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        CovenantNFT.CovenantDetails[] memory data = s_cNft.getAgentCovenantsData(AGENT_WALLET_ONE);

        assertEq(data[0].nftId, 0);
        assertEq(data[0].covenantData.agentWallet, AGENT_WALLET_ONE);
        assertEq(data[0].covenantData.goal, s_goal);
        assertEq(data[0].covenantData.data, bytes(""));
        assertEq(data[0].covenantData.shouldWatch, SHOULD_WATCH);
        assertEq(data[0].covenantData.settlementDetail.settlementAsset, address(s_testToken));
        assertEq(data[0].covenantData.settlementDetail.settlementAmount, SETTLEMENT_TARGET);
        assertEq(uint256(data[0].covenantData.status), 0);
    }

    function test_GetAgentDetails()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            PRICE,
            1 ether,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        string memory teeId;
        uint256[] memory taskId;

        (teeId, taskId) = s_cNft.getAgentDetails(AGENT_WALLET_ONE);

        assertEq(teeId, s_tee);
        assertEq(taskId[0], 0);
    }

    function test_GetCovenantsDetails()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            1 ether
        )
    {
        CovenantNFT.CovenantDetails[] memory data = s_cNft.getCovenantsDetails();

        assertEq(data[0].nftId, 0);
        assertEq(data[0].covenantData.agentWallet, AGENT_WALLET_ONE);
        assertEq(data[0].covenantData.goal, s_goal);
        assertEq(data[0].covenantData.data, bytes(""));
        assertEq(data[0].covenantData.shouldWatch, SHOULD_WATCH);
        assertEq(data[0].covenantData.settlementDetail.settlementAsset, address(s_testToken));
        assertEq(data[0].covenantData.settlementDetail.settlementAmount, SETTLEMENT_TARGET);
        assertEq(uint256(data[0].covenantData.status), 0);
    }

    function test_SupportsInterface() public view {
        assertEq(s_cNft.supportsInterface(type(IAccessControlDefaultAdminRules).interfaceId), true);
        assertEq(s_cNft.supportsInterface(type(IERC721).interfaceId), true);
        assertEq(s_cNft.supportsInterface(type(IERC721Metadata).interfaceId), true);
    }

    function test_BurnNftWhenAgentAbilityPointIsInsufficient()
        public
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes(""),
            0
        )
    {
        vm.startPrank(address(s_router));

        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 1));
        assertEq(s_cNft.ownerOf(1), address(0));
    }

    modifier registerAgent(address agent, string memory tee) {
        vm.startPrank(agent);
        s_cNft.registerAgent(tee, "AGENT_ID", "Agent Name");
        vm.stopPrank();
        _;
    }

    modifier registerCovenant(
        address agent,
        string memory goal,
        address settlementAsset,
        uint128 settelementAmount,
        uint128 minAbilityScore,
        uint128 price,
        bool shouldWatch,
        bytes memory data,
        uint256 agentAbilityScore
    ) {
        vm.startPrank(agent);
        bytes32 requestId =
            s_cNft.registerCovenant(goal, settlementAsset, settelementAmount, minAbilityScore, price, shouldWatch, data);

        vm.startPrank(address(s_router));
        s_cNft.fulfillRequest(requestId, uint128(agentAbilityScore));
        vm.stopPrank();
        _;
    }

    modifier registerEvaluator(address evaluator) {
        vm.startPrank(OWNER);
        s_cNft.whitelistEvaluator(evaluator);
        vm.stopPrank();
        _;
    }

    modifier registerSubgoalCovenant(
        address agent,
        string memory goal,
        uint64 parentId,
        address settlementAsset,
        uint128 settelementAmount,
        bool shouldWatch,
        bytes memory data,
        uint256 agentAbilityScore
    ) {
        vm.startPrank(agent);
        bytes32 requestId =
            s_cNft.registerCovenant(goal, parentId, settlementAsset, settelementAmount, shouldWatch, data);

        vm.startPrank(address(s_router));
        s_cNft.fulfillRequest(requestId, uint128(agentAbilityScore));

        vm.stopPrank();
        _;
    }
}
