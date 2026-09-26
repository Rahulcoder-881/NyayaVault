import React, { useState, useEffect, useRef } from 'react';
import { 
  UserRole, 
  DocumentItem, 
  CaseRecord, 
  AuditBlock, 
  BSACertificateData, 
  ContradictionItem, 
  TimelineEvent, 
  LifecycleStageId 
} from './types';
import { USER_ROLES } from './constants';
import { Navbar } from './components/Navbar';
import { Vault3DVisualizer } from './components/Vault3DVisualizer';
import { LifecyclePipeline } from './components/LifecyclePipeline';
import { DocumentList } from './components/DocumentList';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { TamperAttackModal } from './components/TamperAttackModal';
import { BSACertificateModal } from './components/BSACertificateModal';
import { MerkleTreeModal } from './components/MerkleTreeModal';
import { AILegalAssistant } from './components/AILegalAssistant';
import { LiveAuditLedger } from './components/LiveAuditLedger';
import { UploadModal } from './components/UploadModal';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Cpu, 
  FileCheck2,
  Lock,
  Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [currentRole, setCurrentRole] = useState<UserRole>('IO_POLICE');
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [activeStage, setActiveStage] = useState<LifecycleStageId | null>(null);

  // Modal states
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [merkleProofDoc, setMerkleProofDoc] = useState<DocumentItem | null>(null);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetDoc, setTamperTargetDoc] = useState<DocumentItem | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState<BSACertificateData | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // WebSocket connection state
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Base API URL
  const API_BASE = window.location.origin.includes('5173') ? 'http://127.0.0.1:8000' : '';

  // 1. Initial Data Fetching
  const fetchAllData = async () => {
    try {
      const [casesRes, docsRes, auditRes, contraRes, timelineRes] = await Promise.all([
        fetch(`${API_BASE}/api/cases`).then(r => r.json()),
        fetch(`${API_BASE}/api/documents`).then(r => r.json()),
        fetch(`${API_BASE}/api/audit-trail`).then(r => r.json()),
        fetch(`${API_BASE}/api/ai/contradictions`).then(r => r.json()),
        fetch(`${API_BASE}/api/ai/timeline`).then(r => r.json())
      ]);

      if (casesRes && casesRes.length > 0) {
        setCaseRecord(casesRes[0]);
      }
      setDocuments(docsRes || []);
      setAuditBlocks(auditRes || []);
      setContradictions(contraRes || []);
      setTimeline(timelineRes || []);
    } catch (err) {
      console.error('Error fetching data from NyayaVault backend:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. WebSocket Listener for Live Ledger Updates
  useEffect(() => {
    const wsUrl = window.location.origin.includes('5173')
      ? 'ws://127.0.0.1:8000/ws/audit'
      : `ws://${window.location.host}/ws/audit`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DOCUMENT_UPLOADED') {
              setDocuments(prev => [...prev, data.document]);
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              if (data.merkle_root) {
                setCaseRecord(prev => prev ? { ...prev, merkle_root: data.merkle_root } : null);
              }
            } else if (data.type === 'TAMPER_ALERT') {
              setDocuments(prev => prev.map(d => d.id === data.document_id ? {
                ...d,
                status: 'QUARANTINED',
                sha256_hash: data.tampered_hash,
                tamper_flag: true,
                tamper_offset: data.corrupted_offset
              } : d));
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              setCaseRecord(prev => prev ? {
                ...prev,
                merkle_root: data.merkle_root,
                integrity_score: data.integrity_score,
                quarantine_count: data.quarantine_count
              } : null);
            } else if (data.type === 'DOCUMENT_RESTORED') {
              setDocuments(prev => prev.map(d => d.id === data.document_id ? {
                ...d,
                status: 'VERIFIED',
                sha256_hash: data.sha256_hash,
                original_sha256: data.sha256_hash,
                tamper_flag: false,
                tamper_offset: undefined,
                tamper_details: undefined
              } : d));
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              setCaseRecord(prev => prev ? {
                ...prev,
                merkle_root: data.merkle_root,
                integrity_score: data.integrity_score,
                quarantine_count: data.quarantine_count
              } : null);
            } else if (data.type === 'REDACTION_APPLIED') {
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          // Try reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (err) {
        console.error('WS connect error:', err);
      }
    };

    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Actions
  const handleSimulateTamper = async (docId: string, byteOffset: number, corruptedData: string) => {
    const res = await fetch(`${API_BASE}/api/tamper/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId, byte_offset: byteOffset, corrupted_data: corruptedData })
    }).then(r => r.json());
    await fetchAllData();
    return res;
  };

  const handleRestoreDoc = async (doc: DocumentItem) => {
    const res = await fetch(`${API_BASE}/api/tamper/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: doc.id })
    }).then(r => r.json());
    await fetchAllData();
    return res;
  };

  const handleRestoreAll = async () => {
    const tampered = documents.filter(d => d.status === 'TAMPERED' || d.status === 'QUARANTINED');
    for (const doc of tampered) {
      await handleRestoreDoc(doc);
    }
  };

  const handleApplyRedaction = async (doc: DocumentItem) => {
    await fetch(`${API_BASE}/api/redact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: doc.id })
    });
    await fetchAllData();
  };

  const handleFetchMerkleProof = async (docId: string) => {
    return fetch(`${API_BASE}/api/merkle-proof/${docId}`).then(r => r.json());
  };

  const handleGenerateBSACert = async (officerName: string, designation: string, badgeId: string) => {
    const cert = await fetch(`${API_BASE}/api/cert/section-63-bsa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseRecord?.case_id || 'CASE-2026-DEL-402',
        certifying_officer_name: officerName,
        certifying_officer_designation: designation,
        badge_id: badgeId
      })
    }).then(r => r.json());
    setCertData(cert);
    await fetchAllData();
    return cert;
  };

  const handleQueryAI = async (queryText: string) => {
    return fetch(`${API_BASE}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    }).then(r => r.json());
  };

  const handleUploadDocument = async (data: any) => {
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
    await fetchAllData();
    return res;
  };

  const hasTamperAlert = (caseRecord?.quarantine_count || 0) > 0;

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
      
      {/* 1. Header Navigation & RBAC Controls */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        integrityScore={caseRecord?.integrity_score || 100}
        quarantineCount={caseRecord?.quarantine_count || 0}
        onOpenTamperModal={() => {
          setTamperTargetDoc(documents[2] || documents[0]);
          setIsTamperModalOpen(true);
        }}
        onOpenCertModal={() => setIsCertModalOpen(true)}
        onRestoreAll={handleRestoreAll}
        onOpenAISearch={() => setIsAIModalOpen(true)}
      />

      {/* Critical Security Alert Ribbon if Tampered */}
      {hasTamperAlert && (
        <div className="w-full bg-red-600/90 text-white px-4 py-2.5 text-xs font-mono font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse z-30">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>
              ZERO-TRUST ALERT: {caseRecord?.quarantine_count} EXHIBIT(S) FAILED CRYPTOGRAPHIC INTEGRITY // MERKLE ROOT ALTERED // QUARANTINE ENFORCED
            </span>
          </div>
          <button
            onClick={handleRestoreAll}
            className="px-3 py-1 bg-slate-950 text-emerald-400 hover:bg-slate-900 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Genesis Consensus</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Hero: 3D Cryptographic Vault & Telemetry */}
        <section>
          <Vault3DVisualizer
            integrityScore={caseRecord?.integrity_score || 100}
            isTampered={hasTamperAlert}
            activeStage={activeStage}
            onSelectStage={(stage) => setActiveStage(stage)}
            merkleRoot={caseRecord?.merkle_root || ''}
          />
        </section>

        {/* 6-Stage Case & Document Lifecycle Pipeline Stepper */}
        <section>
          <LifecyclePipeline
            activeStage={activeStage}
            onSelectStage={setActiveStage}
            documents={documents}
          />
        </section>

        {/* Main Operational Split: Documents List & Real-time Audit Ledger */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Document List (7 Cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 font-heading">
                  Evidentiary Legal Documents & Exhibits
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Role: <span className="text-cyan-400 font-semibold">{USER_ROLES[currentRole].name}</span> ({USER_ROLES[currentRole].label})
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {documents.length} Records Ingested
              </span>
            </div>

            <DocumentList
              documents={documents}
              currentRole={currentRole}
              activeStage={activeStage}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onSimulateTamper={(doc) => {
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
              onViewMerkleProof={(doc) => setMerkleProofDoc(doc)}
              onApplyRedaction={handleApplyRedaction}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          </div>

          {/* Right: Live Immutable Audit Trail (5 Cols on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <LiveAuditLedger
              blocks={auditBlocks}
              isWsConnected={isWsConnected}
            />

            {/* SIH Hackathon & National Impact Highlighting Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="font-heading text-sm">SIH Evaluation Matrix Compliance</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 font-sans text-[11px] leading-relaxed">
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Evidentiary Admissibility:</strong> Section 63 BSA 2023 certified electronic manifests replace manual court paper trials.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Zero-Trust Cryptography:</strong> SHA-256 + Merkle DAG guarantees instant tamper detection & automatic quarantine.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Leak Attribution:</strong> Steganographic forensic watermarks prevent unauthorized media leaks by police/court staff.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Legal AI & Contradiction Discovery:</strong> Automated discovery of witness-to-forensic discrepancies under Sec 180 BNSS.</span>
                </li>
              </ul>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060a14] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">NyayaVault</span>
            <span>•</span>
            <span>Secure Digital Custody DMS for Legal & Investigation Documents</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Conforming to ISO/IEC 27001:2022 & Bharatiya Sakshya Adhiniyam (Act 47 of 2023)
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Document Viewer Modal */}
      <DocumentViewerModal
        document={selectedDoc}
        currentRole={currentRole}
        onClose={() => setSelectedDoc(null)}
        onSimulateTamper={(doc) => {
          setSelectedDoc(null);
          setTamperTargetDoc(doc);
          setIsTamperModalOpen(true);
        }}
        onRestoreDoc={handleRestoreDoc}
      />

      {/* 2. Tamper Attack Simulator Modal */}
      <TamperAttackModal
        documents={documents}
        selectedDoc={tamperTargetDoc}
        isOpen={isTamperModalOpen}
        onClose={() => {
          setIsTamperModalOpen(false);
          setTamperTargetDoc(null);
        }}
        onExecuteTamper={handleSimulateTamper}
        onRestoreDoc={handleRestoreDoc}
      />

      {/* 3. Section 63 BSA Certificate Modal */}
      <BSACertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        caseRecord={caseRecord}
        certificateData={certData}
        onGenerate={handleGenerateBSACert}
      />

      {/* 4. Merkle Tree Proof Modal */}
      <MerkleTreeModal
        document={merkleProofDoc}
        isOpen={merkleProofDoc !== null}
        onClose={() => setMerkleProofDoc(null)}
        onFetchProof={handleFetchMerkleProof}
      />

      {/* 5. AI Legal Assistant Modal */}
      <AILegalAssistant
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        contradictions={contradictions}
        timeline={timeline}
        onSelectDocById={(docId) => {
          setIsAIModalOpen(false);
          const found = documents.find(d => d.id === docId);
          if (found) setSelectedDoc(found);
        }}
        onQueryAI={handleQueryAI}
      />

      {/* 6. Document Ingestion Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentRole={currentRole}
        onUpload={handleUploadDocument}
      />

    </div>
  );
};

export default App;
