import React, { useState } from 'react';
import type { BSACertificateData, CaseRecord } from '../types';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BSACertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord | null;
  certificateData: BSACertificateData | null;
  onGenerate: (officerName: string, designation: string, badgeId: string) => Promise<any>;
}

export const BSACertificateModal: React.FC<BSACertificateModalProps> = ({
  isOpen,
  onClose,
  caseRecord,
  certificateData,
  onGenerate
}) => {
  if (!isOpen) return null;

  const [officerName, setOfficerName] = useState('Insp. R.K. Varma');
  const [designation, setDesignation] = useState('Chief Investigating Officer, Special Cell');
  const [badgeId, setBadgeId] = useState('DL-POL-8832');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(officerName, designation, badgeId);
      // Trigger celebratory confetti for hackathon wow effect!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090e1c] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                Section 63 BSA 2023 Electronic Evidence Certificate
              </h2>
              <p className="text-xs text-cyan-400 font-mono">
                Statutory Certificate of Admissibility (Supplanting Sec 65B Indian Evidence Act)
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

        {/* Certificate Generator Controls if not yet generated */}
        {!certificateData && (
          <div className="p-6 space-y-4 text-xs no-print">
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-slate-300 leading-relaxed text-xs">
              <span className="font-bold text-cyan-300">Statutory Mandate ({caseRecord?.case_id || 'CASE-2026-DEL-402'}):</span> Under Section 63(4)(c) of the Bharatiya Sakshya Adhiniyam, 2023, every electronic document, digital photo, ballistic scan, and seizure report must be accompanied by an official Certificate signed by the authorized digital custody officer affirming uncorrupted operation and hardware integrity.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Certifying Officer</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Official Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Badge / Police ID</label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isGenerating ? 'Compiling Cryptographic Signatures...' : 'Generate Official Statutory Certificate'}</span>
            </button>
          </div>
        )}

        {/* Certificate Document (Print-ready & Visually Stunning) */}
        {certificateData && (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Statutory Certificate Validated & Ready for Court Filing</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Certificate</span>
                </button>
              </div>
            </div>

            {/* Official Legal Parchment View */}
            <div className="p-8 rounded-xl bg-white text-slate-900 shadow-xl font-serif text-xs leading-relaxed border-4 border-double border-slate-800">
              
              {/* Emblem / Court Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
                <div className="font-sans font-bold text-sm tracking-widest uppercase text-slate-800 mb-1">
                  GOVERNMENT OF NCT OF DELHI // DELHI POLICE SPECIAL CELL
                </div>
                <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-950">
                  IN THE COURT OF THE PRINCIPAL DISTRICT & SESSIONS JUDGE, PATIALA HOUSE COURTS, NEW DELHI
                </h1>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  STATE (NCT OF DELHI) vs. VIKRAM MALHOTRA & ORS.
                </div>
                <div className="font-mono text-[11px] text-slate-600 mt-1">
                  FIR NO.: {certificateData.fir_number} | POLICE STATION: {certificateData.police_station}
                </div>
                <div className="font-sans text-[11px] font-medium text-slate-600">
                  CHARGES: {certificateData.acts_sections}
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-y border-slate-900 py-1.5 inline-block px-6">
                  CERTIFICATE UNDER SECTION 63 BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
                </h2>
                <div className="font-sans text-[10px] text-slate-600 mt-0.5">
                  (Supplanting Section 65B of the Indian Evidence Act, 1872)
                </div>
              </div>

              {/* Certificate Body Text */}
              <div className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed mb-6 space-y-3">
                <p>
                  I, <strong>{certificateData.officer_name}</strong>, Designation: <strong>{certificateData.designation}</strong>, 
                  Badge ID: <strong>{certificateData.badge_id}</strong>, being the officer in lawful custody of the computer 
                  infrastructure and evidence repository at the Cyber Operations Division, do hereby solemnly affirm and declare:
                </p>
                <p>
                  1. Throughout the investigation of FIR {certificateData.fir_number}, the NyayaVault Zero-Trust Digital Custody System 
                  operated continuously without interruption, adhering to ISO/IEC 27001:2022 standards and Ministry of Home Affairs guidelines.
                </p>
                <p>
                  2. All electronic records listed in Schedule 'A' were generated in the ordinary course of official duty, 
                  and the cryptographic integrity has remained uncorrupted.
                </p>
              </div>

              {/* Schedule A Table */}
              <div className="my-6">
                <div className="font-sans font-bold text-xs uppercase text-slate-900 mb-2">
                  SCHEDULE 'A': CERTIFIED ELECTRONIC DOCUMENT MANIFEST & SHA-256 DIGESTS
                </div>
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left font-sans text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                        <th className="p-1.5 border-r border-slate-300">Exhibit</th>
                        <th className="p-1.5 border-r border-slate-300">Document Title</th>
                        <th className="p-1.5 border-r border-slate-300">Category</th>
                        <th className="p-1.5 font-mono">Cryptographic SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificateData.documents_certified.map((doc, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="p-1.5 font-bold font-mono border-r border-slate-300">{doc.exhibit_number}</td>
                          <td className="p-1.5 font-medium border-r border-slate-300">{doc.title}</td>
                          <td className="p-1.5 border-r border-slate-300">{doc.category}</td>
                          <td className="p-1.5 font-mono text-[9px] break-all">{doc.sha256_hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Seal Box */}
              <div className="mt-8 pt-4 border-t-2 border-slate-900 flex items-end justify-between font-sans">
                <div className="space-y-1 text-[10px] text-slate-700">
                  <div><strong>Certificate ID:</strong> {certificateData.certificate_id}</div>
                  <div><strong>Case Root Merkle Hash:</strong> <span className="font-mono">{certificateData.merkle_root.substring(0, 28)}...</span></div>
                  <div><strong>Timestamp (UTC):</strong> {certificateData.timestamp_utc}</div>
                  <div><strong>Composite Manifest Hash:</strong> <span className="font-mono">{certificateData.manifest_master_hash.substring(0, 24)}...</span></div>
                </div>

                <div className="text-right space-y-1">
                  <div className="w-16 h-16 ml-auto border-2 border-slate-800 rounded-lg p-1 bg-slate-50 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="font-bold text-xs text-slate-950 mt-2">{certificateData.officer_name}</div>
                  <div className="text-[10px] text-slate-600">{certificateData.designation}</div>
                  <div className="text-[10px] font-mono text-slate-500">DIGITAL SIGNATURE ATTACHED</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
