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

    CovenantEvaluator public s_evaluator;

    MockRouter public s_router;

    string public s_tee;
    string public s_agentId;

    string public s_goal;

    ERC20Mock public s_testToken;

    function setUp() public {
        s_router = new MockRouter();

        s_cNft = new CovenantNFTKudoNode(address(s_router), OWNER, INITIAL_DELAY);

        s_evaluator = new CovenantEvaluator(address(s_cNft), OWNER, INITIAL_DELAY);

        vm.prank(OWNER);
        s_cNft.addEvaluatorContract(address(s_evaluator));

        s_tee = "TEE 101";
        s_agentId = "Agent ID";

        s_goal = "Earn 10 Test Token";

        s_testToken = new ERC20Mock();

        deal(address(s_testToken), AGENT_WALLET_ONE, 100000 ether);
    }

    function test_addEvaluatorContract() public {
        vm.prank(OWNER);
        s_cNft.addEvaluatorContract(STRANGER);
        assertEq(s_cNft.hasRole(EVALUATOR_ROLE, STRANGER), true);
    }

    function test_removeEvaluatorContract() public {
        vm.prank(OWNER);
        s_cNft.removeEvaluatorContract(address(s_evaluator));
        assertEq(s_cNft.hasRole(EVALUATOR_ROLE, address(s_evaluator)), false);
    }

    function test_WhitelistEvaluator() public whitelistEvaluator(EVALUATOR_ONE) {
        assertEq(s_evaluator.s_whitelistedEvaluator(EVALUATOR_ONE), true);
    }

    function test_RemoveWhitelistedEvaluator() public whitelistEvaluator(EVALUATOR_ONE) {
        vm.prank(OWNER);
        s_evaluator.removeEvaluator(EVALUATOR_ONE);

        assertEq(s_evaluator.s_whitelistedEvaluator(EVALUATOR_ONE), false);
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
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
    {
        vm.expectRevert(CovenantNFT.CallerIsNotAuthorized.selector);

        vm.prank(STRANGER);
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
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
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
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        evaluateGoal(EVALUATOR_ONE, 0, true)
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
            bytes(""),
            1 ether
        )
        whitelistEvaluator(EVALUATOR_ONE)
        approveToken(AGENT_WALLET_ONE, address(s_cNft))
        evaluateGoal(EVALUATOR_ONE, 0, false)
    {
        assertEq(uint8(s_cNft.getCovenant(0).status), 2);
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

    modifier whitelistEvaluator(address evaluator) {
        vm.prank(OWNER);
        s_evaluator.whitelistEvaluator(EVALUATOR_ONE);
        _;
    }

    modifier approveToken(address owner, address to) {
        vm.prank(owner);
        s_testToken.approve(to, UINT256_MAX);
        _;
    }

    modifier evaluateGoal(address evaluator, uint256 nftId, bool answer) {
        vm.prank(EVALUATOR_ONE);
        s_evaluator.evaluate(nftId, keccak256(abi.encodePacked(evaluator, answer)));
        _;
    }
}
