import { generatePrivateKey, privateKeyToAccount, keccak256, Hex } from "viem";

export interface StealthKeys {
  spendingPriv: Hex;
  spendingPub: Hex;
  viewingPriv: Hex;
  viewingPub: Hex;
  metaAddress: string;
}

/**
 * Generate a new pair of stealth keys for an agent.
 */
export function generateStealthKeys(): StealthKeys {
  const spendingPriv = generatePrivateKey();
  const viewingPriv = generatePrivateKey();

  const spendingAccount = privateKeyToAccount(spendingPriv);
  const viewingAccount = privateKeyToAccount(viewingPriv);

  const metaAddress = spendingAccount.publicKey + viewingAccount.publicKey.slice(2);

  return {
    spendingPriv,
    spendingPub: spendingAccount.publicKey,
    viewingPriv,
    viewingPub: viewingAccount.publicKey,
    metaAddress,
  };
}

/**
 * Serialize meta-address for storage.
 */
export function serializeMetaAddress(viewingPub: Hex, spendingPub: Hex): string {
  return spendingPub + viewingPub.slice(2);
}

/**
 * Parse a serialized meta-address.
 */
export function parseMetaAddress(metaAddress: string): { spendingPub: Hex; viewingPub: Hex } {
  if (metaAddress.length !== 130 && metaAddress.length !== 132) {
    throw new Error("Invalid meta-address length");
  }
  const hex = metaAddress.startsWith("0x") ? metaAddress : `0x${metaAddress}`;
  return {
    spendingPub: hex.slice(0, 68) as Hex,
    viewingPub: hex.slice(68, 132) as Hex,
  };
}

/**
 * Derive a stealth address from spending public key and ephemeral private key.
 * Simplified derivation for hackathon demo.
 */
export function deriveStealthAddress(spendingPub: Hex, ephemeralPriv: Hex): Hex {
  const combined = ephemeralPriv + spendingPub.slice(2);
  const hash = keccak256(combined as Hex);
  return `0x${hash.slice(-40)}`;
}

/**
 * Recover the stealth private key.
 * Simplified recovery for hackathon demo.
 */
export function recoverStealthPrivateKey(
  _ephemeralPub: Hex,
  viewingPriv: Hex,
  spendingPriv: Hex
): Hex {
  // In a full implementation: stealthPriv = hash(sharedSecret) + spendingPriv
  // where sharedSecret = viewingPriv * ephemeralPub (ECDH)
  // For hackathon: return a deterministic key derived from inputs
  const hash = keccak256((viewingPriv + spendingPriv.slice(2)) as Hex);
  return `0x${hash.slice(-64)}`;
}
