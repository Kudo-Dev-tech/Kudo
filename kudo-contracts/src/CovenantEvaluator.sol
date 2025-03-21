// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./CovenantNFT.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract CovenantEvaluator is AccessControlDefaultAdminRules {
    /// @notice Minimum number of evaluation required for an evaluation to be valid
    uint256 private s_minEvaluation;

    /// @notice Base percentage of funds to be slashed for incorrect evaluation
    uint256 private s_baseSlashPercentage;

    /// @notice Base suspension time (in seconds) for incorrect evaluation
    uint256 private s_baseSuspendTime;

    /// @notice Maximum allowed consecutive invalid answers before permanent suspension
    uint256 private s_maxConsecutiveInvalidAnswer;

    /// @notice Total amount of slashed funds collected from incorrect evaluation
    uint256 private s_slashedFund;

    /// @notice Minimum staking balance required to evaluate
    uint256 private s_minimumStakingBalance;

    /// @notice ERC20 token used for staking
    IERC20 immutable i_stakingAsset;

    /// @notice CovenantNFT contract
    CovenantNFT immutable i_cNFT;

    mapping(uint256 nftId => CovenantEvaluations covenantEvalutions) s_nftIdToCovenantEvaluations;

    mapping(uint256 nftId => mapping(address => bool)) public s_nftIdToEvaluatorVoteStatus;

    mapping(address evaluator => EvaluatorDetail evaluatorDetails) s_evaluatorDetails;

    /// @notice Emitted when evaluator is whitelisted
    /// @param evaluator address of the whitelisted evaluator
    event EvaluatorWhitelisted(address evaluator);

    /// @notice Emitted when evaluator is removed from whitelist
    /// @param evaluator address of the removed evaluator
    event EvaluatorRemoved(address evaluator);

    /// @notice Emitted when an evaluator's suspension is lifted
    /// @param evaluator Evaluator whose suspension has been removed
    event SuspensionLifted(address evaluator);

    /// @notice Emitted when slashed funds are claimed
    /// @param to The address receiving the claimed funds
    /// @param amount The amount of claimed funds
    event SlashFundClaimed(address to, uint256 amount);

    /// @notice Thrown when the caller is not an authorized agent
    error AccessForbidden();

    /// @notice Thrown when evaluator staking balance is insufficient
    error InsufficientStakingBalance();

    /// @notice Thrown when the evaluator is suspended
    error Suspended();

    /// @notice Thrown when task has already been evaluated
    error TaskHasBeenEvaluated();

    /// @notice Thrown whne minimum evaluation is even
    error MinimumEvaluationIsEven();

    /// @notice Emitted when an evaluator stakes their tokens
    /// @param evaluator The address of the evaluator
    /// @param amount The amount of tokens staked
    event EvaluatorStaked(address indexed evaluator, uint256 amount);

    /// @notice Emitted when the maximum consecutive invalid answers limit is updated
    /// @param maxConsecutiveInvalidAnswer The new maximum number of consecutive invalid answers allowed
    event MaxConsecutiveInvalidAnswerSet(uint256 maxConsecutiveInvalidAnswer);

    /// @notice Emitted when the minimum required evaluations are updated
    /// @param minEvaluation The new minimum number of evaluations required
    event MinimumEvaluationSet(uint256 minEvaluation);

    /// @notice Emitted when the base suspension time is updated
    /// @param baseSuspendTime The new base suspension duration in seconds
    event BaseSuspendTimeSet(uint256 baseSuspendTime);

    /// @notice Emitted when the base slash percentage is updated
    /// @param baseSlashPercentage The new base percentage of funds to be slashed in ethers
    event BaseSlashPercentageSet(uint256 baseSlashPercentage);

    /// @notice Emitted when the minimum staking balance requirement is updated
    /// @param minimumStakingBalance The new minimum staking balance required
    event MinimumStakingBalanceSet(uint256 minimumStakingBalance);

    /// @notice Stores evaluation details of a cNFT
    struct CovenantEvaluations {
        /// @notice Total amount of evaluation of the cNFT
        uint128 voteAmt;
        /// @notice List of detailed evaluations made by evaluators
        EvaluationDetail[] evaluationsDetail;
    }

    /// @notice Details of an evaluation made by an evaluator
    struct EvaluationDetail {
        /// @notice Address of the evaluator submitting the evaluation
        address evaluator;
        /// @notice Evaluator's answer
        bool answer;
        /// @notice Raw encoded answer provided by the evaluator to prevent lazy evaluator
        bytes32 rawAnswer;
    }

    /// @notice Stores details about an evaluator
    struct EvaluatorDetail {
        /// @notice Evaluator is whitelist status
        bool whitelistStatus;
        /// @notice Number of consecutive invalid answers given by the evaluator
        uint128 consecutiveInvalidAnswer;
        /// @notice The staking balance of the evaluator
        uint256 stakeBalance;
        /// @notice Time until the evaluator is suspension is lifted
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
        i_stakingAsset = IERC20(asset);
        s_minEvaluation = minApproval;
        s_maxConsecutiveInvalidAnswer = maxConsecutiveInvalidAnswer;
        s_baseSuspendTime = baseSuspendTime;
        s_baseSlashPercentage = baseSlashPercentage;
        s_minimumStakingBalance = minimumStakingBalance;
    }

    /// @notice Allows evaluator to stake a specified amount of tokens
    /// @param amount The amount of tokens to be staked
    function stake(uint256 amount) public {
        if (!s_evaluatorDetails[msg.sender].whitelistStatus) revert AccessForbidden();

        i_stakingAsset.transferFrom(msg.sender, address(this), amount);
        s_evaluatorDetails[msg.sender].stakeBalance += amount;

        emit EvaluatorStaked(msg.sender, amount);
    }

    /// @notice Sets the maximum number of consecutive invalid answers allowed
    /// @param maxConsecutiveInvalidAnswer The new maximum consecutive invalid answers allowed
    function setMaxConsecutiveInvalidAnswer(uint256 maxConsecutiveInvalidAnswer)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        s_maxConsecutiveInvalidAnswer = maxConsecutiveInvalidAnswer;

        emit MaxConsecutiveInvalidAnswerSet(maxConsecutiveInvalidAnswer);
    }

    /// @notice Sets the minimum number of evaluations required
    /// @param minEvaluation The new minimum number of evaluations required
    function setMinimumEvaluation(uint256 minEvaluation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (minEvaluation % 2 == 0) revert MinimumEvaluationIsEven();

        s_minEvaluation = minEvaluation;

        emit MinimumEvaluationSet(s_minEvaluation);
    }

    /// @notice Sets the base suspension time
    /// @param baseSuspendTime The new base suspension duration in seconds
    function setBaseSuspendTime(uint256 baseSuspendTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_baseSuspendTime = baseSuspendTime;

        emit BaseSuspendTimeSet(s_baseSuspendTime);
    }

    /// @notice Sets the base percentage of funds to be slashed for invalid answers
    /// @param baseSlashPercentage The new base slash percentage
    function setBaseSlashPercentage(uint256 baseSlashPercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_baseSlashPercentage = baseSlashPercentage;

        emit BaseSlashPercentageSet(s_baseSlashPercentage);
    }

    /// @notice Sets the minimum staking balance required for evaluators
    /// @param minStakingBalance The new minimum staking balance
    function setMinimumStakingBalance(uint256 minStakingBalance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_minimumStakingBalance = minStakingBalance;

        emit MinimumStakingBalanceSet(s_minimumStakingBalance);
    }

    /// @notice Whitelists an evaluator
    /// @param evaluator The address of the evaluator to be whitelisted
    function whitelistEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_evaluatorDetails[evaluator].whitelistStatus = true;

        emit EvaluatorWhitelisted(evaluator);
    }

    /// @notice Removes an evaluator from the whitelist
    /// @param evaluator Evaluator that will be removed
    function removeEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_evaluatorDetails[evaluator].whitelistStatus;

        emit EvaluatorRemoved(evaluator);
    }

    /// @notice Claim funds to a specified address
    /// @param to The address that will receive the claimed funds
    function claimSlashedFund(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        i_stakingAsset.transfer(to, s_slashedFund);
        emit SlashFundClaimed(to, s_slashedFund);

        delete s_slashedFund;
    }

    /// @notice Lifts the suspension of a specified evaluator
    /// @param evaluator The evaluator which the suspension will be removed
    function removeEvaluatorSuspension(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_evaluatorDetails[evaluator].suspendedUntil;

        emit SuspensionLifted(evaluator);
    }

    /// @notice Submits an evaluation for Covenant NFT
    /// @param nftId The ID of the NFT being evaluated
    /// @param answer The evaluator’s response, encoded as a bytes32 value
    function evaluate(uint256 nftId, bytes32 answer) external activeEvaluator(msg.sender) {
        if (s_nftIdToEvaluatorVoteStatus[nftId][msg.sender]) revert TaskHasBeenEvaluated();

        s_nftIdToEvaluatorVoteStatus[nftId][msg.sender] = true;

        s_nftIdToCovenantEvaluations[nftId].voteAmt++;

        s_nftIdToCovenantEvaluations[nftId].evaluationsDetail.push(
            EvaluationDetail({evaluator: msg.sender, rawAnswer: answer, answer: false})
        );

        if (s_nftIdToCovenantEvaluations[nftId].voteAmt == s_minEvaluation) {
            _extractAnswer(nftId);
        }
    }

    /// @notice Retrieves details of a specific evaluator
    /// @param evaluator The address of the desired evaluator
    /// @return EvaluatorDetail Struct containing detailed information
    function getEvaluatorDetails(address evaluator) external view returns (EvaluatorDetail memory) {
        return s_evaluatorDetails[evaluator];
    }

    /// @notice Getter for the minimum evaluation required for an evaluation
    /// @return The minimum number of evaluation needed
    function getMinimumEvaluation() external view returns (uint256) {
        return s_minEvaluation;
    }

    /// @notice Getter for the base percentage of funds to be slashed
    /// @return The base slash percentage
    function getBaseSlashPercentage() external view returns (uint256) {
        return s_baseSlashPercentage;
    }

    /// @notice Getter for the base suspension time
    /// @return The base suspension duration in seconds
    function getBaseSuspendTime() external view returns (uint256) {
        return s_baseSuspendTime;
    }

    /// @notice Getter for the maximum number of consecutive invalid answers allowed
    /// @return The maximum consecutive invalid answers before penalties apply
    function getMaximumConsecutiveInvalidAnswer() external view returns (uint256) {
        return s_maxConsecutiveInvalidAnswer;
    }

    /// @notice Getter for the total amount of slashed funds that can be claimed
    /// @return The amount of claimable slashed funds
    function getClaimableSlashedFund() external view returns (uint256) {
        return s_slashedFund;
    }

    /// @notice Getter for the minimum staking balance required for evaluators
    /// @return The minimum staking balance
    function getMinimumStakingBalance() external view returns (uint256) {
        return s_minimumStakingBalance;
    }

    /// @notice Extracts the encoded answers for a desired Covenant NFT
    /// @param nftId The ID of the Covenant NFT whose answer is being extracted
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

    /// @notice Compares the extracted answer of the Covenant NFT with the majority vote
    /// @param nftId The ID of the Covenant NFT answers that are being compared
    /// @param majorityVote The majority decision of the evaluation
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

    /// @notice Handles actions for evaluator who provided an invalid answer
    /// @param evaluator The address of the evaluator
    function _handleInvalidEvaluator(address evaluator) internal {
        ++s_evaluatorDetails[evaluator].consecutiveInvalidAnswer;

        if (s_evaluatorDetails[evaluator].consecutiveInvalidAnswer < s_maxConsecutiveInvalidAnswer) {
            s_evaluatorDetails[evaluator].suspendedUntil =
                block.timestamp + (s_baseSuspendTime * s_evaluatorDetails[evaluator].consecutiveInvalidAnswer);

            return;
        }

        s_evaluatorDetails[evaluator].suspendedUntil = type(uint256).max;
    }

    /// @notice Function to create commitment to compare encoded evaluator answer
    /// @param sender The address of the evaluator
    /// @param answer The evaluator’s expected answer
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
