export type UserRole = 
  | 'IO_POLICE' 
  | 'SHO_ADMIN'
  | 'FORENSIC_LAB' 
  | 'PROSECUTOR' 
  | 'JUDGE_MAGISTRATE'
  | 'SYS_ADMIN';

export interface RoleInfo {
  role: UserRole;
  label: string;
  name: string;
  badge: string;
  avatarIcon: string;
  description: string;
  permissions: string[];
  canUpload: boolean;
  canViewAssigned: boolean;
  canVerifyHash: boolean;
  canGrantAccess: boolean;
  canMarkExhibits: boolean;
}

export type LifecycleStageId = 1 | 2 | 3 | 4 | 5 | 6;

export interface LifecycleStageMeta {
  id: LifecycleStageId;
  name: string;
  shortName: string;
  description: string;
  custodian: string;
  legalProvision: string;
  color: string;
}

export type DocumentStatus = 'VERIFIED' | 'TAMPERED' | 'QUARANTINED' | 'REDACTED' | 'ARCHIVED';
export type DocumentClassification = 'CONFIDENTIAL' | 'RESTRICTED' | 'PUBLIC_COURT_RECORD' | 'FORENSIC_INTERNAL';

export interface DocumentItem {
  id: string;
  case_id: string;
  title: string;
  stage: LifecycleStageId;
  stage_name: string;
  category: string;
  sha256_hash: string;
  original_sha256: string;
  merkle_leaf_hash: string;
  uploaded_by: string;
  uploader_role: UserRole;
  badge_id: string;
  timestamp_utc: string;
  gps_coordinates: string;
  classification: DocumentClassification;
  status: DocumentStatus;
  exhibit_number?: string;
  file_size_bytes: number;
  content: string;
  redacted_content?: string;
  tamper_flag: boolean;
  tamper_offset?: number;
  tamper_details?: {
    attack_type: string;
    original_sha256: string;
    tampered_sha256: string;
    corrupted_offset: number;
    timestamp_utc: string;
    quarantine_rule: string;
    action_taken: string;
  };
  kms_key_arn: string;
  envelope_iv: string;
  ocr_extracted_text?: string;
  ocr_language?: string;
  extracted_entities?: {
    suspects?: string[];
    locations?: string[];
    legal_sections?: string[];
  };
  blockchain_tx_id?: string;
  blockchain_block?: number;
}

export interface CaseRecord {
  case_id: string;
  fir_number: string;
  police_station: string;
  jurisdiction: string;
  acts_sections: string;
  crime_incident_datetime: string;
  io_name: string;
  io_badge: string;
  prosecutor_name: string;
  presiding_magistrate: string;
  court_name: string;
  current_stage: LifecycleStageId;
  merkle_root: string;
  total_documents: number;
  integrity_score: number;
  quarantine_count: number;
}

export interface AuditBlock {
  block_id: string;
  index: number;
  timestamp_utc: string;
  action: string;
  document_id?: string;
  document_title?: string;
  case_id: string;
  actor_name: string;
  actor_role: string;
  badge_id: string;
  ip_address: string;
  previous_block_hash: string;
  block_hash: string;
  merkle_root: string;
  signature: string;
  details: string;
}

export interface BSACertificateData {
  certificate_id: string;
  timestamp_utc: string;
  officer_name: string;
  designation: string;
  badge_id: string;
  fir_number: string;
  police_station: string;
  acts_sections: string;
  merkle_root: string;
  manifest_master_hash: string;
  digital_signature: string;
  documents_certified: Array<{
    document_id: string;
    title: string;
    category: string;
    stage: string;
    sha256_hash: string;
    exhibit_number: string;
    status: string;
  }>;
  certificate_body_text: string;
  statutory_act: string;
  section: string;
  admissibility_status: string;
}

export interface ContradictionItem {
  id: string;
  title: string;
  severity: string;
  statutory_section: string;
  witness_statement_doc_id: string;
  witness_name: string;
  witness_assertion: string;
  conflicting_evidence_doc_id: string;
  conflicting_evidence_title: string;
  conflicting_finding: string;
  legal_implication: string;
  credibility_impact: string;
}

export interface TimelineEvent {
  stage_index: number;
  stage_name: string;
  event_title: string;
  timestamp: string;
  doc_ref: string;
  officer: string;
  location: string;
  cryptographic_status: string;
  description: string;
}
