/**
 * Cadastre Transformation Stepper: 2D Parcel -> 3D Volumetric Property
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * An intuitive, interactive visual explanation designed for SIH judges to immediately
 * grasp the 6-step evolutionary pipeline from 2D land records to verified 3D ULPINs.
 */

import React, { useState } from "react";
import {
  Layers,
  Building2,
  Boxes,
  ShieldCheck,
  Fingerprint,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface StepperStep {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  bgGrad: string;
  formula: string;
  description: string;
  cadastralArtifact: string;
  exampleData: {
    label: string;
    value: string;
  }[];
}

export const TRANSFORMATION_STEPS: StepperStep[] = [
  {
    id: 1,
    title: "2D Cadastral Parcel",
    subtitle: "Ground Boundary & Revenue RoR",
    badge: "Land Record",
    icon: Layers,
    color: "text-amber-400",
    bgGrad: "from-amber-500/10 to-transparent border-amber-500/30",
    formula: "Parcel = { (X₁, Y₁), (X₂, Y₂), ... (Xₙ, Yₙ) }",
    description:
      "Traditional 2D land parcel registered in State Revenue Directorate (RoR). Defines surface ground boundaries without vertical dimension.",
    cadastralArtifact: "Record of Rights (Khatian / Mutation Plot Map)",
    exampleData: [
      { label: "Parcel ID", value: "BR-PAT-0104" },
      { label: "Khesra / Plot No", value: "Plot 42/B" },
      { label: "Ground Area", value: "1,250.00 m²" },
      { label: "Datum", value: "WGS84 / EPSG:4326" },
    ],
  },
  {
    id: 2,
    title: "3D Building Footprint",
    subtitle: "Structural Envelope & Height",
    badge: "GIS / LiDAR",
    icon: Building2,
    color: "text-cyan-400",
    bgGrad: "from-cyan-500/10 to-transparent border-cyan-500/30",
    formula: "Envelope = Footprint(X, Y) × Height(Z_actual)",
    description:
      "Extruded 3D building structural envelope derived from high-resolution satellite, LiDAR point clouds, and Municipal Sanction orders.",
    cadastralArtifact: "LOD-2 3D Building Vector Envelope",
    exampleData: [
      { label: "Building Code", value: "BLD-PCH-01" },
      { label: "Base Elevation", value: "52.40 m MSL" },
      { label: "Sanctioned Height", value: "24.50 m" },
      { label: "Actual Height (LiDAR)", value: "24.80 m" },
    ],
  },
  {
    id: 3,
    title: "Vertical Floor Decomposition",
    subtitle: "Multi-Level Structural Slabs",
    badge: "Vertical Cadastre",
    icon: Boxes,
    color: "text-blue-400",
    bgGrad: "from-blue-500/10 to-transparent border-blue-500/30",
    formula: "Floor_i = [ Z_base, Z_base + H_floor ]",
    description:
      "Decomposes the structural mass into distinct vertical levels (Basements, Ground, Commercial, Residential, Rooftop) with exact slab heights.",
    cadastralArtifact: "Stratified Vertical Floor Schedule",
    exampleData: [
      { label: "Floor Level", value: "Floor 3 (F03)" },
      { label: "Elevation Range", value: "10.50m — 13.50m" },
      { label: "Floor Clear Height", value: "3.00 m" },
      { label: "Total Units on Floor", value: "4 Distinct Units" },
    ],
  },
  {
    id: 4,
    title: "3D Volumetric Property Unit",
    subtitle: "Spatial Volume & Strata Title",
    badge: "3D Unit Volume",
    icon: Fingerprint,
    color: "text-teal-400",
    bgGrad: "from-teal-500/10 to-transparent border-teal-500/30",
    formula: "Volume(U) = ∬ (Z_max - Z_min) dx dy = Area × H",
    description:
      "A true 3D cadastral parcel unit possessing explicit horizontal polygon bounds and vertical elevation intervals with computed spatial volume.",
    cadastralArtifact: "Volumetric Property Deed & Strata Title",
    exampleData: [
      { label: "Unit Number", value: "Unit 302 (U302)" },
      { label: "Carpet Area", value: "135.00 m²" },
      { label: "Computed Volume", value: "405.00 m³" },
      { label: "Z-Min / Z-Max", value: "10.50 m / 13.50 m" },
    ],
  },
  {
    id: 5,
    title: "Evidence & Topology Validation",
    subtitle: "9-Rule Geometric Verification",
    badge: "Spatial Engine",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgGrad: "from-emerald-500/10 to-transparent border-emerald-500/30",
    formula: "Topology: Containment ∧ Disjointness ∧ Continuity = TRUE",
    description:
      "Automated spatial engine validates closure, vertical ordering, non-overlap, building envelope containment, and cross-references source evidence.",
    cadastralArtifact: "Cadastral Topology Diagnostic Report",
    exampleData: [
      { label: "Rules Evaluated", value: "9 / 9 Rules PASSED" },
      { label: "3D Overlap", value: "0.00 m³ (Disjoint)" },
      { label: "Evidence Level", value: "LEVEL 3 (Verified Plans)" },
      { label: "Topology Status", value: "VALID & COMPLIANT" },
    ],
  },
  {
    id: 6,
    title: "Proposed 3D ULPIN Generation",
    subtitle: "Deterministic Spatial Identifier",
    badge: "Proposed ULPIN",
    icon: FileCheck2,
    color: "text-purple-400",
    bgGrad: "from-purple-500/10 to-transparent border-purple-500/30",
    formula: "ULPIN = IN-{State}-{District}-{Parcel}-{Floor}-{Unit}",
    description:
      "Generates a unique, collision-proof 3D spatial identifier routed to the Authority Verification Desk for statutory gazette approval.",
    cadastralArtifact: "Proposed 3D ULPIN Gazette Candidate",
    exampleData: [
      { label: "Generated 3D ULPIN", value: "IN-BR-PAT-0104-F03-U302" },
      { label: "Checksum Guard", value: "8A1F (Deterministic)" },
      { label: "Cadastral State", value: "Pending Authority Review" },
      { label: "Statutory Status", value: "Proposed Spatial Identifier" },
    ],
  },
];

export const CadastreTransformationStepper: React.FC<{
  activeStep?: number;
  onSelectStep?: (stepId: number) => void;
  compact?: boolean;
}> = ({ activeStep = 1, onSelectStep, compact = false }) => {
  const [selectedModalStep, setSelectedModalStep] = useState<StepperStep | null>(null);

  return (
    <>
      <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/70 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 tracking-wide flex items-center gap-1.5">
                3D Cadastre Evolution Pipeline
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/50">
                  SIH PS26011
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                From 2D Land Parcels to Evidence-Backed 3D Volumetric Property
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Click any step to inspect mathematical formula & evidence
          </div>
        </div>

        {/* Stepper horizontal grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {TRANSFORMATION_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  onSelectStep?.(step.id);
                  setSelectedModalStep(step);
                }}
                className={`group relative text-left p-2.5 sm:p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between hover:scale-[1.02] cursor-pointer ${
                  isCurrent
                    ? "bg-slate-900/90 border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/40"
                    : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      0{step.id}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 py-0.5 rounded border border-slate-700/60 bg-slate-950 text-slate-300`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded bg-slate-950 border border-slate-800 ${step.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-teal-300 transition-colors">
                      {step.title}
                    </span>
                  </div>

                  {!compact && (
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                      {step.subtitle}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-slate-400 truncate max-w-[80px]">
                    {step.exampleData[0]?.value}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Deep-Dive */}
      <Dialog open={!!selectedModalStep} onOpenChange={(open) => !open && setSelectedModalStep(null)}>
        {selectedModalStep && (
          <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
                  STEP 0{selectedModalStep.id} OF 06
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {selectedModalStep.badge}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-100">
                {selectedModalStep.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                {selectedModalStep.subtitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Mathematical Formula Box */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Cadastral Formulation
                </div>
                <div className="text-teal-300 font-medium overflow-x-auto py-1">
                  {selectedModalStep.formula}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedModalStep.description}
              </p>

              {/* Cadastral Artifact */}
              <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-800/40 text-xs flex items-center justify-between">
                <span className="text-slate-400 font-medium">Output Cadastral Artifact:</span>
                <span className="text-teal-300 font-mono font-semibold">
                  {selectedModalStep.cadastralArtifact}
                </span>
              </div>

              {/* Example Data Table */}
              <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                <div className="bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  Live Demonstration Parameters
                </div>
                <div className="divide-y divide-slate-800/70 bg-slate-950">
                  {selectedModalStep.exampleData.map((d, i) => (
                    <div key={i} className="flex justify-between px-3 py-2">
                      <span className="text-slate-400">{d.label}</span>
                      <span className="font-mono text-slate-200 font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-300 hover:bg-slate-900"
                onClick={() => setSelectedModalStep(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold"
                onClick={() => {
                  const nextId = (selectedModalStep.id % 6) + 1;
                  const nextStep = TRANSFORMATION_STEPS.find((s) => s.id === nextId) || null;
                  setSelectedModalStep(nextStep);
                  if (nextStep) onSelectStep?.(nextStep.id);
                }}
              >
                Next Step ({selectedModalStep.id < 6 ? `0${selectedModalStep.id + 1}` : "01"})
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};
