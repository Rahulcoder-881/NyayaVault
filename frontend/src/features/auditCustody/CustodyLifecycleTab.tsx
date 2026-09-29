import React from 'react';
import type { DocumentItem, UserRole, LifecycleStageId } from '../../types';
import { LifecyclePipeline } from '../../components/LifecyclePipeline';
import { DocumentList } from '../../components/DocumentList';

export interface CustodyLifecycleTabProps {
  documents: DocumentItem[];
  currentRole: UserRole;
  activeStage: LifecycleStageId | null;
  isLoadingDocs: boolean;
  onSelectStage: (stage: LifecycleStageId | null) => void;
  onInspectEvidence: (doc: DocumentItem) => void;
  onVerifyEvidence: (doc: DocumentItem) => void;
  onSimulateTamper: (doc: DocumentItem) => void;
  onRestoreDoc: (doc: DocumentItem) => Promise<any>;
  onViewMerkleProof: (doc: DocumentItem) => void;
  onApplyRedaction: (doc: DocumentItem) => Promise<void>;
  onOpenUploadModal: () => void;
}

export const CustodyLifecycleTab: React.FC<CustodyLifecycleTabProps> = ({
  documents,
  currentRole,
  activeStage,
  isLoadingDocs,
  onSelectStage,
  onInspectEvidence,
  onVerifyEvidence,
  onSimulateTamper,
  onRestoreDoc,
  onViewMerkleProof,
  onApplyRedaction,
  onOpenUploadModal
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-heading">
            6-Stage Case & Document Custody Lifecycle
          </h2>
          <p className="text-xs text-slate-400">
            Select any stage to filter exhibits and inspect custody transfer handoffs from initial FIR to High Court Archival.
          </p>
        </div>

        <LifecyclePipeline
          activeStage={activeStage}
          onSelectStage={onSelectStage}
          documents={documents}
        />
      </div>

      {/* Filtered Document List for selected stage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            {activeStage ? `Exhibits In Stage ${activeStage}` : 'All Exhibits Across All 6 Stages'}
          </h3>
          {activeStage && (
            <button
              onClick={() => onSelectStage(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <DocumentList
          documents={documents}
          currentRole={currentRole}
          activeStage={activeStage}
          onSelectDocument={onInspectEvidence}
          onVerifyDocument={onVerifyEvidence}
          onSimulateTamper={onSimulateTamper}
          onRestoreDoc={onRestoreDoc}
          onViewMerkleProof={onViewMerkleProof}
          onApplyRedaction={onApplyRedaction}
          onOpenUploadModal={onOpenUploadModal}
          isLoading={isLoadingDocs}
        />
      </div>
    </div>
  );
};
