"use client";

import React from "react";
import { AsnInfo, WhoisInfo } from "@/lib/types";

interface InfrastructureSectionProps {
    asn: AsnInfo;
    whois: WhoisInfo;
}

function InfraCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | null;
    accent?: string;
}) {
    return (
        <div className="flex flex-col gap-1 py-2.5" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--color-text-muted)" }}>
                {label}
            </p>
            <p
                className="text-sm font-mono break-all"
                style={{ color: accent || "var(--color-text-primary)" }}
            >
                {value || "—"}
            </p>
        </div>
    );
}

export default function InfrastructureSection({ asn, whois }: InfrastructureSectionProps) {
    return (
        <section id="infrastructure" className="space-y-4 animate-fade-in">
            <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-text-heading)" }}
            >
                <span style={{ color: "var(--color-accent-teal)" }}>⬡</span> Infrastructure
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Network Info */}
                <div className="card">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-accent-blue)" }}>
                        Network & Hosting
                    </h3>
                    <InfraCard label="ASN" value={asn.asn} accent="var(--color-accent-teal)" />
                    <InfraCard label="ASN Name" value={asn.asn_name} />
                    <InfraCard label="Hosting Provider" value={asn.hosting_provider} accent="var(--color-accent-blue)" />
                    <InfraCard label="Netblock" value={asn.netblock} />
                    <InfraCard label="Country" value={asn.country} />
                    <InfraCard label="Allocation Owner" value={asn.allocation_owner} />
                </div>

                {/* WHOIS Info */}
                <div className="card">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-accent-blue)" }}>
                        WHOIS Registration
                    </h3>
                    <InfraCard label="Registrar" value={whois.registrar} />
                    <InfraCard label="Organization" value={whois.organization} />
                    <InfraCard
                        label="Created"
                        value={whois.creation_date ? new Date(whois.creation_date).toLocaleDateString() : null}
                    />
                    <InfraCard
                        label="Expires"
                        value={whois.expiration_date ? new Date(whois.expiration_date).toLocaleDateString() : null}
                        accent={whois.expiration_date ? "var(--color-accent-amber)" : undefined}
                    />
                    <InfraCard
                        label="Updated"
                        value={whois.updated_date ? new Date(whois.updated_date).toLocaleDateString() : null}
                    />

                    {/* Name Servers */}
                    {whois.name_servers.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>
                                Name Servers
                            </p>
                            <div className="space-y-1">
                                {whois.name_servers.map((ns, i) => (
                                    <p key={i} className="text-xs font-mono px-2 py-1 rounded" style={{
                                        background: "var(--color-bg-input)",
                                        color: "var(--color-text-primary)",
                                    }}>
                                        {ns.toLowerCase()}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Flags */}
                    {whois.status.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>
                                Status Flags
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {whois.status.map((s, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{
                                        background: "var(--color-bg-input)",
                                        color: "var(--color-text-secondary)",
                                    }}>
                                        {s.split(" ")[0]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
