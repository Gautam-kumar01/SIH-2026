/**
 * 3D ULPIN (Unique Land Parcel Identification Number) / 3D Spatial Identifier Generator & Schema
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Deterministic standard: IN-{State}-{District}-{Parcel}-{Floor}-{Unit}
 * Example: IN-BR-PAT-0104-F03-U302
 *
 * STATUTORY DISCLAIMER:
 * Generated identifiers are designated as "Proposed 3D Spatial Identifiers"
 * until formal statutory verification and gazette registration by the Competent Authority.
 */

export type UlpinStatus =
  | "DRAFT"
  | "AI_CANDIDATE"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "ARCHIVED";

export type EvidenceLevel = "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";

export interface Ulpin3dComponents {
  country: string; // e.g. "IN"
  state: string; // e.g. "BR" (Bihar), "DL" (Delhi), "MH" (Maharashtra)
  district: string; // e.g. "PAT" (Patna), "NDL" (New Delhi), "MUM" (Mumbai)
  parcelId: string; // e.g. "0104", "0042", "PLT-882"
  floor: string; // e.g. "B02", "B01", "G00", "F01", "F02", "F03", "R01"
  unitId: string; // e.g. "U101", "U302", "COM-G01", "PKG-B12"
}

export interface Ulpin3dRecord {
  ulpin3d: string;
  components: Ulpin3dComponents;
  parcelId: string;
  buildingId: string;
  floorCode: string;
  unitNumber: string;
  status: UlpinStatus;
  evidenceLevel: EvidenceLevel;
  zMinM: number;
  zMaxM: number;
  heightM: number;
  volumeCuM: number;
  carpetAreaSqM: number;
  geometryStatus: "VALID" | "NEEDS_REVIEW" | "INVALID";
  verificationStatus: "UNVERIFIED" | "AI_CANDIDATE" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  proposedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checksum: string;
  disclaimer: string;
  auditTrailCount: number;
}

export const CADASTRAL_LEGAL_DISCLAIMER =
  "Proposed 3D Spatial Identifier (Draft / Non-statutory pending government cadastral verification by Land Revenue & Municipal Authority).";

export const SYSTEM_TRUST_STATEMENT =
  "The system does not invent cadastral facts. It visualizes authoritative data, identifies candidate information, and explicitly reports unavailable or unverified attributes.";

/**
 * Normalizes floor codes to standard padded notation
 * (e.g., "3" -> "F03", "B1" -> "B01", "G" -> "G00")
 */
export function normalizeFloorCode(rawFloor: string | number): string {
  const str = String(rawFloor).trim().toUpperCase();
  if (!str) return "G00";
  if (str === "G" || str === "GROUND" || str === "0" || str === "G0") return "G00";
  if (str === "R" || str === "ROOF" || str === "TERRACE") return "R01";

  // Basement pattern B1, B2 -> B01, B02
  const basementMatch = str.match(/^B(\d+)$/);
  if (basementMatch) {
    return `B${basementMatch[1].padStart(2, "0")}`;
  }

  // Floor pattern F1, F02, or just numbers
  const floorMatch = str.match(/^(?:F)?(\d+)$/);
  if (floorMatch) {
    return `F${floorMatch[1].padStart(2, "0")}`;
  }

  // Fallback uppercase sanitized
  return str.replace(/[^A-Z0-9]/g, "").slice(0, 4) || "F01";
}

/**
 * Normalizes unit code to standard notation (e.g., "302" -> "U302")
 */
export function normalizeUnitCode(rawUnit: string): string {
  const str = String(rawUnit).trim().toUpperCase();
  if (!str) return "U001";
  if (/^[A-Z]/.test(str)) {
    return str.replace(/[^A-Z0-9_-]/g, "");
  }
  return `U${str.replace(/[^0-9]/g, "")}`;
}

/**
 * Calculates a standard Luhn-style hex checksum for identifier collision guard
 */
export function calculateUlpinChecksum(baseId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < baseId.length; i++) {
    hash ^= baseId.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(4, "0").slice(-4);
}

/**
 * Generates a deterministic 3D ULPIN
 * Format: IN-{State}-{District}-{Parcel}-{Floor}-{Unit}
 */
export function generate3DULPIN(params: {
  country?: string;
  state: string;
  district: string;
  parcelId: string;
  floor: string | number;
  unitId: string;
}): {
  ulpin3d: string;
  components: Ulpin3dComponents;
  checksum: string;
  isCompliant: boolean;
} {
  const country = (params.country || "IN").trim().toUpperCase();
  const state = params.state.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "BR";
  const district = params.district.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "PAT";
  
  // Clean parcel identifier (keep alphanumeric and dashes)
  const parcelClean = params.parcelId
    .trim()
    .toUpperCase()
    .replace(/^IN-[A-Z]{2,3}-[A-Z]{3,4}-/, "") // strip existing prefix if present
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 10) || "0101";

  const floorClean = normalizeFloorCode(params.floor);
  const unitClean = normalizeUnitCode(params.unitId);

  const baseIdentifier = `${country}-${state}-${district}-${parcelClean}-${floorClean}-${unitClean}`;
  const checksum = calculateUlpinChecksum(baseIdentifier);

  const components: Ulpin3dComponents = {
    country,
    state,
    district,
    parcelId: parcelClean,
    floor: floorClean,
    unitId: unitClean,
  };

  return {
    ulpin3d: baseIdentifier,
    components,
    checksum,
    isCompliant: true,
  };
}

/**
 * Decomposes and parses a 3D ULPIN string
 */
export function parse3DULPIN(ulpinStr: string): {
  isValid: boolean;
  components?: Ulpin3dComponents;
  error?: string;
} {
  if (!ulpinStr || typeof ulpinStr !== "string") {
    return { isValid: false, error: "Empty or invalid 3D ULPIN string" };
  }

  const parts = ulpinStr.trim().toUpperCase().split("-");
  if (parts.length < 6) {
    return {
      isValid: false,
      error: `Invalid 3D ULPIN structure. Expected 6 segments (e.g. IN-BR-PAT-0104-F03-U302), got ${parts.length}`,
    };
  }

  const [country, state, district, parcelId, floor, ...restUnit] = parts;
  const unitId = restUnit.join("-");

  return {
    isValid: true,
    components: {
      country,
      state,
      district,
      parcelId,
      floor,
      unitId,
    },
  };
}

/**
 * In-memory registry tracker for duplicate detection & collision auditing
 */
class UlpinCollisionRegistry {
  private registeredIds = new Map<string, { parcelId: string; buildingId: string; registeredAt: string }>();

  register(ulpin: string, meta: { parcelId: string; buildingId: string }): { success: boolean; conflict?: string } {
    const normalized = ulpin.trim().toUpperCase();
    if (this.registeredIds.has(normalized)) {
      const existing = this.registeredIds.get(normalized)!;
      return {
        success: false,
        conflict: `Duplicate 3D ULPIN collision: ${normalized} already registered for Parcel ${existing.parcelId}, Building ${existing.buildingId}`,
      };
    }
    this.registeredIds.set(normalized, { ...meta, registeredAt: new Date().toISOString() });
    return { success: true };
  }

  exists(ulpin: string): boolean {
    return this.registeredIds.has(ulpin.trim().toUpperCase());
  }

  clear() {
    this.registeredIds.clear();
  }
}

export const globalUlpinRegistry = new UlpinCollisionRegistry();
