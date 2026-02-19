"use client";

import React from "react";

const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "certificates", label: "Certificates", icon: "🔒" },
    { id: "dns", label: "DNS Records", icon: "◈" },
    { id: "subdomains", label: "Subdomains", icon: "◫" },
    { id: "infrastructure", label: "Infrastructure", icon: "⬡" },
];

interface SidebarProps {
    activeSection: string;
    onNavigate: (section: string) => void;
    scanDomain?: string;
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({
    activeSection,
    onNavigate,
    scanDomain,
    isCollapsed,
    onToggle,
}: SidebarProps) {
    return (
        <aside
            className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? "w-[60px]" : "w-[240px]"
                }`}
            style={{
                background: "var(--color-bg-sidebar)",
                borderRight: "1px solid var(--color-border-default)",
            }}
        >
            {/* Logo Area */}
            <div
                className="flex items-center gap-3 px-4 py-5"
                style={{ borderBottom: "1px solid var(--color-border-default)" }}
            >
                <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: "var(--gradient-accent)", color: "#0b0f1a" }}
                >
                    OS
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in">
                        <h1
                            className="text-sm font-semibold tracking-tight"
                            style={{ color: "var(--color-text-heading)" }}
                        >
                            OpenScope
                        </h1>
                        <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                            Passive Recon
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isCollapsed ? "justify-center" : ""
                                }`}
                            style={{
                                background: isActive ? "var(--color-bg-card)" : "transparent",
                                color: isActive
                                    ? "var(--color-accent-teal)"
                                    : "var(--color-text-secondary)",
                                borderLeft: isActive
                                    ? "2px solid var(--color-accent-teal)"
                                    : "2px solid transparent",
                            }}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className="text-base flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="truncate font-medium">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Domain Badge */}
            {scanDomain && !isCollapsed && (
                <div className="px-4 py-3 animate-fade-in" style={{ borderTop: "1px solid var(--color-border-default)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>
                        Target
                    </p>
                    <p className="text-xs font-mono font-medium truncate" style={{ color: "var(--color-accent-teal)" }}>
                        {scanDomain}
                    </p>
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="px-4 py-3 text-xs transition-colors duration-200 hover:opacity-80"
                style={{
                    color: "var(--color-text-muted)",
                    borderTop: "1px solid var(--color-border-default)",
                }}
            >
                {isCollapsed ? "→" : "← Collapse"}
            </button>
        </aside>
    );
}
