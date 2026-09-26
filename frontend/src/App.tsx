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
  getClientInitialMockState, 
  generateClientBSACertificate, 
  computeBrowserSha256 
} from './mockData';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Fingerprint,
  Scale,
  FileText
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
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

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

  // 1. Initial Data Fetching with Resilient Standalone Web Preview Fallback
  const fetchAllData = async () => {
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
        setDocuments(docsRes || []);
        setAuditBlocks(auditRes || []);
        setContradictions(contraRes || []);
        setTimeline(timelineRes || []);
        setIsLiveBackend(true);
        return;
      }
    } catch {
      // Backend unreachable or offline -> Activate standalone client-side Web Preview
    }

    // Activate Standalone Web Preview with In-Browser Cryptography
    setIsLiveBackend(false);
    const mock = await getClientInitialMockState();
    setCaseRecord(mock.caseRecord);
    setDocuments(mock.documents);
    setAuditBlocks(mock.auditBlocks);
    setContradictions(mock.contradictions);
    setTimeline(mock.timeline);
    setIsWsConnected(true);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. WebSocket Listener for Live Ledger Updates (or Web Preview Simulation)
  useEffect(() => {
    if (!isLiveBackend) {
      // Periodic consensus pulse in standalone Web Preview mode
      const interval = setInterval(() => {
        const actions = ['PERIODIC_INTEGRITY_CHECK', 'ZERO_TRUST_HEARTBEAT', 'FIPS_180_AUDIT'];
        const act = actions[Math.floor(Math.random() * actions.length)];
        const newBlock: AuditBlock = {
          block_id: `BLK-${Date.now().toString().slice(-4)}`,
          index: (auditBlocks.length || 12) + 1,
          timestamp_utc: new Date().toISOString(),
          action: act,
          case_id: 'CASE-2026-DEL-402',
          actor_name: 'Consensus Daemon',
          actor_role: 'AUTOMATED_NODE',
          badge_id: 'SYS-CONSENSUS-DAEMON',
          ip_address: '127.0.0.1 (Web Preview Bus)',
          previous_block_hash: auditBlocks[0]?.block_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          block_hash: Math.random().toString(16).substring(2).padEnd(64, '0'),
          merkle_root: caseRecord?.merkle_root || '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
          signature: 'HMAC_SHA256_PERIODIC_CONSENSUS_VERIFIED',
          details: 'Automated background audit pass verified all active evidence leaves against Merkle root.'
        };
        setAuditBlocks(prev => [newBlock, ...prev.slice(0, 30)]);
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
        
        {/* Executive Cybernetic Telemetry Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Consensus Integrity</div>
              <div className="flex items-center space-x-2">
                <span className={`text-xl sm:text-2xl font-black font-mono ${hasTamperAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                  {caseRecord?.integrity_score || 100}%
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  hasTamperAlert ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {hasTamperAlert ? 'COMPROMISED' : 'SECURE'}
                </span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasTamperAlert ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Ingested Exhibits</div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">{documents.length}</span>
                <span className="text-xs text-slate-400 font-sans">Active Records</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border-slate-800/80 hover:border-indigo-500/30 transition-all">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Statutory Standard</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-indigo-300 font-heading">Sec 63 BSA 2023</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Court Admissible Manifest</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Forensic Attribution</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">STEGO SEAL</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero-Width Token Active</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
          </div>
        </section>

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
