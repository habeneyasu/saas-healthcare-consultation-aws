"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export default function ConsultationPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [complaint, setComplaint] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOutput("");
    setStatus("loading");
    setElapsed(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const res = await fetch(`${API_URL}/api/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/plain" },
        body: JSON.stringify({ name, date, complaint }),
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
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  const isActive = status === "loading" || status === "streaming";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <button onClick={() => router.push("/")} className="text-zinc-500 hover:text-zinc-300 text-sm mb-8 flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-5">
            🩺 AI Health Consultation
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 mb-3">
            Health Consultation
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Describe your symptoms and get a structured AI health assessment streamed in real time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Patient Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Chief Complaint</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe your symptoms in detail (e.g. persistent headache and mild fever for 2 days)"
                required
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isActive}
              className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg shadow-emerald-900/30"
            >
              {isActive ? (
                <><span className="w-4 h-4 border-2 border-zinc-500 border-t-emerald-400 rounded-full animate-spin" />Consulting...</>
              ) : (
                <>🩺 Get Consultation</>
              )}
            </button>
          </div>
        </form>

        {/* Output */}
        {output && status !== "error" && (
          <div>
            {status === "streaming" && (
              <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Streaming live · {elapsed}s
              </div>
            )}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              <div className="prose"><ReactMarkdown>{output}</ReactMarkdown></div>
              {status === "streaming" && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 rounded-sm" />}
              {status === "done" && (
                <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">Completed in {elapsed}s</span>
                  <button
                    onClick={() => { setOutput(""); setStatus("idle"); }}
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    ↺ New consultation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-red-400 text-sm">{output}</div>
        )}

        <p className="text-center text-zinc-700 text-xs mt-8">
          This is AI-generated guidance only. Not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
