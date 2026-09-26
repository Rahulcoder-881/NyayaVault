"""
NyayaVault: Dynamic Forensic Steganographic Watermarking Engine
Overlays forensic, legally-auditable provenance markers on every document inspection:
[OFFICER BADGE ID] | [TIMESTAMP UTC] | [CLIENT IP ADDRESS] | [CASE ID] | [NON-REPUDIATION HASH]
"""
import time
from typing import Dict, Any
try:
    from .crypto_engine import compute_sha256, sign_hmac
except ImportError:
    from crypto_engine import compute_sha256, sign_hmac

def generate_watermark_metadata(badge_id: str, case_id: str, client_ip: str = "10.42.188.94") -> Dict[str, Any]:
    timestamp_utc = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    raw_payload = f"{badge_id}|{timestamp_utc}|{client_ip}|{case_id}"
    signature_hash = sign_hmac(raw_payload)[:24]
    
    watermark_text = f"NYAYAVAULT CONFIDENTIAL // BADGE: {badge_id} | UTC: {timestamp_utc} | IP: {client_ip} | CASE: {case_id} | SIG: {signature_hash}"
    
    return {
        "badge_id": badge_id,
        "timestamp_utc": timestamp_utc,
        "client_ip": client_ip,
        "case_id": case_id,
        "signature_hash": signature_hash,
        "watermark_text": watermark_text,
        "legal_notice": "UNAUTHORIZED DISCLOSURE PUNISHABLE UNDER SEC 72 IT ACT & SEC 204 BNS 2023"
    }

def apply_text_watermark(content: str, watermark: Dict[str, Any]) -> str:
    """Overlays forensic headers and footers with tamper-evident signature."""
    header = (
        f"════════════════════════════════════════════════════════════════════════════════════════════════════\n"
        f"🏛️ STATE POLICE & FORENSIC DIGITAL CUSTODY ARCHIVE - SECTION 63 BSA 2023 CERTIFIED COPY\n"
        f"FORENSIC WATERMARK: {watermark['watermark_text']}\n"
        f"════════════════════════════════════════════════════════════════════════════════════════════════════\n\n"
    )
    footer = (
        f"\n\n════════════════════════════════════════════════════════════════════════════════════════════════════\n"
        f"🔒 NON-REPUDIATION SIGNATURE: {watermark['signature_hash']} | PROVENANCE TRACE ACTIVE\n"
        f"WARNING: REPRODUCING OR SHARING THIS EXHIBIT CONSTITUTES CONTEMPT OF COURT AND EVIDENCE TAMPERING.\n"
        f"════════════════════════════════════════════════════════════════════════════════════════════════════"
    )
    return header + content + footer
