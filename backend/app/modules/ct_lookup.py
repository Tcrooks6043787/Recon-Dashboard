"""
Certificate Transparency Lookup — queries crt.sh for historical certificates.
Passive only, no direct CT log polling.
"""

from __future__ import annotations

import httpx
from typing import Optional

from app.models import HistoricalCertificate


CRT_SH_URL = "https://crt.sh"


async def lookup_ct(domain: str) -> list[HistoricalCertificate]:
    """Query crt.sh JSON API for certificate transparency entries."""
    params = {"q": f"%.{domain}", "output": "json"}

    async with httpx.AsyncClient(timeout=12.0) as client:
        resp = await client.get(CRT_SH_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    if not isinstance(data, list):
        return []

    # Deduplicate by serial number
    seen_serials: set[str] = set()
    certs: list[HistoricalCertificate] = []

    for entry in data:
        serial = entry.get("serial_number", "")
        if serial in seen_serials:
            continue
        seen_serials.add(serial)

        # Parse SAN entries from the name_value field
        name_value = entry.get("name_value", "")
        san_entries = [
            s.strip()
            for s in name_value.replace("\\n", "\n").split("\n")
            if s.strip() and not s.strip().startswith("*")
        ]

        certs.append(HistoricalCertificate(
            issuer=entry.get("issuer_name"),
            common_name=entry.get("common_name"),
            serial_number=serial,
            not_before=entry.get("not_before"),
            not_after=entry.get("not_after"),
            san_entries=san_entries,
        ))

    # Sort by not_before descending (newest first), limit to 50 most recent
    certs.sort(key=lambda c: c.not_before or "", reverse=True)
    return certs[:50]
