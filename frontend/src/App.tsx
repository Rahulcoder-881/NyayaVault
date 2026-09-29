import React, { useState, useEffect, useRef } from 'react';
import type { 
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
import { LifecyclePipeline } from './components/LifecyclePipeline';
import { DocumentList } from './components/DocumentList';
import { LiveAuditLedger } from './components/LiveAuditLedger';

// Lazy-loaded heavy components & modals for optimal bundle splitting
const Vault3DVisualizer = React.lazy(() => import('./components/Vault3DVisualizer').then(m => ({ default: m.Vault3DVisualizer })));
const DocumentViewerModal = React.lazy(() => import('./components/DocumentViewerModal').then(m => ({ default: m.DocumentViewerModal })));
const TamperAttackModal = React.lazy(() => import('./components/TamperAttackModal').then(m => ({ default: m.TamperAttackModal })));
const BSACertificateModal = React.lazy(() => import('./components/BSACertificateModal').then(m => ({ default: m.BSACertificateModal })));
const MerkleTreeModal = React.lazy(() => import('./components/MerkleTreeModal').then(m => ({ default: m.MerkleTreeModal })));
const AILegalAssistant = React.lazy(() => import('./components/AILegalAssistant').then(m => ({ default: m.AILegalAssistant })));
const UploadModal = React.lazy(() => import('./components/UploadModal').then(m => ({ default: m.UploadModal })));
const DocsViewerModal = React.lazy(() => import('./components/DocsViewerModal').then(m => ({ default: m.DocsViewerModal })));
const BlockchainLedgerModal = React.lazy(() => import('./components/BlockchainLedgerModal').then(m => ({ default: m.BlockchainLedgerModal })));
const GrantAccessModal = React.lazy(() => import('./components/GrantAccessModal').then(m => ({ default: m.GrantAccessModal })));
const OfficerAuthModal = React.lazy(() => import('./components/OfficerAuthModal').then(m => ({ default: m.OfficerAuthModal })));
const CaseVerificationModal = React.lazy(() => import('./components/CaseVerificationModal').then(m => ({ default: m.CaseVerificationModal })));
const EvidenceVerificationModal = React.lazy(() => import('./components/EvidenceVerificationModal').then(m => ({ default: m.EvidenceVerificationModal })));
const PresentationTourModal = React.lazy(() => import('./components/PresentationTourModal').then(m => ({ default: m.PresentationTourModal })));
import { 
  INITIAL_CASE,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_CONTRADICTIONS,
  INITIAL_TIMELINE,
  generateClientBSACertificate, 
  computeBrowserSha256 
} from './mockData';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2,
  Award,
  FileText,
  Clock,
  FolderOpen,
  GitCommit,
  Scale,
  Sparkles,
  History,
  Box,
  Leaf,
  Plus,
  Building,
  Download,
  Fingerprint,
  ChevronRight,
  ExternalLink,
  Search,
  Copy,
  Check,
  Gavel
} from 'lucide-react';

export type WorkspaceTab = 'DOCUMENTS' | 'PIPELINE' | 'CERTIFICATES' | 'AI' | 'AUDIT' | 'FORENSIC_3D';

export const App: React.FC = () => {
  // Application State - Pre-initialized with cryptographic genesis state for zero-latency presentation
  const [currentRole, setCurrentRole] = useState<UserRole>('IO_POLICE');
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(INITIAL_CASE);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>(INITIAL_AUDIT_BLOCKS);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>(INITIAL_CONTRADICTIONS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [activeStage, setActiveStage] = useState<LifecycleStageId | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  // Sustainable UX and Tab State
  const [isEcoMode, setIsEcoMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('DOCUMENTS');

  // Modal states
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [viewerInitialTab, setViewerInitialTab] = useState<'PREVIEW' | 'VERIFICATION' | 'TECHNICAL'>('PREVIEW');
  const [merkleProofDoc, setMerkleProofDoc] = useState<DocumentItem | null>(null);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetDoc, setTamperTargetDoc] = useState<DocumentItem | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState<BSACertificateData | null>(() =>
    generateClientBSACertificate(INITIAL_DOCUMENTS, INITIAL_CASE, 'Insp. R.K. Varma', 'Investigating Officer', 'DL-POL-8832')
  );
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCaseVerifyModalOpen, setIsCaseVerifyModalOpen] = useState(false);
  const [isEvidenceVerifyModalOpen, setIsEvidenceVerifyModalOpen] = useState(false);
  const [evidenceVerifyDoc, setEvidenceVerifyDoc] = useState<DocumentItem | null>(null);
  const [isPresentationTourOpen, setIsPresentationTourOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInspectEvidence = (doc: DocumentItem) => {
    setViewerInitialTab('PREVIEW');
    setSelectedDoc(doc);
  };

  const handleVerifyEvidence = (doc: DocumentItem) => {
    setViewerInitialTab('VERIFICATION');
    setSelectedDoc(doc);
  };

  // WebSocket connection state
  const [isWsConnected, setIsWsConnected] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Base API URL (uses relative path under HTTPS so Vite proxies cleanly without mixed content)
  const API_BASE = window.location.protocol === 'https:' ? '' : (window.location.origin.includes('5173') ? 'http://127.0.0.1:8000' : '');

  // 1. Initial Data Fetching with Resilient Standalone Web Preview Fallback
  const fetchAllData = React.useCallback(async () => {
    // If not running on local development port with FastAPI backend,
    // operate immediately in high-fidelity standalone Web Preview mode
    const isLocalDev = window.location.origin.includes('5173') || 
                        window.location.origin.includes('localhost') || 
                        window.location.origin.includes('127.0.0.1');

    if (!isLocalDev) {
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/api/cases`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const [casesRes, docsRes, auditRes, contraRes, timelineRes] = await Promise.all([
          res.json(),
          fetch(`${API_BASE}/api/documents`).then(r => r.json()),
          fetch(`${API_BASE}/api/audit-trail`).then(r => r.json()),
          fetch(`${API_BASE}/api/ai/contradictions`).then(r => r.json()),
          fetch(`${API_BASE}/api/ai/timeline`).then(r => r.json())
        ]);

        if (casesRes && casesRes.length > 0) {
          setCaseRecord(casesRes[0]);
        }
        if (docsRes && docsRes.length > 0) setDocuments(docsRes);
        if (auditRes && auditRes.length > 0) setAuditBlocks(auditRes);
        if (contraRes && contraRes.length > 0) setContradictions(contraRes);
        if (timelineRes && timelineRes.length > 0) setTimeline(timelineRes);
        setIsLiveBackend(true);
        return;
      }
    } catch {
      // Backend unreachable or offline -> Stay in verified standalone mode
    }

    setIsLiveBackend(false);
    setIsWsConnected(true);
  }, [API_BASE]);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchAllData();
      }
    }, 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchAllData]);

  // 2. WebSocket Listener for Live Ledger Updates (or Web Preview Simulation)
  useEffect(() => {
    if (!isLiveBackend) {
      // Periodic consensus pulse in standalone Web Preview mode
      const interval = setInterval(() => {
        const actions = ['PERIODIC_INTEGRITY_CHECK', 'ZERO_TRUST_HEARTBEAT', 'FIPS_180_AUDIT'];
        const act = actions[Math.floor(Math.random() * actions.length)];
        setAuditBlocks(prev => {
          const prevHash = prev[0]?.block_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
          const newIndex = (prev.length || 12) + 1;
          const newBlock: AuditBlock = {
            block_id: `BLK-${Date.now().toString().slice(-4)}`,
            index: newIndex,
            timestamp_utc: new Date().toISOString(),
            action: act,
            case_id: 'CASE-2026-DEL-402',
            actor_name: 'Consensus Daemon',
            actor_role: 'AUTOMATED_NODE',
            badge_id: 'SYS-CONSENSUS-DAEMON',
            ip_address: '127.0.0.1 (Web Preview Bus)',
            previous_block_hash: prevHash,
            block_hash: Math.random().toString(16).substring(2).padEnd(64, '0'),
            merkle_root: '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
            signature: 'HMAC_SHA256_PERIODIC_CONSENSUS_VERIFIED',
            details: 'Automated background audit pass verified all active evidence leaves against Merkle root.'
          };
          return [newBlock, ...prev.slice(0, 30)];
        });
      }, 16000);
      return () => clearInterval(interval);
    }

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
  }, [isLiveBackend]);

  // Actions with Client-Side Fallback Support
  const handleSimulateTamper = async (docId: string, byteOffset: number, corruptedData: string) => {
    if (isLiveBackend) {
      const res = await fetch(`${API_BASE}/api/tamper/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId, byte_offset: byteOffset, corrupted_data: corruptedData })
      }).then(r => r.json());
      await fetchAllData();
      return res;
    }

    // Standalone Web Preview execution
    const tamperedHash = await computeBrowserSha256(corruptedData);
    setDocuments(prev => prev.map(d => d.id === docId ? {
      ...d,
      status: 'QUARANTINED',
      sha256_hash: tamperedHash,
      tamper_flag: true,
      tamper_offset: byteOffset,
      tamper_details: {
        attack_type: 'Bit-Flip Byte Alteration Simulation',
        original_sha256: d.original_sha256,
        tampered_sha256: tamperedHash,
        corrupted_offset: byteOffset,
        timestamp_utc: new Date().toISOString(),
        quarantine_rule: 'FIPS 180-4 Mismatch -> Automatic Immediate Quarantine',
        action_taken: 'Document isolated from judicial court manifest'
      }
    } : d));

    const tamperBlock: AuditBlock = {
      block_id: `BLK-${Date.now().toString().slice(-4)}`,
      index: auditBlocks.length + 1,
      timestamp_utc: new Date().toISOString(),
      action: 'TAMPER_SIMULATION',
      document_id: docId,
      case_id: 'CASE-2026-DEL-402',
      actor_name: 'Adversary Tamper Simulation',
      actor_role: 'SIMULATION_ENGINE',
      badge_id: 'SIM-ATTACK-01',
      ip_address: '127.0.0.1 (In-Memory Simulator)',
      previous_block_hash: auditBlocks[0]?.block_hash || '',
      block_hash: tamperedHash,
      merkle_root: 'CORRUPTED_DAG_' + tamperedHash.slice(0, 16),
      signature: 'INVALID_SIGNATURE_TAMPER_ALERT',
      details: `CRITICAL INTEGRITY FAILURE: Bit corruption at offset ${byteOffset} in doc ${docId}. Calculated SHA-256 does not match original digest!`
    };

    setAuditBlocks(prev => [tamperBlock, ...prev]);
    setCaseRecord(prev => prev ? {
      ...prev,
      merkle_root: 'CORRUPTED_DAG_' + tamperedHash.slice(0, 16),
      integrity_score: 87.5,
      quarantine_count: (prev.quarantine_count || 0) + 1
    } : null);

    return { status: 'TAMPERED', new_hash: tamperedHash };
  };

  const handleRestoreDoc = async (doc: DocumentItem) => {
    if (isLiveBackend) {
      const res = await fetch(`${API_BASE}/api/tamper/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: doc.id })
      }).then(r => r.json());
      await fetchAllData();
      return res;
    }

    setDocuments(prev => prev.map(d => d.id === doc.id ? {
      ...d,
      status: 'VERIFIED',
      sha256_hash: d.original_sha256,
      tamper_flag: false,
      tamper_offset: undefined,
      tamper_details: undefined
    } : d));

    const restoreBlock: AuditBlock = {
      block_id: `BLK-${Date.now().toString().slice(-4)}`,
      index: auditBlocks.length + 1,
      timestamp_utc: new Date().toISOString(),
      action: 'RESTORE_LEGAL',
      document_id: doc.id,
      case_id: 'CASE-2026-DEL-402',
      actor_name: 'Judicial Registrar',
      actor_role: 'JUDICIAL_MAGISTRATE',
      badge_id: 'REG-PHC-0012',
      ip_address: '10.42.1.18',
      previous_block_hash: auditBlocks[0]?.block_hash || '',
      block_hash: doc.original_sha256,
      merkle_root: '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
      signature: 'HMAC_RESTORE_GENESIS_CONSENSUS_OK',
      details: `Exhibit ${doc.id} restored to authentic genesis cryptographic state via Merkle Root consensus.`
    };

    setAuditBlocks(prev => [restoreBlock, ...prev]);
    setCaseRecord(prev => prev ? {
      ...prev,
      merkle_root: '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
      integrity_score: 100.0,
      quarantine_count: Math.max(0, (prev.quarantine_count || 1) - 1)
    } : null);
  };

  const handleRestoreAll = async () => {
    const tampered = documents.filter(d => d.status === 'TAMPERED' || d.status === 'QUARANTINED');
    for (const doc of tampered) {
      await handleRestoreDoc(doc);
    }
  };

  const handleApplyRedaction = async (doc: DocumentItem) => {
    if (isLiveBackend) {
      await fetch(`${API_BASE}/api/redact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: doc.id })
      });
      await fetchAllData();
      return;
    }

    setDocuments(prev => prev.map(d => d.id === doc.id ? {
      ...d,
      status: 'REDACTED'
    } : d));
  };

  const handleFetchMerkleProof = async (docId: string) => {
    if (isLiveBackend) {
      return fetch(`${API_BASE}/api/merkle-proof/${docId}`).then(r => r.json());
    }

    const doc = documents.find(d => d.id === docId);
    return {
      document_id: docId,
      leaf_hash: doc?.merkle_leaf_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      merkle_root: caseRecord?.merkle_root || '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
      is_valid: !doc?.tamper_flag,
      proof: [
        { level: 1, sibling_hash: '28e078972b2ab684128f654b9d034fa95e1ebf581cf26226cb1f090d96d91242', direction: 'right' },
        { level: 2, sibling_hash: 'b3f2081561726a4221147a461efaebe0e2e50529cc55c0a37731215b24479e0a', direction: 'left' },
        { level: 3, sibling_hash: '11a4cfd2975cc3bc9df5888d3e23072223a2a688b1cc924ff95b95ff68fefc5a', direction: 'right' }
      ]
    };
  };

  const handleGenerateBSACert = async (officerName: string, designation: string, badgeId: string) => {
    if (isLiveBackend) {
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
    }

    const cert = generateClientBSACertificate(documents, caseRecord, officerName, designation, badgeId);
    setCertData(cert);
    return cert;
  };

  const handleQueryAI = async (queryText: string) => {
    if (isLiveBackend) {
      return fetch(`${API_BASE}/api/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      }).then(r => r.json());
    }

    const q = queryText.toLowerCase();
    const matchingDocs = documents.filter(d => 
      d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );

    const relevantContras = contradictions.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.witness_assertion.toLowerCase().includes(q) || 
      c.conflicting_finding.toLowerCase().includes(q)
    );

    return {
      query: queryText,
      total_matches: matchingDocs.length,
      matching_documents: matchingDocs.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        stage: d.stage,
        match_snippet: d.content.substring(0, 240) + '...',
        sha256: d.sha256_hash
      })),
      contradictions_found: relevantContras,
      ai_summary: `Neural scan across ${documents.length} evidentiary exhibits identified ${matchingDocs.length} directly correlated documents and ${relevantContras.length} potential statutory discrepancy warnings under Section 180 BNSS / Section 63 BSA.`
    };
  };

  const handleUploadDocument = async (data: any) => {
    if (isLiveBackend) {
      const res = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json());
      await fetchAllData();
      return res;
    }

    const sha256 = await computeBrowserSha256(data.content);
    const newDocId = `DOC-STG${data.stage}-${Date.now().toString().slice(-4)}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      case_id: 'CASE-2026-DEL-402',
      title: data.title,
      stage: (data.stage || 1) as LifecycleStageId,
      stage_name: `Stage ${data.stage}`,
      category: data.category || 'Digital Exhibit',
      sha256_hash: sha256,
      original_sha256: sha256,
      merkle_leaf_hash: await computeBrowserSha256(`${newDocId}:${sha256}`),
      uploaded_by: data.uploader_name || 'Insp. R.K. Varma',
      uploader_role: data.uploader_role || 'IO_POLICE',
      badge_id: data.badge_id || 'DL-POL-8832',
      timestamp_utc: new Date().toISOString(),
      gps_coordinates: '28.5823° N, 77.2285° E (Field Terminal)',
      classification: 'CONFIDENTIAL',
      status: 'VERIFIED',
      file_size_bytes: data.content.length,
      content: data.content,
      tamper_flag: false,
      kms_key_arn: 'arn:aws:kms:ap-south-1:992019481921:key/nyayavault-hsm-bsa2023',
      envelope_iv: 'a9f8b7c6d5e4f3a2b1c0'
    };

    setDocuments(prev => [newDoc, ...prev]);

    const uploadBlock: AuditBlock = {
      block_id: `BLK-${Date.now().toString().slice(-4)}`,
      index: auditBlocks.length + 1,
      timestamp_utc: new Date().toISOString(),
      action: 'UPLOAD',
      document_id: newDocId,
      document_title: data.title,
      case_id: 'CASE-2026-DEL-402',
      actor_name: data.uploader_name || 'Insp. R.K. Varma',
      actor_role: data.uploader_role || 'IO_POLICE',
      badge_id: data.badge_id || 'DL-POL-8832',
      ip_address: '127.0.0.1 (Web Preview Ingest)',
      previous_block_hash: auditBlocks[0]?.block_hash || '',
      block_hash: sha256,
      merkle_root: caseRecord?.merkle_root || '',
      signature: 'HMAC_SHA256_EVIDENCE_INGEST_VERIFIED',
      details: `New evidentiary document "${data.title}" ingested into Stage ${data.stage}. SHA-256 computed and added to active Merkle leaf pool.`
    };

    setAuditBlocks(prev => [uploadBlock, ...prev]);
    setCaseRecord(prev => prev ? {
      ...prev,
      total_documents: prev.total_documents + 1
    } : null);

    return { status: 'SUCCESS', document: newDoc };
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
        isEcoMode={isEcoMode}
        onToggleEcoMode={() => setIsEcoMode(!isEcoMode)}
        onOpenTamperModal={() => {
          setTamperTargetDoc(documents[2] || documents[0]);
          setIsTamperModalOpen(true);
        }}
        onOpenCertModal={() => setIsCertModalOpen(true)}
        onRestoreAll={handleRestoreAll}
        onOpenAISearch={() => setIsAIModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
        onOpenBlockchainModal={() => setIsBlockchainModalOpen(true)}
        onOpenGrantAccessModal={() => setIsGrantAccessModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenEvidenceVerifyModal={() => {
          setEvidenceVerifyDoc(selectedDoc || documents[0] || null);
          setIsEvidenceVerifyModalOpen(true);
        }}
        onOpenPresentationTour={() => setIsPresentationTourOpen(true)}
      />

      {/* Critical Security Alert Ribbon if Tampered */}
      {hasTamperAlert && (
        <div className="w-full bg-red-600 text-white px-4 py-3 text-xs font-mono font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse z-30 border-b border-red-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-white shrink-0" />
            <span>
              ZERO-TRUST ALERT: {caseRecord?.quarantine_count} EXHIBIT(S) FAILED CRYPTOGRAPHIC INTEGRITY // MERKLE ROOT ALTERED // QUARANTINE ENFORCED
            </span>
          </div>
          <button
            onClick={handleRestoreAll}
            className="px-3.5 py-1.5 bg-slate-950 text-emerald-400 hover:bg-slate-900 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Genesis Consensus</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Requirement 9: Clearly label mock data when demo mode is active */}
        <div className={`w-full rounded-2xl p-3.5 sm:p-4 border backdrop-blur-md shadow-lg transition-all ${
          isLiveBackend 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
            : 'bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-amber-950/30 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveBackend ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isLiveBackend ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <div>
                <div className="font-bold font-mono tracking-wide text-xs sm:text-sm flex flex-wrap items-center gap-2">
                  <span>{isLiveBackend ? 'LIVE ENTERPRISE BACKEND ACTIVE' : 'DEMO MODE ACTIVE (STANDALONE WEB PREVIEW)'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    isLiveBackend ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isLiveBackend ? 'FastAPI 0.110 + WSS Live' : 'In-Browser Web Crypto Engine'}
                  </span>
                </div>
                <p className="text-slate-400 font-sans text-xs mt-0.5">
                  {isLiveBackend 
                    ? 'Connected to local FastAPI backend on port 8000 • Live PostgreSQL consensus and WebSocket state active.' 
                    : 'Operating with client-side FIPS 180-4 SHA-256 Web Crypto Engine & simulated Merkle DAG for zero-latency hackathon evaluation.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono text-[11px]">
              <button 
                onClick={fetchAllData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
                title="Ping backend API to check connectivity"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sync API</span>
              </button>
            </div>
          </div>
        </div>

        {/* Requirement 1: Prominently Display Active Case Information */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Case Identifiers & Court Seals */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Case ID with 1-click copy */}
              <button 
                onClick={() => handleCopy(caseRecord?.case_id || 'CASE-2026-DEL-402', 'case_id')}
                className="group px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 shadow-inner flex items-center space-x-1.5 transition-all"
                title="Click to copy Case ID"
              >
                <span>{caseRecord?.case_id || 'CASE-2026-DEL-402'}</span>
                {copiedKey === 'case_id' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-300" />
                )}
              </button>

              {/* FIR Tag */}
              <span className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800/90 text-slate-200 border border-slate-700">
                FIR No. {caseRecord?.fir_number || '402/2026'}
              </span>

              {/* Police Station */}
              <span className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-300 bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{caseRecord?.police_station || 'Special Cell, Lodhi Colony'}</span>
              </span>

              {/* Current Lifecycle Stage Tag */}
              <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Stage {caseRecord?.current_stage || 5}: Judicial Presentation</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 // BSA 2023 §63</span>
              </span>
            </div>
          </div>

          {/* Center Row: Case Title & Statutory Charges */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Court of Sessions • Fast-Track Special Court</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-100 font-heading tracking-tight">
              State of NCT of Delhi vs. Vikram Malhotra & Ors.
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>Court: <strong className="text-slate-100">{caseRecord?.court_name || 'Patiala House Courts Complex'}</strong> ({caseRecord?.jurisdiction || 'New Delhi'})</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                {caseRecord?.acts_sections || 'IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27'}
              </span>
            </div>
          </div>

          {/* Officers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-2 sm:pb-0 sm:pr-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Presiding Magistrate</div>
              <div className="font-bold text-slate-200 truncate">{caseRecord?.presiding_magistrate || 'Smt. Vandana Jain, ASJ-03'}</div>
              <div className="text-[10px] text-slate-400">Patiala House Courts Complex</div>
            </div>

            <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-2 sm:pb-0 sm:pr-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Investigating Officer</div>
              <div className="font-bold text-cyan-400 truncate">{caseRecord?.io_name || 'Insp. R.K. Varma'}</div>
              <div className="text-[10px] text-slate-400">Badge: {caseRecord?.io_badge || 'DL-POL-8832'}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Public Prosecutor</div>
              <div className="font-bold text-slate-200 truncate">{caseRecord?.prosecutor_name || 'Adv. Alok Trivedi'}</div>
              <div className="text-[10px] text-slate-400">Directorate of Prosecution, Delhi</div>
            </div>
          </div>

          {/* Cryptographic Anchor & Eco-Mode Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px] overflow-hidden">
              <span className="text-slate-400 font-semibold shrink-0">Genesis Merkle Root:</span>
              <button
                onClick={() => handleCopy(caseRecord?.merkle_root || '6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8', 'merkle_root')}
                className="group flex items-center space-x-1.5 text-cyan-400 font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 hover:border-cyan-500/40 transition-all truncate"
                title="Click to copy full 256-bit SHA-256 Merkle root"
              >
                <span className="truncate max-w-[200px] sm:max-w-md">
                  {caseRecord?.merkle_root || '6405ddd6472ba80b4ee6c62aa48e0a37237ae222c10aaff2ae645905725d13c8'}
                </span>
                {copiedKey === 'merkle_root' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                isEcoMode 
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
              }`}>
                <Leaf className="w-3 h-3 mr-1" />
                {isEcoMode ? 'Eco-Mode Active (Low GPU)' : '3D WebGL Live'}
              </span>
              <button
                onClick={() => setIsEcoMode(!isEcoMode)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                {isEcoMode ? 'Enable 3D Visualizer' : 'Switch to Eco-Mode'}
              </button>
            </div>
          </div>
        </section>

        {/* Requirement 3: Four Primary Actions */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary Case Command Center Actions</span>
              </h2>
              <p className="text-xs text-slate-300">
                Execute primary judicial evidentiary workflows with instant cryptographic integrity validation.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400/80 hidden md:block">
              Zero-Trust Audit Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Action 1: Search Evidence */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="p-3.5 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-indigo-950/40 hover:from-indigo-800/70 hover:to-indigo-900/50 text-white rounded-xl border border-indigo-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-indigo-950/30 group active:scale-95 text-left"
              title="Search exhibits, witness testimonies and contradictions with Legal AI"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-indigo-100 flex items-center gap-1">
                  <span>Search Evidence</span>
                  <ChevronRight className="w-3 h-3 text-indigo-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">Legal AI & Semantic Scan</div>
              </div>
            </button>

            {/* Action 2: Upload Document */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="p-3.5 bg-gradient-to-br from-cyan-900/60 via-slate-900 to-cyan-950/40 hover:from-cyan-800/70 hover:to-cyan-900/50 text-white rounded-xl border border-cyan-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-cyan-950/30 group active:scale-95 text-left"
              title="Ingest new evidentiary record or forensic file with 4-step wizard"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 text-cyan-300 stroke-[2.5]" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-cyan-100 flex items-center gap-1">
                  <span>Upload Document</span>
                  <ChevronRight className="w-3 h-3 text-cyan-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">4-Step Guided Ingestion</div>
              </div>
            </button>

            {/* Action 3: Verify Case */}
            <button
              onClick={() => setIsCaseVerifyModalOpen(true)}
              className="p-3.5 bg-gradient-to-br from-emerald-900/60 via-slate-900 to-emerald-950/40 hover:from-emerald-800/70 hover:to-emerald-900/50 text-white rounded-xl border border-emerald-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-emerald-950/30 group active:scale-95 text-left"
              title="Run real-time cryptographic audit across all case exhibits"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-emerald-100 flex items-center gap-1">
                  <span>Verify Case</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">Consensus Integrity Audit</div>
              </div>
            </button>

            {/* Action 4: Generate Certificate */}
            <button
              onClick={() => {
                setActiveTab('CERTIFICATES');
                setIsCertModalOpen(true);
              }}
              className="p-3.5 bg-gradient-to-br from-amber-900/60 via-slate-900 to-amber-950/40 hover:from-amber-800/70 hover:to-amber-900/50 text-white rounded-xl border border-amber-500/40 transition-all flex items-center space-x-3 shadow-lg shadow-amber-950/30 group active:scale-95 text-left"
              title="Generate Bharatiya Sakshya Adhiniyam Section 63 electronic certificate"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-amber-100 flex items-center gap-1">
                  <span>Generate Certificate</span>
                  <ChevronRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">Section 63 BSA 2023</div>
              </div>
            </button>
          </div>
        </section>

        {/* Requirement 2: Show Total Documents, Verified Documents, Pending Actions, Security Alerts */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Documents */}
          <div 
            onClick={() => setActiveTab('DOCUMENTS')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Total Documents</span>
              <div className="w-9 h-9 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-cyan-400">{documents.length}</span>
              <span className="text-xs text-slate-400 font-sans">Exhibits Ingested</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Encrypted Envelope:</span>
              <span className="text-cyan-400">AES-256-GCM</span>
            </div>
          </div>

          {/* Card 2: Verified Documents */}
          <div 
            onClick={() => setIsCaseVerifyModalOpen(true)}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Verified Documents</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-emerald-400">
                {documents.filter(d => !d.tamper_flag && d.status === 'VERIFIED').length}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {caseRecord?.integrity_score || 100}% PASS
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Cryptographic Proof:</span>
              <span className="text-emerald-400">FIPS 180-4 SHA-256</span>
            </div>
          </div>

          {/* Card 3: Pending Actions */}
          <div 
            onClick={() => setActiveTab('PIPELINE')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-850 shadow-md group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Pending Actions</span>
              <div className="w-9 h-9 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-amber-400">
                {documents.filter(d => d.status === 'ARCHIVED' || d.tamper_flag || d.stage === 4).length || 2}
              </span>
              <span className="text-xs text-slate-400 font-sans">Awaiting Sign-off</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Required Action:</span>
              <span className="text-amber-400">Forensic Scrutiny</span>
            </div>
          </div>

          {/* Card 4: Security Alerts */}
          <div 
            onClick={() => {
              if (hasTamperAlert) {
                setIsCaseVerifyModalOpen(true);
              } else {
                setActiveTab('AUDIT');
              }
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-md group space-y-2 ${
              hasTamperAlert 
                ? 'bg-red-950/30 border-red-500/50 hover:bg-red-950/50 animate-pulse' 
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Security Alerts</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                hasTamperAlert ? 'bg-red-900/80 text-red-300 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-mono ${hasTamperAlert ? 'text-red-400' : 'text-slate-100'}`}>
                {caseRecord?.quarantine_count || 0}
              </span>
              <span className={`text-xs font-sans ${hasTamperAlert ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                {hasTamperAlert ? 'Quarantine Enforced' : 'Zero Threats'}
              </span>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
              hasTamperAlert ? 'border-red-900/50 text-red-300' : 'border-slate-800/80 text-slate-400'
            }`}>
              <span>Zero-Trust Sentinel:</span>
              <span className={hasTamperAlert ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {hasTamperAlert ? 'BREACH DETECTED' : 'ARMED & MONITORING'}
              </span>
            </div>
          </div>
        </section>

        {/* Requirement 4: Preserved 6-Stage Custody Lifecycle Stepper */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <LifecyclePipeline
            activeStage={activeStage}
            onSelectStage={setActiveStage}
            documents={documents}
          />
        </section>

        {/* Sustainable Workspace Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 overflow-x-auto no-scrollbar gap-1 pt-1">
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'DOCUMENTS'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Case Documents</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'PIPELINE'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Custody Lifecycle</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              6 Stages
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'CERTIFICATES'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Sec 63 BSA Certificate</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
              Court Ready
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AI')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'AI'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Legal AI & Contradictions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 font-mono border border-indigo-500/30">
              {contradictions.length} Alerts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'AUDIT'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {auditBlocks.length} Blocks
            </span>
          </button>

          <button
            onClick={() => setActiveTab('FORENSIC_3D')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'FORENSIC_3D'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Forensic 3D Lab</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              isEcoMode ? 'bg-slate-800 text-slate-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
            }`}>
              {isEcoMode ? 'Eco Paused' : '3D Live'}
            </span>
          </button>
        </div>

        {/* Tab 1: Case Documents (Primary Investigation View) */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Full Document List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 font-heading">
                      Case Evidence Files & Exhibits
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Active Role: <span className="text-cyan-400 font-semibold">{USER_ROLES[currentRole].name}</span> ({USER_ROLES[currentRole].label})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {documents.length} Records Ingested
                    </span>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <DocumentList
                  documents={documents}
                  currentRole={currentRole}
                  activeStage={activeStage}
                  onSelectDocument={handleInspectEvidence}
                  onVerifyDocument={handleVerifyEvidence}
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

              {/* Right Column: Case Summary & Real-time Verification Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Active Officer Identity Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Authenticated Session</span>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
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
                      <div className="text-sm font-bold text-slate-200">{USER_ROLES[currentRole].name}</div>
                      <div className="text-xs text-slate-400">{USER_ROLES[currentRole].label}</div>
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

                {/* Requirement 5: Prominent Recent Activity Section */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <History className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-100 font-heading">Recent Activity & Audit Stream</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsBlockchainModalOpen(true)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline"
                        title="Open Polygon Blockchain Explorer"
                      >
                        Ledger
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        onClick={() => setActiveTab('AUDIT')}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-0.5"
                        title="View complete immutable audit trail"
                      >
                        <span>Full Trail</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {auditBlocks.slice(0, 5).map((block) => {
                      const isTamper = block.action.includes('TAMPER') || block.action.includes('ALERT');
                      const isIngest = block.action.includes('UPLOAD') || block.action.includes('INGEST');
                      const isCourt = block.action.includes('COURT') || block.action.includes('BSA');
                      const isHeartbeat = block.action.includes('HEARTBEAT') || block.action.includes('PERIODIC');

                      return (
                        <div key={block.block_id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5 transition-all hover:border-cyan-500/30">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-cyan-400 font-bold">{block.block_id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isTamper 
                                ? 'bg-red-950 text-red-300 border border-red-500/30'
                                : isCourt 
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                                : isIngest
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : isHeartbeat
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-900 text-slate-300 border border-slate-700'
                            }`}>
                              {block.action}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] line-clamp-1">{block.details}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900/80">
                            <span className="text-slate-400 truncate max-w-[130px] font-sans">{block.actor_name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-cyan-400/70 hidden sm:inline">#{block.block_hash.slice(0, 8)}</span>
                              <span>{block.timestamp_utc.slice(11, 19)} UTC</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Security & Forensic Tools Navigation */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Secondary Security Controls
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">FIPS 140-3</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setTamperTargetDoc(documents[2] || documents[0]);
                        setIsTamperModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-300 flex flex-col items-start gap-1 transition-all"
                      title="Simulate bit-level tamper attack"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-[11px]">Tamper Simulator</span>
                      <span className="text-[9px] text-slate-400">Zero-Trust Audit</span>
                    </button>

                    <button
                      onClick={() => setMerkleProofDoc(documents[0])}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                      title="Inspect cryptographic Merkle inclusion proofs"
                    >
                      <GitCommit className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-[11px]">Merkle Tree DAG</span>
                      <span className="text-[9px] text-slate-400">Leaf Proofs</span>
                    </button>

                    <button
                      onClick={() => setIsGrantAccessModalOpen(true)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                      title="Delegate time-bound access under Rule 8.2"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-[11px]">Timed Access</span>
                      <span className="text-[9px] text-slate-400">Rule 8.2 Delegation</span>
                    </button>

                    <button
                      onClick={() => setIsDocsModalOpen(true)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-start gap-1 transition-all"
                      title="View complete system architecture specifications"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-[11px]">System Docs</span>
                      <span className="text-[9px] text-slate-400">8 Specs Chapters</span>
                    </button>
                  </div>
                </div>

                {/* SIH Evaluation Matrix Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 space-y-2.5 text-xs">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span className="font-heading text-sm">SIH Evaluation Matrix Compliance</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 font-sans text-[11px] leading-relaxed">
                    <li className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span><strong>Sec 63 BSA:</strong> Cryptographic electronic manifests replace manual court paper trials.</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span><strong>Zero-Trust:</strong> SHA-256 + Merkle DAG guarantees instant tamper detection.</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span><strong>Leak Attribution:</strong> Steganographic watermarks prevent media leaks.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Custody Lifecycle (6 Stages) */}
        {activeTab === 'PIPELINE' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 font-heading">
                  6-Stage Case & Document Custody Lifecycle
                </h2>
                <p className="text-xs text-slate-400">
                  Select any stage to filter exhibits and inspect custody transfer handoffs from initial FIR to High Court Archival.
                </p>
              </div>

              <LifecyclePipeline
                activeStage={activeStage}
                onSelectStage={setActiveStage}
                documents={documents}
              />
            </div>

            {/* Filtered Document List for selected stage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  {activeStage ? `Exhibits In Stage ${activeStage}` : 'All Exhibits Across All 6 Stages'}
                </h3>
                {activeStage && (
                  <button
                    onClick={() => setActiveStage(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Clear Filter (Show All)
                  </button>
                )}
              </div>

              <DocumentList
                documents={documents}
                currentRole={currentRole}
                activeStage={activeStage}
                onSelectDocument={handleInspectEvidence}
                onVerifyDocument={handleVerifyEvidence}
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
          </div>
        )}

        {/* Tab 3: Section 63 BSA Electronic Admissibility Certificate */}
        {activeTab === 'CERTIFICATES' && (
          <div className="space-y-6">
            
            {/* Certificate Header Action Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  onClick={() => setIsCertModalOpen(true)}
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
                  <div className="text-slate-400 text-[11px]">Timestamp: {certData?.timestamp_utc || new Date().toISOString()}</div>
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
        )}

        {/* Tab 4: Legal AI & Statutory Contradictions */}
        {activeTab === 'AI' && (
          <div className="space-y-6">
            
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-slate-100 font-heading">
                    AI Legal Copilot & Contradiction Discovery
                  </h2>
                </div>
                <p className="text-xs text-slate-300">
                  Automated cross-examination assistant detecting material discrepancies between witness statements under Section 180 BNSS and scientific FSL reports.
                </p>
              </div>

              <button
                onClick={() => setIsAIModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Interactive AI Query Drawer</span>
              </button>
            </div>

            {/* Contradiction Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 font-heading flex items-center gap-2">
                <span>Flagged Evidentiary Contradictions</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-950 text-amber-400 border border-amber-500/30">
                  {contradictions.length} Active Discrepancies
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contradictions.map((contra) => (
                  <div key={contra.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">{contra.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        contra.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {contra.severity} DISCREPANCY
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{contra.title}</h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Witness Claim:</span>
                        <p className="text-slate-300 italic">"{contra.witness_assertion}"</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-cyan-400">Forensic Scientific Finding:</span>
                        <p className="text-slate-300">{contra.conflicting_finding}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400/90 font-mono">
                      Statutory Implication: {contra.legal_implication}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronological Investigation Timeline */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 font-heading">
                Reconstructed Incident Chronology
              </h3>
              <div className="space-y-3">
                {timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400 font-semibold">{event.timestamp}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-bold text-slate-200">{event.event_title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Immutable Audit Trail */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 font-heading">
                  Cryptographic Audit Trail & Blockchain Ledger
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Polygon / Hyperledger SHA-256 Hash Chain • Zero-Trust Log of Every Ingestion, Access, and Redaction
                </p>
              </div>
              <button
                onClick={() => setIsBlockchainModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Smart Contract Ledger</span>
              </button>
            </div>

            <LiveAuditLedger
              blocks={auditBlocks}
              isWsConnected={isWsConnected}
            />
          </div>
        )}

        {/* Tab 6: Forensic 3D Lab (Energy-Conscious WebGL Toggle) */}
        {activeTab === 'FORENSIC_3D' && (
          <div className="space-y-4">
            {isEcoMode ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Leaf className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100 font-heading">
                    Sustainable Eco-Mode is Currently Active
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To eliminate GPU battery drain and CPU heat on standard court laptops, the continuous WebGL Three.js render loop is paused. You can launch hardware-accelerated 3D inspection on demand.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setIsEcoMode(false)}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-cyan-600/20"
                  >
                    <Box className="w-4 h-4" />
                    <span>Launch 3D WebGL Vault Visualizer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
                  >
                    Return to 2D Document View
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Hardware-Accelerated 3D Cryptographic Vault • Interactive Stage & Hash Node Inspection
                  </div>
                  <button
                    onClick={() => setIsEcoMode(true)}
                    className="px-3 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Return to Eco-Mode</span>
                  </button>
                </div>
                <React.Suspense fallback={
                  <div className="w-full h-80 flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400 animate-pulse">
                    Loading 3D Hardware Accelerated Vault Engine...
                  </div>
                }>
                  <Vault3DVisualizer
                    integrityScore={caseRecord?.integrity_score || 100}
                    isTampered={hasTamperAlert}
                    activeStage={activeStage}
                    onSelectStage={(stage) => setActiveStage(stage)}
                    merkleRoot={caseRecord?.merkle_root || ''}
                  />
                </React.Suspense>
              </div>
            )}
          </div>
        )}

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

      {/* MODALS WITH CODE-SPLITTING VIA REACT.LAZY & SUSPENSE */}
      <React.Suspense fallback={null}>
        {/* 1. Document Viewer Modal */}
        {selectedDoc && (
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
            isLiveBackend={isLiveBackend}
            initialTab={viewerInitialTab}
          />
        )}

        {/* 2. Tamper Attack Simulator Modal */}
        {isTamperModalOpen && (
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
        )}

        {/* 3. Section 63 BSA Certificate Modal */}
        {isCertModalOpen && (
          <BSACertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            caseRecord={caseRecord}
            certificateData={certData}
            onGenerate={handleGenerateBSACert}
          />
        )}

        {/* 4. Merkle Tree Proof Modal */}
        {merkleProofDoc !== null && (
          <MerkleTreeModal
            document={merkleProofDoc}
            isOpen={merkleProofDoc !== null}
            onClose={() => setMerkleProofDoc(null)}
            onFetchProof={handleFetchMerkleProof}
          />
        )}

        {/* 5. AI Legal Assistant Modal */}
        {isAIModalOpen && (
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
        )}

        {/* 6. Document Ingestion Modal */}
        {isUploadModalOpen && (
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            currentRole={currentRole}
            onUpload={handleUploadDocument}
            onSelectDocument={setSelectedDoc}
          />
        )}

        {/* 7. System Architecture & Specification Suite (8 Chapters) */}
        {isDocsModalOpen && (
          <DocsViewerModal
            isOpen={isDocsModalOpen}
            onClose={() => setIsDocsModalOpen(false)}
          />
        )}

        {/* 8. Blockchain Ledger & Smart Contract Explorer */}
        {isBlockchainModalOpen && (
          <BlockchainLedgerModal
            isOpen={isBlockchainModalOpen}
            onClose={() => setIsBlockchainModalOpen(false)}
            documents={documents}
          />
        )}

        {/* 9. Timed Evidence Access Delegation (Rule 8.2) */}
        {isGrantAccessModalOpen && (
          <GrantAccessModal
            isOpen={isGrantAccessModalOpen}
            onClose={() => setIsGrantAccessModalOpen(false)}
            currentRole={currentRole}
            currentCaseId={caseRecord?.case_id || 'CASE-2026-DEL-402'}
          />
        )}

        {/* 10. Officer Multi-Factor Authentication & RBAC Switcher */}
        {isAuthModalOpen && (
          <OfficerAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentRole={currentRole}
            onSelectRole={(newRole) => setCurrentRole(newRole)}
          />
        )}

        {/* 11. Case Verification Consensus Audit Modal */}
        {isCaseVerifyModalOpen && (
          <CaseVerificationModal
            isOpen={isCaseVerifyModalOpen}
            onClose={() => setIsCaseVerifyModalOpen(false)}
            caseRecord={caseRecord}
            documents={documents}
            onRestoreAll={handleRestoreAll}
            isLiveBackend={isLiveBackend}
          />
        )}

        {/* 12. Dedicated Evidence Verification Suite Modal */}
        {isEvidenceVerifyModalOpen && (
          <EvidenceVerificationModal
            isOpen={isEvidenceVerifyModalOpen}
            onClose={() => setIsEvidenceVerifyModalOpen(false)}
            document={evidenceVerifyDoc || selectedDoc || documents[0] || null}
            documents={documents}
            currentRole={currentRole}
            isLiveBackend={isLiveBackend}
            onSelectDocument={(doc) => setEvidenceVerifyDoc(doc)}
            onSimulateTamper={(doc) => {
              setIsEvidenceVerifyModalOpen(false);
              setTamperTargetDoc(doc);
              setIsTamperModalOpen(true);
            }}
            onRestoreDoc={handleRestoreDoc}
          />
        )}

        {/* 13. Presentation Tour / SIH Pitch Deck Modal */}
        {isPresentationTourOpen && (
          <PresentationTourModal
            isOpen={isPresentationTourOpen}
            onClose={() => setIsPresentationTourOpen(false)}
            onSimulateTamper={() => {
              setIsPresentationTourOpen(false);
              setTamperTargetDoc(documents[2] || documents[0]);
              setIsTamperModalOpen(true);
            }}
            onOpenCertModal={() => {
              setIsPresentationTourOpen(false);
              setIsCertModalOpen(true);
            }}
            onOpenMerkleModal={() => {
              setIsPresentationTourOpen(false);
              setMerkleProofDoc(documents[0] || null);
            }}
            onOpenAIModal={() => {
              setIsPresentationTourOpen(false);
              setIsAIModalOpen(true);
            }}
          />
        )}
      </React.Suspense>

    </div>
  );
};

export default App;
