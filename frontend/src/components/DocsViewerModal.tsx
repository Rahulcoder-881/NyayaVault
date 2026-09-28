import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  FileText, 
  Cpu, 
  GitFork, 
  Palette, 
  Database, 
  Code2, 
  ListTodo, 
  Scale, 
  Copy, 
  Check, 
  Search
} from 'lucide-react';

interface DocsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

interface DocChapter {
  id: string;
  filename: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  content: string;
}

export const DocsViewerModal: React.FC<DocsViewerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'prd'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const chapters: DocChapter[] = [
    {
      id: 'prd',
      filename: 'prd.md',
      title: '1. Product Requirement Document',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      category: 'Requirements & Scope',
      content: `# 1. Product Requirement Document (prd.md)
**Project Ref:** SIH Problem Statement 26190
**Organization:** Ministry of Home Affairs | National Crime Records Bureau (NCRB) & Women Safety Division
**Category:** Software | Theme: Blockchain & Cybersecurity

## 1.1 Executive Summary
The Secure Digital Document Management System (DMS) is an enterprise-grade, cloud-based, blockchain-anchored platform designed to centralize, secure, and streamline the lifecycle of sensitive investigation and legal documents across law enforcement agencies, courts, and legal institutions.

## 1.2 Core Objectives
• Security: Eliminate paper-based vulnerabilities, document tampering, and physical storage bottlenecks.
• Chain of Custody: Provide an end-to-end cryptographic chain of custody for digital evidence.
• High Searchability: Enable sub-second semantic and entity search across millions of legal records.
• Compliance: Ensure strict compliance with the Indian IT Act, BNSS 2023, BSA 2023, and data privacy guidelines.

## 1.3 Core Persona & User Roles
• Investigating Officer (IO): Uploads FIRs, evidence, and witness statements; applies digital signatures.
• Station House Officer (SHO) / Senior Admin: Approves case files, assigns access permissions across team members.
• Public Prosecutor / Legal Officer: Reviews verified case charge sheets and evidence documents.
• Court / Judicial Officer: Inspects tamper-evident digital case records during trial.
• System Administrator: Manages organization onboarding, security policies, and audit logs.

## 1.4 Key Functional Features
1. Document Ingestion & Digitization: Drag-and-drop file upload with support for PDF, DOCX, PNG, JPG, and DICOM formats. Automated OCR processing with multi-language support (English & Regional Hindi).
2. Security & Chain of Custody: Automatic SHA-256 hashing on upload and instant blockchain timestamping. End-to-end envelope encryption (AES-256-GCM at rest, TLS 1.3 in transit). Automated dynamic watermarking.
3. Search & Discovery: Full-text search with metadata filters (Case No., IPC/BNS Section, Date Range, Officer ID). AI entity extraction: auto-detect suspect names, locations, and legal sections.
4. Governance & Audit: Real-time immutable audit trail displaying all view, download, edit, and share activities.`
    },
    {
      id: 'techspec',
      filename: 'techspec.md',
      title: '2. Technical Specification',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      category: 'Architecture & Stack',
      content: `# 2. Technical Specification (techspec.md)
## 2.1 System Architecture Overview
[ Frontend: Next.js 14 + TailwindCSS / React Vite ]
                 │ (REST / GraphQL API + TLS 1.3)
                 ▼
[ Backend API: Node.js (NestJS) / Python (FastAPI) ]
  ├── [ Auth & RBAC ] ── JWT + Multi-Factor Auth (MFA)
  ├── [ Document Ingestion ] ── Tesseract OCR / EasyOCR
  └── [ Crypto Module ] ── AES-256 Envelope Encryption
                 │
  ├──────────────┼──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
[ PostgreSQL ] [ Meilisearch ] [ S3 Storage ] [ Hyperledger / Polygon ]
 (Metadata)   (Full-Text)    (Encrypted)   (File Hashes Ledger)

## 2.2 Technology Stack
• Frontend Framework: Next.js 14 / Vite React, TypeScript, Tailwind CSS, Lucide Icons.
• UI Components: Shadcn UI, Radix Primitives, TanStack Table, Recharts.
• Backend API: Node.js (NestJS) or FastAPI (Python).
• Database: PostgreSQL (Relational metadata, RBAC, Case linkage).
• Search Engine: Meilisearch or Elasticsearch for instant full-text indexing.
• Storage Engine: AWS S3 / MinIO Object Storage with server-side encryption.
• Blockchain Network: Ethereum Polygon / Hyperledger Fabric for smart-contract hash registry.
• Cryptography: Node crypto / OpenSSL / WebCrypto for SHA-256 and AES-GCM-256.`
    },
    {
      id: 'appflow',
      filename: 'appflow.md',
      title: '3. Application Flow & User Journeys',
      icon: <GitFork className="w-4 h-4 text-emerald-400" />,
      category: 'Workflows & Lifecycles',
      content: `# 3. Application Flow & User Journeys (appflow.md)
## 3.1 Officer Authentication Flow
[ Landing Page ] ──► [ Officer Login ] ──► [ Input Credentials ] ──► [ MFA Verification ] ──► [ Officer Dashboard ]

## 3.2 Document Upload & Blockchain Verification Flow
[ Officer Dashboard ]
       │
       ▼
[ Upload Document Modal ] ──► Select Case ID & Security Classification Level
       │
       ▼
[ Client Processing ] ──► Format validation & streaming over TLS
       │
       ▼
[ Backend Pipeline ]
       ├── 1. Store encrypted payload in Object Storage (AES-256-GCM)
       ├── 2. Execute OCR job & extract entities (Suspects, BNS Sections)
       ├── 3. Generate SHA-256 hash
       └── 4. Commit (doc_id, hash, uploader_id, timestamp) to Smart Contract
       │
       ▼
[ Success Response ] ──► UI displays 'Document Verified & Anchored to Chain' badge

## 3.3 Case Document Retrieval & Verification Flow
[ Case View UI ] ──► [ Preview Document Modal ]
                             │
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
[ Dynamic Watermark Overlay ]              [ Verify Integrity Button ]
(Shows Officer Name, Badge & Time)                  │
                                                    ▼
                                     [ Fetch Hash from Blockchain ]
                                                    │
                                       ┌────────────┴────────────┐
                                       ▼                         ▼
                               [ Match: Verified ]      [ Mismatch: Alert ]`
    },
    {
      id: 'design',
      filename: 'design.md',
      title: '4. Design System & Modern UI/UX',
      icon: <Palette className="w-4 h-4 text-cyan-400" />,
      category: 'Design System',
      content: `# 4. Design System & Modern UI/UX Guidelines (design.md)
## 4.1 Visual Language & Aesthetics
• Theme Concept: Clean, trustworthy, high-contrast, enterprise-grade tech interface with slate and dark navy accents.
• Color Palette: Slate Navy (#0F172A), Law Blue (#2563EB), Emerald Green (#059669), Warning Red (#E11D48), Background (#F8FAFC / #0B0F19).

## 4.2 Typography & Hierarchy
• Font Family: Inter, Plus Jakarta Sans, JetBrains Mono for cryptographic digests.
• Headings: Bold, dark navy/white, tight tracking (tracking-tight).
• Body Text: Muted slate (text-slate-400 / text-slate-600), highly readable line height.

## 4.3 Page Templates & Layouts
• Global Navigation: Fixed top/sidebar navigation with Quick Search Bar (Cmd + K).
• Dashboard Metrics: 4 key cards showing Total Documents, Pending Approvals, Chain Integrity Status, and Security Alerts.
• Document Table: Categorized tabs, high-density columns, inline verification badges, and watermarked export triggers.`
    },
    {
      id: 'schema',
      filename: 'schema.md',
      title: '5. Database & Smart Contract Schema',
      icon: <Database className="w-4 h-4 text-amber-400" />,
      category: 'Data Schemas',
      content: `# 5. Database & Smart Contract Schema (schema.md)
## 5.1 Relational Database Schema (PostgreSQL)
-- Users / Officers Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'IO', 'SHO', 'PROSECUTOR', 'ADMIN', 'JUDGE'
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cases Table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_officer_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    file_path_encrypted TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    blockchain_tx_id VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

## 5.2 Blockchain Smart Contract Schema (Solidity)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
    struct Record {
        string docId;
        string sha256Hash;
        address uploadedBy;
        uint256 timestamp;
        bool isRevoked;
    }

    mapping(string => Record) private records;
    event DocumentAnchored(string indexed docId, string sha256Hash, address uploader, uint256 timestamp);

    function anchorDocument(string memory _docId, string memory _sha256Hash) public {
        require(bytes(records[_docId].docId).length == 0, 'Document already registered');
        records[_docId] = Record(_docId, _sha256Hash, msg.sender, block.timestamp, false);
        emit DocumentAnchored(_docId, _sha256Hash, msg.sender, block.timestamp);
    }

    function verifyDocument(string memory _docId) public view returns (string memory sha256Hash, uint256 timestamp, bool isRevoked) {
        Record memory rec = records[_docId];
        require(bytes(rec.docId).length > 0, 'Document not found');
        return (rec.sha256Hash, rec.timestamp, rec.isRevoked);
    }
}`
    },
    {
      id: 'implementation',
      filename: 'implementation.md',
      title: '6. Implementation Guide & Snippets',
      icon: <Code2 className="w-4 h-4 text-rose-400" />,
      category: 'Source Code & Setup',
      content: `# 6. Implementation Guide & Code Snippets (implementation.md)
## 6.1 Step 1: Project Initialization
npx create-next-app@latest secure-dms --typescript --tailwind --eslint --app
cd secure-dms
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu input table badge tabs toast
npm install lucide-react clsx tailwind-merge @tanstack/react-table

## 6.2 Step 2: SHA-256 Crypto Utility (lib/crypto.ts)
export async function computeSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

## 6.3 Step 3: Dynamic Watermark Component (components/watermark.tsx)
import React from 'react';

export const WatermarkWrapper = ({ officerName, badgeNumber, children }) => {
  const timestamp = new Date().toLocaleString();
  const text = \`CONFIDENTIAL - ACCESS BY \${officerName} (\${badgeNumber}) - \${timestamp}\`;
  return (
    <div className='relative overflow-hidden select-none'>
      <div className='absolute inset-0 pointer-events-none z-50 flex items-center justify-center opacity-15 rotate-[-25deg]'>
        <p className='text-xl font-mono text-red-600 font-bold'>{text}</p>
      </div>
      {children}
    </div>
  );
};`
    },
    {
      id: 'tracker',
      filename: 'tracker.md',
      title: '7. Sprint & Milestone Tracker',
      icon: <ListTodo className="w-4 h-4 text-yellow-400" />,
      category: 'Roadmap & Sprints',
      content: `# 7. Sprint & Milestone Tracker (tracker.md)
Phase 1: Foundation (Hours 0-12)
• Tasks: Next.js/Vite UI setup, Database schemas, JWT Auth with MFA simulation
• Status: COMPLETED ✅

Phase 2: Security & Chain (Hours 12-28)
• Tasks: Client/Server SHA-256, Solidity contract deployment, Chain anchor, Envelope encryption
• Status: COMPLETED ✅

Phase 3: AI & Features (Hours 28-36)
• Tasks: OCR integration, Full-text search, Dynamic Watermarking, Audit Log, Section 63B BSA Certificate
• Status: COMPLETED ✅

Phase 4: Pitch & Demo (Hours 36+)
• Tasks: End-to-end testing, pitch deck preparation, tamper-detection demo, production hardening
• Status: COMPLETED ✅`
    },
    {
      id: 'rules',
      filename: 'rules.md',
      title: '8. Legal Rules & Security Policies',
      icon: <Scale className="w-4 h-4 text-indigo-400" />,
      category: 'Compliance & Governance',
      content: `# 8. Legal Rules & Security Policies (rules.md)
## 8.1 Legal & Evidence Compliance
• Chain of Custody: Every transition of a document between IO, Forensic Labs, and Prosecutor must be explicitly logged with a cryptographic signature.
• Section 63B Certificate: Digital records submitted in court must be accompanied by an auto-generated digital certificate confirming data integrity.

## 8.2 Role-Based Access Control Matrix (RBAC)
User Role                 | Upload  | View Assigned | Verify Hash | Grant Access
--------------------------|---------|---------------|-------------|-------------
Investigating Officer (IO)| Allowed | Allowed       | Allowed     | Denied
Station House Officer (SHO)| Allowed| Allowed       | Allowed     | Allowed
Public Prosecutor         | Denied  | Allowed       | Allowed     | Denied
Court / Judge             | Denied  | Allowed       | Allowed     | Denied
System Administrator      | Denied  | Denied        | Allowed     | Allowed

## 8.3 Mandatory System Rules
1. Watermark Enforcement: Every exported PDF must bear the dynamic watermark overlay of the requesting officer's credentials.
2. Zero Plaintext Policy: Files stored on disk or cloud objects must be encrypted prior to writing (AES-256-GCM).
3. Immutable Audits: System admins cannot edit or delete records in audit_logs or modify blockchain transaction records.`
    }
  ];

  const currentChapter = chapters.find(c => c.id === activeTab) || chapters[0];

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(currentChapter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  SIH 26190 TECHNICAL SUITE
                </span>
                <span className="text-xs text-slate-400">Ministry of Home Affairs & NCRB</span>
              </div>
              <h2 className="text-lg font-bold text-white">System Architecture & Specification Suite</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Copy active document markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy MD'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col">
            <div className="p-3 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredChapters.map((chapter) => {
                const isActive = chapter.id === activeTab;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveTab(chapter.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/40 text-white font-semibold'
                        : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {chapter.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{chapter.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <span>{chapter.filename}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>8 Canonical Chapters</span>
              <span className="font-mono">docs/*.md</span>
            </div>
          </div>

          {/* Document Content View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
            {/* Document Header */}
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  documentation/{currentChapter.filename}
                </span>
                <span className="text-xs text-slate-400">• {currentChapter.category}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">MHA/NCRB Certified Spec</span>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-slate-300 leading-relaxed space-y-4">
              <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap bg-slate-950 p-5 rounded-xl border border-slate-800/80 leading-relaxed shadow-inner overflow-x-auto">
                {currentChapter.content}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
