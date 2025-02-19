// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "forge-std/Script.sol";
import {CovenantNFT} from "../src/cNFT.sol";
import {CovenantNFTKudoNode} from "../src/cNFTKudoNode.sol";
import {Constants} from "../test/Constants.t.sol";

contract DeployCNft is Script, Constants {
    address constant COVENANT_NFT_ADDRESS = 0x7e5dfCc458F7f3c1c58251642A0a41DF9861B8F7;
    address constant ROUTER_ADDRESS = 0x61eD4E612b981E739Fc0BBb57218d64bE6E7d0FF;
    address constant USDC_ADDRESS = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    CovenantNFT s_cNFT;

    uint256 deployerPrivateKey;
    address deployer;

    function run() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);

        // deployContract();
        registerCNFT(COVENANT_NFT_ADDRESS);
    }

    function deployContract() public {
        vm.startBroadcast(deployerPrivateKey);

        s_cNFT = new CovenantNFTKudoNode(ROUTER_ADDRESS, deployer, 60);

        s_cNFT.registerAgent("Tee 101", "abc", "Agent One");

        vm.stopBroadcast();

        uint256 solKOL = vm.envUint("SOL_KOL_PK");

        vm.startBroadcast(solKOL);
        s_cNFT.registerAgent("Tee 102", "cba", "Agent Two");

        vm.stopBroadcast();
    }

    function registerCNFT(address cnft) public {
        s_cNFT = CovenantNFT(cnft);

        vm.startBroadcast(deployerPrivateKey);

        s_cNFT.registerCovenant(
            CovenantNFT.NftType.EMPLOYMENT,
            "Post a short explaination of project A",
            USDC_ADDRESS,
            1_000_000,
            1 ether,
            1_000_000,
            true,
            bytes("")
        );

        vm.stopBroadcast();
    }

    function test() public {}
}
