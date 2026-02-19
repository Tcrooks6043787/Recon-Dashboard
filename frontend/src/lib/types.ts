/* ── OpenScope Response Types ─────────────────────────────────────────── */

export interface OverviewInfo {
    domain: string;
    ip_address: string | null;
    asn: string | null;
    registrar: string | null;
    created_date: string | null;
    expires_date: string | null;
    cert_expiry: string | null;
    hosting_provider: string | null;
    country: string | null;
}

export interface CertificateInfo {
    issuer: string | null;
    subject: string | null;
    serial_number: string | null;
    not_before: string | null;
    not_after: string | null;
    san_entries: string[];
    tls_version: string | null;
    cipher_suite: string | null;
    public_key_algorithm: string | null;
    key_length: number | null;
    certificate_chain: string[];
}

export interface HistoricalCertificate {
    issuer: string | null;
    common_name: string | null;
    serial_number: string | null;
    not_before: string | null;
    not_after: string | null;
    san_entries: string[];
}

export interface DnsRecords {
    A: string[];
    AAAA: string[];
    MX: string[];
    TXT: string[];
    NS: string[];
    CNAME: string[];
    SOA: string[];
}

export interface WhoisInfo {
    registrar: string | null;
    creation_date: string | null;
    expiration_date: string | null;
    updated_date: string | null;
    name_servers: string[];
    status: string[];
    organization: string | null;
    emails: string[];
}

export interface AsnInfo {
    asn: string | null;
    asn_name: string | null;
    hosting_provider: string | null;
    netblock: string | null;
    country: string | null;
    allocation_owner: string | null;
}

export interface SubdomainEntry {
    subdomain: string;
    source: string;
}

export interface ScanResponse {
    domain: string;
    scan_timestamp: string;
    overview: OverviewInfo;
    certificates: CertificateInfo;
    historical_certificates: HistoricalCertificate[];
    dns_records: DnsRecords;
    whois: WhoisInfo;
    asn_info: AsnInfo;
    subdomains: SubdomainEntry[];
    errors: Record<string, string>;
}
