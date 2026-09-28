# 8. Legal Rules & Security Policies (rules.md)
**Document Ref:** MHA-NCRB/SIH-26190/RU-01  
**Statutory Authorities:**  
- Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)  
- Bharatiya Sakshya Adhiniyam, 2023 (BSA)  
- Information Technology Act, 2000 (Amended)  
- Digital Personal Data Protection Act, 2023 (DPDP)  
**Organization:** Ministry of Home Affairs | National Crime Records Bureau & Women Safety Division  

---

## 8.1 Legal & Evidence Compliance Mandates

### 1. Cryptographic Chain of Custody (Sec 173 & Sec 105 BNSS)
Every physical or electronic exhibit must maintain an unbroken chain of custody recorded in the immutable audit ledger. Whenever a document moves across agency borders (Police Station → CFSL Lab → Directorate of Prosecution → Sessions Court), the system must:
- Record the dispatching officer's cryptographic key signature.
- Record the receiving officer's acknowledgment stamp with timestamp and GPS coordinates.
- Verify that the SHA-256 hash of the payload has remained invariant since initial seizure.

### 2. Section 63B BSA Electronic Record Admissibility Certificate
Under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of the Indian Evidence Act), any electronic record produced before a court of law is legally inadmissible unless accompanied by a statutory certificate executed by the custodian of the computer system or device.
- **Mandatory Content:** Identity and designation of the certifying officer, specification of device operating conditions, affirmation of zero system tampering, and the cryptographic hash manifest.
- **Automated Generation:** The system must generate this certificate dynamically with one click, anchoring the case bundle's Merkle root to prevent contested evidence admissibility.

---

## 8.2 Role-Based Access Control Matrix (RBAC)

The following security policy is strictly enforced by the API Gateway and application middleware:

| User Role | Ingest & Upload Evidence | View Assigned Case Records | Verify Blockchain Hash | Grant Timed Access Delegation | Mark Court Exhibits |
|---|---|---|---|---|---|
| **Investigating Officer (IO)** | **Allowed** ✅ | **Allowed** ✅ | **Allowed** ✅ | **Denied** 🚫 | **Denied** 🚫 |
| **Station House Officer (SHO / Senior Admin)** | **Allowed** ✅ | **Allowed** ✅ | **Allowed** ✅ | **Allowed** ✅ | **Denied** 🚫 |
| **Forensic Lab Scientist (CFSL / SFSL)** | **Allowed** (Lab Reports Only) ✅ | **Allowed** (Assigned Exhibits Only) ✅ | **Allowed** ✅ | **Denied** 🚫 | **Denied** 🚫 |
| **Public Prosecutor** | **Denied** 🚫 | **Allowed** ✅ | **Allowed** ✅ | **Denied** 🚫 | **Denied** 🚫 |
| **Court / Judicial Officer** | **Denied** 🚫 | **Allowed** ✅ | **Allowed** ✅ | **Denied** 🚫 | **Allowed** ✅ |
| **System Administrator** | **Denied** 🚫 | **Denied** (Zero PII View) 🚫 | **Allowed** ✅ | **Allowed** (Policy Only) ✅ | **Denied** 🚫 |

---

## 8.3 Mandatory System Rules & Technical Invariants

### Rule 1: Dynamic Watermark Enforcement
No document preview or exported PDF file may be delivered to any client without the automated injection of a dynamic forensic watermark overlay. The watermark must explicitly state:
- The full name and official badge identifier of the viewing officer.
- The originating IP address and network enclave (e.g., POL-VPN).
- The exact UTC timestamp of access.
*Failure to enforce watermarks on any rendering surface constitutes an immediate security policy violation.*

### Rule 2: Zero Plaintext Storage Policy
All digital evidence stored on persistent media (AWS S3, MinIO, or local disk storage) must be encrypted prior to writing using AES-256-GCM envelope encryption. Plaintext file buffers must only exist ephemerally in RAM during active cryptographic digest computation or streaming decryption.

### Rule 3: Immutable Audit & Non-Repudiation
No user—including high-privilege System Administrators—shall possess the capability to update, truncate, overwrite, or delete rows from the `audit_logs` table or modify on-chain transaction records. Every database append operation calculates a cryptographic hash linking it to the previous log entry (`log_hash = SHA256(prev_hash + log_bytes)`), forming a tamper-proof hash-chain.

### Rule 4: Automated Quarantine Lockout
If a hash divergence is detected between the storage layer payload and the blockchain smart contract registry during retrieval, the system must instantly:
1. Mark the target document status as `QUARANTINED`.
2. Block further previews or downloads for regular officers.
3. Broadcast an urgent security alert to the SHO and System Administrator.
4. Record the anomalous event in the immutable audit trail.
