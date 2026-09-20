import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, Filter, ArrowUpRight, Scale, CheckCircle2 } from 'lucide-react';

export default function RiskRadar({ risks, onJumpToSection }) {
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM', 'LOW'

  const filteredRisks = risks.filter((r) => {
    if (severityFilter === 'ALL') return true;
    return r.severity === severityFilter;
  });

  const highCount = risks.filter((r) => r.severity === 'HIGH').length;
  const medCount = risks.filter((r) => r.severity === 'MEDIUM').length;
  const lowCount = risks.filter((r) => r.severity === 'LOW').length;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            MEDIUM RISK
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            LOW / NOTEWORTHY
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Risk Score Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Risk & Clause Radar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated audit of hidden traps, one-sided obligations, auto-renewals, and liability waivers.
          </p>
        </div>

        {/* Filter Chips with Accessible Count and Icons */}
        <div role="radiogroup" aria-label="Filter risks by severity" className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            role="radio"
            aria-checked={severityFilter === 'ALL'}
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              severityFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({risks.length})
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={severityFilter === 'HIGH'}
            onClick={() => setSeverityFilter('HIGH')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              severityFilter === 'HIGH'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <ShieldAlert className="w-3 h-3" aria-hidden="true" />
            High ({highCount})
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={severityFilter === 'MEDIUM'}
            onClick={() => setSeverityFilter('MEDIUM')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              severityFilter === 'MEDIUM'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            Med ({medCount})
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={severityFilter === 'LOW'}
            onClick={() => setSeverityFilter('LOW')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              severityFilter === 'LOW'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Info className="w-3 h-3" aria-hidden="true" />
            Low ({lowCount})
          </button>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">No clauses match the selected severity filter.</p>
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${
                risk.severity === 'HIGH'
                  ? 'border-red-200 ring-1 ring-red-100 hover:border-red-300'
                  : risk.severity === 'MEDIUM'
                  ? 'border-amber-200 ring-1 ring-amber-100 hover:border-amber-300'
                  : 'border-blue-200 ring-1 ring-blue-100 hover:border-blue-300'
              }`}
            >
              {/* Card Header */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(risk.severity)}
                  <h4 className="text-sm font-bold text-slate-900">{risk.clause_name}</h4>
                </div>
                <button
                  onClick={() => onJumpToSection && onJumpToSection(risk.section_id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <span>Linked: {risk.section_id}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3.5">
                {/* Why it Matters (1-line plain-English explanation) */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Why This Matters (Plain English)
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                    {risk.why_it_matters}
                  </p>
                </div>

                {/* Potential Impact & Recommended Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">⚠️ Potential Exposure:</span>
                    <p className="text-slate-600 leading-relaxed">{risk.potential_impact}</p>
                  </div>
                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs">
                    <span className="font-bold text-blue-900 block mb-1">💡 Suggested Counter-Action:</span>
                    <p className="text-blue-800 leading-relaxed">{risk.suggested_action}</p>
                  </div>
                </div>

                {/* Verbatim Contract Quote */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Verbatim Contract Clause
                  </span>
                  <blockquote className="text-xs font-mono bg-slate-100 text-slate-700 p-3 rounded-xl border border-slate-200/80 italic leading-relaxed">
                    "{risk.original_quote}"
                  </blockquote>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
