import React, { useState } from 'react';
import type { DocumentItem, UserRole, LifecycleStageId } from '../types';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Eye,
  Copy, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  GitBranch, 
  Upload, 
  Filter,
  UserX,
  Fingerprint
} from 'lucide-react';

interface DocumentListProps {
  documents: DocumentItem[];
  currentRole: UserRole;
  activeStage: LifecycleStageId | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => void;
  onViewMerkleProof: (doc: DocumentItem) => void;
  onApplyRedaction: (doc: DocumentItem) => void;
  onOpenUploadModal: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  currentRole,
  activeStage,
  onSelectDocument,
  onSimulateTamper,
  onRestoreDoc,
  onViewMerkleProof,
  onApplyRedaction,
  onOpenUploadModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const categories = ['ALL', 'FIR', 'Seizure Memo', 'Witness Statement', 'Forensic Report', 'DNA Report', 'Charge Sheet', 'Court Order'];

  // Filter documents
  const filtered = documents.filter((doc) => {
    // Stage filter
    if (activeStage !== null && doc.stage !== activeStage) return false;
    // Category filter
    if (categoryFilter !== 'ALL' && doc.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = doc.title.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.sha256_hash.toLowerCase().includes(q) ||
        doc.uploaded_by.toLowerCase().includes(q) ||
        (doc.exhibit_number && doc.exhibit_number.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Control & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Title, Exhibit No, SHA-256 hash, or Officer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:inline ml-1" />
          <div className="flex items-center space-x-1">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Upload Action */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all shrink-0 ml-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>

      </div>

      {/* Document Grid / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs font-mono">
          No legal documents matched your current search filters.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((doc) => {
            const isTampered = doc.status === 'TAMPERED' || doc.status === 'QUARANTINED';
            const isRedacted = doc.status === 'REDACTED';

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isTampered
                    ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/40 glow-crimson'
                    : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850/80 shadow-sm'
                }`}
              >
                {/* Left: Exhibit Badge & Document Title */}
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    isTampered
                      ? 'bg-red-900/50 border-red-500/60 text-red-300'
                      : 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400'
                  }`}>
                    {isTampered ? (
                      <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                    ) : (
                      <FileText className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {doc.exhibit_number && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm">
                          {doc.exhibit_number}
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                        Stage {doc.stage}: {doc.category}
                      </span>
                      {doc.classification && (
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          doc.classification === 'FORENSIC_INTERNAL' 
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                            : doc.classification === 'CONFIDENTIAL'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : doc.classification === 'RESTRICTED'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700'
                        }`}>
                          {doc.classification.replace('_', ' ')}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 flex items-center space-x-1" title="Zero-width invisible forensic watermark embedded">
                        <Fingerprint className="w-3 h-3 text-cyan-400" />
                        <span>STEGO SEAL</span>
                      </span>
                      {isTampered ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white flex items-center space-x-1 animate-pulse shadow-md shadow-red-600/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>TAMPER DETECTED // QUARANTINED</span>
                        </span>
                      ) : isRedacted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          WITNESS REDACTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 flex items-center space-x-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>SEC 63 BSA CERTIFIED</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {doc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-1">
                      <span>By: <span className="text-slate-300 font-medium">{doc.uploaded_by}</span> ({doc.badge_id})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{doc.timestamp_utc.replace('T', ' ').replace('Z', ' UTC')}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px] text-[11px] text-slate-500">{doc.gps_coordinates}</span>
                    </div>

                    {/* SHA-256 Hash Bar */}
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                        <span className="text-cyan-400 font-bold">SHA-256:</span>
                        <span className={`truncate max-w-[180px] sm:max-w-[280px] ${isTampered ? 'text-red-400 font-bold' : ''}`}>
                          {doc.sha256_hash}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleCopyHash(e, doc.sha256_hash)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Copy Hash Digest"
                      >
                        {copiedHash === doc.sha256_hash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 w-full md:w-auto justify-end">
                  
                  {/* Merkle Proof Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMerkleProof(doc);
                    }}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-950/80 hover:text-indigo-300 text-slate-300 border border-slate-700/60 text-xs transition-colors"
                    title="Inspect Merkle Audit Proof"
                  >
                    <GitBranch className="w-4 h-4" />
                  </button>

                  {/* Redact Action (Prosecutor) */}
                  {currentRole === 'PROSECUTOR' && !isRedacted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyRedaction(doc);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs transition-colors"
                      title="Apply Witness Protection Redaction"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Redact</span>
                    </button>
                  )}

                  {/* Tamper / Restore Toggle Button */}
                  {isTampered ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreDoc(doc);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateTamper(doc);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 hover:bg-red-900/80 text-red-300 text-xs transition-all"
                      title="Simulate Malicious Byte Alteration"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden sm:inline">Tamper</span>
                    </button>
                  )}

                  {/* View Details / Watermark */}
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
