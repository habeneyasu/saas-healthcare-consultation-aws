SYSTEM_PROMPT = """You are a senior product strategist and startup advisor.
Write sharp, founder-ready AI SaaS ideas in clean Markdown.
Be specific and practical. No fluff, no corporate speak."""

USER_PROMPT_FREE = """Generate 1 AI-powered B2B SaaS idea for a solo founder.
Stack: Next.js + FastAPI + Cerebras (llama3.1-8b). Target: problems where someone pays $500–$5,000/mo for a worse solution.

Structure:

---

# 🚀 [Product Name] — [One-line pitch]

> [One sentence: who it's for and what pain it kills]

## Who It's For
- **ICP**: [Specific company type, size, role]
- **Pain**: [The exact problem with a real cost or time impact]
- **Why Now**: [Market shift or tech unlock making this timely]

## How It Works
[2–3 sentences on what the AI agent does and how it delivers value]

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | [Hard limit] |
| Pro | $X/mo | [Core value] |
| Team | $X/mo | [Scale feature] |

## MVP Scope (4 weeks)
- **Pages**: [3 key Next.js pages]
- **Endpoints**: [3 FastAPI routes with purpose]
- **Streaming**: `[route]` — [what streams and why it matters]

## Moat & Risks
- **Moat**: [One defensible advantage at 12 months]
- **Risk 1**: [Specific risk]
- **Risk 2**: [Specific risk]

---

Keep it under 200 words."""

USER_PROMPT_PRO = """Generate 3 distinct AI-powered B2B SaaS ideas for a solo founder.
Stack: Next.js + FastAPI + Cerebras (llama3.1-8b). Target: problems where someone pays $500–$5,000/mo for a worse solution.

Each idea must follow this structure:

---

# 🚀 [Product Name] — [One-line pitch]

> [One sentence: who it's for and what pain it kills]

## Who It's For
- **ICP**: [Specific company type, size, role]
- **Pain**: [The exact problem with a real cost or time impact]
- **Why Now**: [Market shift or tech unlock making this timely]

## How It Works
[2–3 sentences on what the AI agent does and how it delivers value]

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | [Hard limit] |
| Pro | $X/mo | [Core value] |
| Team | $X/mo | [Scale feature] |

## MVP Scope (4 weeks)
- **Pages**: [3 key Next.js pages]
- **Endpoints**: [3 FastAPI routes with purpose]
- **Streaming**: `[route]` — [what streams and why it matters]

## Moat & Risks
- **Moat**: [One defensible advantage at 12 months]
- **Risk 1**: [Specific risk]
- **Risk 2**: [Specific risk]

---

Keep each idea under 200 words. Make the third idea contrarian and unexpected."""


def build_idea_messages(pro: bool = False) -> list[dict]:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_PROMPT_PRO if pro else USER_PROMPT_FREE},
    ]


CONSULTATION_SYSTEM_PROMPT = """You are a professional clinical AI assistant providing structured preliminary health assessments.
You are NOT a licensed physician. Never diagnose. Always recommend professional care for serious symptoms.
Be precise, empathetic, and clinically structured. Use clear language — no jargon.
Format your response strictly in clean Markdown with clear section headers."""

def build_consultation_messages(name: str, date: str, complaint: str) -> list[dict]:
    return [
        {"role": "system", "content": CONSULTATION_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""New patient consultation:

**Patient**: {name}
**Date**: {date}
**Chief Complaint**: {complaint}

Respond using ONLY this exact Markdown structure — no deviations:

---

# 🩺 Consultation Report

**Patient:** {name}
**Date:** {date}
**Complaint:** {complaint}

---

## 📋 Clinical Assessment
[2–3 sentences analyzing the reported symptoms objectively and clinically]

## 🔍 Possible Causes
[List 3–4 ranked causes from most to least likely, each with a one-line explanation]

## ✅ Recommended Actions
[3–5 specific, actionable steps the patient can take immediately at home]

## 🚨 When to Seek Medical Care
[List specific red-flag symptoms that require urgent or emergency attention]

## ⚡ Urgency Level
**[Low / Moderate / High / Emergency]** — [One sentence justifying the urgency level]

---

> ⚠️ *This report is AI-generated preliminary guidance only and does not constitute medical advice or diagnosis. Always consult a licensed healthcare professional for proper evaluation and treatment.*""",
        },
    ]

