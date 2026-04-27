// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {GhostPassRegistry} from "../src/GhostPassRegistry.sol";

contract GhostPassRegistryTest is Test {
    GhostPassRegistry public registry;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);

    string constant SUBNAME = "agent-alpha.ghostpass.eth";
    bytes32 constant SPENDING_KEY = bytes32(uint256(12345));
    bytes32 constant VIEWING_KEY = bytes32(uint256(67890));
    string constant CAPABILITIES = '["trading-signals"]'; 
    string constant PRICING = "5 USDC";

    function setUp() public {
        vm.prank(owner);
        registry = new GhostPassRegistry(owner);
    }

    /*//////////////////////////////////////////////////////////////
                           REGISTER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RegisterAgent() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        assertTrue(registry.isRegistered(SUBNAME));
        
        GhostPassRegistry.Agent memory agent = registry.getAgent(SUBNAME);
        assertEq(agent.owner, alice);
        assertEq(agent.spendingPubKey, SPENDING_KEY);
        assertEq(agent.viewingPubKey, VIEWING_KEY);
        assertEq(agent.capabilities, CAPABILITIES);
        assertEq(agent.pricing, PRICING);
        assertEq(agent.createdAt, block.timestamp);
    }

    function test_RegisterAgent_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GhostPassRegistry.AgentRegistered(
            SUBNAME,
            alice,
            SPENDING_KEY,
            VIEWING_KEY,
            block.timestamp
        );
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);
    }

    function test_RegisterAgent_DuplicateNameReverts() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        vm.prank(bob);
        vm.expectRevert(GhostPassRegistry.GhostPass__AlreadyRegistered.selector);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);
    }

    function test_RegisterAgent_EmptySubnameReverts() public {
        vm.prank(alice);
        vm.expectRevert(GhostPassRegistry.GhostPass__EmptySubname.selector);
        registry.registerAgent("", SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);
    }

    function test_RegisterAgent_InvalidKeysReverts() public {
        vm.prank(alice);
        vm.expectRevert(GhostPassRegistry.GhostPass__InvalidMetaAddress.selector);
        registry.registerAgent(SUBNAME, bytes32(0), VIEWING_KEY, CAPABILITIES, PRICING);

        vm.prank(alice);
        vm.expectRevert(GhostPassRegistry.GhostPass__InvalidMetaAddress.selector);
        registry.registerAgent(SUBNAME, SPENDING_KEY, bytes32(0), CAPABILITIES, PRICING);
    }

    /*//////////////////////////////////////////////////////////////
                           UPDATE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_UpdateProfile_AsOwner() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        string memory newCapabilities = '["market-analysis"]'; 
        string memory newPricing = "10 USDC";

        vm.prank(alice);
        registry.updateAgentProfile(SUBNAME, newCapabilities, newPricing);

        GhostPassRegistry.Agent memory agent = registry.getAgent(SUBNAME);
        assertEq(agent.capabilities, newCapabilities);
        assertEq(agent.pricing, newPricing);
    }

    function test_UpdateProfile_AsNonOwnerReverts() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        vm.prank(bob);
        vm.expectRevert(GhostPassRegistry.GhostPass__NotAgentOwner.selector);
        registry.updateAgentProfile(SUBNAME, "new", "new");
    }

    function test_UpdateProfile_UnregisteredReverts() public {
        vm.prank(alice);
        vm.expectRevert(GhostPassRegistry.GhostPass__NotRegistered.selector);
        registry.updateAgentProfile(SUBNAME, "new", "new");
    }

    /*//////////////////////////////////////////////////////////////
                          ANNOUNCE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Announce_EmitsEvent() public {
        bytes32 stealthAddr = bytes32(uint256(11111));
        bytes32 ephemeralPub = bytes32(uint256(22222));
        address token = address(0);
        uint256 amount = 5 ether;

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit GhostPassRegistry.PaymentAnnounced(
            stealthAddr,
            ephemeralPub,
            alice,
            token,
            amount,
            block.timestamp
        );
        registry.announce(stealthAddr, ephemeralPub, token, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetAgent_UnregisteredReverts() public {
        vm.expectRevert(GhostPassRegistry.GhostPass__NotRegistered.selector);
        registry.getAgent(SUBNAME);
    }

    function test_GetAgentOwner() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        assertEq(registry.getAgentOwner(SUBNAME), alice);
    }

    function test_GetAgentKeys() public {
        vm.prank(alice);
        registry.registerAgent(SUBNAME, SPENDING_KEY, VIEWING_KEY, CAPABILITIES, PRICING);

        (bytes32 spending, bytes32 viewing) = registry.getAgentKeys(SUBNAME);
        assertEq(spending, SPENDING_KEY);
        assertEq(viewing, VIEWING_KEY);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_RegisterAgent(
        string calldata subname,
        bytes32 spendingKey,
        bytes32 viewingKey
    ) public {
        vm.assume(bytes(subname).length > 0);
        vm.assume(spendingKey != bytes32(0));
        vm.assume(viewingKey != bytes32(0));

        vm.prank(alice);
        registry.registerAgent(subname, spendingKey, viewingKey, CAPABILITIES, PRICING);

        assertTrue(registry.isRegistered(subname));
    }
}
