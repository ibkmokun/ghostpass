"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import Link from "next/link";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [payments, setPayments] = useState([
    {
      id: "1",
      stealthAddress: "0x7a3f...9b2e",
      amount: "5.0",
      token: "ETH",
      date: "2026-04-27",
      status: "Unclaimed" as const,
    },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsScanning(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-ghost-400 hover:text-ghost-300">
            ← Back to Home
          </Link>
          <ConnectButton />
        </div>

        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>

        {!isConnected && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to view your agent dashboard</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Alpha Trader</h2>
                  <p className="text-ghost-400 font-mono text-sm">
                    alpha-trader.ghostpass.eth
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-ghost-900/50 text-ghost-400 text-xs rounded-full">
                      trading-signals
                    </span>
                    <span className="px-2 py-1 bg-ghost-900/50 text-ghost-400 text-xs rounded-full">
                      market-analysis
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Pricing</p>
                  <p className="text-white font-semibold">5 USDC per signal</p>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">ETH Balance</p>
                <p className="text-2xl font-bold">
                  {balance ? `${balance.formatted} ETH` : "Loading..."}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">USDC Balance</p>
                <p className="text-2xl font-bold">0 USDC</p>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Received Payments</h3>
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-4 py-2 bg-ghost-600 hover:bg-ghost-700 disabled:bg-gray-700 rounded-lg text-sm font-semibold transition"
                >
                  {isScanning ? "Scanning..." : "Scan for Payments"}
                </button>
              </div>

              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payments found yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Stealth Address</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-700/50"
                        >
                          <td className="py-3 font-mono text-ghost-400">
                            {payment.stealthAddress}
                          </td>
                          <td className="py-3">
                            {payment.amount} {payment.token}
                          </td>
                          <td className="py-3 text-gray-400">{payment.date}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === "Unclaimed"
                                  ? "bg-yellow-900/50 text-yellow-400"
                                  : "bg-green-900/50 text-green-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {payment.status === "Unclaimed" && (
                              <button className="px-3 py-1 bg-ghost-600 hover:bg-ghost-700 rounded text-xs font-semibold transition">
                                Recover
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
