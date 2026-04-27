/**
 * @title GhostPassRegistry
 * @notice Core registry for GhostPass agents. Stores agent profiles,
 *         stealth meta-addresses, and emits payment announcements.
 * @dev Built for ETHGlobal OpenAgents 2026 hackathon.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GhostPassRegistry is Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error GhostPass__AlreadyRegistered();
    error GhostPass__NotRegistered();
    error GhostPass__NotAgentOwner();
    error GhostPass__InvalidMetaAddress();
    error GhostPass__EmptySubname();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event AgentRegistered(
        string indexed subname,
        address indexed owner,
        bytes32 spendingPubKey,
        bytes32 viewingPubKey,
        uint256 timestamp
    );

    event AgentUpdated(
        string indexed subname,
        string capabilities,
        string pricing,
        uint256 timestamp
    );

    event PaymentAnnounced(
        bytes32 indexed stealthAddress,
        bytes32 indexed ephemeralPubKey,
        address indexed sender,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Agent {
        address owner;
        bytes32 spendingPubKey;
        bytes32 viewingPubKey;
        string capabilities;
        string pricing;
        uint256 createdAt;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    mapping(string => Agent) private s_agents;
    mapping(string => bool) private s_isRegistered;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialOwner) Ownable(initialOwner) {}

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Register a new agent with GhostPass.
     * @param subname The ENS subname (e.g., "agent-123.ghostpass.eth")
     * @param spendingPubKey The agent's spending public key (secp256k1 point)
     * @param viewingPubKey The agent's viewing public key (secp256k1 point)
     * @param capabilities JSON array of agent capabilities
     * @param pricing Human-readable pricing string
     */
    function registerAgent(
        string calldata subname,
        bytes32 spendingPubKey,
        bytes32 viewingPubKey,
        string calldata capabilities,
        string calldata pricing
    ) external nonReentrant {
        if (bytes(subname).length == 0) revert GhostPass__EmptySubname();
        if (s_isRegistered[subname]) revert GhostPass__AlreadyRegistered();
        if (spendingPubKey == bytes32(0) || viewingPubKey == bytes32(0)) {
            revert GhostPass__InvalidMetaAddress();
        }

        s_agents[subname] = Agent({
            owner: msg.sender,
            spendingPubKey: spendingPubKey,
            viewingPubKey: viewingPubKey,
            capabilities: capabilities,
            pricing: pricing,
            createdAt: block.timestamp
        });

        s_isRegistered[subname] = true;

        emit AgentRegistered(
            subname,
            msg.sender,
            spendingPubKey,
            viewingPubKey,
            block.timestamp
        );
    }

    /**
     * @notice Update an agent's profile (capabilities and pricing).
     * @dev Only the agent owner can update.
     */
    function updateAgentProfile(
        string calldata subname,
        string calldata capabilities,
        string calldata pricing
    ) external {
        if (!s_isRegistered[subname]) revert GhostPass__NotRegistered();
        if (s_agents[subname].owner != msg.sender) revert GhostPass__NotAgentOwner();

        Agent storage agent = s_agents[subname];
        agent.capabilities = capabilities;
        agent.pricing = pricing;

        emit AgentUpdated(subname, capabilities, pricing, block.timestamp);
    }

    /**
     * @notice Announce a payment to a stealth address.
     * @dev This helps payees discover payments without scanning every block.
     * @param stealthAddress The one-time stealth address that received funds
     * @param ephemeralPubKey The ephemeral public key used for derivation
     * @param token The token address (address(0) for native ETH)
     * @param amount The payment amount
     */
    function announce(
        bytes32 stealthAddress,
        bytes32 ephemeralPubKey,
        address token,
        uint256 amount
    ) external {
        emit PaymentAnnounced(
            stealthAddress,
            ephemeralPubKey,
            msg.sender,
            token,
            amount,
            block.timestamp
        );
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getAgent(string calldata subname) external view returns (Agent memory) {
        if (!s_isRegistered[subname]) revert GhostPass__NotRegistered();
        return s_agents[subname];
    }

    function isRegistered(string calldata subname) external view returns (bool) {
        return s_isRegistered[subname];
    }

    function getAgentOwner(string calldata subname) external view returns (address) {
        if (!s_isRegistered[subname]) revert GhostPass__NotRegistered();
        return s_agents[subname].owner;
    }

    function getAgentKeys(string calldata subname)
        external
        view
        returns (bytes32 spendingPubKey, bytes32 viewingPubKey)
    {
        if (!s_isRegistered[subname]) revert GhostPass__NotRegistered();
        Agent storage agent = s_agents[subname];
        return (agent.spendingPubKey, agent.viewingPubKey);
    }
}
