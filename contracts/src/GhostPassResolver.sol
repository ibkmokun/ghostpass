/**
 * @title GhostPassResolver
 * @notice CCIP-enabled ENS resolver (EIP-3668) for dynamic stealth address resolution.
 * @dev Instead of returning an address directly, this resolver reverts with
 *      an OffchainLookup that directs the client to the GhostPass gateway.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IExtendedResolver {
    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory);
}

contract GhostPassResolver is IExtendedResolver, IERC165 {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error GhostPassResolver__NotOwner();
    error GhostPassResolver__InvalidGateway();
    error GhostPassResolver__InvalidSigner();
    error GhostPassResolver__SignatureExpired();
    error GhostPassResolver__InvalidSignature();
    error GhostPassResolver__InvalidResponse();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event GatewayURLUpdated(string newUrl);
    event SignerUpdated(address newSigner);

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    address public owner;
    string public gatewayURL;
    address public trustedSigner;

    /*//////////////////////////////////////////////////////////////
                                 MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert GhostPassResolver__NotOwner();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(string memory _gatewayURL, address _trustedSigner) {
        owner = msg.sender;
        gatewayURL = _gatewayURL;
        trustedSigner = _trustedSigner;
    }

    /*//////////////////////////////////////////////////////////////
                         EIP-3668 OFFCHAIN LOOKUP
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Revert reason for EIP-3668 CCIP Read.
     */
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Main resolution entry point. Reverts with OffchainLookup
     *         to trigger a CCIP Read to the GhostPass gateway.
     */
    function resolve(bytes calldata name, bytes calldata data) external view override returns (bytes memory) {
        string[] memory urls = new string[](1);
        urls[0] = gatewayURL;

        revert OffchainLookup(
            address(this),
            urls,
            abi.encodeCall(this.resolve, (name, data)),
            this.resolveWithProof.selector,
            abi.encode(name)
        );
    }

    /**
     * @notice Callback function that processes the gateway's signed response.
     * @param response The ABI-encoded (address, signature) from the gateway
     * @param extraData The original name bytes
     */
    function resolveWithProof(bytes calldata response, bytes calldata extraData)
        external
        view
        returns (bytes memory)
    {
        // Decode the gateway response
        (address stealthAddress, bytes memory signature) = abi.decode(response, (address, bytes));

        // Reconstruct the message that was signed
        bytes32 messageHash = keccak256(abi.encodePacked(stealthAddress, extraData));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        // Recover signer from signature
        address signer = recoverSigner(ethSignedMessageHash, signature);

        // Verify signer is trusted
        if (signer != trustedSigner) revert GhostPassResolver__InvalidSignature();

        // Return the resolved stealth address
        return abi.encode(stealthAddress);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setGatewayURL(string calldata _gatewayURL) external onlyOwner {
        if (bytes(_gatewayURL).length == 0) revert GhostPassResolver__InvalidGateway();
        gatewayURL = _gatewayURL;
        emit GatewayURLUpdated(_gatewayURL);
    }

    function setSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) revert GhostPassResolver__InvalidSigner();
        trustedSigner = _signer;
        emit SignerUpdated(_signer);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert GhostPassResolver__InvalidSigner();
        owner = newOwner;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId
            || interfaceId == type(IExtendedResolver).interfaceId;
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        if (signature.length != 65) revert GhostPassResolver__InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;

        return ecrecover(ethSignedMessageHash, v, r, s);
    }
}
