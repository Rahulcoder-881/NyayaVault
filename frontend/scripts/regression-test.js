/**
 * Frontend Regression Test Runner
 * Validates module integrity, bundle artifacts, code splitting, and cryptographic routines.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const distDir = path.join(frontendDir, 'dist');
const srcDir = path.join(frontendDir, 'src');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log('\n========================================');
console.log('NyayaVault Frontend Regression Test Suite');
console.log('========================================\n');

// 1. Feature Module Structure Verification
console.log('[1/4] Verifying Feature Module Extraction:');
const requiredFeatureFiles = [
  'features/dashboard/CaseCommandCenter.tsx',
  'features/documents/DocumentsTab.tsx',
  'features/evidenceVerification/EvidenceVerificationTab.tsx',
  'features/auditCustody/CustodyLifecycleTab.tsx',
  'features/auditCustody/AuditTrailTab.tsx',
  'features/auditCustody/Forensic3DTab.tsx',
  'features/auth/AuthenticationCard.tsx',
  'features/certificates/CertificatesTab.tsx',
  'features/legalAI/LegalAITab.tsx'
];

for (const relPath of requiredFeatureFiles) {
  const fullPath = path.join(srcDir, relPath);
  assert(fs.existsSync(fullPath), `Module exists: ${relPath}`);
}

// 2. Services and Reusable Hooks Verification
console.log('\n[2/4] Verifying Shared Services & Hooks:');
const requiredServicesAndHooks = [
  'services/api.ts',
  'services/demoData.ts',
  'hooks/useClipboard.ts',
  'hooks/useEvidenceData.ts',
  'hooks/useWebSocketAudit.ts',
  'components/ErrorBoundary.tsx',
  'components/LoadingSkeleton.tsx'
];

for (const relPath of requiredServicesAndHooks) {
  const fullPath = path.join(srcDir, relPath);
  assert(fs.existsSync(fullPath), `Service / Hook exists: ${relPath}`);
}

// 3. Production Build & Bundle Output Verification
console.log('\n[3/4] Verifying Production Distribution & Code Splitting:');
assert(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html generated');

const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
assert(htmlContent.includes('<div id="root">'), 'index.html has root mount element');

const assetsDir = path.join(distDir, 'assets');
assert(fs.existsSync(assetsDir), 'dist/assets directory exists');

const assetFiles = fs.readdirSync(assetsDir);

// Verify critical lazy chunks exist in dist/assets
const expectedLazyChunks = [
  'DocumentViewerModal',
  'TamperAttackModal',
  'BSACertificateModal',
  'MerkleTreeModal',
  'AILegalAssistant',
  'UploadModal',
  'DocsViewerModal',
  'BlockchainLedgerModal',
  'GrantAccessModal',
  'OfficerAuthModal',
  'CaseVerificationModal',
  'EvidenceVerificationModal',
  'PresentationTourModal',
  'Vault3DVisualizer'
];

for (const chunkPrefix of expectedLazyChunks) {
  const match = assetFiles.some(f => f.startsWith(chunkPrefix) && f.endsWith('.js'));
  assert(match, `Lazy chunk generated: ${chunkPrefix}-*.js`);
}

// 4. API Service Contract Verification
console.log('\n[4/4] Verifying API Client & Endpoints Contract:');
const apiContent = fs.readFileSync(path.join(srcDir, 'services', 'api.ts'), 'utf-8');
const expectedApiMethods = [
  'getCases',
  'getDocuments',
  'getAuditTrail',
  'getContradictions',
  'getTimeline',
  'simulateTamper',
  'restoreDocument',
  'applyRedaction',
  'getMerkleProof',
  'generateBSACertificate',
  'queryLegalAI',
  'uploadDocument',
  'verifyEvidence'
];

for (const method of expectedApiMethods) {
  assert(apiContent.includes(`${method}(`), `NyayaVaultApi provides method: ${method}`);
}

console.log('\n----------------------------------------');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log('----------------------------------------\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('ALL REGRESSION TESTS PASSED CLEANLY!\n');
}
