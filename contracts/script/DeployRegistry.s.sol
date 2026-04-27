// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {GhostPassRegistry} from "../src/GhostPassRegistry.sol";

contract DeployRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying GhostPassRegistry...");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        GhostPassRegistry registry = new GhostPassRegistry(deployer);

        vm.stopBroadcast();

        console2.log("GhostPassRegistry deployed at:", address(registry));
        console2.log("Owner set to:", deployer);
    }
}
