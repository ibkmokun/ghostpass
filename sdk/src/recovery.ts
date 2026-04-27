import { Hex, createPublicClient, http, parseAbiItem, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { keccak256 } from "viem";

export interface DiscoveredPayment {
  stealthAddress: Hex;
  ephemeralPubKey: Hex;
  amount: string;
  token: Hex;
  blockNumber: bigint;
}

/**
 * Scan for payments to stealth addresses.
 * Simplified scanner for hackathon demo.
 */
export async function scanForPayments(
  _viewingPriv: Hex,
  _spendingPub: Hex,
  registryAddress: Hex,
  fromBlock: bigint,
  rpcUrl?: string
): Promise<DiscoveredPayment[]> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const logs = await client.getLogs({
    address: registryAddress,
    event: parseAbiItem(
      "event PaymentAnnounced(bytes32 indexed stealthAddress, bytes32 indexed ephemeralPubKey, address indexed sender, address token, uint256 amount, uint256 timestamp)"
    ),
    fromBlock,
  });

  const payments: DiscoveredPayment[] = [];

  for (const log of logs) {
    const { stealthAddress, ephemeralPubKey, token, amount } = log.args;
    if (!stealthAddress || !ephemeralPubKey || !token || !amount) continue;

    // In a full implementation: derive candidate address and check balance
    // For hackathon: return all announced payments
    payments.push({
      stealthAddress: stealthAddress as Hex,
      ephemeralPubKey: ephemeralPubKey as Hex,
      amount: formatEther(amount),
      token: token as Hex,
      blockNumber: log.blockNumber,
    });
  }

  return payments;
}

/**
 * Recover a payment by sweeping funds from a stealth address.
 * Simplified recovery for hackathon demo.
 */
export async function recoverPayment(
  stealthAddress: Hex,
  _ephemeralPub: Hex,
  _viewingPriv: Hex,
  _spendingPriv: Hex,
  recipient: Hex,
  rpcUrl?: string
): Promise<Hex> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const balance = await client.getBalance({ address: stealthAddress });

  if (balance === 0n) {
    throw new Error("No funds to recover at this address");
  }

  // In a full implementation: derive stealth private key and sign sweep tx
  // For hackathon: this would require the actual private key derivation
  // Return a mock hash for demo purposes
  const mockHash = keccak256(`sweep-${stealthAddress}-${recipient}` as Hex);
  return mockHash;
}
