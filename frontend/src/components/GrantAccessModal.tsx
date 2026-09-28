import React, { useState } from 'react';
import { 
  UserCheck, 
  X, 
  Clock, 
  ShieldAlert, 
  Key, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  Check, 
  Lock
} from 'lucide-react';
import type { UserRole } from '../types';

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentCaseId: string;
}

interface ActiveDelegation {
  id: string;
  granteeBadge: string;
  granteeName: string;
  granteeRole: string;
  categories: string[];
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED';
  token: string;
}

export const GrantAccessModal: React.FC<GrantAccessModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentCaseId
}) => {
  const [granteeBadge, setGranteeBadge] = useState<string>('CFSL-DEL-BALL-04');
  const [granteeName, setGranteeName] = useState<string>('Dr. Ananya Sen');
  const [granteeRole, setGranteeRole] = useState<string>('Forensic Scientist (CFSL)');
  const [ttlHours, setTtlHours] = useState<number>(24);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'FIR_RECORD',
    'BALLISTICS_REPORT',
    'SEIZURE_MEMO'
  ]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [successCreated, setSuccessCreated] = useState<boolean>(false);

  const [activeDelegations, setActiveDelegations] = useState<ActiveDelegation[]>([
    {
      id: 'DEL-8821',
      granteeBadge: 'DLS-PROS-0941',
      granteeName: 'Adv. Alok Trivedi',
      granteeRole: 'Special Public Prosecutor',
      categories: ['CHARGE_SHEET', 'WITNESS_STATEMENT'],
      expiresAt: '2026-09-29 18:00:00 UTC (In 16 hours)',
      status: 'ACTIVE',
      token: 'tok_mha_7f90e8b1c4a9'
    }
  ]);

  if (!isOpen) return null;

  const isAuthorized = currentRole === 'SHO_ADMIN' || currentRole === 'SYS_ADMIN';

  const availableCategories = [
    { id: 'FIR_RECORD', label: 'FIR & General Diary' },
    { id: 'SEIZURE_MEMO', label: 'Recovery Panchnama' },
    { id: 'BALLISTICS_REPORT', label: 'CFSL Ballistics Report' },
    { id: 'DNA_REPORT', label: 'Forensic DNA Report' },
    { id: 'WITNESS_STATEMENT', label: 'Sec 180 Witness Deposition' },
    { id: 'CHARGE_SHEET', label: 'Sec 193 Charge Sheet' }
  ];

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!granteeName || selectedCategories.length === 0) return;

    const newDelegation: ActiveDelegation = {
      id: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      granteeBadge,
      granteeName,
      granteeRole,
      categories: selectedCategories,
      expiresAt: `${new Date(Date.now() + ttlHours * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19)} UTC (In ${ttlHours} hours)`,
      status: 'ACTIVE',
      token: `tok_mha_${Math.random().toString(36).substring(2, 12)}`
    };

    setActiveDelegations([newDelegation, ...activeDelegations]);
    setSuccessCreated(true);
    setTimeout(() => setSuccessCreated(false), 3000);
  };

  const handleRevoke = (id: string) => {
    setActiveDelegations(activeDelegations.filter(d => d.id !== id));
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  SECTION 1.4 & 8.2 COMPLIANCE
                </span>
                <span className="text-xs text-slate-400">Time-Bound Case Access Delegation</span>
              </div>
              <h2 className="text-lg font-bold text-white">Delegated Evidence Access & Auto-Expiry Links</h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Restriction Warning if not SHO/Admin */}
        {!isAuthorized ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Access Delegation Restricted (Rule 8.2)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Under statutory RBAC policies, only the <strong>Station House Officer (SHO / Senior Admin)</strong> or <strong>System Administrator</strong> possesses the authority to grant case permissions to external agency personnel.
            </p>
            <p className="text-[11px] text-amber-400 font-mono">
              Switch role to SHO (ACP Devendra Shekhawat) via the Officer Auth Modal to authorize delegations.
            </p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
            
            {/* Form */}
            <form onSubmit={handleGrantAccess} className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Grant Time-Limited Evidence Access Link
                </span>
                <span className="text-xs font-mono text-slate-400">Case Ref: {currentCaseId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Grantee Official Name</label>
                  <input
                    type="text"
                    value={granteeName}
                    onChange={(e) => setGranteeName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Dr. Ananya Sen"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Badge / Officer ID</label>
                  <input
                    type="text"
                    value={granteeBadge}
                    onChange={(e) => setGranteeBadge(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="e.g. CFSL-DEL-BALL-04"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Grantee Agency / Designation</label>
                  <input
                    type="text"
                    value={granteeRole}
                    onChange={(e) => setGranteeRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Forensic Ballistics Specialist"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Automatic Expiry Window (TTL)</label>
                  <select
                    value={ttlHours}
                    onChange={(e) => setTtlHours(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 Hour (Urgent Inspection)</option>
                    <option value={12}>12 Hours (Same Day Shift)</option>
                    <option value={24}>24 Hours (Standard Examination)</option>
                    <option value={72}>72 Hours (3 Days Lab Testing)</option>
                    <option value={168}>7 Days (Court Trial Period)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  Permitted Evidence Categories (Select All That Apply):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition ${
                          isChecked 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {successCreated && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Time-limited delegation link generated and logged to audit trail!</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Issue Delegated Access Token
                </button>
              </div>
            </form>

            {/* Active Delegations Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active Delegations for this Case ({activeDelegations.length})
                </h3>
                <span className="text-[11px] text-slate-400">Auto-expires via background TTL daemon</span>
              </div>

              <div className="space-y-2">
                {activeDelegations.map((del) => (
                  <div 
                    key={del.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{del.granteeName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">({del.granteeBadge})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {del.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {del.granteeRole} • Categories: {del.categories.join(', ')}
                      </div>
                      <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Valid Until: {del.expiresAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => copyToken(del.token)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 transition"
                      >
                        {copiedToken === del.token ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedToken === del.token ? 'Copied' : 'Copy Token'}
                      </button>
                      <button
                        onClick={() => handleRevoke(del.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition"
                        title="Revoke Permission Immediately"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
