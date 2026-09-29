import React from 'react';
import type { AuditBlock } from '../../types';
import { LiveAuditLedger } from '../../components/LiveAuditLedger';
import { ExternalLink } from 'lucide-react';

export interface AuditTrailTabProps {
  auditBlocks: AuditBlock[];
  isWsConnected: boolean;
  onOpenBlockchainModal: () => void;
}

export const AuditTrailTab: React.FC<AuditTrailTabProps> = ({
  auditBlocks,
  isWsConnected,
  onOpenBlockchainModal
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-heading">
            Cryptographic Audit Trail & Blockchain Ledger
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Polygon / Hyperledger SHA-256 Hash Chain • Zero-Trust Log of Every Ingestion, Access, and Redaction
          </p>
        </div>
        <button
          onClick={onOpenBlockchainModal}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 self-start sm:self-center shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Smart Contract Ledger</span>
        </button>
      </div>

      <LiveAuditLedger
        blocks={auditBlocks}
        isWsConnected={isWsConnected}
      />
    </div>
  );
};
