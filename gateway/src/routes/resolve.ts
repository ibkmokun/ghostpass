import { Request, Response } from "express";
import {
  createPublicClient,
  http,
  namehash,
  encodeAbiParameters,
  parseAbiParameters,
  keccak256,
  hexToBytes,
  bytesToHex,
  serializeSignature,
  hashMessage,
} from "viem";
import { baseSepolia } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const GATEWAY_SIGNER_PRIVATE_KEY = process.env.GATEWAY_SIGNER_PRIVATE_KEY || "";

// Minimal PublicResolver ABI for text records
const publicResolverABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "key", type: "string" },
    ],
    name: "text",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
});

/**
 * Derive a stealth address from a spending public key and ephemeral private key.
 * Uses secp256k1 ECDH.
 */
function deriveStealthAddress(
  spendingPubHex: `0x${string}`,
  ephemeralPrivHex: `0x${string}`
): `0x${string}` {
  // For the hackathon, we use a simplified derivation:
  // stealthAddress = keccak256(ephemeralPriv + spendingPub)[12:]
  // In production, use proper secp256k1 point math.
  const combined = ephemeralPrivHex + spendingPubHex.slice(2);
  const hash = keccak256(combined as `0x${string}`);
  return `0x${hash.slice(-40)}`;
}

/**
 * Sign a response with the gateway's private key.
 */
async function signResponse(data: `0x${string}`, privateKey: `0x${string}`): Promise<`0x${string}`> {
  const account = privateKeyToAccount(privateKey);
  const messageHash = keccak256(data);
  const signature = await account.signMessage({
    message: { raw: messageHash },
  });
  return signature;
}

export async function resolveRoute(req: Request, res: Response) {
  try {
    const { name } = req.params;

    // Validate ENS name format
    if (!name.endsWith(".ghostpass.eth")) {
      return res.status(400).json({ error: "Invalid name. Must end with .ghostpass.eth" });
    }

    // Fetch meta-address from ENS text record
    const node = namehash(name);
    let metaAddress: string;
    try {
      // Try to get resolver and text record
      const resolverAddress = await client.getEnsResolver({ name });
      if (!resolverAddress) {
        return res.status(404).json({ error: "No resolver found for name" });
      }
      metaAddress = (await client.readContract({
        address: resolverAddress,
        abi: publicResolverABI,
        functionName: "text",
        args: [node, "ghostpass.metaaddress"],
      })) as string;
    } catch (e) {
      // Fallback: check GhostPassRegistry directly if ENS text record not set yet
      const registryAddress = process.env.GHOSTPASS_REGISTRY_ADDRESS as `0x${string}`;
      if (registryAddress) {
        const registryABI = [
          {
            inputs: [{ internalType: "string", name: "subname", type: "string" }],
            name: "getAgentKeys",
            outputs: [
              { internalType: "bytes32", name: "spendingPubKey", type: "bytes32" },
              { internalType: "bytes32", name: "viewingPubKey", type: "bytes32" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ] as const;
        try {
          const [spending, viewing] = await client.readContract({
            address: registryAddress,
            abi: registryABI,
            functionName: "getAgentKeys",
            args: [name],
          });
          metaAddress = spending + viewing.slice(2);
        } catch {
          return res.status(404).json({ error: "Agent not registered" });
        }
      } else {
        return res.status(404).json({ error: "Agent not registered" });
      }
    }

    if (!metaAddress || metaAddress.length < 66) {
      return res.status(404).json({ error: "Agent meta-address not found" });
    }

    // Parse meta-address into spending and viewing public keys
    const spendingPub = metaAddress.slice(0, 66) as `0x${string}`;
    // const viewingPub = metaAddress.slice(66, 130) as `0x${string}`;

    // Generate ephemeral key pair
    const ephemeralPriv = generatePrivateKey();
    const ephemeralAccount = privateKeyToAccount(ephemeralPriv);
    const ephemeralPub = ephemeralAccount.publicKey;

    // Derive stealth address
    const stealthAddress = deriveStealthAddress(spendingPub, ephemeralPriv);

    // Encode response
    const responseData = encodeAbiParameters(parseAbiParameters("address"), [stealthAddress]);

    // Sign response
    const signature = await signResponse(responseData, GATEWAY_SIGNER_PRIVATE_KEY as `0x${string}`);

    return res.json({
      data: responseData,
      signature,
      sender: process.env.GATEWAY_SIGNER_ADDRESS,
      ephemeralPubKey: ephemeralPub,
      stealthAddress,
    });
  } catch (error) {
    console.error("Resolution error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
