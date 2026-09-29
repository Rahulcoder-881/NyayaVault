import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-16 bg-slate-900/80 rounded-xl border border-slate-800/80 p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 w-2/3">
            <div className="w-9 h-9 rounded-lg bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-800 rounded w-1/3" />
              <div className="h-2.5 bg-slate-800/60 rounded w-2/3" />
            </div>
          </div>
          <div className="w-20 h-6 bg-slate-800/70 rounded-md" />
        </div>
      ))}
    </div>
  );
};
