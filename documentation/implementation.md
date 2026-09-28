# 6. Implementation Guide & Code Snippets (implementation.md)
**Document Ref:** MHA-NCRB/SIH-26190/IM-01  
**Project:** Secure Digital Document Management System (DMS)  
**Authority:** Ministry of Home Affairs | National Crime Records Bureau & Women Safety Division  

---

## 6.1 Step 1: Project Initialization & Environment Setup

```bash
# Clone the repository
git clone https://github.com/Rahulcoder-881/sih-mvp-2026.git
cd sih-mvp-2026

# Initialize Next.js / Vite React Frontend
cd frontend
npm install

# Initialize Python Backend (FastAPI with Cryptography & Uvicorn)
cd ../backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn cryptography pydantic python-multipart
```

### Essential NPM Dependencies
```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```

---

## 6.2 Step 2: Cryptographic Hashing Engine (SHA-256 & WebCrypto)

```typescript
// frontend/src/lib/crypto.ts
export async function computeSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeStringSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 6.3 Step 3: Dynamic Watermark Component (`WatermarkWrapper.tsx`)

```tsx
// frontend/src/components/WatermarkWrapper.tsx
import React from 'react';

interface WatermarkProps {
  officerName: string;
  badgeNumber: string;
  ipAddress?: string;
  children: React.ReactNode;
}

export const WatermarkWrapper: React.FC<WatermarkProps> = ({ 
  officerName, 
  badgeNumber, 
  ipAddress = '10.48.12.194 (POL-VPN)', 
  children 
}) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const text = `RESTRICTED LAW ENFORCEMENT RECORD • ACCESSED BY: ${officerName.toUpperCase()} [${badgeNumber}] • IP: ${ipAddress} • ${timestamp}`;

  return (
    <div className="relative overflow-hidden select-none">
      {/* Dynamic Repeating Diagonal Forensic Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center opacity-15 rotate-[-25deg]"
        aria-hidden="true"
      >
        <div className="space-y-16 text-center">
          <p className="text-sm font-mono tracking-widest text-red-500 font-bold whitespace-nowrap">
            {text}
          </p>
          <p className="text-sm font-mono tracking-widest text-red-500 font-bold whitespace-nowrap">
            {text}
          </p>
          <p className="text-sm font-mono tracking-widest text-red-500 font-bold whitespace-nowrap">
            {text}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};
```

---

## 6.4 Step 4: Backend AES-256-GCM Envelope Encryption (Python / FastAPI)

```python
# backend/crypto_engine.py
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib

def encrypt_document_envelope(file_bytes: bytes):
    """
    Encrypts evidence payload using AES-256-GCM.
    Returns: (ciphertext, nonce_hex, sha256_hex)
    """
    # Generate random 256-bit Data Encryption Key (DEK)
    dek = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(dek)
    
    # 96-bit unique IV / nonce
    nonce = os.urandom(12)
    
    # Encrypt
    ciphertext = aesgcm.encrypt(nonce, file_bytes, None)
    
    # Compute SHA-256 of original plaintext
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()
    
    return ciphertext, nonce.hex(), sha256_hash
```

---

## 6.5 Step 5: Solidity Contract Deployment Script (Hardhat / Foundry)

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const registry = await DocumentRegistry.deploy();
  await registry.waitForDeployment();
  console.log(`DocumentRegistry deployed to: ${await registry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
