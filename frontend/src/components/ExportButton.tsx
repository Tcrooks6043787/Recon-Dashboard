"use client";

import React from "react";
import { ScanResponse } from "@/lib/types";

interface ExportButtonProps {
    data: ScanResponse;
}

export default function ExportButton({ data }: ExportButtonProps) {
    const handleExport = () => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `openscope_${data.domain}_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium 
                 transition-all duration-200 hover:opacity-90"
            style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-secondary)",
            }}
        >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export JSON
        </button>
    );
}
