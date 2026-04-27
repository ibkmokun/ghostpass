// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {GhostPassResolver} from "../src/GhostPassResolver.sol";

contract GhostPassResolverTest is Test {
    GhostPassResolver public resolver;

    address public owner = address(1);
    address public signer;
    uint256 public signerKey;

    string constant GATEWAY_URL = "https://ghostpass-gateway.vercel.app/resolve";

    function setUp() public {
        (signer, signerKey) = makeAddrAndKey("signer");
        
        vm.prank(owner);
        resolver = new GhostPassResolver(GATEWAY_URL, signer);
    }

    /*//////////////////////////////////////////////////////////////
                         RESOLVE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Resolve_RevertsWithOffchainLookup() public {
        bytes memory name = bytes("agent-alpha.ghostpass.eth");
        bytes memory data = abi.encodeWithSelector(bytes4(0x3b3b57de)); // addr() selector

        vm.expectRevert(
            abi.encodeWithSelector(
                GhostPassResolver.OffchainLookup.selector,
                address(resolver),
                _toArray(GATEWAY_URL),
                abi.encodeCall(resolver.resolve, (name, data)),
                resolver.resolveWithProof.selector,
                abi.encode(name)
            )
        );

        resolver.resolve(name, data);
    }

    function test_ResolveWithProof_ValidSignature() public {
        bytes memory name = bytes("agent-alpha.ghostpass.eth");
        address stealthAddress = address(0x1234567890123456789012345678901234567890);

        // Create the message hash
        bytes32 messageHash = keccak256(abi.encodePacked(stealthAddress, abi.encode(name)));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        // Sign with trusted signer
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Encode response
        bytes memory response = abi.encode(stealthAddress, signature);
        bytes memory extraData = abi.encode(name);

        // Should succeed
        bytes memory result = resolver.resolveWithProof(response, extraData);
        address resolved = abi.decode(result, (address));
        assertEq(resolved, stealthAddress);
    }

    function test_ResolveWithProof_InvalidSignatureReverts() public {
        bytes memory name = bytes("agent-alpha.ghostpass.eth");
        address stealthAddress = address(0x1234567890123456789012345678901234567890);

        // Sign with wrong key
        (, uint256 wrongKey) = makeAddrAndKey("wrong");
        bytes32 messageHash = keccak256(abi.encodePacked(stealthAddress, abi.encode(name)));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes memory response = abi.encode(stealthAddress, signature);
        bytes memory extraData = abi.encode(name);

        vm.expectRevert(GhostPassResolver.GhostPassResolver__InvalidSignature.selector);
        resolver.resolveWithProof(response, extraData);
    }

    function test_ResolveWithProof_WrongSignerReverts() public {
        bytes memory name = bytes("agent-alpha.ghostpass.eth");
        address stealthAddress = address(0x1234567890123456789012345678901234567890);

        // Sign with a different address that is not the trusted signer
        (address randomAddr, uint256 randomKey) = makeAddrAndKey("random");
        bytes32 messageHash = keccak256(abi.encodePacked(stealthAddress, abi.encode(name)));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(randomKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        bytes memory response = abi.encode(stealthAddress, signature);
        bytes memory extraData = abi.encode(name);

        vm.expectRevert(GhostPassResolver.GhostPassResolver__InvalidSignature.selector);
        resolver.resolveWithProof(response, extraData);
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetGatewayURL_AsOwner() public {
        string memory newUrl = "https://new-gateway.example.com";
        
        vm.prank(owner);
        resolver.setGatewayURL(newUrl);
        
        assertEq(resolver.gatewayURL(), newUrl);
    }

    function test_SetGatewayURL_AsNonOwnerReverts() public {
        vm.prank(address(2));
        vm.expectRevert(GhostPassResolver.GhostPassResolver__NotOwner.selector);
        resolver.setGatewayURL("https://new.example.com");
    }

    function test_SetSigner_AsOwner() public {
        address newSigner = address(0x999);
        
        vm.prank(owner);
        resolver.setSigner(newSigner);
        
        assertEq(resolver.trustedSigner(), newSigner);
    }

    function test_SetSigner_ZeroAddressReverts() public {
        vm.prank(owner);
        vm.expectRevert(GhostPassResolver.GhostPassResolver__InvalidSigner.selector);
        resolver.setSigner(address(0));
    }

    function test_TransferOwnership() public {
        address newOwner = address(0x888);
        
        vm.prank(owner);
        resolver.transferOwnership(newOwner);
        
        assertEq(resolver.owner(), newOwner);
    }

    /*//////////////////////////////////////////////////////////////
                         INTERFACE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SupportsInterface() public {
        assertTrue(resolver.supportsInterface(type(IERC165).interfaceId));
        assertTrue(resolver.supportsInterface(type(IExtendedResolver).interfaceId));
        assertFalse(resolver.supportsInterface(bytes4(0xdeadbeef)));
    }

    /*//////////////////////////////////////////////////////////////
                         HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _toArray(string memory value) internal pure returns (string[] memory) {
        string[] memory arr = new string[](1);
        arr[0] = value;
        return arr;
    }
}
