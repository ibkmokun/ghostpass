"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function RegisterPage() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState<{
    spendingPub: string;
    viewingPub: string;
    metaAddress: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capabilities: "",
    pricing: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateKeys = () => {
    // Simplified key generation for demo
    const spendingPub = "0x" + Array(66).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const viewingPub = "0x" + Array(66).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const metaAddress = spendingPub + viewingPub.slice(2);
    setKeys({ spendingPub, viewingPub, metaAddress });
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSuccess(true);
    setStep(3);
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

        <h1 className="text-3xl font-bold mb-8">Register Your Agent</h1>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-ghost-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {!isConnected && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to register an agent</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && step === 1 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Step 1: Generate Stealth Keys</h2>
            <p className="text-gray-400 mb-6">
              Your agent needs a spending key (to receive funds) and a viewing key
              (to scan for payments). Both are generated locally in your browser.
            </p>
            <button
              onClick={generateKeys}
              className="w-full py-3 bg-ghost-600 hover:bg-ghost-700 rounded-lg font-semibold transition"
            >
              Generate Keys
            </button>
          </div>
        )}

        {isConnected && step === 2 && keys && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Step 2: Agent Profile</h2>

            <div className="bg-gray-900 rounded-lg p-4 mb-6 text-sm font-mono break-all">
              <p className="text-gray-500 mb-1">Spending Public Key</p>
              <p className="text-ghost-400 mb-3">{keys.spendingPub}</p>
              <p className="text-gray-500 mb-1">Viewing Public Key</p>
              <p className="text-ghost-400">{keys.viewingPub}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-ghost-500 focus:outline-none"
                  placeholder="e.g., Alpha Trader"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Capabilities (JSON array)
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-ghost-500 focus:outline-none"
                  placeholder='["trading-signals", "market-analysis"]'
                  rows={3}
                  value={formData.capabilities}
                  onChange={(e) =>
                    setFormData({ ...formData, capabilities: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pricing
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-ghost-500 focus:outline-none"
                  placeholder="e.g., 5 USDC per signal"
                  value={formData.pricing}
                  onChange={(e) =>
                    setFormData({ ...formData, pricing: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name}
              className="w-full mt-6 py-3 bg-ghost-600 hover:bg-ghost-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {isSubmitting ? "Registering..." : "Register Agent"}
            </button>
          </div>
        )}

        {isConnected && step === 3 && success && (
          <div className="bg-gray-800 rounded-xl p-6 border border-ghost-500 text-center">
            <h2 className="text-xl font-semibold mb-4 text-ghost-400">
              Agent Registered!
            </h2>
            <p className="text-gray-300 mb-4">
              Your agent now has an ENS subname:
            </p>
            <p className="text-2xl font-mono text-ghost-400 mb-6">
              {formData.name.toLowerCase().replace(/\s+/g, "-")}.ghostpass.eth
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-ghost-600 hover:bg-ghost-700 rounded-lg font-semibold transition"
              >
                View Dashboard
              </Link>
              <Link
                href="/"
                className="px-6 py-2 border border-gray-600 hover:border-ghost-500 rounded-lg font-semibold transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
