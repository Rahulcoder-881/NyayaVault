# 5. Database & Smart Contract Schema (schema.md)
**Document Ref:** MHA-NCRB/SIH-26190/SC-01  
**Project:** Secure Digital Document Management System (DMS)  
**Database:** PostgreSQL 16 Enterprise with pg_trgm & pgcrypto  
**Blockchain:** Solidity 0.8.20 (Polygon POS / Hyperledger Besu)  

---

## 5.1 Relational Database Schema (PostgreSQL)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Users / Officers Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('IO', 'SHO', 'FORENSIC_LAB', 'PROSECUTOR', 'JUDGE', 'ADMIN')),
    department VARCHAR(100) NOT NULL,
    mfa_secret VARCHAR(64),
    is_mfa_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_badge ON users(badge_number);
CREATE INDEX idx_users_role ON users(role);

-- 2. Cases Table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    fir_number VARCHAR(50) NOT NULL,
    police_station VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    acts_sections TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_officer_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNDER_INVESTIGATION', 'CHARGE_SHEET_FILED', 'TRIAL_ONGOING', 'DISPOSED')),
    merkle_root VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_case_num ON cases(case_number);
CREATE INDEX idx_cases_fir_num ON cases(fir_number);
CREATE INDEX idx_cases_assigned_officer ON cases(assigned_officer_id);

-- 3. Documents Table (Envelope Encrypted Evidence Items)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'FIR_RECORD', 'GENERAL_DIARY', 'PANCHNAMA', 'SEIZURE_MEMO', 
        'BALLISTICS_REPORT', 'DNA_REPORT', 'FORENSIC_CYBER', 'WITNESS_STATEMENT', 
        'CHARGE_SHEET', 'COURT_EXHIBIT', 'JUDICIAL_ORDER'
    )),
    classification VARCHAR(30) DEFAULT 'CONFIDENTIAL' CHECK (classification IN ('CONFIDENTIAL', 'RESTRICTED', 'PUBLIC_COURT_RECORD', 'FORENSIC_INTERNAL')),
    file_path_encrypted TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    original_sha256 VARCHAR(64) NOT NULL,
    merkle_leaf_hash VARCHAR(64) NOT NULL,
    kms_key_arn VARCHAR(255) NOT NULL,
    envelope_iv VARCHAR(32) NOT NULL,
    blockchain_tx_id VARCHAR(100),
    blockchain_block_number BIGINT,
    exhibit_number VARCHAR(50),
    ocr_extracted_text TEXT,
    ocr_language VARCHAR(20) DEFAULT 'eng+hin',
    extracted_entities JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'VERIFIED' CHECK (status IN ('VERIFIED', 'TAMPERED', 'QUARANTINED', 'REDACTED', 'ARCHIVED')),
    tamper_flag BOOLEAN DEFAULT FALSE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quarantined_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_docs_case_id ON documents(case_id);
CREATE INDEX idx_docs_sha256 ON documents(sha256_hash);
CREATE INDEX idx_docs_category ON documents(category);
CREATE INDEX idx_docs_status ON documents(status);
CREATE INDEX idx_docs_ocr_gin ON documents USING gin(to_tsvector('english', coalesce(ocr_extracted_text, '')));

-- 4. Immutable Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'LOGIN_MFA_SUCCESS', 'LOGIN_FAILURE', 'DOC_UPLOAD_INGEST', 
        'BLOCKCHAIN_ANCHOR_SUCCESS', 'DOC_VIEW_WATERMARKED', 'DOC_DOWNLOAD_EXPORT', 
        'DOC_TAMPER_DETECTED', 'DOC_QUARANTINED', 'ACCESS_DELEGATION_GRANTED', 
        'ACCESS_DELEGATION_EXPIRED', 'SECTION_63_BSA_CERT_GENERATED', 'MERKLE_RECALCULATED'
    )),
    ip_address VARCHAR(45) NOT NULL,
    device_fingerprint VARCHAR(128),
    details JSONB DEFAULT '{}'::jsonb,
    previous_log_hash VARCHAR(64) NOT NULL,
    log_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_doc_id ON audit_logs(document_id);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- 5. Timed Case Access Permissions (Time-Limited Shared Links / ACL)
CREATE TABLE case_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    grantor_user_id UUID NOT NULL REFERENCES users(id),
    grantee_badge VARCHAR(50) NOT NULL,
    grantee_name VARCHAR(100) NOT NULL,
    permitted_categories TEXT[] DEFAULT ARRAY['FIR_RECORD', 'BALLISTICS_REPORT'],
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_case ON case_permissions(case_id);
CREATE INDEX idx_permissions_grantee ON case_permissions(grantee_badge);
CREATE INDEX idx_permissions_validity ON case_permissions(valid_until);

-- 6. Section 63 BSA Electronic Evidence Certifications Table
CREATE TABLE bsa_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    certifying_officer_id UUID NOT NULL REFERENCES users(id),
    police_station VARCHAR(100) NOT NULL,
    fir_number VARCHAR(50) NOT NULL,
    merkle_root VARCHAR(64) NOT NULL,
    manifest_master_hash VARCHAR(64) NOT NULL,
    digital_signature TEXT NOT NULL,
    admissibility_status VARCHAR(50) DEFAULT 'ADMISSIBLE_SEC_63_BSA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5.2 Blockchain Smart Contract Schema (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Secure Digital Document Management System (DMS) Smart Contract
 * Ministry of Home Affairs (MHA) & National Crime Records Bureau (NCRB)
 * SIH Problem Statement 26190 - Blockchain & Cybersecurity
 */
contract DocumentRegistry {
    struct Record {
        string docId;
        string sha256Hash;
        address uploadedBy;
        uint256 timestamp;
        bool isRevoked;
    }

    mapping(string => Record) private records;
    event DocumentAnchored(string indexed docId, string sha256Hash, address indexed uploader, uint256 timestamp);
    event DocumentRevoked(string indexed docId, address indexed revoker, uint256 timestamp, string reason);

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry authority can execute this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorDocument(string memory _docId, string memory _sha256Hash) public {
        require(bytes(records[_docId].docId).length == 0, "Document already registered on-chain");
        require(bytes(_sha256Hash).length == 64, "Invalid SHA-256 hash length");

        records[_docId] = Record({
            docId: _docId,
            sha256Hash: _sha256Hash,
            uploadedBy: msg.sender,
            timestamp: block.timestamp,
            isRevoked: false
        });

        emit DocumentAnchored(_docId, _sha256Hash, msg.sender, block.timestamp);
    }

    function verifyDocument(string memory _docId) public view returns (
        string memory sha256Hash, 
        uint256 timestamp, 
        bool isRevoked
    ) {
        Record memory rec = records[_docId];
        require(bytes(rec.docId).length > 0, "Document record not found on blockchain");
        return (rec.sha256Hash, rec.timestamp, rec.isRevoked);
    }

    function revokeDocument(string memory _docId, string memory _reason) public {
        Record storage rec = records[_docId];
        require(bytes(rec.docId).length > 0, "Document record not found");
        require(msg.sender == rec.uploadedBy || msg.sender == owner, "Unauthorized to revoke this document");
        rec.isRevoked = true;
        emit DocumentRevoked(_docId, msg.sender, block.timestamp, _reason);
    }
}
```
