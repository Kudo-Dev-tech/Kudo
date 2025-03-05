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

    mapping(uint256 nftId => mapping(address => bool)) public s_nftIdToEvaluatorVoteStatus;

    mapping(address evaluator => bool status) public s_whitelistedEvaluator;

    /// @notice Thrown when the caller is not an authorized agent
    error CallerIsNotAuthorized();

    error TaskHasBeenEvaluated();

    constructor(address cNFT, address admin, uint48 initialDelay) AccessControlDefaultAdminRules(initialDelay, admin) {
        i_cNFT = CovenantNFT(cNFT);
    }

    function whitelistEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_whitelistedEvaluator[evaluator] = true;
    }

    function removeEvaluator(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        s_whitelistedEvaluator[evaluator] = false;
    }

    function evaluate(uint256 nftId, bytes32 answer) external activeEvaluator(msg.sender) {
        if (s_nftIdToEvaluatorVoteStatus[nftId][msg.sender]) revert TaskHasBeenEvaluated();

        CovenantNFT.CovenantData memory nft = i_cNFT.getCovenant(nftId);

        s_nftIdToEvaluatorVoteStatus[nftId][msg.sender] = true;

        i_cNFT.updateEvaluationDetail(
            nftId, CovenantNFT.EvaluationDetail({evaluator: msg.sender, rawAnswer: answer, answer: false})
        );

        nft.voteDetails.voteAmt++;

        if (nft.voteDetails.voteAmt >= s_minApproval) {
            _extractAnswer(nftId);
        }
    }

    function _extractAnswer(uint256 nftId) internal {
        CovenantNFT.CovenantData memory nft = i_cNFT.getCovenant(nftId);

        for (uint256 i; i < nft.evaluationsDetail.length; ++i) {
            if (nft.evaluationsDetail[i].rawAnswer == _createCommitment(nft.evaluationsDetail[i].evaluator, true)) {
                nft.evaluationsDetail[i].answer = true;
                nft.voteDetails.approvalAmt++;
            } else {
                nft.evaluationsDetail[i].answer = false;
            }
        }

        i_cNFT.updateEvaluationDetail(nftId, nft.evaluationsDetail, nft.voteDetails.approvalAmt);

        if (nft.voteDetails.approvalAmt > nft.voteDetails.voteAmt / 2) {
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
