import React from 'react';
import type { 
  DocumentItem, 
  UserRole, 
  LifecycleStageId, 
  AuditBlock 
} from '../../types';
import { USER_ROLES } from '../../constants';
import { DocumentList } from '../../components/DocumentList';
import { 
  Plus, 
  History, 
  ChevronRight, 
  AlertTriangle, 
  GitCommit, 
  Clock, 
  FileText, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

export interface DocumentsTabProps {
  documents: DocumentItem[];
  currentRole: UserRole;
  activeStage: LifecycleStageId | null;
  auditBlocks: AuditBlock[];
  isLoadingDocs: boolean;
  onInspectEvidence: (doc: DocumentItem) => void;
  onVerifyEvidence: (doc: DocumentItem) => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => Promise<any>;
  onViewMerkleProof: (doc: DocumentItem) => void;
  onApplyRedaction: (doc: DocumentItem) => Promise<void>;
  onOpenUploadModal: () => void;
  onOpenAuthModal: () => void;
  onOpenBlockchainModal: () => void;
  onOpenAuditTab: () => void;
  onOpenTimedAccessModal: () => void;
  onOpenDocsModal: () => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documents,
  currentRole,
  activeStage,
  auditBlocks,
  isLoadingDocs,
  onInspectEvidence,
  onVerifyEvidence,
  onSimulateTamper,
  onRestoreDoc,
  onViewMerkleProof,
  onApplyRedaction,
  onOpenUploadModal,
  onOpenAuthModal,
  onOpenBlockchainModal,
  onOpenAuditTab,
  onOpenTimedAccessModal,
  onOpenDocsModal
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Full Document List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-heading">
                Case Evidence Files & Exhibits
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Active Role: <span className="text-cyan-400 font-semibold">{USER_ROLES[currentRole].name}</span> ({USER_ROLES[currentRole].label})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {documents.length} Records Ingested
              </span>
              <button
                onClick={onOpenUploadModal}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          <DocumentList
            documents={documents}
            currentRole={currentRole}
            activeStage={activeStage}
            onSelectDocument={onInspectEvidence}
            onVerifyDocument={onVerifyEvidence}
            onSimulateTamper={onSimulateTamper}
            onRestoreDoc={onRestoreDoc}
            onViewMerkleProof={onViewMerkleProof}
            onApplyRedaction={onApplyRedaction}
            onOpenUploadModal={onOpenUploadModal}
            isLoading={isLoadingDocs}
          />
        </div>

        {/* Right Column: Case Summary & Real-time Verification Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Officer Identity Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Authenticated Session</span>
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
              >
                Switch Role
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {currentRole.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-200">{USER_ROLES[currentRole].name}</div>
                <div className="text-xs text-slate-400">{USER_ROLES[currentRole].label}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Permissions:</span>
                <span className="text-slate-300 font-mono">FIPS 140-3 Compliant</span>
              </div>
              <div className="flex justify-between">
                <span>Watermark:</span>
                <span className="text-emerald-400 font-mono">DL-POL-8832 (Active)</span>
              </div>
            </div>
          </div>

          {/* Prominent Recent Activity Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <History className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 font-heading">Recent Activity & Audit Stream</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenBlockchainModal}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline"
                  title="Open Polygon Blockchain Explorer"
                >
                  Ledger
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={onOpenAuditTab}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-0.5"
                  title="View complete immutable audit trail"
                >
                  <span>Full Trail</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {auditBlocks.slice(0, 5).map((block) => {
                const isTamper = block.action.includes('TAMPER') || block.action.includes('ALERT');
                const isIngest = block.action.includes('UPLOAD') || block.action.includes('INGEST');
                const isCourt = block.action.includes('COURT') || block.action.includes('BSA');
                const isHeartbeat = block.action.includes('HEARTBEAT') || block.action.includes('PERIODIC');

                return (
                  <div key={block.block_id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5 transition-all hover:border-cyan-500/30">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-cyan-400 font-bold">{block.block_id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        isTamper 
                          ? 'bg-red-950 text-red-300 border border-red-500/30'
                          : isCourt 
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                          : isIngest
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : isHeartbeat
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}>
                        {block.action}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-1">{block.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900/80">
                      <span className="text-slate-400 truncate max-w-[130px] font-sans">{block.actor_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400/70 hidden sm:inline">#{block.block_hash.slice(0, 8)}</span>
                        <span>{block.timestamp_utc.slice(11, 19)} UTC</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Security & Forensic Tools Navigation */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Secondary Security Controls
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">FIPS 140-3</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onSimulateTamper(documents[2] || documents[0])}
                className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-300 flex flex-col items-start gap-1 transition-all"
                title="Simulate bit-level tamper attack"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-bold text-[11px]">Tamper Simulator</span>
                <span className="text-[9px] text-slate-400">Zero-Trust Audit</span>
              </button>

              <button
                onClick={() => onViewMerkleProof(documents[0])}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                title="Inspect cryptographic Merkle inclusion proofs"
              >
                <GitCommit className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-[11px]">Merkle Tree DAG</span>
                <span className="text-[9px] text-slate-400">Leaf Proofs</span>
              </button>

              <button
                onClick={onOpenTimedAccessModal}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                title="Delegate time-bound access under Rule 8.2"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[11px]">Timed Access</span>
                <span className="text-[9px] text-slate-400">Rule 8.2 Delegation</span>
              </button>

              <button
                onClick={onOpenDocsModal}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                title="View complete system architecture specifications"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-[11px]">System Docs</span>
                <span className="text-[9px] text-slate-400">8 Specs Chapters</span>
              </button>
            </div>
          </div>

          {/* SIH Evaluation Matrix Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="font-heading text-sm">SIH Evaluation Matrix Compliance</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 font-sans text-[11px] leading-relaxed">
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Sec 63 BSA:</strong> Cryptographic electronic manifests replace manual court paper trials.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Zero-Trust:</strong> SHA-256 + Merkle DAG guarantees instant tamper detection.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Leak Attribution:</strong> Steganographic watermarks prevent media leaks.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
