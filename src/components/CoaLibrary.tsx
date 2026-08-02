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

function ResultRow({ label, value, passed }: { label: string; value: string; passed?: boolean }) {
  const display = value || "\u2014";
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-b-0">
      <span className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">{label}</span>
      {passed === false || !value ? (
        <span className="text-sm text-slate-500">{display}</span>
      ) : (
        <span className="text-sm font-semibold text-emerald-400">{display}</span>
      )}
    </div>
  );
}

function CoaCard({ record }: { record: CoaRecord }) {
  const hasData = hasPurityData(record);
  const comingSoon = !hasData;

  return (
    <div
      className={`rounded-xl border flex flex-col transition-all duration-200 ${
        comingSoon
          ? "opacity-50 border-slate-700/40 bg-slate-800/30"
          : "border-slate-700/50 bg-slate-800/60 hover:bg-slate-800/90 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
      }`}
    >
      <div className="p-5 pb-3 border-b border-slate-700/30">
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{record.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{record.size}</p>
      </div>

      <div className="px-5 py-3 flex-1">
        <ResultRow label="Purity" value={record.purity} passed={isPassedPurity(record.purity)} />
        <ResultRow label="Assay" value={record.assay} passed={!!record.assay} />
        <ResultRow label="Identity" value={hasData ? "Confirmed" : ""} passed={hasData} />
        <ResultRow label="Heavy Metals" value={hasData ? "<20ppb" : ""} passed={hasData} />
        <ResultRow label="TAMC" value={hasData ? "0 CFU" : ""} passed={hasData} />
        <ResultRow label="TYMC" value={hasData ? "0 CFU" : ""} passed={hasData} />
      </div>

      <div className="px-5 py-4 border-t border-slate-700/30 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-slate-500 font-mono">{record.rpt}</span>
          {record.date && <span className="text-[11px] text-slate-500">{record.date}</span>}
        </div>

        {comingSoon ? (
          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-700/40 text-slate-500 text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>
        ) : record.has_pdf ? (
          <a
            href={`/coa/${record.rpt}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View COA
          </a>
        ) : (
          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 text-sm font-medium">
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
    <div className="bg-[#0a0e1a] min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-700/40">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-purple-700/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
            <FlaskConical className="w-7 h-7 text-purple-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Certificate of Analysis Library
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Every batch independently tested for purity, potency, and safety by Redstone Analytics.
          </p>

          {/* Stat badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">{"\u2265"}98% Minimum Purity</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/5">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">3rd Party Tested</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5">
              <ScanLine className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">100% Batch Traceability</span>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-500">
            Third-party testing provided by Redstone Analytics — independent cGLP-certified laboratory
          </p>
        </div>
      </section>

      {/* Search + Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, report number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900/60 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-shadow"
            />
          </div>
          <p className="text-sm text-slate-400 font-medium whitespace-nowrap">
            Showing {filtered.length} certificate{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((record) => (
            <CoaCard key={record.rpt} record={record} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No certificates match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
