# 4. Design System & Modern UI/UX Guidelines (design.md)
**Document Ref:** MHA-NCRB/SIH-26190/DS-01  
**Project:** Secure Digital Document Management System (DMS)  
**Authority:** Ministry of Home Affairs | National Crime Records Bureau & Women Safety Division  

---

## 4.1 Visual Language & Aesthetic Philosophy

The visual design system of the Secure DMS conveys **institutional trust, cryptographic authority, razor-sharp precision, and high-stakes clarity**. Because this platform is deployed in police stations, high-security forensic laboratories, prosecution directorates, and judicial courtrooms, the UI eliminates frivolous decoration in favor of a clean, high-contrast, data-dense interface.

### Key Aesthetic Tenets
1. **Cryptographic Legibility:** Hashes, Merkle roots, signatures, and timestamps are rendered in monospace typography with quick-copy triggers and distinct verification badges.
2. **Role-Tailored Contexts:** Visual indicator accents immediately notify the operator of their active authority level (e.g., Police Cyan, Forensic Violet, Prosecution Amber, Judicial Emerald, Admin Slate).
3. **Forensic Integrity States:** 
   - **Verified Clean:** Emerald border & glowing badge (`#059669`).
   - **Tampered / Quarantined:** High-visibility crimson warning state with pulsating alert markers (`#E11D48`).
   - **Under Analysis / Ingesting:** Cyan / Blue progress indicators (`#2563EB`).
4. **Zero Ambient Distraction:** Dark navy, slate, and clean paper surfaces prevent operator eye-fatigue during long shifts and critical court cross-examinations.

---

## 4.2 Color Palette & Semantic Tokens

```
                                  PRIMARY PALETTE
┌───────────────────────┬───────────────────────┬───────────────────────┐
│     Slate Navy        │       Law Blue        │     Emerald Guard     │
│       #0F172A         │        #2563EB        │        #059669        │
│  (Deep Backgrounds &  │  (Primary CTAs, Brand │  (Verified Blockchain │
│      Dark Chrome)     │      & Navigation)    │   Integrity, Approved)│
└───────────────────────┴───────────────────────┴───────────────────────┘

                                 SEMANTIC ACCENTS
┌───────────────────────┬───────────────────────┬───────────────────────┐
│     Crimson Alert     │      Amber Warning    │      Purple Crypt     │
│        #E11D48        │        #D97706        │        #7C3AED        │
│ (Tamper Detection,    │ (Pending Authorization│  (KMS Keys, Envelopes,│
│  Quarantine Lockout)  │   Expiring Access)    │   Forensic Exhibits)  │
└───────────────────────┴───────────────────────┴───────────────────────┘

                                 SURFACE MATRIX
┌───────────────────────┬───────────────────────┬───────────────────────┐
│      Base Surface     │     Card Background   │     Border Subdued    │
│        #0B0F19        │        #111827        │        #1F2937        │
│   (True Slate Black)  │   (Elevated Charcoal) │  (Subtle Section Line)│
└───────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 4.3 Typography System

The platform standardizes on **Plus Jakarta Sans / Inter** for UI copy and **JetBrains Mono / Fira Code** for cryptographic digests.

| Hierarchy | Font Face | Size / Line-Height | Weight | Tracking | Primary Usage |
|---|---|---|---|---|---|
| Display / H1 | Plus Jakarta Sans | 28px / 36px | Bold (700) | -0.025em | Main Screen Titles, Case Overview |
| Section / H2 | Plus Jakarta Sans | 20px / 28px | SemiBold (600) | -0.02em | Modal Headers, Metric Titles |
| Subhead / H3 | Plus Jakarta Sans | 15px / 22px | Medium (500) | normal | Table Column Headers, Card Titles |
| Body Copy | Inter | 13px / 20px | Regular (400) | normal | Legal Text, Witness Depositions |
| Micro / Meta | Inter | 11px / 16px | Medium (500) | +0.02em | Badges, Timestamp Overlays |
| Crypto Digest | JetBrains Mono | 12px / 18px | Regular (400) | normal | SHA-256 Hashes, Block Tx, Merkle |

---

## 4.4 Global Navigation & Header Architecture

The application layout consists of:
1. **Institutional Masthead:** Displays the Government of India National Emblem seal, Ministry of Home Affairs banner, and active NCRB Division status.
2. **Quick Navigation Strip:**
   - **Global Search Bar (Cmd + K):** Instant semantic and entity lookup across Case IDs, BNS sections, and suspect names.
   - **Role Switcher & MFA Badge:** Shows active persona (IO, SHO, Lab Scientist, Prosecutor, Judge, Admin) with instant privilege switching and MFA session indicator.
   - **Action Controls:** Direct triggers for "Blockchain Ledger Explorer", "Section 63B BSA Certificate", "Grant Access Modal", and "Documentation Suite".
3. **Four Telemetry Cards (Executive Overview):**
   - **Total Documents:** Total evidence files indexed in vault.
   - **Pending Approvals:** Charge sheets and forensic reports awaiting SHO / Court sign-off.
   - **Chain Integrity Status:** Real-time percentage of on-chain verified records (e.g., 99.4% or 100%).
   - **Active Security Alerts:** Tamper events or quarantined files requiring immediate forensic action.

---

## 4.5 Component Specifications

### 1. Dynamic Diagonal Watermarking (`WatermarkWrapper`)
- **Visual Presentation:** 45-degree (or -25-degree) repeated translucent diagonal text superimposed over document previews.
- **Dynamic Content:** Injects `CONFIDENTIAL - ACCESSED BY [Officer Name] ([Badge Number]) - [IP Address] - [Timestamp UTC]`.
- **Security:** Layered with `pointer-events-none`, `user-select: none`, and print CSS rules to ensure physical or screenshot leaks are immediately attributable.

### 2. Blockchain Verification Badge
- **Valid (On-Chain Match):** Green icon `ShieldCheck` with label "Anchored: Polygon Block #1842091".
- **Tampered (Hash Divergence):** Red flashing icon `AlertTriangle` with label "Tamper Detected! S3 Hash ≠ Ledger Hash".

### 3. Document Ingestion Modal (`UploadModal`)
- Drag-and-drop zone with MIME-type filtering (`.pdf`, `.docx`, `.png`, `.jpg`, `.dcm`).
- Quick-load pre-packaged evidence files (e.g., Cyber-Fraud FIR, Ballistics Striation Report, Seizure Panchnama).
- In-flight bilingual OCR preview (Hindi/English) and Named Entity Recognition (NER) tag extraction.

### 4. Interactive Blockchain Ledger Explorer (`BlockchainLedgerModal`)
- Real-time block stream with block height, transaction hashes, gas consumption, and anchoring timestamps.
- One-click copy for Polygonscan / Hyperledger block verification.

### 5. Timed Access Delegation Modal (`GrantAccessModal`)
- SHO-only feature permitting time-limited delegation of sensitive cases to external labs or prosecutors.
- Selectable validity period (1 Hour, 12 Hours, 24 Hours, 7 Days) with auto-expiry countdown.
