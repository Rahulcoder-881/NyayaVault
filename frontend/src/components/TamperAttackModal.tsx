import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCcw, 
  Zap, 
  Binary, 
  GitBranch, 
  CheckCircle2 
} from 'lucide-react';

interface TamperAttackModalProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteTamper: (docId: string, byteOffset: number, maliciousData: string) => Promise<any>;
  onRestoreDoc: (doc: DocumentItem) => Promise<any>;
}

export const TamperAttackModal: React.FC<TamperAttackModalProps> = ({
  documents,
  selectedDoc,
  isOpen,
  onClose,
  onExecuteTamper,
  onRestoreDoc
}) => {
  if (!isOpen) return null;

  const initialDoc = selectedDoc || documents.find(d => d.id === 'DOC-STG2-003') || documents[0];
  const [targetDocId, setTargetDocId] = useState<string>(initialDoc.id);
  const [byteOffset, setByteOffset] = useState<number>(140);
  const [maliciousPayload, setMaliciousPayload] = useState<string>(
    '[MALICIOUS_TAMPER_INJECTION: WEAPON SERIAL ALTERED FROM W-9041 TO W-0000]'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [attackResult, setAttackResult] = useState<any>(null);

  const activeDoc = documents.find(d => d.id === targetDocId) || initialDoc;
  const isAlreadyTampered = activeDoc.status === 'TAMPERED' || activeDoc.status === 'QUARANTINED';

  const handleRunAttack = async () => {
    setIsExecuting(true);
    try {
      const res = await onExecuteTamper(targetDocId, byteOffset, maliciousPayload);
      setAttackResult(res);
    } catch (err) {
      console.error('Tamper attack error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRestore = async () => {
    setIsExecuting(true);
    try {
      await onRestoreDoc(activeDoc);
      setAttackResult(null);
    } catch (err) {
      console.error('Restore error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b0e1a] border border-red-500/40 shadow-2xl overflow-hidden flex flex-col glow-crimson">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-red-500/30 bg-red-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-500/60 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-red-200 font-heading">
                Cryptographic Tamper Attack Simulator
              </h2>
              <p className="text-xs text-red-300/80 font-mono">
                SIH Evidentiary Integrity & Zero-Trust Stress Test
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Explanation Alert */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
            <span className="font-bold text-cyan-400">Threat Model:</span> In conventional police & court DMS software, an internal malicious actor or database administrator could silently modify critical evidence (e.g. changing the recovered Glock 19 serial number from <code className="text-cyan-300">W-9041</code> to <code className="text-red-300">W-0000</code>). In NyayaVault, even a single-bit alteration instantly invalidates the document SHA-256 hash, breaks the Merkle Tree Root, and automatically isolates the file into forensic quarantine.
          </div>

          {/* Target Document Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
              1. Select Target Legal Exhibit
            </label>
            <select
              value={targetDocId}
              onChange={(e) => {
                setTargetDocId(e.target.value);
                setAttackResult(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-red-500 font-mono text-xs"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.exhibit_number || d.id}: {d.title} ({d.category})
                </option>
              ))}
            </select>
          </div>

          {/* Malicious Byte Injection Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
                Byte Offset
              </label>
              <input
                type="number"
                value={byteOffset}
                onChange={(e) => setByteOffset(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-red-500 font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
                Malicious Byte Payload
              </label>
              <input
                type="text"
                value={maliciousPayload}
                onChange={(e) => setMaliciousPayload(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-red-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Results / Live Feedback */}
          {attackResult && (
            <div className="p-4 rounded-xl bg-red-950/70 border border-red-500 space-y-2.5 animate-fadeIn">
              <div className="flex items-center space-x-2 text-red-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
                <span>CRYPTOGRAPHIC BREACH DETECTED // ZERO-TRUST QUARANTINE TRIGGERED</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-300">
                  Original Genesis Hash: <span className="text-cyan-400">{attackResult.original_sha256}</span>
                </div>
                <div className="text-slate-300">
                  Tampered File Hash: <span className="text-red-400 font-bold">{attackResult.tampered_sha256}</span>
                </div>
                <div className="text-slate-300">
                  Case Merkle Root Discrepancy: <span className="text-amber-300">{attackResult.new_merkle_root.substring(0, 24)}...</span>
                </div>
                <div className="text-slate-400 text-[10px] pt-1">
                  Status: Automatically flagged as QUARANTINED. File barred from admission under Section 63 BSA 2023. Real-time alert dispatched to Presiding Magistrate.
                </div>
              </div>
            </div>
          )}

          {isAlreadyTampered && !attackResult && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/60 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>This exhibit is currently in QUARANTINED state.</span>
              </div>
              <button
                onClick={handleRestore}
                disabled={isExecuting}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Consensus</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            {isAlreadyTampered ? (
              <button
                onClick={handleRestore}
                disabled={isExecuting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore from Immutable Ledger</span>
              </button>
            ) : (
              <button
                onClick={handleRunAttack}
                disabled={isExecuting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/40 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{isExecuting ? 'Injecting Malicious Bytes...' : 'Execute Tamper Attack'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
