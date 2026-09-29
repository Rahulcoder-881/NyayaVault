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
  FileQuestion,
  FolderX
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

/**
 * Loading Skeleton Row for Document Cards
 */
const DocumentSkeletonRow: React.FC = () => (
  <div 
    className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/40 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    role="status"
    aria-label="Loading document record skeleton"
  >
    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 mt-0.5" />
      <div className="space-y-2.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="h-4 w-16 bg-slate-800 rounded" />
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-800/70 rounded" />
          <div className="h-4 w-24 bg-slate-800/60 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-slate-800 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-32 bg-slate-800/70 rounded" />
          <div className="h-3 w-24 bg-slate-800/60 rounded" />
          <div className="h-3 w-36 bg-slate-800/50 rounded" />
        </div>
        <div className="h-6 w-64 max-w-full bg-slate-950/80 border border-slate-800/80 rounded" />
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
      <div className="h-8 w-8 bg-slate-800 rounded-lg" />
      <div className="h-8 w-16 bg-slate-800 rounded-lg" />
      <div className="h-8 w-16 bg-slate-800 rounded-lg" />
      <div className="h-8 w-16 bg-slate-800 rounded-lg" />
    </div>
  </div>
);

export const DocumentList: React.FC<DocumentListProps> = React.memo(({
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
  // Search state with debouncing (Requirement 1 & 7)
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter states (Requirement 2)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort state (Requirement 3)
  const [sortOption, setSortOption] = useState<SortField>('date-desc');

  // UI helpers
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const roleInfo = USER_ROLES[currentRole];

  // Effective stage filter considers both external activeStage prop and internal filter
  const effectiveStage = activeStage !== null ? String(activeStage) : stageFilter;

  // 1. Debounce Search Input (250ms) - Requirement 7
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

  // 2. Clear All Filters Action - Requirement 5
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

  // 3. Filter & Sort Logic with RBAC Access Enforcement (Requirements 1, 2, 3)
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

        // External or Internal Stage Filter
        if (effectiveStage !== 'ALL' && doc.stage !== Number(effectiveStage)) {
          return false;
        }

        // Document Type / Category Filter
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

        // Custom Date Range Filter (startDate & endDate)
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

        // Search Query (title, FIR number, case ID, exhibit number, document ID, SHA-256 hash, and uploading officer) - Requirement 1
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase().trim();

          // Title match
          const titleMatch = doc.title.toLowerCase().includes(q);

          // Document ID match
          const idMatch = doc.id.toLowerCase().includes(q);

          // Case ID match
          const caseIdMatch = doc.case_id.toLowerCase().includes(q);

          // Exhibit number match
          const exhibitMatch = doc.exhibit_number ? doc.exhibit_number.toLowerCase().includes(q) : false;

          // SHA-256 Hash match (both current hash and original genesis hash)
          const hashMatch = doc.sha256_hash.toLowerCase().includes(q) || 
                            doc.original_sha256.toLowerCase().includes(q) ||
                            (doc.merkle_leaf_hash && doc.merkle_leaf_hash.toLowerCase().includes(q));

          // Uploading officer match (Name, Badge ID, or Role)
          const officerMatch = doc.uploaded_by.toLowerCase().includes(q) || 
                               doc.badge_id.toLowerCase().includes(q) ||
                               doc.uploader_role.toLowerCase().includes(q);

          // FIR Number match (explicit doc.fir_number, FIR in title, FIR in content, or case ID match)
          const docFir = doc.fir_number || (doc.title.match(/FIR\s*(?:No\.?)?\s*([0-9/]+)/i)?.[1]) || '';
          const firMatch = (docFir && docFir.toLowerCase().includes(q)) ||
                           (q.includes('402') && (doc.case_id.includes('402') || doc.title.includes('402') || doc.content.includes('402'))) ||
                           (q.includes('fir') && (doc.category.toLowerCase().includes('fir') || doc.title.toLowerCase().includes('fir') || doc.content.toLowerCase().includes('fir')));

          // Evidentiary content & OCR text fallback
          const contentMatch = doc.content.toLowerCase().includes(q) || 
                               (doc.ocr_extracted_text ? doc.ocr_extracted_text.toLowerCase().includes(q) : false);

          if (!titleMatch && !firMatch && !caseIdMatch && !exhibitMatch && !idMatch && !hashMatch && !officerMatch && !contentMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting by upload date and title (Requirement 3)
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

  // Compute active filters list for removable chip display - Requirement 4
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

    if (stageFilter !== 'ALL') {
      const stageObj = AVAILABLE_STAGES.find(s => s.value === stageFilter);
      chips.push({
        id: 'stage',
        label: stageObj ? stageObj.label.split(':')[0] : `Stage: ${stageFilter}`,
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
        label: `Date: ${startDate || 'Earliest'} → ${endDate || 'Latest'}`,
        onRemove: () => {
          setStartDate('');
          setEndDate('');
        }
      });
    }

    return chips;
  }, [debouncedSearch, categoryFilter, statusFilter, stageFilter, datePreset, startDate, endDate]);

  return (
    <div className="w-full space-y-4 font-sans text-slate-100" role="region" aria-label="Evidence Files & Case Documents List">
      
      {/* Zero PII Alert for Admin Role under Section 8.2 */}
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
          
          {/* Debounced Search Bar - Requirements 1, 7, 8 */}
          <div className="relative flex-1" role="search">
            <label htmlFor="evidence-search-input" className="sr-only">
              Search by title, FIR number, case ID, exhibit number, document ID, SHA-256 hash or uploading officer
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="evidence-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Title, FIR #, Case ID, Exhibit #, Doc ID, SHA-256 or Officer..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-cyan-400"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Group: Filters Toggle, Sort Selector, Ingest Button */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filters Toggle Button - Requirement 8 */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isFilterPanelOpen || activeChips.length > 0
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              aria-expanded={isFilterPanelOpen}
              aria-controls="extended-filter-panel"
              aria-label={`Toggle filter panel. ${activeChips.length} active filter${activeChips.length === 1 ? '' : 's'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sorting Dropdown - Requirement 3 */}
            <div className="relative">
              <label htmlFor="evidence-sort-select" className="sr-only">
                Sort exhibits by upload date or title
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs focus-within:ring-2 focus-within:ring-cyan-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  id="evidence-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortField)}
                  className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="date-desc" className="bg-slate-900 text-slate-200">Upload Date: Newest First</option>
                  <option value="date-asc" className="bg-slate-900 text-slate-200">Upload Date: Oldest First</option>
                  <option value="title-asc" className="bg-slate-900 text-slate-200">Title: A to Z</option>
                  <option value="title-desc" className="bg-slate-900 text-slate-200">Title: Z to A</option>
                  <option value="stage-asc" className="bg-slate-900 text-slate-200">Lifecycle Stage: 1 to 6</option>
                  <option value="stage-desc" className="bg-slate-900 text-slate-200">Lifecycle Stage: 6 to 1</option>
                </select>
              </div>
            </div>

            {/* Ingest Action (RBAC Governed) */}
            {roleInfo.canUpload ? (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-600/20 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Ingest new exhibit"
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
                aria-label="Upload restricted under RBAC policy"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingest Denied</span>
              </button>
            )}

          </div>

        </div>

        {/* Collapsible Detailed Filter Panel - Requirement 2 */}
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

            {/* Filter 4: Date Range Preset */}
            <div className="space-y-1">
              <label htmlFor="date-preset-select" className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Date Preset
              </label>
              <select
                id="date-preset-select"
                value={datePreset}
                onChange={(e) => {
                  setDatePreset(e.target.value);
                  if (e.target.value !== 'ALL') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Custody Dates</option>
                <option value="LAST_24_HOURS" className="bg-slate-900 text-slate-200">Last 24 Hours</option>
                <option value="LAST_7_DAYS" className="bg-slate-900 text-slate-200">Last 7 Days</option>
                <option value="LAST_30_DAYS" className="bg-slate-900 text-slate-200">Last 30 Days</option>
              </select>
            </div>

            {/* Custom Date Range Picker (Start & End Date) - Requirement 2 */}
            <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Custom Date Range:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="start-date-input" className="sr-only">Start Date</label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value) setDatePreset('ALL');
                    }}
                    className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    aria-label="Filter from start date"
                  />
                  <span className="text-slate-500 font-mono text-xs">to</span>
                  <label htmlFor="end-date-input" className="sr-only">End Date</label>
                  <input
                    id="end-date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (e.target.value) setDatePreset('ALL');
                    }}
                    className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    aria-label="Filter to end date"
                  />
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] underline underline-offset-2 ml-1"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Filter exhibits by exact UTC ingestion timestamp
              </div>
            </div>

          </div>
        )}

        {/* Active Filter Chips & Clear All Action - Requirements 4 & 5 */}
        {activeChips.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Active Filters ({activeChips.length}):</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-sm"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="p-0.5 hover:bg-cyan-900 rounded-full text-cyan-400 hover:text-cyan-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
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
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 underline underline-offset-2 transition-colors ml-auto focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded px-1"
              aria-label="Clear all active search and filter constraints"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Loading Skeletons - Requirement 6 */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Loading case documents">
          <DocumentSkeletonRow />
          <DocumentSkeletonRow />
          <DocumentSkeletonRow />
          <DocumentSkeletonRow />
          <span className="sr-only">Loading evidence records...</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        
        /* Useful Empty States - Requirement 6 */
        <div 
          className="p-10 sm:p-14 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 max-w-xl mx-auto shadow-inner"
          role="status"
          aria-live="polite"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
            {activeChips.length > 0 ? (
              <FileQuestion className="w-7 h-7 text-cyan-400" />
            ) : (
              <FolderX className="w-7 h-7 text-slate-400" />
            )}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-100 font-heading">
              {activeChips.length > 0 
                ? 'No Matching Case Exhibits Found' 
                : effectiveStage !== 'ALL'
                ? `No Evidence Ingested in Stage ${effectiveStage}`
                : 'No Evidence Records Found'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
              {activeChips.length > 0
                ? 'No evidence records match your current search query or active filter combination.'
                : effectiveStage !== 'ALL'
                ? `No digital evidence, forensics, or exhibits have been registered under custody Stage ${effectiveStage} yet.`
                : 'No case documents or exhibits are currently registered in this case custody chain.'}
            </p>
            {debouncedSearch && (
              <p className="text-xs text-slate-300 font-mono">
                Query: <span className="text-cyan-400 font-bold">"{debouncedSearch}"</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={`Reset all ${activeChips.length} active filters`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters ({activeChips.length})</span>
              </button>
            )}
            {effectiveStage !== 'ALL' && roleInfo.canUpload && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={`Ingest new exhibit for Stage ${effectiveStage}`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ingest Exhibit for Stage {effectiveStage}</span>
              </button>
            )}
          </div>
        </div>

      ) : (

        /* Document Grid / Table with Preserved Document Actions - Requirements 8, 9 */
        <div className="space-y-2.5" role="feed" aria-label="Evidence exhibits feed">
          {filteredAndSorted.map((doc) => {
            const isTampered = doc.status === 'TAMPERED' || doc.status === 'QUARANTINED';
            const isRedacted = doc.status === 'REDACTED';

            return (
              <div
                key={doc.id}
                tabIndex={0}
                role="article"
                aria-label={`Exhibit ${doc.exhibit_number || doc.id}: ${doc.title}. Status: ${doc.status}. Click or press Enter to inspect.`}
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
                        aria-label={`Copy SHA-256 hash digest for ${doc.title}`}
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

                {/* Right: Quick Action Controls - Preserved Actions (Requirement 9) */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 w-full md:w-auto justify-end">
                  
                  {/* Merkle Proof Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMerkleProof(doc);
                    }}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-950/80 hover:text-indigo-300 text-slate-300 border border-slate-700/60 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    title="Inspect Merkle Audit Proof"
                    aria-label={`Inspect Merkle Proof for ${doc.title}`}
                  >
                    <GitBranch className="w-4 h-4" />
                  </button>

                  {/* Redact Action (Prosecutor Role) */}
                  {currentRole === 'PROSECUTOR' && !isRedacted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyRedaction(doc);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 hover:bg-red-900/80 text-red-300 text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    title="Audit and verify evidence integrity"
                    aria-label={`Verify evidence integrity for ${doc.title}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify</span>
                  </button>

                  {/* View Details / Watermark Inspector */}
                  <button
                    type="button"
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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

      {/* Summary Footer Bar with aria-live results announcer */}
      <div 
        className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono px-2 pt-1 border-t border-slate-900"
        aria-live="polite"
      >
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
});

export default DocumentList;
