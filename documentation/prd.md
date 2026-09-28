# Product Requirement Document (PRD)

**Project:** Secure Digital Document Management System (DMS)  
**Smart India Hackathon (SIH 2026):** Problem Statement 26190  
**Organization:** Ministry of Home Affairs | Department: National Crime Records Bureau (NCRB) & Women Safety Division  
**Category:** Software | **Theme:** Blockchain & Cybersecurity  

---

## 1. Executive Summary
The **Secure Digital Document Management System (DMS)** is an enterprise-grade, cloud-based, blockchain-anchored custody platform designed to centralize, secure, and streamline the lifecycle of sensitive criminal investigation and legal records across police stations, forensic laboratories, public prosecutors, and judicial courts across India. 

Operating under the **Bharatiya Sakshya Adhiniyam (BSA) 2023** (§63 / §63B) and **Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023**, the platform mathematically guarantees non-repudiation, tamper-detection, and court admissibility for digital evidence from incident registration to trial adjudication.

---

## 2. Core Objectives

| Objective | Target Metric | Statutory Alignment |
|---|---|---|
| **Zero-Trust Security** | Zero unauthorized document modifications; immediate cryptographic quarantine upon single-bit alteration. | ISO/IEC 27001:2022, FIPS 180-4 |
| **End-to-End Chain of Custody** | Non-repudiable Merkle DAG audit trail tracking every transfer between IO, CFSL, and Prosecutor. | BNSS 2023 Sec 105 & Sec 193 |
| **Court Evidentiary Admissibility** | Automated Section 63B BSA electronic record certificate generation with cryptographic hash digests. | BSA 2023 Section 63 & 63B |
| **Sub-Second Searchability** | Semantic & entity search latency < 500ms across millions of FIRs and charge sheets. | National IT Act 2000 |
| **Data Leak Attribution** | Invisible steganographic zero-width character watermark (`U+200B`, `U+200C`) tying leaks to viewing official. | Official Secrets Act / NCRB Guidelines |

---

## 3. Core Personas & Role-Based Access Control (RBAC)

| Role | Persona Name | Primary Responsibilities | RBAC Permissions |
|---|---|---|---|
| **Investigating Officer (IO)** | Insp. R.K. Varma (DL-POL-8832) | Ingests FIRs, records field seizure panchnamas, records §180 BNSS witness statements, applies cryptographic timestamps. | **Upload:** Allowed<br/>**View:** Assigned Only<br/>**Verify:** Allowed<br/>**Grant Access:** Denied |
| **Station House Officer (SHO) / Senior Admin** | ACP Devendra Nath (DL-SHO-1044) | Scrutinizes and approves case files, assigns access privileges to investigation team members, monitors precinct status. | **Upload:** Allowed<br/>**View:** Precinct Wide<br/>**Verify:** Allowed<br/>**Grant Access:** Allowed |
| **Public Prosecutor / Legal Officer** | Adv. Alok Trivedi (DLS-PROS-0941) | Reviews verified case bundles, frames charges under §193 BNSS, applies witness protection PII redactions. | **Upload:** Denied<br/>**View:** Case Files<br/>**Verify:** Allowed<br/>**Grant Access:** Denied |
| **Court / Judicial Officer** | Smt. Vandana Jain, DHJS (DJS-ASJ-028) | Inspects tamper-evident digital case records during trial, marks electronic court exhibits (Ex. P-1 to Ex. P-N), admits Sec 63B certificates. | **Upload:** Denied<br/>**View:** Unredacted<br/>**Verify:** Allowed<br/>**Grant Access:** Denied |
| **System Administrator** | SysAdmin Vikramaditya (NIC-SYS-9901) | Manages tenant onboarding, key rotation, security policies, and monitors immutable audit ledgers. | **Upload:** Denied<br/>**View:** Denied (Zero-Knowledge)<br/>**Verify:** Allowed<br/>**Grant Access:** Allowed |

---

## 4. Key Functional Features

### 4.1 Document Ingestion & Digitization
- **Multi-Format Drag-and-Drop Ingestion:** Support for PDF, DOCX, PNG, JPG, and DICOM medical forensic imaging formats.
- **Bilingual Automated OCR Processing:** Scans and converts physical typed or handwritten documents in English and Regional Hindi scripts (हिन्दी).
- **AI Entity Extraction Engine:** Auto-identifies Suspect Names, Victim Identifiers, Crime Incident Locations, and BNS/IPC Legal Sections.

### 4.2 Cryptographic Security & Blockchain Anchoring
- **FIPS 180-4 SHA-256 Digesting:** Computed in-memory during upload; salt-bound and signed with HMAC-SHA256.
- **Smart Contract Hash Anchoring:** Transaction anchoring to an Ethereum Polygon / Hyperledger Fabric smart contract registry (`DocumentRegistry.sol`).
- **Envelope Encryption (AES-256-GCM):** Data at rest encrypted using AWS KMS / HSM hardware-backed key hierarchies.
- **Dynamic Watermark Overlay:** Automatic projection of Officer Name, Badge ID, Client IP, and UTC Timestamp on previews and exports.
- **Steganographic Forensic Attribution:** Invisible zero-width character sequences embedded in text payloads to trace photographic leaks.

### 4.3 Search, Discovery & Legal AI
- **Full-Text & Filtered Metadata Search:** Sub-second queries by Case No., IPC/BNS Section, Date Range, and Officer Badge.
- **§180 BNSS Contradiction Discovery:** AI detection of factual discrepancies between police witness depositions and CFSL forensic ballistic/DNA findings.

### 4.4 Governance, Compliance & Tamper Resilience
- **Automated Section 63B BSA Certificate Generator:** 1-click issuance of court-admissible electronic verification certificates.
- **Interactive Tamper Attack Simulator:** Demonstrates mathematical detection of bit-flip byte alterations, automated quarantine, and 1-click consensus restoration.
- **Live WebSocket Audit Ledger:** FIPS 140-3 non-repudiation audit blocks streamed to all connected judicial terminals.

---

## 5. Non-Functional Requirements (NFR)
- **Performance:** Query search latency < 500ms; client-side SHA-256 calculation < 50ms for 10MB records.
- **Availability:** 99.95% high availability with multi-region replicated object storage.
- **Security:** OWASP Top 10 mitigation, zero plaintext storage on disk, TLS 1.3 in transit.
