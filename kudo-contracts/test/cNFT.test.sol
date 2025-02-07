// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {CovenantNFT} from "../src/cNFT.sol";
import {MockRouter} from "./mock/mockRouter.sol";

contract CounterTest is Test {
    uint48 constant INITIAL_DELAY = 60;
    uint256 constant SETTLEMENT_TARGET = 10 ether;
    uint256 constant PRICE = 1_000_000;

    bool constant SHOULD_WATCH = true;

    address constant STRANGER = address(10000);
    address constant AGENT_WALLET_ONE = address(101);
    address constant AGENT_WALLET_TWO = address(102);

    address constant OWNER = address(1);

    CovenantNFT public s_cNft;

    MockRouter public s_router;

    string public s_tee;
    string public s_agentId;

    string public s_goal;

    ERC20Mock public s_testToken;

    function setUp() public {
        s_router = new MockRouter();

        s_cNft = new CovenantNFT(bytes32(""), 0, address(s_router), OWNER, INITIAL_DELAY);

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
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
    {
        assertEq(s_cNft.getCovenant(0).agentWallet, AGENT_WALLET_ONE);
        assertEq(uint256(s_cNft.getCovenant(0).nftType), 1);
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
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
        )
    {
        assertEq(s_cNft.getCovenant(1).agentWallet, AGENT_WALLET_ONE);
        assertEq(s_cNft.getCovenant(1).goal, s_goal);
        assertEq(s_cNft.getCovenant(1).data, bytes(""));
        assertEq(uint256(s_cNft.getCovenant(1).status), 0);
        assertEq(s_cNft.getCovenant(0).subgoalsId[0], 1);
    }

    function test_revertWhenCovenantStatusCalledByNonAgent()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
    {
        vm.expectRevert(CovenantNFT.CallerIsNotAuthorizedAgent.selector);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);
    }

    function test_revertWhenCovenantStatusIsSetCompletedWithUnfinishedSubgoals()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
        )
    {
        vm.startPrank(AGENT_WALLET_ONE);
        vm.expectRevert(CovenantNFT.ConditionIsNotMet.selector);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);
    }

    function test_RevertWhen_NonParentGoalAgentUpdateSubgoalCNft()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
        )
    {
        s_testToken.mint(AGENT_WALLET_ONE, 10 ether);
        s_testToken.mint(AGENT_WALLET_TWO, 10 ether);

        vm.startPrank(AGENT_WALLET_TWO);
        s_testToken.approve(address(s_cNft), UINT256_MAX);

        vm.expectRevert(CovenantNFT.CallerIsNotAuthorizedAgent.selector);
        s_cNft.setCovenantStatus(1, CovenantNFT.CovenantStatus.COMPLETED);
    }

    function test_UpdateCovenantStatus()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
    {
        s_testToken.mint(AGENT_WALLET_ONE, 10 ether);

        vm.startPrank(AGENT_WALLET_ONE);
        s_testToken.approve(address(s_cNft), UINT256_MAX);
        s_cNft.setCovenantStatus(0, CovenantNFT.CovenantStatus.COMPLETED);

        assertEq(uint256(s_cNft.getCovenant(0).status), 1);
    }

    function test_RevertWhenUpdateSettlementDataByUnauthorizedWallet()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
        )
    {
        vm.startPrank(AGENT_WALLET_ONE);

        vm.expectRevert(CovenantNFT.CallerIsNotAuthorizedAgent.selector);
        s_cNft.setSettlementData(1, "THIS IS THE SETTLEMENT DATA");
    }

    function test_UpdateSettlementData()
        public
        registerAgent(AGENT_WALLET_ONE, s_tee)
        registerCovenant(
            AGENT_WALLET_ONE,
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
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
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
        registerSubgoalCovenant(
            AGENT_WALLET_TWO,
            CovenantNFT.NftType.LOAN,
            s_goal,
            0,
            address(s_testToken),
            SETTLEMENT_TARGET,
            SHOULD_WATCH,
            bytes("")
        )
    {
        s_testToken.mint(AGENT_WALLET_ONE, 10 ether);
        s_testToken.mint(AGENT_WALLET_TWO, 10 ether);

        vm.startPrank(AGENT_WALLET_TWO);
        s_testToken.approve(address(s_cNft), UINT256_MAX);

        vm.startPrank(AGENT_WALLET_ONE);
        s_testToken.approve(address(s_cNft), UINT256_MAX);
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
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
    {
        s_testToken.mint(AGENT_WALLET_TWO, 10 ether);

        vm.startPrank(AGENT_WALLET_TWO);
        s_testToken.approve(address(s_cNft), UINT256_MAX);
        s_cNft.purchase(0);

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
            CovenantNFT.NftType.LOAN,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            bytes("")
        )
    {
        CovenantNFT.CovenantDetails[] memory data = s_cNft.getAgentCovenantsData(AGENT_WALLET_ONE);

        assertEq(data[0].nftId, 0);
        assertEq(uint256(data[0].nftType), 1);
        assertEq(data[0].agentWallet, AGENT_WALLET_ONE);
        assertEq(data[0].goal, s_goal);
        assertEq(data[0].data, bytes(""));
        assertEq(data[0].shouldWatch, SHOULD_WATCH);
        assertEq(data[0].settlementAsset, address(s_testToken));
        assertEq(data[0].settlementAmount, SETTLEMENT_TARGET);
        assertEq(uint256(data[0].status), 0);
    }

    modifier registerAgent(address agent, string memory tee) {
        vm.startPrank(agent);
        s_cNft.registerAgent(tee, "AGENT_ID", "Agent Name");
        vm.stopPrank();
        _;
    }

    modifier registerCovenant(
        address agent,
        CovenantNFT.NftType nftType,
        string memory goal,
        address settlementAsset,
        uint256 settelementAmount,
        uint256 minAbilityScore,
        uint256 price,
        bool shouldWatch,
        bytes memory data
    ) {
        vm.startPrank(agent);
        s_cNft.registerCovenant(
            nftType, goal, settlementAsset, settelementAmount, price, minAbilityScore, shouldWatch, data
        );
        vm.stopPrank();
        _;
    }

    modifier registerSubgoalCovenant(
        address agent,
        CovenantNFT.NftType nftType,
        string memory goal,
        uint256 parentId,
        address settlementAsset,
        uint256 settelementAmount,
        bool shouldWatch,
        bytes memory data
    ) {
        vm.startPrank(agent);
        s_cNft.registerCovenant(nftType, goal, parentId, settlementAsset, settelementAmount, shouldWatch, data);

        vm.startPrank(address(s_router));
        s_cNft.handleOracleFulfillment(bytes32("1"), bytes("1000000000000000000"), bytes(""));

        vm.stopPrank();
        _;
    }
}
