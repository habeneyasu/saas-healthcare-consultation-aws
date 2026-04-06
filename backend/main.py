from fastapi import FastAPI  # type: ignore
from fastapi.responses import PlainTextResponse  # type: ignore
from cerebras.cloud.sdk import Cerebras
import load_dotenv  

app = FastAPI()

@app.get("/api", response_class=PlainTextResponse)
def idea():
    client = Cerebras(api_key=load_dotenv(".env").get("CEREBRAS_API_KEY"))

    messages = [
        {
            "role": "developer",
            "content": (
                "You are an expert SaaS product strategist and product marketer. "
                "Your job is to generate exceptional, viable business ideas for an AI-powered SaaS called "
                "Business Idea Generator. Output must be polished Markdown designed for a modern React (Next.js) "
                "front-end with live streaming and Markdown rendering. Keep content skimmable and high-signal.\n\n"
                "Constraints and format:\n"
                "- Use clear Markdown with headings, subheadings, and short paragraphs\n"
                "- Include a tight one-liner, ICP, problem, solution, why-now\n"
                "- Add business model, pricing starter tiers, and GTM plan\n"
                "- Include MVP scope mapped to Next.js (TypeScript) + FastAPI endpoints\n"
                "- Show a streaming-friendly outline (chunked sections that reveal well)\n"
                "- Add a tiny Moat and Risks section\n"
                "- When helpful, include a compact Markdown table (no HTML) for pricing or features\n"
                "- Keep each idea ≤ 220 words; generate multiple differentiated ideas\n"
                "- Tone: practical, founder-ready, no fluff\n"
            ),
        },
        {
            "role": "user",
            "content": (
                "Generate 3 standout AI Agent SaaS ideas tailored for a solo founder building "
                "with Next.js (Pages Router, TypeScript) + FastAPI, deployed to Vercel, with "
                "real-time streaming and Markdown rendering. Focus on B2B problems with real budgets. "
                "Each idea must include:\n"
                "1) One-liner • ICP • Problem • Why Now\n"
                "2) Solution summary using AI Agents (how they orchestrate value)\n"
                "3) Business model + starter pricing table (Free, Pro, Team)\n"
                "4) MVP scope: Next.js pages, key components, FastAPI endpoints, and one streaming endpoint\n"
                "5) Moat and top 2 risks\n"
                "Keep it crisp and stream-friendly (sectioned so it reveals nicely)."
            ),
        },
    ]

    response = client.chat.completions.create(model="llama-3.3-70b", messages=messages)
    return response.choices[0].message.content