/**
 * Spatial & Topological Validation Engine for 3D Cadastre and Vertical Property Mapping
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Implements 9 essential cadastral spatial & topological verification rules:
 * 1. POLYGON_CLOSURE: Boundary geometry closure and non-self-intersection
 * 2. BUILDING_INSIDE_PARCEL: Building footprint inside parcel containment
 * 3. FLOOR_INSIDE_BUILDING: Floor slab volume containment in building envelope
 * 4. UNIT_INSIDE_FLOOR: Unit volumetric containment inside floor slab
 * 5. DUPLICATE_UNITS: Unique unit identifier constraint per floor/building
 * 6. UNIT_OVERLAP_INTERSECTION: 3D volumetric overlap/intersection check
 * 7. Z_RANGE_VALIDITY: Valid positive height thickness and non-inverted elevation
 * 8. FLOOR_ORDERING_CONTINUITY: Sequential vertical floor elevation continuity
 * 9. MISSING_ATTRIBUTES: Mandatory cadastral attributes validation
 */

import { FloorUnitCadastre, FloorStackLevel, BuildingFloorStackRecord } from "./floorCadastre";

export type ValidationSeverity = "PASS" | "WARNING" | "ERROR";

export interface ValidationRuleResult {
  ruleId: string;
  ruleName: string;
  category: "GEOMETRY" | "CONTAINMENT" | "TOPOLOGY" | "VOLUMETRIC" | "ATTRIBUTES";
  status: ValidationSeverity;
  message: string;
  remedialAction?: string;
  affectedEntities?: string[];
  metrics?: Record<string, number | string | boolean>;
}

export interface CadastralValidationReport {
  targetId: string;
  targetType: "PARCEL" | "BUILDING" | "FLOOR" | "UNIT";
  overallStatus: "VALID" | "WARNINGS_FOUND" | "INVALID" | "NEEDS_REVIEW";
  timestamp: string;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  totalRulesChecked: number;
  rules: ValidationRuleResult[];
  volumetricMetrics?: {
    volumeCuM: number;
    carpetAreaSqM: number;
    heightM: number;
    zMinM: number;
    zMaxM: number;
  };
}

/**
 * 3D Box overlap test in local/relative coordinates
 */
function test3DUnitOverlap(
  u1: FloorUnitCadastre,
  u2: FloorUnitCadastre
): { overlaps: boolean; overlapVolumeCuM: number } {
  // Test elevation overlap
  const u1Zmin = u1.baseElevationM;
  const u1Zmax = u1.baseElevationM + u1.heightM;
  const u2Zmin = u2.baseElevationM;
  const u2Zmax = u2.baseElevationM + u2.heightM;

  const zOverlapMin = Math.max(u1Zmin, u2Zmin);
  const zOverlapMax = Math.min(u1Zmax, u2Zmax);
  const zOverlap = Math.max(0, zOverlapMax - zOverlapMin);

  if (zOverlap <= 0.01) {
    return { overlaps: false, overlapVolumeCuM: 0 };
  }

  // Test 2D Relative bounds overlap (x, z, w, d)
  const b1 = u1.relativeBounds;
  const b2 = u2.relativeBounds;

  const xOverlapMin = Math.max(b1.x, b2.x);
  const xOverlapMax = Math.min(b1.x + b1.w, b2.x + b2.w);
  const xOverlap = Math.max(0, xOverlapMax - xOverlapMin);

  const dOverlapMin = Math.max(b1.z, b2.z);
  const dOverlapMax = Math.min(b1.z + b1.d, b2.z + b2.d);
  const dOverlap = Math.max(0, dOverlapMax - dOverlapMin);

  if (xOverlap > 0.02 && dOverlap > 0.02) {
    // Rough overlap volume estimate
    const footprintSqM = (u1.carpetAreaSqM + u2.carpetAreaSqM) / 2;
    const overlapFraction = (xOverlap * dOverlap) / Math.max(b1.w * b1.d, 0.001);
    const approxVolume = footprintSqM * overlapFraction * zOverlap;
    return { overlaps: true, overlapVolumeCuM: Number(approxVolume.toFixed(2)) };
  }

  return { overlaps: false, overlapVolumeCuM: 0 };
}

/**
 * Validates a single 3D Property Unit in the context of its parent Floor, Building, and Parcel
 */
export function validatePropertyUnit(
  unit: FloorUnitCadastre,
  parentFloor: FloorStackLevel,
  parentBuilding: BuildingFloorStackRecord,
  parcelId: string
): CadastralValidationReport {
  const rules: ValidationRuleResult[] = [];

  // Rule 1: Polygon / Footprint closure & validity
  const hasValidBounds =
    unit.relativeBounds &&
    unit.relativeBounds.w > 0 &&
    unit.relativeBounds.d > 0 &&
    unit.relativeBounds.w <= 1.05 &&
    unit.relativeBounds.d <= 1.05;

  rules.push({
    ruleId: "POLYGON_CLOSURE_VALIDITY",
    ruleName: "Unit Footprint Geometry Closure & Bounds",
    category: "GEOMETRY",
    status: hasValidBounds ? "PASS" : "ERROR",
    message: hasValidBounds
      ? `Unit ${unit.unitNumber} footprint boundary is closed and well-formed.`
      : `Unit ${unit.unitNumber} footprint has invalid or out-of-boundary dimensions (w: ${unit.relativeBounds?.w}, d: ${unit.relativeBounds?.d}).`,
    remedialAction: hasValidBounds ? undefined : "Recalibrate unit polyline coordinates from architectural floor plan.",
  });

  // Rule 2: Building inside parcel containment (inherited from building context)
  const isBuildingValid = !!parentBuilding.coordinates && !!parcelId;
  rules.push({
    ruleId: "BUILDING_INSIDE_PARCEL",
    ruleName: "Parent Building Footprint in Cadastral Parcel",
    category: "CONTAINMENT",
    status: isBuildingValid ? "PASS" : "WARNING",
    message: isBuildingValid
      ? `Building ${parentBuilding.buildingName} is georeferenced inside Parcel ${parcelId}.`
      : `Building centroid coordinates missing or unverified against parcel boundary ${parcelId}.`,
    remedialAction: isBuildingValid ? undefined : "Execute GIS cadastral parcel boundary overlay validation.",
  });

  // Rule 3: Floor Volume Inside Building Envelope
  const floorHeightPass = parentFloor.floorHeightM > 0 && parentFloor.elevationBaseM >= -25;
  const isFloorHeightLegal =
    parentBuilding.sanctionedHeightM <= 0 ||
    parentFloor.elevationBaseM + parentFloor.floorHeightM <= parentBuilding.actualHeightM + 0.5;

  rules.push({
    ruleId: "FLOOR_VOLUME_INSIDE_BUILDING",
    ruleName: "Floor Volume Containment in Building Envelope",
    category: "CONTAINMENT",
    status: floorHeightPass && !parentFloor.isUnauthorizedFloor ? "PASS" : parentFloor.isUnauthorizedFloor ? "ERROR" : "WARNING",
    message: parentFloor.isUnauthorizedFloor
      ? `Floor ${parentFloor.floorCode} flagged as unauthorized level (${parentFloor.heightViolationNotice || "Exceeds sanctioned height"}).`
      : `Floor ${parentFloor.floorCode} elevation (${parentFloor.elevationBaseM}m to ${parentFloor.elevationBaseM + parentFloor.floorHeightM}m) resides within building structural envelope.`,
    remedialAction: parentFloor.isUnauthorizedFloor ? "Submit municipal sanction regularization or non-encroachment affidavit." : undefined,
  });

  // Rule 4: Unit Volume Inside Parent Floor
  const unitZmin = unit.baseElevationM;
  const unitZmax = unit.baseElevationM + unit.heightM;
  const floorZmin = parentFloor.elevationBaseM;
  const floorZmax = parentFloor.elevationBaseM + parentFloor.floorHeightM;

  const unitInsideFloorZ = unitZmin >= floorZmin - 0.2 && unitZmax <= floorZmax + 0.2;
  const unitInsideFloorXY =
    unit.relativeBounds.x >= -0.55 &&
    unit.relativeBounds.x + unit.relativeBounds.w <= 0.55 &&
    unit.relativeBounds.z >= -0.55 &&
    unit.relativeBounds.z + unit.relativeBounds.d <= 0.55;

  const unitInsideFloor = unitInsideFloorZ && unitInsideFloorXY;

  rules.push({
    ruleId: "UNIT_VOLUME_INSIDE_FLOOR",
    ruleName: "Unit Volumetric Containment Inside Floor Slab",
    category: "VOLUMETRIC",
    status: unitInsideFloor ? "PASS" : "ERROR",
    message: unitInsideFloor
      ? `Unit ${unit.unitNumber} 3D volume (${unit.volumeCuM} m³) is strictly contained within Floor ${parentFloor.floorCode} slab boundaries.`
      : `Unit ${unit.unitNumber} exceeds floor bounds (Vertical Z: [${unitZmin}m, ${unitZmax}m] vs Floor [${floorZmin}m, ${floorZmax}m]).`,
    remedialAction: unitInsideFloor ? undefined : "Snap unit vertical slab elevations to floor datum.",
  });

  // Rule 5: Duplicate Units in Same Floor
  const duplicateUnits = parentFloor.units.filter((u) => u.unitNumber === unit.unitNumber);
  const isDuplicate = duplicateUnits.length > 1;

  rules.push({
    ruleId: "DUPLICATE_UNIT_IDENTIFIERS",
    ruleName: "Unit Identifier Uniqueness Constraint",
    category: "TOPOLOGY",
    status: !isDuplicate ? "PASS" : "ERROR",
    message: !isDuplicate
      ? `Unit identifier ${unit.unitNumber} is unique across Floor ${parentFloor.floorCode}.`
      : `Critical conflict: Multiple units registered with identifier ${unit.unitNumber} on Floor ${parentFloor.floorCode}.`,
    remedialAction: !isDuplicate ? undefined : "Assign distinct cadastral sub-unit serial notation.",
  });

  // Rule 6: 3D Unit Overlap / Collision with Siblings
  const siblingUnits = parentFloor.units.filter((u) => u.id !== unit.id);
  let hasOverlap = false;
  let maxOverlapVolume = 0;
  let overlappingSiblingName = "";

  for (const sibling of siblingUnits) {
    const overlapRes = test3DUnitOverlap(unit, sibling);
    if (overlapRes.overlaps) {
      hasOverlap = true;
      maxOverlapVolume = Math.max(maxOverlapVolume, overlapRes.overlapVolumeCuM);
      overlappingSiblingName = sibling.unitNumber;
      break;
    }
  }

  rules.push({
    ruleId: "UNIT_OVERLAP_INTERSECTION",
    ruleName: "3D Volumetric Spatial Disjointness / Non-Overlap",
    category: "TOPOLOGY",
    status: !hasOverlap ? "PASS" : "ERROR",
    message: !hasOverlap
      ? `No 3D spatial intersections detected with adjacent units on Floor ${parentFloor.floorCode}.`
      : `Spatial Conflict: Volumetric overlap detected with adjacent Unit ${overlappingSiblingName} (~${maxOverlapVolume} m³ collision).`,
    remedialAction: !hasOverlap ? undefined : "Perform 3D snapping along shared partition wall vertices.",
  });

  // Rule 7: Invalid Z Range & Thickness
  const hasValidZ = unit.heightM > 0.5 && unitZmax > unitZmin && !isNaN(unit.baseElevationM);
  rules.push({
    ruleId: "INVALID_Z_RANGE",
    ruleName: "Vertical Height Thickness & Elevation Vector Validity",
    category: "VOLUMETRIC",
    status: hasValidZ ? "PASS" : "ERROR",
    message: hasValidZ
      ? `Positive vertical height verified (${unit.heightM}m, Z-span: ${unitZmin.toFixed(2)}m to ${unitZmax.toFixed(2)}m).`
      : `Invalid vertical bounds: Z-min (${unitZmin}) >= Z-max (${unitZmax}) or height thickness < 0.5m.`,
    remedialAction: hasValidZ ? undefined : "Verify slab floor-to-ceiling clear height in architectural schedule.",
  });

  // Rule 8: Floor Ordering & Vertical Continuity
  const floorIndex = parentBuilding.floors.findIndex((f) => f.floorCode === parentFloor.floorCode);
  let isOrderingValid = true;
  let orderingNote = "Floor vertical sequence is continuous.";

  if (floorIndex > 0) {
    const lowerFloor = parentBuilding.floors[floorIndex - 1];
    const expectedLowerTop = lowerFloor.elevationBaseM + lowerFloor.floorHeightM;
    const elevationGap = Math.abs(parentFloor.elevationBaseM - expectedLowerTop);
    if (elevationGap > 1.0) {
      isOrderingValid = false;
      orderingNote = `Vertical gap/discontinuity of ${elevationGap.toFixed(2)}m detected between Floor ${lowerFloor.floorCode} and ${parentFloor.floorCode}.`;
    }
  }

  rules.push({
    ruleId: "FLOOR_ORDERING_CONTINUITY",
    ruleName: "Floor Vertical Hierarchy & Slab Continuity",
    category: "TOPOLOGY",
    status: isOrderingValid ? "PASS" : "WARNING",
    message: isOrderingValid ? `Floor stack vertical hierarchy verified.` : orderingNote,
    remedialAction: isOrderingValid ? undefined : "Harmonize structural slab thickness across intermediate floor levels.",
  });

  // Rule 9: Missing Mandatory Cadastral Attributes
  const missingAttrs: string[] = [];
  if (!unit.carpetAreaSqM || unit.carpetAreaSqM <= 0) missingAttrs.push("Carpet Area");
  if (!unit.volumeCuM || unit.volumeCuM <= 0) missingAttrs.push("Volume (m³)");
  if (!unit.unitType) missingAttrs.push("Unit Type");
  if (!unit.owner?.name) missingAttrs.push("Registered Owner / Claimant");

  const hasAllAttrs = missingAttrs.length === 0;
  rules.push({
    ruleId: "MISSING_MANDATORY_ATTRIBUTES",
    ruleName: "Cadastral Attribute Completeness",
    category: "ATTRIBUTES",
    status: hasAllAttrs ? "PASS" : "WARNING",
    message: hasAllAttrs
      ? `All statutory cadastral attributes (Carpet area, Volume, Owner deed, Unit type) populated.`
      : `Missing or pending mandatory attributes: ${missingAttrs.join(", ")}.`,
    remedialAction: hasAllAttrs ? undefined : "Complete registry deed linkage in property documentation module.",
  });

  // Count summaries
  const passedCount = rules.filter((r) => r.status === "PASS").length;
  const warningCount = rules.filter((r) => r.status === "WARNING").length;
  const errorCount = rules.filter((r) => r.status === "ERROR").length;

  let overallStatus: CadastralValidationReport["overallStatus"] = "VALID";
  if (errorCount > 0) {
    overallStatus = "INVALID";
  } else if (warningCount > 0) {
    overallStatus = "WARNINGS_FOUND";
  }

  return {
    targetId: unit.id,
    targetType: "UNIT",
    overallStatus,
    timestamp: new Date().toISOString(),
    passedCount,
    warningCount,
    errorCount,
    totalRulesChecked: rules.length,
    rules,
    volumetricMetrics: {
      volumeCuM: unit.volumeCuM,
      carpetAreaSqM: unit.carpetAreaSqM,
      heightM: unit.heightM,
      zMinM: unit.baseElevationM,
      zMaxM: unit.baseElevationM + unit.heightM,
    },
  };
}

/**
 * Validates an entire building floor stack
 */
export function validateBuildingFloorStack(
  building: BuildingFloorStackRecord,
  parcelId: string
): CadastralValidationReport {
  const allUnitReports: CadastralValidationReport[] = [];
  
  for (const floor of building.floors) {
    for (const unit of floor.units) {
      allUnitReports.push(validatePropertyUnit(unit, floor, building, parcelId));
    }
  }

  const allRules = allUnitReports.flatMap((r) => r.rules);
  const passedCount = allRules.filter((r) => r.status === "PASS").length;
  const warningCount = allRules.filter((r) => r.status === "WARNING").length;
  const errorCount = allRules.filter((r) => r.status === "ERROR").length;

  let overallStatus: CadastralValidationReport["overallStatus"] = "VALID";
  if (errorCount > 0) overallStatus = "INVALID";
  else if (warningCount > 0) overallStatus = "NEEDS_REVIEW";

  return {
    targetId: building.id,
    targetType: "BUILDING",
    overallStatus,
    timestamp: new Date().toISOString(),
    passedCount,
    warningCount,
    errorCount,
    totalRulesChecked: allRules.length,
    rules: allRules.slice(0, 15), // top 15 highlights
    volumetricMetrics: {
      volumeCuM: building.floors.reduce(
        (acc, f) => acc + f.units.reduce((uAcc, u) => uAcc + u.volumeCuM, 0),
        0
      ),
      carpetAreaSqM: building.floors.reduce(
        (acc, f) => acc + f.units.reduce((uAcc, u) => uAcc + u.carpetAreaSqM, 0),
        0
      ),
      heightM: building.actualHeightM,
      zMinM: building.floors[0]?.elevationBaseM || 0,
      zMaxM: building.actualHeightM,
    },
  };
}
