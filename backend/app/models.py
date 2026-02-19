"""
OpenScope — Pydantic models for scan request/response.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator
import re


# ── Request ───────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    domain: str = Field(..., examples=["example.com"], description="Domain to scan")

    @field_validator("domain")
    @classmethod
    def normalize_domain(cls, v: str) -> str:
        # Strip protocol
        v = re.sub(r"^https?://", "", v.strip())
        # Strip path / trailing slash
        v = v.split("/")[0]
        # Strip port
        v = v.split(":")[0]
        # Basic domain validation
        if not re.match(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$", v):
            raise ValueError(f"Invalid domain format: {v}")
        return v.lower()


# ── Sub-models ────────────────────────────────────────────────────────────────

class OverviewInfo(BaseModel):
    domain: str = ""
    ip_address: Optional[str] = None
    asn: Optional[str] = None
    registrar: Optional[str] = None
    created_date: Optional[str] = None
    expires_date: Optional[str] = None
    cert_expiry: Optional[str] = None
    hosting_provider: Optional[str] = None
    country: Optional[str] = None


class CertificateInfo(BaseModel):
    issuer: Optional[str] = None
    subject: Optional[str] = None
    serial_number: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    san_entries: list[str] = Field(default_factory=list)
    tls_version: Optional[str] = None
    cipher_suite: Optional[str] = None
    public_key_algorithm: Optional[str] = None
    key_length: Optional[int] = None
    certificate_chain: list[str] = Field(default_factory=list)


class HistoricalCertificate(BaseModel):
    issuer: Optional[str] = None
    common_name: Optional[str] = None
    serial_number: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    san_entries: list[str] = Field(default_factory=list)


class DnsRecords(BaseModel):
    A: list[str] = Field(default_factory=list)
    AAAA: list[str] = Field(default_factory=list)
    MX: list[str] = Field(default_factory=list)
    TXT: list[str] = Field(default_factory=list)
    NS: list[str] = Field(default_factory=list)
    CNAME: list[str] = Field(default_factory=list)
    SOA: list[str] = Field(default_factory=list)


class WhoisInfo(BaseModel):
    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    updated_date: Optional[str] = None
    name_servers: list[str] = Field(default_factory=list)
    status: list[str] = Field(default_factory=list)
    organization: Optional[str] = None
    emails: list[str] = Field(default_factory=list)


class AsnInfo(BaseModel):
    asn: Optional[str] = None
    asn_name: Optional[str] = None
    hosting_provider: Optional[str] = None
    netblock: Optional[str] = None
    country: Optional[str] = None
    allocation_owner: Optional[str] = None


class SubdomainEntry(BaseModel):
    subdomain: str
    source: str = "crt.sh"


# ── Response ──────────────────────────────────────────────────────────────────

class ScanResponse(BaseModel):
    domain: str
    scan_timestamp: str
    overview: OverviewInfo = Field(default_factory=OverviewInfo)
    certificates: CertificateInfo = Field(default_factory=CertificateInfo)
    historical_certificates: list[HistoricalCertificate] = Field(default_factory=list)
    dns_records: DnsRecords = Field(default_factory=DnsRecords)
    whois: WhoisInfo = Field(default_factory=WhoisInfo)
    asn_info: AsnInfo = Field(default_factory=AsnInfo)
    subdomains: list[SubdomainEntry] = Field(default_factory=list)
    errors: dict[str, str] = Field(default_factory=dict)
