"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function PayPage({ params }: { params: { ensName: string } }) {
  const ensName = decodeURIComponent(params.ensName);
  const { isConnected } = useAccount();
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [previousAddress, setPreviousAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [amount, setAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleResolve = async () => {
    setIsResolving(true);
    if (resolvedAddress) {
      setPreviousAddress(resolvedAddress);
    }
    // Mock resolution
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockAddr =
      "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    setResolvedAddress(mockAddr);
    setIsResolving(false);
  };

  const handlePay = async () => {
    setIsPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTxHash("0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
    setIsPaying(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-ghost-400 hover:text-ghost-300">
            ← Back to Home
          </Link>
          <ConnectButton />
        </div>

        <h1 className="text-3xl font-bold mb-2">Pay Agent</h1>
        <p className="text-ghost-400 font-mono mb-8">{ensName}</p>

        {!isConnected && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to pay this agent</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && (
          <div className="space-y-6">
            {/* Agent Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-2">Agent Profile</h2>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-ghost-900/50 text-ghost-400 text-xs rounded-full">
                  trading-signals
                </span>
                <span className="px-2 py-1 bg-ghost-900/50 text-ghost-400 text-xs rounded-full">
                  market-analysis
                </span>
              </div>
              <p className="text-gray-400 text-sm">Pricing: 5 USDC per signal</p>
            </div>

            {/* Resolution */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Stealth Address Resolution</h2>

              {previousAddress && (
                <div className="bg-gray-900 rounded-lg p-3 mb-4 text-sm">
                  <p className="text-gray-500">Previous Resolution</p>
                  <p className="font-mono text-gray-400 break-all">{previousAddress}</p>
                </div>
              )}

              {resolvedAddress && (
                <div className="bg-ghost-900/30 rounded-lg p-3 mb-4 text-sm border border-ghost-700">
                  <p className="text-ghost-400">Current Resolution</p>
                  <p className="font-mono text-ghost-300 break-all">{resolvedAddress}</p>
                </div>
              )}

              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="w-full py-3 bg-ghost-600 hover:bg-ghost-700 disabled:bg-gray-700 rounded-lg font-semibold transition"
              >
                {isResolving
                  ? "Resolving..."
                  : resolvedAddress
                  ? "Resolve Again (Different Address)"
                  : "Resolve Stealth Address"}
              </button>

              {previousAddress && resolvedAddress && previousAddress !== resolvedAddress && (
                <p className="text-green-400 text-sm mt-3 text-center">
                  Different address generated! Privacy preserved.
                </p>
              )}
            </div>

            {/* Payment */}
            {resolvedAddress && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Send Payment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount (ETH)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-ghost-500 focus:outline-none"
                      placeholder="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={isPaying || !amount}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-semibold transition"
                  >
                    {isPaying ? "Sending..." : "Send Payment"}
                  </button>
                </div>

                {txHash && (
                  <div className="mt-4 bg-green-900/30 rounded-lg p-3 text-sm border border-green-700">
                    <p className="text-green-400">Payment sent!</p>
                    <p className="font-mono text-green-300 break-all text-xs mt-1">
                      {txHash}
                    </p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-xs underline mt-1 inline-block"
                    >
                      View on Basescan →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
