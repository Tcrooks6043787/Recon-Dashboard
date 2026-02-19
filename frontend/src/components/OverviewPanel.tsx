"use client";

import React from "react";
import { OverviewInfo } from "@/lib/types";

interface OverviewPanelProps {
    data: OverviewInfo;
}

function InfoCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | null;
    accent?: string;
}) {
    return (
        <div
            className="card flex flex-col gap-1.5"
            style={{ minHeight: "80px" }}
        >
            <p
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: "var(--color-text-muted)" }}
            >
                {label}
            </p>
            <p
                className="text-sm font-semibold font-mono truncate"
                style={{ color: accent || "var(--color-text-primary)" }}
            >
                {value || "—"}
            </p>
        </div>
    );
}

function ExpiryBadge({ dateStr }: { dateStr: string | null }) {
    if (!dateStr) return <InfoCard label="Cert Expiry" value="—" />;

    const expiry = new Date(dateStr);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let color = "var(--color-accent-green)";
    let status = `${diffDays} days`;

    if (diffDays <= 0) {
        color = "var(--color-accent-red)";
        status = "Expired";
    } else if (diffDays <= 30) {
        color = "var(--color-accent-amber)";
        status = `${diffDays} days`;
    }

    return (
        <div className="card flex flex-col gap-1.5" style={{ minHeight: "80px" }}>
            <p
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: "var(--color-text-muted)" }}
            >
                Cert Expiry
            </p>
            <div className="flex items-center gap-2">
                <span
                    className="inline-block w-2 h-2 rounded-full animate-pulse-glow"
                    style={{ backgroundColor: color }}
                />
                <p className="text-sm font-semibold font-mono" style={{ color }}>
                    {status}
                </p>
            </div>
            <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                {expiry.toLocaleDateString()}
            </p>
        </div>
    );
}

export default function OverviewPanel({ data }: OverviewPanelProps) {
    return (
        <section id="overview" className="animate-fade-in">
            <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: "var(--color-text-heading)" }}
            >
                <span style={{ color: "var(--color-accent-teal)" }}>◉</span> Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <InfoCard label="Domain" value={data.domain} accent="var(--color-accent-teal)" />
                <InfoCard label="IP Address" value={data.ip_address} accent="var(--color-accent-blue)" />
                <InfoCard label="ASN" value={data.asn} />
                <InfoCard label="Registrar" value={data.registrar} />
                <InfoCard label="Created" value={data.created_date ? new Date(data.created_date).toLocaleDateString() : null} />
                <InfoCard label="Hosting Provider" value={data.hosting_provider} />
                <InfoCard label="Country" value={data.country} />
                <ExpiryBadge dateStr={data.cert_expiry} />
            </div>
        </section>
    );
}
