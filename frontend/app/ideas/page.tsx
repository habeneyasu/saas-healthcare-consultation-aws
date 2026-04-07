"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

const LOADING_STEPS = [
  "Analyzing B2B market gaps...",
  "Identifying high-value ICPs...",
  "Designing AI agent workflows...",
  "Scoping MVP features...",
  "Crafting pricing strategies...",
  "Finalizing your ideas...",
];

export default function IdeasPage() {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "streaming") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output, status]);

  useEffect(() => {
    if (status === "loading" || status === "streaming") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      stepRef.current = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 1800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepRef.current) clearInterval(stepRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepRef.current) clearInterval(stepRef.current);
    };
  }, [status]);

  async function generate() {
    setOutput("");
    setStatus("loading");
    setElapsed(0);
    setLoadingStep(0);

    try {
      const headers: Record<string, string> = { Accept: "text/plain" };
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/ideas`, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      if (!res.body) throw new Error("No response body");

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setStatus("done");
    } catch (err) {
      setOutput(`Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStatus("error");
    }
  }

  const isActive = status === "loading" || status === "streaming";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <button onClick={() => router.push("/")} className="text-zinc-500 hover:text-zinc-300 text-sm mb-8 flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/40 text-violet-400 text-xs font-medium px-3 py-1 rounded-full mb-5">
            ⚡ Cerebras · llama3.1-8b
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 mb-3">
            SaaS Idea Generator
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Generate investor-ready B2B SaaS ideas streamed live in seconds.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {isSignedIn ? (
            <span className="inline-flex items-center gap-1.5 bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              ✦ Pro — 3 ideas · 20 requests/day
            </span>
          ) : (
            <div className="flex items-center gap-3">
              <span className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 text-xs px-3 py-1.5 rounded-full">
                Free — 1 idea · 3 requests/day
              </span>
              <SignInButton mode="modal">
                <button className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                  Sign in for Pro
                </button>
              </SignInButton>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={generate}
            disabled={isActive}
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-lg shadow-violet-900/30"
          >
            {isActive ? (
              <><span className="w-4 h-4 border-2 border-zinc-500 border-t-violet-400 rounded-full animate-spin" />Generating...</>
            ) : (
              <><span>✦</span>{isSignedIn ? "Generate 3 Ideas" : "Generate 1 Idea (Free)"}</>
            )}
          </button>
        </div>

        {status === "loading" && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm">Thinking with AI...</span>
              <span className="text-zinc-600 text-xs font-mono">{elapsed}s</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1 mb-4 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-pulse w-2/3" />
            </div>
            <p className="text-violet-300 text-sm font-medium">{LOADING_STEPS[loadingStep]}</p>
          </div>
        )}

        {output && status !== "error" && (
          <div>
            {status === "streaming" && (
              <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Streaming live · {elapsed}s
              </div>
            )}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              <div className="prose"><ReactMarkdown>{output}</ReactMarkdown></div>
              {status === "streaming" && <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-1 rounded-sm" />}
              {status === "done" && (
                <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">Generated in {elapsed}s</span>
                  <div className="flex items-center gap-4">
                    {!isSignedIn && (
                      <SignInButton mode="modal">
                        <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">✦ Sign in for 3 ideas</button>
                      </SignInButton>
                    )}
                    <button onClick={generate} className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">↺ Regenerate</button>
                  </div>
                </div>
              )}
            </div>
            <div ref={bottomRef} />
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-red-400 text-sm">{output}</div>
        )}

        {status === "idle" && (
          <p className="text-center text-zinc-700 text-sm">Powered by Cerebras ultra-fast inference — results in under 10 seconds.</p>
        )}
      </div>
    </div>
  );
}
