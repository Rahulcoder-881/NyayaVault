import type { RoleInfo, LifecycleStageMeta, UserRole } from './types';

export const USER_ROLES: Record<UserRole, RoleInfo> = {
  IO_POLICE: {
    role: 'IO_POLICE',
    label: 'Investigating Officer (Police)',
    name: 'Insp. R.K. Varma',
    badge: 'DL-POL-8832',
    avatarIcon: '👮',
    description: 'Special Cell, Lodhi Colony. Responsible for FIR ingestion, field seizures, and case diary.',
    permissions: [
      'Upload FIR & General Diary logs',
      'Register Seizure Memos & Panchnamas with GPS',
      'Record Section 180 BNSS witness statements',
      'Generate Sec 63 BSA Digital Evidence Certificate',
      'Restricted from viewing internal CFSL forensic lab worknotes'
    ]
  },
  FORENSIC_LAB: {
    role: 'FORENSIC_LAB',
    label: 'Forensic Lab Scientist (CFSL / SFSL)',
    name: 'Dr. Ananya Sen',
    badge: 'CFSL-DEL-BALL-04',
    avatarIcon: '🔬',
    description: 'Senior Scientific Officer, Ballistics & Physical Sciences Division, CFSL New Delhi.',
    permissions: [
      'Intake sealed physical & digital exhibits (CoC stamps)',
      'Upload & sign Ballistics / Toxicology / DNA certificates',
      'Attach comparison microscope striation photomicrographs',
      'Cannot modify or redact police witness statements'
    ]
  },
  PROSECUTOR: {
    role: 'PROSECUTOR',
    label: 'Public Prosecutor (State Prosecution)',
    name: 'Adv. Alok Trivedi',
    badge: 'DLS-PROS-0941',
    avatarIcon: '⚖️',
    description: 'Special Public Prosecutor, Directorate of Prosecution, GNCTD.',
    permissions: [
      'Access complete unredacted case bundle',
      'Apply cryptographic witness protection redactions (Witness Protection Scheme 2018)',
      'Draft and file Charge Sheet under Section 193 BNSS',
      'Review AI contradiction engine between testimonies and forensic facts'
    ]
  },
  JUDGE_MAGISTRATE: {
    role: 'JUDGE_MAGISTRATE',
    label: "Hon'ble Judicial Magistrate / Sessions Judge",
    name: 'Smt. Vandana Jain, DHJS',
    badge: 'DJS-ASJ-028',
    avatarIcon: '🏛️',
    description: 'Additional Sessions Judge (ASJ-03), Patiala House Courts Complex, New Delhi.',
    permissions: [
      'Master unredacted judicial record inspection',
      'Admit and mark electronic court exhibits (Ex. P-1 to Ex. P-N)',
      'Issue electronic court seals and judicial bail/interim orders',
      'Authorize Section 63 BSA 2023 legal certificate admission',
      'Execute permanent zero-knowledge immutable archival lock'
    ]
  }
};

export const LIFECYCLE_STAGES: LifecycleStageMeta[] = [
  {
    id: 1,
    name: 'FIR Ingestion & Biometric Capture',
    shortName: 'FIR & GD Intake',
    description: 'Digital incident registration, GPS tagging, and IO timestamp verification.',
    custodian: 'Duty Officer & Investigating Officer',
    legalProvision: 'Section 173 BNSS 2023 (erstwhile Sec 154 CrPC)',
    color: '#06b6d4' // Cyan
  },
  {
    id: 2,
    name: 'Field Investigation & Seizures',
    shortName: 'Field Investigation',
    description: 'Recovery panchnamas, crime scene latent lifts, and witness depositions.',
    custodian: 'Investigating Officer & Panch Witnesses',
    legalProvision: 'Sec 105 BNSS (Search & Seizure) / Sec 180 BNSS',
    color: '#3b82f6' // Blue
  },
  {
    id: 3,
    name: 'Forensic Laboratory Analysis',
    shortName: 'CFSL / SFSL Analysis',
    description: 'Ballistics comparison, DNA STR profiling, toxicology, and strict CoC handoff stamps.',
    custodian: 'Senior Scientific Officer (CFSL / SFSL)',
    legalProvision: 'Sec 39 BSA 2023 (Expert Opinion)',
    color: '#8b5cf6' // Purple
  },
  {
    id: 4,
    name: 'Prosecutorial Scrutiny & Redaction',
    shortName: 'Prosecution Scrutiny',
    description: 'Public prosecutor vetting, automated witness PII protection redactions, and charge framing.',
    custodian: 'Special Public Prosecutor',
    legalProvision: 'Sec 193 BNSS 2023 (Police Report / Charge Sheet)',
    color: '#f59e0b' // Amber
  },
  {
    id: 5,
    name: 'Judicial Presentation & Court Seals',
    shortName: 'Judicial Presentation',
    description: 'Electronic evidence marking, Section 63 BSA compliance validation, and court orders.',
    custodian: 'Judicial Magistrate / Sessions Judge',
    legalProvision: 'Sec 63 BSA 2023 (Electronic Records Admissibility)',
    color: '#10b981' // Emerald
  },
  {
    id: 6,
    name: 'Immutable Archival & Retention Lock',
    shortName: 'Zero-Knowledge Archival',
    description: 'Permanent hardware-anchored zero-knowledge ledger archive with 30-year retention policy.',
    custodian: 'High Court / District Court Registrar',
    legalProvision: 'Public Records Act & ISO 27001 / FIPS 140-3',
    color: '#6366f1' // Indigo
  }
];
