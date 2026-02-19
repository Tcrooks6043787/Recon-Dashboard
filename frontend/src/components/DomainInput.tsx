"use client";

import React, { useState } from "react";

interface DomainInputProps {
    onScan: (domain: string) => void;
    isLoading: boolean;
}

export default function DomainInput({ onScan, isLoading }: DomainInputProps) {
    const [domain, setDomain] = useState("");
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!domain.trim()) {
            setError("Please enter a domain");
            return;
        }

        if (!authorized) {
            setError("Please confirm you are authorized to scan this domain");
            return;
        }

        // Strip protocol and path
        let cleaned = domain.trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        onScan(cleaned);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-10">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                    style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-glow-teal)" }}
                >
                    <span className="text-2xl font-bold" style={{ color: "#0b0f1a" }}>OS</span>
                </div>
                <h1
                    className="text-3xl font-bold tracking-tight mb-3"
                    style={{ color: "var(--color-text-heading)" }}
                >
                    OpenScope Recon Dashboard
                </h1>
                <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    Passive reconnaissance tool. Enter a domain to aggregate publicly available
                    metadata through legal OSINT sources.
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => { setDomain(e.target.value); setError(""); }}
                        placeholder="example.com"
                        disabled={isLoading}
                        className="w-full px-5 py-4 rounded-xl text-sm font-mono transition-all duration-300 
                       outline-none placeholder:opacity-40 disabled:opacity-50"
                        style={{
                            background: "var(--color-bg-input)",
                            border: "1px solid var(--color-border-default)",
                            color: "var(--color-text-primary)",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--color-accent-teal)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--color-border-default)"}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !domain.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg text-sm font-semibold 
                       transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: "var(--gradient-accent)",
                            color: "#0b0f1a",
                        }}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Scanning...
                            </span>
                        ) : (
                            "Scan"
                        )}
                    </button>
                </div>

                {/* Authorization Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={authorized}
                        onChange={(e) => { setAuthorized(e.target.checked); setError(""); }}
                        className="mt-0.5 w-4 h-4 rounded accent-teal-500 cursor-pointer"
                    />
                    <span className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        I confirm that I am authorized to perform passive reconnaissance on this domain
                        and understand that this tool only collects publicly available information.
                    </span>
                </label>

                {/* Error */}
                {error && (
                    <p className="text-xs font-medium animate-fade-in" style={{ color: "var(--color-accent-red)" }}>
                        {error}
                    </p>
                )}
            </form>

            {/* Legal note */}
            <div
                className="mt-10 max-w-lg text-center px-6 py-4 rounded-xl"
                style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border-subtle)",
                }}
            >
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    <span className="font-semibold" style={{ color: "var(--color-accent-amber)" }}>⚠ Disclaimer:</span>{" "}
                    OpenScope performs only passive OSINT collection. It does not perform vulnerability scanning,
                    port scanning, fingerprinting, or any intrusive enumeration. All data is sourced from
                    public records (DNS, WHOIS, Certificate Transparency logs).
                </p>
            </div>
        </div>
    );
}
