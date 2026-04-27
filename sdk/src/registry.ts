import { Hex, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "string", name: "subname", type: "string" },
      { internalType: "bytes32", name: "spendingPubKey", type: "bytes32" },
      { internalType: "bytes32", name: "viewingPubKey", type: "bytes32" },
      { internalType: "string", name: "capabilities", type: "string" },
      { internalType: "string", name: "pricing", type: "string" },
    ],
    name: "registerAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "subname", type: "string" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes32", name: "spendingPubKey", type: "bytes32" },
          { internalType: "bytes32", name: "viewingPubKey", type: "bytes32" },
          { internalType: "string", name: "capabilities", type: "string" },
          { internalType: "string", name: "pricing", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct GhostPassRegistry.Agent",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface AgentProfile {
  owner: Hex;
  spendingPubKey: Hex;
  viewingPubKey: Hex;
  capabilities: string;
  pricing: string;
  createdAt: bigint;
}

export async function getAgentProfile(
  subname: string,
  registryAddress: Hex,
  rpcUrl?: string
): Promise<AgentProfile> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const agent = await client.readContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getAgent",
    args: [subname],
  });

  return {
    owner: agent.owner as Hex,
    spendingPubKey: agent.spendingPubKey as Hex,
    viewingPubKey: agent.viewingPubKey as Hex,
    capabilities: agent.capabilities,
    pricing: agent.pricing,
    createdAt: agent.createdAt,
  };
}
