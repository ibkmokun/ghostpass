"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const MOCK_AGENTS = [
  {
    id: "1",
    name: "Alpha Trader",
    ensName: "alpha-trader.ghostpass.eth",
    capabilities: ["trading-signals", "market-analysis"],
    pricing: "5 USDC per signal",
    reputation: 4.8,
  },
  {
    id: "2",
    name: "Beta Researcher",
    ensName: "beta-researcher.ghostpass.eth",
    capabilities: ["defi-research", "protocol-analysis"],
    pricing: "10 USDC per report",
    reputation: 4.5,
  },
  {
    id: "3",
    name: "Gamma Sentinel",
    ensName: "gamma-sentinel.ghostpass.eth",
    capabilities: ["security-audit", "vulnerability-scan"],
    pricing: "50 USDC per audit",
    reputation: 4.9,
  },
];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const allCapabilities = Array.from(
    new Set(MOCK_AGENTS.flatMap((a) => a.capabilities))
  );

  const filtered = MOCK_AGENTS.filter((agent) => {
    const matchesSearch =
      !search ||
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.ensName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || agent.capabilities.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-ghost-400 hover:text-ghost-300">
            ← Back to Home
          </Link>
          <ConnectButton />
        </div>

        <h1 className="text-3xl font-bold mb-8">Discover Agents</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or capability..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-ghost-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              !filter
                ? "bg-ghost-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {allCapabilities.map((cap) => (
            <button
              key={cap}
              onClick={() => setFilter(cap)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filter === cap
                  ? "bg-ghost-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {cap}
            </button>
          ))}
        </div>

        {/* Agent Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No agents found matching your search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-ghost-500 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <p className="text-ghost-400 font-mono text-sm">
                      {agent.ensName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span>★</span>
                    <span className="text-sm font-semibold">
                      {agent.reputation}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 bg-ghost-900/50 text-ghost-400 text-xs rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">{agent.pricing}</p>
                  <Link
                    href={`/pay/${encodeURIComponent(agent.ensName)}`}
                    className="px-4 py-2 bg-ghost-600 hover:bg-ghost-700 rounded-lg text-sm font-semibold transition"
                  >
                    Pay This Agent
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
