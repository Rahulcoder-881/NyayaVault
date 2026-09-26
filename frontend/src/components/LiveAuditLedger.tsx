import React from 'react';
import { AuditBlock } from '../types';
import { 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  FileText, 
  User, 
  Cpu, 
  Lock 
} from 'lucide-react';

interface LiveAuditLedgerProps {
  blocks: AuditBlock[];
  isWsConnected: boolean;
}

export const LiveAuditLedger: React.FC<LiveAuditLedgerProps> = ({
  blocks,
  isWsConnected
}) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">UPLOAD</span>;
      case 'VIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-800 border border-slate-700">INSPECT</span>;
      case 'SIGN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">DIGITAL SIGN</span>;
      case 'REDACT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">REDACT PII</span>;
      case 'TAMPER_SIMULATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">TAMPER DETECTED</span>;
      case 'RESTORE_LEGAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">RESTORED</span>;
      case 'COURT_SEAL_APPLIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">COURT SEAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-800">{action}</span>;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <History className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Immutable Blockchain / Audit Ledger Stream
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              FIPS 140-3 Non-Repudiation Block Trail
            </p>
          </div>
        </div>

        {/* Live WebSocket Telemetry */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className={isWsConnected ? 'text-emerald-400' : 'text-amber-400'}>
            {isWsConnected ? 'LIVE WS STREAM' : 'SYNCING...'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-bold">{blocks.length} Blocks Anchored</span>
        </div>
      </div>

      {/* Ledger Block Feed */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {blocks.map((block) => {
          const isTamperBlock = block.action === 'TAMPER_SIMULATION';

          return (
            <div
              key={block.block_id || block.index}
              className={`p-3 rounded-xl border transition-all text-xs font-mono space-y-2 ${
                isTamperBlock
                  ? 'bg-red-950/40 border-red-500/60 glow-crimson'
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyan-400">
                    {block.block_id || `BLK-${block.index}`}
                  </span>
                  {getActionBadge(block.action)}
                </div>
                <span className="text-[10px] text-slate-400">
                  {block.timestamp_utc?.replace('T', ' ').replace('Z', ' UTC')}
                </span>
              </div>

              {/* Action Details */}
              <div className="text-[11px] text-slate-200 font-sans leading-relaxed">
                {block.details}
              </div>

              {/* Actor & Hashes */}
              <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-1">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300 font-medium">{block.actor_name}</span>
                  <span>({block.badge_id})</span>
                  <span>•</span>
                  <span>IP: {block.ip_address}</span>
                </div>

                <div className="flex items-center space-x-2 text-[10px]">
                  <span>Hash: <span className="text-slate-300 font-mono">{block.block_hash?.substring(0, 14)}...</span></span>
                  <span className="text-emerald-400 font-mono">HMAC-SIG OK</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
