"""
Passive Subdomain Enumeration — aggregates subdomains from crt.sh CT log SAN entries.
No wordlist attacks, no DNS brute forcing, no permutation generation.
"""

from __future__ import annotations

from app.models import SubdomainEntry, HistoricalCertificate


def aggregate_subdomains(
    domain: str,
    ct_certs: list[HistoricalCertificate],
    tls_san: list[str] | None = None,
) -> list[SubdomainEntry]:
    """
    Aggregate unique subdomains from Certificate Transparency and TLS SAN entries.
    Only includes subdomains that end with the target domain.
    """
    seen: set[str] = set()
    subdomains: list[SubdomainEntry] = []

    # Collect from CT log entries
    for cert in ct_certs:
        for san in cert.san_entries:
            name = san.strip().lower()
            # Skip wildcards and non-matching domains
            if name.startswith("*."):
                name = name[2:]
            if not name.endswith(f".{domain}") and name != domain:
                continue
            if name == domain:
                continue  # Skip the root domain itself
            if name not in seen:
                seen.add(name)
                subdomains.append(SubdomainEntry(subdomain=name, source="crt.sh"))

    # Collect from live TLS handshake SAN entries
    if tls_san:
        for san in tls_san:
            name = san.strip().lower()
            if name.startswith("*."):
                name = name[2:]
            if not name.endswith(f".{domain}") and name != domain:
                continue
            if name == domain:
                continue
            if name not in seen:
                seen.add(name)
                subdomains.append(SubdomainEntry(subdomain=name, source="tls_handshake"))

    # Sort alphabetically
    subdomains.sort(key=lambda s: s.subdomain)
    return subdomains
