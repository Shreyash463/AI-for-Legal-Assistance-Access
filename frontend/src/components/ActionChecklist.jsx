import React, { useState } from 'react';
import { CheckSquare, Copy, Download, Printer, Check, HelpCircle, AlertOctagon, ListTodo } from 'lucide-react';
import { generateMarkdownReport, copyToClipboard, downloadMarkdown, printReport } from '../utils/export';

export default function ActionChecklist({ analysis }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const { checklist, metadata } = analysis;

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async () => {
    const md = generateMarkdownReport(analysis);
    await copyToClipboard(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = generateMarkdownReport(analysis);
    const safeName = (metadata.filename || 'contract').replace(/\.[^/.]+$/, '');
    downloadMarkdown(md, `${safeName}_action_report.md`);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Action Checklist & Negotiation Preparation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key questions for your attorney, red flags to resolve, and next action items before signing.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy full analysis report as Markdown"
            className="btn-press px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200/90 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
            title="Copy Full Report as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download analysis report as markdown file"
            className="btn-press px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200/90 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
            title="Download Report as .md file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Download .MD</span>
          </button>
          <button
            type="button"
            onClick={printReport}
            aria-label="Print report or save as PDF"
            className="btn-press px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Questions for Lawyer */}
        <div className="interactive-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Questions for an Attorney</h4>
              <p className="text-[11px] text-slate-500">Take these to your consultation</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.questions_for_lawyer.map((q, idx) => {
              const itemId = `lawyer-${idx}`;
              const isChecked = !!checkedItems[itemId];
              return (
                <label
                  key={itemId}
                  htmlFor={itemId}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 select-none focus-within:ring-2 focus-within:ring-indigo-500 ${
                    isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-800 shadow-2xs'
                  }`}
                >
                  <input
                    id={itemId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(itemId)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="leading-relaxed">{q}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 2: Red Flags to Clarify */}
        <div className="interactive-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 text-red-700 pb-3 border-b border-slate-100">
            <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Red Flags to Clarify</h4>
              <p className="text-[11px] text-slate-500">Unfavorable or ambiguous terms</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.red_flags_to_clarify.map((rf, idx) => {
              const itemId = `redflag-${idx}`;
              const isChecked = !!checkedItems[itemId];
              return (
                <label
                  key={itemId}
                  htmlFor={itemId}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 select-none focus-within:ring-2 focus-within:ring-red-500 ${
                    isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/20 text-slate-800 shadow-2xs'
                  }`}
                >
                  <input
                    id={itemId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(itemId)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="leading-relaxed">{rf}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 3: Recommended Next Steps */}
        <div className="interactive-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 text-emerald-700 pb-3 border-b border-slate-100">
            <ListTodo className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recommended Next Steps</h4>
              <p className="text-[11px] text-slate-500">Action items before signing</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.recommended_next_steps.map((step, idx) => {
              const itemId = `step-${idx}`;
              const isChecked = !!checkedItems[itemId];
              return (
                <label
                  key={itemId}
                  htmlFor={itemId}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 select-none focus-within:ring-2 focus-within:ring-emerald-500 ${
                    isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-800 shadow-2xs'
                  }`}
                >
                  <input
                    id={itemId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(itemId)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="leading-relaxed">{step}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
