import React from 'react';
import type { CaseRecord, DocumentItem, LifecycleStageId } from '../../types';
import { LifecyclePipeline } from '../../components/LifecyclePipeline';
import { 
  Building,
  Scale, 
  ShieldCheck, 
  RotateCcw, 
  Copy, 
  Check, 
  Leaf, 
  Gavel, 
  Search, 
  ChevronRight, 
  Plus, 
  FileText, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export interface CaseCommandCenterProps {
  caseRecord: CaseRecord | null;
  documents: DocumentItem[];
  isLiveBackend: boolean;
  isEcoMode: boolean;
  activeStage: LifecycleStageId | null;
  copiedKey: string | null;
  hasTamperAlert: boolean;
  onCopy: (text: string, key: string) => void;
  onToggleEcoMode: () => void;
  onSyncApi: () => void;
  onSelectStage: (stage: LifecycleStageId | null) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenVerifyCase: () => void;
  onOpenCertificates: () => void;
  onOpenDocumentsTab: () => void;
  onOpenPipelineTab: () => void;
  onOpenAuditTab: () => void;
}

export const CaseCommandCenter: React.FC<CaseCommandCenterProps> = ({
  caseRecord,
  documents,
  isLiveBackend,
  isEcoMode,
  activeStage,
  copiedKey,
  hasTamperAlert,
  onCopy,
  onToggleEcoMode,
  onSyncApi,
  onSelectStage,
  onOpenSearch,
  onOpenUpload,
  onOpenVerifyCase,
  onOpenCertificates,
  onOpenDocumentsTab,
  onOpenPipelineTab,
  onOpenAuditTab
}) => {
  return (
    <div className="space-y-5">
      {/* Live Backend vs Demo Mode Label */}
      <div className={`w-full rounded-2xl p-3.5 sm:p-4 border backdrop-blur-md shadow-lg transition-all ${
        isLiveBackend 
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
          : 'bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveBackend ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isLiveBackend ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <div>
              <div className="font-bold font-mono tracking-wide text-xs sm:text-sm flex flex-wrap items-center gap-2">
                <span>{isLiveBackend ? 'LIVE ENTERPRISE BACKEND ACTIVE' : 'DEMO MODE ACTIVE (STANDALONE WEB PREVIEW)'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  isLiveBackend ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
                }`}>
                  {isLiveBackend ? 'FastAPI 0.110 + WSS Live' : 'In-Browser Web Crypto Engine'}
                </span>
              </div>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                {isLiveBackend 
                  ? 'Connected to local FastAPI backend on port 8000 • Live PostgreSQL consensus and WebSocket state active.' 
                  : 'Operating with client-side FIPS 180-4 SHA-256 Web Crypto Engine & simulated Merkle DAG for zero-latency hackathon evaluation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono text-[11px]">
            <button 
              onClick={onSyncApi}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
              title="Ping backend API to check connectivity"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominently Display Active Case Information */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Row: Case Identifiers & Court Seals */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Case ID with 1-click copy */}
            <button 
              onClick={() => onCopy(caseRecord?.case_id || 'CASE-2026-DEL-402', 'case_id')}
              className="group px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 shadow-inner flex items-center space-x-1.5 transition-all"
              title="Click to copy Case ID"
            >
              <span>{caseRecord?.case_id || 'CASE-2026-DEL-402'}</span>
              {copiedKey === 'case_id' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-300" />
              )}
            </button>

            {/* FIR Tag */}
            <span className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800/90 text-slate-200 border border-slate-700">
              FIR No. {caseRecord?.fir_number || '402/2026'}
            </span>

            {/* Police Station */}
            <span className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-300 bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{caseRecord?.police_station || 'Special Cell, Lodhi Colony'}</span>
            </span>

            {/* Current Lifecycle Stage Tag */}
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Stage {caseRecord?.current_stage || 5}: Judicial Presentation</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ISO 27001 // BSA 2023 §63</span>
            </span>
          </div>
        </div>

        {/* Center Row: Case Title & Statutory Charges */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Court of Sessions • Fast-Track Special Court</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-100 font-heading tracking-tight">
            State of NCT of Delhi vs. Vikram Malhotra & Ors.
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span>Court: <strong className="text-slate-100">{caseRecord?.court_name || 'Patiala House Courts Complex'}</strong> ({caseRecord?.jurisdiction || 'New Delhi'})</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              {caseRecord?.acts_sections || 'IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27'}
            </span>
          </div>
        </div>

        {/* Officers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-2 sm:pb-0 sm:pr-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Presiding Magistrate</div>
            <div className="font-bold text-slate-200 truncate">{caseRecord?.presiding_magistrate || 'Smt. Vandana Jain, ASJ-03'}</div>
            <div className="text-[10px] text-slate-400">Patiala House Courts Complex</div>
          </div>

          <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-2 sm:pb-0 sm:pr-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Investigating Officer</div>
            <div className="font-bold text-cyan-400 truncate">{caseRecord?.io_name || 'Insp. R.K. Varma'}</div>
            <div className="text-[10px] text-slate-400">Badge: {caseRecord?.io_badge || 'DL-POL-8832'}</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Public Prosecutor</div>
            <div className="font-bold text-slate-200 truncate">{caseRecord?.prosecutor_name || 'Adv. Alok Trivedi'}</div>
            <div className="text-[10px] text-slate-400">Directorate of Prosecution, Delhi</div>
          </div>
        </div>

        {/* Cryptographic Anchor & Eco-Mode Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px] overflow-hidden">
            <span className="text-slate-400 font-semibold shrink-0">Genesis Merkle Root:</span>
            <button
              onClick={() => onCopy(caseRecord?.merkle_root || '6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8', 'merkle_root')}
              className="group flex items-center space-x-1.5 text-cyan-400 font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 hover:border-cyan-500/40 transition-all truncate"
              title="Click to copy full 256-bit SHA-256 Merkle root"
            >
              <span className="truncate max-w-[200px] sm:max-w-md">
                {caseRecord?.merkle_root || '6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8'}
              </span>
              {copiedKey === 'merkle_root' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
              isEcoMode 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
            }`}>
              <Leaf className="w-3 h-3 mr-1" />
              {isEcoMode ? 'Eco-Mode Active (Low GPU)' : '3D WebGL Live'}
            </span>
            <button
              onClick={onToggleEcoMode}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              {isEcoMode ? 'Enable 3D Visualizer' : 'Switch to Eco-Mode'}
            </button>
          </div>
        </div>
      </section>

      {/* Primary Actions */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-cyan-400" />
              <span>Primary Case Command Center Actions</span>
            </h2>
            <p className="text-xs text-slate-300">
              Execute primary judicial evidentiary workflows with instant cryptographic integrity validation.
            </p>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/80 hidden md:block">
            Zero-Trust Audit Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Search Evidence */}
          <button
            onClick={onOpenSearch}
            className="p-3.5 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-indigo-950/40 hover:from-indigo-800/70 hover:to-indigo-900/50 text-white rounded-xl border border-indigo-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-indigo-950/30 group active:scale-95 text-left"
            title="Search exhibits, witness testimonies and contradictions with Legal AI"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-indigo-100 flex items-center gap-1">
                <span>Search Evidence</span>
                <ChevronRight className="w-3 h-3 text-indigo-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Legal AI & Semantic Scan</div>
            </div>
          </button>

          {/* Action 2: Upload Document */}
          <button
            onClick={onOpenUpload}
            className="p-3.5 bg-gradient-to-br from-cyan-900/60 via-slate-900 to-cyan-950/40 hover:from-cyan-800/70 hover:to-cyan-900/50 text-white rounded-xl border border-cyan-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-cyan-950/30 group active:scale-95 text-left"
            title="Ingest new evidentiary record or forensic file with 4-step wizard"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 text-cyan-300 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-cyan-100 flex items-center gap-1">
                <span>Upload Document</span>
                <ChevronRight className="w-3 h-3 text-cyan-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">4-Step Guided Ingestion</div>
            </div>
          </button>

          {/* Action 3: Verify Case */}
          <button
            onClick={onOpenVerifyCase}
            className="p-3.5 bg-gradient-to-br from-emerald-900/60 via-slate-900 to-emerald-950/40 hover:from-emerald-800/70 hover:to-emerald-900/50 text-white rounded-xl border border-emerald-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-emerald-950/30 group active:scale-95 text-left"
            title="Run real-time cryptographic audit across all case exhibits"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-emerald-100 flex items-center gap-1">
                <span>Verify Case</span>
                <ChevronRight className="w-3 h-3 text-emerald-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Consensus Integrity Audit</div>
            </div>
          </button>

          {/* Action 4: Generate Certificate */}
          <button
            onClick={onOpenCertificates}
            className="p-3.5 bg-gradient-to-br from-amber-900/60 via-slate-900 to-amber-950/40 hover:from-amber-800/70 hover:to-amber-900/50 text-white rounded-xl border border-amber-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-amber-950/30 group active:scale-95 text-left"
            title="Generate Bharatiya Sakshya Adhiniyam Section 63 electronic certificate"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-amber-100 flex items-center gap-1">
                <span>Generate Certificate</span>
                <ChevronRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Section 63 BSA 2023</div>
            </div>
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Documents */}
        <div 
          onClick={onOpenDocumentsTab}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Total Documents</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-cyan-400">{documents.length}</span>
            <span className="text-xs text-slate-400 font-sans">Exhibits Ingested</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Encrypted Envelope:</span>
            <span className="text-cyan-400">AES-256-GCM</span>
          </div>
        </div>

        {/* Card 2: Verified Documents */}
        <div 
          onClick={onOpenVerifyCase}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Verified Documents</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-emerald-400">
              {documents.filter(d => !d.tamper_flag && d.status === 'VERIFIED').length}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              {caseRecord?.integrity_score || 100}% PASS
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Cryptographic Proof:</span>
            <span className="text-emerald-400">FIPS 180-4 SHA-256</span>
          </div>
        </div>

        {/* Card 3: Pending Actions */}
        <div 
          onClick={onOpenPipelineTab}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Pending Actions</span>
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-amber-400">
              {documents.filter(d => d.status === 'ARCHIVED' || d.tamper_flag || d.stage === 4).length || 2}
            </span>
            <span className="text-xs text-slate-400 font-sans">Awaiting Sign-off</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Required Action:</span>
            <span className="text-amber-400">Forensic Scrutiny</span>
          </div>
        </div>

        {/* Card 4: Security Alerts */}
        <div 
          onClick={() => {
            if (hasTamperAlert) {
              onOpenVerifyCase();
            } else {
              onOpenAuditTab();
            }
          }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-md group space-y-2 ${
            hasTamperAlert 
              ? 'bg-red-950/30 border-red-500/50 hover:bg-red-950/50 animate-pulse' 
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Security Alerts</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
              hasTamperAlert ? 'bg-red-900/80 text-red-300 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono ${hasTamperAlert ? 'text-red-400' : 'text-slate-100'}`}>
              {caseRecord?.quarantine_count || 0}
            </span>
            <span className={`text-xs font-sans ${hasTamperAlert ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
              {hasTamperAlert ? 'Quarantine Enforced' : 'Zero Threats'}
            </span>
          </div>
          <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
            hasTamperAlert ? 'border-red-900/50 text-red-300' : 'border-slate-800/80 text-slate-400'
          }`}>
            <span>Zero-Trust Sentinel:</span>
            <span className={hasTamperAlert ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {hasTamperAlert ? 'BREACH DETECTED' : 'ARMED & MONITORING'}
            </span>
          </div>
        </div>
      </section>

      {/* 6-Stage Custody Lifecycle Stepper */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <LifecyclePipeline
          activeStage={activeStage}
          onSelectStage={onSelectStage}
          documents={documents}
        />
      </section>
    </div>
  );
};
