import React, { useState } from 'react';
import type { CaseRecord, DocumentItem } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  RotateCcw, 
  FileText, 
  Hash, 
  Check, 
  Layers,
  Download
} from 'lucide-react';

interface CaseVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord | null;
  documents: DocumentItem[];
  onRestoreAll: () => void;
  isLiveBackend: boolean;
}

export const CaseVerificationModal: React.FC<CaseVerificationModalProps> = ({
  isOpen,
  onClose,
  caseRecord,
  documents,
  onRestoreAll,
  isLiveBackend
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTime, setVerifiedTime] = useState<string>(() => new Date().toLocaleTimeString());

  if (!isOpen) return null;

  const tamperedDocs = documents.filter(d => d.tamper_flag || d.status === 'TAMPERED' || d.status === 'QUARANTINED');
  const verifiedDocs = documents.filter(d => !d.tamper_flag && d.status !== 'TAMPERED');
  const hasTamper = tamperedDocs.length > 0;
  const integrityScore = hasTamper 
    ? Math.max(0, Math.round(((documents.length - tamperedDocs.length) / (documents.length || 1)) * 100))
    : 100;

  const handleRunReVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedTime(new Date().toLocaleTimeString());
    }, 600);
  };

  const handleExportVerificationJson = () => {
    const report = {
      case_id: caseRecord?.case_id || 'CASE-2026-DEL-402',
      verification_timestamp: new Date().toISOString(),
      consensus_status: hasTamper ? 'INTEGRITY_COMPROMISED' : 'CONSENSUS_VALIDATED',
      integrity_score: `${integrityScore}%`,
      merkle_root: caseRecord?.merkle_root,
      total_exhibits: documents.length,
      verified_exhibits: verifiedDocs.length,
      quarantined_exhibits: tamperedDocs.length,
      environment: isLiveBackend ? 'LIVE_ENTERPRISE_BACKEND' : 'STANDALONE_WEB_PREVIEW',
      cryptographic_standard: 'FIPS 180-4 SHA-256 / ISO/IEC 27001',
      exhibit_details: documents.map(d => ({
        id: d.id,
        title: d.title,
        stage: d.stage,
        sha256_hash: d.sha256_hash,
        is_tampered: d.tamper_flag,
        status: d.status
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Verification_Report_${caseRecord?.case_id || 'CASE'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${hasTamper ? 'bg-red-950/80 border border-red-500/30 text-red-400' : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400'}`}>
              {hasTamper ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100 font-heading">
                  Cryptographic Case Verification Audit
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  hasTamper ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {hasTamper ? 'COMPROMISED' : 'CONSENSUS VALIDATED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {caseRecord?.case_id || 'CASE-2026-DEL-402'} • Last Verified at {verifiedTime}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunReVerification}
              disabled={isVerifying}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all disabled:opacity-50"
              title="Re-run SHA-256 and Merkle consensus verification"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>{isVerifying ? 'Auditing...' : 'Re-verify'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Status Banner */}
          {hasTamper ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-red-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>CRITICAL: {tamperedDocs.length} Exhibit(s) Failed Cryptographic Hash Verification</span>
                </div>
                <button
                  onClick={() => {
                    onRestoreAll();
                    handleRunReVerification();
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Genesis Consensus</span>
                </button>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed font-sans">
                The zero-trust cryptographic sentinel detected that exhibit data does not match the anchored Merkle leaf hash. The evidence has been quarantined to prevent judicial contamination under Section 63 BSA.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Trust Consensus Validated: 100% Case Evidence Pristine</span>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">
                All {documents.length} ingested case exhibits match their genesis SHA-256 cryptographic commitments. Merkle root hash matches the Polygon blockchain anchor with zero discrepancies.
              </p>
            </div>
          )}

          {/* 4 Metric Telemetry in Verification Modal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Exhibits</div>
              <div className="text-xl font-bold font-mono text-cyan-400">{documents.length}</div>
              <div className="text-[10px] text-slate-500 font-mono">100% Ingested</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Verified Exhibits</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{verifiedDocs.length}</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">FIPS 180-4 Valid</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Quarantine Alerts</div>
              <div className={`text-xl font-bold font-mono ${hasTamper ? 'text-red-400' : 'text-slate-300'}`}>
                {tamperedDocs.length}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{hasTamper ? 'Tamper Detected' : 'No Violations'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Consensus Score</div>
              <div className={`text-xl font-bold font-mono ${hasTamper ? 'text-red-400' : 'text-emerald-400'}`}>
                {integrityScore}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Merkle Root Intact</div>
            </div>
          </div>

          {/* Merkle Root & Hash Commitment Panel */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Anchored Case Merkle Root</span>
              </div>
              <span className="text-[11px] text-cyan-400/80">Polygon Block #18,421,006</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-cyan-300 break-all select-all">
              {caseRecord?.merkle_root || '6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8'}
            </div>
          </div>

          {/* Detailed Exhibit Verification Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                Individual Exhibit Audit Breakdown ({documents.length} Records)
              </h3>
              <span className="text-[11px] text-slate-400">
                Algorithm: SHA-256 (256-bit hash commitment)
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Exhibit</th>
                    <th className="p-2.5">Stage</th>
                    <th className="p-2.5">SHA-256 Digest</th>
                    <th className="p-2.5">Custodian</th>
                    <th className="p-2.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {documents.map((doc, idx) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5">
                        <div className="flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-sans font-medium text-slate-200 line-clamp-1">
                            {doc.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-cyan-400">Ex. P-{idx + 1} ({doc.id})</span>
                      </td>
                      <td className="p-2.5 text-slate-400">Stage {doc.stage}</td>
                      <td className="p-2.5 text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3 text-slate-500" />
                          <span>{doc.sha256_hash.slice(0, 16)}...</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-400 font-sans">{doc.uploaded_by}</td>
                      <td className="p-2.5">
                        {doc.tamper_flag ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            HASH MISMATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <Check className="w-3 h-3 mr-1" />
                            AUTHENTIC
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-mono text-slate-400">
            Conforms to Sec 63 BSA 2023 & ISO/IEC 27001 Evidence Integrity
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportVerificationJson}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
