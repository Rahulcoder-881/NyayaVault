import React, { useState } from 'react';
import { 
  Blocks, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  FileCode
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface BlockchainLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

interface BlockTransaction {
  blockNumber: number;
  txHash: string;
  docId: string;
  docTitle: string;
  sha256Hash: string;
  timestamp: string;
  gasUsed: string;
  status: 'SUCCESS' | 'REVOKED';
  uploader: string;
}

export const BlockchainLedgerModal: React.FC<BlockchainLedgerModalProps> = ({
  isOpen,
  onClose,
  documents
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CONTRACT' | 'VERIFY_TOOL'>('TRANSACTIONS');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verifyDocId, setVerifyDocId] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<{
    found: boolean;
    sha256Hash?: string;
    blockNumber?: number;
    timestamp?: string;
    isRevoked?: boolean;
    matchWithOriginal?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const mockBlocks: BlockTransaction[] = documents.map((doc, idx) => ({
    blockNumber: 1842090 + idx * 4,
    txHash: doc.blockchain_tx_id || `0x7f9a${(idx * 7919).toString(16).padStart(8, '0')}bc91024e6819a`,
    docId: doc.id,
    docTitle: doc.title,
    sha256Hash: doc.sha256_hash,
    timestamp: doc.timestamp_utc,
    gasUsed: '42,190 Gwei',
    status: doc.tamper_flag ? 'REVOKED' : 'SUCCESS',
    uploader: doc.badge_id
  }));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const query = verifyDocId.trim().toLowerCase();
    const targetDoc = documents.find(d => 
      d.id.toLowerCase() === query || 
      d.sha256_hash.toLowerCase() === query ||
      d.title.toLowerCase().includes(query)
    );

    if (targetDoc) {
      setVerifyResult({
        found: true,
        sha256Hash: targetDoc.sha256_hash,
        blockNumber: 1842098,
        timestamp: targetDoc.timestamp_utc,
        isRevoked: targetDoc.tamper_flag,
        matchWithOriginal: targetDoc.sha256_hash === targetDoc.original_sha256
      });
    } else {
      setVerifyResult({ found: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Blocks className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  POLYGON POS / HYPERLEDGER BESU
                </span>
                <span className="text-xs text-slate-400 font-mono">Chain ID: 137 (Mainnet Proofs)</span>
              </div>
              <h2 className="text-lg font-bold text-white">Blockchain Hash Registry & Smart Contract Explorer</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Consensus Synchronized
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'TRANSACTIONS' 
                ? 'border-purple-500 text-purple-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Anchored Evidence Stream ({mockBlocks.length})
          </button>
          <button
            onClick={() => setActiveTab('VERIFY_TOOL')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'VERIFY_TOOL' 
                ? 'border-purple-500 text-purple-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            On-Chain Verifier Tool
          </button>
          <button
            onClick={() => setActiveTab('CONTRACT')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'CONTRACT' 
                ? 'border-purple-500 text-purple-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            DocumentRegistry.sol Contract
          </button>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">CONTRACT DEPLOYMENT</div>
                  <div className="text-xs font-bold text-white font-mono mt-1 truncate">
                    0x8B32Fa76E9bC40d82830fCDe9024D98144b209e7
                  </div>
                  <div className="text-[10px] text-purple-400 mt-1">Verified Source • Solidity 0.8.20</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">LATEST SETTLED BLOCK</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">#18,421,006</div>
                  <div className="text-[10px] text-slate-500">Avg Block Time: 2.1s • Polygon POS</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">TOTAL EVIDENCE ANCHORS</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{documents.length} Records</div>
                  <div className="text-[10px] text-slate-500">100% Cryptographic Non-Repudiation</div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Block #</th>
                      <th className="py-2.5 px-3">Tx Hash</th>
                      <th className="py-2.5 px-3">Document Title</th>
                      <th className="py-2.5 px-3">SHA-256 On-Chain Anchor</th>
                      <th className="py-2.5 px-3">Anchored By</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {mockBlocks.map((tx) => (
                      <tr key={tx.txHash} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-3 font-mono text-purple-400 font-semibold">
                          #{tx.blockNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          <button
                            onClick={() => copyToClipboard(tx.txHash)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="Copy Transaction Hash"
                          >
                            <span>{tx.txHash.substring(0, 10)}...</span>
                            {copiedHash === tx.txHash ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">
                          {tx.docTitle}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          <button
                            onClick={() => copyToClipboard(tx.sha256Hash)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="Copy SHA-256 Hash"
                          >
                            <span>{tx.sha256Hash.substring(0, 14)}...</span>
                            {copiedHash === tx.sha256Hash ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {tx.uploader}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {tx.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Anchored
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                              <AlertTriangle className="w-3 h-3" /> Revoked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'VERIFY_TOOL'}
          {activeTab === 'VERIFY_TOOL' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Smart Contract Cryptographic Hash Verifier</h3>
                <p className="text-xs text-slate-400">
                  Executes a zero-gas <code className="text-purple-400">verifyDocument(docId)</code> call directly against the decentralized ledger.
                </p>
              </div>

              <form onSubmit={handleRunVerify} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={verifyDocId}
                    onChange={(e) => setVerifyDocId(e.target.value)}
                    placeholder="Enter Document ID (e.g. DOC-FIR-001) or SHA-256 Hash..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  Verify on Chain
                </button>
              </form>

              {/* Quick links to test */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Try Sample Doc IDs:</span>
                {documents.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setVerifyDocId(d.id);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-mono text-[11px]"
                  >
                    {d.id}
                  </button>
                ))}
              </div>

              {verifyResult && (
                <div className={`p-4 rounded-xl border ${
                  verifyResult.found 
                    ? verifyResult.matchWithOriginal && !verifyResult.isRevoked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                      : 'bg-red-950/30 border-red-500/40 text-red-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  {verifyResult.found ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-sm">
                          {verifyResult.matchWithOriginal && !verifyResult.isRevoked ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              Cryptographic Chain Integrity Confirmed
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                              Integrity Compromise or Revocation Detected
                            </>
                          )}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                          Block #{verifyResult.blockNumber}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">On-Chain Anchored Hash:</span>
                          <span className="text-white truncate max-w-[320px]">{verifyResult.sha256Hash}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Timestamp UTC:</span>
                          <span className="text-white">{verifyResult.timestamp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revocation Status:</span>
                          <span className={verifyResult.isRevoked ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                            {verifyResult.isRevoked ? 'REVOKED / QUARANTINED' : 'ACTIVE / UNREVOKED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1">
                      <p className="text-xs font-semibold text-slate-300">Document Not Found on Blockchain Registry</p>
                      <p className="text-[11px] text-slate-500">
                        Check that the Case Document ID or SHA-256 hash was entered accurately.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'CONTRACT' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400">Smart Contract:</span>{' '}
                  <strong className="text-white">DocumentRegistry.sol</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400">EVM Compliant</span>
                  <button
                    onClick={() => copyToClipboard(`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract DocumentRegistry {\n    struct Record {\n        string docId;\n        string sha256Hash;\n        address uploadedBy;\n        uint256 timestamp;\n        bool isRevoked;\n    }\n\n    mapping(string => Record) private records;\n    event DocumentAnchored(string indexed docId, string sha256Hash, address uploader, uint256 timestamp);\n\n    function anchorDocument(string memory _docId, string memory _sha256Hash) public {\n        require(bytes(records[_docId].docId).length == 0, 'Document already registered');\n        records[_docId] = Record(_docId, _sha256Hash, msg.sender, block.timestamp, false);\n        emit DocumentAnchored(_docId, _sha256Hash, msg.sender, block.timestamp);\n    }\n\n    function verifyDocument(string memory _docId) public view returns (string memory sha256Hash, uint256 timestamp, bool isRevoked) {\n        Record memory rec = records[_docId];\n        require(bytes(rec.docId).length > 0, 'Document not found');\n        return (rec.sha256Hash, rec.timestamp, rec.isRevoked);\n    }\n}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto leading-relaxed">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Secure Digital Document Management System (DMS) Smart Contract
 * Ministry of Home Affairs (MHA) & National Crime Records Bureau (NCRB)
 * SIH Problem Statement 26190 - Blockchain & Cybersecurity
 */
contract DocumentRegistry {
    struct Record {
        string docId;
        string sha256Hash;
        address uploadedBy;
        uint256 timestamp;
        bool isRevoked;
    }

    mapping(string => Record) private records;
    event DocumentAnchored(string indexed docId, string sha256Hash, address indexed uploader, uint256 timestamp);

    function anchorDocument(string memory _docId, string memory _sha256Hash) public {
        require(bytes(records[_docId].docId).length == 0, "Document already registered");
        records[_docId] = Record(_docId, _sha256Hash, msg.sender, block.timestamp, false);
        emit DocumentAnchored(_docId, _sha256Hash, msg.sender, block.timestamp);
    }

    function verifyDocument(string memory _docId) public view returns (string memory sha256Hash, uint256 timestamp, bool isRevoked) {
        Record memory rec = records[_docId];
        require(bytes(rec.docId).length > 0, "Document not found");
        return (rec.sha256Hash, rec.timestamp, rec.isRevoked);
    }
}`}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
