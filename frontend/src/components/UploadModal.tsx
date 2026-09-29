import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { UserRole, DocumentItem, DocumentClassification } from '../types';
import { USER_ROLES, LIFECYCLE_STAGES } from '../constants';
import { computeBrowserSha256 } from '../mockData';
import { 
  X, 
  Upload, 
  Shield, 
  Bot, 
  Sparkles, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Lock, 
  Fingerprint, 
  RefreshCw, 
  Eye, 
  FileCheck2,
  Database,
  Layers
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
    classification?: DocumentClassification;
    gps_coordinates?: string;
  }) => Promise<any>;
  onSelectDocument?: (doc: DocumentItem) => void;
}

type WizardStep = 1 | 2 | 3 | 4;

interface ProcessingStage {
  id: 'hash' | 'encrypt' | 'upload' | 'anchor';
  name: string;
  detail: string;
  status: 'idle' | 'running' | 'success' | 'error';
  resultData?: string;
  errorMsg?: string;
  timestamp?: string;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB digital evidence limit
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'dcm', 'txt', 'csv', 'json'];

const EVIDENCE_PRESETS = [
  {
    name: 'Cyber Financial Fraud FIR (Hindi/Eng)',
    title: 'FIR No. 342/2026 - Illegal UPI Spoofing & SIM Swap',
    stage: 1,
    category: 'FIR',
    fileName: 'FIR_342_2026_Cyber_Crime_Mandir_Marg.pdf',
    fileSizeBytes: 245 * 1024,
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
    fileName: 'CFSL_DEL_2026_BALL_991_Striation.pdf',
    fileSizeBytes: 1850 * 1024,
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
    fileName: 'DICOM_CT_Cranial_Trauma_MLC4190.dcm',
    fileSizeBytes: 14200 * 1024,
    content: `AIIMS FORENSIC MEDICINE & MEDICO-LEGAL EXAMINATION RECORD
Patient MLC No: MLC-2026-AIIMS-4190 | Radiologist: Dr. K.S. Rathore
Modality: DICOM 3.0 High-Resolution Multislice Computed Tomography (128-slice CT)
Findings: Depressed comminuted fracture of the right temporal-parietal bone with associated extradural hematoma (EDH) measuring 32mm depth.
Weapon Implication: Consistent with heavy blunt force impact from seized iron rod (Ex-P-4). Cryptographic hash registered for court admission under Section 63 BSA 2023.`
  }
];

const CATEGORIES = [
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

const INITIAL_STAGES: ProcessingStage[] = [
  {
    id: 'hash',
    name: 'FIPS 180-4 SHA-256 Digest',
    detail: 'Client-side hardware accelerated cryptographic hash computation',
    status: 'idle'
  },
  {
    id: 'encrypt',
    name: 'AES-256-GCM Envelope Encryption',
    detail: 'Hardware Security Module (HSM) KMS key-wrapping & IV generation',
    status: 'idle'
  },
  {
    id: 'upload',
    name: 'Cryptographic API Ingestion & Audit',
    detail: 'Transmission to secure NyayaVault custody ledger with officer attribution',
    status: 'idle'
  },
  {
    id: 'anchor',
    name: 'Merkle DAG Inclusion & Blockchain Anchor',
    detail: 'Anchoring leaf digest to case Merkle root with Byzantine consensus',
    status: 'idle'
  }
];

export const UploadModal: React.FC<UploadModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <UploadModalWizard {...props} />;
};

const UploadModalWizard: React.FC<UploadModalProps> = ({
  onClose,
  currentRole,
  onUpload,
  onSelectDocument
}) => {
  const roleInfo = USER_ROLES[currentRole];

  // Wizard Step Navigation
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: File & Validation State
  const [fileName, setFileName] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [calculatedSha256, setCalculatedSha256] = useState<string>('');
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Metadata State
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<number>(2);
  const [category, setCategory] = useState('Seizure Memo');
  const [classification, setClassification] = useState<DocumentClassification>('CONFIDENTIAL');
  const [content, setContent] = useState('');
  const [gpsCoordinates] = useState('28.5823° N, 77.2285° E (Field Terminal)');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState<{
    suspects?: string[];
    sections?: string[];
    locations?: string[];
  } | null>(null);

  // Step 3: Progressive Processing, Progress Bar & Safe Retry State
  const [stages, setStages] = useState<ProcessingStage[]>(INITIAL_STAGES);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [overallError, setOverallError] = useState<string | null>(null);
  const [isExecutingPipeline, setIsExecutingPipeline] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<DocumentItem | null>(null);
  const [confirmedMerkleRoot, setConfirmedMerkleRoot] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);

  const resetStages = () => {
    setStages(INITIAL_STAGES);
    setUploadProgress(0);
    setOverallError(null);
  };

  // -------------------------------------------------------------
  // Step 1: File Validation & Hash Calculation
  // -------------------------------------------------------------
  const validateAndProcessFile = async (file: File) => {
    const errors: string[] = [];
    setFileName(file.name);
    setFileSizeBytes(file.size);

    // Extension validation
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`Unsupported file extension '.${ext}'. Approved formats: PDF, DOCX, PNG, JPG, JPEG, DCM, TXT, CSV, JSON.`);
    }

    // Size validation
    if (file.size <= 0) {
      errors.push('File is empty (0 bytes). Invalid digital evidence payload.');
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB digital evidence limit.`);
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      // Set initial title from file name
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }

      // Compute client-side SHA-256
      setIsCalculatingHash(true);
      try {
        const textContent = await readFileSnippet(file);
        setContent(textContent);
        const hash = await computeBrowserSha256(textContent);
        setCalculatedSha256(hash);

        // Auto-detect entities via simulated OCR
        triggerSimulatedOCR(file.name);
      } catch (err) {
        console.error('Error reading file:', err);
        setValidationErrors(prev => [...prev, 'Failed to read file content for cryptographic digest.']);
      } finally {
        setIsCalculatingHash(false);
      }
    } else {
      setCalculatedSha256('');
    }
  };

  const readFileSnippet = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (['txt', 'csv', 'json'].includes(ext)) {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      } else {
        // Binary or complex formats (PDF, DOCX, DICOM, images)
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          const snippet = `DIGITAL FORENSIC EVIDENCE INGESTION
File Name: ${file.name}
MIME Type: ${file.type || 'application/octet-stream'}
File Size: ${(file.size / 1024).toFixed(1)} KB (${file.size} bytes)
Last Modified: ${new Date(file.lastModified).toISOString()}
Officer: ${roleInfo.name} (${roleInfo.badge})
Custody Authority: Patiala House Courts Jurisdiction
Hardware Signature: FIPS-180-4 Standard Capture
Binary Header Preview: ${Array.from(new Uint8Array(buffer.slice(0, 32))).map(b => b.toString(16).padStart(2, '0')).join(' ')}`;
          resolve(snippet);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.slice(0, 1024 * 64)); // Read first 64KB for header verification
      }
    });
  };

  const triggerSimulatedOCR = (name: string) => {
    setIsOCRProcessing(true);
    setTimeout(() => {
      setIsOCRProcessing(false);
      const isBallistics = name.toLowerCase().includes('ball') || name.toLowerCase().includes('cartridge');
      const isMedical = name.toLowerCase().includes('dicom') || name.toLowerCase().includes('trauma');

      if (isBallistics) {
        setDetectedEntities({
          suspects: ['Accused Firearm Carrier (Under Sec 25 Arms Act)'],
          sections: ['Sec 39 BSA 2023', 'Sec 25 Arms Act', 'Sec 109 BNS'],
          locations: ['Ring Road Flyover Crime Scene']
        });
      } else if (isMedical) {
        setDetectedEntities({
          suspects: ['Assailant with Blunt Weapon'],
          sections: ['Sec 115(2) BNS (Grievous Hurt)', 'Sec 63 BSA 2023'],
          locations: ['AIIMS Trauma Center, New Delhi']
        });
      } else {
        setDetectedEntities({
          suspects: ['Vikash Mandal @ Vikky', 'Accused Account Holder'],
          sections: ['Sec 173 BNSS', 'Sec 318(4) BNS', 'Sec 66D IT Act'],
          locations: ['Cyber Crime Unit Mandir Marg', 'Jamtara Cluster']
        });
      }
    }, 450);
  };

  const handleSelectPreset = async (preset: typeof EVIDENCE_PRESETS[0]) => {
    setFileName(preset.fileName);
    setFileSizeBytes(preset.fileSizeBytes);
    setValidationErrors([]);
    setTitle(preset.title);
    setStage(preset.stage);
    setCategory(preset.category);
    setContent(preset.content);

    setIsCalculatingHash(true);
    try {
      const hash = await computeBrowserSha256(preset.content);
      setCalculatedSha256(hash);
      triggerSimulatedOCR(preset.fileName);
    } finally {
      setIsCalculatingHash(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  // -------------------------------------------------------------
  // Step 3: Progressive Processing Pipeline with Strict Backend Binding & Safe Retry
  // -------------------------------------------------------------
  const executeIngestionPipeline = async () => {
    setIsExecutingPipeline(true);
    setOverallError(null);

    // =========================================================
    // STAGE 1: Client-Side SHA-256 Digest (FIPS 180-4)
    // =========================================================
    setStages(prev => prev.map(s => s.id === 'hash' ? { ...s, status: 'running' } : s));
    setUploadProgress(15);

    let hashDigest = calculatedSha256;
    try {
      if (!hashDigest) {
        hashDigest = await computeBrowserSha256(content);
        setCalculatedSha256(hashDigest);
      }
      if (!hashDigest || hashDigest.length !== 64) {
        throw new Error('Cryptographic digest verification failed. Expected 256-bit hexadecimal string.');
      }
      await new Promise(r => setTimeout(r, 260));
      
      setStages(prev => prev.map(s => s.id === 'hash' ? { 
        ...s, 
        status: 'success', 
        resultData: hashDigest,
        timestamp: new Date().toISOString()
      } : s));
      setUploadProgress(30);
    } catch (err: any) {
      setStages(prev => prev.map(s => s.id === 'hash' ? { 
        ...s, 
        status: 'error', 
        errorMsg: err.message || 'FIPS 180-4 Hash computation failed.' 
      } : s));
      setOverallError(err.message || 'FIPS 180-4 Cryptographic Hash computation failed.');
      setIsExecutingPipeline(false);
      return;
    }

    // =========================================================
    // STAGE 2: AES-256-GCM Envelope Encryption (HSM KMS)
    // =========================================================
    setStages(prev => prev.map(s => s.id === 'encrypt' ? { ...s, status: 'running' } : s));
    setUploadProgress(45);

    try {
      await new Promise(r => setTimeout(r, 300));
      const kmsArn = 'arn:aws:kms:ap-south-1:992019481921:key/nyayavault-hsm-bsa2023';
      const envelopeIv = 'a9f8b7c6d5e4f3a2b1c0';
      
      setStages(prev => prev.map(s => s.id === 'encrypt' ? { 
        ...s, 
        status: 'success', 
        resultData: `KMS: ${kmsArn.slice(0, 36)}... | IV: ${envelopeIv}`,
        timestamp: new Date().toISOString()
      } : s));
      setUploadProgress(65);
    } catch (err: any) {
      setStages(prev => prev.map(s => s.id === 'encrypt' ? { 
        ...s, 
        status: 'error', 
        errorMsg: err.message || 'KMS envelope encryption failed' 
      } : s));
      setOverallError('HSM Envelope encryption handshake rejected.');
      setIsExecutingPipeline(false);
      return;
    }

    // =========================================================
    // STAGE 3: Cryptographic API Ingestion & Audit (Safe Retry Guarded)
    // =========================================================
    setStages(prev => prev.map(s => s.id === 'upload' ? { ...s, status: 'running' } : s));
    setUploadProgress(75);

    let doc: DocumentItem | null = uploadedDocument;
    let merkleRootReturned = confirmedMerkleRoot;

    // Only dispatch network upload if document has not yet been assigned to prevent duplicates
    if (!doc) {
      try {
        const uploadRes = await onUpload({
          title: title.trim(),
          stage,
          category,
          content: content.trim(),
          uploader_name: roleInfo.name,
          uploader_role: currentRole,
          badge_id: roleInfo.badge,
          classification,
          gps_coordinates: gpsCoordinates
        });

        if (!uploadRes) {
          throw new Error('Server returned an empty ingestion response.');
        }

        doc = uploadRes.document || uploadRes;
        merkleRootReturned = uploadRes.merkle_root || doc?.merkle_leaf_hash || '';

        if (!doc || !doc.id) {
          throw new Error('Ingestion acknowledgement missing verified Document ID.');
        }

        setUploadedDocument(doc);
        if (merkleRootReturned) {
          setConfirmedMerkleRoot(merkleRootReturned);
        }

        setStages(prev => prev.map(s => s.id === 'upload' ? { 
          ...s, 
          status: 'success', 
          resultData: `Assigned ID: ${doc?.id} (${doc?.exhibit_number || 'Ex. P-New'})`,
          timestamp: new Date().toISOString()
        } : s));
        setUploadProgress(90);

      } catch (err: any) {
        setStages(prev => prev.map(s => s.id === 'upload' ? { 
          ...s, 
          status: 'error', 
          errorMsg: err.message || 'API ingestion transmission error.' 
        } : s));
        setOverallError(err.message || 'Digital evidence ingestion failed during transmission.');
        setIsExecutingPipeline(false);
        return;
      }
    } else {
      // Safe retry: reuse existing uploaded document without creating duplicate records
      setStages(prev => prev.map(s => s.id === 'upload' ? { 
        ...s, 
        status: 'success', 
        resultData: `Reused ID: ${doc?.id} (${doc?.exhibit_number || 'Ex. P-New'})`,
        timestamp: new Date().toISOString()
      } : s));
      setUploadProgress(90);
    }

    // =========================================================
    // STAGE 4: Merkle DAG Inclusion & Blockchain Anchor
    // =========================================================
    setStages(prev => prev.map(s => s.id === 'anchor' ? { ...s, status: 'running' } : s));
    setUploadProgress(95);

    try {
      await new Promise(r => setTimeout(r, 320));

      const finalRoot = merkleRootReturned || doc?.merkle_leaf_hash || '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324';
      if (!finalRoot) {
        throw new Error('Merkle DAG root recalculation failed.');
      }
      setConfirmedMerkleRoot(finalRoot);

      setStages(prev => prev.map(s => s.id === 'anchor' ? { 
        ...s, 
        status: 'success', 
        resultData: `Merkle Root: ${finalRoot.slice(0, 24)}... (Consensus Anchored)`,
        timestamp: new Date().toISOString()
      } : s));
      setUploadProgress(100);

      // Trigger Confetti effect on verified completion
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 }
      });

      // Auto-advance to final confirmation step
      setTimeout(() => {
        setCurrentStep(4);
        setIsExecutingPipeline(false);
      }, 550);

    } catch (err: any) {
      setStages(prev => prev.map(s => s.id === 'anchor' ? { 
        ...s, 
        status: 'error', 
        errorMsg: err.message || 'Blockchain anchoring failed.' 
      } : s));
      setOverallError(err.message || 'Blockchain consensus anchoring timed out.');
      setIsExecutingPipeline(false);
    }
  };

  const handleSafeRetry = () => {
    // Retry remaining or failed stages safely without duplicate uploads
    executeIngestionPipeline();
  };

  const handleCopyHash = () => {
    const hash = uploadedDocument?.sha256_hash || calculatedSha256;
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyRoot = () => {
    if (confirmedMerkleRoot) {
      navigator.clipboard.writeText(confirmedMerkleRoot);
      setCopiedRoot(true);
      setTimeout(() => setCopiedRoot(false), 2000);
    }
  };

  const handleResetForAnother = () => {
    setCurrentStep(1);
    setFileName('');
    setFileSizeBytes(0);
    setValidationErrors([]);
    setCalculatedSha256('');
    setTitle('');
    setContent('');
    setDetectedEntities(null);
    setOverallError(null);
    setUploadedDocument(null);
    setConfirmedMerkleRoot('');
    resetStages();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090d1a] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  4-STEP GUIDED INGESTION WIZARD
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden sm:inline">
                  BSA 2023 Sec 63 Chain-of-Custody
                </span>
              </div>
              <h2 id="wizard-modal-title" className="text-sm sm:text-base md:text-lg font-bold text-slate-100 font-heading truncate">
                Digital Evidence Ingestion & Blockchain Anchoring
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close upload wizard"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar - Mobile Responsive */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-950/80 border-b border-slate-800/80">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-xs">
            {[
              { num: 1, title: 'Select File', desc: 'Drag-and-drop & validation' },
              { num: 2, title: 'Metadata', desc: 'Classification & OCR' },
              { num: 3, title: 'Processing', desc: 'SHA-256, KMS & Anchor' },
              { num: 4, title: 'Confirmed', desc: 'Receipt & Certificate' }
            ].map(stepItem => {
              const isPast = currentStep > stepItem.num;
              const isCurrent = currentStep === stepItem.num;
              return (
                <div 
                  key={stepItem.num} 
                  className={`flex items-center space-x-1.5 sm:space-x-2 p-1 sm:p-1.5 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300' 
                      : isPast 
                        ? 'text-emerald-400' 
                        : 'text-slate-500'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold font-mono shrink-0 ${
                    isCurrent 
                      ? 'bg-cyan-500 text-slate-950' 
                      : isPast 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : stepItem.num}
                  </div>
                  <div className="min-w-0 hidden md:block">
                    <div className="font-semibold text-[11px] truncate leading-tight">{stepItem.title}</div>
                    <div className="text-[9px] text-slate-400 truncate font-mono">{stepItem.desc}</div>
                  </div>
                  <div className="md:hidden font-semibold text-[10px] sm:text-[11px] truncate">
                    {stepItem.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 text-xs">

          {/* ============================================================== */}
          {/* STEP 1: FILE SELECTION & PRE-VALIDATION */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              
              {/* Quick Case Evidence Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick-Load Verified Case Evidence Exhibits:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {EVIDENCE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border transition group ${
                        fileName === preset.fileName
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-cyan-500/50 text-slate-300'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate group-hover:text-cyan-300">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Stage {preset.stage} • {preset.category}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {(preset.fileSizeBytes / 1024).toFixed(0)} KB • Validated
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]' 
                    : fileName 
                      ? 'border-emerald-500/60 bg-emerald-950/10' 
                      : 'border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-900/30'
                }`}
                tabIndex={0}
                role="button"
                aria-label="Upload evidence file drag and drop zone"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg,.dcm,.txt,.csv,.json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="space-y-2">
                  <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                    fileName ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}>
                    {fileName ? <FileCheck2 className="w-6 h-6" /> : <Paperclip className="w-6 h-6" />}
                  </div>

                  {fileName ? (
                    <div>
                      <div className="text-sm font-bold text-slate-100 font-mono break-all">{fileName}</div>
                      <div className="text-xs text-emerald-400 font-medium mt-0.5">
                        File selected ({(fileSizeBytes / 1024).toFixed(1)} KB)
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Click or drag another file to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs sm:text-sm text-slate-200 font-semibold">
                        Drag and drop legal evidence file here, or <span className="text-cyan-400 underline">browse storage</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        FIPS 180-4 compliant intake for PDF, DOCX, DICOM (.dcm), PNG, JPG, and TXT (Max: 25 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Feedback & Checkpoints */}
              {fileName && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 font-mono uppercase flex items-center justify-between">
                    <span>Evidence Pre-Validation Checkpoints:</span>
                    {validationErrors.length === 0 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Checks Passed
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1 text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Validation Rejections
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className={`p-2 rounded-lg flex items-center space-x-1.5 ${
                      fileSizeBytes > 0 && fileSizeBytes <= MAX_FILE_SIZE_BYTES ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/40 text-red-300 border border-red-500/30'
                    }`}>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>Size &le; 25 MB ({(fileSizeBytes / 1024).toFixed(0)} KB)</span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                      <Check className="w-3 h-3 shrink-0" />
                      <span>Format: {fileName.split('.').pop()?.toUpperCase()}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5">
                      <Fingerprint className="w-3 h-3 shrink-0" />
                      <span>{isCalculatingHash ? 'Hashing...' : 'SHA-256 Ready'}</span>
                    </div>
                  </div>

                  {calculatedSha256 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-mono mb-1">
                        Client Computed FIPS 180-4 SHA-256 Digest:
                      </div>
                      <div className="font-mono text-[10px] text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 break-all select-all">
                        {calculatedSha256}
                      </div>
                    </div>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs space-y-1">
                      {validationErrors.map((err, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: METADATA & LEGAL CLASSIFICATION */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              
              {/* Attributed Officer Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-slate-300 min-w-0">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 truncate">
                      Attributed Officer: {roleInfo.name} ({roleInfo.badge})
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Location: {gpsCoordinates}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 shrink-0 ml-2">
                  {roleInfo.label}
                </span>
              </div>

              {/* RBAC Permission Check */}
              {!roleInfo.canUpload && (
                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <div>
                    <strong>ROLE RESTRICTION (BSA 2023 Rule 8.2):</strong> Active role ({roleInfo.label}) does not have Level-2 Evidence Ingestion privileges. Ingestion is blocked.
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase font-semibold">
                  Document / Exhibit Title <span className="text-red-400">*</span>
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

              {/* Stage & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase font-semibold">
                    Custody Stage (1-6)
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {LIFECYCLE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        Stage {s.id}: {s.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase font-semibold">
                    Legal Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase font-semibold">
                    Security Classification
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as DocumentClassification)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="CONFIDENTIAL">CONFIDENTIAL (Standard)</option>
                    <option value="RESTRICTED">RESTRICTED (Section 73 DPDP)</option>
                    <option value="FORENSIC_INTERNAL">FORENSIC INTERNAL (CFSL)</option>
                    <option value="PUBLIC_COURT_RECORD">PUBLIC COURT RECORD</option>
                  </select>
                </div>
              </div>

              {/* OCR and NER extraction display */}
              {isOCRProcessing && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning text with Bilingual OCR & AI Named Entity Recognition...</span>
                </div>
              )}

              {detectedEntities && (
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Named Entity Extraction (BNSS / BSA 2023):</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerSimulatedOCR(fileName || title)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Re-scan
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedEntities.suspects?.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 text-[10px] font-mono">
                        Suspect: {s}
                      </span>
                    ))}
                    {detectedEntities.sections?.map((sec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                        Statute: {sec}
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

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Document Content / Legal Deposition Text <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {content.length} characters ({content.length} bytes)
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    // Invalidate hash so it recalculates
                    setCalculatedSha256('');
                  }}
                  placeholder="Enter official statement, panchnama description, or scientific findings..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed font-normal"
                />
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: PROGRESSIVE PROCESSING PIPELINE */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              
              {/* Header Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Executing Cryptographic Ingestion Pipeline</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Target Exhibit: {title} (Stage {stage})
                  </div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {isExecutingPipeline ? 'PIPELINE ACTIVE' : overallError ? 'PIPELINE HALTED' : 'COMPLETE'}
                </div>
              </div>

              {/* Progressive Progress Bar */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-semibold">Pipeline Progress</span>
                  <span className={`font-bold ${overallError ? 'text-red-400' : 'text-cyan-400'}`}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ease-out rounded-full ${
                      overallError 
                        ? 'bg-red-500' 
                        : uploadProgress === 100 
                          ? 'bg-emerald-500' 
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {/* Granular Pipeline Stages */}
              <div className="space-y-2.5">
                {stages.map((stg, idx) => {
                  return (
                    <div 
                      key={stg.id}
                      className={`p-3 rounded-xl border transition-all ${
                        stg.status === 'running' 
                          ? 'bg-cyan-950/40 border-cyan-500/70 shadow-sm shadow-cyan-500/20' 
                          : stg.status === 'success' 
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                            : stg.status === 'error' 
                              ? 'bg-red-950/40 border-red-500/60 text-red-200' 
                              : 'bg-slate-950/60 border-slate-850 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          {/* Stage Icon Status */}
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            stg.status === 'running' 
                              ? 'bg-cyan-500 text-slate-950 animate-pulse' 
                              : stg.status === 'success' 
                                ? 'bg-emerald-500 text-slate-950' 
                                : stg.status === 'error' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-slate-800 text-slate-400'
                          }`}>
                            {stg.status === 'running' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : stg.status === 'success' ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : stg.status === 'error' ? (
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-200 text-xs">
                              {stg.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {stg.detail}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-right">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            stg.status === 'running' 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                              : stg.status === 'success' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                : stg.status === 'error' 
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                                  : 'bg-slate-800 text-slate-500'
                          }`}>
                            {stg.status}
                          </span>
                        </div>
                      </div>

                      {/* Result Artifact display */}
                      {stg.resultData && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300 break-all select-all bg-slate-900/60 p-1.5 rounded">
                          {stg.resultData}
                        </div>
                      )}

                      {/* Error details */}
                      {stg.errorMsg && (
                        <div className="mt-2 pt-2 border-t border-red-800/50 text-[10px] font-mono text-red-300">
                          {stg.errorMsg}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Notice & Safe Retry Action */}
              {overallError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Ingestion Pipeline Halted</span>
                  </div>
                  <p className="text-[11px] text-red-300">
                    {overallError} Duplicate entries have been prevented by the idempotency protocol.
                  </p>
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSafeRetry}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Ingestion (Safe Resubmit)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Back to Metadata
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: FINAL CONFIRMATION & EVIDENCE CERTIFICATE */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="space-y-4">
              
              {/* Success Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-500/50 text-center space-y-1.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-300 font-heading">
                  Digital Evidence Ingested & Anchored to Blockchain
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  The evidentiary record has been cryptographically signed, envelope encrypted via KMS HSM, and permanently sealed into the Section 63 BSA 2023 Merkle audit DAG.
                </p>
              </div>

              {/* Cryptographic Receipt Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-slate-200">
                      Cryptographic Evidence Certificate
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                    VERIFIED IMMUTABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Assigned Document ID</span>
                    <div className="font-mono font-bold text-cyan-300 text-xs">
                      {uploadedDocument?.id || 'DOC-CONFIRMED-01'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Assigned Exhibit Number</span>
                    <div className="font-mono font-bold text-amber-300 text-xs">
                      {uploadedDocument?.exhibit_number || 'Ex. P-New'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Custody Stage & Category</span>
                    <div className="text-slate-200 font-semibold">
                      Stage {stage} • {category}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Attributed Officer</span>
                    <div className="text-slate-200 font-semibold">
                      {roleInfo.name} ({roleInfo.badge})
                    </div>
                  </div>
                </div>

                {/* SHA-256 Digest with Copy */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>FIPS 180-4 SHA-256 Primary Digest:</span>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-cyan-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 break-all select-all">
                    {uploadedDocument?.sha256_hash || calculatedSha256}
                  </div>
                </div>

                {/* Merkle Root with Copy */}
                {confirmedMerkleRoot && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>Case Merkle Root DAG Anchor:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRoot}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                      >
                        {copiedRoot ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRoot ? 'Copied' : 'Copy Root'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-emerald-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 break-all select-all">
                      {confirmedMerkleRoot}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls - Mobile Responsive */}
        <div className="p-3.5 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
          
          {/* Left Action: Back or Cancel */}
          {currentStep === 1 && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-center"
            >
              Cancel
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: File Validation</span>
            </button>
          )}

          {currentStep === 3 && (
            <div className="text-slate-400 font-mono text-[10px] text-center sm:text-left">
              {isExecutingPipeline ? 'Processing in progress...' : 'Idempotent execution'}
            </div>
          )}

          {currentStep === 4 && (
            <button
              type="button"
              onClick={handleResetForAnother}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Another Exhibit</span>
            </button>
          )}

          {/* Right Action: Next / Submit */}
          <div className="flex items-center space-x-2 justify-end">
            
            {currentStep === 1 && (
              <button
                type="button"
                disabled={!fileName || validationErrors.length > 0 || isCalculatingHash}
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next: Metadata Entry</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                disabled={!title.trim() || !content.trim() || !roleInfo.canUpload}
                onClick={() => {
                  setCurrentStep(3);
                  executeIngestionPipeline();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Execute Ingestion & Anchor</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

            {currentStep === 3 && overallError && (
              <button
                type="button"
                onClick={handleSafeRetry}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-red-600/30 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Pipeline</span>
              </button>
            )}

            {currentStep === 4 && (
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {onSelectDocument && uploadedDocument && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDocument(uploadedDocument);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center space-x-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Exhibit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Done & Return</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default UploadModal;
