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

        CovenantNFT.CovenantData memory nft = i_cNFT.getCovenant(nftId);

        uint256 voteAmt = nft.evaluationsDetail.length;

        s_nftIdToEvaluatorVoteStatus[nftId][msg.sender] = true;

        i_cNFT.updateEvaluationDetail(
            nftId, CovenantNFT.EvaluationDetail({evaluator: msg.sender, rawAnswer: answer, answer: false})
        );

        ++voteAmt;

        if (voteAmt == s_minApproval) {
            _extractAnswer(nftId);
        }
    }

    function _extractAnswer(uint256 nftId) internal {
        CovenantNFT.CovenantData memory nft = i_cNFT.getCovenant(nftId);

        uint256 approvalAmt;
        uint256 voteAmt = nft.evaluationsDetail.length;

        for (uint256 i; i < nft.evaluationsDetail.length; ++i) {
            if (nft.evaluationsDetail[i].rawAnswer == _createCommitment(nft.evaluationsDetail[i].evaluator, true)) {
                nft.evaluationsDetail[i].answer = true;
                approvalAmt++;
            } else {
                nft.evaluationsDetail[i].answer = false;
            }
        }

        i_cNFT.updateEvaluationDetail(nftId, nft.evaluationsDetail);

        if (approvalAmt > voteAmt / 2) {
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
