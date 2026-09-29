import React, { useState } from 'react';
import type { DocumentItem, UserRole } from '../../types';
import { EvidenceVerificationPanel } from '../../components/EvidenceVerificationPanel';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export interface EvidenceVerificationTabProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  currentRole: UserRole;
  isLiveBackend: boolean;
  onSelectDocument: (doc: DocumentItem) => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => Promise<any>;
}

export const EvidenceVerificationTab: React.FC<EvidenceVerificationTabProps> = ({
  documents,
  selectedDoc,
  currentRole,
  isLiveBackend,
  onSelectDocument,
  onSimulateTamper,
  onRestoreDoc
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(
    selectedDoc?.id || documents[0]?.id || ''
  );

  const currentDoc = documents.find(d => d.id === activeDocId) || selectedDoc || documents[0] || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 font-heading">
              Dedicated Evidence Verification Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            FIPS 180-4 SHA-256 cryptographic verification suite analyzing 5 vectors: message digest, ledger inclusion, Merkle proof, digital signature, and RBAC authorization.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>5-Vector Verification Active</span>
          </span>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Select Case Exhibit to Verify ({documents.length} Exhibits Ingested)
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {documents.map((doc, idx) => {
            const isSelected = doc.id === currentDoc?.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDocId(doc.id);
                  onSelectDocument(doc);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center space-x-2 transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-bold">Ex. P-{idx + 1}</span>
                <span className="truncate max-w-[120px] font-sans">{doc.title}</span>
                {doc.tamper_flag ? (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Verification Panel */}
      {currentDoc ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <EvidenceVerificationPanel
            document={currentDoc}
            currentRole={currentRole}
            isLiveBackend={isLiveBackend}
            onSimulateTamper={onSimulateTamper}
            onRestoreDoc={onRestoreDoc}
          />
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          No document selected for verification.
        </div>
      )}
    </div>
  );
};
