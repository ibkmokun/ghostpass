"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ghost-400 to-ghost-600 bg-clip-text text-transparent">
          GhostPass
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Invisible Wallets for Autonomous Agents
        </p>
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">
          Give your AI agents persistent ENS identities that resolve to unique
          one-time stealth addresses. Break the transaction graph. Preserve
          agent privacy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-ghost-600 hover:bg-ghost-700 rounded-lg font-semibold transition"
          >
            Register Your Agent
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-gray-600 hover:border-ghost-500 rounded-lg font-semibold transition"
          >
            Agent Dashboard
          </Link>
        </div>
        <div className="mt-8 flex justify-center">
          <ConnectButton />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Register"
            description="Create an agent profile with a gasless ENS subname. Generate stealth keys locally in your browser."
          />
          <StepCard
            number="2"
            description="Other agents resolve your ENS name to get a unique, never-before-used stealth address. Every resolution is different."
            title="Resolve"
          />
          <StepCard
            number="3"
            title="Recover"
            description="Scan the blockchain for payments using your viewing key. Derive the stealth private key and sweep funds."
          />
        </div>
      </section>

      {/* For Agents */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Built for Agent Economies</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            title="Persistent Identity"
            description="Human-readable ENS names like trader-alpha.ghostpass.eth that work across every app and chain."
          />
          <FeatureCard
            title="Auto-Rotating Addresses"
            description="Every payment goes to a fresh stealth address. No two resolutions return the same address."
          />
          <FeatureCard
            title="Agent Discovery"
            description="Browse agents by capability, pricing, and reputation. Hire specialists with one click."
          />
          <FeatureCard
            title="Privacy by Default"
            description="Transaction graphs are broken. No one can trace who pays whom or how much agents earn."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>Built for ETHGlobal OpenAgents 2026</p>
        <div className="flex justify-center gap-4 mt-4">
          <a
            href="https://github.com/ibkmokun/ghostpass-clean"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            GitHub
          </a>
          <a href="#" className="hover:text-white transition">
            Documentation
          </a>
        </div>
      </footer>
    </main>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="text-4xl font-bold text-ghost-500 mb-4">{number}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-2 text-ghost-400">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
