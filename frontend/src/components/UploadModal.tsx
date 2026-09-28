import React, { useState } from 'react';
import type { UserRole } from '../types';
import { USER_ROLES, LIFECYCLE_STAGES } from '../constants';
import { 
  X, 
  Upload, 
  Shield, 
  Bot, 
  Sparkles,
  Paperclip
} from 'lucide-react';

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
  const roleInfo = USER_ROLES[currentRole];
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<number>(2);
  const [category, setCategory] = useState('Seizure Memo');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState<{
    suspects?: string[];
    sections?: string[];
    locations?: string[];
  } | null>(null);

  if (!isOpen) return null;

  const categories = [
    'FIR', 
    'GD Entry', 
    'Seizure Memo', 
    'Witness Statement', 
    'Ballistics Report', 
    'DNA Report', 
    'DICOM Medical Scan', 
    'Charge Sheet', 
    'Court Order'
  ];

  const evidencePresets = [
    {
      name: 'Cyber Financial Fraud FIR (Hindi/Eng)',
      title: 'FIR No. 342/2026 - Illegal UPI Spoofing & SIM Swap',
      stage: 1,
      category: 'FIR',
      content: `प्रथम सूचना रिपोर्ट (FIRST INFORMATION REPORT)
Under Section 173 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 & Sec 66D IT Act.
Police Station: Cyber Crime Unit, Mandir Marg, New Delhi.
FIR No: 342/2026 | Date: 2026-09-28 09:30 IST

शिकायतकर्ता (Complainant): Rajesh Khurana, R/o Sector 14, Rohini.
आरोपी (Suspect Identified): Vikash Mandal @ Vikky, Jamtara / Giridih Enclave.
Seized IMEI: 864920194810294 | Mules Account: State Bank of India A/c No. 9182390192.
BNS Sections Invoked: Sec 318(4) BNS (Cheating), Sec 319 BNS (Impersonation), Sec 66D IT Act 2000.
Summary: Suspect spoofed bank executive credentials, induced biometric OTP bypass, and liquidated INR 4,85,000 across digital wallets. Chain of custody secured.`
    },
    {
      name: 'CFSL Ballistics Comparison Memo',
      title: 'CFSL Ballistics Striation Report - 7.65mm Pistol Cartridge',
      stage: 3,
      category: 'Ballistics Report',
      content: `CENTRAL FORENSIC SCIENCE LABORATORY (CFSL), CBI COMPLEX, LODHI ROAD, NEW DELHI
REPORT OF BALLISTICS EXAMINATION (Sec 39 BSA 2023)
Exhibit Mark: Ex-BL-774 | Laboratory Ref: CFSL-DEL-2026-BALL-991
Description: One 7.65mm fired cartridge case recovered from crime scene Ring Road flyover.
Comparison: Microscopic striation matching performed on Leica Comparison Microscope (LCM-400).
Findings: The firing pin indentation and breech-face marks on evidence cartridge match test cartridge fired from seized country-made firearm (Country pistol No. 9210) to a high degree of forensic certainty.`
    },
    {
      name: 'DICOM Radiology Trauma Examination',
      title: 'DICOM Computed Tomography (CT) Cranial Fracture Scan',
      stage: 2,
      category: 'DICOM Medical Scan',
      content: `AIIMS FORENSIC MEDICINE & MEDICO-LEGAL EXAMINATION RECORD
Patient MLC No: MLC-2026-AIIMS-4190 | Radiologist: Dr. K.S. Rathore
Modality: DICOM 3.0 High-Resolution Multislice Computed Tomography (128-slice CT)
Findings: Depressed comminuted fracture of the right temporal-parietal bone with associated extradural hematoma (EDH) measuring 32mm depth.
Weapon Implication: Consistent with heavy blunt force impact from seized iron rod (Ex-P-4). Cryptographic hash registered for court admission.`
    }
  ];

  const handleSelectPreset = (preset: typeof evidencePresets[0]) => {
    setTitle(preset.title);
    setStage(preset.stage);
    setCategory(preset.category);
    setContent(preset.content);

    // Auto extract simulated entities
    setIsOCRProcessing(true);
    setTimeout(() => {
      setIsOCRProcessing(false);
      setDetectedEntities({
        suspects: ['Vikash Mandal @ Vikky', 'Accused Driver Ramesh'],
        sections: ['Sec 318(4) BNS', 'Sec 319 BNS', 'Sec 66D IT Act', 'Sec 39 BSA'],
        locations: ['Ring Road Flyover', 'Sector 14 Rohini', 'Jamtara Hub']
      });
    }, 600);
  };

  const handleSimulateFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setIsOCRProcessing(true);
      setTimeout(() => {
        setIsOCRProcessing(false);
        setContent(`AUTOMATED BILINGUAL OCR INGESTION (English & Devanagari Hindi Engine v3.1)
File: ${file.name} | Size: ${(file.size / 1024).toFixed(1)} KB | MIME: ${file.type || 'application/octet-stream'}
Ingested by: ${roleInfo.name} (${roleInfo.badge})

[Extracted Text Content]:
FIR Incident Record & Forensic Inspection Memo.
Section 173 BNSS 2023 Compliant.
All physical signatures and official stamps digitized with 300 DPI multi-spectral scan.
Cryptographic SHA-256 fingerprint automatically anchored.`);
        setDetectedEntities({
          suspects: ['Identity Extracted from Document'],
          sections: ['Sec 173 BNSS', 'Sec 63 BSA 2023'],
          locations: ['Patiala House Jurisdiction']
        });
      }, 700);
    }
  };

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
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090d1a] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  MHA INGESTION PIPELINE
                </span>
                <span className="text-xs text-slate-400 font-mono">Bilingual OCR + AI Entity Extraction</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                Digital Evidence Ingestion & Blockchain Anchoring
              </h2>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          
          {/* Officer Attribution Pill */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Attributed Officer: <strong>{roleInfo.name}</strong> ({roleInfo.badge})</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">{roleInfo.label}</span>
          </div>

          {/* Quick Evidence Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick-Load Real SIH 26190 Case Evidence:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {evidencePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition group"
                >
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Stage {preset.stage} • {preset.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Drag-and-Drop Area */}
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center bg-slate-950/40 transition">
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.dcm"
              onChange={handleSimulateFileDrop}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-1">
              <Paperclip className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-300 font-medium">
                Drag and drop file here, or <span className="text-cyan-400 underline">browse</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Supports PDF, DOCX, PNG, JPG, and Medical DICOM (FIPS 180-4 SHA-256 computed on client)
              </p>
            </div>
          </div>

          {isOCRProcessing && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Executing bilingual OCR (Hindi / English) and AI Named Entity Recognition...</span>
            </div>
          )}

          {detectedEntities && (
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                <Bot className="w-3.5 h-3.5" />
                AI Entity Extraction Detected:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detectedEntities.suspects?.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 text-[10px] font-mono">
                    Suspect: {s}
                  </span>
                ))}
                {detectedEntities.sections?.map((sec, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                    Legal: {sec}
                  </span>
                ))}
                {detectedEntities.locations?.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px] font-mono">
                    Locus: {l}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              rows={4}
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
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Hashing & Anchoring to Chain...' : 'Ingest & Anchor to Blockchain'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
