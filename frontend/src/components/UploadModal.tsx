import React, { useState } from 'react';
import { UserRole, LifecycleStageId } from '../types';
import { USER_ROLES, LIFECYCLE_STAGES } from '../constants';
import { X, Upload, FileText, CheckCircle2, Shield } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUpload: (data: {
    title: string;
    stage: number;
    category: string;
    content: string;
    uploader_name: string;
    uploader_role: UserRole;
    badge_id: string;
  }) => Promise<any>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onUpload
}) => {
  if (!isOpen) return null;

  const roleInfo = USER_ROLES[currentRole];
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<number>(2);
  const [category, setCategory] = useState('Seizure Memo');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['FIR', 'GD Entry', 'Seizure Memo', 'Witness Statement', 'Forensic Report', 'DNA Report', 'Charge Sheet', 'Court Order'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsUploading(true);
    try {
      await onUpload({
        title,
        stage,
        category,
        content,
        uploader_name: roleInfo.name,
        uploader_role: currentRole,
        badge_id: roleInfo.badge
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090d1a] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                Digital Evidence Ingestion
              </h2>
              <p className="text-xs text-cyan-400 font-mono">
                Immediate FIPS 180-4 SHA-256 Hashing & Merkle Anchoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Officer Attribution Pill */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Attributed Uploader: <strong>{roleInfo.name}</strong> ({roleInfo.badge})</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">{roleInfo.label}</span>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
              Document / Exhibit Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CCTV Recovery Panchnama at Ring Road Flyover"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
                Lifecycle Custody Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    Stage {s.id}: {s.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
                Legal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
              Document Content / Legal Deposition Text
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official statement, panchnama description, or scientific findings..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Hashing & Anchoring...' : 'Ingest & Anchor Hash'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
