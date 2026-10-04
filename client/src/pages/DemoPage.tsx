/**
 * SIH 2026 Live Demo Mode & Guided Judge Evaluation Flow
 * Problem Statement PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Dedicated standalone demonstration workspace preloading deterministic cadastral datasets,
 * 15-step guided story runner, real spatial topology diagnostics, volumetric calculation,
 * and deterministic 3D ULPIN generation.
 */

import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Building2,
  Boxes,
  Fingerprint,
  ShieldCheck,
  FileCheck2,
  Database,
  BrainCircuit,
  Box,
  Scale,
  RotateCcw,
  Compass,
  MapPin,
  FileDown,
  Clock,
  Send,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CadastreTransformationStepper } from "@/components/CadastreTransformationStepper";
import { SpatialValidationModal } from "@/components/SpatialValidationModal";
import { UlpinGenerationWorkflowModal } from "@/components/UlpinGenerationWorkflowModal";
import { EvidenceSourcesMatrixModal } from "@/components/EvidenceSourcesMatrixModal";
import { ThreeDVolumeInspectorModal } from "@/components/ThreeDVolumeInspectorModal";
import { AiSpatialIntelligencePanel } from "@/components/AiSpatialIntelligencePanel";
import {
  SAMPLE_BUILDING_FLOOR_STACKS,
  BuildingFloorStackRecord,
  FloorStackLevel,
  FloorUnitCadastre,
} from "@shared/floorCadastre";
import {
  validatePropertyUnit,
  validateBuildingFloorStack,
  CadastralValidationReport,
} from "@shared/spatialTopologyValidator";
import {
  generate3DULPIN,
  CADASTRAL_LEGAL_DISCLAIMER,
  SYSTEM_TRUST_STATEMENT,
  Ulpin3dRecord,
} from "@shared/ulpin3dGenerator";
import { INITIAL_CADASTRAL_AUDIT_TRAIL, CadastralAuditEntry } from "@shared/auditTrailModel";

export default function DemoPage() {
  const [, setLocation] = useLocation();

  // Demo state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingFloorStackRecord>(
    SAMPLE_BUILDING_FLOOR_STACKS[0]
  );
  const [activeFloor, setActiveFloor] = useState<FloorStackLevel>(
    SAMPLE_BUILDING_FLOOR_STACKS[0].floors[3] // Floor 3
  );
  const [selectedUnit, setSelectedUnit] = useState<FloorUnitCadastre>(
    SAMPLE_BUILDING_FLOOR_STACKS[0].floors[3].units[1] // Unit 302
  );
  const [explosionFactor, setExplosionFactor] = useState<number>(0.35);
  const [auditLog, setAuditLog] = useState<CadastralAuditEntry[]>(INITIAL_CADASTRAL_AUDIT_TRAIL);
  const [proposedUlpinRecord, setProposedUlpinRecord] = useState<Ulpin3dRecord | null>(null);

  // Modal dialog states
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showUlpinGenModal, setShowUlpinGenModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [validationReport, setValidationReport] = useState<CadastralValidationReport | null>(null);

  const parcelId = "BR-PAT-0104";

  const DEMO_STEPS = [
    {
      id: 1,
      title: "Step 1: Open 3D Spatial Cadastre",
      summary: "Inspect georeferenced 3D urban terrain & cadastral parcels (Patna Central).",
      actionLabel: "Focus Parcel BR-PAT-0104",
      action: () => {
        toast.info("Step 1: Georeferenced parcel loaded at 25.6093°N, 85.1235°E.");
      },
    },
    {
      id: 2,
      title: "Step 2: Inspect 2D Cadastral Boundary",
      summary: "View authoritative Land Revenue RoR parcel boundary & plot records.",
      actionLabel: "Inspect 2D Parcel",
      action: () => {
        toast.success("Step 2: Parcel RoR verified (Plot 42/B, Area 1,250 m²).");
      },
    },
    {
      id: 3,
      title: "Step 3: Multi-Sensor Evidence Check",
      summary: "Inspect GIS, Satellite, LiDAR, and Drone multi-sensor evidence profile.",
      actionLabel: "Open Evidence Matrix",
      action: () => {
        setShowEvidenceModal(true);
      },
    },
    {
      id: 4,
      title: "Step 4: Select 3D Building Envelope",
      summary: "Inspect 3D building structural envelope with actual height from LiDAR.",
      actionLabel: "Inspect Building Envelope",
      action: () => {
        toast.success("Step 4: Building Patna Central Heights (Actual Height 24.8m).");
      },
    },
    {
      id: 5,
      title: "Step 5: Explode Vertical Floor Stack",
      summary: "Decompose building into 6 distinct vertical structural slab levels.",
      actionLabel: "Explode Floor Slabs (65%)",
      action: () => {
        setExplosionFactor(0.65);
        toast.success("Step 5: Building exploded into 6 vertical strata slabs.");
      },
    },
    {
      id: 6,
      title: "Step 6: Select 3D Property Unit",
      summary: "Select Unit 302 on Floor 3 for volumetric strata title inspection.",
      actionLabel: "Select Unit U302",
      action: () => {
        setActiveFloor(selectedBuilding.floors[3]);
        setSelectedUnit(selectedBuilding.floors[3].units[1]);
        toast.success("Step 6: Unit U302 selected (Elevation: 10.5m → 13.5m).");
      },
    },
    {
      id: 7,
      title: "Step 7: Volumetric Calculus & 3D Prism",
      summary: "Compute true spatial volume: V = ∬ (Z_max - Z_min) dx dy = 405.00 m³.",
      actionLabel: "Inspect 3D Volume",
      action: () => {
        setShowVolumeModal(true);
      },
    },
    {
      id: 8,
      title: "Step 8: Run 9-Rule Spatial Topology Engine",
      summary: "Validate closure, containment, non-overlap, vertical ordering & attributes.",
      actionLabel: "Execute Topology Engine",
      action: () => {
        const rep = validatePropertyUnit(selectedUnit, activeFloor, selectedBuilding, parcelId);
        setValidationReport(rep);
        setShowValidationModal(true);
      },
    },
    {
      id: 9,
      title: "Step 9: AI Spatial Intelligence Candidate",
      summary: "Inspect AI-assisted vertical segmentation candidate and anomaly detection.",
      actionLabel: "View AI Intelligence",
      action: () => {
        setShowAiModal(true);
      },
    },
    {
      id: 10,
      title: "Step 10: Generate Proposed 3D ULPIN",
      summary: "Deterministic spatial identifier: IN-BR-PAT-0104-F03-U302 [Checksum: 8A1F].",
      actionLabel: "Generate Proposed 3D ULPIN",
      action: () => {
        setShowUlpinGenModal(true);
      },
    },
    {
      id: 11,
      title: "Step 11: Route to Authority Review Desk",
      summary: "Dispatch proposed spatial unit to Municipal Authority for gazette review.",
      actionLabel: "Queue for Authority Review",
      action: () => {
        const newEntry: CadastralAuditEntry = {
          id: `aud-demo-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          eventType: "OFFICER_REVIEWED",
          actor: {
            name: "Authority Review Officer (PMC)",
            role: "AUTHORITY_OFFICER",
            department: "Municipal Land Revenue",
          },
          target: {
            entityType: "ULPIN_RECORD",
            entityId: selectedUnit.id,
            ulpin3d: selectedUnit.ulpin3d,
          },
          actionDescription: "Dispatched proposed 3D ULPIN to authority verification docket.",
          newState: { status: "PENDING_VERIFICATION" },
        };
        setAuditLog((prev) => [newEntry, ...prev]);
        toast.success("Step 11: Dossier routed to Authority Verification Desk.");
      },
    },
    {
      id: 12,
      title: "Step 12: Authority Decision (Approve / Reject)",
      summary: "Municipal officer verifies geometry, approves deed linkage, and locks ULPIN.",
      actionLabel: "Approve 3D ULPIN",
      action: () => {
        const approvedEntry: CadastralAuditEntry = {
          id: `aud-demo-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          eventType: "ULPIN_APPROVED",
          actor: {
            name: "Chief Cadastral Registrar",
            role: "AUTHORITY_OFFICER",
            department: "Directorate of Land Records",
          },
          target: {
            entityType: "ULPIN_RECORD",
            entityId: selectedUnit.id,
            ulpin3d: selectedUnit.ulpin3d,
          },
          actionDescription: "Statutory verification completed. 3D ULPIN sanctioned into State Cadastre.",
          newState: { status: "VERIFIED", evidenceLevel: "LEVEL_3" },
        };
        setAuditLog((prev) => [approvedEntry, ...prev]);
        toast.success("Step 12: 3D ULPIN officially sanctioned and approved!");
      },
    },
    {
      id: 13,
      title: "Step 13: Immutable Audit Trail",
      summary: "Every spatial edit, validation test, and officer action recorded in audit log.",
      actionLabel: "View Audit Ledger",
      action: () => {
        toast.info(`Step 13: Audit ledger contains ${auditLog.length} verified events.`);
      },
    },
    {
      id: 14,
      title: "Step 14: Central 3D ULPIN Registry",
      summary: "Search, filter, and inspect state-wide 3D parcels with direct 3D deep links.",
      actionLabel: "Open ULPIN Registry",
      action: () => {
        setLocation("/ulpin-registry");
      },
    },
    {
      id: 15,
      title: "Step 15: Multi-Sensor Extensibility",
      summary: "Ready for integration with Survey of India LiDAR, CORS GNSS, and Drone mesh.",
      actionLabel: "Complete Judge Tour",
      action: () => {
        toast.success("SIH PS26011 End-to-End Cadastral Workflow Verified!", {
          description: "From 2D Land Parcels to Evidence-Backed 3D Volumetric Property.",
        });
      },
    },
  ];

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNextStep = () => {
    currentStep.action();
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/workspace" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400">
            <Compass className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-100">
                SIH 2026 — 3D ULPIN / Vertical Property Cadastre
              </h1>
              <Badge className="bg-teal-950 border-teal-800 text-teal-300 font-mono text-[10px]">
                DEMO MODE · PS26011
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 15-Step Judge Evaluation Script (5–8 Minute Demonstration)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentStepIndex(0);
              setExplosionFactor(0.35);
              toast.info("Demo Tour Reset to Step 1.");
            }}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Tour
          </Button>
          <Link href="/workspace">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold text-xs">
              Live Workspace →
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto space-y-4 overflow-y-auto">
        {/* Cadastre Transformation Stepper Banner */}
        <CadastreTransformationStepper
          activeStep={Math.min(6, Math.floor(currentStepIndex / 2.5) + 1)}
          compact={false}
        />

        {/* Guided Tour Controller Bar */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/40 border border-teal-500/40 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 font-bold">
                STEP {currentStep.id} OF 15
              </span>
              <span className="text-xs font-semibold text-slate-200">{currentStep.title}</span>
            </div>
            <p className="text-xs text-slate-300">{currentStep.summary}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0}
              onClick={handlePreviousStep}
              className="border-slate-800 text-slate-400 hover:bg-slate-900 text-xs"
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={handleNextStep}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              {currentStep.actionLabel}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* 3D Cadastre Interactive Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: 3D Floor Stack & Unit Explorer (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Building & Unit Telemetry Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {selectedBuilding.buildingName}
                    </span>
                    <Badge className="bg-slate-800 border-slate-700 text-slate-300 font-mono text-[10px]">
                      {selectedBuilding.ulpin}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Parcel: {parcelId} · Lat {selectedBuilding.coordinates.latitude}°N, Lon {selectedBuilding.coordinates.longitude}°E
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEvidenceModal(true)}
                    className="border-slate-700 text-amber-300 hover:bg-slate-800 text-xs"
                  >
                    <Database className="w-3.5 h-3.5 mr-1" /> Evidence
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiModal(true)}
                    className="border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 mr-1" /> AI Spatial
                  </Button>
                </div>
              </div>

              {/* Vertical Floor Slicer & Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-400" />
                    Select Vertical Floor Level (Explosion: {Math.round(explosionFactor * 100)}%)
                  </span>
                  <span className="font-mono text-teal-300">
                    Active: {activeFloor.floorName} ({activeFloor.floorCode})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedBuilding.floors.map((fl) => {
                    const isSelected = activeFloor.floorIndex === fl.floorIndex;
                    return (
                      <button
                        key={fl.floorIndex}
                        type="button"
                        onClick={() => {
                          setActiveFloor(fl);
                          setSelectedUnit(fl.units[0]);
                          toast.info(`Switched to ${fl.floorName} (${fl.elevationMsl})`);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-start ${
                          isSelected
                            ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 ring-2 ring-teal-300"
                            : "bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-850"
                        }`}
                      >
                        <span>{fl.floorCode}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                          {fl.elevationBaseM}m - {fl.elevationBaseM + fl.floorHeightM}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Units on Active Floor Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Registered 3D Property Units on {activeFloor.floorCode}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Click unit to inspect volumetric bounds
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeFloor.units.map((unit) => {
                    const isUnitSelected = selectedUnit.id === unit.id;
                    return (
                      <div
                        key={unit.id}
                        onClick={() => {
                          setSelectedUnit(unit);
                          toast.success(`Selected Unit ${unit.unitNumber}`);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isUnitSelected
                            ? "bg-slate-950 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/40"
                            : "bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100">{unit.unitNumber}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300">
                              {unit.unitType}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-teal-400">
                            {unit.volumeCuM} m³
                          </span>
                        </div>

                        <div className="mt-1.5 grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
                          <div>Carpet: {unit.carpetAreaSqM} m²</div>
                          <div>ΔZ: {unit.heightM} m</div>
                          <div className="col-span-2 text-slate-300 truncate">Owner: {unit.owner.name}</div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span className="truncate max-w-[150px]">{unit.ulpin3d}</span>
                          <span className="text-emerald-400 font-bold">LEVEL 3</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Validation & Volumetric Inspector Toolbar */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Unit: <b className="text-teal-300">{selectedUnit.unitNumber}</b> ({activeFloor.floorCode})</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const rep = validatePropertyUnit(selectedUnit, activeFloor, selectedBuilding, parcelId);
                    setValidationReport(rep);
                    setShowValidationModal(true);
                  }}
                  className="border-slate-700 text-teal-300 hover:bg-slate-800 text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Run Validation
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowVolumeModal(true)}
                  className="border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs"
                >
                  <Box className="w-3.5 h-3.5 mr-1" />
                  3D Volume
                </Button>

                <Button
                  size="sm"
                  onClick={() => setShowUlpinGenModal(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs"
                >
                  <Fingerprint className="w-3.5 h-3.5 mr-1" />
                  Generate 3D ULPIN
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Inspector & Audit Trail (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Unit Inspector Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Unit 3D Telemetry
                </span>
                <Badge className="bg-emerald-950 border-emerald-800 text-emerald-400 text-[10px]">
                  VALIDATED
                </Badge>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Number:</span>
                  <span className="text-slate-200 font-bold">{selectedUnit.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Elevation Range:</span>
                  <span className="text-cyan-300 font-bold">{selectedUnit.elevationRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clear Height (ΔZ):</span>
                  <span className="text-slate-200 font-bold">{selectedUnit.heightM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carpet Area:</span>
                  <span className="text-slate-200">{selectedUnit.carpetAreaSqM} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Computed Volume:</span>
                  <span className="text-teal-300 font-bold">{selectedUnit.volumeCuM} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Owner:</span>
                  <span className="text-slate-200 truncate max-w-[150px]">{selectedUnit.owner.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deed Reg. No:</span>
                  <span className="text-slate-300">{selectedUnit.owner.deedNumber}</span>
                </div>
              </div>
            </div>

            {/* Cadastral Audit Trail Feed */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Cadastral Audit Ledger
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {auditLog.length} Records
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {auditLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-300 text-[10px]">
                        {log.eventType}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-snug">{log.actionDescription}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Actor: {log.actor.name} ({log.actor.role})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Trust Statement Badge */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-teal-800/40 text-[10px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-teal-300 block mb-0.5">Trust Principle:</span>
              {SYSTEM_TRUST_STATEMENT}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <SpatialValidationModal
        open={showValidationModal}
        onOpenChange={setShowValidationModal}
        report={validationReport}
        onRevalidate={() => {
          setValidationReport(validatePropertyUnit(selectedUnit, activeFloor, selectedBuilding, parcelId));
        }}
        targetTitle={`Unit ${selectedUnit.unitNumber} (${activeFloor.floorCode})`}
      />

      <UlpinGenerationWorkflowModal
        open={showUlpinGenModal}
        onOpenChange={setShowUlpinGenModal}
        unit={selectedUnit}
        floor={activeFloor}
        building={selectedBuilding}
        parcelId={parcelId}
        onSuccess={(rec) => {
          setProposedUlpinRecord(rec);
          const genEntry: CadastralAuditEntry = {
            id: `aud-demo-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            eventType: "ULPIN_GENERATED",
            actor: {
              name: "3D ULPIN Deterministic Engine",
              role: "AI_ENGINE",
            },
            target: {
              entityType: "ULPIN_RECORD",
              entityId: rec.unitNumber,
              ulpin3d: rec.ulpin3d,
            },
            actionDescription: `Generated Proposed 3D ULPIN: ${rec.ulpin3d} with checksum [${rec.checksum}].`,
            newState: { status: "PENDING_VERIFICATION", evidenceLevel: "LEVEL_3" },
          };
          setAuditLog((prev) => [genEntry, ...prev]);
        }}
        onNavigateToAuthorityDesk={() => {
          setLocation("/authority/dashboard");
        }}
      />

      <EvidenceSourcesMatrixModal
        open={showEvidenceModal}
        onOpenChange={setShowEvidenceModal}
        buildingName={selectedBuilding.buildingName}
        parcelId={parcelId}
        evidenceLevel="LEVEL_3"
      />

      <ThreeDVolumeInspectorModal
        open={showVolumeModal}
        onOpenChange={setShowVolumeModal}
        unit={selectedUnit}
        floor={activeFloor}
        building={selectedBuilding}
        parcelId={parcelId}
      />

      <AiSpatialIntelligencePanel
        open={showAiModal}
        onOpenChange={setShowAiModal}
        building={selectedBuilding}
        parcelId={parcelId}
      />
    </div>
  );
}
