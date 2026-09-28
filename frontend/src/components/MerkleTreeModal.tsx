import React, { useState, useEffect } from 'react';
import type { DocumentItem } from '../types';
import { 
  X, 
  GitBranch, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface MerkleTreeModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFetchProof: (docId: string) => Promise<any>;
}

export const MerkleTreeModal: React.FC<MerkleTreeModalProps> = ({
  document,
  isOpen,
  onClose,
  onFetchProof
}) => {
  const [proofData, setProofData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !document) return;
    let mounted = true;
    setIsLoading(true);
    onFetchProof(document.id)
      .then((data) => {
        if (mounted) {
          setProofData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [document, isOpen, onFetchProof]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090d1a] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                Cryptographic Merkle Proof Verification
              </h2>
              <p className="text-xs text-cyan-400 font-mono">
                Logarithmic Proof of Evidentiary Inclusion (O(log N))
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
            <strong className="text-cyan-400 font-mono">Mathematical Non-Repudiation:</strong> Instead of transmitting multi-gigabyte police case bundles over untrusted networks, the Merkle Tree allows any judicial court or defense advocate to verify that document <span className="font-mono text-cyan-300 font-bold">{document.exhibit_number || document.id}</span> exists uncorrupted within the Master Case Ledger using only {proofData?.proof_steps?.length || 4} cryptographic hashes.
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Traversing Merkle DAG Branches...</span>
            </div>
          ) : proofData ? (
            <div className="space-y-4">
              
              {/* Verification Status Pill */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                proofData.is_valid
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {proofData.is_valid ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                  )}
                  <span className="font-bold text-xs uppercase">
                    {proofData.is_valid ? 'Proof Verified: Leaf Authenticated against Root' : 'Proof Failed: Hash Inconsistency Detected'}
                  </span>
                </div>
                <span className="text-[11px] font-mono">
                  {proofData.proof_steps.length} Steps Validated
                </span>
              </div>

              {/* Master Root Hash */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Anchored Merkle Root Hash</div>
                <div className="text-xs text-cyan-400 font-bold break-all">{proofData.merkle_root}</div>
              </div>

              {/* Document Leaf Hash */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Document Leaf Hash (H_leaf)</div>
                <div className="text-xs text-indigo-300 font-bold break-all">{proofData.leaf_hash}</div>
              </div>

              {/* Step-by-Step Proof Path */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-sans uppercase font-semibold">
                  Merkle Audit Path Traversal:
                </div>
                {proofData.proof_steps.map((step: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400 font-sans">
                          Combine with <span className="font-mono text-cyan-300 font-bold">{step.position.toUpperCase()}</span> Sibling Hash:
                        </div>
                        <div className="text-[11px] text-slate-200 truncate max-w-sm sm:max-w-lg">
                          {step.hash}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>

            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
