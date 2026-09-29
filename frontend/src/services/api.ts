import type {
  CaseRecord,
  DocumentItem,
  AuditBlock,
  ContradictionItem,
  TimelineEvent,
  BSACertificateData
} from '../types';

// Base API URL calculation (supports HTTPS proxying and local dev)
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  if (window.location.protocol === 'https:') return '';
  return window.location.origin.includes('5173') ? 'http://127.0.0.1:8000' : '';
};

export const API_BASE = getApiBaseUrl();

/**
 * Check if current runtime environment is connected to local dev backend
 */
export const isLocalDevEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.origin.includes('5173') ||
    window.location.origin.includes('localhost') ||
    window.location.origin.includes('127.0.0.1')
  );
};

export interface EvidenceVerificationRequest {
  document_id: string;
  expected_sha256?: string;
  user_role?: string;
  case_id?: string;
}

export interface VerificationVectorResult {
  status: 'VERIFIED' | 'FAILED' | 'PENDING' | 'UNAVAILABLE';
  title: string;
  details: string;
  technical_info?: string;
  checked_at_utc?: string;
}

export interface EvidenceVerificationResponse {
  document_id: string;
  case_id: string;
  overall_verdict: 'VERIFIED' | 'INTEGRITY_BREACH' | 'PARTIAL' | 'UNAUTHORIZED';
  sha256_verification: VerificationVectorResult;
  ledger_verification: VerificationVectorResult;
  merkle_proof_verification: VerificationVectorResult;
  signature_verification: VerificationVectorResult;
  access_authorization: VerificationVectorResult;
  integrity_score: number;
  report_timestamp_utc: string;
  recommended_action: string;
}

/**
 * Production API Service for NyayaVault
 */
export const NyayaVaultApi = {
  /**
   * Health check / ping backend
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/api/cases`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch case records
   */
  async getCases(): Promise<CaseRecord[]> {
    const res = await fetch(`${API_BASE}/api/cases`);
    if (!res.ok) throw new Error(`Failed to fetch cases: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Fetch all documents
   */
  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/api/documents`);
    if (!res.ok) throw new Error(`Failed to fetch documents: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Fetch audit blocks
   */
  async getAuditTrail(): Promise<AuditBlock[]> {
    const res = await fetch(`${API_BASE}/api/audit-trail`);
    if (!res.ok) throw new Error(`Failed to fetch audit trail: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Fetch AI contradiction findings
   */
  async getContradictions(): Promise<ContradictionItem[]> {
    const res = await fetch(`${API_BASE}/api/ai/contradictions`);
    if (!res.ok) throw new Error(`Failed to fetch contradictions: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Fetch reconstructed timeline
   */
  async getTimeline(): Promise<TimelineEvent[]> {
    const res = await fetch(`${API_BASE}/api/ai/timeline`);
    if (!res.ok) throw new Error(`Failed to fetch timeline: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Simulate bit-flip tamper attack
   */
  async simulateTamper(docId: string, byteOffset: number, corruptedData: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/tamper/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId, byte_offset: byteOffset, corrupted_data: corruptedData })
    });
    if (!res.ok) throw new Error(`Failed to simulate tamper: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Restore tampered document to authentic genesis state
   */
  async restoreDocument(docId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/tamper/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId })
    });
    if (!res.ok) throw new Error(`Failed to restore document: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Apply judicial PII redaction
   */
  async applyRedaction(docId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/redact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId })
    });
    if (!res.ok) throw new Error(`Failed to apply redaction: HTTP ${res.status}`);
  },

  /**
   * Fetch Merkle inclusion proof for a document
   */
  async getMerkleProof(docId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/merkle-proof/${docId}`);
    if (!res.ok) throw new Error(`Failed to fetch Merkle proof: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Generate Section 63 BSA electronic admissibility certificate
   */
  async generateBSACertificate(
    caseId: string,
    officerName: string,
    designation: string,
    badgeId: string
  ): Promise<BSACertificateData> {
    const res = await fetch(`${API_BASE}/api/cert/section-63-bsa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        certifying_officer_name: officerName,
        certifying_officer_designation: designation,
        badge_id: badgeId
      })
    });
    if (!res.ok) throw new Error(`Failed to generate BSA certificate: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Run semantic query through legal AI copilot
   */
  async queryLegalAI(queryText: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    });
    if (!res.ok) throw new Error(`Failed to query Legal AI: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Upload and ingest document
   */
  async uploadDocument(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned HTTP ${res.status} during ingestion.`);
    }
    return res.json();
  },

  /**
   * Verify document with 5-vector verification engine
   */
  async verifyEvidence(payload: EvidenceVerificationRequest): Promise<EvidenceVerificationResponse> {
    const res = await fetch(`${API_BASE}/api/verify/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Verification engine returned HTTP ${res.status}.`);
    }
    return res.json();
  }
};
