import React, { useState } from 'react';
import type { DocumentItem, UserRole } from '../types';
import { EvidenceVerificationPanel } from './EvidenceVerificationPanel';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  ChevronDown
} from 'lucide-react';

interface EvidenceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  documents: DocumentItem[];
  currentRole: UserRole;
  isLiveBackend?: boolean;
  onSelectDocument?: (doc: DocumentItem) => void;
  onSimulateTamper?: (doc: DocumentItem) => void;
  onRestoreDoc?: (doc: DocumentItem) => void;
}

export const EvidenceVerificationModal: React.FC<EvidenceVerificationModalProps> = ({
  isOpen,
  onClose,
  document,
  documents,
  currentRole,
  isLiveBackend = false,
  onSelectDocument,
  onSimulateTamper,
  onRestoreDoc
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(document?.id || documents[0]?.id || '');

  if (!isOpen) return null;

  const activeDoc = documents.find(d => d.id === (document?.id || selectedDocId)) || document || documents[0];

  const handleDocChange = (newDocId: string) => {
    setSelectedDocId(newDocId);
    const found = documents.find(d => d.id === newDocId);
    if (found && onSelectDocument) {
      onSelectDocument(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090e1c] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                  Dedicated Evidence Verification Suite
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  BSA 2023 §63
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent Cryptographic, Distributed Ledger, Merkle & Access Control Audit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Exhibit Selector Switcher */}
            {documents && documents.length > 1 && (
              <div className="relative">
                <select
                  value={activeDoc?.id || ''}
                  onChange={(e) => handleDocChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  title="Switch target exhibit for verification audit"
                >
                  {documents.map((doc, idx) => (
                    <option key={doc.id} value={doc.id}>
                      Ex. P-{idx + 1}: {doc.id} ({doc.title.slice(0, 24)}...)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeDoc ? (
            <EvidenceVerificationPanel
              document={activeDoc}
              currentRole={currentRole}
              isLiveBackend={isLiveBackend}
              onSimulateTamper={onSimulateTamper}
              onRestoreDoc={onRestoreDoc}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No evidence document selected for verification audit.</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Active Case: {activeDoc?.case_id || 'CASE-2026-DEL-402'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
