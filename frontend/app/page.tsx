"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export default function Home() {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const { getToken } = useAuth();

  async function generate() {
    setOutput("");
    setStatus("loading");

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/ideas`, {
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      });

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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/40 text-violet-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
          ⚡ Powered by Cerebras · llama3.1-8b
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 mb-3">
          AI SaaS Idea Generator
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Generate 3 investor-ready, B2B SaaS ideas with full business models,
          pricing, and MVP scope — streamed live in seconds.
        </p>
      </div>

      <button
        onClick={generate}
        disabled={status === "loading" || status === "streaming"}
        className="mb-12 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg shadow-violet-900/40"
      >
        {status === "loading" && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {status === "streaming" && (
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
        {status === "loading" ? "Thinking..." : status === "streaming" ? "Generating..." : "Generate Ideas"}
      </button>

      {output && (
        <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="prose">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
          {status === "done" && (
            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={generate}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                ↺ Generate new ideas
              </button>
            </div>
          )}
        </div>
      )}

      {status === "idle" && (
        <p className="text-zinc-600 text-sm mt-4">
          Click the button to generate your first batch of ideas.
        </p>
      )}
    </div>
  );
}
