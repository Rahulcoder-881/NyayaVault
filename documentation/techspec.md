# Technical Specification (TechSpec)

**Project:** Secure Digital Document Management System (DMS)  
**SIH Problem Statement:** 26190  
**Ministry:** Ministry of Home Affairs | NCRB & Women Safety Division  

---

## 1. System Architecture Overview

```
[ Frontend Client: React 19 + TypeScript + Vite + Tailwind CSS ]
                       │ (REST / WebSocket API over TLS 1.3)
                       ▼
[ High-Performance Backend: FastAPI (Python 3.11+) / Node.js ]
  ├── [ Auth & RBAC Module ] ─────── JWT + Simulated MFA (TOTP / OTP)
  ├── [ Document Ingestion Engine ] ── PyMuPDF / Tesseract OCR / EasyOCR
  ├── [ Cryptographic Core ] ─────── SHA-256 + HMAC + AES-256-GCM Envelope Encryption
  ├── [ AI Legal Assistant ] ─────── Regex + Sentence-Transformer Semantic Search
  └── [ Steganography Subsystem ] ── Zero-Width Space & Non-Joiner Encoder
                       │
       ┌───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼
[ In-Memory / SQLite ] [ Vector Index ] [ S3 / MinIO ] [ Polygon / Hyperledger ]
 (Metadata & RBAC)    (Full-Text AI)   (Encrypted S3)  (File Hashes Ledger)
```

---

## 2. Technology Stack Breakdown

| Component | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite | Sub-millisecond rendering, zero lag during SIH jury evaluations. |
| **Styling & UI Components** | Tailwind CSS, Lucide Icons, Glassmorphism CSS | High-contrast, cybernetic enterprise legal theme. |
| **Backend REST & WS API** | FastAPI (Python), Uvicorn | High throughput, asynchronous WebSockets for live audit streaming. |
| **Cryptography Core** | Web Crypto API (Client) + Python `hashlib` / `cryptography` | FIPS 180-4 compliant SHA-256 hashing and AES-256-GCM envelope encryption. |
| **Steganography** | Invisible Unicode Zero-Width Tokens (`\u200B`, `\u200C`) | Binary encoding of Officer Badge ID and Unix timestamp into plain text. |
| **Smart Contract Network** | Solidity 0.8.20 (Ethereum Polygon PoS / Hyperledger Fabric) | Immutable ledger anchoring of document hash digests (`docId`, `sha256Hash`, `uploader`, `timestamp`). |
| **Statutory Compliance** | Section 63 & 63B Bharatiya Sakshya Adhiniyam 2023 | Legal electronic certificate generation matching High Court standards. |

---

## 3. Core API Endpoints

### 3.1 Authentication & RBAC
- `POST /api/v1/auth/login`
  - **Payload:** `{ "badge_number": "DL-POL-8832", "role": "IO_POLICE", "mfa_token": "882190" }`
  - **Response:** `{ "status": "AUTHENTICATED", "access_token": "jwt_...", "clearance": "RESTRICTED", "expires_in": 28800 }`

### 3.2 Document Ingestion & Verification
- `POST /api/v1/documents/upload`
  - **Payload:** Form data with file (PDF, DOCX, DICOM), `case_id`, `category`, `classification`, `stage`.
  - **Actions:** Encrypts payload with AES-256, computes SHA-256 digest, executes OCR & AI entity extraction, commits hash to blockchain ledger.
  - **Response:** `{ "document_id": "DOC-STG2-9011", "sha256_hash": "...", "blockchain_tx": "0x7a8f...b9c1", "status": "VERIFIED" }`

- `GET /api/v1/documents/{id}/verify`
  - **Action:** Queries the smart contract registry on Polygon/Hyperledger and re-computes current document hash to verify zero tamper.
  - **Response:** `{ "document_id": "...", "on_chain_hash": "...", "computed_hash": "...", "is_valid": true, "block_number": 19482 }`

### 3.3 Search & Discovery
- `GET /api/v1/search?q={query}&section={section}&case_id={case}&officer={badge}`
  - **Action:** Full-text and metadata filtered search with sub-500ms latency.
  - **Response:** Matching documents, highlighted snippets, and relevant legal contradictions.

### 3.4 Governance & Audit
- `GET /api/v1/audit/logs`
  - **Action:** Returns immutable cryptographically linked audit blocks.
  - **Response:** Array of audit blocks with `previous_block_hash`, `block_hash`, and HMAC signature.

- `POST /api/v1/cert/section-63-bsa`
  - **Action:** Issues a cryptographically signed Section 63B BSA certificate.

---

## 4. Cryptographic Security Architecture

1. **Client-Side Pre-Hashing:** Before file bytes leave the browser, the Web Crypto API generates `H_client = SHA256(ArrayBuffer)`.
2. **Server Envelope Encryption:** The file is encrypted using an ephemeral AES-256-GCM symmetric key $K_e$. $K_e$ is encrypted using the Master HSM Public Key ($K_{pub}^{HSM}$).
3. **Smart Contract Registry:** The hash tuple `(doc_id, sha256_hash, uploader_address, timestamp)` is committed to the immutable blockchain ledger.
4. **Forensic Steganography:** Document text is infused with invisible zero-width characters encoding the requesting official's badge ID and timestamp.
