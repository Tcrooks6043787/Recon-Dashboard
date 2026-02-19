"use client";

import React, { useState } from "react";
import { DnsRecords } from "@/lib/types";

interface DnsSectionProps {
    data: DnsRecords;
}

const RECORD_ORDER: (keyof DnsRecords)[] = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];

const RECORD_COLORS: Record<string, string> = {
    A: "var(--color-accent-teal)",
    AAAA: "var(--color-accent-blue)",
    CNAME: "var(--color-accent-amber)",
    MX: "#a78bfa",
    NS: "#f472b6",
    TXT: "var(--color-text-secondary)",
    SOA: "var(--color-text-muted)",
};

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Fallback
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="copy-btn text-[10px] px-2 py-0.5 rounded transition-all duration-200"
            style={{
                background: copied ? "var(--color-accent-green)" : "var(--color-bg-input)",
                color: copied ? "#0b0f1a" : "var(--color-text-muted)",
            }}
        >
            {copied ? "✓" : "Copy"}
        </button>
    );
}

export default function DnsSection({ data }: DnsSectionProps) {
    const totalRecords = RECORD_ORDER.reduce((sum, type) => sum + data[type].length, 0);

    return (
        <section id="dns" className="space-y-4 animate-fade-in">
            <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-text-heading)" }}
            >
                <span style={{ color: "var(--color-accent-teal)" }}>◈</span> DNS Records
                <span
                    className="text-[10px] font-normal px-2 py-0.5 rounded-full ml-2"
                    style={{
                        background: "var(--color-bg-input)",
                        color: "var(--color-accent-teal)",
                    }}
                >
                    {totalRecords} records
                </span>
            </h2>

            <div className="card overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                            <th className="text-left py-2.5 px-3 font-medium w-20" style={{ color: "var(--color-text-muted)" }}>
                                Type
                            </th>
                            <th className="text-left py-2.5 px-3 font-medium" style={{ color: "var(--color-text-muted)" }}>
                                Value
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium w-16" style={{ color: "var(--color-text-muted)" }}>

                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {RECORD_ORDER.map((type) =>
                            data[type].map((record, i) => (
                                <tr
                                    key={`${type}-${i}`}
                                    className="group transition-colors duration-150"
                                    style={{
                                        borderBottom: "1px solid var(--color-border-subtle)",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-card-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <td className="py-2.5 px-3">
                                        <span
                                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                                            style={{
                                                color: RECORD_COLORS[type] || "var(--color-text-primary)",
                                                background: "var(--color-bg-input)",
                                            }}
                                        >
                                            {type}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono break-all" style={{ color: "var(--color-text-primary)" }}>
                                        {record}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                        <CopyButton text={record} />
                                    </td>
                                </tr>
                            ))
                        )}
                        {totalRecords === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    No DNS records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
