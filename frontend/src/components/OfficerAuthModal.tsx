import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  Fingerprint
} from 'lucide-react';
import { USER_ROLES } from '../constants';
import type { UserRole, RoleInfo } from '../types';

interface OfficerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const OfficerAuthModal: React.FC<OfficerAuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole
}) => {
  const [selectedRoleKey, setSelectedRoleKey] = useState<UserRole>(currentRole);
  const [mfaCode, setMfaCode] = useState<string>('842915');
  const [authStep, setAuthStep] = useState<'SELECT' | 'MFA_CHALLENGE' | 'SUCCESS'>('SELECT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetRoleInfo: RoleInfo = USER_ROLES[selectedRoleKey];

  const handleStartMFA = (roleKey: UserRole) => {
    setSelectedRoleKey(roleKey);
    setAuthStep('MFA_CHALLENGE');
    setErrorMsg(null);
  };

  const handleVerifyMFA = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) {
      setErrorMsg('Please enter a valid 6-digit TOTP authentication code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    // Simulate cryptographic challenge verification and token signing
    setTimeout(() => {
      setIsVerifying(false);
      setAuthStep('SUCCESS');
      onSelectRole(selectedRoleKey);
      setTimeout(() => {
        onClose();
        setAuthStep('SELECT');
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/50 overflow-hidden text-slate-100">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  MHA • NCRB SECURE ACCESS
                </span>
                <span className="text-xs text-slate-400 font-mono">TLS 1.3 / FIPS 140-3</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Officer Authentication & Role-Based Access Control
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {authStep === 'SELECT' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Select Official Law Enforcement Persona</h3>
                  <p className="text-xs text-slate-400">
                    Switching roles re-evaluates zero-trust RBAC tokens, access boundaries, and dynamic watermarks.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  6 Enforced Roles
                </span>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {(Object.keys(USER_ROLES) as UserRole[]).map((key) => {
                  const role = USER_ROLES[key];
                  const isActive = currentRole === key;

                  return (
                    <div
                      key={key}
                      onClick={() => handleStartMFA(key)}
                      className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/30' 
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1 bg-slate-900 rounded-lg border border-slate-700">
                            {role.avatarIcon}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                              {role.label}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {role.name} • {role.badge}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {role.description}
                      </p>

                      {/* Permissions Pills */}
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          role.canUpload ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {role.canUpload ? 'Upload: Yes' : 'Upload: No'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          role.canGrantAccess ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {role.canGrantAccess ? 'Grant Access: Yes' : 'Grant: No'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          role.canMarkExhibits ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {role.canMarkExhibits ? 'Court Seal: Yes' : 'Court Seal: No'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Statutory Rule 8.2: Strict RBAC matrix active
                </span>
                <span className="font-mono text-slate-500">MHA Secure Gateway v2.4</span>
              </div>
            </div>
          )}

          {authStep === 'MFA_CHALLENGE' && (
            <form onSubmit={handleVerifyMFA} className="space-y-5">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-950/30 border border-blue-600/30">
                <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-700">
                  {targetRoleInfo.avatarIcon}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    Authenticating Target Identity
                  </div>
                  <div className="text-sm font-bold text-white">{targetRoleInfo.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Badge: {targetRoleInfo.badge} • Role: {targetRoleInfo.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthStep('SELECT')}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Enter 6-Digit Time-Based TOTP Code:
                  </label>
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-emerald-400 animate-pulse" /> Valid for 28s
                  </span>
                </div>
                
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="842915"
                  autoFocus
                />
                
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Demo Code: <strong className="text-slate-200 font-mono">842915</strong> (or any 6 digits)</span>
                  <button 
                    type="button" 
                    onClick={() => setMfaCode('842915')}
                    className="text-blue-400 hover:underline"
                  >
                    Quick-Fill Code
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <div className="font-semibold text-slate-300 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                  MHA Cryptographic Attestation
                </div>
                <p>
                  Upon successful MFA verification, an ECDSA secp256k1 signed session token with claim-based RBAC constraints will be bound to your current IP.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep('SELECT')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Token...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      Verify MFA & Assume Identity
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {authStep === 'SUCCESS' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">MFA Verification Confirmed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cryptographic session established for <strong className="text-white">{targetRoleInfo.name}</strong> ({targetRoleInfo.badge}). Loading RBAC policy...
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
