// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {CovenantNFT} from "./CovenantNFT.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract CovenantEvaluator is AccessControlDefaultAdminRules {
    uint256 s_minApproval;

    CovenantNFT immutable i_cNFT;

    mapping(uint256 nftId => CovenantEvaluations covenantEvalutions) s_nftIdToCovenantEvaluations;

    mapping(uint256 nftId => mapping(address => bool)) public s_nftIdToEvaluatorVoteStatus;

    mapping(address evaluator => bool status) public s_whitelistedEvaluator;

    /// @notice Thrown when the caller is not an authorized agent
    error CallerIsNotAuthorized();

    error TaskHasBeenEvaluated();

    struct CovenantEvaluations {
        uint256 voteAmt;
        EvaluationDetail[] evaluationsDetail;
    }

    struct EvaluationDetail {
        address evaluator;
        bytes32 rawAnswer;
        bool answer;
    }

    constructor(address cNFT, uint256 minApproval, address admin, uint48 initialDelay)
        AccessControlDefaultAdminRules(initialDelay, admin)
    {
        i_cNFT = CovenantNFT(cNFT);
        s_minApproval = minApproval;
    }

    function whitelistEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_whitelistedEvaluator[evaluator] = true;
    }

    function removeEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete s_whitelistedEvaluator[evaluator];
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
        } else {
            i_cNFT.setCovenantStatus(nftId, CovenantNFT.CovenantStatus.FAILED);
        }
    }

    function _createCommitment(address sender, bool answer) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, answer));
    }

    modifier activeEvaluator(address evaluator) {
        if (!s_whitelistedEvaluator[evaluator]) revert CallerIsNotAuthorized();
        _;
    }
}
