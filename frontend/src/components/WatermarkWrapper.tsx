import React from 'react';

interface WatermarkWrapperProps {
  officerName: string;
  badgeNumber: string;
  ipAddress?: string;
  children: React.ReactNode;
  opacity?: number;
}

/**
 * WatermarkWrapper
 * Injects a dynamic, multi-line, diagonal forensic watermark across confidential legal documents.
 * Mandatory under Rule 8.3 (Watermark Enforcement) for compliance with Indian IT Act and BNSS.
 */
export const WatermarkWrapper: React.FC<WatermarkWrapperProps> = ({
  officerName,
  badgeNumber,
  ipAddress = '10.48.12.194 (POL-VPN)',
  children,
  opacity = 0.12
}) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const watermarkText = `CONFIDENTIAL • LAW ENFORCEMENT ACCESS • ${officerName.toUpperCase()} [${badgeNumber}] • IP: ${ipAddress} • ${timestamp}`;

  return (
    <div className="relative overflow-hidden select-none">
      {/* Dynamic Repeating Diagonal Forensic Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-around items-center rotate-[-28deg] scale-125"
        style={{ opacity }}
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="flex gap-12 whitespace-nowrap">
            <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-red-500 uppercase">
              {watermarkText}
            </span>
            <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-red-500 uppercase">
              {watermarkText}
            </span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};
