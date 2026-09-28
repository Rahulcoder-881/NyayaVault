# 3. Application Flow & User Journeys (appflow.md)
**Document Ref:** MHA-NCRB/SIH-26190/AF-01  
**Classification:** Restricted Law Enforcement Technical Specification  
**Authority:** Ministry of Home Affairs | National Crime Records Bureau & Women Safety Division  

---

## 3.1 Officer Authentication Flow (MFA-Secured)

Every law enforcement officer, prosecutor, judicial authority, or system administrator accessing the Secure Digital Document Management System (DMS) must undergo a rigorous zero-trust multi-factor authentication handshake.

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Law Enforcement Officer (IO/SHO/Judge)
    participant Client as Next.js Web Client (HTTPS / TLS 1.3)
    participant Gateway as API Gateway / Reverse Proxy (WAF)
    participant AuthService as Backend Auth & RBAC Service
    participant MFA as TOTP / SMS / Token Provider
    participant DB as PostgreSQL Database
    participant HSM as Hardware Security Module (KMS)

    Officer->>Client: Enters Official Badge ID & Password
    Client->>Gateway: POST /api/v1/auth/login (TLS 1.3 encrypted)
    Gateway->>AuthService: Validate Request & Rate Limits (5 req/min)
    AuthService->>DB: Query User Record by Badge ID
    DB-->>AuthService: Returns Hashed Password (Argon2id) & Salt
    AuthService->>AuthService: Verify Password Hash
    alt Password Invalid
        AuthService-->>Client: 401 Unauthorized (Increment Failed Attempts)
        AuthService->>DB: Log Failed Access Attempt to Audit Trail
    else Password Valid
        AuthService->>MFA: Dispatch 6-Digit TOTP Challenge (or verify Authenticator Token)
        AuthService-->>Client: 202 Accepted (Requires MFA Challenge Token)
        Officer->>Client: Enters 6-Digit Time-Based One-Time Password (TOTP)
        Client->>AuthService: POST /api/v1/auth/mfa-verify {challenge_token, totp_code}
        AuthService->>AuthService: Verify Cryptographic TOTP Validity Window
        AuthService->>HSM: Request Officer Session Signing Key
        HSM-->>AuthService: Signs Ephemeral JWT with ECDSA (secp256k1)
        AuthService->>DB: Record Session Creation & IP in Audit Ledger
        AuthService-->>Client: 200 OK with HttpOnly Secure JWT + RBAC Claims + CSRF Token
        Client->>Officer: Redirects to Dedicated Role Dashboard (IO, SHO, Prosecutor, Judge, Admin)
    end
```

### Authentication State Machine
1. **Unauthenticated:** Public landing view with statutory warnings (Sec 66 IT Act & BNSS provisions).
2. **Pre-Auth:** Badge number and credential validation.
3. **MFA Challenge:** 60-second window for TOTP (Google Authenticator / Aegis / Gov SMS Gateway).
4. **Active Cryptographic Session:** 15-minute inactivity timeout, hardware key rotation, strict IP binding.

---

## 3.2 Document Ingestion, Envelope Encryption & Blockchain Anchoring Flow

When an Investigating Officer (IO) or Forensic Scientist uploads legal evidence (FIR, Panchnama, Ballistics Report, DICOM Medical Scan):

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Investigating Officer (IO)
    participant UI as Upload Modal & Drag-and-Drop
    participant CryptoEngine as Client-Side Crypto Worker
    participant API as Ingestion Pipeline API
    participant OCR as Tesseract & EasyOCR Engine
    participant AI as Legal Entity Extractor (NER)
    participant S3 as Encrypted Object Storage (MinIO/S3)
    participant Chain as Blockchain Smart Contract (Polygon/Hyperledger)
    participant DB as Relational Database (PostgreSQL)

    Officer->>UI: Selects Case ID, Document Category, Security Level
    Officer->>UI: Drops File (PDF, DOCX, JPG, PNG, DICOM)
    UI->>CryptoEngine: Compute Client-Side SHA-256 Checksum
    CryptoEngine-->>UI: Returns Client Hash (Digest_A)
    UI->>API: Stream Payload with Metadata + Digest_A (POST /api/v1/documents/upload)
    
    API->>API: Compute Server SHA-256 (Digest_B) & Match with Digest_A
    alt Digest Mismatch
        API-->>UI: 400 Bad Request: In-transit Data Corruption Detected
    else Digests Match
        API->>API: Generate Random 256-bit AES Data Encryption Key (DEK)
        API->>API: Encrypt Document Bytes with AES-GCM-256 + Unique IV
        API->>S3: PutObject (Encrypted Document Bytes)
        S3-->>API: Object Storage S3 URI / Blob Path
        
        par OCR & Entity Extraction
            API->>OCR: Run Bilingual OCR (English + Devanagari Hindi)
            OCR-->>API: Raw Extracted Text
            API->>AI: Extract Entities (Suspects, Victims, IPC/BNS Sections, Geotags)
            AI-->>API: Structured Named Entities
        and Blockchain Anchoring
            API->>Chain: DocumentRegistry.anchorDocument(docId, sha256Hash)
            Chain-->>API: Tx Hash (0x...) & Block Confirmation Number
        end

        API->>DB: INSERT into documents (doc_id, case_id, hash, s3_path, tx_hash, entities)
        API->>DB: INSERT into audit_logs (doc_id, officer_id, action="INGEST_ANCHORED")
        API-->>UI: 201 Created: Anchored Badge + Transaction Proof
        UI->>Officer: Displays "Cryptographically Anchored & Tamper-Evident"
    end
```

---

## 3.3 Case Document Retrieval, Dynamic Watermarking & Chain Verification Flow

When a Judicial Officer, Prosecutor, or Senior SHO reviews an evidence record:

```mermaid
sequenceDiagram
    autonumber
    actor Viewer as Hon'ble Court / Public Prosecutor
    participant Client as Web App (Document Viewer Modal)
    participant API as Backend Document API
    participant S3 as Encrypted Object Storage
    participant KMS as Key Management Service
    participant Chain as Blockchain Smart Contract
    participant Audit as Immutable Audit Logger

    Viewer->>Client: Clicks "Preview Evidence" or "Verify Chain"
    Client->>API: GET /api/v1/documents/:id/verify
    API->>Audit: Log Access Intent (User, Badge, IP, Timestamp)
    
    par Verify On-Chain Integrity
        API->>Chain: DocumentRegistry.verifyDocument(docId)
        Chain-->>API: Returns {sha256Hash, timestamp, isRevoked}
    and Verify Storage Integrity
        API->>S3: Read Encrypted Bytes
        API->>KMS: Decrypt Data Encryption Key (DEK)
        API->>API: Decrypt Document Payload & Compute Realtime SHA-256
    end

    API->>API: Compare On-Chain Hash == Decrypted Document Hash
    alt Hashes Identical & Not Revoked
        API-->>Client: Verification Status: VALID (Match Confirmed)
        Client->>Client: Apply WatermarkWrapper Overlay
        Note over Client: Injects Dynamic Diagonal Watermark:<br/>CONFIDENTIAL - ACCESSED BY [Officer Name] ([Badge ID]) - [Timestamp] - [IP Address]
        Client->>Viewer: Renders Document with Tamper-Evident Badge
    else Hash Mismatch Detected!
        API->>Audit: TRIGGER ALERT: Tampering Detected for Doc ID!
        API->>DB: Flag Document Status = "QUARANTINED"
        API-->>Client: Verification Status: TAMPER_DETECTED (Alert Banner)
        Client->>Viewer: Red Security Lockout + Forensic Audit Details
    end
```

---

## 3.4 Section 63B BSA Electronic Certificate Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor IO as Investigating Officer / SHO
    participant UI as Web Client (BSA Certificate Generator)
    participant API as Compliance Engine API
    participant DB as PostgreSQL
    participant Chain as Blockchain Ledger
    participant PDF as Cryptographic PDF Builder

    IO->>UI: Requests "Generate Section 63 BSA 2023 Admissibility Certificate"
    UI->>API: POST /api/v1/compliance/bsa-cert/:caseId
    API->>DB: Fetch All Registered Evidence Items for Case
    API->>Chain: Query Block Proofs for all Document SHA-256 Hashes
    Chain-->>API: Returns Cryptographic Block Heights & Timestamps
    API->>API: Compute Merkle Tree Root of Case Bundle
    API->>PDF: Generate Statutory Certificate with:
    Note over PDF: • Police Station & FIR No.<br/>• Section 63 BSA Compliance Wording<br/>• Device & Custodian Attestation<br/>• Complete Evidence Manifest Table<br/>• Merkle Root & Digital Signature
    PDF-->>API: Signed Certificate PDF Payload
    API->>DB: Store Certificate Record in audit_logs & case_certifications
    API-->>UI: Returns Generated Certificate with Print / Export Triggers
    UI->>IO: Interactive Modal with Verified Court Seal & Print Option
```

---

## 3.5 Timed Access Delegation & Permission Expiry Flow

```mermaid
sequenceDiagram
    autonumber
    actor SHO as Station House Officer (Grantor)
    actor Lab as CFSL Forensic Specialist (Grantee)
    participant UI as Grant Access Modal
    participant API as Access Control Engine
    participant DB as PostgreSQL (ACL Table)
    participant Cron as Auto-Expiry Worker (TTL Daemon)

    SHO->>UI: Selects Case & Target Officer (Dr. Ananya Sen)
    SHO->>UI: Selects Permitted Categories & Expiry Duration (e.g., 24 Hours)
    UI->>API: POST /api/v1/access/grant {case_id, grantee_badge, permissions, ttl_hours}
    API->>DB: INSERT into case_permissions (valid_until = NOW() + INTERVAL '24 HOURS')
    API->>DB: Log Action in immutable audit_logs
    API-->>UI: Access Token & Time-Limited Delegation Link Created
    
    Lab->>API: Attempts Document Retrieval during Valid Window
    API->>DB: Check case_permissions where NOW() < valid_until
    DB-->>API: Permission Active
    API-->>Lab: Document Stream Granted
    
    Note over Cron,DB: 24 Hours Elapse...
    Cron->>DB: Scan expired rows (NOW() >= valid_until)
    Cron->>DB: UPDATE status = 'REVOKED_AUTOMATIC_EXPIRY'
    
    Lab->>API: Attempts Document Retrieval after Expiry
    API->>DB: Check case_permissions
    DB-->>API: Access Expired
    API-->>Lab: 403 Forbidden: Case Access Window Has Expired
```
