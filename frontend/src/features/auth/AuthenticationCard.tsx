import React from 'react';
import type { UserRole } from '../../types';
import { USER_ROLES } from '../../constants';

export interface AuthenticationCardProps {
  currentRole: UserRole;
  onOpenAuthModal: () => void;
  className?: string;
}

export const AuthenticationCard: React.FC<AuthenticationCardProps> = ({
  currentRole,
  onOpenAuthModal,
  className = ''
}) => {
  const roleData = USER_ROLES[currentRole];

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Authenticated Session</span>
        <button
          onClick={onOpenAuthModal}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
        >
          Switch Role
        </button>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
          {currentRole.slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-200">{roleData.name}</div>
          <div className="text-xs text-slate-400">{roleData.label}</div>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Permissions:</span>
          <span className="text-slate-300 font-mono">FIPS 140-3 Compliant</span>
        </div>
        <div className="flex justify-between">
          <span>Watermark:</span>
          <span className="text-emerald-400 font-mono">DL-POL-8832 (Active)</span>
        </div>
      </div>
    </div>
  );
};
