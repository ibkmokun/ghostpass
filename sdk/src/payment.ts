import { Hex, createWalletClient, http, parseEther, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export interface PaymentResult {
  hash: Hex;
  stealthAddress: Hex;
  ephemeralPubKey: Hex;
}

/**
 * Send a payment to a stealth address.
 */
export async function sendStealthPayment(
  stealthAddress: Hex,
  amount: string,
  token: "ETH" | "USDC",
  senderPrivateKey: Hex,
  ephemeralPubKey: Hex
): Promise<PaymentResult> {
  const account = privateKeyToAccount(senderPrivateKey);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  let hash: Hex;

  if (token === "ETH") {
    hash = await client.sendTransaction({
      to: stealthAddress,
      value: parseEther(amount),
    });
  } else {
    // USDC transfer would require contract interaction
    // Simplified for hackathon
    throw new Error("USDC payments require additional setup");
  }

  return {
    hash,
    stealthAddress,
    ephemeralPubKey,
  };
}

/**
 * Announce a payment onchain so the payee can discover it.
 */
export async function announcePayment(
  stealthAddress: Hex,
  ephemeralPubKey: Hex,
  token: Hex,
  amount: bigint,
  senderPrivateKey: Hex,
  registryAddress: Hex
): Promise<Hex> {
  const account = privateKeyToAccount(senderPrivateKey);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const hash = await client.writeContract({
    address: registryAddress,
    abi: [
      {
        inputs: [
          { internalType: "bytes32", name: "stealthAddress", type: "bytes32" },
          { internalType: "bytes32", name: "ephemeralPubKey", type: "bytes32" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "announce",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
    functionName: "announce",
    args: [
      stealthAddress as Hex,
      ephemeralPubKey as Hex,
      token,
      amount,
    ],
  });

  return hash;
}
