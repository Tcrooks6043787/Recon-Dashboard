"use client";

import React, { useState } from "react";
import { CertificateInfo, HistoricalCertificate } from "@/lib/types";

interface CertificateSectionProps {
    current: CertificateInfo;
    historical: HistoricalCertificate[];
}

function DetailRow({ label, value }: { label: string; value: string | null | number | undefined }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                {label}
            </span>
            <span className="text-xs font-mono text-right max-w-[60%] break-all" style={{ color: "var(--color-text-primary)" }}>
                {String(value)}
            </span>
        </div>
    );
}

export default function CertificateSection({ current, historical }: CertificateSectionProps) {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <section id="certificates" className="space-y-4 animate-fade-in">
            <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-text-heading)" }}
            >
                <span style={{ color: "var(--color-accent-teal)" }}>🔒</span> Certificates
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Certificate */}
                <div className="card">
                    <h3
                        className="text-sm font-semibold mb-3"
                        style={{ color: "var(--color-accent-blue)" }}
                    >
                        Current Certificate
                    </h3>
                    <div className="space-y-0">
                        <DetailRow label="Subject" value={current.subject} />
                        <DetailRow label="Issuer" value={current.issuer} />
                        <DetailRow label="Serial Number" value={current.serial_number} />
                        <DetailRow label="Valid From" value={current.not_before ? new Date(current.not_before).toLocaleString() : null} />
                        <DetailRow label="Valid Until" value={current.not_after ? new Date(current.not_after).toLocaleString() : null} />
                        <DetailRow label="TLS Version" value={current.tls_version} />
                        <DetailRow label="Cipher Suite" value={current.cipher_suite} />
                        <DetailRow label="Key Algorithm" value={current.public_key_algorithm} />
                        <DetailRow label="Key Length" value={current.key_length ? `${current.key_length} bits` : null} />
                    </div>
                </div>

                {/* SAN Entries */}
                <div className="card">
                    <h3
                        className="text-sm font-semibold mb-3 flex items-center justify-between"
                        style={{ color: "var(--color-accent-blue)" }}
                    >
                        <span>Subject Alternative Names</span>
                        <span
                            className="text-[10px] font-normal px-2 py-0.5 rounded-full"
                            style={{
                                background: "var(--color-bg-input)",
                                color: "var(--color-accent-teal)",
                            }}
                        >
                            {current.san_entries.length} entries
                        </span>
                    </h3>
                    <div
                        className="max-h-[300px] overflow-y-auto rounded-lg p-3"
                        style={{ background: "var(--color-bg-input)" }}
                    >
                        {current.san_entries.length > 0 ? (
                            <div className="space-y-1.5">
                                {current.san_entries.map((san, i) => (
                                    <p key={i} className="text-xs font-mono py-1 px-2 rounded hover:opacity-80 transition-colors"
                                        style={{
                                            color: "var(--color-text-primary)",
                                            background: i % 2 === 0 ? "transparent" : "var(--color-bg-card)",
                                        }}
                                    >
                                        {san}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No SAN entries found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificate Chain */}
            {current.certificate_chain.length > 0 && (
                <div className="card">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-accent-blue)" }}>
                        Certificate Chain
                    </h3>
                    <div className="space-y-2">
                        {current.certificate_chain.map((entry, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 text-xs font-mono px-3 py-2 rounded-lg"
                                style={{ background: "var(--color-bg-input)" }}
                            >
                                <span
                                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{ background: "var(--gradient-accent)", color: "#0b0f1a" }}
                                >
                                    {i}
                                </span>
                                <span className="truncate" style={{ color: "var(--color-text-primary)" }}>
                                    {entry}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historical Certificates */}
            {historical.length > 0 && (
                <div className="card">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between text-sm font-semibold"
                        style={{ color: "var(--color-accent-blue)" }}
                    >
                        <span>Historical Certificates ({historical.length})</span>
                        <span
                            className="text-xs transition-transform duration-200"
                            style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                            ▼
                        </span>
                    </button>

                    {showHistory && (
                        <div className="mt-4 overflow-x-auto animate-fade-in">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                                        <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>Common Name</th>
                                        <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>Issuer</th>
                                        <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>Valid From</th>
                                        <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>Valid Until</th>
                                        <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>Serial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historical.map((cert, i) => (
                                        <tr
                                            key={i}
                                            className="transition-colors duration-150"
                                            style={{
                                                borderBottom: "1px solid var(--color-border-subtle)",
                                                background: i % 2 === 0 ? "transparent" : "var(--color-bg-input)",
                                            }}
                                        >
                                            <td className="py-2 px-3 font-mono" style={{ color: "var(--color-text-primary)" }}>
                                                {cert.common_name || "—"}
                                            </td>
                                            <td className="py-2 px-3 truncate max-w-[200px]" style={{ color: "var(--color-text-secondary)" }}>
                                                {cert.issuer || "—"}
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                                                {cert.not_before || "—"}
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                                                {cert.not_after || "—"}
                                            </td>
                                            <td className="py-2 px-3 font-mono truncate max-w-[150px]" style={{ color: "var(--color-text-muted)" }}>
                                                {cert.serial_number || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
