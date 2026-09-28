import React, { useState } from 'react';
import type { ContradictionItem, TimelineEvent } from '../types';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Clock, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AILegalAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contradictions: ContradictionItem[];
  timeline: TimelineEvent[];
  onSelectDocById: (docId: string) => void;
  onQueryAI: (query: string) => Promise<any>;
}

export const AILegalAssistant: React.FC<AILegalAssistantProps> = ({
  isOpen,
  onClose,
  contradictions,
  timeline,
  onSelectDocById,
  onQueryAI
}) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'CONTRADICTIONS' | 'TIMELINE'>('SEARCH');
  const [query, setQuery] = useState('Find forensic ballistics matching weapon recovered at canal');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);

  if (!isOpen) return null;

  const sampleQueries = [
    'Find forensic ballistics matching weapon recovered at canal',
    'What did witness Ramesh Kumar testify about suspects?',
    'Show DNA random match probability for Vikram Malhotra',
    'Did the Magistrate admit electronic records under Sec 63 BSA?'
  ];

  const handleExecuteQuery = async (customQuery?: string) => {
    const q = customQuery || query;
    setIsLoading(true);
    try {
      const res = await onQueryAI(q);
      setSearchResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090d1a] border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading flex items-center space-x-2">
                <span>NyayaVault AI & Legal Intelligence</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                  RAG PIPELINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Section 161 Contradiction Engine & Semantic Case Retrieval
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center space-x-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'SEARCH'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Semantic Evidentiary Search</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTRADICTIONS')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'CONTRADICTIONS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Witness Contradictions (Sec 180 BNSS)</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 rounded text-[10px]">
              {contradictions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Evidentiary Timeline Reconstruction</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: Semantic Search */}
          {activeTab === 'SEARCH' && (
            <div className="space-y-4 text-xs">
              
              {/* Input Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
                    placeholder="Ask legal inquiry in natural language..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleExecuteQuery()}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Retrieving...' : 'Search'}</span>
                </button>
              </div>

              {/* Sample Queries */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Suggested:</span>
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(sq);
                      handleExecuteQuery(sq);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-200 text-[11px] transition-colors"
                  >
                    "{sq.substring(0, 38)}..."
                  </button>
                ))}
              </div>

              {/* AI Synthesis Box */}
              {searchResponse && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Evidentiary Synthesis:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-xs font-sans">
                    {searchResponse.ai_synthesis}
                  </p>
                </div>
              )}

              {/* Retrieved Documents List */}
              {searchResponse && searchResponse.retrieved_documents && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Cited Evidentiary Records ({searchResponse.retrieved_documents.length} matches):
                  </div>
                  {searchResponse.retrieved_documents.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => onSelectDocById(res.document_id)}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded text-[11px]">
                            {res.exhibit_number}
                          </span>
                          <span className="font-bold text-slate-100 group-hover:text-indigo-200">
                            {res.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-400 font-mono text-xs">
                          <span>Confidence:</span>
                          <span className="font-bold">{Math.round(res.confidence_score * 100)}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-850">
                        "{res.snippet}"
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>SHA-256: {res.sha256_hash.substring(0, 24)}...</span>
                        <span className="text-cyan-400 flex items-center space-x-1 group-hover:underline">
                          <span>Inspect Exhibit</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Witness Contradictions */}
          {activeTab === 'CONTRADICTIONS' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
                <span className="font-bold">Automated Contradiction Discovery:</span> Cross-checks oral statements recorded under Section 180 BNSS (erstwhile Sec 161 CrPC) against physical evidence, CFSL microscopic ballistics, DNA STR markers, and electronic CCTV telemetrics under Section 63 BSA 2023.
              </div>

              <div className="space-y-3">
                {contradictions.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm">{c.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                        {c.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      {/* Witness assertion */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-slate-400 font-semibold flex items-center justify-between">
                          <span>Witness Testimony ({c.witness_name})</span>
                          <button
                            onClick={() => onSelectDocById(c.witness_statement_doc_id)}
                            className="text-cyan-400 hover:underline flex items-center space-x-1"
                          >
                            <span>Doc Ref</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-slate-300 font-mono italic">
                          "{c.witness_assertion}"
                        </div>
                      </div>

                      {/* Conflicting objective evidence */}
                      <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                        <div className="text-indigo-300 font-semibold flex items-center justify-between">
                          <span>Objective Forensic Proof ({c.conflicting_evidence_title})</span>
                          <button
                            onClick={() => onSelectDocById(c.conflicting_evidence_doc_id)}
                            className="text-cyan-400 hover:underline flex items-center space-x-1"
                          >
                            <span>Doc Ref</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-slate-300 font-mono">
                          {c.conflicting_finding}
                        </div>
                      </div>
                    </div>

                    {/* Legal Implication */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2">
                      <div className="text-slate-400">
                        <strong className="text-slate-300">Legal Implication:</strong> {c.legal_implication}
                      </div>
                      <div className="font-mono text-cyan-400 shrink-0">
                        {c.statutory_section}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Evidentiary Timeline */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4 text-xs">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timeline.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-cyan-400 text-xs">
                            {evt.timestamp}
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                            Stage {evt.stage_index}: {evt.stage_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {evt.cryptographic_status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-100 text-xs">
                        {evt.event_title}
                      </h4>

                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-1">
                        <span>Officer: <span className="text-slate-400">{evt.officer}</span></span>
                        <span>Location: <span className="text-slate-400">{evt.location}</span></span>
                        <span className="text-cyan-400 font-semibold">{evt.doc_ref}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] font-mono">
            Powered by NyayaVault Legal Semantic Index & Section 63 Verification
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
