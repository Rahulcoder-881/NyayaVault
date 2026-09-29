import React, { useState } from 'react';
import type { UserRole } from '../types';
import { USER_ROLES } from '../constants';
import { 
  Shield, 
  ChevronDown, 
  AlertTriangle, 
  FileCheck, 
  RotateCcw, 
  Sparkles,
  BookOpen,
  Blocks,
  UserCheck,
  KeyRound,
  Leaf,
  Wrench,
  ShieldCheck,
  Award
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  integrityScore: number;
  quarantineCount: number;
  isEcoMode: boolean;
  onToggleEcoMode: () => void;
  onOpenTamperModal: () => void;
  onOpenCertModal: () => void;
  onRestoreAll: () => void;
  onOpenAISearch: () => void;
  onOpenDocsModal: () => void;
  onOpenBlockchainModal: () => void;
  onOpenGrantAccessModal: () => void;
  onOpenAuthModal: () => void;
  onOpenEvidenceVerifyModal?: () => void;
  onOpenPresentationTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({
  currentRole,
  onSelectRole,
  integrityScore,
  quarantineCount,
  isEcoMode,
  onToggleEcoMode,
  onOpenTamperModal,
  onOpenCertModal,
  onRestoreAll,
  onOpenAISearch,
  onOpenDocsModal,
  onOpenBlockchainModal,
  onOpenGrantAccessModal,
  onOpenAuthModal,
  onOpenEvidenceVerifyModal,
  onOpenPresentationTour
}) => {
  const activeRoleInfo = USER_ROLES[currentRole];
  const isCompromised = quarantineCount > 0 || integrityScore < 100;
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#060a14]/95 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Institutional Emblem, Title & Case Context */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="relative group cursor-pointer" onClick={onOpenDocsModal} title="National Digital Vault">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${isCompromised ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent font-heading">
                NyayaVault
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                MHA • NCRB DMS
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">FIR 402/2026</span>
              <span>•</span>
              <span className="truncate max-w-[150px] sm:max-w-[240px]">State v. Vikram Malhotra (Special Cell)</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Simplified Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Sustainable Eco Mode Toggle */}
          <button
            onClick={onToggleEcoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isEcoMode
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            title="Sustainable Simple Mode saves battery and CPU by streamlining views"
          >
            <Leaf className={`w-3.5 h-3.5 ${isEcoMode ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{isEcoMode ? 'Simple Mode' : 'Forensic Mode'}</span>
          </button>

          {/* Consensus Health Indicator */}
          <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md ${
            isCompromised
              ? 'bg-red-950/70 border-red-500/60 text-red-300 animate-pulse'
              : 'bg-slate-900/80 border-slate-700/60 text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isCompromised ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span>{integrityScore}% Verified</span>
          </div>

          {/* Quick Primary Action: Sec 63 BSA Certificate */}
          <button
            onClick={onOpenCertModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/25 transition-all"
            title="Generate Court Admissible Section 63 BSA 2023 Electronic Certificate"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sec 63 Certificate</span>
            <span className="sm:hidden">Cert</span>
          </button>

          {/* Evaluator Highlight: SIH 2026 Pitch Deck Tour */}
          {onOpenPresentationTour && (
            <button
              onClick={onOpenPresentationTour}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all border border-indigo-400/40"
              title="Launch interactive SIH 2026 pitch deck and live evaluator demo tour"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">SIH Pitch Deck</span>
              <span className="sm:hidden">Pitch</span>
            </button>
          )}

          {/* Consolidated Tools & Governance Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-300 text-xs font-medium transition-all"
              title="Open System Tools & Governance Menu"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isToolsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsToolsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#090e1c] border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    System Tools & Governance
                  </div>

                  <div className="space-y-1 mt-1">
                    {onOpenEvidenceVerifyModal && (
                      <button
                        onClick={() => { setIsToolsOpen(false); onOpenEvidenceVerifyModal(); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs flex items-center gap-2.5 transition border border-cyan-500/20 bg-cyan-950/20"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-white">Evidence Verification Suite</div>
                          <div className="text-[10px] text-cyan-300">5-Check Cryptographic & Custody Audit</div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => { setIsToolsOpen(false); onOpenDocsModal(); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs flex items-center gap-2.5 transition"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Technical Docs Suite</div>
                        <div className="text-[10px] text-slate-400">8 Chapters (PRD, Techspec, Schemas)</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsToolsOpen(false); onOpenBlockchainModal(); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs flex items-center gap-2.5 transition"
                    >
                      <Blocks className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Blockchain Explorer</div>
                        <div className="text-[10px] text-slate-400">Polygon POS Block #18,421,006</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsToolsOpen(false); onOpenAISearch(); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs flex items-center gap-2.5 transition"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Legal AI & Contradictions</div>
                        <div className="text-[10px] text-slate-400">Section 180 BNSS Testimonies</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsToolsOpen(false); onOpenGrantAccessModal(); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs flex items-center gap-2.5 transition"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Grant Access (SHO Only)</div>
                        <div className="text-[10px] text-slate-400">Time-limited shared case delegation</div>
                      </div>
                    </button>

                    <div className="pt-1 border-t border-slate-800">
                      {isCompromised ? (
                        <button
                          onClick={() => { setIsToolsOpen(false); onRestoreAll(); }}
                          className="w-full text-left p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2.5 transition border border-emerald-500/30"
                        >
                          <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-emerald-200">Restore Clean Ledger</div>
                            <div className="text-[10px] text-emerald-400">Revert simulated tamper corruptions</div>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => { setIsToolsOpen(false); onOpenTamperModal(); }}
                          className="w-full text-left p-2 rounded-xl hover:bg-red-950/40 text-red-300 text-xs flex items-center gap-2.5 transition"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-red-200">Simulate Tamper Attack</div>
                            <div className="text-[10px] text-red-400/80">Test zero-trust quarantine response</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Officer Persona & MFA Button */}
          <div className="relative group">
            <button 
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs transition-all"
              title="Click to Open MFA Authentication & Change Role"
            >
              <span className="text-base">{activeRoleInfo.avatarIcon}</span>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-100 leading-tight truncate max-w-[120px]">{activeRoleInfo.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{activeRoleInfo.badge}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#090e1c] border border-slate-700/80 shadow-2xl p-2 hidden group-hover:block z-50 backdrop-blur-2xl">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
                <span>Switch Role-Based Persona</span>
                <button 
                  onClick={onOpenAuthModal} 
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-sans font-semibold text-[10px]"
                >
                  <KeyRound className="w-3 h-3" /> MFA Login
                </button>
              </div>
              <div className="space-y-1 mt-1 max-h-[320px] overflow-y-auto">
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
});

