/**
 * Evidence & Data Sources Model for 3D Cadastre and Vertical Property Mapping
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Core principle: "Never invent cadastral facts. Explicitly distinguish authoritative,
 * verified, AI candidate, and unavailable evidence."
 */

export type EvidenceSourceType =
  | "GIS_PARCEL"
  | "SATELLITE_IMAGERY"
  | "LIDAR_POINT_CLOUD"
  | "DRONE_PHOTOGRAMMETRY"
  | "GNSS_CORS_BENCHMARK"
  | "DEM_ELEVATION"
  | "DSM_SURFACE_MODEL"
  | "ARCHITECTURAL_FLOOR_PLAN"
  | "BIM_IFC_MODEL"
  | "AUTHORITY_REVENUE_RECORD";

export type SourceAvailability =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "PENDING_INGESTION"
  | "VERIFIED"
  | "NOT_VERIFIED";

export type AttributeConfidence =
  | "VERIFIED"
  | "UNVERIFIED"
  | "AI_CANDIDATE"
  | "UNAVAILABLE"
  | "CONFLICTING";

export interface EvidenceSourceLayer {
  id: EvidenceSourceType;
  name: string;
  category: "GEOSPATIAL" | "ELEVATION" | "ARCHITECTURAL" | "STATUTORY";
  status: SourceAvailability;
  resolutionOrAccuracy: string;
  sourceProvider: string;
  lastSyncDate?: string;
  confidenceScorePercent: number;
  authoritative: boolean;
  notes: string;
}

export interface PropertyAttributeEvidence {
  attributeName: string;
  valueDisplay: string;
  confidence: AttributeConfidence;
  sourceReference: EvidenceSourceType;
  verifiedByOfficer?: string;
  confidencePercent: number;
  statutoryLock: boolean;
  notes?: string;
}

export interface BuildingCadastralEvidenceProfile {
  buildingId: string;
  parcelId: string;
  evidenceLevel: "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  evidenceLevelDescription: string;
  overallConfidencePercent: number;
  sources: EvidenceSourceLayer[];
  attributes: PropertyAttributeEvidence[];
  aiCandidateNotes?: string;
}

/**
 * Standard Evidence Source definitions with realistic cadastral confidence ratings
 */
export const DEFAULT_EVIDENCE_SOURCES: EvidenceSourceLayer[] = [
  {
    id: "GIS_PARCEL",
    name: "Revenue Cadastral Parcel Map",
    category: "GEOSPATIAL",
    status: "VERIFIED",
    resolutionOrAccuracy: "± 0.15 m (Sub-meter Cadastral RoR)",
    sourceProvider: "State Revenue Department / Directorate of Land Records",
    lastSyncDate: "2026-08-15",
    confidenceScorePercent: 98,
    authoritative: true,
    notes: "Official cadastral vector polygon registered in Digital Land Records.",
  },
  {
    id: "SATELLITE_IMAGERY",
    name: "High-Resolution Satellite (Cartosat / Sentinel)",
    category: "GEOSPATIAL",
    status: "AVAILABLE",
    resolutionOrAccuracy: "0.5 m Orthorectified",
    sourceProvider: "ISRO / National Remote Sensing Centre (NRSC)",
    lastSyncDate: "2026-09-01",
    confidenceScorePercent: 91,
    authoritative: true,
    notes: "Multispectral orthophoto for footprint boundary cross-validation.",
  },
  {
    id: "LIDAR_POINT_CLOUD",
    name: "Airborne LiDAR 3D Point Cloud",
    category: "ELEVATION",
    status: "AVAILABLE",
    resolutionOrAccuracy: "16 pts/m² · Vertical Accuracy ± 0.08 m",
    sourceProvider: "Survey of India (SVAMITVA / Urban Mapping)",
    lastSyncDate: "2026-07-20",
    confidenceScorePercent: 95,
    authoritative: true,
    notes: "Direct LiDAR returns for rooftop parapet and eaves height verification.",
  },
  {
    id: "DRONE_PHOTOGRAMMETRY",
    name: "UAV Oblique Photogrammetry Mesh",
    category: "GEOSPATIAL",
    status: "AVAILABLE",
    resolutionOrAccuracy: "2.5 cm GSD 3D Textured Mesh",
    sourceProvider: "Municipal Corporation Drone Survey Wing",
    lastSyncDate: "2026-09-10",
    confidenceScorePercent: 94,
    authoritative: true,
    notes: "3D textured facade reconstruction and floor window level detection.",
  },
  {
    id: "GNSS_CORS_BENCHMARK",
    name: "CORS Real-Time Kinematic GNSS",
    category: "GEOSPATIAL",
    status: "AVAILABLE",
    resolutionOrAccuracy: "± 1.2 cm Horizontal, ± 2.0 cm Ellipsoidal Height",
    sourceProvider: "Survey of India National CORS Network",
    lastSyncDate: "2026-09-12",
    confidenceScorePercent: 99,
    authoritative: true,
    notes: "Geodetic primary control monument at site boundary.",
  },
  {
    id: "DEM_ELEVATION",
    name: "Digital Elevation Model (DEM)",
    category: "ELEVATION",
    status: "AVAILABLE",
    resolutionOrAccuracy: "1 m Grid Datum WGS84 / EGM2008",
    sourceProvider: "Survey of India",
    lastSyncDate: "2026-06-11",
    confidenceScorePercent: 96,
    authoritative: true,
    notes: "Ground datum elevation reference for base slab 0.00m.",
  },
  {
    id: "DSM_SURFACE_MODEL",
    name: "Digital Surface Model (DSM)",
    category: "ELEVATION",
    status: "AVAILABLE",
    resolutionOrAccuracy: "0.5 m Grid",
    sourceProvider: "Urban Remote Sensing Cell",
    lastSyncDate: "2026-07-22",
    confidenceScorePercent: 93,
    authoritative: false,
    notes: "Top-of-canopy and building peak elevation profile.",
  },
  {
    id: "ARCHITECTURAL_FLOOR_PLAN",
    name: "Sanctioned Architectural Floor Plans (CAD/PDF)",
    category: "ARCHITECTURAL",
    status: "VERIFIED",
    resolutionOrAccuracy: "1:100 Scale Vectorized Floor Layout",
    sourceProvider: "Urban Development & Housing Department (UDHD)",
    lastSyncDate: "2026-05-18",
    confidenceScorePercent: 97,
    authoritative: true,
    notes: "Approved blueprint detailing unit carpet boundaries and common areas.",
  },
  {
    id: "BIM_IFC_MODEL",
    name: "Building Information Model (BIM / IFC)",
    category: "ARCHITECTURAL",
    status: "PENDING_INGESTION",
    resolutionOrAccuracy: "LOD 350 Volumetric Elements",
    sourceProvider: "Project Structural Architect",
    lastSyncDate: undefined,
    confidenceScorePercent: 88,
    authoritative: false,
    notes: "Pending final digital IFC verification upload.",
  },
  {
    id: "AUTHORITY_REVENUE_RECORD",
    name: "Municipal Property Tax Registry (DoLR/ULB)",
    category: "STATUTORY",
    status: "VERIFIED",
    resolutionOrAccuracy: "Statutory Holding Record",
    sourceProvider: "Patna Municipal Corporation (PMC)",
    lastSyncDate: "2026-08-30",
    confidenceScorePercent: 99,
    authoritative: true,
    notes: "Holding tax, deed registration, and electricity meter correlation.",
  },
];

export const EVIDENCE_LEVEL_DESCRIPTIONS: Record<string, { level: string; label: string; desc: string }> = {
  LEVEL_0: {
    level: "LEVEL 0",
    label: "No Authoritative Evidence",
    desc: "Unverified coordinates or heuristic polygon with no ground truth or statutory backing.",
  },
  LEVEL_1: {
    level: "LEVEL 1",
    label: "2D Cadastral Footprint & GIS Boundary",
    desc: "Verified ground parcel boundary and satellite building outline; height unverified.",
  },
  LEVEL_2: {
    level: "LEVEL 2",
    label: "Verified Geometry & LiDAR/Drone Height",
    desc: "Verified 3D building envelope with measured structural height from LiDAR or drone survey.",
  },
  LEVEL_3: {
    level: "LEVEL 3",
    label: "Registered Vertical Units, Sanctioned Floor Plans & BIM",
    desc: "Complete 3D cadastral decomposition with approved floor plans, unit deeds, and volume locks.",
  },
};
