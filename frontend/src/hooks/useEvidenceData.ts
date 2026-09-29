import { useState, useCallback, useEffect } from 'react';
import type {
  CaseRecord,
  DocumentItem,
  AuditBlock,
  ContradictionItem,
  TimelineEvent,
  BSACertificateData,
  LifecycleStageId
} from '../types';
import {
  INITIAL_CASE,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_CONTRADICTIONS,
  INITIAL_TIMELINE,
  generateClientBSACertificate,
  computeBrowserSha256
} from '../services/demoData';
import { NyayaVaultApi, isLocalDevEnvironment } from '../services/api';

export interface UseEvidenceDataReturn {
  caseRecord: CaseRecord | null;
  documents: DocumentItem[];
  auditBlocks: AuditBlock[];
  contradictions: ContradictionItem[];
  timeline: TimelineEvent[];
  isLiveBackend: boolean;
  isLoadingDocs: boolean;
  certData: BSACertificateData | null;
  setCaseRecord: React.Dispatch<React.SetStateAction<CaseRecord | null>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  setAuditBlocks: React.Dispatch<React.SetStateAction<AuditBlock[]>>;
  setCertData: React.Dispatch<React.SetStateAction<BSACertificateData | null>>;
  fetchAllData: () => Promise<void>;
  handleSimulateTamper: (docId: string, byteOffset: number, corruptedData: string) => Promise<any>;
  handleRestoreDoc: (doc: DocumentItem) => Promise<any>;
  handleRestoreAll: () => Promise<void>;
  handleApplyRedaction: (doc: DocumentItem) => Promise<void>;
  handleFetchMerkleProof: (docId: string) => Promise<any>;
  handleGenerateBSACert: (officerName: string, designation: string, badgeId: string) => Promise<BSACertificateData>;
  handleQueryAI: (queryText: string) => Promise<any>;
  handleUploadDocument: (data: any) => Promise<any>;
}

export function useEvidenceData(): UseEvidenceDataReturn {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(INITIAL_CASE);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>(INITIAL_AUDIT_BLOCKS);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>(INITIAL_CONTRADICTIONS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);

  const [certData, setCertData] = useState<BSACertificateData | null>(() =>
    generateClientBSACertificate(INITIAL_DOCUMENTS, INITIAL_CASE, 'Insp. R.K. Varma', 'Investigating Officer', 'DL-POL-8832')
  );

  // 1. Initial Data Fetching with Resilient Standalone Web Preview Fallback
  const fetchAllData = useCallback(async () => {
    if (!isLocalDevEnvironment()) {
      return;
    }

    setIsLoadingDocs(true);
    try {
      const isHealthy = await NyayaVaultApi.checkHealth();
      if (isHealthy) {
        const [casesRes, docsRes, auditRes, contraRes, timelineRes] = await Promise.all([
          NyayaVaultApi.getCases(),
          NyayaVaultApi.getDocuments(),
          NyayaVaultApi.getAuditTrail(),
          NyayaVaultApi.getContradictions(),
          NyayaVaultApi.getTimeline()
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
    } finally {
      setIsLoadingDocs(false);
    }

    setIsLiveBackend(false);
  }, []);

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

  // Actions with Client-Side Fallback Support
  const handleSimulateTamper = useCallback(async (docId: string, byteOffset: number, corruptedData: string) => {
    if (isLiveBackend) {
      const res = await NyayaVaultApi.simulateTamper(docId, byteOffset, corruptedData);
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
  }, [isLiveBackend, fetchAllData, auditBlocks]);

  const handleRestoreDoc = useCallback(async (doc: DocumentItem) => {
    if (isLiveBackend) {
      const res = await NyayaVaultApi.restoreDocument(doc.id);
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
  }, [isLiveBackend, fetchAllData, auditBlocks]);

  const handleRestoreAll = useCallback(async () => {
    const tampered = documents.filter(d => d.status === 'TAMPERED' || d.status === 'QUARANTINED');
    for (const doc of tampered) {
      await handleRestoreDoc(doc);
    }
  }, [documents, handleRestoreDoc]);

  const handleApplyRedaction = useCallback(async (doc: DocumentItem) => {
    if (isLiveBackend) {
      await NyayaVaultApi.applyRedaction(doc.id);
      await fetchAllData();
      return;
    }

    setDocuments(prev => prev.map(d => d.id === doc.id ? {
      ...d,
      status: 'REDACTED'
    } : d));
  }, [isLiveBackend, fetchAllData]);

  const handleFetchMerkleProof = useCallback(async (docId: string) => {
    if (isLiveBackend) {
      return NyayaVaultApi.getMerkleProof(docId);
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
  }, [isLiveBackend, documents, caseRecord]);

  const handleGenerateBSACert = useCallback(async (officerName: string, designation: string, badgeId: string) => {
    if (isLiveBackend) {
      const cert = await NyayaVaultApi.generateBSACertificate(
        caseRecord?.case_id || 'CASE-2026-DEL-402',
        officerName,
        designation,
        badgeId
      );
      setCertData(cert);
      await fetchAllData();
      return cert;
    }

    const cert = generateClientBSACertificate(documents, caseRecord, officerName, designation, badgeId);
    setCertData(cert);
    return cert;
  }, [isLiveBackend, caseRecord, documents, fetchAllData]);

  const handleQueryAI = useCallback(async (queryText: string) => {
    if (isLiveBackend) {
      return NyayaVaultApi.queryLegalAI(queryText);
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
  }, [isLiveBackend, documents, contradictions]);

  const handleUploadDocument = useCallback(async (data: any) => {
    if (isLiveBackend) {
      const res = await NyayaVaultApi.uploadDocument(data);
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

    return { 
      status: 'SUCCESS', 
      document: newDoc, 
      merkle_root: caseRecord?.merkle_root || '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324' 
    };
  }, [isLiveBackend, fetchAllData, auditBlocks, caseRecord]);

  return {
    caseRecord,
    documents,
    auditBlocks,
    contradictions,
    timeline,
    isLiveBackend,
    isLoadingDocs,
    certData,
    setCaseRecord,
    setDocuments,
    setAuditBlocks,
    setCertData,
    fetchAllData,
    handleSimulateTamper,
    handleRestoreDoc,
    handleRestoreAll,
    handleApplyRedaction,
    handleFetchMerkleProof,
    handleGenerateBSACert,
    handleQueryAI,
    handleUploadDocument
  };
}
