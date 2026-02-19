"use client";

import React, { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DomainInput from "@/components/DomainInput";
import OverviewPanel from "@/components/OverviewPanel";
import CertificateSection from "@/components/CertificateSection";
import DnsSection from "@/components/DnsSection";
import SubdomainsSection from "@/components/SubdomainsSection";
import InfrastructureSection from "@/components/InfrastructureSection";
import ExportButton from "@/components/ExportButton";
import { ScanResponse } from "@/lib/types";
import { runScan } from "@/lib/api";

export default function Home() {
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sectionRefs = {
    overview: useRef<HTMLDivElement>(null),
    certificates: useRef<HTMLDivElement>(null),
    dns: useRef<HTMLDivElement>(null),
    subdomains: useRef<HTMLDivElement>(null),
    infrastructure: useRef<HTMLDivElement>(null),
  };

  const handleScan = async (domain: string) => {
    setIsLoading(true);
    setError(null);
    setScanData(null);

    try {
      const result = await runScan(domain);
      setScanData(result);
      setActiveSection("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Show input screen when no data
  if (!scanData && !isLoading && !error) {
    return <DomainInput onScan={handleScan} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        scanDomain={scanData?.domain}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? "60px" : "240px",
          padding: "24px 32px",
        }}
      >
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>
              {scanData ? (
                <>
                  Scan Results:{" "}
                  <span style={{ color: "var(--color-accent-teal)" }}>{scanData.domain}</span>
                </>
              ) : (
                "Scanning..."
              )}
            </h1>
            {scanData && (
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Completed {new Date(scanData.scan_timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {scanData && <ExportButton data={scanData} />}
            <button
              onClick={() => {
                setScanData(null);
                setError(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: "var(--gradient-accent)",
                color: "#0b0f1a",
              }}
            >
              New Scan
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div
            className="mb-6 px-5 py-4 rounded-xl animate-fade-in"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--color-accent-red)" }}>
              {error}
            </p>
            <button
              onClick={() => {
                setScanData(null);
                setError(null);
              }}
              className="text-xs underline mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card shimmer-loading" style={{ height: "160px" }} />
            ))}
          </div>
        )}

        {/* Module Errors */}
        {scanData && Object.keys(scanData.errors).length > 0 && (
          <div
            className="mb-6 px-5 py-4 rounded-xl animate-fade-in"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-accent-amber)" }}>
              Some modules encountered errors:
            </p>
            {Object.entries(scanData.errors).map(([mod, msg]) => (
              <p key={mod} className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <span className="font-mono" style={{ color: "var(--color-accent-amber)" }}>
                  {mod}
                </span>
                : {msg}
              </p>
            ))}
          </div>
        )}

        {/* Dashboard Sections */}
        {scanData && (
          <div className="space-y-10">
            <div ref={sectionRefs.overview}>
              <OverviewPanel data={scanData.overview} />
            </div>
            <div ref={sectionRefs.certificates}>
              <CertificateSection
                current={scanData.certificates}
                historical={scanData.historical_certificates}
              />
            </div>
            <div ref={sectionRefs.dns}>
              <DnsSection data={scanData.dns_records} />
            </div>
            <div ref={sectionRefs.subdomains}>
              <SubdomainsSection data={scanData.subdomains} />
            </div>
            <div ref={sectionRefs.infrastructure}>
              <InfrastructureSection
                asn={scanData.asn_info}
                whois={scanData.whois}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
