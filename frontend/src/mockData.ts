import type { 
  DocumentItem, 
  CaseRecord, 
  AuditBlock, 
  ContradictionItem, 
  TimelineEvent, 
  BSACertificateData,
  UserRole
} from './types';

// Simple fast SHA-256 for browser environment
export async function computeBrowserSha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash generator
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

export const INITIAL_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: "CONTRA-001",
    title: "Getaway Vehicle Make & Model Discrepancy",
    severity: "HIGH",
    statutory_section: "Section 180 BNSS 2023 vs. Section 63 BSA 2023",
    witness_statement_doc_id: "DOC-STG2-004",
    witness_name: "Sh. Ramesh Kumar (Tea Vendor)",
    witness_assertion: "Testified that two gunmen fled in a RED HATCHBACK parked with lights off.",
    conflicting_evidence_doc_id: "DOC-STG4-007",
    conflicting_evidence_title: "CCTV Traffic Camera Footage #04 (Modi Mill Flyover)",
    conflicting_finding: "CCTV recorded a SILVER SEDAN (DL-3C-9921) at 23:38 hrs crossing towards Ashram with two occupants.",
    legal_implication: "Exposes witness to cross-examination under Sec 145/146 BSA on vehicle color identification at night.",
    credibility_impact: "Moderate - Witness observed incident at 23:25 under sodium vapor streetlights; CCTV optical evidence has higher evidentiary value."
  },
  {
    id: "CONTRA-002",
    title: "Number of Discharged Gunshots vs. Recovered Cartridge Cases",
    severity: "MEDIUM",
    statutory_section: "Section 39 BSA 2023 (Expert Opinion)",
    witness_statement_doc_id: "DOC-STG2-004",
    witness_name: "Sh. Ramesh Kumar",
    witness_assertion: "States he heard exactly 2 distinct loud gunshots.",
    conflicting_evidence_doc_id: "DOC-STG3-005",
    conflicting_evidence_title: "CFSL Ballistics Report (Dr. Ananya Sen)",
    conflicting_finding: "CFSL recovered and matched 3 empty 9mm KF cartridge cases (C/1, C/2, C/3) and 1 post-mortem bullet.",
    legal_implication: "Defense may argue presence of a second undetected firearm or third shot muffled by industrial ambient noise.",
    credibility_impact: "Low - High acoustic echo in warehouse container depot explains auditory suppression of one shot."
  }
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    stage_index: 1,
    stage_name: "FIR Ingestion & Biometric Capture",
    event_title: "FIR 402/2026 Digitally Anchored",
    timestamp: "12-03-2026 01:15 UTC",
    doc_ref: "Ex. P-1 (DOC-STG1-001)",
    officer: "Insp. R.K. Varma (DL-POL-8832)",
    location: "Special Cell, Lodhi Colony",
    cryptographic_status: "SHA-256 ANCHORED",
    description: "FIR registered under BNS 103(1)/61(2). Complainant Aadhaar biometric token anchored into Genesis Merkle Leaf."
  },
  {
    stage_index: 1,
    stage_name: "FIR Ingestion & Biometric Capture",
    event_title: "GD Entry No. 14A Logged",
    timestamp: "12-03-2026 01:45 UTC",
    doc_ref: "Ex. P-2 (DOC-STG1-002)",
    officer: "ASI Satish Rawat (DL-POL-9104)",
    location: "Special Cell Duty Desk #2",
    cryptographic_status: "SHA-256 ANCHORED",
    description: "PCR Van Eagle-4 dispatch log and crime scene mobilization registered with tamper-proof timestamp."
  },
  {
    stage_index: 2,
    stage_name: "Field Investigation & Seizures",
    event_title: "Glock 19 Pistol Recovery & Panchnama",
    timestamp: "13-03-2026 09:30 UTC",
    doc_ref: "Ex. P-3 (DOC-STG2-003)",
    officer: "Insp. R.K. Varma (DL-POL-8832)",
    location: "Najafgarh Drain Bank, Dwarka",
    cryptographic_status: "GPS & HMAC SEALED",
    description: "Recovery memo executed under Sec 105 BNSS in presence of independent panch witnesses. Sealed in barcode pouch F-881."
  },
  {
    stage_index: 2,
    stage_name: "Field Investigation & Seizures",
    event_title: "Witness Statement of Ramesh Kumar Recorded",
    timestamp: "14-03-2026 14:20 UTC",
    doc_ref: "Ex. P-4 (DOC-STG2-004)",
    officer: "Insp. R.K. Varma (DL-POL-8832)",
    location: "Okhla Industrial Area Phase III",
    cryptographic_status: "HMAC SIGNED",
    description: "Audio-visual recording and statement documented under Sec 180 BNSS 2023."
  },
  {
    stage_index: 3,
    stage_name: "Forensic Laboratory Analysis",
    event_title: "CFSL Ballistics Striation Match (W-9041)",
    timestamp: "17-03-2026 11:00 UTC",
    doc_ref: "Ex. P-5 (DOC-STG3-005)",
    officer: "Dr. Ananya Sen, SSO (CFSL-DEL-BALL-04)",
    location: "CFSL, CBI Complex, CGO Complex",
    cryptographic_status: "FSL DIGEST COMMITTED",
    description: "Comparison microscope confirmed breech face striations on 3 fired cartridge cases matched Glock 19 (W-9041)."
  },
  {
    stage_index: 3,
    stage_name: "Forensic Laboratory Analysis",
    event_title: "SFSL Rohini 24-STR Loci DNA Match",
    timestamp: "18-03-2026 16:45 UTC",
    doc_ref: "Ex. P-6 (DOC-STG3-006)",
    officer: "Dr. M.K. Sharma, Director (SFSL-ROH-BIO-12)",
    location: "SFSL Rohini, Sector 14",
    cryptographic_status: "MERKLE LEAF BOUND",
    description: "Weapon grip epithelial swab matches accused Vikram Malhotra with 1 in 4.87 x 10^18 random match probability."
  },
  {
    stage_index: 4,
    stage_name: "Prosecutorial Scrutiny & Redaction",
    event_title: "Witness Protection Redaction Memo",
    timestamp: "20-03-2026 10:15 UTC",
    doc_ref: "Ex. P-7 (DOC-STG4-007)",
    officer: "Adv. Alok Trivedi, SPP (DLS-PROS-0941)",
    location: "Directorate of Prosecution, Tis Hazari",
    cryptographic_status: "PROSECUTOR SEALED",
    description: "Court-sanctioned PII masking applied to Witness Ramesh Kumar phone and address."
  },
  {
    stage_index: 4,
    stage_name: "Prosecutorial Scrutiny & Redaction",
    event_title: "Final Charge Sheet Filed under Sec 193 BNSS",
    timestamp: "22-03-2026 17:00 UTC",
    doc_ref: "Ex. P-8 (DOC-STG4-008)",
    officer: "Insp. R.K. Varma & Adv. Alok Trivedi",
    location: "Patiala House Courts Filing Counter",
    cryptographic_status: "E-COURT RECEIPT ISSUED",
    description: "Charges framed under BNS 103(1) murder and Arms Act 25/27."
  },
  {
    stage_index: 5,
    stage_name: "Judicial Presentation",
    event_title: "Section 63 BSA 2023 Certificate Issued",
    timestamp: "24-03-2026 09:45 UTC",
    doc_ref: "Ex. P-9 (DOC-STG5-009)",
    officer: "Insp. R.K. Varma (DL-POL-8832)",
    location: "Patiala House Court Complex",
    cryptographic_status: "BSA CERTIFIED",
    description: "Statutory certificate issued affirming complete zero-trust digital custody without hash collision."
  },
  {
    stage_index: 5,
    stage_name: "Judicial Presentation",
    event_title: "Bail Dismissed & Exhibits Formally Admitted",
    timestamp: "25-03-2026 15:30 UTC",
    doc_ref: "Ex. P-10 (DOC-STG5-010)",
    officer: "Hon'ble Smt. Vandana Jain, ASJ-03",
    location: "Court Room 14, Patiala House",
    cryptographic_status: "COURT SEAL APPLIED",
    description: "Exhibits P-1 to P-9 admitted onto record. Bail rejected on grounds of indisputable cryptographic chain of custody."
  },
  {
    stage_index: 6,
    stage_name: "Immutable Archival",
    event_title: "30-Year Hardware Locked Archival",
    timestamp: "26-03-2026 11:00 UTC",
    doc_ref: "Ex. P-11 (DOC-STG6-011)",
    officer: "Registrar Sh. O.P. Tanwar (REG-PHC-0012)",
    location: "Judicial Central Vault",
    cryptographic_status: "HSM ARCHIVE SEALED",
    description: "Case trial archive locked under ISO/IEC 27001 standard for 30-year appellate retention."
  }
];

export const INITIAL_AUDIT_BLOCKS: AuditBlock[] = [
  {
    block_id: "BLK-012",
    index: 12,
    timestamp_utc: "2026-03-26T11:00:00Z",
    action: "COURT_SEAL_APPLIED",
    case_id: "CASE-2026-DEL-402",
    actor_name: "Hon'ble Smt. Vandana Jain, ASJ-03",
    actor_role: "JUDICIAL_MAGISTRATE",
    badge_id: "DJS-ASJ-028",
    ip_address: "10.42.1.18",
    previous_block_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    block_hash: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    signature: "HMAC_SHA256_RSA4096_DJS_COURT_SEAL_VERIFIED",
    details: "Permanent zero-knowledge judicial commitment applied under Section 63 BSA 2023. Bail rejected."
  },
  {
    block_id: "BLK-011",
    index: 11,
    timestamp_utc: "2026-03-24T09:45:00Z",
    action: "SIGN",
    case_id: "CASE-2026-DEL-402",
    actor_name: "Insp. R.K. Varma",
    actor_role: "INVESTIGATING_OFFICER",
    badge_id: "DL-POL-8832",
    ip_address: "10.42.3.91",
    previous_block_hash: "b3f2081561726a4221147a461efaebe0e2e50529cc55c0a37731215b24479e0a",
    block_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    signature: "HMAC_SHA256_POL_DEL_8832_SEC63_BSA_CERT",
    details: "Section 63 BSA Electronic Certificate generated and digitally certified for court admission."
  },
  {
    block_id: "BLK-010",
    index: 10,
    timestamp_utc: "2026-03-20T10:15:00Z",
    action: "REDACT",
    case_id: "CASE-2026-DEL-402",
    actor_name: "Adv. Alok Trivedi",
    actor_role: "PUBLIC_PROSECUTOR",
    badge_id: "DLS-PROS-0941",
    ip_address: "10.42.2.45",
    previous_block_hash: "11a4cfd2975cc3bc9df5888d3e23072223a2a688b1cc924ff95b95ff68fefc5a",
    block_hash: "b3f2081561726a4221147a461efaebe0e2e50529cc55c0a37731215b24479e0a",
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    signature: "HMAC_SHA256_PROS_TIS_HAZARI_WPS2018",
    details: "Cryptographic PII redactions applied to witness statement DOC-STG2-004 under Witness Protection Scheme."
  },
  {
    block_id: "BLK-009",
    index: 9,
    timestamp_utc: "2026-03-18T16:45:00Z",
    action: "UPLOAD",
    case_id: "CASE-2026-DEL-402",
    actor_name: "Dr. M.K. Sharma",
    actor_role: "FORENSIC_SCIENTIST",
    badge_id: "SFSL-ROH-BIO-12",
    ip_address: "10.42.5.12",
    previous_block_hash: "28e078972b2ab684128f654b9d034fa95e1ebf581cf26226cb1f090d96d91242",
    block_hash: "11a4cfd2975cc3bc9df5888d3e23072223a2a688b1cc924ff95b95ff68fefc5a",
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    signature: "HMAC_SHA256_SFSL_ROHINI_DNA_VERIFIED",
    details: "DNA STR profiling certificate DOC-STG3-006 anchored. Single-source match to Vikram Malhotra."
  },
  {
    block_id: "BLK-008",
    index: 8,
    timestamp_utc: "2026-03-17T11:00:00Z",
    action: "UPLOAD",
    case_id: "CASE-2026-DEL-402",
    actor_name: "Dr. Ananya Sen",
    actor_role: "FORENSIC_SCIENTIST",
    badge_id: "CFSL-DEL-BALL-04",
    ip_address: "10.42.4.88",
    previous_block_hash: "557a220269f8263595f87b8f9e61db1d57545de5bb95180cb9ff9a19c62ea14f",
    block_hash: "28e078972b2ab684128f654b9d034fa95e1ebf581cf26226cb1f090d96d91242",
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    signature: "HMAC_SHA256_CFSL_BALLISTICS_W9041",
    details: "CFSL Ballistics Report DOC-STG3-005 ingested. Positive striation match with recovered Glock 19."
  }
];

export const RAW_DOCUMENTS_SEED = [
  {
    id: "DOC-STG1-001",
    title: "First Information Report (FIR No. 402/2026)",
    stage: 1 as const,
    stage_name: "FIR Ingestion & Biometric Capture",
    category: "FIR",
    uploaded_by: "Insp. R.K. Varma",
    uploader_role: "IO_POLICE" as UserRole,
    badge_id: "DL-POL-8832",
    timestamp_utc: "2026-03-12T01:15:22Z",
    gps_coordinates: "28.5823° N, 77.2285° E (Lodhi Colony PS)",
    classification: "PUBLIC_COURT_RECORD" as const,
    exhibit_number: "Ex. P-1",
    content: `FIRST INFORMATION REPORT (Under Section 173 BNSS 2023)
State: Delhi | District: South-East | Police Station: Special Cell, Lodhi Colony
FIR No: 402/2026 | Date & Hour of Occurrence: 11-03-2026 at 23:30 Hours
Sections of Law: Sections 103(1), 61(2) Bharatiya Nyaya Sanhita (BNS) 2023, Sections 25/27 Arms Act

COMPLAINANT / INFORMANT:
Name: Sh. Harish Chander | Contact: +91-98110-XXXXX | Resid: H-44, Barakhamba Road, New Delhi

DETAILS OF INCIDENT:
At approx 23:30 hrs, gunfire was reported outside a warehouse near Okhla Phase III. Informant witnessed
two armed assailants ambushing victim Devendra Shrestha. Victim sustained fatal projectile trauma to the chest.
Assailants fled in an unidentified motor vehicle. Digital biometric thumbprint of Informant verified via Aadhaar OTP.
Signed & Recorded by Insp. R.K. Varma (Badge: DL-POL-8832).`
  },
  {
    id: "DOC-STG1-002",
    title: "General Diary (GD) Entry No. 14A - Dispatch Log",
    stage: 1 as const,
    stage_name: "FIR Ingestion & Biometric Capture",
    category: "GD Entry",
    uploaded_by: "Duty Officer ASI Satish Rawat",
    uploader_role: "IO_POLICE" as UserRole,
    badge_id: "DL-POL-9104",
    timestamp_utc: "2026-03-12T01:45:10Z",
    gps_coordinates: "28.5823° N, 77.2285° E (Duty Desk Terminal #2)",
    classification: "RESTRICTED" as const,
    exhibit_number: "Ex. P-2",
    content: `DELHI POLICE DAILY GENERAL DIARY REGISTER
Entry No: 14A | Date: 12-03-2026 | Time: 01:45 Hours
Duty Officer: ASI Satish Rawat (Badge DL-POL-9104)

PCR call received at 23:42 hrs from civilian helpline 112 reporting firing at Okhla Phase III.
PCR Van Commander Eagle-4 dispatched immediately. Mobile Crime Team and Forensic Unit requisitioned.
Case registered under FIR 402/2026 and investigation assigned to Insp. R.K. Varma.`
  },
  {
    id: "DOC-STG2-003",
    title: "Panchnama & Seizure Memo - Glock 19 Pistol Recovery",
    stage: 2 as const,
    stage_name: "Field Investigation & Seizures",
    category: "Seizure Memo",
    uploaded_by: "Insp. R.K. Varma",
    uploader_role: "IO_POLICE" as UserRole,
    badge_id: "DL-POL-8832",
    timestamp_utc: "2026-03-13T09:30:00Z",
    gps_coordinates: "28.6139° N, 77.0342° E (Najafgarh Drain Canal Bank)",
    classification: "CONFIDENTIAL" as const,
    exhibit_number: "Ex. P-3",
    content: `MEMORANDUM OF SEIZURE (PANCHNAMA) UNDER SEC 105 BNSS 2023
Place of Recovery: Marshy bank of Najafgarh Drain Canal, 200m north of Dwarka Expressway bridge
Date & Time: 13th March 2026 at 09:15 Hours

PANCH WITNESSES:
1. Sh. Manoj Gupta, s/o K.L. Gupta, r/o Dwarka Sector 11, Delhi (ID: EPIC-VBH908129)
2. Sh. Tariq Ahmed, s/o F. Ahmed, r/o Palam Village, Delhi (ID: EPIC-DLN332194)

DESCRIPTION OF RECOVERED PROPERTY:
Pursuant to the disclosure statement of accused Vikram Malhotra under Section 23 BSA 2023, the police party
searched the thick reeds along the canal. Discovered wrapped in oilcloth: One black Austrian-manufactured
9mm semi-automatic Glock 19 pistol bearing engraved Serial Number W-9041, loaded with one magazine containing
4 live 9x19mm Parabellum cartridges stamped 'KF 9mm 2024'. Weapon sealed in tamper-evident forensic pouch F-881.`
  },
  {
    id: "DOC-STG2-004",
    title: "Witness Statement - Sh. Ramesh Kumar (Sec 180 BNSS)",
    stage: 2 as const,
    stage_name: "Field Investigation & Seizures",
    category: "Witness Statement",
    uploaded_by: "Insp. R.K. Varma",
    uploader_role: "IO_POLICE" as UserRole,
    badge_id: "DL-POL-8832",
    timestamp_utc: "2026-03-14T14:20:00Z",
    gps_coordinates: "28.5355° N, 77.2732° E (Okhla Industrial Area)",
    classification: "CONFIDENTIAL" as const,
    exhibit_number: "Ex. P-4",
    content: `STATEMENT OF WITNESS EXAMINED UNDER SECTION 180 BNSS 2023
Witness: Sh. Ramesh Kumar | Age: 42 yrs | Mobile: +91-98711-23456
Residential Address: House No. 89, Gali No. 3, Govindpuri, New Delhi - 110019

STATEMENT:
I run a night tea stall near the container depot at Okhla Phase III. On the night of 11th March 2026 around
23:25 hrs, I heard loud argument followed by 3 distinct gunshots. I looked towards the godown gate and saw two men
wearing dark hoodies running away. One of them put a handgun into his leather jacket. They jumped into a RED HATCHBACK
car that was parked with headlights switched off and sped away towards Kalkaji. I am willing to identify the suspects
in a Test Identification Parade (TIP). Signed: Ramesh Kumar.`
  },
  {
    id: "DOC-STG3-005",
    title: "CFSL Forensic Ballistics Examination Certificate",
    stage: 3 as const,
    stage_name: "Forensic Laboratory Analysis",
    category: "Forensic Report",
    uploaded_by: "Dr. Ananya Sen, Senior Scientific Officer",
    uploader_role: "FORENSIC_LAB" as UserRole,
    badge_id: "CFSL-DEL-BALL-04",
    timestamp_utc: "2026-03-17T11:00:00Z",
    gps_coordinates: "28.5830° N, 77.2340° E (CFSL, CBI Complex)",
    classification: "FORENSIC_INTERNAL" as const,
    exhibit_number: "Ex. P-5",
    content: `CENTRAL FORENSIC SCIENCE LABORATORY (CFSL), CBI COMPLEX, NEW DELHI
REPORT NO: CFSL/2026/BALL-8891 | CASE REFERENCE: FIR 402/2026 PS SPECIAL CELL
EXPERT: Dr. Ananya Sen, SSO (Ballistics Division)

EXHIBITS RECEIVED UNDER SEAL F-881:
- Exhibit W/1: Glock 19 9mm Pistol (Serial # W-9041)
- Exhibit C/1 to C/3: Three empty cartridge cases recovered from crime scene
- Exhibit B/1: Projectile retrieved during victim Devendra Shrestha post-mortem autopsy

BALLISTIC COMPARATIVE ANALYSIS:
1. Test firings were conducted in the water recovery tank using standard test ammunition.
2. Under the Leica DMC comparison microscope at 40x magnification, firing pin impressions, breech face marks,
   and chamber striations on crime scene cartridge cases C/1, C/2, and C/3 matched identically with test cartridge cases.
3. Land and groove rifling characteristics (6 grooves, right-hand twist) on post-mortem bullet B/1 correspond
   conclusively to the polygonal barrel of Exhibit W/1.

OPINION:
The fatal bullet B/1 and crime scene cartridge cases C/1-C/3 were discharged from the recovered Glock 19 (W-9041)
to the exclusion of all other firearms.`
  },
  {
    id: "DOC-STG3-006",
    title: "SFSL DNA Profiling & Fingerprint Latent Report",
    stage: 3 as const,
    stage_name: "Forensic Laboratory Analysis",
    category: "DNA Report",
    uploaded_by: "Dr. M.K. Sharma, Director",
    uploader_role: "FORENSIC_LAB" as UserRole,
    badge_id: "SFSL-ROH-BIO-12",
    timestamp_utc: "2026-03-18T16:45:00Z",
    gps_coordinates: "28.7188° N, 77.1202° E (SFSL Rohini)",
    classification: "FORENSIC_INTERNAL" as const,
    exhibit_number: "Ex. P-6",
    content: `STATE FORENSIC SCIENCE LABORATORY, ROHINI, DELHI
DNA REPORT NO: SFSL/DNA/2026/0412 | POLICE REF: FIR 402/2026

EXHIBITS TESTED: Epithelial cell swabs lifted from trigger and textured grip of Glock 19 (Ex W/1).
REFERENCE SAMPLE: Blood FTA card of accused Vikram Malhotra.

STR DNA PROFILE ANALYSIS:
Genotyping carried out across 24 autosomal STR markers using Applied Biosystems 3500xl Genetic Analyzer.
The complete single-source male DNA profile generated from weapon grip swab matches the reference profile
of Vikram Malhotra at all 24 loci (amelogenin X/Y concordant).
Calculated Random Match Probability: 1 in 4.87 x 10^18 individuals in the Indian population.`
  },
  {
    id: "DOC-STG4-007",
    title: "Prosecution Scrutiny Note & Witness Protection Order",
    stage: 4 as const,
    stage_name: "Prosecutorial Scrutiny & Redaction",
    category: "Charge Sheet",
    uploaded_by: "Adv. Alok Trivedi, Special Public Prosecutor",
    uploader_role: "PROSECUTOR" as UserRole,
    badge_id: "DLS-PROS-0941",
    timestamp_utc: "2026-03-20T10:15:00Z",
    gps_coordinates: "28.6219° N, 77.2289° E (Tis Hazari Courts)",
    classification: "CONFIDENTIAL" as const,
    exhibit_number: "Ex. P-7",
    content: `OFFICE OF THE SPECIAL PUBLIC PROSECUTOR, NCT OF DELHI
SCRUTINY MEMORANDUM // FIR 402/2026 PS SPECIAL CELL

To: Investigating Officer Insp. R.K. Varma
1. I have vetted the investigation file and evidence bundle. The chain of custody from seizure to CFSL is unblemished.
2. WITNESS PROTECTION APPLICATION UNDER WITNESS PROTECTION SCHEME 2018:
   Witness Sh. Ramesh Kumar is vulnerable to syndicate intimidation. You are instructed to apply automated cryptographic
   redaction masking his phone number, house address, and familial relations before defense inspection under Sec 230 BNSS.
3. NOTE ON VEHICLE DISCREPANCY: CCTV camera #4 near Modi Mill flyover caught a SILVER SEDAN (DL-3C-9921) at 23:38 hrs,
   which contradicts witness Ramesh Kumar's mention of a red hatchback. Procure FASTag toll records of DL-3C-9921.`
  },
  {
    id: "DOC-STG4-008",
    title: "Final Police Report / Charge Sheet (Section 193 BNSS)",
    stage: 4 as const,
    stage_name: "Prosecutorial Scrutiny & Redaction",
    category: "Charge Sheet",
    uploaded_by: "Insp. R.K. Varma & Adv. Alok Trivedi",
    uploader_role: "PROSECUTOR" as UserRole,
    badge_id: "DLS-PROS-0941",
    timestamp_utc: "2026-03-22T17:00:00Z",
    gps_coordinates: "28.6219° N, 77.2289° E (Court Filing Counter)",
    classification: "PUBLIC_COURT_RECORD" as const,
    exhibit_number: "Ex. P-8",
    content: `FINAL POLICE REPORT / CHARGE SHEET (Under Section 193 Bharatiya Nagarik Suraksha Sanhita 2023)
In the Court of Hon'ble Chief Judicial Magistrate, Patiala House Courts, New Delhi
Case: State vs. Vikram Malhotra & Ors. | FIR: 402/2026 Special Cell

ACCUSED PERSONS SENT UP FOR TRIAL:
1. Vikram Malhotra, s/o Late O.P. Malhotra, r/o Greater Kailash II, New Delhi (In Judicial Custody)
2. Ajay Tyagi @ Boxer (Absconding - Sec 84 BNSS proclamation initiated)

CHARGES FRAMED:
- Sec 103(1) BNS (Murder)
- Sec 61(2) BNS (Criminal Conspiracy)
- Sec 25/27 Arms Act (Unlawful acquisition and discharge of prohibited caliber firearm)
Relied Upon Evidence: Exhibits P-1 through P-8, CFSL Ballistic Match W-9041, SFSL DNA match 99.9998%.`
  }
];

export async function getClientInitialMockState(): Promise<{
  caseRecord: CaseRecord;
  documents: DocumentItem[];
  auditBlocks: AuditBlock[];
  contradictions: ContradictionItem[];
  timeline: TimelineEvent[];
}> {
  const documents: DocumentItem[] = [];

  for (const raw of RAW_DOCUMENTS_SEED) {
    const hash = await computeBrowserSha256(raw.content);
    const leafHash = await computeBrowserSha256(`${raw.id}:${hash}:${raw.timestamp_utc}`);
    
    // Auto-generate redacted version
    let redacted = raw.content;
    redacted = redacted.replace(/Sh\. Ramesh Kumar/g, "████████ [WITNESS-W1]");
    redacted = redacted.replace(/\+91-98711-23456/g, "████████████ [REDACTED CELL]");
    redacted = redacted.replace(/House No\. 89, Gali No\. 3, Govindpuri, New Delhi - 110019/g, "████████████████████ [REDACTED ADDRESS]");

    documents.push({
      ...raw,
      case_id: "CASE-2026-DEL-402",
      sha256_hash: hash,
      original_sha256: hash,
      merkle_leaf_hash: leafHash,
      status: 'VERIFIED',
      file_size_bytes: raw.content.length,
      redacted_content: redacted,
      tamper_flag: false,
      kms_key_arn: "arn:aws:kms:ap-south-1:992019481921:key/nyayavault-hsm-bsa2023",
      envelope_iv: "a9f8b7c6d5e4f3a2b1c0"
    });
  }

  const caseRecord: CaseRecord = {
    case_id: "CASE-2026-DEL-402",
    fir_number: "402/2026",
    police_station: "Special Cell, Lodhi Colony",
    jurisdiction: "Patiala House Courts, New Delhi",
    acts_sections: "IPC 302, 120B / BNS 103(1), 61(2), Arms Act 25/27",
    crime_incident_datetime: "2026-03-11 23:30 IST",
    io_name: "Insp. R.K. Varma",
    io_badge: "DL-POL-8832",
    prosecutor_name: "Adv. Alok Trivedi",
    presiding_magistrate: "Smt. Vandana Jain, ASJ-03",
    court_name: "Patiala House Courts Complex",
    current_stage: 5,
    merkle_root: "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    total_documents: documents.length,
    integrity_score: 100.0,
    quarantine_count: 0
  };

  return {
    caseRecord,
    documents,
    auditBlocks: INITIAL_AUDIT_BLOCKS,
    contradictions: INITIAL_CONTRADICTIONS,
    timeline: INITIAL_TIMELINE
  };
}

export function generateClientBSACertificate(
  docs: DocumentItem[],
  caseRec: CaseRecord | null,
  officerName: string,
  designation: string,
  badgeId: string
): BSACertificateData {
  const timestamp = new Date().toISOString();
  const certId = `CERT-BSA63-${Date.now().toString().slice(-6)}`;

  return {
    certificate_id: certId,
    timestamp_utc: timestamp,
    officer_name: officerName,
    designation: designation,
    badge_id: badgeId,
    fir_number: caseRec?.fir_number || "402/2026",
    police_station: caseRec?.police_station || "Special Cell, Lodhi Colony",
    acts_sections: caseRec?.acts_sections || "BNS 103(1), Arms Act 25/27",
    merkle_root: caseRec?.merkle_root || "94e2a17cb6e95d51829033d59e99a89d70fa8d88e62f01f80ec45511b8b69324",
    manifest_master_hash: "3a88c031d2e9e98e72ef58897282b01284a1d4b1a4574cc5b1d927514a38f362",
    digital_signature: `HMAC_SHA256_${badgeId}_OFFICER_SIGNATURE_BSA63`,
    documents_certified: docs.map(d => ({
      document_id: d.id,
      title: d.title,
      category: d.category,
      stage: `Stage ${d.stage}: ${d.stage_name}`,
      sha256_hash: d.sha256_hash,
      exhibit_number: d.exhibit_number || "Ex. Marked",
      status: d.status
    })),
    certificate_body_text: `I, ${officerName}, hereby certify under Section 63(4)(c) of the Bharatiya Sakshya Adhiniyam, 2023 that the electronic exhibits cataloged herein were generated, stored, and managed in regular course of official police custody without unauthorized intrusion or data alteration.`,
    statutory_act: "Bharatiya Sakshya Adhiniyam, 2023",
    section: "Section 63 (Admissibility of Electronic Records)",
    admissibility_status: "STATUTORILY ADMISSIBLE"
  };
}
