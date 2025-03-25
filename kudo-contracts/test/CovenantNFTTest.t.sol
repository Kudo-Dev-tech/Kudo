// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {CovenantNFT} from "../src/CovenantNFT.sol";
import {CovenantEvaluator} from "../src/CovenantEvaluator.sol";
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
    bytes32 public constant EVALUATOR_CONTRACT_ROLE = keccak256("EVALUATOR_CONTRACT_ROLE");

    uint48 constant INITIAL_DELAY = 60;
    uint128 constant SETTLEMENT_TARGET = 10 ether;
    uint128 constant PRICE = 1_000_000;

    uint256 constant MIN_APPROVAL = 3;
    uint256 constant MIN_STAKE_AMOUNT = 100 ether;
    uint256 constant MAX_CONSECUTIVE_WRONG_ANSWER = 1;

    uint256 constant BASE_SUSPEND_TIME = 1 days;
    uint256 constant BASE_SLASH_PERCENTAGE = 0.1 ether;

    bool constant SHOULD_WATCH = true;

    address constant STRANGER = address(10000);
    address constant AGENT_WALLET_ONE = address(101);
    address constant AGENT_WALLET_TWO = address(102);

    address constant EVALUATOR_ONE = address(201);
    address constant EVALUATOR_TWO = address(202);
    address constant EVALUATOR_THREE = address(203);

    address constant OWNER = address(1);

    CovenantNFTKudoNode public s_cNft;

    CovenantEvaluator public s_evaluator;

    MockRouter public s_router;

    string public s_tee;
    string public s_agentId;

    string public s_goal;

    ERC20Mock public s_testToken;

    function setUp() public {
        s_router = new MockRouter();

        s_testToken = new ERC20Mock();

        s_cNft = new CovenantNFTKudoNode(address(s_router), OWNER, INITIAL_DELAY);

        s_evaluator = new CovenantEvaluator(
            address(s_cNft),
            address(s_testToken),
            MIN_APPROVAL,
            MAX_CONSECUTIVE_WRONG_ANSWER,
            BASE_SUSPEND_TIME,
            BASE_SLASH_PERCENTAGE,
            MIN_STAKE_AMOUNT,
            OWNER,
            INITIAL_DELAY
        );

        vm.prank(OWNER);
        s_cNft.grantRole(EVALUATOR_CONTRACT_ROLE, address(s_evaluator));

        s_tee = "TEE 101";
        s_agentId = "Agent ID";

        s_goal = "Earn 10 Test Token";

        deal(address(s_testToken), AGENT_WALLET_ONE, 100000 ether);
    }

    function test_WhitelistEvaluator() public whitelistEvaluator(EVALUATOR_ONE) {
        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_ONE).whitelistStatus, true);
    }

    function test_RemoveWhitelistedEvaluator() public whitelistEvaluator(EVALUATOR_ONE) {
        vm.prank(OWNER);
        s_evaluator.removeEvaluator(EVALUATOR_ONE);

        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_ONE).whitelistStatus, false);
    }

    function test_WhitelistedEvaluatorStake()
        public
        whitelistEvaluator(EVALUATOR_ONE)
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
    {
        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_ONE).stakeBalance, MIN_STAKE_AMOUNT);
    }

    function test_SetMaxConsecutiveInvalidAnswer() public {
        uint256 newMaxConsecutiveInvalidAnswerValue = 5;

        vm.prank(OWNER);
        s_evaluator.setMaxConsecutiveInvalidAnswer(newMaxConsecutiveInvalidAnswerValue);

        assertEq(s_evaluator.getMaximumConsecutiveInvalidAnswer(), newMaxConsecutiveInvalidAnswerValue);
    }

    function test_RevertWhen_SetMinimumEvaluationIsEven() public {
        vm.expectRevert(CovenantEvaluator.MinimumEvaluationIsEven.selector);
        vm.prank(OWNER);
        s_evaluator.setMinimumEvaluation(2);
    }

    function test_SetMinimumEvaluation() public {
        uint256 newEvalutionValue = 5;

        vm.prank(OWNER);
        s_evaluator.setMinimumEvaluation(newEvalutionValue);

        assertEq(s_evaluator.getMinimumEvaluation(), newEvalutionValue);
    }

    function test_SetBaseSuspendTime() public {
        uint256 newBaseSuspendTimeValue = 10 hours;

        vm.prank(OWNER);
        s_evaluator.setBaseSuspendTime(newBaseSuspendTimeValue);

        assertEq(s_evaluator.getBaseSuspendTime(), newBaseSuspendTimeValue);
    }

    function test_SetBaseSlashPercentage() public {
        uint256 newBaseSlashPercentageValue = 0.5 ether;

        vm.prank(OWNER);
        s_evaluator.setBaseSlashPercentage(newBaseSlashPercentageValue);

        assertEq(s_evaluator.getBaseSlashPercentage(), newBaseSlashPercentageValue);
    }

    function test_SetMinimumStakingBalance() public {
        uint256 newMinimumStakingBalanceValue = 0.5 ether;

        vm.prank(OWNER);
        s_evaluator.setMinimumStakingBalance(newMinimumStakingBalanceValue);

        assertEq(s_evaluator.getMinimumStakingBalance(), newMinimumStakingBalanceValue);
    }

    function test_RevertWhen_NonWhitelistedEvaluatorStake()
        public
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
    {
        vm.expectRevert(CovenantNFT.AccessForbidden.selector);
        s_evaluator.stake(MIN_STAKE_AMOUNT);
    }

    function test_RevertWhen_EvaluatorNotWhitelisted()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
    {
        vm.expectRevert(CovenantNFT.AccessForbidden.selector);

        vm.prank(STRANGER);
        s_evaluator.evaluate(0, bytes32("true"));
    }

    function test_RevertWhen_EvaluatorStakingBalanceIsInsufficient()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
    {
        vm.expectRevert(CovenantEvaluator.InsufficientStakingBalance.selector);

        vm.prank(EVALUATOR_ONE);
        s_evaluator.evaluate(0, bytes32("true"));
    }

    function test_RevertWhen_EvaluateGoalTwice()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        evaluateGoal(EVALUATOR_ONE, 0, true)
    {
        vm.expectRevert(CovenantEvaluator.TaskHasBeenEvaluated.selector);

        vm.prank(EVALUATOR_ONE);
        s_evaluator.evaluate(0, bytes32("true"));
    }

    function test_EvaluateGoal_PositiveCase()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, true)
    {
        assertEq(uint8(s_cNft.getCovenant(0).status), 1);
    }

    function test_EvaluateGoal_PositiveCase_EscrowedFund()
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
            true,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        fundAddress(address(s_testToken), address(s_cNft), SETTLEMENT_TARGET)
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, true)
    {
        assertEq(uint8(s_cNft.getCovenant(0).status), 1);
    }

    function test_EvaluateGoal_NegativeCase()
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
            false,
            bytes(""),
            1 ether
        )
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        evaluateGoal(EVALUATOR_ONE, 0, false)
        evaluateGoal(EVALUATOR_TWO, 0, false)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        assertEq(uint8(s_cNft.getCovenant(0).status), 2);
    }

    function test_EvaluateGoal_WithOneInvalidAnswer()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_THREE).suspendedUntil, type(uint256).max);
        assertEq(s_evaluator.getClaimableSlashedFund(), MIN_STAKE_AMOUNT * BASE_SLASH_PERCENTAGE / 1 ether);
    }

    function test_EvaluatorGiveInvalidAnswerUnderMaxConsecutiveInvalidAnswerThreshold()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        setMaxConsecutiveInvalidAnswer(3)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        assertEq(
            s_evaluator.getEvaluatorDetails(EVALUATOR_THREE).stakeBalance,
            MIN_STAKE_AMOUNT - (MIN_STAKE_AMOUNT * BASE_SLASH_PERCENTAGE / 1 ether)
        );
        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_THREE).suspendedUntil, block.timestamp + BASE_SUSPEND_TIME);
    }

    function test_ClaimSlashedFund()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        setMaxConsecutiveInvalidAnswer(3)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        uint256 adminInitialBalance = s_testToken.balanceOf(OWNER);

        vm.prank(OWNER);
        s_evaluator.claimSlashedFund(OWNER);

        assertEq(adminInitialBalance + MIN_STAKE_AMOUNT * BASE_SLASH_PERCENTAGE / 1 ether, s_testToken.balanceOf(OWNER));
    }

    function test_RemoveEvaluatorSuspension()
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
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT)
        setMaxConsecutiveInvalidAnswer(3)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        vm.prank(OWNER);
        s_evaluator.removeEvaluatorSuspension(EVALUATOR_THREE);

        assertEq(s_evaluator.getEvaluatorDetails(EVALUATOR_THREE).suspendedUntil, 0);
    }

    function test_RevertWhen_EvaluatorIsSuspended()
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
            false,
            bytes(""),
            1 ether
        )
        registerCovenant(
            AGENT_WALLET_ONE,
            s_goal,
            address(s_testToken),
            SETTLEMENT_TARGET,
            1 ether,
            PRICE,
            SHOULD_WATCH,
            false,
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        whitelistEvaluator(EVALUATOR_TWO)
        whitelistEvaluator(EVALUATOR_THREE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        fundAddress(address(s_testToken), EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        fundAddress(address(s_testToken), EVALUATOR_THREE, MIN_STAKE_AMOUNT * 10)
        stakeEvaluator(EVALUATOR_ONE, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_TWO, MIN_STAKE_AMOUNT)
        stakeEvaluator(EVALUATOR_THREE, MIN_STAKE_AMOUNT * 10)
        setMaxConsecutiveInvalidAnswer(3)
        evaluateGoal(EVALUATOR_ONE, 0, true)
        evaluateGoal(EVALUATOR_TWO, 0, true)
        evaluateGoal(EVALUATOR_THREE, 0, false)
    {
        vm.startPrank(EVALUATOR_THREE);

        vm.expectRevert(CovenantEvaluator.Suspended.selector);
        s_evaluator.evaluate(1, keccak256(abi.encodePacked(EVALUATOR_THREE, true)));

        vm.stopPrank();
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
        bool isEscrowed,
        bytes memory data,
        uint256 agentAbilityScore
    ) {
        vm.startPrank(agent);
        bytes32 requestId = s_cNft.registerCovenant(
            goal, settlementAsset, settelementAmount, minAbilityScore, price, shouldWatch, isEscrowed, data
        );

        vm.startPrank(address(s_router));
        s_cNft.fulfillRequest(requestId, uint128(agentAbilityScore));
        vm.stopPrank();
        _;
    }

    modifier whitelistEvaluator(address evaluator) {
        vm.prank(OWNER);
        s_evaluator.whitelistEvaluator(evaluator);
        _;
    }

    modifier approveToken(address owner, address to) {
        vm.prank(owner);
        s_testToken.approve(to, UINT256_MAX);
        _;
    }

    modifier fundAddress(address token, address to, uint256 amount) {
        deal(token, to, amount);
        _;
    }

    modifier evaluateGoal(address evaluator, uint256 nftId, bool answer) {
        vm.prank(evaluator);
        s_evaluator.evaluate(nftId, keccak256(abi.encodePacked(evaluator, answer)));
        _;
    }

    modifier setMaxConsecutiveInvalidAnswer(uint256 amount) {
        vm.prank(OWNER);
        s_evaluator.setMaxConsecutiveInvalidAnswer(amount);
        _;
    }

    modifier stakeEvaluator(address evaluator, uint256 stakeAmount) {
        vm.startPrank(evaluator);
        s_testToken.approve(address(s_evaluator), stakeAmount);
        s_evaluator.stake(stakeAmount);
        vm.stopPrank();
        _;
    }
}
