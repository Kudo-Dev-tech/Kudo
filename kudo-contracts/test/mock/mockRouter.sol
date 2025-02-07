// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

contract MockRouter {
    function sendRequest(uint64, bytes calldata, uint16, uint32, bytes32) external pure returns (bytes32) {
        return bytes32("1");
    }
}
