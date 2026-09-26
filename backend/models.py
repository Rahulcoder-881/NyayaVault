"""
NyayaVault: Data Models & Schema Definitions
Strict adherence to Bharatiya Sakshya Adhiniyam (BSA) 2023 and ISO 27001
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
import time

class UserRole(str, Enum):
    INVESTIGATING_OFFICER = "IO_POLICE"
    FORENSIC_SCIENTIST = "FORENSIC_LAB"
    PUBLIC_PROSECUTOR = "PROSECUTOR"
    JUDICIAL_MAGISTRATE = "JUDGE_MAGISTRATE"

class LifecycleStage(int, Enum):
    FIR_INGESTION = 1
    FIELD_INVESTIGATION = 2
    FORENSIC_LABORATORY = 3
    PROSECUTORIAL_SCRUTINY = 4
    JUDICIAL_PRESENTATION = 5
    IMMUTABLE_ARCHIVAL = 6

class DocumentStatus(str, Enum):
    VERIFIED = "VERIFIED"
    TAMPERED = "TAMPERED"
    QUARANTINED = "QUARANTINED"
    REDACTED = "REDACTED"
    ARCHIVED = "ARCHIVED"

class DocumentClassification(str, Enum):
    CONFIDENTIAL = "CONFIDENTIAL"
    RESTRICTED = "RESTRICTED"
    PUBLIC_COURT_RECORD = "PUBLIC_COURT_RECORD"
    FORENSIC_INTERNAL = "FORENSIC_INTERNAL"

class AuditAction(str, Enum):
    UPLOAD = "UPLOAD"
    VIEW = "VIEW"
    DOWNLOAD = "DOWNLOAD"
    REDACT = "REDACT"
    SIGN = "SIGN"
    STAGE_TRANSITION = "STAGE_TRANSITION"
    TAMPER_SIMULATION = "TAMPER_SIMULATION"
    QUARANTINE_TRIGGER = "QUARANTINE_TRIGGER"
    RESTORE_LEGAL = "RESTORE_LEGAL"
    COURT_SEAL_APPLIED = "COURT_SEAL_APPLIED"

class Document(BaseModel):
    id: str
    case_id: str
    title: str
    stage: LifecycleStage
    stage_name: str
    category: str # FIR, Seizure Memo, Panchnama, Sec 161 Statement, Ballistics, Toxicology, Charge Sheet, Court Order
    sha256_hash: str
    original_sha256: str
    merkle_leaf_hash: str
    uploaded_by: str
    uploader_role: UserRole
    badge_id: str
    timestamp_utc: str
    gps_coordinates: str
    classification: DocumentClassification
    status: DocumentStatus
    exhibit_number: Optional[str] = None
    file_size_bytes: int
    content: str
    redacted_content: Optional[str] = None
    tamper_flag: bool = False
    tamper_offset: Optional[int] = None
    tamper_details: Optional[Dict[str, Any]] = None
    kms_key_arn: str = "arn:aws:kms:ap-south-1:992019481921:key/nyayavault-hsm-bsa2023"
    envelope_iv: str = "a9f8b7c6d5e4f3a2b1c0"

class AuditBlock(BaseModel):
    block_id: str
    index: int
    timestamp_utc: str
    action: AuditAction
    document_id: Optional[str] = None
    document_title: Optional[str] = None
    case_id: str
    actor_name: str
    actor_role: UserRole
    badge_id: str
    ip_address: str
    previous_block_hash: str
    block_hash: str
    merkle_root: str
    signature: str
    details: str

class CaseRecord(BaseModel):
    case_id: str
    fir_number: str
    police_station: str
    jurisdiction: str
    acts_sections: str # e.g. "IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27"
    crime_incident_datetime: str
    io_name: str
    io_badge: str
    prosecutor_name: str
    presiding_magistrate: str
    court_name: str
    current_stage: LifecycleStage
    merkle_root: str
    total_documents: int
    integrity_score: float # 0 - 100%
    quarantine_count: int

class TamperSimulationRequest(BaseModel):
    document_id: str
    byte_offset: Optional[int] = 128
    corrupted_data: Optional[str] = "[MALICIOUS_INJECTION: WEAPON SERIAL ALTERED FROM W-9041 TO W-0000]"

class RestoreRequest(BaseModel):
    document_id: str

class RedactionRequest(BaseModel):
    document_id: str
    redaction_rules: List[str] = ["WITNESS_NAME", "RESIDENTIAL_ADDRESS", "PHONE_NUMBER", "AADHAAR_ID"]

class BSACertificateRequest(BaseModel):
    case_id: str
    certifying_officer_name: str
    certifying_officer_designation: str
    badge_id: str
