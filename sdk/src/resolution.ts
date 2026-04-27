import { Hex } from "viem";

const GATEWAY_URL = process.env.GATEWAY_URL || "https://ghostpass-gateway.vercel.app";

export interface StealthResolution {
  address: Hex;
  ephemeralPubKey: Hex;
  signature: Hex;
}

/**
 * Resolve an ENS name to a stealth address via the GhostPass gateway.
 */
export async function resolveStealthAddress(ensName: string): Promise<StealthResolution> {
  const response = await fetch(`${GATEWAY_URL}/resolve/${ensName}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Resolution failed");
  }

  const data = await response.json();

  return {
    address: data.stealthAddress as Hex,
    ephemeralPubKey: data.ephemeralPubKey as Hex,
    signature: data.signature as Hex,
  };
}

/**
 * Resolve agent capabilities from ENS text record.
 * Falls back to GhostPassRegistry if text record not available.
 */
export async function resolveAgentCapabilities(ensName: string): Promise<unknown> {
  try {
    // Try ENS text record first
    // This would require an ENS client; simplified for hackathon
    return null;
  } catch {
    return null;
  }
}
