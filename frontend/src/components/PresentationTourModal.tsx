import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Scale, 
  GitFork, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Layers, 
  Zap,
  Lock,
  Building
} from 'lucide-react';

interface PresentationTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateTamper: () => void;
  onOpenCertModal: () => void;
  onOpenMerkleModal: () => void;
  onOpenAIModal: () => void;
}

export const PresentationTourModal: React.FC<PresentationTourModalProps> = ({
  isOpen,
  onClose,
  onSimulateTamper,
  onOpenCertModal,
  onOpenMerkleModal,
  onOpenAIModal
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => Math.min(prev + 1, 5));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slides = [
    {
      badge: "SLIDE 1 // PROBLEM STATEMENT & NATIONAL SIGNIFICANCE",
      title: "The Crisis of Electronic Evidence Admissibility in Indian Courts",
      icon: <Scale className="w-6 h-6 text-amber-400" />,
      color: "amber",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Under the <strong className="text-cyan-400">Bharatiya Sakshya Adhiniyam (BSA) 2023</strong>, electronic records hold primary evidentiary status. Yet, over 64% of digital evidence faces admissibility challenges due to broken physical chain-of-custody paper logs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="text-red-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Vulnerabilities in Status Quo</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li>Paper registers vulnerable to backdating & loss</li>
                <li>Undetected bit-level tampering in police transit</li>
                <li>Leaked charge sheets & victim PII to media</li>
                <li>Manual, slow Section 65B / 63 paper affidavits</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>The NyayaVault Paradigm</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li>Instant FIPS 180-4 SHA-256 client & server hashing</li>
                <li>Hierarchical Merkle DAG root consensus</li>
                <li>Steganographic zero-width forensic attribution</li>
                <li>Automated 1-click Section 63 BSA certificates</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      badge: "SLIDE 2 // SYSTEM ARCHITECTURE & CRYPTOGRAPHY",
      title: "Zero-Trust Cryptographic Core & Polygon Ledger Anchoring",
      icon: <Lock className="w-6 h-6 text-cyan-400" />,
      color: "cyan",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Dual-layer mathematical defense combining <strong className="text-cyan-400">FIPS 180-4 SHA-256 hashing</strong>, <strong className="text-emerald-400">Merkle Trees (O(log N))</strong>, and <strong className="text-indigo-400">Polygon PoS Smart Contracts</strong>.
          </p>
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-1">
              <div className="text-cyan-400 font-mono font-black text-lg">256-bit</div>
              <div className="font-bold text-slate-200">SHA-256 Digest</div>
              <p className="text-[10px] text-slate-400">Calculated in-memory before upload</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center space-y-1">
              <div className="text-emerald-400 font-mono font-black text-lg">O(log N)</div>
              <div className="font-bold text-slate-200">Merkle Audit Path</div>
              <p className="text-[10px] text-slate-400">Sub-second leaf inclusion verification</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-center space-y-1">
              <div className="text-indigo-400 font-mono font-black text-lg">AES-GCM</div>
              <div className="font-bold text-slate-200">Envelope Encryption</div>
              <p className="text-[10px] text-slate-400">AWS KMS / HSM Hardware Key</p>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={onOpenMerkleModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold flex items-center space-x-2 transition-all"
            >
              <GitFork className="w-4 h-4" />
              <span>Inspect Live Merkle Tree Mathematical DAG</span>
            </button>
          </div>
        </div>
      )
    },
    {
      badge: "SLIDE 3 // 6-STAGE STATUTORY LIFECYCLE",
      title: "End-to-End Custody Pipeline Conforming to BNSS 2023",
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      color: "indigo",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Strict statutory alignment with the <strong className="text-indigo-400">Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023</strong> covering the full investigation and court trial lifecycle.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 1: FIR Ingestion</div>
              <div className="text-slate-400 text-[10px]">Sec 173 BNSS (Aadhaar Hash)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 2: Field Seizures</div>
              <div className="text-slate-400 text-[10px]">Sec 105 BNSS (GPS & Panch)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 3: CFSL / SFSL</div>
              <div className="text-slate-400 text-[10px]">Sec 39 BSA (Ballistic & DNA)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 4: Prosecution</div>
              <div className="text-slate-400 text-[10px]">Sec 193 BNSS (PII Redactions)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 5: Court Trial</div>
              <div className="text-slate-400 text-[10px]">Sec 63 BSA (Admissibility)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-cyan-400 font-bold">Stage 6: Archival</div>
              <div className="text-slate-400 text-[10px]">Public Records Act & ISO 27001</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-[11px]">
            <strong>Role-Based Access Control (RBAC):</strong> Investigating Officers, Forensic Scientists, Prosecutors, and Judges operate within isolated privilege envelopes.
          </div>
        </div>
      )
    },
    {
      badge: "SLIDE 4 // LIVE ATTACK & DEFENSE SIMULATION",
      title: "Interactive Tamper Detection & 1-Click Consensus Healing",
      icon: <Zap className="w-6 h-6 text-red-400" />,
      color: "red",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Demonstrate real-time zero-trust security by simulating an unauthorized bit-flip alteration on evidence bytes.
          </p>
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
            <div className="font-bold text-red-400 flex items-center justify-between">
              <span>Bit-Level Corruption Attack</span>
              <span className="text-[10px] font-mono bg-red-900/60 px-2 py-0.5 rounded">INSTANT QUARANTINE</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Altering a single byte (e.g. changing firearm serial W-9041 to W-0000) instantly changes the SHA-256 checksum, invalidates the Merkle proof, drops case integrity score, and broadcasts a real-time security alert over WebSockets.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onSimulateTamper();
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-red-600/30"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Launch Live Tamper Attack Simulator</span>
            </button>
          </div>
        </div>
      )
    },
    {
      badge: "SLIDE 5 // LEGAL AI & CONTRADICTION DISCOVERY",
      title: "Automated Cross-Examination: Witness vs. Forensic Evidence",
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      color: "purple",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Natural language semantic search and automated contradiction discovery discovering factual discrepancies across depositions in seconds.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">Sample Flagged Discrepancy (CONTRA-001)</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">HIGH PROBATIVE VALUE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px]">Witness Claim:</span>
                <p className="text-slate-300 italic">"Two men fled in a RED HATCHBACK"</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-cyan-400 font-mono text-[10px]">CCTV Optical Evidence:</span>
                <p className="text-slate-300">"SILVER SEDAN (DL-3C-9921) at 23:38 hrs"</p>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/90 pt-1 font-mono">
              Statutory Implication: Exposes witness to cross-examination under Sec 145/146 BSA 2023.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAIModal();
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Legal AI & Contradiction Assistant</span>
            </button>
          </div>
        </div>
      )
    },
    {
      badge: "SLIDE 6 // STATUTORY ADMISSIBILITY & DEPLOYMENT",
      title: "Section 63 BSA 2023 Form B Certification & National Rollout",
      icon: <Award className="w-6 h-6 text-emerald-400" />,
      color: "emerald",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed font-heading">
            Direct statutory compliance replacing manual paper affidavits with cryptographically signed, court-admissible electronic manifests.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Statutory Admissibility</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Generates complete Section 63(4)(c) BSA Electronic Record Certificates with composite document manifest hashes, atomic clock synchronization, and officer HMAC digital seals.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>National Interoperability</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Architected for direct REST/HL7 integration with CCTNS (Crime and Criminal Tracking Network & Systems), ICJS, e-Courts, and State SFSL networks.
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenCertModal();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/30"
            >
              <Award className="w-4 h-4" />
              <span>Inspect Section 63 BSA 2023 Electronic Certificate</span>
            </button>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090e1c] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
              {slide.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {slide.badge}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                {slide.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close presentation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {slide.content}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide 
                    ? 'w-6 bg-cyan-400' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
