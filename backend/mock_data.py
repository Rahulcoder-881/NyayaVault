"""
NyayaVault: Realistic High-Stakes Legal & Investigation Mock Dataset
Case: State (NCT of Delhi) v. Vikram Malhotra & Syndicate
FIR No.: 402/2026, Special Cell, Lodhi Colony
Acts: IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27
"""
import time
from typing import List, Dict, Any
try:
    from .crypto_engine import compute_sha256, build_merkle_tree
    from .models import UserRole, LifecycleStage, DocumentStatus, DocumentClassification
except ImportError:
    from crypto_engine import compute_sha256, build_merkle_tree
    from models import UserRole, LifecycleStage, DocumentStatus, DocumentClassification

SAMPLE_DOCUMENTS_RAW = [
    {
        "id": "DOC-STG1-001",
        "title": "First Information Report (FIR No. 402/2026)",
        "stage": LifecycleStage.FIR_INGESTION,
        "stage_name": "FIR Ingestion & Biometric Capture",
        "category": "FIR",
        "uploaded_by": "Insp. R.K. Varma",
        "uploader_role": UserRole.INVESTIGATING_OFFICER,
        "badge_id": "DL-POL-8832",
        "timestamp_utc": "2026-03-12T01:15:22Z",
        "gps_coordinates": "28.5823° N, 77.2285° E (Lodhi Colony PS)",
        "classification": DocumentClassification.PUBLIC_COURT_RECORD,
        "exhibit_number": "Ex. P-1",
        "content": (
            "FIRST INFORMATION REPORT (Under Section 173 BNSS 2023)\n"
            "State: Delhi | District: South-East | Police Station: Special Cell, Lodhi Colony\n"
            "FIR No: 402/2026 | Date & Hour of Occurrence: 11-03-2026 at 23:30 Hours\n"
            "Sections of Law: Sections 103(1), 61(2) Bharatiya Nyaya Sanhita (BNS) 2023, Sections 25/27 Arms Act\n\n"
            "COMPLAINANT / INFORMANT:\n"
            "Name: Sh. Harish Chander | Contact: +91-98110-XXXXX | Resid: H-44, Barakhamba Road, New Delhi\n\n"
            "DETAILS OF INCIDENT:\n"
            "At approx 23:30 hrs, gunfire was reported outside a warehouse near Okhla Phase III. Informant witnessed\n"
            "two armed assailants ambushing victim Devendra Shrestha. Victim sustained fatal projectile trauma to the chest.\n"
            "Assailants fled in an unidentified motor vehicle. Digital biometric thumbprint of Informant verified via Aadhaar OTP.\n"
            "Signed & Recorded by Insp. R.K. Varma (Badge: DL-POL-8832)."
        )
    },
    {
        "id": "DOC-STG1-002",
        "title": "General Diary (GD) Entry No. 14A - First Dispatch Log",
        "stage": LifecycleStage.FIR_INGESTION,
        "stage_name": "FIR Ingestion & Biometric Capture",
        "category": "GD Entry",
        "uploaded_by": "Duty Officer ASI Satish Rawat",
        "uploader_role": UserRole.INVESTIGATING_OFFICER,
        "badge_id": "DL-POL-9104",
        "timestamp_utc": "2026-03-12T01:45:10Z",
        "gps_coordinates": "28.5823° N, 77.2285° E (Duty Desk Terminal #2)",
        "classification": DocumentClassification.RESTRICTED,
        "exhibit_number": "Ex. P-2",
        "content": (
            "DELHI POLICE DAILY GENERAL DIARY REGISTER\n"
            "Entry No: 14A | Date: 12-03-2026 | Time: 01:45 Hours\n"
            "Duty Officer: ASI Satish Rawat (Badge DL-POL-9104)\n\n"
            "PCR call received at 23:42 hrs from civilian helpline 112 reporting firing at Okhla Phase III.\n"
            "PCR Van Commander Eagle-4 dispatched immediately. Mobile Crime Team and Forensic Unit requisitioned.\n"
            "Case registered under FIR 402/2026 and investigation assigned to Insp. R.K. Varma."
        )
    },
    {
        "id": "DOC-STG2-003",
        "title": "Panchnama & Seizure Memo - Glock 19 Pistol Recovery",
        "stage": LifecycleStage.FIELD_INVESTIGATION,
        "stage_name": "Field Investigation",
        "category": "Seizure Memo",
        "uploaded_by": "Insp. R.K. Varma",
        "uploader_role": UserRole.INVESTIGATING_OFFICER,
        "badge_id": "DL-POL-8832",
        "timestamp_utc": "2026-03-13T09:30:00Z",
        "gps_coordinates": "28.6139° N, 77.0342° E (Najafgarh Drain Canal Bank)",
        "classification": DocumentClassification.CONFIDENTIAL,
        "exhibit_number": "Ex. P-3",
        "content": (
            "MEMORANDUM OF SEIZURE (PANCHNAMA) UNDER SEC 105 BNSS 2023\n"
            "Place of Recovery: Marshy bank of Najafgarh Drain Canal, 200m north of Dwarka Expressway bridge\n"
            "Date & Time: 13th March 2026 at 09:15 Hours\n\n"
            "PANCH WITNESSES:\n"
            "1. Sh. Manoj Gupta, s/o K.L. Gupta, r/o Dwarka Sector 11, Delhi (ID: EPIC-VBH908129)\n"
            "2. Sh. Tariq Ahmed, s/o F. Ahmed, r/o Palam Village, Delhi (ID: EPIC-DLN332194)\n\n"
            "DESCRIPTION OF RECOVERED PROPERTY:\n"
            "Pursuant to the disclosure statement of accused Vikram Malhotra under Section 23 BSA 2023, the police party\n"
            "searched the thick reeds along the canal. Discovered wrapped in oilcloth: One black Austrian-manufactured\n"
            "9mm semi-automatic Glock 19 pistol bearing engraved Serial Number W-9041, loaded with one magazine containing\n"
            "4 live 9x19mm Parabellum cartridges stamped 'KF 9mm 2024'. Weapon sealed in tamper-evident forensic pouch F-881."
        )
    },
    {
        "id": "DOC-STG2-004",
        "title": "Witness Statement - Sh. Ramesh Kumar (Sec 180 BNSS / 161 CrPC)",
        "stage": LifecycleStage.FIELD_INVESTIGATION,
        "stage_name": "Field Investigation",
        "category": "Witness Statement",
        "uploaded_by": "Insp. R.K. Varma",
        "uploader_role": UserRole.INVESTIGATING_OFFICER,
        "badge_id": "DL-POL-8832",
        "timestamp_utc": "2026-03-14T14:20:00Z",
        "gps_coordinates": "28.5355° N, 77.2732° E (Okhla Industrial Area)",
        "classification": DocumentClassification.CONFIDENTIAL,
        "exhibit_number": "Ex. P-4",
        "content": (
            "STATEMENT OF WITNESS EXAMINED UNDER SECTION 180 BNSS 2023\n"
            "Witness: Sh. Ramesh Kumar | Age: 42 yrs | Mobile: +91-98711-23456\n"
            "Residential Address: House No. 89, Gali No. 3, Govindpuri, New Delhi - 110019\n\n"
            "STATEMENT:\n"
            "I run a night tea stall near the container depot at Okhla Phase III. On the night of 11th March 2026 around\n"
            "23:25 hrs, I heard loud argument followed by 3 distinct gunshots. I looked towards the godown gate and saw two men\n"
            "wearing dark hoodies running away. One of them put a handgun into his leather jacket. They jumped into a RED HATCHBACK\n"
            "car that was parked with headlights switched off and sped away towards Kalkaji. I am willing to identify the suspects\n"
            "in a Test Identification Parade (TIP). Signed: Ramesh Kumar."
        )
    },
    {
        "id": "DOC-STG3-005",
        "title": "CFSL Forensic Ballistics Examination Certificate",
        "stage": LifecycleStage.FORENSIC_LABORATORY,
        "stage_name": "Forensic Laboratory",
        "category": "Forensic Report",
        "uploaded_by": "Dr. Ananya Sen, Senior Scientific Officer",
        "uploader_role": UserRole.FORENSIC_SCIENTIST,
        "badge_id": "CFSL-DEL-BALL-04",
        "timestamp_utc": "2026-03-17T11:00:00Z",
        "gps_coordinates": "28.5830° N, 77.2340° E (Central Forensic Science Lab, CBI Complex, CGO)",
        "classification": DocumentClassification.FORENSIC_INTERNAL,
        "exhibit_number": "Ex. P-5",
        "content": (
            "CENTRAL FORENSIC SCIENCE LABORATORY (CFSL), CBI COMPLEX, NEW DELHI\n"
            "REPORT NO: CFSL/2026/BALL-8891 | CASE REFERENCE: FIR 402/2026 PS SPECIAL CELL\n"
            "EXPERT: Dr. Ananya Sen, SSO (Ballistics Division)\n\n"
            "EXHIBITS RECEIVED UNDER SEAL F-881:\n"
            "- Exhibit W/1: Glock 19 9mm Pistol (Serial # W-9041)\n"
            "- Exhibit C/1 to C/3: Three empty cartridge cases recovered from crime scene\n"
            "- Exhibit B/1: Projectile retrieved during victim Devendra Shrestha post-mortem autopsy\n\n"
            "BALLISTIC COMPARATIVE ANALYSIS:\n"
            "1. Test firings were conducted in the water recovery tank using standard test ammunition.\n"
            "2. Under the Leica DMC comparison microscope at 40x magnification, firing pin impressions, breech face marks,\n"
            "   and chamber striations on crime scene cartridge cases C/1, C/2, and C/3 matched identically with test cartridge cases.\n"
            "3. Land and groove rifling characteristics (6 grooves, right-hand twist) on post-mortem bullet B/1 correspond\n"
            "   conclusively to the polygonal barrel of Exhibit W/1.\n\n"
            "OPINION:\n"
            "The fatal bullet B/1 and crime scene cartridge cases C/1-C/3 were discharged from the recovered Glock 19 (W-9041)\n"
            "to the exclusion of all other firearms."
        )
    },
    {
        "id": "DOC-STG3-006",
        "title": "SFSL DNA Profiling & Fingerprint Latent Report",
        "stage": LifecycleStage.FORENSIC_LABORATORY,
        "stage_name": "Forensic Laboratory",
        "category": "DNA Report",
        "uploaded_by": "Dr. M.K. Sharma, Director",
        "uploader_role": UserRole.FORENSIC_SCIENTIST,
        "badge_id": "SFSL-ROH-BIO-12",
        "timestamp_utc": "2026-03-18T16:45:00Z",
        "gps_coordinates": "28.7188° N, 77.1202° E (Forensic Science Laboratory, Rohini)",
        "classification": DocumentClassification.FORENSIC_INTERNAL,
        "exhibit_number": "Ex. P-6",
        "content": (
            "STATE FORENSIC SCIENCE LABORATORY, ROHINI, DELHI\n"
            "DNA REPORT NO: SFSL/DNA/2026/0412 | POLICE REF: FIR 402/2026\n\n"
            "EXHIBITS TESTED: Epithelial cell swabs lifted from trigger and textured grip of Glock 19 (Ex W/1).\n"
            "REFERENCE SAMPLE: Blood FTA card of accused Vikram Malhotra.\n\n"
            "STR DNA PROFILE ANALYSIS:\n"
            "Genotyping carried out across 24 autosomal STR markers using Applied Biosystems 3500xl Genetic Analyzer.\n"
            "The complete single-source male DNA profile generated from weapon grip swab matches the reference profile\n"
            "of Vikram Malhotra at all 24 loci (amelogenin X/Y concordant).\n"
            "Calculated Random Match Probability: 1 in 4.87 x 10^18 individuals in the Indian population."
        )
    },
    {
        "id": "DOC-STG4-007",
        "title": "Public Prosecutor Scrutiny Note & Witness Protection Redaction Order",
        "stage": LifecycleStage.PROSECUTORIAL_SCRUTINY,
        "stage_name": "Prosecutorial Scrutiny",
        "category": "Legal Scrutiny",
        "uploaded_by": "Adv. Alok Trivedi, Special Public Prosecutor",
        "uploader_role": UserRole.PUBLIC_PROSECUTOR,
        "badge_id": "DLS-PROS-0941",
        "timestamp_utc": "2026-03-20T10:15:00Z",
        "gps_coordinates": "28.6219° N, 77.2289° E (Directorate of Prosecution, Tis Hazari)",
        "classification": DocumentClassification.CONFIDENTIAL,
        "exhibit_number": "Ex. P-7",
        "content": (
            "OFFICE OF THE SPECIAL PUBLIC PROSECUTOR, NCT OF DELHI\n"
            "SCRUTINY MEMORANDUM // FIR 402/2026 PS SPECIAL CELL\n\n"
            "To: Investigating Officer Insp. R.K. Varma\n"
            "1. I have vetted the investigation file and evidence bundle. The chain of custody from seizure to CFSL is unblemished.\n"
            "2. WITNESS PROTECTION APPLICATION UNDER WITNESS PROTECTION SCHEME 2018:\n"
            "   Witness Sh. Ramesh Kumar is vulnerable to syndicate intimidation. You are instructed to apply automated cryptographic\n"
            "   redaction masking his phone number, house address, and familial relations before defense inspection under Sec 230 BNSS.\n"
            "3. NOTE ON VEHICLE DISCREPANCY: CCTV camera #4 near Modi Mill flyover caught a SILVER SEDAN (DL-3C-9921) at 23:38 hrs,\n"
            "   which contradicts witness Ramesh Kumar's mention of a red hatchback. Procure FASTag toll records of DL-3C-9921."
        )
    },
    {
        "id": "DOC-STG4-008",
        "title": "Final Charge Sheet (Section 193 BNSS / 173 CrPC)",
        "stage": LifecycleStage.PROSECUTORIAL_SCRUTINY,
        "stage_name": "Prosecutorial Scrutiny",
        "category": "Charge Sheet",
        "uploaded_by": "Insp. R.K. Varma & Adv. Alok Trivedi",
        "uploader_role": UserRole.PUBLIC_PROSECUTOR,
        "badge_id": "DLS-PROS-0941",
        "timestamp_utc": "2026-03-22T17:00:00Z",
        "gps_coordinates": "28.6219° N, 77.2289° E (Court Filing Counter)",
        "classification": DocumentClassification.PUBLIC_COURT_RECORD,
        "exhibit_number": "Ex. P-8",
        "content": (
            "FINAL POLICE REPORT / CHARGE SHEET (Under Section 193 Bharatiya Nagarik Suraksha Sanhita 2023)\n"
            "In the Court of Hon'ble Chief Judicial Magistrate, Patiala House Courts, New Delhi\n"
            "Case: State vs. Vikram Malhotra & Ors. | FIR: 402/2026 Special Cell\n\n"
            "ACCUSED PERSONS SENT UP FOR TRIAL:\n"
            "1. Vikram Malhotra, s/o Late O.P. Malhotra, r/o Greater Kailash II, New Delhi (In Judicial Custody)\n"
            "2. Ajay Tyagi @ Boxer (Absconding - Sec 84 BNSS proclamation initiated)\n\n"
            "CHARGES FRAMED:\n"
            "- Sec 103(1) BNS (Murder)\n"
            "- Sec 61(2) BNS (Criminal Conspiracy)\n"
            "- Sec 25/27 Arms Act (Unlawful acquisition and discharge of prohibited caliber firearm)\n"
            "Relied Upon Evidence: Exhibits P-1 through P-8, CFSL Ballistic Match W-9041, SFSL DNA match 99.9998%."
        )
    },
    {
        "id": "DOC-STG5-009",
        "title": "Section 63 BSA 2023 Electronic Evidence Certificate",
        "stage": LifecycleStage.JUDICIAL_PRESENTATION,
        "stage_name": "Judicial Presentation",
        "category": "BSA Certificate",
        "uploaded_by": "Insp. R.K. Varma",
        "uploader_role": UserRole.INVESTIGATING_OFFICER,
        "badge_id": "DL-POL-8832",
        "timestamp_utc": "2026-03-24T09:45:00Z",
        "gps_coordinates": "28.6189° N, 77.2290° E (Patiala House Court Complex)",
        "classification": DocumentClassification.PUBLIC_COURT_RECORD,
        "exhibit_number": "Ex. P-9",
        "content": (
            "STATUTORY CERTIFICATE UNDER SECTION 63 BHARATIYA SAKSHYA ADHINIYAM 2023\n"
            "I, Insp. R.K. Varma (Badge DL-POL-8832), hereby certify that all electronic files, digital photographs,\n"
            "CCTV footage, and forensic data recorded in FIR 402/2026 were created, transmitted, and stored in the\n"
            "tamper-proof NyayaVault zero-trust infrastructure without data loss or corruption."
        )
    },
    {
        "id": "DOC-STG5-010",
        "title": "Judicial Order - Bail Rejection & Exhibit Admission",
        "stage": LifecycleStage.JUDICIAL_PRESENTATION,
        "stage_name": "Judicial Presentation",
        "category": "Court Order",
        "uploaded_by": "Hon'ble Smt. Vandana Jain, Additional Sessions Judge",
        "uploader_role": UserRole.JUDICIAL_MAGISTRATE,
        "badge_id": "DJS-ASJ-028",
        "timestamp_utc": "2026-03-25T15:30:00Z",
        "gps_coordinates": "28.6189° N, 77.2290° E (Court Room No. 14, Patiala House Courts)",
        "classification": DocumentClassification.PUBLIC_COURT_RECORD,
        "exhibit_number": "Ex. P-10",
        "content": (
            "IN THE COURT OF SMT. VANDANA JAIN, DHJS, ASJ-03, PATIALA HOUSE COURTS, NEW DELHI\n"
            "Bail Application No: 1204/2026 | FIR No: 402/2026 PS Special Cell | State vs. Vikram Malhotra\n\n"
            "ORDER ON REGULAR BAIL APPLICATION:\n"
            "Learned Senior Counsel for the applicant argued that applicant is falsely implicated and weapon was planted.\n"
            "Per contra, Ld. Special PP presented the uncorrupted cryptographic chain of custody from NyayaVault DMS.\n"
            "The DNA match on the trigger (Ex. P-6) and Ballistic report (Ex. P-5) prima facie connect applicant to the murder weapon.\n"
            "The electronic records comply fully with Section 63 BSA 2023. Prima facie evidence of heinous crime.\n"
            "Bail application is dismissed. Exhibits P-1 through P-9 formally admitted onto judicial record."
        )
    },
    {
        "id": "DOC-STG6-011",
        "title": "Permanent Zero-Knowledge Immutable Archival Sealing",
        "stage": LifecycleStage.IMMUTABLE_ARCHIVAL,
        "stage_name": "Immutable Archival",
        "category": "Archive Seal",
        "uploaded_by": "Court Registrar Sh. O.P. Tanwar",
        "uploader_role": UserRole.JUDICIAL_MAGISTRATE,
        "badge_id": "REG-PHC-0012",
        "timestamp_utc": "2026-03-26T11:00:00Z",
        "gps_coordinates": "28.6189° N, 77.2290° E (Judicial Archive Central Vault)",
        "classification": DocumentClassification.RESTRICTED,
        "exhibit_number": "Ex. P-11",
        "content": (
            "SUPREME COURT & HIGH COURT JUDICIAL ARCHIVE REPOSITORY PROTOCOL\n"
            "CASE IDENTIFIER: DL-PHC-2026-CRIM-402 // RETENTION POLICY: 30-YEAR HARDWARE-LOCKED LEDGER\n\n"
            "The trial record of FIR 402/2026 is hereby anchored with dual-key cryptographic commitment.\n"
            "Hardware Security Module (HSM) master lock activated under ISO 27001 / BSA 2023 standard.\n"
            "Signatures verified by Investigating Officer, CFSL Director, Special Public Prosecutor, and Presiding Judge."
        )
    }
]

def generate_redacted_version(content: str) -> str:
    """Applies high-security prosecutorial redaction to protect witness PII."""
    redacted = content
    # Witness names and identifiers
    redacted = redacted.replace("Sh. Ramesh Kumar", "████████ [WITNESS-PROTECTED-W1]")
    redacted = redacted.replace("Ramesh Kumar", "████████ [WITNESS-W1]")
    redacted = redacted.replace("+91-98711-23456", "████████████ [REDACTED CELL]")
    redacted = redacted.replace("House No. 89, Gali No. 3, Govindpuri, New Delhi - 110019", "██████████████████████████████████ [REDACTED ADDRESS]")
    redacted = redacted.replace("+91-98110-XXXXX", "████████████ [REDACTED PHONE]")
    redacted = redacted.replace("H-44, Barakhamba Road, New Delhi", "████████████████████████ [REDACTED ADDRESS]")
    return redacted

def get_initial_mock_state():
    """Initializes the rich mock case with computed hashes and Merkle root."""
    docs = []
    leaf_hashes = []

    for d in SAMPLE_DOCUMENTS_RAW:
        sha256 = compute_sha256(d["content"])
        redacted = generate_redacted_version(d["content"])
        leaf_hash = compute_sha256(f"{d['id']}:{sha256}:{d['timestamp_utc']}")
        leaf_hashes.append(leaf_hash)

        doc_dict = {
            **d,
            "original_content": d["content"],
            "sha256_hash": sha256,
            "original_sha256": sha256,
            "merkle_leaf_hash": leaf_hash,
            "status": DocumentStatus.VERIFIED,
            "file_size_bytes": len(d["content"].encode('utf-8')),
            "redacted_content": redacted,
            "tamper_flag": False,
            "tamper_offset": None,
            "tamper_details": None,
            "kms_key_arn": "arn:aws:kms:ap-south-1:992019481921:key/nyayavault-hsm-bsa2023",
            "envelope_iv": "a9f8b7c6d5e4f3a2b1c0"
        }
        docs.append(doc_dict)

    merkle_root, tree_levels = build_merkle_tree(leaf_hashes)

    case_record = {
        "case_id": "CASE-2026-DEL-402",
        "fir_number": "402/2026",
        "police_station": "Special Cell, Lodhi Colony",
        "jurisdiction": "Patiala House Courts, New Delhi",
        "acts_sections": "IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27",
        "crime_incident_datetime": "2026-03-11 23:30 IST",
        "io_name": "Insp. R.K. Varma",
        "io_badge": "DL-POL-8832",
        "prosecutor_name": "Adv. Alok Trivedi",
        "presiding_magistrate": "Smt. Vandana Jain, ASJ-03",
        "court_name": "Patiala House Courts Complex",
        "current_stage": LifecycleStage.JUDICIAL_PRESENTATION,
        "merkle_root": merkle_root,
        "total_documents": len(docs),
        "integrity_score": 100.0,
        "quarantine_count": 0
    }

    return case_record, docs, tree_levels
