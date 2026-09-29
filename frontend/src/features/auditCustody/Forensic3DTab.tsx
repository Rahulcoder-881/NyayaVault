import React from 'react';
import type { LifecycleStageId } from '../../types';
import { Leaf, Box } from 'lucide-react';

const Vault3DVisualizer = React.lazy(() => 
  import('../../components/Vault3DVisualizer').then(m => ({ default: m.Vault3DVisualizer }))
);

export interface Forensic3DTabProps {
  isEcoMode: boolean;
  hasTamperAlert: boolean;
  activeStage: LifecycleStageId | null;
  integrityScore: number;
  merkleRoot: string;
  onToggleEcoMode: () => void;
  onSelectStage: (stage: LifecycleStageId | null) => void;
  onReturnToDocuments: () => void;
}

export const Forensic3DTab: React.FC<Forensic3DTabProps> = ({
  isEcoMode,
  hasTamperAlert,
  activeStage,
  integrityScore,
  merkleRoot,
  onToggleEcoMode,
  onSelectStage,
  onReturnToDocuments
}) => {
  return (
    <div className="space-y-4">
      {isEcoMode ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Leaf className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">
              Sustainable Eco-Mode is Currently Active
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To eliminate GPU battery drain and CPU heat on standard court laptops, the continuous WebGL Three.js render loop is paused. You can launch hardware-accelerated 3D inspection on demand.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onToggleEcoMode}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-cyan-600/20 active:scale-95"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D WebGL Vault Visualizer</span>
            </button>
            <button
              onClick={onReturnToDocuments}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Return to 2D Document View
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Hardware-Accelerated 3D Cryptographic Vault • Interactive Stage & Hash Node Inspection
            </div>
            <button
              onClick={onToggleEcoMode}
              className="px-3 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Return to Eco-Mode</span>
            </button>
          </div>
          <React.Suspense fallback={
            <div className="w-full h-80 flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400 animate-pulse">
              Loading 3D Hardware Accelerated Vault Engine...
            </div>
          }>
            <Vault3DVisualizer
              integrityScore={integrityScore}
              isTampered={hasTamperAlert}
              activeStage={activeStage}
              onSelectStage={onSelectStage}
              merkleRoot={merkleRoot}
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};
