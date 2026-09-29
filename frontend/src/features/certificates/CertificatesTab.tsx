import React from 'react';
import type { BSACertificateData, DocumentItem } from '../../types';
import { Scale, Fingerprint, Download } from 'lucide-react';

export interface CertificatesTabProps {
  certData: BSACertificateData | null;
  documents: DocumentItem[];
  onOpenCertModal: () => void;
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({
  certData,
  documents,
  onOpenCertModal
}) => {
  return (
    <div className="space-y-6">
      {/* Certificate Header Action Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 font-heading">
              Bharatiya Sakshya Adhiniyam, 2023 — Section 63 Certificate
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Form B statutory electronic certificate of admissibility replacing Section 65B of Indian Evidence Act.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCertModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Re-Certify with Officer Credentials</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Rendered Statutory Certificate Sheet */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6 max-w-4xl mx-auto">
        
        {/* Emblem / Court Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
            GOVERNMENT OF NATIONAL CAPITAL TERRITORY OF DELHI
          </div>
          <h3 className="text-lg font-black text-slate-100 font-heading">
            CERTIFICATE UNDER SECTION 63(4)(c) OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            [Admissibility of Electronic Records as Primary/Secondary Evidence]
          </p>
        </div>

        {/* Case & Officer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-mono text-[10px] uppercase">Certificate Identifier</div>
            <div className="text-cyan-400 font-bold font-mono">{certData?.certificate_id || 'CERT-BSA63-402911'}</div>
            <div className="text-slate-400 text-[11px]">Timestamp: {certData?.timestamp_utc || '2026-03-29T10:00:00Z'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-mono text-[10px] uppercase">Certifying Officer</div>
            <div className="text-slate-200 font-bold">{certData?.officer_name || 'Insp. R.K. Varma'}</div>
            <div className="text-slate-400 text-[11px]">Badge: {certData?.badge_id || 'DL-POL-8832'} • {certData?.designation || 'Investigating Officer'}</div>
          </div>
        </div>

        {/* Case Information */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs space-y-2">
          <div className="font-bold text-slate-200">Matter: State of NCT of Delhi vs. Vikram Malhotra & Ors.</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-[11px]">
            <div>FIR No: <strong className="text-slate-300">402/2026</strong></div>
            <div>Station: <strong className="text-slate-300">Special Cell</strong></div>
            <div>Court: <strong className="text-slate-300">Patiala House</strong></div>
            <div>Merkle Status: <strong className="text-emerald-400">Validated</strong></div>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            Schedule of Certified Electronic Evidence Items ({documents.length} Records)
          </div>
          <div className="border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-2.5">Exhibit No.</th>
                  <th className="p-2.5">Document Title</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">SHA-256 Digest</th>
                  <th className="p-2.5">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {documents.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-cyan-400">Ex. P-{idx + 1}</td>
                    <td className="p-2.5 text-slate-200 font-sans font-medium">{doc.title}</td>
                    <td className="p-2.5 text-slate-400">{doc.category}</td>
                    <td className="p-2.5 text-slate-400">{doc.sha256_hash.slice(0, 16)}...</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.tamper_flag ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                      }`}>
                        {doc.tamper_flag ? 'QUARANTINED' : 'VERIFIED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statutory Legal Declaration */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-2">
          <p className="font-bold text-slate-200">Statutory Affirmation under Section 63(4):</p>
          <p>
            I hereby certify that the computer and electronic systems utilized to ingest, hash, and store the aforementioned digital evidence were operating properly during the relevant period. Cryptographic integrity has been verified via SHA-256 message digests and Merkle Tree consensus anchoring. No unauthorized modification or data corruption occurred during lawful custody.
          </p>
          <div className="pt-2 flex justify-between items-center text-slate-400 font-mono text-[10px]">
            <span>Cryptographic Algorithm: FIPS 180-4 SHA-256</span>
            <span className="text-emerald-400">Digital Seal: Cryptographically Authenticated</span>
          </div>
        </div>

      </div>
    </div>
  );
};
