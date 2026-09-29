import React from 'react';
import type { ContradictionItem, TimelineEvent } from '../../types';
import { Sparkles } from 'lucide-react';

export interface LegalAITabProps {
  contradictions: ContradictionItem[];
  timeline: TimelineEvent[];
  onOpenAIModal: () => void;
}

export const LegalAITab: React.FC<LegalAITabProps> = ({
  contradictions,
  timeline,
  onOpenAIModal
}) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 font-heading">
              AI Legal Copilot & Contradiction Discovery
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Automated cross-examination assistant detecting material discrepancies between witness statements under Section 180 BNSS and scientific FSL reports.
          </p>
        </div>

        <button
          onClick={onOpenAIModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 shrink-0 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Interactive AI Query Drawer</span>
        </button>
      </div>

      {/* Contradiction Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 font-heading flex items-center gap-2">
          <span>Flagged Evidentiary Contradictions</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-950 text-amber-400 border border-amber-500/30">
            {contradictions.length} Active Discrepancies
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contradictions.map((contra) => (
            <div key={contra.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{contra.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  contra.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}>
                  {contra.severity} DISCREPANCY
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{contra.title}</h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Witness Claim:</span>
                  <p className="text-slate-300 italic">"{contra.witness_assertion}"</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400">Forensic Scientific Finding:</span>
                  <p className="text-slate-300">{contra.conflicting_finding}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400/90 font-mono">
                Statutory Implication: {contra.legal_implication}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Investigation Timeline */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 font-heading">
          Reconstructed Incident Chronology
        </h3>
        <div className="space-y-3">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-cyan-400 font-semibold">{event.timestamp}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-bold text-slate-200">{event.event_title}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
