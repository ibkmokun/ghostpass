// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {GhostPassResolver} from "../src/GhostPassResolver.sol";

contract DeployResolver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        string memory gatewayURL = vm.envString("GATEWAY_URL");
        address trustedSigner = vm.envAddress("GATEWAY_SIGNER_ADDRESS");

        console2.log("Deploying GhostPassResolver...");
        console2.log("Deployer:", deployer);
        console2.log("Gateway URL:", gatewayURL);
        console2.log("Trusted Signer:", trustedSigner);

        vm.startBroadcast(deployerPrivateKey);

        GhostPassResolver resolver = new GhostPassResolver(gatewayURL, trustedSigner);

        vm.stopBroadcast();

        console2.log("GhostPassResolver deployed at:", address(resolver));
    }
}
