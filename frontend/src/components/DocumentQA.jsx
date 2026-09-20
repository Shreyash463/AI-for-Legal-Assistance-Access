import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, ShieldAlert, Quote, CheckCircle, AlertCircle } from 'lucide-react';

export default function DocumentQA({ documentText, documentId, apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I am ClarifyLaw AI. Ask me any question about the clauses, obligations, or deadlines in this document. My answers are strictly grounded only in the contract text with explicit citations.',
      cited_sections: [],
      direct_quotes: [],
      grounded: true,
      confidence: 'High'
    }
  ]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const samplePrompts = [
    'Can I cancel or terminate this agreement early?',
    'What happens if I miss a payment or pay late?',
    'Is there an automatic renewal clause?',
    'What repairs or maintenance am I responsible for?',
    'Should I sue them for breach of contract?' // tests legal advice guardrail
  ];

  const handleAsk = async (queryToAsk) => {
    const q = (queryToAsk || questionInput).trim();
    if (!q || isAsking) return;

    // Append user message
    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestionInput('');
    setIsAsking(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-API-Key'] = apiKey;

      const res = await fetch('/api/documents/qa', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          document_id: documentId,
          document_text: documentText,
          question: q
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Q&A request failed');
      }

      const data = await res.json();
      const botMsg = {
        role: 'assistant',
        content: data.answer,
        cited_sections: data.cited_sections || [],
        direct_quotes: data.direct_quotes || [],
        grounded: data.grounded_in_document,
        confidence: data.confidence,
        is_advice: data.is_advice_redirection
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to process question: ${err.message}`,
          grounded: false,
          confidence: 'Error'
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
      {/* QA Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Grounded Document Q&A
          </h3>
          <p className="text-[11px] text-slate-500">
            Answers are restricted strictly to the uploaded contract. No external legal speculation.
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> Grounding Guard Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
          Try asking:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(prompt)}
            disabled={isAsking}
            className="btn-press flex-shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 px-3 py-1 rounded-lg text-xs font-medium transition shadow-2xs disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                    : msg.is_advice
                    ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-sm shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}
              >
                {/* Bot header tags */}
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 text-[11px]">
                    {msg.is_advice ? (
                      <span className="flex items-center gap-1 font-bold text-amber-700">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        Legal Advice Redirection Guardrail
                      </span>
                    ) : msg.grounded ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Document-Grounded Answer
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        Information Not Found in Contract
                      </span>
                    )}

                    {msg.confidence && (
                      <span className="ml-auto text-[10px] text-slate-400 font-mono">
                        Confidence: {msg.confidence}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Citations & Quotes */}
                {!isUser && msg.cited_sections && msg.cited_sections.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Citations & Clause References:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {msg.cited_sections.map((c, i) => (
                        <span key={i} className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!isUser && msg.direct_quotes && msg.direct_quotes.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {msg.direct_quotes.map((q, i) => (
                      <div key={i} className="flex items-start gap-1 text-xs font-mono bg-slate-100 p-2 rounded-lg text-slate-600 italic">
                        <Quote className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>"{q}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isAsking && (
          <div className="flex flex-col items-start w-full max-w-xl animate-fade-slide">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 border border-slate-200 shadow-xs w-full space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[11px] text-slate-500">
                <span className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
                <span className="font-semibold">Verifying against contract clauses...</span>
              </div>
              <div className="h-3.5 w-4/5 skeleton-shimmer rounded" />
              <div className="h-3.5 w-full skeleton-shimmer rounded" />
              <div className="h-3.5 w-2/3 skeleton-shimmer rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask a question about this contract (e.g. 'Can I terminate early?')..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isAsking || !questionInput.trim()}
            className="btn-press px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
