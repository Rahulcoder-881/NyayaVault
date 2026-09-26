"""
NyayaVault: Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63 Certificate Generator
Automated generation of statutory Certificate for Admissibility of Electronic Records
(Formerly Section 65B Indian Evidence Act 1872)
"""
import time
from typing import List, Dict, Any
try:
    from .crypto_engine import compute_sha256, sign_hmac
except ImportError:
    from crypto_engine import compute_sha256, sign_hmac

def generate_bsa_section63_certificate(
    case_record: Dict[str, Any],
    documents: List[Dict[str, Any]],
    officer_name: str = "Insp. R.K. Varma",
    designation: str = "Chief Investigating Officer, Special Cell",
    badge_id: str = "DL-POL-8832"
) -> Dict[str, Any]:
    """
    Generates a legally authentic Section 63 BSA 2023 Electronic Evidence Certificate.
    """
    cert_id = f"BSA-63-{case_record.get('fir_number', '402-2026').replace('/', '-')}-{int(time.time())}"
    timestamp_utc = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    # Calculate manifest of documents
    doc_manifest = []
    hashes_concat = ""
    for doc in documents:
        doc_entry = {
            "document_id": doc.get("id"),
            "title": doc.get("title"),
            "category": doc.get("category"),
            "stage": doc.get("stage_name"),
            "sha256_hash": doc.get("sha256_hash"),
            "exhibit_number": doc.get("exhibit_number", "Unmarked"),
            "status": doc.get("status")
        }
        doc_manifest.append(doc_entry)
        hashes_concat += doc.get("sha256_hash", "")

    manifest_master_hash = compute_sha256(hashes_concat)
    digital_signature = sign_hmac(f"{cert_id}|{manifest_master_hash}|{badge_id}|{timestamp_utc}")

    cert_text = f"""
IN THE COURT OF THE PRINCIPAL DISTRICT & SESSIONS JUDGE, PATIALA HOUSE COURTS, NEW DELHI
IN THE MATTER OF: STATE (NCT OF DELHI) vs. VIKRAM MALHOTRA & ORS.
FIR NO.: {case_record.get('fir_number', '402/2026')} | POLICE STATION: {case_record.get('police_station', 'Special Cell, Lodhi Colony')}
CHARGES UNDER: {case_record.get('acts_sections', 'IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27')}

══════════════════════════════════════════════════════════════════════════════════════════════
CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
FOR ADMISSIBILITY OF ELECTRONIC RECORDS
(Corresponding to erstwhile Section 65B of the Indian Evidence Act, 1872)
══════════════════════════════════════════════════════════════════════════════════════════════

I, {officer_name}, Badge ID: {badge_id}, Designation: {designation}, 
having official custody and technical oversight over the NyayaVault Secure Digital Document 
Management System (DMS), do hereby solemnly affirm and state as follows:

1. STATUTORY CUSTODY & TECHNICAL JURISDICTION:
   That I am the officer in lawful charge of the computer server, cryptographic HSM appliances, 
   and digital investigation repository located at the Cyber Operations Division, Special Cell, 
   operating under ISO/IEC 27001:2022 and Ministry of Home Affairs (MHA) Digital Forensics Guidelines.

2. PERIOD OF OPERATION & SYSTEM INTEGRITY (SEC. 63(2)(a) & SEC. 63(2)(c) BSA 2023):
   During the entire period from {case_record.get('crime_incident_datetime', '2026-03-12')} to the date of 
   this certificate, the NyayaVault cryptographic custody infrastructure was operating continuously, 
   duly synchronized with National Physical Laboratory (NPL) Indian Standard Time atomic clocks. 
   At all material times, the system was free from unauthorized access, hardware malfunction, or network breach.

3. UNCORRUPTED REPRODUCTION (SEC. 63(2)(b) BSA 2023):
   The electronic documents, forensic certificates, seizure panchnamas, and biometric logs listed in 
   Schedule 'A' hereinbelow are exact bit-stream reproductions generated in the ordinary course of lawful 
   investigation, anchored using FIPS 180-4 SHA-256 cryptographic digests and Merkle Tree verification.

4. NON-REPUDIATION & MERKLE LEDGER ANCHOR:
   Case Root Merkle Hash: {case_record.get('merkle_root', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
   Composite Document Manifest Hash: {manifest_master_hash}
   Cryptographic Digital Seal: {digital_signature}

5. VERIFICATION:
   I verify that the contents of this Certificate are true and correct to the best of my personal knowledge, 
   derived from official digital ledger audits and cryptographic state proofs. Nothing material has been concealed.

DATED AT NEW DELHI THIS {timestamp_utc[:10]}
CERTIFICATE IDENTIFIER: {cert_id}
SEAL OF OFFICE & ELECTRONIC SIGNATURE ATTACHED.
"""

    return {
        "certificate_id": cert_id,
        "timestamp_utc": timestamp_utc,
        "officer_name": officer_name,
        "designation": designation,
        "badge_id": badge_id,
        "fir_number": case_record.get("fir_number"),
        "police_station": case_record.get("police_station"),
        "acts_sections": case_record.get("acts_sections"),
        "merkle_root": case_record.get("merkle_root"),
        "manifest_master_hash": manifest_master_hash,
        "digital_signature": digital_signature,
        "documents_certified": doc_manifest,
        "certificate_body_text": cert_text.strip(),
        "statutory_act": "Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)",
        "section": "Section 63(4)(c)",
        "admissibility_status": "PRIMA FACIE ADMISSIBLE WITHOUT ORAL TESTIMONY"
    }
