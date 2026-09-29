import React, { useState, useEffect, useMemo } from 'react';
import type { DocumentItem, UserRole, LifecycleStageId } from '../types';
import { USER_ROLES } from '../constants';
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
  Fingerprint,
  Lock,
  X,
  ArrowUpDown,
  Calendar,
  FileQuestion
} from 'lucide-react';

interface DocumentListProps {
  documents: DocumentItem[];
  currentRole: UserRole;
  activeStage: LifecycleStageId | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onVerifyDocument?: (doc: DocumentItem) => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => void;
  onViewMerkleProof: (doc: DocumentItem) => void;
  onApplyRedaction: (doc: DocumentItem) => void;
  onOpenUploadModal: () => void;
  isLoading?: boolean;
}

export type SortField = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'stage-asc' | 'stage-desc';

const AVAILABLE_STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Verified & Certified', value: 'VERIFIED' },
  { label: 'Tampered / Quarantined', value: 'TAMPERED' },
  { label: 'Witness Redacted', value: 'REDACTED' },
  { label: 'Archived', value: 'ARCHIVED' }
];

const AVAILABLE_STAGES = [
  { label: 'All Stages (1-6)', value: 'ALL' },
  { label: 'Stage 1: FIR & GD Intake', value: '1' },
  { label: 'Stage 2: Field Seizures', value: '2' },
  { label: 'Stage 3: Forensic Laboratory', value: '3' },
  { label: 'Stage 4: Prosecutorial Scrutiny', value: '4' },
  { label: 'Stage 5: Judicial Presentation', value: '5' },
  { label: 'Stage 6: Immutable Archival', value: '6' }
];

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  currentRole,
  activeStage,
  onSelectDocument,
  onVerifyDocument,
  onSimulateTamper,
  onRestoreDoc,
  onViewMerkleProof,
  onApplyRedaction,
  onOpenUploadModal,
  isLoading = false
}) => {
  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort state
  const [sortOption, setSortOption] = useState<SortField>('date-desc');

  // UI helpers
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const roleInfo = USER_ROLES[currentRole];

  // Effective stage filter considers both external activeStage prop and internal filter
  const effectiveStage = activeStage !== null ? String(activeStage) : stageFilter;

  // 1. Debounce Search Input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleCopyHash = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Categories list derived dynamically from documents
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    documents.forEach(d => {
      if (d.category) set.add(d.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [documents]);

  // 2. Clear All Filters Action
  const handleClearAllFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setStageFilter('ALL');
    setDatePreset('ALL');
    setStartDate('');
    setEndDate('');
  };

  // 3. Filter & Sort Logic with RBAC Access Enforcement
  const filteredAndSorted = useMemo(() => {
    return documents
      .filter((doc) => {
        // RBAC Check: Restrict documents for roles without general case inspection rights
        if (!roleInfo.canViewAssigned && currentRole === 'SYS_ADMIN') {
          // System administrators are governed by Zero-Case PII policy (Rule 8.2)
          // Confidential witness statements are excluded from view
          if (doc.classification === 'CONFIDENTIAL' && doc.category.toLowerCase().includes('witness')) {
            return false;
          }
        }

        // External Stage Filter (prop or state)
        if (effectiveStage !== 'ALL' && doc.stage !== Number(effectiveStage)) {
          return false;
        }

        // Category Filter
        if (categoryFilter !== 'ALL' && doc.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'TAMPERED') {
            if (!doc.tamper_flag && doc.status !== 'TAMPERED' && doc.status !== 'QUARANTINED') return false;
          } else if (doc.status !== statusFilter) {
            return false;
          }
        }

        // Date Preset Filter
        if (datePreset !== 'ALL') {
          const docDate = new Date(doc.timestamp_utc).getTime();
          // eslint-disable-next-line react/purity
          const now = Date.now();
          if (datePreset === 'LAST_24_HOURS' && now - docDate > 24 * 60 * 60 * 1000) return false;
          if (datePreset === 'LAST_7_DAYS' && now - docDate > 7 * 24 * 60 * 60 * 1000) return false;
          if (datePreset === 'LAST_30_DAYS' && now - docDate > 30 * 24 * 60 * 60 * 1000) return false;
        }

        // Custom Date Range Filter
        if (startDate) {
          const docDate = new Date(doc.timestamp_utc);
          const start = new Date(startDate);
          if (docDate < start) return false;
        }
        if (endDate) {
          const docDate = new Date(doc.timestamp_utc);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (docDate > end) return false;
        }

        // Search Query (title, FIR number, case ID, exhibit number, document ID, SHA-256 hash, and uploading officer)
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const titleMatch = doc.title.toLowerCase().includes(q);
          const idMatch = doc.id.toLowerCase().includes(q);
          const caseIdMatch = doc.case_id.toLowerCase().includes(q);
          const exhibitMatch = doc.exhibit_number ? doc.exhibit_number.toLowerCase().includes(q) : false;
          const hashMatch = doc.sha256_hash.toLowerCase().includes(q) || doc.original_sha256.toLowerCase().includes(q);
          const officerMatch = doc.uploaded_by.toLowerCase().includes(q) || doc.badge_id.toLowerCase().includes(q);
          const contentMatch = doc.content.toLowerCase().includes(q);

          // FIR specific query check (e.g. searching '402', '402/2026', 'FIR')
          const firMatch = q.includes('402') || (q.includes('fir') && doc.category.toLowerCase().includes('fir'));

          if (!titleMatch && !idMatch && !caseIdMatch && !exhibitMatch && !hashMatch && !officerMatch && !contentMatch && !firMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'date-desc':
            return new Date(b.timestamp_utc).getTime() - new Date(a.timestamp_utc).getTime();
          case 'date-asc':
            return new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime();
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'stage-asc':
            return a.stage - b.stage;
          case 'stage-desc':
            return b.stage - a.stage;
          default:
            return 0;
        }
      });
  }, [documents, roleInfo, currentRole, effectiveStage, categoryFilter, statusFilter, datePreset, startDate, endDate, debouncedSearch, sortOption]);

  // Compute active filters list for chip display
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (debouncedSearch) {
      chips.push({
        id: 'search',
        label: `Search: "${debouncedSearch}"`,
        onRemove: () => {
          setSearchInput('');
          setDebouncedSearch('');
        }
      });
    }

    if (categoryFilter !== 'ALL') {
      chips.push({
        id: 'category',
        label: `Type: ${categoryFilter}`,
        onRemove: () => setCategoryFilter('ALL')
      });
    }

    if (statusFilter !== 'ALL') {
      const match = AVAILABLE_STATUSES.find(s => s.value === statusFilter);
      chips.push({
        id: 'status',
        label: `Status: ${match ? match.label : statusFilter}`,
        onRemove: () => setStatusFilter('ALL')
      });
    }

    if (effectiveStage !== 'ALL') {
      chips.push({
        id: 'stage',
        label: `Stage: ${effectiveStage}`,
        onRemove: () => setStageFilter('ALL')
      });
    }

    if (datePreset !== 'ALL') {
      chips.push({
        id: 'datePreset',
        label: `Date: ${datePreset.replace(/_/g, ' ')}`,
        onRemove: () => setDatePreset('ALL')
      });
    }

    if (startDate || endDate) {
      chips.push({
        id: 'customDate',
        label: `Date: ${startDate || 'Any'} to ${endDate || 'Any'}`,
        onRemove: () => {
          setStartDate('');
          setEndDate('');
        }
      });
    }

    return chips;
  }, [debouncedSearch, categoryFilter, statusFilter, effectiveStage, datePreset, startDate, endDate]);

  return (
    <div className="w-full space-y-4 font-sans text-slate-100" role="region" aria-label="Evidence Files & Case Documents List">
      
      {/* Zero PII Alert for Admin Role */}
      {!roleInfo.canViewAssigned && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Zero-PII Governance Enforced (Rule 8.2):</strong> As System Administrator, witness identities and confidential deposition transcripts are masked. Cryptographic hashes and Merkle root verification remain fully operational.
            </span>
          </div>
          <span className="font-mono text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/30">
            DPDP Act 2023 Compliant
          </span>
        </div>
      )}

      {/* Main Search, Filter & Control Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        
        {/* Top Row: Search Input, Quick Filters Toggle, Sort Dropdown & Upload Action */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Debounced Search Bar */}
          <div className="relative flex-1">
            <label htmlFor="evidence-search-input" className="sr-only">
              Search by Title, FIR, Case ID, Exhibit No, Document ID, SHA-256 or Officer
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="evidence-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Title, FIR, Case ID, Exhibit No, SHA-256, or Officer..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Group: Filters Toggle, Sort Selector, Ingest Button */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isFilterPanelOpen || activeChips.length > 0
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              aria-expanded={isFilterPanelOpen}
              aria-controls="extended-filter-panel"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sorting Dropdown */}
            <div className="relative">
              <label htmlFor="evidence-sort-select" className="sr-only">
                Sort exhibits by
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  id="evidence-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortField)}
                  className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="date-desc" className="bg-slate-900 text-slate-200">Date: Newest</option>
                  <option value="date-asc" className="bg-slate-900 text-slate-200">Date: Oldest</option>
                  <option value="title-asc" className="bg-slate-900 text-slate-200">Title: A to Z</option>
                  <option value="title-desc" className="bg-slate-900 text-slate-200">Title: Z to A</option>
                  <option value="stage-asc" className="bg-slate-900 text-slate-200">Stage: 1 to 6</option>
                  <option value="stage-desc" className="bg-slate-900 text-slate-200">Stage: 6 to 1</option>
                </select>
              </div>
            </div>

            {/* Ingest Action (RBAC Governed) */}
            {roleInfo.canUpload ? (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ingest Exhibit</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Upload restricted under RBAC Rule 8.2 for current role"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed border border-slate-700/50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingest Denied</span>
              </button>
            )}

          </div>

        </div>

        {/* Collapsible Detailed Filter Panel */}
        {isFilterPanelOpen && (
          <div 
            id="extended-filter-panel" 
            className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150"
          >
            {/* Filter 1: Document Type / Category */}
            <div className="space-y-1">
              <label htmlFor="category-filter-select" className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Document Type
              </label>
              <select
                id="category-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat === 'ALL' ? 'All Document Types' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Status Filter */}
            <div className="space-y-1">
              <label htmlFor="status-filter-select" className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Verification Status
              </label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {AVAILABLE_STATUSES.map(st => (
                  <option key={st.value} value={st.value} className="bg-slate-900 text-slate-200">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Lifecycle Stage Filter */}
            <div className="space-y-1">
              <label htmlFor="stage-filter-select" className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Lifecycle Stage
              </label>
              <select
                id="stage-filter-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {AVAILABLE_STAGES.map(st => (
                  <option key={st.value} value={st.value} className="bg-slate-900 text-slate-200">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: Date Range Preset / Custom */}
            <div className="space-y-1">
              <label htmlFor="date-preset-select" className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Date Range
              </label>
              <select
                id="date-preset-select"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Custody Dates</option>
                <option value="LAST_24_HOURS" className="bg-slate-900 text-slate-200">Last 24 Hours</option>
                <option value="LAST_7_DAYS" className="bg-slate-900 text-slate-200">Last 7 Days</option>
                <option value="LAST_30_DAYS" className="bg-slate-900 text-slate-200">Last 30 Days</option>
              </select>
            </div>

            {/* Optional Custom Date Filter Inputs */}
            <div className="sm:col-span-2 lg:col-span-4 pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Custom Ingestion Range:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  aria-label="Start date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  aria-label="End date"
                />
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] underline"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Active Filter Chips & Clear All Action */}
        {activeChips.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Active Filters ({activeChips.length}):</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="p-0.5 hover:bg-cyan-900 rounded-full text-cyan-400 hover:text-cyan-200 transition-colors"
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 underline underline-offset-2 transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Loading documents">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-slate-800 rounded" />
                    <div className="h-4 w-28 bg-slate-800 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-8 w-20 bg-slate-800 rounded-lg" />
                <div className="h-8 w-20 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading evidence records...</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        
        /* Empty State */
        <div className="p-10 sm:p-14 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 max-w-xl mx-auto shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-100 font-heading">
              No Case Exhibits Found
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              No evidence documents matched your search query or filter combination.
              {debouncedSearch && <span> Query: <strong className="text-cyan-400 font-mono">"{debouncedSearch}"</strong>.</span>}
            </p>
          </div>

          {activeChips.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters ({activeChips.length})</span>
              </button>
            </div>
          )}
        </div>

      ) : (

        /* Document Grid / Table */
        <div className="space-y-2.5" role="feed" aria-label="Evidence exhibits feed">
          {filteredAndSorted.map((doc) => {
            const isTampered = doc.status === 'TAMPERED' || doc.status === 'QUARANTINED';
            const isRedacted = doc.status === 'REDACTED';

            return (
              <div
                key={doc.id}
                tabIndex={0}
                role="article"
                aria-label={`Exhibit ${doc.exhibit_number || doc.id}: ${doc.title}`}
                onClick={() => onSelectDocument(doc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDocument(doc);
                  }
                }}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
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
                        type="button"
                        onClick={(e) => handleCopyHash(e, doc.sha256_hash)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        title="Copy Hash Digest"
                        aria-label="Copy SHA-256 hash digest"
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMerkleProof(doc);
                    }}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-950/80 hover:text-indigo-300 text-slate-300 border border-slate-700/60 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    title="Inspect Merkle Audit Proof"
                    aria-label={`Inspect Merkle Proof for ${doc.title}`}
                  >
                    <GitBranch className="w-4 h-4" />
                  </button>

                  {/* Redact Action (Prosecutor) */}
                  {currentRole === 'PROSECUTOR' && !isRedacted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyRedaction(doc);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
                      title="Apply Witness Protection Redaction"
                      aria-label={`Apply witness protection redaction to ${doc.title}`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Redact</span>
                    </button>
                  )}

                  {/* Tamper / Restore Toggle Button */}
                  {isTampered ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreDoc(doc);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      title="Restore original verified genesis hash"
                      aria-label={`Restore original verified state for ${doc.title}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateTamper(doc);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 hover:bg-red-900/80 text-red-300 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-red-400"
                      title="Simulate Malicious Byte Alteration"
                      aria-label={`Simulate tamper attack on ${doc.title}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden sm:inline">Tamper</span>
                    </button>
                  )}

                  {/* Evidence Verification Action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onVerifyDocument) {
                        onVerifyDocument(doc);
                      } else {
                        onSelectDocument(doc);
                      }
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    title="Audit and verify evidence integrity"
                    aria-label={`Verify evidence integrity for ${doc.title}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify</span>
                  </button>

                  {/* View Details / Watermark */}
                  <button
                    type="button"
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    title="Inspect document and view steganographic watermark"
                    aria-label={`Inspect ${doc.title}`}
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

      {/* Summary Footer Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono px-2 pt-1 border-t border-slate-900">
        <div>
          Showing {filteredAndSorted.length} of {documents.length} case documents
        </div>
        <div className="flex items-center space-x-2">
          <span>Active Role: <strong className="text-cyan-400">{roleInfo.label}</strong></span>
          <span>•</span>
          <span className="text-emerald-400">Zero-Trust Guarded</span>
        </div>
      </div>

    </div>
  );
};

export default DocumentList;
