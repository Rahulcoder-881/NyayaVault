import React, { useState } from 'react';
import type { 
  UserRole, 
  DocumentItem, 
  LifecycleStageId 
} from './types';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Feature modules
import { CaseCommandCenter } from './features/dashboard/CaseCommandCenter';
import { DocumentsTab } from './features/documents/DocumentsTab';
import { EvidenceVerificationTab } from './features/evidenceVerification/EvidenceVerificationTab';
import { CustodyLifecycleTab } from './features/auditCustody/CustodyLifecycleTab';
import { AuditTrailTab } from './features/auditCustody/AuditTrailTab';
import { Forensic3DTab } from './features/auditCustody/Forensic3DTab';
import { CertificatesTab } from './features/certificates/CertificatesTab';
import { LegalAITab } from './features/legalAI/LegalAITab';

// Reusable hooks & services
import { useEvidenceData } from './hooks/useEvidenceData';
import { useWebSocketAudit } from './hooks/useWebSocketAudit';
import { useClipboard } from './hooks/useClipboard';

// Icons
import { 
  AlertTriangle, 
  RotateCcw, 
  FolderOpen, 
  GitCommit, 
  Scale, 
  Sparkles, 
  History, 
  Box, 
  ShieldCheck 
} from 'lucide-react';

// Lazy-loaded heavy modals for optimal bundle splitting
const DocumentViewerModal = React.lazy(() => import('./components/DocumentViewerModal').then(m => ({ default: m.DocumentViewerModal })));
const TamperAttackModal = React.lazy(() => import('./components/TamperAttackModal').then(m => ({ default: m.TamperAttackModal })));
const BSACertificateModal = React.lazy(() => import('./components/BSACertificateModal').then(m => ({ default: m.BSACertificateModal })));
const MerkleTreeModal = React.lazy(() => import('./components/MerkleTreeModal').then(m => ({ default: m.MerkleTreeModal })));
const AILegalAssistant = React.lazy(() => import('./components/AILegalAssistant').then(m => ({ default: m.AILegalAssistant })));
const UploadModal = React.lazy(() => import('./components/UploadModal').then(m => ({ default: m.UploadModal })));
const DocsViewerModal = React.lazy(() => import('./components/DocsViewerModal').then(m => ({ default: m.DocsViewerModal })));
const BlockchainLedgerModal = React.lazy(() => import('./components/BlockchainLedgerModal').then(m => ({ default: m.BlockchainLedgerModal })));
const GrantAccessModal = React.lazy(() => import('./components/GrantAccessModal').then(m => ({ default: m.GrantAccessModal })));
const OfficerAuthModal = React.lazy(() => import('./components/OfficerAuthModal').then(m => ({ default: m.OfficerAuthModal })));
const CaseVerificationModal = React.lazy(() => import('./components/CaseVerificationModal').then(m => ({ default: m.CaseVerificationModal })));
const EvidenceVerificationModal = React.lazy(() => import('./components/EvidenceVerificationModal').then(m => ({ default: m.EvidenceVerificationModal })));
const PresentationTourModal = React.lazy(() => import('./components/PresentationTourModal').then(m => ({ default: m.PresentationTourModal })));

export type WorkspaceTab = 
  | 'DOCUMENTS' 
  | 'VERIFY' 
  | 'PIPELINE' 
  | 'CERTIFICATES' 
  | 'AI' 
  | 'AUDIT' 
  | 'FORENSIC_3D';

export const App: React.FC = () => {
  // Application Roles & View States
  const [currentRole, setCurrentRole] = useState<UserRole>('IO_POLICE');
  const [activeStage, setActiveStage] = useState<LifecycleStageId | null>(null);
  const [isEcoMode, setIsEcoMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('DOCUMENTS');

  // Shared Data & Cryptographic State Hook
  const {
    caseRecord,
    documents,
    auditBlocks,
    contradictions,
    timeline,
    isLiveBackend,
    isLoadingDocs,
    certData,
    setCaseRecord,
    setDocuments,
    setAuditBlocks,
    fetchAllData,
    handleSimulateTamper,
    handleRestoreDoc,
    handleRestoreAll,
    handleApplyRedaction,
    handleFetchMerkleProof,
    handleGenerateBSACert,
    handleQueryAI,
    handleUploadDocument
  } = useEvidenceData();

  // WebSocket Live Stream & Fallback Consensus Hook
  const { isWsConnected } = useWebSocketAudit({
    isLiveBackend,
    setDocuments,
    setAuditBlocks,
    setCaseRecord
  });

  // Reusable Clipboard Hook
  const { copiedKey, handleCopy } = useClipboard(2000);

  // Modal Management States
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [viewerInitialTab, setViewerInitialTab] = useState<'PREVIEW' | 'VERIFICATION' | 'TECHNICAL'>('PREVIEW');
  const [merkleProofDoc, setMerkleProofDoc] = useState<DocumentItem | null>(null);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetDoc, setTamperTargetDoc] = useState<DocumentItem | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCaseVerifyModalOpen, setIsCaseVerifyModalOpen] = useState(false);
  const [isEvidenceVerifyModalOpen, setIsEvidenceVerifyModalOpen] = useState(false);
  const [evidenceVerifyDoc, setEvidenceVerifyDoc] = useState<DocumentItem | null>(null);
  const [isPresentationTourOpen, setIsPresentationTourOpen] = useState(false);

  // Evidence Actions
  const handleInspectEvidence = (doc: DocumentItem) => {
    setViewerInitialTab('PREVIEW');
    setSelectedDoc(doc);
  };

  const handleVerifyEvidence = (doc: DocumentItem) => {
    setViewerInitialTab('VERIFICATION');
    setSelectedDoc(doc);
  };

  const handleOpenEvidenceVerifyModal = (doc?: DocumentItem | null) => {
    setEvidenceVerifyDoc(doc || selectedDoc || documents[0] || null);
    setIsEvidenceVerifyModalOpen(true);
  };

  const hasTamperAlert = (caseRecord?.quarantine_count || 0) > 0;

  return (
    <ErrorBoundary fallbackTitle="NyayaVault Court System Interruption">
      <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
        
        {/* 1. Header Navigation & RBAC Controls */}
        <Navbar
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          integrityScore={caseRecord?.integrity_score || 100}
          quarantineCount={caseRecord?.quarantine_count || 0}
          isEcoMode={isEcoMode}
          onToggleEcoMode={() => setIsEcoMode(!isEcoMode)}
          onOpenTamperModal={() => {
            setTamperTargetDoc(documents[2] || documents[0]);
            setIsTamperModalOpen(true);
          }}
          onOpenCertModal={() => setIsCertModalOpen(true)}
          onRestoreAll={handleRestoreAll}
          onOpenAISearch={() => setIsAIModalOpen(true)}
          onOpenDocsModal={() => setIsDocsModalOpen(true)}
          onOpenBlockchainModal={() => setIsBlockchainModalOpen(true)}
          onOpenGrantAccessModal={() => setIsGrantAccessModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenEvidenceVerifyModal={() => handleOpenEvidenceVerifyModal(selectedDoc || documents[0] || null)}
          onOpenPresentationTour={() => setIsPresentationTourOpen(true)}
        />

        {/* Critical Security Alert Ribbon if Tampered */}
        {hasTamperAlert && (
          <div className="w-full bg-red-600 text-white px-4 py-3 text-xs font-mono font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse z-30 border-b border-red-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
              <span>
                ZERO-TRUST ALERT: {caseRecord?.quarantine_count} EXHIBIT(S) FAILED CRYPTOGRAPHIC INTEGRITY // MERKLE ROOT ALTERED // QUARANTINE ENFORCED
              </span>
            </div>
            <button
              onClick={handleRestoreAll}
              className="px-3.5 py-1.5 bg-slate-950 text-emerald-400 hover:bg-slate-900 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Genesis Consensus</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          
          {/* Feature Module: Case Command Center */}
          <CaseCommandCenter
            caseRecord={caseRecord}
            documents={documents}
            isLiveBackend={isLiveBackend}
            isEcoMode={isEcoMode}
            activeStage={activeStage}
            copiedKey={copiedKey}
            hasTamperAlert={hasTamperAlert}
            onCopy={handleCopy}
            onToggleEcoMode={() => setIsEcoMode(!isEcoMode)}
            onSyncApi={fetchAllData}
            onSelectStage={setActiveStage}
            onOpenSearch={() => setIsAIModalOpen(true)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenVerifyCase={() => setIsCaseVerifyModalOpen(true)}
            onOpenCertificates={() => {
              setActiveTab('CERTIFICATES');
              setIsCertModalOpen(true);
            }}
            onOpenDocumentsTab={() => setActiveTab('DOCUMENTS')}
            onOpenPipelineTab={() => setActiveTab('PIPELINE')}
            onOpenAuditTab={() => setActiveTab('AUDIT')}
          />

          {/* Workspace Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 overflow-x-auto no-scrollbar gap-1 pt-1">
            <button
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'DOCUMENTS'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Case Documents</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('VERIFY')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'VERIFY'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evidence Verification</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                5 Vectors
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PIPELINE')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'PIPELINE'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Custody Lifecycle</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                6 Stages
              </span>
            </button>

            <button
              onClick={() => setActiveTab('CERTIFICATES')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'CERTIFICATES'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Sec 63 BSA Certificate</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
                Court Ready
              </span>
            </button>

            <button
              onClick={() => setActiveTab('AI')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'AI'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Legal AI & Contradictions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 font-mono border border-indigo-500/30">
                {contradictions.length} Alerts
              </span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'AUDIT'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {auditBlocks.length} Blocks
              </span>
            </button>

            <button
              onClick={() => setActiveTab('FORENSIC_3D')}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'FORENSIC_3D'
                  ? 'bg-slate-900 text-cyan-400 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Forensic 3D Lab</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isEcoMode ? 'bg-slate-800 text-slate-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isEcoMode ? 'Eco Paused' : '3D Live'}
              </span>
            </button>
          </div>

          {/* Tab 1: Documents Module */}
          {activeTab === 'DOCUMENTS' && (
            <DocumentsTab
              documents={documents}
              currentRole={currentRole}
              activeStage={activeStage}
              auditBlocks={auditBlocks}
              isLoadingDocs={isLoadingDocs}
              onInspectEvidence={handleInspectEvidence}
              onVerifyEvidence={handleVerifyEvidence}
              onSimulateTamper={(doc) => {
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
              onViewMerkleProof={(doc) => setMerkleProofDoc(doc)}
              onApplyRedaction={handleApplyRedaction}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenBlockchainModal={() => setIsBlockchainModalOpen(true)}
              onOpenAuditTab={() => setActiveTab('AUDIT')}
              onOpenTimedAccessModal={() => setIsGrantAccessModalOpen(true)}
              onOpenDocsModal={() => setIsDocsModalOpen(true)}
            />
          )}

          {/* Tab 2: Dedicated Evidence Verification Module */}
          {activeTab === 'VERIFY' && (
            <EvidenceVerificationTab
              documents={documents}
              selectedDoc={selectedDoc}
              currentRole={currentRole}
              isLiveBackend={isLiveBackend}
              onSelectDocument={setSelectedDoc}
              onSimulateTamper={(doc) => {
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
            />
          )}

          {/* Tab 3: Custody Lifecycle Module */}
          {activeTab === 'PIPELINE' && (
            <CustodyLifecycleTab
              documents={documents}
              currentRole={currentRole}
              activeStage={activeStage}
              isLoadingDocs={isLoadingDocs}
              onSelectStage={setActiveStage}
              onInspectEvidence={handleInspectEvidence}
              onVerifyEvidence={handleVerifyEvidence}
              onSimulateTamper={(doc) => {
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
              onViewMerkleProof={(doc) => setMerkleProofDoc(doc)}
              onApplyRedaction={handleApplyRedaction}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {/* Tab 4: Section 63 BSA Electronic Admissibility Certificates Module */}
          {activeTab === 'CERTIFICATES' && (
            <CertificatesTab
              certData={certData}
              documents={documents}
              onOpenCertModal={() => setIsCertModalOpen(true)}
            />
          )}

          {/* Tab 5: Legal AI & Statutory Contradictions Module */}
          {activeTab === 'AI' && (
            <LegalAITab
              contradictions={contradictions}
              timeline={timeline}
              onOpenAIModal={() => setIsAIModalOpen(true)}
            />
          )}

          {/* Tab 6: Cryptographic Audit Trail Module */}
          {activeTab === 'AUDIT' && (
            <AuditTrailTab
              auditBlocks={auditBlocks}
              isWsConnected={isWsConnected}
              onOpenBlockchainModal={() => setIsBlockchainModalOpen(true)}
            />
          )}

          {/* Tab 7: Forensic 3D Lab Module */}
          {activeTab === 'FORENSIC_3D' && (
            <Forensic3DTab
              isEcoMode={isEcoMode}
              hasTamperAlert={hasTamperAlert}
              activeStage={activeStage}
              integrityScore={caseRecord?.integrity_score || 100}
              merkleRoot={caseRecord?.merkle_root || ''}
              onToggleEcoMode={() => setIsEcoMode(!isEcoMode)}
              onSelectStage={setActiveStage}
              onReturnToDocuments={() => setActiveTab('DOCUMENTS')}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-800/80 bg-[#060a14] py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200">NyayaVault</span>
              <span>•</span>
              <span>Secure Digital Custody DMS for Legal & Investigation Documents</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Conforming to ISO/IEC 27001:2022 & Bharatiya Sakshya Adhiniyam (Act 47 of 2023)
            </div>
          </div>
        </footer>

        {/* MODALS WITH CODE-SPLITTING VIA REACT.LAZY & SUSPENSE */}
        <React.Suspense fallback={null}>
          {/* 1. Document Viewer Modal */}
          {selectedDoc && (
            <DocumentViewerModal
              document={selectedDoc}
              currentRole={currentRole}
              onClose={() => setSelectedDoc(null)}
              onSimulateTamper={(doc) => {
                setSelectedDoc(null);
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
              isLiveBackend={isLiveBackend}
              initialTab={viewerInitialTab}
            />
          )}

          {/* 2. Tamper Attack Simulator Modal */}
          {isTamperModalOpen && (
            <TamperAttackModal
              documents={documents}
              selectedDoc={tamperTargetDoc}
              isOpen={isTamperModalOpen}
              onClose={() => {
                setIsTamperModalOpen(false);
                setTamperTargetDoc(null);
              }}
              onExecuteTamper={handleSimulateTamper}
              onRestoreDoc={handleRestoreDoc}
            />
          )}

          {/* 3. Section 63 BSA Certificate Modal */}
          {isCertModalOpen && (
            <BSACertificateModal
              isOpen={isCertModalOpen}
              onClose={() => setIsCertModalOpen(false)}
              caseRecord={caseRecord}
              certificateData={certData}
              onGenerate={handleGenerateBSACert}
            />
          )}

          {/* 4. Merkle Tree Proof Modal */}
          {merkleProofDoc !== null && (
            <MerkleTreeModal
              document={merkleProofDoc}
              isOpen={merkleProofDoc !== null}
              onClose={() => setMerkleProofDoc(null)}
              onFetchProof={handleFetchMerkleProof}
            />
          )}

          {/* 5. AI Legal Assistant Modal */}
          {isAIModalOpen && (
            <AILegalAssistant
              isOpen={isAIModalOpen}
              onClose={() => setIsAIModalOpen(false)}
              contradictions={contradictions}
              timeline={timeline}
              onSelectDocById={(docId) => {
                setIsAIModalOpen(false);
                const found = documents.find(d => d.id === docId);
                if (found) setSelectedDoc(found);
              }}
              onQueryAI={handleQueryAI}
            />
          )}

          {/* 6. Document Ingestion Modal */}
          {isUploadModalOpen && (
            <UploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              currentRole={currentRole}
              onUpload={handleUploadDocument}
              onSelectDocument={setSelectedDoc}
            />
          )}

          {/* 7. System Architecture & Specification Suite (8 Chapters) */}
          {isDocsModalOpen && (
            <DocsViewerModal
              isOpen={isDocsModalOpen}
              onClose={() => setIsDocsModalOpen(false)}
            />
          )}

          {/* 8. Blockchain Ledger & Smart Contract Explorer */}
          {isBlockchainModalOpen && (
            <BlockchainLedgerModal
              isOpen={isBlockchainModalOpen}
              onClose={() => setIsBlockchainModalOpen(false)}
              documents={documents}
            />
          )}

          {/* 9. Timed Evidence Access Delegation (Rule 8.2) */}
          {isGrantAccessModalOpen && (
            <GrantAccessModal
              isOpen={isGrantAccessModalOpen}
              onClose={() => setIsGrantAccessModalOpen(false)}
              currentRole={currentRole}
              currentCaseId={caseRecord?.case_id || 'CASE-2026-DEL-402'}
            />
          )}

          {/* 10. Officer Multi-Factor Authentication & RBAC Switcher */}
          {isAuthModalOpen && (
            <OfficerAuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              currentRole={currentRole}
              onSelectRole={(newRole) => setCurrentRole(newRole)}
            />
          )}

          {/* 11. Case Verification Consensus Audit Modal */}
          {isCaseVerifyModalOpen && (
            <CaseVerificationModal
              isOpen={isCaseVerifyModalOpen}
              onClose={() => setIsCaseVerifyModalOpen(false)}
              caseRecord={caseRecord}
              documents={documents}
              onRestoreAll={handleRestoreAll}
              isLiveBackend={isLiveBackend}
            />
          )}

          {/* 12. Dedicated Evidence Verification Suite Modal */}
          {isEvidenceVerifyModalOpen && (
            <EvidenceVerificationModal
              isOpen={isEvidenceVerifyModalOpen}
              onClose={() => setIsEvidenceVerifyModalOpen(false)}
              document={evidenceVerifyDoc || selectedDoc || documents[0] || null}
              documents={documents}
              currentRole={currentRole}
              isLiveBackend={isLiveBackend}
              onSelectDocument={(doc) => setEvidenceVerifyDoc(doc)}
              onSimulateTamper={(doc) => {
                setIsEvidenceVerifyModalOpen(false);
                setTamperTargetDoc(doc);
                setIsTamperModalOpen(true);
              }}
              onRestoreDoc={handleRestoreDoc}
            />
          )}

          {/* 13. Presentation Tour / SIH Pitch Deck Modal */}
          {isPresentationTourOpen && (
            <PresentationTourModal
              isOpen={isPresentationTourOpen}
              onClose={() => setIsPresentationTourOpen(false)}
              onSimulateTamper={() => {
                setIsPresentationTourOpen(false);
                setTamperTargetDoc(documents[2] || documents[0]);
                setIsTamperModalOpen(true);
              }}
              onOpenCertModal={() => {
                setIsPresentationTourOpen(false);
                setIsCertModalOpen(true);
              }}
              onOpenMerkleModal={() => {
                setIsPresentationTourOpen(false);
                setMerkleProofDoc(documents[0] || null);
              }}
              onOpenAIModal={() => {
                setIsPresentationTourOpen(false);
                setIsAIModalOpen(true);
              }}
            />
          )}
        </React.Suspense>

      </div>
    </ErrorBoundary>
  );
};

export default App;
