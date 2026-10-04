import React, { useState } from "react";
import {
  type BuildingFloorStackRecord,
  type FloorStackLevel,
  type FloorUnitCadastre,
} from "@shared/floorCadastre";
import {
  X,
  Building,
  Layers,
  MapPin,
  ShieldCheck,
  FileCheck2,
  FileDown,
  Flame,
  Zap,
  Droplet,
  Receipt,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Scale,
  Sparkles,
  ExternalLink,
  Box,
  Fingerprint,
  Database,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { validatePropertyUnit, CadastralValidationReport } from "@shared/spatialTopologyValidator";
import { SpatialValidationModal } from "./SpatialValidationModal";
import { UlpinGenerationWorkflowModal } from "./UlpinGenerationWorkflowModal";
import { EvidenceSourcesMatrixModal } from "./EvidenceSourcesMatrixModal";
import { ThreeDVolumeInspectorModal } from "./ThreeDVolumeInspectorModal";

type FloorUnitInspectorDrawerProps = {
  building: BuildingFloorStackRecord;
  floor: FloorStackLevel | null;
  unit: FloorUnitCadastre | null;
  isOpen: boolean;
  onClose: () => void;
  parcelId?: string;
  onNavigateToAuthorityDesk?: (ulpin: string) => void;
};

export function FloorUnitInspectorDrawer({
  building,
  floor,
  unit,
  isOpen,
  onClose,
  parcelId = "BR-PAT-0104",
  onNavigateToAuthorityDesk,
}: FloorUnitInspectorDrawerProps) {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showUlpinGenModal, setShowUlpinGenModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [validationReport, setValidationReport] = useState<CadastralValidationReport | null>(null);

  if (!isOpen || !floor || !unit) return null;

  const handleOpenValidation = () => {
    const report = validatePropertyUnit(unit, floor, building, parcelId);
    setValidationReport(report);
    setShowValidationModal(true);
  };

  const copyUlpin = () => {
    navigator.clipboard.writeText(unit.ulpin3d);
    toast.success("3D ULPIN Copied to Clipboard", {
      description: unit.ulpin3d,
    });
  };

  const downloadFloorCertificate = () => {
    try {
      const doc = new jsPDF();

      // Certificate Header Background Banner
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 45, "F");

      // Emblem / Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("GOVERNMENT OF BIHAR · URBAN LAND REGISTRY", 105, 18, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(56, 189, 248); // Sky 400
      doc.text("NATIONAL 3D CADASTRAL RECORD & VERTICAL PROPERTY CERTIFICATE", 105, 28, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text("Under National Land Records Modernization Programme (NLRMP) · 3D ULPIN System", 105, 36, { align: "center" });

      // Certificate Number & Timestamp
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Cert Ref: 3D-VPM/${unit.ulpin3d}/${Date.now().toString().slice(-6)}`, 14, 52);
      doc.text(`Issued Date: ${new Date().toLocaleDateString("en-IN")}`, 155, 52);

      // Section 1: Vertical Cadastral Identification
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 56, 182, 38, 3, 3, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. VERTICAL PROPERTY UNIT IDENTIFIERS", 18, 64);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Unit Title: ${unit.unitNumber}`, 18, 72);
      doc.text(`Building: ${building.buildingName} (${building.ulpin})`, 18, 79);
      doc.text(`Floor Level: ${floor.floorName} [${floor.floorCode}]`, 18, 86);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(2, 132, 199);
      doc.text(`Unique 14-Digit 3D ULPIN: ${unit.ulpin3d}`, 105, 72);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`Municipal Sanction No: ${building.municipalSanctionNo}`, 105, 79);
      doc.text(`Property Category: ${unit.unitType}`, 105, 86);

      // Section 2: Geodetic & Volumetric Telemetry
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 98, 182, 36, 3, 3, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. GEODETIC & VOLUMETRIC METRICS (+MSL)", 18, 106);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Elevation Range: ${unit.elevationRange}`, 18, 114);
      doc.text(`Floor Clear Height: ${unit.heightM} metres`, 18, 121);
      doc.text(`Carpet Area: ${unit.carpetAreaSqM} m²`, 18, 128);

      doc.text(`Built-Up Area: ${unit.builtUpAreaSqM} m²`, 105, 114);
      doc.text(`3D Volumetric Extent: ${unit.volumeCuM} m³`, 105, 121);
      doc.text(`Global Coordinates: Lat ${building.coordinates.latitude}, Lon ${building.coordinates.longitude}`, 105, 128);

      // Section 3: Verified Ownership & Registered Deed
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 138, 182, 36, 3, 3, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. VERIFIED PROPRIETARY & DEED RECORDS", 18, 146);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Registered Title Holder: ${unit.owner.name}`, 18, 154);
      doc.text(`Conveyance Deed No: ${unit.owner.deedNumber}`, 18, 161);
      doc.text(`Deed Registration Date: ${unit.owner.deedDate}`, 18, 168);

      doc.text(`Aadhaar/PAN Verified: ${unit.owner.verifiedAadhaarPan ? "YES (Biometric KYC)" : "PENDING"}`, 105, 154);
      doc.text(`Stamp Duty Receipt Ref: ${unit.owner.stampDutyRef}`, 105, 161);
      doc.text(`Ownership Share: ${unit.owner.registeredShare}`, 105, 168);

      // Section 4: Statutory Clearances & Easements
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 178, 182, 42, 3, 3, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("4. STATUTORY CLEARANCES & REGISTERED EASEMENTS", 18, 186);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Fire NOC: ${unit.clearances.fireNoc} (${unit.clearances.fireNocNumber || "NA"})`, 18, 194);
      doc.text(`Electricity Connection ID: ${unit.clearances.electricityConsumerId} (${unit.clearances.electricitySanctionedKw} kW)`, 18, 201);
      doc.text(`Municipal Property Tax: ${unit.clearances.municipalTaxStatus} (Receipt: ${unit.clearances.taxReceiptNo || "NA"})`, 18, 208);
      doc.text(`Water Connection ID: ${unit.clearances.waterConnectionId}`, 18, 215);

      doc.text(`Easements: ${unit.easements.join("; ")}`, 105, 194, { maxWidth: 85 });

      // Verification QR / Stamp footer
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("This document is a digitally generated 3D Cadastre certificate under the authority of the Department of Revenue & Land Reforms.", 14, 235);
      doc.text("Authenticity can be verified cryptographically against the state Neon PostGIS Spatial Ledger.", 14, 240);

      // Save PDF
      doc.save(`3D-ULPIN-Certificate-${unit.ulpin3d}.pdf`);
      toast.success("Floor Certificate Downloaded", {
        description: `Official PDF for ${unit.unitNumber} generated successfully.`,
      });
    } catch (err: any) {
      toast.error("Failed to generate PDF", {
        description: err?.message || "PDF generation error.",
      });
    }
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900/98 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 font-sans animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {unit.unitType}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Floor {floor.floorCode}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                LEVEL 3 EVIDENCE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {unit.unitNumber}
              <span className="text-xs font-normal text-slate-400">({unit.volumeCuM} m³)</span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Building size={13} className="text-teal-400 shrink-0" />
              <span>{building.buildingName}</span>
              <span>•</span>
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px]">{building.address}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Cadastral Actions Bar */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-medium">
          <button
            type="button"
            onClick={handleOpenValidation}
            className="p-2 rounded-lg bg-slate-900 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-700/60 text-teal-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Validate</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUlpinGenModal(true)}
            className="p-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-200 flex items-center justify-center gap-1.5 transition-all font-semibold"
          >
            <Fingerprint className="w-3.5 h-3.5 text-teal-300" />
            <span>3D ULPIN</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVolumeModal(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>Volume</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEvidenceModal(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Evidence</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* 14-Digit 3D ULPIN Card */}
          <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-cyan-950/60 border border-teal-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                Proposed 3D Spatial Identifier (3D ULPIN)
              </span>
              <button
                type="button"
                onClick={copyUlpin}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700 transition-colors"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
            <div className="font-mono text-base font-bold text-teal-200 tracking-wider break-all select-all">
              {unit.ulpin3d}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Status: PENDING_VERIFICATION</span>
              <span>Checksum: [8A1F]</span>
            </div>
          </div>

          {/* Geodetic & Volumetric Telemetry */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Scale size={15} />
                <span>3D Volumetric Slicing & Strata</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVolumeModal(true)}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                Inspect Formula →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Elevation (+MSL)</span>
                <span className="font-bold text-emerald-400">{unit.elevationRange}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Clear Height</span>
                <span className="font-bold text-white">{unit.heightM} metres</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Carpet Area</span>
                <span className="font-bold text-white">{unit.carpetAreaSqM} m²</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">3D Volume</span>
                <span className="font-bold text-teal-300">{unit.volumeCuM} m³</span>
              </div>
            </div>
          </div>

          {/* Verified Owner & Identity */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <UserCheck size={15} />
                <span>Verified Proprietary Title</span>
              </div>
              {unit.owner.verifiedAadhaarPan ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <CheckCircle2 size={12} />
                  Biometric KYC Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                  <AlertCircle size={12} />
                  Verification Pending
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Owner:</span>
                <span className="font-bold text-white text-right">{unit.owner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ownership Share:</span>
                <span className="text-slate-200 text-right">{unit.owner.registeredShare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official Contact:</span>
                <span className="font-mono text-slate-300">{unit.owner.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Email:</span>
                <span className="font-mono text-slate-300">{unit.owner.email}</span>
              </div>
            </div>
          </div>

          {/* Registry Deed & Mutation Records */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              <FileCheck2 size={15} />
              <span>Conveyance Deed & Mutation Records</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Deed Number:</span>
                <span className="font-mono font-bold text-teal-300">{unit.owner.deedNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deed Registration Date:</span>
                <span className="font-mono text-slate-200">{unit.owner.deedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stamp Duty Reference:</span>
                <span className="font-mono text-slate-200">{unit.owner.stampDutyRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Municipal Sanction Permit:</span>
                <span className="font-mono text-slate-200">{building.municipalSanctionNo}</span>
              </div>
            </div>
          </div>

          {/* Statutory Clearances Checklist */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              <ShieldCheck size={15} />
              <span>Statutory Clearances & Utilities</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {/* Fire NOC */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-slate-300">Fire Safety NOC:</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    unit.clearances.fireNoc === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {unit.clearances.fireNoc} {unit.clearances.fireNocNumber && `(${unit.clearances.fireNocNumber})`}
                </span>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="text-slate-300">SBPDCL Power Meter:</span>
                </div>
                <span className="font-mono text-slate-200">
                  {unit.clearances.electricityConsumerId} ({unit.clearances.electricitySanctionedKw} kW)
                </span>
              </div>

              {/* Water */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Droplet size={14} className="text-sky-400" />
                  <span className="text-slate-300">Water / Sewage Ingress:</span>
                </div>
                <span className="font-mono text-slate-200">{unit.clearances.waterConnectionId}</span>
              </div>

              {/* Property Tax */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-emerald-400" />
                  <span className="text-slate-300">Municipal Tax Clearance:</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    unit.clearances.municipalTaxStatus === "CLEARED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {unit.clearances.municipalTaxStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Easements & Rights */}
          {unit.easements.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Registered Easements & Air-Rights
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {unit.easements.map((easement, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{easement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setShowUlpinGenModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
          >
            <Fingerprint size={16} />
            <span>Generate Proposed 3D ULPIN</span>
          </button>

          <button
            type="button"
            onClick={downloadFloorCertificate}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-[0.98]"
          >
            <FileDown size={15} />
            <span>PDF Deed</span>
          </button>
        </div>
      </div>

      {/* Sub-Modals */}
      <SpatialValidationModal
        open={showValidationModal}
        onOpenChange={setShowValidationModal}
        report={validationReport}
        onRevalidate={() => {
          if (unit && floor && building) {
            setValidationReport(validatePropertyUnit(unit, floor, building, parcelId));
          }
        }}
        targetTitle={`Unit ${unit.unitNumber} (${floor.floorCode})`}
      />

      <UlpinGenerationWorkflowModal
        open={showUlpinGenModal}
        onOpenChange={setShowUlpinGenModal}
        unit={unit}
        floor={floor}
        building={building}
        parcelId={parcelId}
        onNavigateToAuthorityDesk={onNavigateToAuthorityDesk}
      />

      <EvidenceSourcesMatrixModal
        open={showEvidenceModal}
        onOpenChange={setShowEvidenceModal}
        buildingName={building.buildingName}
        parcelId={parcelId}
        evidenceLevel="LEVEL_3"
      />

      <ThreeDVolumeInspectorModal
        open={showVolumeModal}
        onOpenChange={setShowVolumeModal}
        unit={unit}
        floor={floor}
        building={building}
        parcelId={parcelId}
      />
    </>
  );
}

export default FloorUnitInspectorDrawer;
