"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-700/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center mb-16 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/40 text-violet-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
          ⚡ Powered by Cerebras · llama3.1-8b
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-50 mb-4 leading-tight">
          What would you like<br />
          <span className="text-violet-400">to do today?</span>
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Choose a tool below to get started. Both are powered by real-time AI streaming.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl relative z-10">

        {/* Idea Generator Card */}
        <button
          onClick={() => router.push("/ideas")}
          className="group text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-700/50 rounded-2xl p-8 transition-all duration-200 shadow-xl hover:shadow-violet-900/20"
        >
          <div className="text-3xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-zinc-50 mb-2 group-hover:text-violet-300 transition-colors">
            SaaS Idea Generator
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Generate 3 investor-ready B2B SaaS ideas with pricing, MVP scope, and GTM strategy — streamed live.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded-full">Free: 1 idea</span>
            <span className="bg-violet-900/40 text-violet-400 px-2 py-1 rounded-full">Pro: 3 ideas</span>
          </div>
          <div className="mt-6 text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Get started →
          </div>
        </button>

        {/* Health Consultation Card */}
        <button
          onClick={() => router.push("/consultation")}
          className="group text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-700/50 rounded-2xl p-8 transition-all duration-200 shadow-xl hover:shadow-emerald-900/20"
        >
          <div className="text-3xl mb-4">🩺</div>
          <h2 className="text-xl font-semibold text-zinc-50 mb-2 group-hover:text-emerald-300 transition-colors">
            Health Consultation
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Get a structured AI health assessment with possible causes, recommended actions, and urgency level.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="bg-zinc-800 px-2 py-1 rounded-full">Instant response</span>
            <span className="bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded-full">Streamed live</span>
          </div>
          <div className="mt-6 text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Get started →
          </div>
        </button>

      </div>

      <p className="mt-12 text-zinc-700 text-xs relative z-10">
        AI-generated content only. Not a substitute for professional medical or business advice.
      </p>
    </div>
  );
}
