import React, { useState, useEffect } from 'react';
import type { DocumentItem, UserRole } from '../types';
import { USER_ROLES } from '../constants';
import { EvidenceVerificationPanel } from './EvidenceVerificationPanel';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Printer, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  RotateCcw,
  Fingerprint,
  QrCode
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  currentRole: UserRole;
  onClose: () => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => void;
  isLiveBackend?: boolean;
  initialTab?: 'PREVIEW' | 'VERIFICATION' | 'TECHNICAL';
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  currentRole,
  onClose,
  onSimulateTamper,
  onRestoreDoc,
  isLiveBackend = false,
  initialTab = 'PREVIEW'
}) => {
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'VERIFICATION' | 'TECHNICAL'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      const timer = setTimeout(() => setActiveTab(initialTab), 0);
      return () => clearTimeout(timer);
    }
  }, [initialTab, document?.id]);

  if (!document) return null;
  const roleInfo = USER_ROLES[currentRole];
  const isTampered = document.status === 'TAMPERED' || document.status === 'QUARANTINED';
  const isRedacted = document.status === 'REDACTED';

  // Dynamic Steganographic Forensic Watermark values
  const timestampUtc = new Date().toISOString();
  const clientIp = "10.42.188.94";
  const watermarkText = `NYAYAVAULT FORENSIC CUSTODY // BADGE: ${roleInfo.badge} | UTC: ${timestampUtc} | IP: ${clientIp} | CASE: ${document.case_id} | SEC 63 BSA`;

  // Display content depending on role & redactions
  const displayContent = (isRedacted && currentRole !== 'JUDGE_MAGISTRATE')
    ? (document.redacted_content || document.content)
    : document.content;

  const handlePrint = () => {
    // Restrict printing to the preview tab and enforce redaction rules.
    if (activeTab !== 'PREVIEW') return;
    if (isRedacted && currentRole !== 'JUDGE_MAGISTRATE') {
      alert('Printing is prohibited for redacted documents unless you have judicial privileges.');
      return;
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090e1c] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isTampered ? 'bg-red-950 border-red-500/60 text-red-400' : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
            }`}>
              {isTampered ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {document.exhibit_number || document.id}
                </span>
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Stage {document.stage}: {document.stage_name}
                </span>
                {isTampered ? (
                  <span className="text-[11px] font-mono font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">
                    QUARANTINED
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SEC 63 BSA ADMISSIBLE</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading truncate">
                {document.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div role="tablist" className="flex items-center space-x-2 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono">
          <button
            role="tab"
            aria-selected={activeTab === 'PREVIEW'}
            onClick={() => setActiveTab('PREVIEW')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'PREVIEW'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'VERIFICATION'}
            onClick={() => setActiveTab('VERIFICATION')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'VERIFICATION'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification & Chain of Custody</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'TECHNICAL'}
            onClick={() => setActiveTab('TECHNICAL')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'TECHNICAL'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Details</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: Document View with Forensic Watermark */}
          {activeTab === 'PREVIEW' && (
            <div className="relative rounded-xl border border-slate-800 bg-[#060810] p-6 shadow-inner font-mono text-xs leading-relaxed text-slate-200 overflow-hidden">
              
              {/* Semi-transparent Diagonal Repeating Watermark Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none select-none flex flex-col justify-around opacity-15 overflow-hidden rotate-[-18deg] scale-125"
                style={{ zIndex: 5 }}
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="whitespace-nowrap text-[11px] font-bold tracking-widest text-cyan-300">
                    {watermarkText} // CONFIDENTIAL // EVIDENCE TAMPERING OFFENSE
                  </div>
                ))}
              </div>

              {/* Watermark Legal Header Banner */}
              <div className="mb-4 pb-3 border-b border-cyan-500/30 text-cyan-400 text-[11px] font-sans">
                <div className="font-bold flex items-center justify-between">
                  <span>🏛️ STATE POLICE & FORENSIC DIGITAL CUSTODY ARCHIVE</span>
                  <span className="text-[10px] font-mono text-slate-400">SEC 63 BSA 2023 CERTIFIED</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  ACTIVE VIEWER: <span className="text-slate-200 font-mono">{roleInfo.name}</span> ({roleInfo.badge}) | IP: {clientIp} | UTC: {timestampUtc}
                </div>
              </div>

              {/* Tamper Warning Banner if Corrupted */}
              {isTampered && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  <div className="font-bold flex items-center space-x-1.5 text-red-400 mb-1">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    <span>AUTOMATIC SYSTEM QUARANTINE: CRYPTOGRAPHIC HASH MISMATCH</span>
                  </div>
                  <p className="text-[11px]">
                    Expected SHA-256 does not match bit-stream contents. This document is blocked from court submission until restored by Judicial Registrar.
                  </p>
                </div>
              )}

              {/* Document Text */}
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed relative z-10">
                {displayContent}
              </pre>

              {/* Watermark Legal Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>NON-REPUDIATION SIGNATURE: <span className="font-mono text-cyan-300">{document.sha256_hash.substring(0, 24)}...</span></span>
                <span className="text-red-400/90 font-medium">UNAUTHORIZED SHARING IS PUNISHABLE UNDER SEC 204 BNS 2023</span>
              </div>
            </div>
          )}

          {/* TAB 2: Dedicated Evidence Verification Panel */}
          {activeTab === 'VERIFICATION' && (
            <EvidenceVerificationPanel
              document={document}
              currentRole={currentRole}
              isLiveBackend={isLiveBackend}
              onSimulateTamper={onSimulateTamper}
              onRestoreDoc={onRestoreDoc}
            />
          )}

          {/* TAB 3: Forensic Provenance Watermark Details */}
          {activeTab === 'TECHNICAL' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Forensic Watermarking & Non-Repudiation Architecture</span>
              </h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                To satisfy the strict requirements of Section 63 BSA 2023, every document accessed in NyayaVault is dynamically stamped with an immutable, cryptographically verifiable forensic watermark. Even if an officer captures a photograph of the screen or leaks a physical printout, the embedded badge ID, timestamp, and signature hash permit instantaneous leak attribution.
              </p>
              
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all">
                {watermarkText}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <div className="p-2 bg-white rounded-lg">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-200">Judicial QR Admissibility Key</div>
                  <div>Scannable by Hon'ble Magistrate in court to confirm uncorrupted digital genesis.</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            Case: {document.case_id} // Custodian: {document.uploaded_by}
          </div>

          <div className="flex items-center space-x-2">
            {isTampered ? (
              <button
                onClick={() => onRestoreDoc(document)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Clean Ledger State</span>
              </button>
            ) : (
              <button
                onClick={() => onSimulateTamper(document)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900/80 text-red-300 text-xs transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Tamper Attack</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Section 63 Copy</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
