# 7. Sprint & Milestone Tracker (tracker.md)
**Project:** Secure Digital Document Management System (DMS)  
**SIH Problem Statement:** 26190 | Category: Software | Theme: Blockchain & Cybersecurity  
**Organization:** Ministry of Home Affairs | National Crime Records Bureau & Women Safety Division  

---

## 7.1 Executive Sprint Overview

| Phase | Milestone Name | Timeline | Target Deliverables | Status |
|---|---|---|---|---|
| **Phase 1** | Foundation & Architecture | Hours 0 - 12 | Next.js/Vite UI architecture, PostgreSQL schemas, RBAC definitions, JWT Auth with MFA simulation | **COMPLETED** ✅ |
| **Phase 2** | Cryptography & Smart Contract | Hours 12 - 28 | Client/Server SHA-256, Solidity contract deployment (`DocumentRegistry.sol`), Polygon anchor, Envelope encryption | **COMPLETED** ✅ |
| **Phase 3** | AI Pipeline & Advanced Security | Hours 28 - 36 | Bilingual OCR (Hindi/Eng), Legal Entity NER, Dynamic Watermarking, Section 63B BSA Certificate, Audit Ledger | **COMPLETED** ✅ |
| **Phase 4** | Live Pitch, Demo & Hardening | Hours 36 - 48 | Tamper-attack simulation demo, Merkle tree visualization, zero-error production build, pitch docs | **COMPLETED** ✅ |

---

## 7.2 Detailed Task Breakdown

### Phase 1: Foundation & RBAC Architecture
- [x] Define Product Requirement Document (`prd.md`) with MHA & NCRB scope.
- [x] Define System Technical Specifications (`techspec.md`).
- [x] Construct Relational DB Schemas (`schema.md`) for Users, Cases, Documents, and Audit Logs.
- [x] Configure RBAC Matrix covering IO, SHO Admin, Lab Scientist, Prosecutor, Judge, and System Admin.
- [x] Implement Multi-Factor Authentication (MFA) simulation with TOTP 6-digit challenge.

### Phase 2: Cryptographic Engine & Blockchain Ledger
- [x] Develop WebCrypto client-side SHA-256 digest computation utility.
- [x] Implement AES-256-GCM envelope encryption specifications for S3/MinIO payloads.
- [x] Author Solidity 0.8.20 Smart Contract (`DocumentRegistry.sol`) with `anchorDocument`, `verifyDocument`, and `revokeDocument`.
- [x] Build Interactive Blockchain Ledger & Smart Contract Explorer component (`BlockchainLedgerModal.tsx`).
- [x] Build Merkle Tree root proof generator for multi-evidence case bundles.

### Phase 3: AI Legal Engine & Evidence Security
- [x] Implement simulated bilingual OCR (English & Devanagari Hindi) for scanned legal records.
- [x] Implement Legal Entity Extraction (Suspects, Victims, IPC/BNS sections, locations).
- [x] Develop dynamic diagonal forensic watermarking overlay (`WatermarkWrapper.tsx`).
- [x] Build Section 63B BSA 2023 Electronic Evidence Certificate generator modal.
- [x] Implement Timed Access Delegation modal with auto-expiring shared permissions.

### Phase 4: Tamper Detection & Demonstration Rig
- [x] Develop Tamper Attack Simulator modal (bit-flip corruptions, hash mismatch triggers).
- [x] Connect automatic quarantine lockout on hash divergence.
- [x] Provide complete 8-document technical architecture suite in-app viewer.
- [x] Verify zero TypeScript errors (`npm run build`) and sync live demo build in `docs/`.

---

## 7.3 Compliance & Testing Matrix

| Test Suite | Objective | Expected Result | Status |
|---|---|---|---|
| **SHA-256 Determinism** | Verify that same document produces identical 64-hex hash across client & server | 100% hash match | PASS ✅ |
| **Smart Contract Anchoring** | Call `anchorDocument` on `DocumentRegistry.sol` | Emits `DocumentAnchored` event with tx hash | PASS ✅ |
| **Tamper Attack Detection** | Simulate 1-byte alteration in evidence content | UI triggers red alert & quarantines file | PASS ✅ |
| **Watermark Attribution** | Ensure officer name, badge, IP, and UTC timestamp overlay on viewer | Watermark visible on all viewports & prints | PASS ✅ |
| **MFA Challenge Flow** | Enter incorrect TOTP code vs correct 6-digit code | Rejects invalid, authenticates valid code | PASS ✅ |
| **Section 63B Admissibility** | Generate statutory digital certificate with Merkle root | Complete legal affidavit ready for court | PASS ✅ |
