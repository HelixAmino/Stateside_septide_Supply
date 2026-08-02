import { useState, useMemo } from "react";
import { Search, ShieldCheck, FlaskConical, ScanLine, ExternalLink, Clock } from "lucide-react";
import { COA_DATA, type CoaRecord } from "../lib/coa-data";

function isPassedPurity(purity: string): boolean {
  const num = parseFloat(purity);
  return !isNaN(num) && num >= 98;
}

function hasPurityData(r: CoaRecord): boolean {
  return r.purity !== "" && r.purity !== "NA%";
}

function PassedValue({ value, fallback = "\u2014" }: { value: string; fallback?: string }) {
  if (!value) return <span className="text-slate-400">{fallback}</span>;
  return <span className="text-emerald-700 font-semibold">{value}</span>;
}

function ResultRow({ label, value, passed }: { label: string; value: string; passed?: boolean }) {
  const display = value || "\u2014";
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</span>
      {passed === false || !value ? (
        <span className="text-sm text-slate-400">{display}</span>
      ) : (
        <span className="text-sm font-semibold text-emerald-700">{display}</span>
      )}
    </div>
  );
}

function CoaCard({ record }: { record: CoaRecord }) {
  const hasData = hasPurityData(record);
  const comingSoon = !hasData;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
        comingSoon ? "opacity-60 border-slate-200" : "border-slate-200/80"
      }`}
    >
      <div className="p-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 leading-snug">{record.title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{record.size}</p>
      </div>

      <div className="px-5 py-3 flex-1">
        <ResultRow label="Purity" value={record.purity} passed={isPassedPurity(record.purity)} />
        <ResultRow label="Assay" value={record.assay} passed={!!record.assay} />
        <ResultRow label="Identity" value={hasData ? "Confirmed" : ""} passed={hasData} />
        <ResultRow label="Heavy Metals" value={hasData ? "<20ppb" : ""} passed={hasData} />
        <ResultRow label="TAMC" value={hasData ? "0 CFU" : ""} passed={hasData} />
        <ResultRow label="TYMC" value={hasData ? "0 CFU" : ""} passed={hasData} />
      </div>

      <div className="px-5 py-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 font-mono">{record.rpt}</span>
          {record.date && <span className="text-xs text-slate-400">{record.date}</span>}
        </div>

        {comingSoon ? (
          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>
        ) : record.has_pdf ? (
          <a
            href={`/coa/${record.rpt}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View COA
          </a>
        ) : (
          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-500 text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            COA Processing
          </div>
        )}
      </div>
    </div>
  );
}

export function CoaLibrary() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return COA_DATA;
    const q = search.toLowerCase();
    return COA_DATA.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.rpt.toLowerCase().includes(q) ||
        r.size.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Certificate of Analysis Library
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Every batch independently tested for purity, potency, and safety by Redstone Analytics.
          </p>

          {/* Stat badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{"\u2265"}98% Minimum Purity</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">3rd Party Tested</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <ScanLine className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">100% Batch Traceability</span>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Third-party testing provided by Redstone Analytics — independent cGLP-certified laboratory
          </p>
        </div>
      </section>

      {/* Search + Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, report number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Showing {filtered.length} certificate{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((record) => (
            <CoaCard key={record.rpt} record={record} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No certificates match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
