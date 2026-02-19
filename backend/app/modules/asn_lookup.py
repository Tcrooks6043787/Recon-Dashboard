"""
ASN & IP Metadata Lookup — resolves domain → IP, then queries RDAP for ASN info.
Uses public RDAP endpoints (rdap.org).
"""

from __future__ import annotations

import asyncio
import socket

import httpx

from app.models import AsnInfo


RDAP_URL = "https://rdap.org/ip"


def _resolve_ip(domain: str) -> str | None:
    """Resolve domain to an IPv4 address synchronously."""
    try:
        result = socket.getaddrinfo(domain, None, socket.AF_INET)
        if result:
            return result[0][4][0]
    except (socket.gaierror, OSError):
        pass
    return None


async def lookup_asn(domain: str, ip_address: str | None = None) -> AsnInfo:
    """Look up ASN/IP metadata via RDAP."""

    # Resolve IP if not provided
    if not ip_address:
        loop = asyncio.get_event_loop()
        ip_address = await loop.run_in_executor(None, _resolve_ip, domain)

    if not ip_address:
        return AsnInfo()

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            resp = await client.get(f"{RDAP_URL}/{ip_address}")
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return AsnInfo()

    # Extract ASN from "arin_originas0_originautnums" or similar RDAP fields
    asn = None
    asn_name = None
    hosting_provider = None
    netblock = None
    country = None
    owner = None

    # Parse RDAP response
    name = data.get("name", "")
    handle = data.get("handle", "")
    country = data.get("country", "")

    # Get the CIDR block
    cidr_list = data.get("cidr0_cidrs", [])
    if cidr_list:
        cidr = cidr_list[0]
        v4prefix = cidr.get("v4prefix", "")
        length = cidr.get("length", "")
        if v4prefix:
            netblock = f"{v4prefix}/{length}"

    # Extract organization from entities
    entities = data.get("entities", [])
    for entity in entities:
        roles = entity.get("roles", [])
        vcard = entity.get("vcardArray", [])

        if "registrant" in roles or "abuse" in roles or len(roles) > 0:
            # Try to extract org name from vCardArray
            if len(vcard) >= 2:
                for field in vcard[1]:
                    if isinstance(field, list) and len(field) >= 4:
                        if field[0] == "fn":
                            if not hosting_provider:
                                hosting_provider = field[3]
                            owner = field[3]
                        elif field[0] == "org":
                            hosting_provider = field[3]

        # Look for ASN in AutNum references
        entity_handle = entity.get("handle", "")
        if entity_handle and not asn:
            # Some RDAP responses include ASN entities
            pass

    # Try to get ASN from remarks or links
    remarks = data.get("remarks", [])
    for remark in remarks:
        title = remark.get("title", "")
        if "origin" in title.lower() or "asn" in title.lower():
            descriptions = remark.get("description", [])
            for desc in descriptions:
                if desc.strip().startswith("AS"):
                    asn = desc.strip()

    # Fallback: Try ipinfo.io for cleaner ASN data
    if not asn:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"https://ipinfo.io/{ip_address}/json")
                if resp.status_code == 200:
                    ipinfo = resp.json()
                    org = ipinfo.get("org", "")
                    if org:
                        parts = org.split(" ", 1)
                        asn = parts[0] if parts else None
                        asn_name = parts[1] if len(parts) > 1 else None
                        if not hosting_provider:
                            hosting_provider = asn_name
                    if not country:
                        country = ipinfo.get("country", "")
        except Exception:
            pass

    return AsnInfo(
        asn=asn,
        asn_name=asn_name,
        hosting_provider=hosting_provider or owner or name,
        netblock=netblock or handle,
        country=country,
        allocation_owner=owner or hosting_provider,
    )
