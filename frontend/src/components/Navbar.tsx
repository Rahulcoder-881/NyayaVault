import React from 'react';
import type { UserRole } from '../types';
import { USER_ROLES } from '../constants';
import { 
  Shield, 
  ChevronDown, 
  AlertTriangle, 
  FileCheck, 
  RotateCcw, 
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  integrityScore: number;
  quarantineCount: number;
  onOpenTamperModal: () => void;
  onOpenCertModal: () => void;
  onRestoreAll: () => void;
  onOpenAISearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  integrityScore,
  quarantineCount,
  onOpenTamperModal,
  onOpenCertModal,
  onRestoreAll,
  onOpenAISearch
}) => {
  const activeRoleInfo = USER_ROLES[currentRole];
  const isCompromised = quarantineCount > 0 || integrityScore < 100;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#060a14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Case Badge */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent font-heading">
                NyayaVault
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                BSA 2023 // SEC 63
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">FIR 402/2026</span>
              <span>•</span>
              <span className="truncate max-w-[170px] sm:max-w-[280px]">State v. Vikram Malhotra (Special Cell)</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Integrity Pill & Fast Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Integrity Metric Pill */}
          <div className={`hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md transition-all ${
            isCompromised
              ? 'bg-red-950/70 border-red-500/60 text-red-300 pulse-tampered'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isCompromised ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-bold">INTEGRITY: {integrityScore}%</span>
            {quarantineCount > 0 && (
              <span className="bg-red-500 text-white px-1.5 py-0.2 rounded font-sans text-[10px]">
                {quarantineCount} QUARANTINED
              </span>
            )}
          </div>

          {/* AI Legal Intelligence Button */}
          <button
            onClick={onOpenAISearch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium transition-all shadow-sm group"
            title="Semantic Legal Search & Section 161 Contradiction Detector"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Legal AI & Contradictions</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Tamper Simulation / Recovery Action */}
          {isCompromised ? (
            <button
              onClick={onRestoreAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Ledger</span>
            </button>
          ) : (
            <button
              onClick={onOpenTamperModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900/80 text-red-300 text-xs font-medium transition-all shadow-sm"
              title="Simulate Malicious Byte Alteration Attack"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Simulate Tamper</span>
            </button>
          )}

          {/* Generate Sec 63 BSA Cert */}
          <button
            onClick={onOpenCertModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all"
            title="Generate Court Admissible Section 63 BSA 2023 Electronic Certificate"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sec 63 BSA Certificate</span>
            <span className="lg:hidden">Sec 63</span>
          </button>

          {/* RBAC Persona Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 pl-2.5 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs transition-all">
              <span className="text-base">{activeRoleInfo.avatarIcon}</span>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-100 leading-tight">{activeRoleInfo.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{activeRoleInfo.badge}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors ml-1" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#090e1c] border border-slate-700/80 shadow-2xl p-2 hidden group-hover:block z-50 backdrop-blur-2xl">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                Switch Role-Based Persona (RBAC)
              </div>
              <div className="space-y-1 mt-1">
                {(Object.keys(USER_ROLES) as UserRole[]).map((roleKey) => {
                  const r = USER_ROLES[roleKey];
                  const isSelected = r.role === currentRole;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => onSelectRole(r.role)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <span className="text-xl mt-0.5">{r.avatarIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">{r.label}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{r.badge}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{r.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{r.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
