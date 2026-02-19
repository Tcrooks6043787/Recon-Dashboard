"use client";

import React, { useState, useMemo } from "react";
import { SubdomainEntry } from "@/lib/types";

interface SubdomainsSectionProps {
    data: SubdomainEntry[];
}

type SortField = "subdomain" | "source";
type SortDir = "asc" | "desc";

export default function SubdomainsSection({ data }: SubdomainsSectionProps) {
    const [sortField, setSortField] = useState<SortField>("subdomain");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [filter, setFilter] = useState("");

    const filtered = useMemo(() => {
        let results = [...data];
        if (filter) {
            const q = filter.toLowerCase();
            results = results.filter((s) => s.subdomain.toLowerCase().includes(q));
        }
        results.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            const cmp = aVal.localeCompare(bVal);
            return sortDir === "asc" ? cmp : -cmp;
        });
        return results;
    }, [data, sortField, sortDir, filter]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="ml-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
    );

    return (
        <section id="subdomains" className="space-y-4 animate-fade-in">
            <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-text-heading)" }}
            >
                <span style={{ color: "var(--color-accent-teal)" }}>◫</span> Subdomains
                <span
                    className="text-[10px] font-normal px-2 py-0.5 rounded-full ml-2"
                    style={{
                        background: "var(--color-bg-input)",
                        color: "var(--color-accent-teal)",
                    }}
                >
                    {data.length} found
                </span>
            </h2>

            <div className="card">
                {/* Filter */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Filter subdomains..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 rounded-lg text-xs font-mono outline-none 
                       transition-all duration-200 placeholder:opacity-40"
                        style={{
                            background: "var(--color-bg-input)",
                            border: "1px solid var(--color-border-default)",
                            color: "var(--color-text-primary)",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-teal)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0" style={{ background: "var(--color-bg-card)" }}>
                            <tr style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                                <th
                                    className="text-left py-2.5 px-3 font-medium cursor-pointer select-none"
                                    style={{ color: "var(--color-text-muted)" }}
                                    onClick={() => toggleSort("subdomain")}
                                >
                                    Subdomain <SortIcon field="subdomain" />
                                </th>
                                <th
                                    className="text-left py-2.5 px-3 font-medium cursor-pointer select-none w-28"
                                    style={{ color: "var(--color-text-muted)" }}
                                    onClick={() => toggleSort("source")}
                                >
                                    Source <SortIcon field="source" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((sub, i) => (
                                <tr
                                    key={i}
                                    className="group transition-colors duration-150"
                                    style={{
                                        borderBottom: "1px solid var(--color-border-subtle)",
                                        background: i % 2 === 0 ? "transparent" : "var(--color-bg-input)",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-card-hover)")}
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--color-bg-input)")
                                    }
                                >
                                    <td className="py-2 px-3 font-mono" style={{ color: "var(--color-accent-teal)" }}>
                                        {sub.subdomain}
                                    </td>
                                    <td className="py-2 px-3">
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{
                                                background: "var(--color-bg-input)",
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            {sub.source}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="text-center py-8 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {data.length === 0 ? "No subdomains discovered" : "No matches"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
