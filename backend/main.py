import os
import json
import httpx
import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from prompts import build_idea_messages

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Business Idea Generator API",
    description="AI-powered SaaS idea generation using Cerebras ultra-fast inference.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)

CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"

# Rate limit store: { ip: { "free": [...timestamps], "pro": [...timestamps] } }
rate_limit_store: dict[str, dict[str, list[float]]] = {}
LIMITS = {"free": (3, 86400), "pro": (20, 86400)}  # (max_requests, window_seconds)


def check_rate_limit(ip: str, tier: str):
    max_req, window = LIMITS[tier]
    now = time.time()
    store = rate_limit_store.setdefault(ip, {"free": [], "pro": []})
    hits = [t for t in store[tier] if now - t < window]
    if len(hits) >= max_req:
        limit_msg = "3 requests/day on the free tier. Sign in for more." if tier == "free" else "Daily limit reached."
        raise HTTPException(status_code=429, detail=limit_msg)
    hits.append(now)
    store[tier] = hits


def is_authenticated(request: Request) -> bool:
    auth = request.headers.get("Authorization", "")
    return auth.startswith("Bearer ") and len(auth) > 10


def stream_cerebras(api_key: str, model: str, pro: bool):
    with httpx.stream(
        "POST",
        CEREBRAS_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "messages": build_idea_messages(pro=pro), "stream": True},
        timeout=60.0,
    ) as response:
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Cerebras API error.")
        for line in response.iter_lines():
            if line.startswith("data: ") and line != "data: [DONE]":
                chunk = json.loads(line[6:])
                delta = chunk["choices"][0]["delta"].get("content", "")
                if delta:
                    yield delta


@app.get("/api/ideas", summary="Generate AI SaaS Ideas", tags=["Ideas"])
def generate_ideas(request: Request):
    api_key = os.getenv("CEREBRAS_API_KEY")
    model = os.getenv("CEREBRAS_MODEL", "llama3.1-8b")
    client_ip = request.client.host

    if not api_key:
        raise HTTPException(status_code=500, detail="CEREBRAS_API_KEY is not configured.")

    pro = is_authenticated(request)
    tier = "pro" if pro else "free"
    check_rate_limit(client_ip, tier)

    logger.info(f"[{tier.upper()}] Request from {client_ip}")
    start = time.time()

    def generate():
        for chunk in stream_cerebras(api_key, model, pro=pro):
            yield chunk
        logger.info(f"[{tier.upper()}] Streamed to {client_ip} in {time.time() - start:.2f}s")

    return StreamingResponse(generate(), media_type="text/plain")


@app.get("/health", summary="Health Check", tags=["System"])
def health():
    return {"status": "ok", "model": os.getenv("CEREBRAS_MODEL", "llama3.1-8b")}
