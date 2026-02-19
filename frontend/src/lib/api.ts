import { ScanResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runScan(domain: string): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Scan failed" }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}
