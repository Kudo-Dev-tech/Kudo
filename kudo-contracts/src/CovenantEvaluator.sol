// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./CovenantNFT.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract CovenantEvaluator is AccessControlDefaultAdminRules {
    uint256 private s_minApproval;

    uint256 s_baseSlashPercentage;

    uint256 s_baseSuspendTime;

    uint256 s_maxConsecutiveInvalidAnswer;

    uint256 s_slashedFund;

    uint256 s_minimumStakingBalance;

    IERC20 immutable i_stakingAsset;

    CovenantNFT immutable i_cNFT;

    mapping(uint256 nftId => CovenantEvaluations covenantEvalutions) s_nftIdToCovenantEvaluations;

    mapping(uint256 nftId => mapping(address => bool)) public s_nftIdToEvaluatorVoteStatus;

    mapping(address evaluator => EvaluatorDetail evaluatorDetails) s_evaluatorDetails;

    /// @notice Emitted when evaluator is whitelisted
    /// @param evaluator address of the whitelisted evaluator
    event EvaluatorWhitelisted(address evaluator);

    /// @notice Thrown when the caller is not an authorized agent
    error AccessForbidden();

    error InsufficientStakingBalance();

    error Suspended();

    /// @notice Thrown when task has already been evaluated
    error TaskHasBeenEvaluated();

    event EvaluatorStaked(address indexed evaluator, uint256 amount);

    struct CovenantEvaluations {
        uint128 voteAmt;
        EvaluationDetail[] evaluationsDetail;
    }

    struct EvaluationDetail {
        address evaluator;
        bool answer;
        bytes32 rawAnswer;
    }

    struct EvaluatorDetail {
        bool whitelistStatus;
        uint128 consecutiveInvalidAnswer;
        /// @notice Evaluator staking balance
        uint256 stakeBalance;
        uint256 suspendedUntil;
    }

    constructor(
        address cNFT,
        address asset,
        uint256 minApproval,
        uint256 maxConsecutiveInvalidAnswer,
        uint256 baseSuspendTime,
        uint256 baseSlashPercentage,
        uint256 minimumStakingBalance,
        address admin,
        uint48 initialDelay
    ) AccessControlDefaultAdminRules(initialDelay, admin) {
        i_cNFT = CovenantNFT(cNFT);
        s_minApproval = minApproval;
        i_stakingAsset = IERC20(asset);
        s_maxConsecutiveInvalidAnswer = maxConsecutiveInvalidAnswer;
        s_baseSuspendTime = baseSuspendTime;
        s_baseSlashPercentage = baseSlashPercentage;
        s_minimumStakingBalance = minimumStakingBalance;
    }

    function stake(uint256 amount) public {
        if (!s_evaluatorDetails[msg.sender].whitelistStatus) revert AccessForbidden();

        i_stakingAsset.transferFrom(msg.sender, address(this), amount);
        s_evaluatorDetails[msg.sender].stakeBalance += amount;

        emit EvaluatorStaked(msg.sender, amount);
    }

    function setMaxConsecutiveInvalidAnswer(uint256 maxConsecutiveInvalidAnswer)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        s_maxConsecutiveInvalidAnswer = maxConsecutiveInvalidAnswer;
    }

    function whitelistEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_evaluatorDetails[evaluator].whitelistStatus = true;

        emit EvaluatorWhitelisted(evaluator);
    }

    function removeEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_evaluatorDetails[evaluator].whitelistStatus;
    }

    function claimSlashedFund(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        i_stakingAsset.transfer(to, s_slashedFund);
        delete s_slashedFund;
    }

    function removeEvaluatorSuspension(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_evaluatorDetails[evaluator].suspendedUntil;
    }

    function evaluate(uint256 nftId, bytes32 answer) external activeEvaluator(msg.sender) {
        if (s_nftIdToEvaluatorVoteStatus[nftId][msg.sender]) revert TaskHasBeenEvaluated();

        s_nftIdToEvaluatorVoteStatus[nftId][msg.sender] = true;

        s_nftIdToCovenantEvaluations[nftId].voteAmt++;

        s_nftIdToCovenantEvaluations[nftId].evaluationsDetail.push(
            EvaluationDetail({evaluator: msg.sender, rawAnswer: answer, answer: false})
        );

        if (s_nftIdToCovenantEvaluations[nftId].voteAmt == s_minApproval) {
            _extractAnswer(nftId);
        }
    }

    function getEvaluatorDetails(address evaluator) external view returns (EvaluatorDetail memory) {
        return s_evaluatorDetails[evaluator];
    }

    function _extractAnswer(uint256 nftId) internal {
        uint256 approvalAmt;

        for (uint256 i; i < s_nftIdToCovenantEvaluations[nftId].evaluationsDetail.length; ++i) {
            if (
                s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].rawAnswer
                    == _createCommitment(s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].evaluator, true)
            ) {
                s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].answer = true;
                approvalAmt++;
            } else {
                s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].answer = false;
            }
        }

        if (approvalAmt > s_nftIdToCovenantEvaluations[nftId].voteAmt / 2) {
            i_cNFT.setCovenantStatus(nftId, CovenantNFT.CovenantStatus.COMPLETED);
            _compareAnswer(nftId, true);
        } else {
            i_cNFT.setCovenantStatus(nftId, CovenantNFT.CovenantStatus.FAILED);
            _compareAnswer(nftId, false);
        }
    }

    function _compareAnswer(uint256 nftId, bool majorityVote) internal {
        for (uint256 i; i < s_nftIdToCovenantEvaluations[nftId].evaluationsDetail.length; ++i) {
            if (s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].answer != majorityVote) {
                address evaluator = s_nftIdToCovenantEvaluations[nftId].evaluationsDetail[i].evaluator;
                uint256 slashedAmt = s_evaluatorDetails[evaluator].stakeBalance * s_baseSlashPercentage / 1 ether;

                s_evaluatorDetails[evaluator].stakeBalance -= slashedAmt;
                s_slashedFund += slashedAmt;

                _handleInvalidEvaluator(evaluator);
                continue;
            }
        }
    }

    function _handleInvalidEvaluator(address evaluator) internal {
        ++s_evaluatorDetails[evaluator].consecutiveInvalidAnswer;

        if (s_evaluatorDetails[evaluator].consecutiveInvalidAnswer < s_maxConsecutiveInvalidAnswer) {
            s_evaluatorDetails[evaluator].suspendedUntil =
                block.timestamp + (s_baseSuspendTime * s_evaluatorDetails[evaluator].consecutiveInvalidAnswer);

            return;
        }

        s_evaluatorDetails[evaluator].suspendedUntil = block.timestamp + 365 days;
    }

    function _createCommitment(address sender, bool answer) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, answer));
    }

    modifier activeEvaluator(address evaluator) {
        if (!s_evaluatorDetails[evaluator].whitelistStatus) revert AccessForbidden();
        if (s_evaluatorDetails[evaluator].stakeBalance < s_minimumStakingBalance) revert InsufficientStakingBalance();
        if (s_evaluatorDetails[evaluator].suspendedUntil > block.timestamp) revert Suspended();
        _;
    }
}
