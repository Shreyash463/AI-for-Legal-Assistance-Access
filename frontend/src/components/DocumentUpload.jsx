import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, ArrowRight, BookOpen, Check } from 'lucide-react';

export default function DocumentUpload({
  onAnalyzeSuccess,
  isLoading,
  setIsLoading,
  readingLevel,
  setReadingLevel,
  apiKey
}) {
  const [activeInputTab, setActiveInputTab] = useState('samples'); // 'samples', 'upload', 'paste'
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sampleDocuments, setSampleDocuments] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('residential_lease_agreement');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

  // Fetch sample documents on mount
  useEffect(() => {
    fetch('/api/documents/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.samples) {
          setSampleDocuments(data.samples);
        }
      })
      .catch((err) => {
        console.warn('Could not load samples from backend:', err);
      });
  }, []);

  const simulateLoadingSteps = () => {
    const steps = [
      'Extracting and sanitizing document clauses...',
      'Segmenting sections and establishing traceability links...',
      'Detecting risk clauses (auto-renewals, waivers, penalties)...',
      'Generating plain-English summaries and action checklists...'
    ];
    let i = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setLoadingStep(steps[i]);
      } else {
        clearInterval(interval);
      }
    }, 900);
    return interval;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('File exceeds maximum size of 10MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleAnalyzeSample = async (sample) => {
    setErrorMsg('');
    setIsLoading(true);
    const interval = simulateLoadingSteps();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-API-Key'] = apiKey;

      const res = await fetch('/api/documents/analyze-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: sample.text,
          filename: sample.filename,
          reading_level: readingLevel
        })
      });

      clearInterval(interval);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis failed');
      }

      const data = await res.json();
      onAnalyzeSuccess(data);
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Error analyzing document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePasted = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 20) {
      setErrorMsg('Please paste at least 20 characters of legal contract text.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const interval = simulateLoadingSteps();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-API-Key'] = apiKey;

      const res = await fetch('/api/documents/analyze-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: pastedText,
          filename: 'Pasted_Contract.txt',
          reading_level: readingLevel
        })
      });

      clearInterval(interval);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis failed');
      }

      const data = await res.json();
      onAnalyzeSuccess(data);
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Error analyzing text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF or text file first.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const interval = simulateLoadingSteps();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('reading_level', readingLevel);

      const headers = {};
      if (apiKey) headers['X-Gemini-API-Key'] = apiKey;

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      clearInterval(interval);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      onAnalyzeSuccess(data);
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Select or Upload Legal Document
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate contracts, lease agreements, or terms of service in plain English.
          </p>
        </div>

        {/* Reading Level Selector */}
        <div role="radiogroup" aria-label="Target Reading Level" className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase px-1">Reading Level:</span>
          <button
            type="button"
            role="radio"
            aria-checked={readingLevel === 'standard'}
            onClick={() => setReadingLevel('standard')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              readingLevel === 'standard'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={readingLevel === 'executive'}
            onClick={() => setReadingLevel('executive')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              readingLevel === 'executive'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive TL;DR
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={readingLevel === 'simple'}
            onClick={() => setReadingLevel('simple')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              readingLevel === 'simple'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simple (Grade 6)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Document Input Mode" className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-3 gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeInputTab === 'samples'}
          id="tab-input-samples"
          onClick={() => setActiveInputTab('samples')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
            activeInputTab === 'samples'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
          Preloaded Sample Contracts (Instant Test)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeInputTab === 'upload'}
          id="tab-input-upload"
          onClick={() => setActiveInputTab('upload')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
            activeInputTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          Upload PDF / File
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeInputTab === 'paste'}
          id="tab-input-paste"
          onClick={() => setActiveInputTab('paste')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
            activeInputTab === 'paste'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          Paste Text
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SAMPLES TAB */}
        {activeInputTab === 'samples' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Judges can test immediately without searching for documents! Select a synthetic legal document:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleDocuments.map((sample) => (
                <button
                  type="button"
                  key={sample.id}
                  onClick={() => setSelectedSampleId(sample.id)}
                  aria-pressed={selectedSampleId === sample.id}
                  className={`w-full p-4 rounded-xl border transition text-left relative flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    selectedSampleId === sample.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        {sample.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {sample.word_count} words
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{sample.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 w-full">
                    <span>Select for analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  const selected = sampleDocuments.find((s) => s.id === selectedSampleId) || sampleDocuments[0];
                  if (selected) handleAnalyzeSample(selected);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Plain-English Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeInputTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.txt,.md,.text"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              {selectedFile ? (
                <div className="text-slate-800 font-semibold text-sm flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">
                    Drag and drop your legal contract here, or click to browse
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, TXT, MD documents up to 10MB.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isLoading || !selectedFile}
                onClick={handleAnalyzeUpload}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? 'Processing Document...' : 'Upload & Simplify'}
              </button>
            </div>
          </div>
        )}

        {/* PASTE TAB */}
        {activeInputTab === 'paste' && (
          <div className="space-y-4">
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste contract text, terms of service, or lease clauses here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {pastedText.length} characters ({pastedText.split(/\s+/).filter(Boolean).length} words)
              </span>
              <button
                type="button"
                disabled={isLoading || pastedText.trim().length < 20}
                onClick={handleAnalyzePasted}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? 'Analyzing Text...' : 'Analyze Pasted Contract'}
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-950">AI Contract Engine Active</p>
              <p className="text-blue-700 text-[11px] mt-0.5">{loadingStep}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
