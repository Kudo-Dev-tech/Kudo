// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "forge-std/Script.sol";
import {CovenantNFT} from "../src/cNFT.sol";
import {Constants} from "../test/Constants.t.sol";

contract DeployCNft is Script, Constants {
    CovenantNFT s_cNFT;

    uint256 deployerPrivateKey;
    address deployer;

    function run() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);

        deployContract();
        // registerCNFT(address(contract));
    }

    function deployContract() public {
        vm.startBroadcast(deployerPrivateKey);

        s_cNFT = new CovenantNFT(address(1), deployer, 60);

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
            0x036CbD53842c5426634e7929541eC2318f3dCF7e,
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
