// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Constants {
    uint48 constant INITIAL_DELAY = 60;

    bytes32 BASE_SEPHOLIA_DON_ID = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;
    address constant BASE_SEPHOLIA_ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278;

    bytes32 ARBITRUM_MAINNET_DON_ID = 0x66756e2d617262697472756d2d6d61696e6e65742d3100000000000000000000;
    address constant ARBITRUM_MAINNET_ROUTER = 0x97083E831F8F0638855e2A515c90EdCF158DF238;

    bytes32 AVAX_MAINNET_DON_ID = 0x66756e2d6176616c616e6368652d6d61696e6e65742d31000000000000000000;
    address constant AVAX_MAINNET_ROUTER = 0x9f82a6A0758517FD0AfA463820F586999AF314a0;
}
