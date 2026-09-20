import React from 'react';
import { ShieldAlert, X, Scale, FileText, Check } from 'lucide-react';

export default function LegalDisclaimerModal({ isOpen, onClose }) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-disclaimer-title"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm" id="modal-disclaimer-title">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Important Legal Information & Usage Terms</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Legal Disclaimer dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              Not a Law Firm • Not Legal Advice
            </h4>
            <p>
              ClarifyLaw AI is an automated generative AI software tool built to enhance document literacy and facilitate comprehension.
              It does <strong>not</strong> provide legal advice, legal opinions, or case strategy, and using this application does <strong>not</strong> establish an attorney-client relationship.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
              Appropriate Use Cases:
            </h5>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li>Simplifying complex legal jargon and legalese into plain English.</li>
              <li>Spotting standard clause categories like auto-renewals, late fees, and liability caps.</li>
              <li>Preparing questions and structured checklists to review with your licensed attorney.</li>
              <li>Comparing two drafts or contract options side-by-side.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
              Privacy & Ephemeral Data Handling:
            </h5>
            <p className="text-slate-600">
              Uploaded contracts are held only in temporary, in-memory session storage to process your active queries.
              Documents are not sold, shared, or permanently retained. You can click "Clear Session" at any time to purge your document immediately.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
            <p className="font-semibold mb-0.5">Need Qualified Legal Counsel?</p>
            <p className="text-blue-700">
              If you are facing a potential lawsuit, contract breach, or complex transaction, consult your local State Bar Association referral directory or legal aid organization.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
