/**
 * Cadastral Audit Trail Model
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Provides immutable, traceable event logging for every cadastral lifecycle action.
 */

export type CadastralAuditEventType =
  | "PROPERTY_CREATED"
  | "AI_ANALYSIS_RUN"
  | "GEOMETRY_VALIDATED"
  | "ULPIN_GENERATED"
  | "EVIDENCE_UPDATED"
  | "OFFICER_REVIEWED"
  | "ULPIN_APPROVED"
  | "ULPIN_REJECTED"
  | "EVIDENCE_REQUESTED";

export interface CadastralAuditEntry {
  id: string;
  timestamp: string;
  eventType: CadastralAuditEventType;
  actor: {
    name: string;
    role: "CITIZEN" | "SURVEYOR" | "AUTHORITY_OFFICER" | "ADMIN" | "AI_ENGINE";
    department?: string;
  };
  target: {
    entityType: "PARCEL" | "BUILDING" | "FLOOR" | "UNIT" | "ULPIN_RECORD";
    entityId: string;
    ulpin3d?: string;
  };
  actionDescription: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata?: Record<string, any>;
  cryptographicDigest?: string;
}

export const INITIAL_CADASTRAL_AUDIT_TRAIL: CadastralAuditEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-09-15T09:30:00Z",
    eventType: "PROPERTY_CREATED",
    actor: {
      name: "Surveyor Alok Ranjan",
      role: "SURVEYOR",
      department: "Directorate of Land Records & Survey (DoLRS)",
    },
    target: {
      entityType: "BUILDING",
      entityId: "patna-central-heights",
      ulpin3d: "IN-BR-PAT-0042-3D",
    },
    actionDescription: "Initial 2D parcel boundary and building footprint ingested from digital RoR survey.",
    newState: { status: "DRAFT", evidenceLevel: "LEVEL_1" },
  },
  {
    id: "aud-002",
    timestamp: "2026-09-20T14:15:00Z",
    eventType: "AI_ANALYSIS_RUN",
    actor: {
      name: "Spatial Intelligence Engine v2.4",
      role: "AI_ENGINE",
      department: "Automated Cadastral Segmentation",
    },
    target: {
      entityType: "BUILDING",
      entityId: "patna-central-heights",
    },
    actionDescription: "Computed 3D vertical floor decomposition candidate with 94.2% structural confidence.",
    newState: { detectedFloors: 6, candidateUnits: 18 },
  },
  {
    id: "aud-003",
    timestamp: "2026-09-28T11:00:00Z",
    eventType: "GEOMETRY_VALIDATED",
    actor: {
      name: "Geospatial Validation Subsystem",
      role: "AI_ENGINE",
    },
    target: {
      entityType: "UNIT",
      entityId: "pch-u302",
      ulpin3d: "IN-BR-PAT-0042-F03-U302",
    },
    actionDescription: "Executed 9-rule spatial topology validation. All containment and non-overlap tests PASSED.",
    newState: { validationStatus: "VALID", overlapVolume: 0 },
  },
  {
    id: "aud-004",
    timestamp: "2026-10-02T16:45:00Z",
    eventType: "ULPIN_GENERATED",
    actor: {
      name: "Cadastral Registrar System",
      role: "AUTHORITY_OFFICER",
      department: "Patna Municipal Cadastre",
    },
    target: {
      entityType: "ULPIN_RECORD",
      entityId: "pch-u302",
      ulpin3d: "IN-BR-PAT-0042-F03-U302",
    },
    actionDescription: "Generated Proposed 3D ULPIN: IN-BR-PAT-0042-F03-U302 with deterministic checksum [8A1F].",
    newState: { status: "PENDING_VERIFICATION", evidenceLevel: "LEVEL_3" },
  },
];
