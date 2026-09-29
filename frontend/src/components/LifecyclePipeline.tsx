import React from 'react';
import type { LifecycleStageId, DocumentItem } from '../types';
import { LIFECYCLE_STAGES } from '../constants';
import { 
  FileText, 
  MapPin, 
  Microscope, 
  Scale, 
  Gavel, 
  Archive, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface LifecyclePipelineProps {
  activeStage: LifecycleStageId | null;
  onSelectStage: (stage: LifecycleStageId | null) => void;
  documents: DocumentItem[];
}

export const LifecyclePipeline: React.FC<LifecyclePipelineProps> = React.memo(({
  activeStage,
  onSelectStage,
  documents
}) => {
  const getStageIcon = (id: LifecycleStageId) => {
    switch (id) {
      case 1: return <FileText className="w-4 h-4" />;
      case 2: return <MapPin className="w-4 h-4" />;
      case 3: return <Microscope className="w-4 h-4" />;
      case 4: return <Scale className="w-4 h-4" />;
      case 5: return <Gavel className="w-4 h-4" />;
      case 6: return <Archive className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-heading flex items-center space-x-2">
            <span>6-Stage Case & Document Lifecycle Pipeline</span>
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              ZERO-TRUST CUSTODY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            End-to-end statutory evidentiary tracking strictly conforming to Bharatiya Sakshya Adhiniyam 2023.
          </p>
        </div>
        {activeStage !== null && (
          <button
            onClick={() => onSelectStage(null)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
          >
            Show All Stages ({documents.length} Records)
          </button>
        )}
      </div>

      {/* Grid of Stage Steppers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {LIFECYCLE_STAGES.map((stage) => {
          const stageDocs = documents.filter((d) => d.stage === stage.id);
          const hasTampered = stageDocs.some((d) => d.status === 'TAMPERED' || d.status === 'QUARANTINED');
          const isSelected = activeStage === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage(isSelected ? null : stage.id)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none ${
                hasTampered
                  ? 'bg-red-950/30 border-red-500/50 hover:border-red-400 shadow-sm shadow-red-900/20'
                  : isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Stage Number & Icon */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span 
                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-slate-900"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.id}
                  </span>
                  <div className="text-slate-300 group-hover:text-cyan-300 transition-colors">
                    {getStageIcon(stage.id)}
                  </div>
                </div>

                {/* Status Indicator */}
                {hasTampered ? (
                  <span className="flex items-center text-red-400 text-[10px] font-mono font-bold animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 mr-0.5" />
                    ALERT
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-400 text-[10px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                    VALID
                  </span>
                )}
              </div>

              {/* Title & Statutory Law */}
              <div className="font-bold text-xs text-slate-200 line-clamp-1 group-hover:text-cyan-200">
                {stage.shortName}
              </div>
              <div className="text-[10px] font-mono text-cyan-400/90 mt-1 line-clamp-1">
                {stage.legalProvision}
              </div>

              {/* Document Count Badge */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Documents</span>
                <span className="font-mono font-semibold text-slate-200 bg-slate-800 px-1.5 py-0.2 rounded">
                  {stageDocs.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
