"""
DNS Record Lookup — queries public resolvers for A, AAAA, MX, TXT, NS, CNAME, SOA.
Uses Google (8.8.8.8) and Cloudflare (1.1.1.1) public resolvers.
No zone transfers. No brute-force.
"""

from __future__ import annotations

import asyncio
import dns.resolver
import dns.asyncresolver

from app.models import DnsRecords


RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"]


async def _query_type(domain: str, rtype: str) -> list[str]:
    """Query a single record type, return list of string representations."""
    resolver = dns.asyncresolver.Resolver()
    resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
    resolver.lifetime = 5.0

    try:
        answer = await resolver.resolve(domain, rtype)
        results = []
        for rdata in answer:
            text = rdata.to_text()
            # Strip surrounding quotes from TXT records
            if rtype == "TXT" and text.startswith('"') and text.endswith('"'):
                text = text[1:-1]
            results.append(text)
        return results
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN,
            dns.resolver.NoNameservers, dns.resolver.Timeout,
            dns.name.EmptyLabel, Exception):
        return []


async def lookup_dns(domain: str) -> DnsRecords:
    """Run all DNS record type queries in parallel and return structured results."""
    tasks = {rtype: _query_type(domain, rtype) for rtype in RECORD_TYPES}
    results = {}
    gathered = await asyncio.gather(*tasks.values(), return_exceptions=True)

    for rtype, result in zip(tasks.keys(), gathered):
        if isinstance(result, Exception):
            results[rtype] = []
        else:
            results[rtype] = result

    return DnsRecords(**results)
