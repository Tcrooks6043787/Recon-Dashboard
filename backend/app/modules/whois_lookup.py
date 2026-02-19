"""
WHOIS Lookup — public WHOIS query to extract registrar, dates, name servers.
Respects redacted/private fields by returning None.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Optional

import whois

from app.models import WhoisInfo


def _stringify_date(val) -> Optional[str]:
    """Convert date or list of dates to ISO string."""
    if val is None:
        return None
    if isinstance(val, list):
        val = val[0] if val else None
    if isinstance(val, datetime):
        return val.isoformat()
    return str(val)


def _ensure_list(val) -> list[str]:
    """Ensure value is a list of strings."""
    if val is None:
        return []
    if isinstance(val, str):
        return [val]
    if isinstance(val, list):
        return [str(v) for v in val if v]
    return [str(val)]


def _sync_whois(domain: str) -> WhoisInfo:
    """Synchronous WHOIS lookup — runs in a thread executor."""
    try:
        w = whois.whois(domain)
    except Exception:
        return WhoisInfo()

    return WhoisInfo(
        registrar=w.get("registrar"),
        creation_date=_stringify_date(w.get("creation_date")),
        expiration_date=_stringify_date(w.get("expiration_date")),
        updated_date=_stringify_date(w.get("updated_date")),
        name_servers=_ensure_list(w.get("name_servers")),
        status=_ensure_list(w.get("status")),
        organization=w.get("org") or w.get("organization"),
        emails=_ensure_list(w.get("emails")),
    )


async def lookup_whois(domain: str) -> WhoisInfo:
    """Async wrapper — runs the blocking WHOIS query in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_whois, domain)
