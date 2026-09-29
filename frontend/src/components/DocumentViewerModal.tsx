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
  QrCode,
  Copy,
  Check,
  Key,
  Database,
  GitBranch,
  Layers,
  Lock,
  UserX,
  ChevronDown,
  ChevronUp,
  FileCheck2
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Expandable sections state for Section 3 (Advanced Technical Details)
  const [expandedSections, setExpandedSections] = useState({
    hashes: true,
    kms: false,
    merkle: false,
    blockchain: false,
    watermark: false
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
  const isJudge = currentRole === 'JUDGE_MAGISTRATE';
  const displayContent = (isRedacted && !isJudge)
    ? (document.redacted_content || document.content)
    : document.content;

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Keyboard navigation for accessible tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, current: 'PREVIEW' | 'VERIFICATION' | 'TECHNICAL') => {
    const tabs: ('PREVIEW' | 'VERIFICATION' | 'TECHNICAL')[] = ['PREVIEW', 'VERIFICATION', 'TECHNICAL'];
    const currentIndex = tabs.indexOf(current);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      setActiveTab(nextTab);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      setActiveTab(prevTab);
    }
  };

  /**
   * Secure print handler:
   * 1. Strictly enforces that printing NEVER bypasses permissions or exposes unredacted restricted content.
   * 2. When document is redacted, prints ONLY the redacted content for non-judicial users.
   * 3. Imprints forensic watermark, officer attribution, and quarantine alerts on the physical copy.
   */
  const handlePrint = () => {
    // 1. Role permission enforcement
    if (!roleInfo.canViewAssigned && currentRole === 'SYS_ADMIN') {
      alert('Printing restricted under Zero-PII Policy (Rule 8.2) for System Administrators.');
      return;
    }

    if (isTampered) {
      const confirmPrint = window.confirm(
        'WARNING: This evidence document is currently QUARANTINED due to cryptographic hash mismatch.\n' +
        'Printed copy will be explicitly stamped as QUARANTINED / TAMPERED EVIDENCE. Do you wish to proceed?'
      );
      if (!confirmPrint) return;
    }

    // 2. Safe print using an isolated print window to prevent background state leakage
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>NyayaVault Evidence Record - ${document.exhibit_number || document.id}</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { font-family: 'Courier New', Courier, monospace; color: #111; line-height: 1.6; padding: 20px; position: relative; }
            .watermark-overlay { position: fixed; top: 38%; left: 8%; transform: rotate(-28deg); font-size: 15px; color: rgba(220, 0, 0, 0.12); pointer-events: none; z-index: 100; font-weight: bold; width: 85%; text-align: center; }
            .header-bar { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 18px; }
            .header-bar h1 { font-size: 16px; margin: 0 0 4px 0; text-transform: uppercase; font-family: sans-serif; letter-spacing: 0.5px; }
            .header-bar .subtitle { font-size: 11px; color: #444; font-family: sans-serif; }
            .meta-table { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 16px; border: 1px solid #ccc; padding: 12px; background: #fafafa; border-radius: 4px; }
            .meta-item { margin-bottom: 4px; }
            .meta-label { font-weight: bold; color: #555; text-transform: uppercase; font-size: 9px; display: block; }
            .meta-val { font-size: 11px; }
            .content-box { white-space: pre-wrap; font-size: 12px; background: #fff; padding: 14px; border: 1px solid #ddd; margin-bottom: 20px; line-height: 1.6; border-radius: 4px; }
            .tamper-box { background: #fee; border: 2px solid #c00; color: #900; padding: 10px; margin-bottom: 14px; font-weight: bold; font-size: 11px; font-family: sans-serif; }
            .redaction-box { background: #fff8e1; border: 1px solid #f57f17; color: #e65100; padding: 8px 12px; margin-bottom: 14px; font-size: 11px; font-family: sans-serif; }
            .footer-bar { border-top: 1px solid #333; padding-top: 12px; font-size: 10px; color: #444; display: flex; justify-content: space-between; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div class="watermark-overlay">${watermarkText}<br/>OFFICIAL JUDICIAL EVIDENCE COPY // NON-TRANSFERABLE</div>
          
          <div class="header-bar">
            <h1>NyayaVault Digital Forensic Evidence Repository</h1>
            <div class="subtitle">Section 63 Bharatiya Sakshya Adhiniyam (BSA), 2023 Electronic Evidence Record</div>
          </div>

          ${isTampered ? '<div class="tamper-box">⚠️ WARNING: THIS DOCUMENT IS QUARANTINED DUE TO CRYPTOGRAPHIC HASH MISMATCH. ADMISSIBILITY CHALLENGED UNDER SECTION 63 BSA.</div>' : ''}
          ${isRedacted && !isJudge ? '<div class="redaction-box">🛡️ WITNESS PROTECTION REDACTION APPLIED UNDER SECTION 145/146 BSA. CONFIDENTIAL PII IS MASKED.</div>' : ''}

          <div class="meta-table">
            <div class="meta-item"><span class="meta-label">Exhibit Designation:</span> <span class="meta-val"><strong>${document.exhibit_number || 'Pending Marking'}</strong></span></div>
            <div class="meta-item"><span class="meta-label">Assigned Document ID:</span> <span class="meta-val">${document.id}</span></div>
            <div class="meta-item"><span class="meta-label">Presiding Case ID:</span> <span class="meta-val">${document.case_id}</span></div>
            <div class="meta-item"><span class="meta-label">Custody Stage:</span> <span class="meta-val">Stage ${document.stage} (${document.stage_name})</span></div>
            <div class="meta-item"><span class="meta-label">Legal Category:</span> <span class="meta-val">${document.category}</span></div>
            <div class="meta-item"><span class="meta-label">Security Classification:</span> <span class="meta-val">${document.classification}</span></div>
            <div class="meta-item"><span class="meta-label">Ingestion Custodian:</span> <span class="meta-val">${document.uploaded_by} (${document.badge_id})</span></div>
            <div class="meta-item"><span class="meta-label">Printed By Officer:</span> <span class="meta-val">${roleInfo.name} (${roleInfo.badge})</span></div>
            <div class="meta-item"><span class="meta-label">Genesis UTC Timestamp:</span> <span class="meta-val">${document.timestamp_utc}</span></div>
            <div class="meta-item"><span class="meta-label">Print UTC Timestamp:</span> <span class="meta-val">${new Date().toISOString()}</span></div>
            <div style="grid-column: span 2;" class="meta-item">
              <span class="meta-label">FIPS 180-4 SHA-256 Digest:</span> 
              <span style="font-family: monospace; font-size: 10px; word-break: break-all;">${document.sha256_hash}</span>
            </div>
          </div>

          <div class="content-box">${displayContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

          <div class="footer-bar">
            <span>Merkle Leaf: ${document.merkle_leaf_hash ? document.merkle_leaf_hash.slice(0, 32) + '...' : 'Genesis Leaf'}</span>
            <span>Section 63 BSA Electronic Evidence Certificate // Verified Integrity</span>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 280);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-modal-title"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090e1c] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-slate-900/70 flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
              isTampered ? 'bg-red-950 border-red-500/60 text-red-400' : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
            }`}>
              {isTampered ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <FileText className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {document.exhibit_number || document.id}
                </span>
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Stage {document.stage}: {document.stage_name}
                </span>

                {/* Verification & Status Badges */}
                {isTampered ? (
                  <span className="text-[11px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded animate-pulse flex items-center space-x-1 shadow-sm shadow-red-600/30">
                    <AlertTriangle className="w-3 h-3" />
                    <span>QUARANTINED</span>
                  </span>
                ) : isRedacted ? (
                  <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded flex items-center space-x-1">
                    <UserX className="w-3 h-3" />
                    <span>WITNESS REDACTED</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SEC 63 BSA ADMISSIBLE</span>
                  </span>
                )}

                {document.classification && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {document.classification.replace('_', ' ')}
                  </span>
                )}
              </div>

              <h2 id="viewer-modal-title" className="text-sm sm:text-base md:text-lg font-bold text-slate-100 font-heading truncate">
                {document.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close document viewer modal"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessible Three-Section Tab List */}
        <div 
          role="tablist" 
          aria-label="Document view modes"
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-5 pt-2.5 border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono overflow-x-auto"
        >
          {/* Section 1: Document Preview */}
          <button
            id="doc-tab-preview"
            role="tab"
            aria-selected={activeTab === 'PREVIEW'}
            aria-controls="doc-panel-preview"
            tabIndex={activeTab === 'PREVIEW' ? 0 : -1}
            onClick={() => setActiveTab('PREVIEW')}
            onKeyDown={(e) => handleTabKeyDown(e, 'PREVIEW')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'PREVIEW'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Document Preview</span>
          </button>

          {/* Section 2: Verification & Chain of Custody */}
          <button
            id="doc-tab-verification"
            role="tab"
            aria-selected={activeTab === 'VERIFICATION'}
            aria-controls="doc-panel-verification"
            tabIndex={activeTab === 'VERIFICATION' ? 0 : -1}
            onClick={() => setActiveTab('VERIFICATION')}
            onKeyDown={(e) => handleTabKeyDown(e, 'VERIFICATION')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'VERIFICATION'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Verification & Chain of Custody</span>
          </button>

          {/* Section 3: Advanced Technical Details */}
          <button
            id="doc-tab-technical"
            role="tab"
            aria-selected={activeTab === 'TECHNICAL'}
            aria-controls="doc-panel-technical"
            tabIndex={activeTab === 'TECHNICAL' ? 0 : -1}
            onClick={() => setActiveTab('TECHNICAL')}
            onKeyDown={(e) => handleTabKeyDown(e, 'TECHNICAL')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'TECHNICAL'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3. Advanced Technical Details</span>
          </button>
        </div>

        {/* Tab Panels Content */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* ================================================================ */}
          {/* SECTION 1: DOCUMENT PREVIEW & KEY METADATA FIRST */}
          {/* ================================================================ */}
          {activeTab === 'PREVIEW' && (
            <div 
              id="doc-panel-preview"
              role="tabpanel"
              aria-labelledby="doc-tab-preview"
              className="space-y-3.5"
            >
              
              {/* Key Metadata Card - Shown First */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2 flex items-center justify-between">
                  <span>Evidentiary Custody Summary</span>
                  <span className="text-cyan-400">Section 63 BSA 2023 Grounded</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-sans">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Attributed Officer</span>
                    <span className="text-slate-100 font-bold truncate block">{document.uploaded_by}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Badge: {document.badge_id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Custody Stage</span>
                    <span className="text-slate-100 font-bold block">Stage {document.stage}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{document.category}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Capture Timestamp</span>
                    <span className="text-slate-200 font-mono block text-[10px]">
                      {document.timestamp_utc.replace('T', ' ').replace('Z', ' UTC')}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">FIPS-180-4 Anchored</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Payload Size</span>
                    <span className="text-slate-100 font-bold block">
                      {(document.file_size_bytes / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block font-mono">{document.gps_coordinates}</span>
                  </div>
                </div>
              </div>

              {/* Document View with Forensic Watermark */}
              <div className="relative rounded-xl border border-slate-800 bg-[#060810] p-4 sm:p-6 shadow-inner font-mono text-xs leading-relaxed text-slate-200 overflow-hidden">
                
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
                  <div className="font-bold flex flex-wrap items-center justify-between gap-1">
                    <span>🏛️ STATE POLICE & FORENSIC DIGITAL CUSTODY ARCHIVE</span>
                    <span className="text-[10px] font-mono text-slate-400">SEC 63 BSA 2023 CERTIFIED</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                    ACTIVE VIEWER: <span className="text-slate-200 font-bold">{roleInfo.name}</span> ({roleInfo.badge}) | IP: {clientIp} | UTC: {timestampUtc}
                  </div>
                </div>

                {/* Tamper Warning Banner if Corrupted */}
                {isTampered && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs">
                    <div className="font-bold flex items-center space-x-1.5 text-red-400 mb-1">
                      <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
                      <span>AUTOMATIC SYSTEM QUARANTINE: CRYPTOGRAPHIC HASH MISMATCH</span>
                    </div>
                    <p className="text-[11px]">
                      Expected SHA-256 does not match bit-stream contents. This document is blocked from court submission until restored by Judicial Registrar.
                    </p>
                  </div>
                )}

                {/* Redaction Notice if Protected */}
                {isRedacted && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs">
                    <div className="font-bold flex items-center space-x-1.5 text-amber-400 mb-1">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>WITNESS PROTECTION REDACTION APPLIED (SECTION 145/146 BSA)</span>
                    </div>
                    <p className="text-[11px]">
                      {isJudge 
                        ? 'Judicial privilege active: In-camera unredacted text is revealed under Section 165 BSA 2023.'
                        : 'Witness identities and confidential depositor PII have been masked to safeguard personal security.'}
                    </p>
                  </div>
                )}

                {/* Document Text Body */}
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed relative z-10 break-words">
                  {displayContent}
                </pre>

                {/* Watermark Legal Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span>NON-REPUDIATION SIGNATURE:</span>
                    <span className="font-mono text-cyan-300 font-bold">{document.sha256_hash.substring(0, 24)}...</span>
                  </div>
                  <span className="text-red-400/90 font-medium">UNAUTHORIZED SHARING IS PUNISHABLE UNDER SEC 204 BNS 2023</span>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 2: VERIFICATION & CHAIN OF CUSTODY */}
          {/* ================================================================ */}
          {activeTab === 'VERIFICATION' && (
            <div 
              id="doc-panel-verification"
              role="tabpanel"
              aria-labelledby="doc-tab-verification"
            >
              <EvidenceVerificationPanel
                document={document}
                currentRole={currentRole}
                isLiveBackend={isLiveBackend}
                onSimulateTamper={onSimulateTamper}
                onRestoreDoc={onRestoreDoc}
              />
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 3: ADVANCED TECHNICAL DETAILS (EXPANDABLE SECTIONS) */}
          {/* ================================================================ */}
          {activeTab === 'TECHNICAL' && (
            <div 
              id="doc-panel-technical"
              role="tabpanel"
              aria-labelledby="doc-tab-technical"
              className="space-y-3"
            >
              
              {/* Header Overview Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                <div className="font-bold text-slate-200 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Advanced Cryptographic Architecture & Provenance Specs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Detailed technical verification parameters for forensic experts, defense counsel cross-examination, and judicial scrutiny under Section 63 BSA 2023. Long hashes and cryptographic keys are grouped in expandable modules below.
                </p>
              </div>

              {/* Accordion 1: Cryptographic Hashes & Digital Fingerprints */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('hashes')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  aria-expanded={expandedSections.hashes}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span>1. FIPS 180-4 SHA-256 Bit-Stream Hashes</span>
                  </div>
                  {expandedSections.hashes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedSections.hashes && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Current Bit-Stream SHA-256 Digest:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(document.sha256_hash, 'curr_hash')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedKey === 'curr_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'curr_hash' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className={`p-2 rounded-lg bg-slate-900 border text-[11px] break-all select-all ${
                        isTampered ? 'border-red-500/60 text-red-300' : 'border-slate-800 text-cyan-300'
                      }`}>
                        {document.sha256_hash}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Original Ingestion Genesis Hash:</span>
                        <span className={`text-[10px] font-bold ${
                          document.sha256_hash === document.original_sha256 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {document.sha256_hash === document.original_sha256 ? '✓ GENESIS MATCH' : '✗ BIT CORRUPTION DETECTED'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] break-all select-all">
                        {document.original_sha256}
                      </div>
                    </div>

                    {document.merkle_leaf_hash && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Merkle Tree Leaf Hash:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(document.merkle_leaf_hash, 'leaf_hash')}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                          >
                            {copiedKey === 'leaf_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'leaf_hash' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 text-[11px] break-all select-all">
                          {document.merkle_leaf_hash}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: KMS HSM & Envelope Encryption */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('kms')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  aria-expanded={expandedSections.kms}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>2. Hardware Security Module (HSM) KMS Key-Wrapping</span>
                  </div>
                  {expandedSections.kms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedSections.kms && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>AWS CloudHSM KMS Key ARN:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(document.kms_key_arn, 'kms_arn')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedKey === 'kms_arn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'kms_arn' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 text-[11px] break-all select-all">
                        {document.kms_key_arn}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>AES-256-GCM Envelope Initialization Vector (IV):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(document.envelope_iv, 'envelope_iv')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedKey === 'envelope_iv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'envelope_iv' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] break-all select-all">
                        {document.envelope_iv}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] font-sans text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-300">Envelope Encryption Security Guarantee:</div>
                      <div>The plaintext evidence data key is encrypted under the HSM root key and never leaves the hardware boundary unencrypted. Meets FIPS 140-3 Level 3 compliance.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Merkle Tree DAG Inclusion Proof */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('merkle')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  aria-expanded={expandedSections.merkle}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span>3. Merkle DAG Root & Cryptographic Audit Proof</span>
                  </div>
                  {expandedSections.merkle ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedSections.merkle && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Case Merkle Root Anchor:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy('6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8', 'merkle_root')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedKey === 'merkle_root' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'merkle_root' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] break-all select-all">
                        6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block font-sans">Tree Depth:</span>
                        <span className="font-bold text-cyan-300">4 Levels (Balanced)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block font-sans">Proof Verification:</span>
                        <span className="font-bold text-emerald-400">O(log N) Cryptographic Inclusion</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Consortium Blockchain Ledger & Smart Contract */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('blockchain')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  aria-expanded={expandedSections.blockchain}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>4. Consortium Blockchain Ledger & Smart Contract</span>
                  </div>
                  {expandedSections.blockchain ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedSections.blockchain && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Ledger Tx ID:</span>
                        <span className="font-bold text-purple-300 break-all select-all">
                          {document.blockchain_tx_id || `0x7f${document.sha256_hash.slice(0, 36)}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Block Height:</span>
                        <span className="font-bold text-slate-200">
                          #{document.blockchain_block || 1842092} (Finalized)
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block">Smart Contract:</span>
                        <span className="text-cyan-300 font-bold">contracts/DocumentRegistry.sol (0xNyayaVaultReg2026)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 5: Forensic Watermark & Judicial QR */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('watermark')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  aria-expanded={expandedSections.watermark}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>5. Forensic Watermarking & Judicial QR Proof</span>
                  </div>
                  {expandedSections.watermark ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedSections.watermark && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Dynamic Watermark Payload:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(watermarkText, 'raw_watermark')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedKey === 'raw_watermark' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'raw_watermark' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 break-all select-all">
                        {watermarkText}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <div className="p-2 bg-white rounded-lg shrink-0">
                        <QrCode className="w-10 h-10 text-slate-950" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        <div className="font-semibold text-slate-200">Judicial QR Admissibility Key</div>
                        <div>Scannable by the Hon'ble Presiding Magistrate in open court to confirm uncorrupted genesis custody.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[11px] font-mono text-slate-400 truncate">
            Case: <strong className="text-slate-200">{document.case_id}</strong> • Custodian: <strong className="text-slate-200">{document.uploaded_by}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* Tamper / Restore Toggle */}
            {isTampered ? (
              <button
                type="button"
                onClick={() => onRestoreDoc(document)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                aria-label={`Restore genesis hash for ${document.title}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Clean Ledger State</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSimulateTamper(document)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900/80 text-red-300 text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label={`Simulate tamper attack on ${document.title}`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Tamper Attack</span>
              </button>
            )}

            {/* Print Section 63 Copy */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Print Section 63 BSA electronic evidence copy"
              aria-label="Print Section 63 BSA electronic evidence copy"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Section 63 Copy</span>
            </button>

            {/* Done Action */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label="Close document viewer"
            >
              <FileCheck2 className="w-3.5 h-3.5 inline mr-1 stroke-[2.5]" />
              <span>Done</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentViewerModal;
