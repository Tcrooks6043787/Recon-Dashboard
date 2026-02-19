"""
Scan Orchestrator — runs all passive data collection modules in parallel.
Handles timeouts and error isolation per module.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from app.models import (
    ScanResponse,
    OverviewInfo,
    CertificateInfo,
    DnsRecords,
    WhoisInfo,
    AsnInfo,
)
from app.modules.dns_lookup import lookup_dns
from app.modules.whois_lookup import lookup_whois
from app.modules.tls_inspect import inspect_tls
from app.modules.ct_lookup import lookup_ct
from app.modules.asn_lookup import lookup_asn
from app.modules.subdomains import aggregate_subdomains


MODULE_TIMEOUT = 12  # seconds per module


async def _run_with_timeout(coro, name: str, errors: dict):
    """Run a coroutine with a timeout; capture errors instead of raising."""
    try:
        return await asyncio.wait_for(coro, timeout=MODULE_TIMEOUT)
    except asyncio.TimeoutError:
        errors[name] = "Module timed out"
        return None
    except Exception as e:
        errors[name] = str(e)
        return None


async def run_scan(domain: str) -> ScanResponse:
    """Execute all passive reconnaissance modules and build a unified response."""
    errors: dict[str, str] = {}

    # Run all modules concurrently
    dns_task = _run_with_timeout(lookup_dns(domain), "dns", errors)
    whois_task = _run_with_timeout(lookup_whois(domain), "whois", errors)
    tls_task = _run_with_timeout(inspect_tls(domain), "tls", errors)
    ct_task = _run_with_timeout(lookup_ct(domain), "ct", errors)

    # Gather first batch (ASN needs IP from DNS, but we'll resolve independently)
    dns_result, whois_result, tls_result, ct_result = await asyncio.gather(
        dns_task, whois_task, tls_task, ct_task
    )

    # Defaults
    dns_data = dns_result or DnsRecords()
    whois_data = whois_result or WhoisInfo()
    tls_data = tls_result or CertificateInfo()
    ct_data = ct_result or []

    # Get the primary IP from DNS A records
    ip_address = dns_data.A[0] if dns_data.A else None

    # Run ASN lookup with the resolved IP
    asn_result = await _run_with_timeout(
        lookup_asn(domain, ip_address), "asn", errors
    )
    asn_data = asn_result or AsnInfo()

    # Aggregate subdomains from CT and TLS
    subdomains = aggregate_subdomains(domain, ct_data, tls_data.san_entries)

    # Build overview
    overview = OverviewInfo(
        domain=domain,
        ip_address=ip_address,
        asn=asn_data.asn,
        registrar=whois_data.registrar,
        created_date=whois_data.creation_date,
        expires_date=whois_data.expiration_date,
        cert_expiry=tls_data.not_after,
        hosting_provider=asn_data.hosting_provider,
        country=asn_data.country,
    )

    return ScanResponse(
        domain=domain,
        scan_timestamp=datetime.now(timezone.utc).isoformat(),
        overview=overview,
        certificates=tls_data,
        historical_certificates=ct_data,
        dns_records=dns_data,
        whois=whois_data,
        asn_info=asn_data,
        subdomains=subdomains,
        errors=errors,
    )
