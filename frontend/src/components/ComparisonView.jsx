import React, { useState, useEffect } from 'react';
import { Columns, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

export default function ComparisonView({ apiKey }) {
  const [docAName, setDocAName] = useState('Document A (e.g. Current Lease / ToS v1)');
  const [docAText, setDocAText] = useState('');
  const [docBName, setDocBName] = useState('Document B (e.g. Proposed Lease / ToS v2)');
  const [docBText, setDocBText] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load preloaded comparison pair on demand
  const handleLoadSamplePair = async () => {
    try {
      const res = await fetch('/api/compare/samples');
      if (!res.ok) throw new Error('Failed to load sample pair');
      const data = await res.json();
      setDocAName(data.doc_a.name);
      setDocAText(data.doc_a.text);
      setDocBName(data.doc_b.name);
      setDocBText(data.doc_b.text);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRunComparison = async () => {
    if (!docAText.trim() || !docBText.trim()) {
      setErrorMsg('Please ensure both Document A and Document B contain text to compare.');
      return;
    }
    setErrorMsg('');
    setIsComparing(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-API-Key'] = apiKey;

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          doc_a_name: docAName,
          doc_a_text: docAText,
          doc_b_name: docBName,
          doc_b_text: docBText
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Comparison failed');
      }

      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error comparing documents');
    } finally {
      setIsComparing(false);
    }
  };

  const getAssessmentBadge = (assessment) => {
    if (assessment.includes('Higher Risk in Doc B') || assessment.includes('Doc A more favorable')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Doc B Higher Risk
        </span>
      );
    }
    if (assessment.includes('Higher Risk in Doc A') || assessment.includes('Doc B more favorable')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Doc B Safer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        Neutral / Similar
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Columns className="w-5 h-5 text-blue-600" />
            Side-by-Side Contract Comparison Mode
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare two contracts or versions to spot fee hikes, sneaky renewal traps, liability shifts, and omitted rights.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleLoadSamplePair}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Pair (SaaS v1 vs v2)</span>
          </button>
          <button
            type="button"
            disabled={isComparing || !docAText.trim() || !docBText.trim()}
            onClick={handleRunComparison}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            {isComparing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Contracts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Input Editors (Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Document A */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <input
              type="text"
              value={docAName}
              onChange={(e) => setDocAName(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-2/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 font-mono">
              {docAText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={8}
            value={docAText}
            onChange={(e) => setDocAText(e.target.value)}
            placeholder="Paste first contract text here..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Document B */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <input
              type="text"
              value={docBName}
              onChange={(e) => setDocBName(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-2/3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 font-mono">
              {docBText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={8}
            value={docBText}
            onChange={(e) => setDocBText(e.target.value)}
            placeholder="Paste second contract or revised version text here..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Comparison Output */}
      {comparisonResult && (
        <div className="space-y-6 pt-2">
          {/* Executive Verdict Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md border border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              <span>Overall Comparison Verdict</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold leading-snug mb-3">
              {comparisonResult.overall_verdict}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-white/10 p-3 rounded-xl">
              {comparisonResult.executive_comparison}
            </p>
          </div>

          {/* Key Differences Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Term-by-Term Comparison Matrix</h4>
              <span className="text-xs text-slate-500">
                {comparisonResult.key_differences.length} Specific Terms Analyzed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Topic / Category</th>
                    <th className="px-4 py-3">{comparisonResult.doc_a_title}</th>
                    <th className="px-4 py-3">{comparisonResult.doc_b_title}</th>
                    <th className="px-4 py-3">Assessment & Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonResult.key_differences.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-900 align-top">
                        <div>{item.topic}</div>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-normal">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-mono text-[11px] align-top bg-slate-50/30">
                        {item.doc_a_value}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-mono text-[11px] align-top bg-blue-50/20">
                        {item.doc_b_value}
                      </td>
                      <td className="px-4 py-3.5 align-top space-y-1.5">
                        {getAssessmentBadge(item.assessment)}
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {item.key_difference}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Added & Removed Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Added in B */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Clauses Added / Stricter in Document B
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {comparisonResult.added_clauses_in_b.map((clause, i) => (
                  <li key={i} className="flex items-start gap-2 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                    <span className="text-red-600 font-bold mt-0.5">+</span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Removed in B */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Protections Omitted / Removed from Document B
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {comparisonResult.removed_clauses_in_b.map((clause, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 font-bold mt-0.5">-</span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
