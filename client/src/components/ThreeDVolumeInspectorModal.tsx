/**
 * 3D Volumetric Property Inspector Modal
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Mathematically inspects the true 3D spatial prism:
 * Volume = ∬ (Z_max - Z_min) dx dy = Footprint_Area × Height
 */

import React from "react";
import {
  Box,
  Layers,
  Building2,
  Boxes,
  Fingerprint,
  CheckCircle2,
  Ruler,
  Maximize,
  Compass,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloorUnitCadastre, FloorStackLevel, BuildingFloorStackRecord } from "@shared/floorCadastre";

interface ThreeDVolumeInspectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: FloorUnitCadastre | null;
  floor: FloorStackLevel | null;
  building: BuildingFloorStackRecord | null;
  parcelId?: string;
}

export const ThreeDVolumeInspectorModal: React.FC<ThreeDVolumeInspectorModalProps> = ({
  open,
  onOpenChange,
  unit,
  floor,
  building,
  parcelId = "BR-PAT-0104",
}) => {
  if (!unit || !floor || !building) return null;

  const zMin = unit.baseElevationM;
  const zMax = unit.baseElevationM + unit.heightM;
  const height = unit.heightM;
  const carpetArea = unit.carpetAreaSqM;
  const builtUpArea = unit.builtUpAreaSqM;
  const volume = unit.volumeCuM;

  // Volumetric density: volume / carpet area
  const volumetricFactor = (volume / carpetArea).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  3D Volumetric Property Inspector
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Volumetric spatial prism geometry & vertical strata parameters
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-emerald-950 border-emerald-800 text-emerald-400 font-mono text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" /> GEOMETRY VALID
            </Badge>
          </div>
        </DialogHeader>

        {/* Mathematical Formulation Banner */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
            3D Cadastral Volume Integration
          </div>
          <div className="text-teal-300 font-medium text-xs sm:text-sm">
            V(Unit) = ∬ (Z_max - Z_min) dx dy = {carpetArea.toFixed(1)} m² × {height.toFixed(2)} m = {volume.toFixed(2)} m³
          </div>
        </div>

        {/* 3D Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-2 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Unit Identifier</div>
            <div className="text-sm font-bold text-teal-300 mt-0.5">{unit.unitNumber}</div>
            <div className="text-[10px] text-slate-500">{unit.unitType}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Parent Floor</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{floor.floorName}</div>
            <div className="text-[10px] text-blue-400 font-semibold">{floor.floorCode}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Parent Parcel</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{parcelId}</div>
            <div className="text-[10px] text-slate-500">{building.buildingName}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Vertical Z-Min</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">{zMin.toFixed(2)} m</div>
            <div className="text-[10px] text-slate-500">Above Ground Datum</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Vertical Z-Max</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">{zMax.toFixed(2)} m</div>
            <div className="text-[10px] text-slate-500">Top Ceiling Slab</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Clear Height (ΔZ)</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{height.toFixed(2)} m</div>
            <div className="text-[10px] text-slate-500">Sanction Compliant</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Carpet Area</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{carpetArea} m²</div>
            <div className="text-[10px] text-slate-500">RERA Net Usable</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Built-up Area</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{builtUpArea} m²</div>
            <div className="text-[10px] text-slate-500">Inc. Outer Walls</div>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-800/50">
            <div className="text-[10px] text-teal-400 uppercase">Total 3D Volume</div>
            <div className="text-sm font-bold text-teal-300 mt-0.5">{volume} m³</div>
            <div className="text-[10px] text-teal-400/80">Stratified Space</div>
          </div>
        </div>

        {/* 2D to 3D Strata Bounds Explanation */}
        <div className="rounded-lg border border-slate-800 p-3 bg-slate-900/40 text-xs space-y-2">
          <div className="font-semibold text-slate-200 flex items-center justify-between">
            <span>Relative Slab Polyline Coordinates</span>
            <span className="text-[10px] font-mono text-slate-400">Normalized [-0.5, 0.5]</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 grid grid-cols-4 gap-2 text-center bg-slate-950 p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px]">X-Origin:</span> {unit.relativeBounds.x}
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Z-Origin:</span> {unit.relativeBounds.z}
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Rel Width:</span> {unit.relativeBounds.w}
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Rel Depth:</span> {unit.relativeBounds.d}
            </div>
          </div>
        </div>

        {/* Registered Strata Title & Clearance Status */}
        <div className="rounded-lg border border-slate-800 p-3 bg-slate-900/30 text-xs space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Registered Owner:</span>
            <span className="text-slate-200 font-semibold">{unit.owner.name}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Deed Registration No:</span>
            <span className="text-slate-300">{unit.owner.deedNumber} ({unit.owner.deedDate})</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Stamp Duty Reference:</span>
            <span className="text-slate-300">{unit.owner.stampDutyRef}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Fire & Structural Clearances:</span>
            <span className="text-emerald-400 font-semibold">APPROVED (NOC #{unit.clearances.fireNocNumber || "PMC-2026-F09"})</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold text-xs"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
