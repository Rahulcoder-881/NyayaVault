# 🏛️ NyayaVault: Zero-Trust Cryptographic Digital Custody System

> **Built for Smart India Hackathon (SIH)**  
> Conforming to **Bharatiya Sakshya Adhiniyam (BSA) 2023** (Section 63) & **ISO/IEC 27001** standards for legal electronic evidence custody and forensic integrity.

---

## 📌 Executive Summary

**NyayaVault** is a next-generation, zero-trust digital custody and evidence management platform designed for law enforcement, judiciary, and investigation agencies. It solves the critical problem of electronic evidence tampering, unauthorized chain-of-custody alteration, and evidentiary admissibility disputes in court.

By leveraging **SHA-256 cryptographic hashing, HMAC digital signatures, Merkle Tree verifiable integrity proofs, invisible zero-width steganographic watermarking, and real-time WebSocket audit streaming**, NyayaVault guarantees that digital evidence cannot be altered without immediate mathematical detection.

---

## ⚡ Key Capabilities

- **🔐 Cryptographic Custody & Merkle Integrity Trees**
  - Instant SHA-256 hashing at ingestion.
  - Multi-level Merkle Tree structure with cryptographic proof generation and leaf-level verification.
  - Interactive Merkle Tree visualizer showing root hashes and sibling validation paths.

- **🛡️ Bharatiya Sakshya Adhiniyam (BSA) 2023 Compliance**
  - Automated generation of Section 63 Electronic Evidence Certificates.
  - Complete device parameters, operating conditions, officer signatures, and cryptographic digest verification for courtroom presentation.

- **🔍 Steganographic Forensic Watermarking**
  - Zero-width character encoding embedding officer ID, timestamp, and custody token directly into document text.
  - Undetectable to human eyes, yet extractable during forensic leak investigations.

- **⚡ Live Tamper Simulation & Detection Attack Engine**
  - Interactive attack simulator allowing judges/auditors to test bit-flip corruption on evidence.
  - Sub-second detection via Merkle leaf comparison and instant UI alert dispatch with one-click restore.

- **🤖 AI Legal Assistant**
  - **Semantic Hybrid Search**: Fast neural search across case evidence, depositions, and FIRs.
  - **Contradiction Detection**: Cross-analyzes witness testimonies to flag timeline or factual discrepancies.
  - **Timeline Reconstruction**: Synthesizes disparate digital events into a chronologically audited sequence.

- **📊 Live WebSocket Audit Ledger & 3D Interactive Vault**
  - Real-time immutable audit blocks streamed directly over WebSockets.
  - Interactive 3D Three.js Vault visualizer mapping digital evidence storage security states.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       NyayaVault UI                         │
│   React 19 + TypeScript + Vite + Tailwind CSS + Three.js    │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST API                │ WebSockets
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                      FastAPI Backend                        │
├──────────────────────────────┬──────────────────────────────┤
│ 🔐 Crypto Engine             │ 📜 BSA 2023 Cert Generator   │
│ • SHA-256 & HMAC-SHA256      │ • Section 63 Certification   │
│ • Merkle Tree & Audit Proofs │ • Device & Officer Metadata  │
├──────────────────────────────┼──────────────────────────────┤
│ 🕵️ Steganography Engine      │ 🤖 AI Analysis Engine        │
│ • Zero-width text watermark  │ • Semantic Evidence Search   │
│ • Forensic leak attribution  │ • Contradiction Detection    │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**

---

### 1. Clone Repository
```bash
git clone https://github.com/Rahulcoder-881/NyayaVault.git
cd NyayaVault
```

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API docs will be live at: `http://localhost:8000/docs`

---

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Three.js, Canvas Confetti |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, WebSockets |
| **Cryptography** | SHA-256, HMAC-SHA256, Merkle Trees, Zero-Width Steganography |
| **Legal Admissibility** | Bharatiya Sakshya Adhiniyam (BSA) 2023 §63 Compliance |

---

## 📜 License & Acknowledgments
Built with ❤️ for the **Smart India Hackathon (SIH)**.
