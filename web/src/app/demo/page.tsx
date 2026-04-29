"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [stealthAddress, setStealthAddress] = useState<string | null>(null);
  const [previousAddress, setPreviousAddress] = useState<string | null>(null);
  const [paymentSent, setPaymentSent] = useState(false);
  const [recovered, setRecovered] = useState(false);

  const steps = [
    "Agent A (Seller) is registered with ghostpass.eth",
    "Agent B (Buyer) discovers Agent A via ENS",
    "Agent B resolves stealth address from Agent A's ENS name",
    "Agent B sends payment to the stealth address",
    "Agent A scans blockchain and recovers the payment",
  ];

  const generateAddress = () => {
    if (stealthAddress) {
      setPreviousAddress(stealthAddress);
    }
    const addr =
      "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    setStealthAddress(addr);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-ghost-400 hover:text-ghost-300">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Live Demo</h1>
        <p className="text-gray-400 mb-8">
          Watch two agents interact with invisible wallets.
        </p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i <= step ? "bg-ghost-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Two Panel Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Seller Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h3 className="font-semibold">Alpha Trader</h3>
                <p className="text-ghost-400 font-mono text-sm">
                  alpha-trader.ghostpass.eth
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className={recovered ? "text-green-400" : "text-white"}>
                  {recovered ? "5.0 ETH" : "0.0 ETH"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stealth Address</span>
                <span className="font-mono text-ghost-400">
                  {stealthAddress
                    ? `${stealthAddress.slice(0, 6)}...${stealthAddress.slice(-4)}`
                    : "—"}
                </span>
              </div>
            </div>

            {step >= 4 && (
              <button
                onClick={() => {
                  setRecovered(true);
                  setStep(4);
                }}
                disabled={recovered}
                className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm font-semibold transition"
              >
                {recovered ? "Payment Recovered!" : "Scan & Recover Payment"}
              </button>
            )}
          </div>

          {/* Buyer Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h3 className="font-semibold">Beta Researcher</h3>
                <p className="text-ghost-400 font-mono text-sm">
                  beta-researcher.ghostpass.eth
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target</span>
                <span className="font-mono text-ghost-400">
                  alpha-trader.ghostpass.eth
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment</span>
                <span className="text-white">5.0 ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className={paymentSent ? "text-green-400" : "text-yellow-400"}>
                  {paymentSent ? "Sent" : "Ready"}
                </span>
              </div>
            </div>

            {step >= 2 && !paymentSent && (
              <button
                onClick={() => {
                  setPaymentSent(true);
                  setStep(3);
                }}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
              >
                Send 5.0 ETH Payment
              </button>
            )}
          </div>
        </div>

        {/* Step Log */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">Interaction Log</h3>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${
                  i <= step ? "text-white" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= step ? "bg-ghost-600" : "bg-gray-700"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {step === 0 && (
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-ghost-600 hover:bg-ghost-700 rounded-lg font-semibold transition"
            >
              Start Demo
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => {
                generateAddress();
                setStep(2);
              }}
              className="px-6 py-3 bg-ghost-600 hover:bg-ghost-700 rounded-lg font-semibold transition"
            >
              Resolve Stealth Address
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Send Payment
            </button>
          )}
          {step === 3 && (
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              Recover Payment
            </button>
          )}
          {step === 4 && (
            <div className="text-center">
              <p className="text-green-400 mb-4">
                Demo complete! The transaction graph is broken — no observer can
                link this payment to either agent.
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  setStealthAddress(null);
                  setPreviousAddress(null);
                  setPaymentSent(false);
                  setRecovered(false);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                Restart Demo
              </button>
            </div>
          )}
        </div>

        {/* Magic Moment */}
        {previousAddress && stealthAddress && (
          <div className="mt-8 bg-ghost-900/30 rounded-xl p-6 border border-ghost-700 text-center">
            <h4 className="text-ghost-400 font-semibold mb-2">
              Magic Moment: Same ENS, Different Address
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-500">First Resolution</p>
                <p className="font-mono text-gray-400 break-all">
                  {previousAddress}
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-500">Second Resolution</p>
                <p className="font-mono text-ghost-400 break-all">
                  {stealthAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
