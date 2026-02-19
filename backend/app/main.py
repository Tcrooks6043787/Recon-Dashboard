"""
OpenScope Recon Dashboard — FastAPI Application Entry Point.

Passive OSINT reconnaissance tool. Accepts a domain and aggregates
publicly available metadata through legal passive sources only.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.models import ScanRequest, ScanResponse
from app.scanner import run_scan


# ── Rate Limiter ──────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="OpenScope Recon Dashboard",
    description=(
        "Self-hosted passive reconnaissance API. Aggregates publicly available "
        "domain metadata through legal OSINT sources. No active scanning."
    ),
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "openscope"}


@app.post("/scan")
@limiter.limit("5/minute")
async def scan_domain(request: Request):
    """
    Run a passive reconnaissance scan on the given domain.

    Collects:
    - DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA)
    - WHOIS registration data
    - TLS certificate metadata (single handshake)
    - Certificate Transparency log entries (crt.sh)
    - ASN / IP allocation metadata
    - Passive subdomain enumeration (from CT SAN entries)

    Rate limited to 5 requests per minute per IP.
    """
    raw_body = await request.json()
    body = ScanRequest(**raw_body)
    result = await run_scan(body.domain)
    return result


# ── Error Handlers ────────────────────────────────────────────────────────────

@app.exception_handler(ValueError)
async def validation_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)},
    )
