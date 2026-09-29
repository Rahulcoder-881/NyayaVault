import { useState, useEffect, useRef } from 'react';
import type { DocumentItem, AuditBlock, CaseRecord } from '../types';

export interface UseWebSocketAuditProps {
  isLiveBackend: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  setAuditBlocks: React.Dispatch<React.SetStateAction<AuditBlock[]>>;
  setCaseRecord: React.Dispatch<React.SetStateAction<CaseRecord | null>>;
}

export interface UseWebSocketAuditReturn {
  isWsConnected: boolean;
}

export function useWebSocketAudit({
  isLiveBackend,
  setDocuments,
  setAuditBlocks,
  setCaseRecord
}: UseWebSocketAuditProps): UseWebSocketAuditReturn {
  const [isWsConnected, setIsWsConnected] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isLiveBackend) {
      // Periodic consensus pulse in standalone Web Preview mode
      const interval = setInterval(() => {
        const actions = ['PERIODIC_INTEGRITY_CHECK', 'ZERO_TRUST_HEARTBEAT', 'FIPS_180_AUDIT'];
        const act = actions[Math.floor(Math.random() * actions.length)];
        setAuditBlocks(prev => {
          const prevHash = prev[0]?.block_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
          const newIndex = (prev.length || 12) + 1;
          const newBlock: AuditBlock = {
            block_id: `BLK-${Date.now().toString().slice(-4)}`,
            index: newIndex,
            timestamp_utc: new Date().toISOString(),
            action: act,
            case_id: 'CASE-2026-DEL-402',
            actor_name: 'Consensus Daemon',
            actor_role: 'AUTOMATED_NODE',
            badge_id: 'SYS-CONSENSUS-DAEMON',
            ip_address: '127.0.0.1 (Web Preview Bus)',
            previous_block_hash: prevHash,
            block_hash: Math.random().toString(16).substring(2).padEnd(64, '0'),
            merkle_root: '94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324',
            signature: 'HMAC_SHA256_PERIODIC_CONSENSUS_VERIFIED',
            details: 'Automated background audit pass verified all active evidence leaves against Merkle root.'
          };
          return [newBlock, ...prev.slice(0, 30)];
        });
      }, 16000);

      return () => clearInterval(interval);
    }

    const wsUrl = window.location.origin.includes('5173')
      ? 'ws://127.0.0.1:8000/ws/audit'
      : `ws://${window.location.host}/ws/audit`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DOCUMENT_UPLOADED') {
              setDocuments(prev => [...prev, data.document]);
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              if (data.merkle_root) {
                setCaseRecord(prev => prev ? { ...prev, merkle_root: data.merkle_root } : null);
              }
            } else if (data.type === 'TAMPER_ALERT') {
              setDocuments(prev => prev.map(d => d.id === data.document_id ? {
                ...d,
                status: 'QUARANTINED',
                sha256_hash: data.tampered_hash,
                tamper_flag: true,
                tamper_offset: data.corrupted_offset
              } : d));
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              setCaseRecord(prev => prev ? {
                ...prev,
                merkle_root: data.merkle_root,
                integrity_score: data.integrity_score,
                quarantine_count: data.quarantine_count
              } : null);
            } else if (data.type === 'DOCUMENT_RESTORED') {
              setDocuments(prev => prev.map(d => d.id === data.document_id ? {
                ...d,
                status: 'VERIFIED',
                sha256_hash: data.sha256_hash,
                original_sha256: data.sha256_hash,
                tamper_flag: false,
                tamper_offset: undefined,
                tamper_details: undefined
              } : d));
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
              setCaseRecord(prev => prev ? {
                ...prev,
                merkle_root: data.merkle_root,
                integrity_score: data.integrity_score,
                quarantine_count: data.quarantine_count
              } : null);
            } else if (data.type === 'REDACTION_APPLIED') {
              if (data.audit_block) {
                setAuditBlocks(prev => [data.audit_block, ...prev]);
              }
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };
      } catch (err) {
        console.error('WS connect error:', err);
      }
    };

    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [isLiveBackend, setDocuments, setAuditBlocks, setCaseRecord]);

  return { isWsConnected };
}
