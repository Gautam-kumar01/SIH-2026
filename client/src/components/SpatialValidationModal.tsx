/**
 * Spatial & Topology Validation Modal / Diagnostic Suite
 * SIH 2026 — PS26011: 3D ULPIN Generation / Vertical Property Mapping
 *
 * Evaluates the 9 core cadastral topology rules:
 * - Polygon Closure & Boundary Validity
 * - Building Inside Parcel Containment
 * - Floor Volume Inside Building Envelope
 * - Unit Volume Inside Floor Slab
 * - Unit Identifier Uniqueness
 * - 3D Volumetric Disjointness / Non-Overlap
 * - Vertical Height Vector Validity
 * - Floor Vertical Continuity
 * - Mandatory Cadastral Attributes
 */

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Box,
  Compass,
  FileCheck,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CadastralValidationReport, ValidationRuleResult } from "@shared/spatialTopologyValidator";

interface SpatialValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CadastralValidationReport | null;
  onRevalidate?: () => void;
  targetTitle?: string;
}

export const SpatialValidationModal: React.FC<SpatialValidationModalProps> = ({
  open,
  onOpenChange,
  report,
  onRevalidate,
  targetTitle = "Selected Cadastral Entity",
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isValidating, setIsValidating] = useState(false);

  const handleRunRevalidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      onRevalidate?.();
      setIsValidating(false);
    }, 600);
  };

  if (!report) return null;

  const filteredRules =
    filterCategory === "ALL"
      ? report.rules
      : report.rules.filter((r) => r.category === filterCategory);

  const getStatusBadge = (status: CadastralValidationReport["overallStatus"]) => {
    switch (status) {
      case "VALID":
        return (
          <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2.5 py-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VALID & COMPLIANT
          </Badge>
        );
      case "WARNINGS_FOUND":
      case "NEEDS_REVIEW":
        return (
          <Badge className="bg-amber-950/80 text-amber-400 border border-amber-700/60 px-2.5 py-1 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> WARNINGS DETECTED · REVIEW REQUIRED
          </Badge>
        );
      case "INVALID":
        return (
          <Badge className="bg-rose-950/80 text-rose-400 border border-rose-700/60 px-2.5 py-1 text-xs">
            <XCircle className="w-3.5 h-3.5 mr-1" /> TOPOLOGY CONFLICT · INVALID
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRuleIcon = (status: ValidationRuleResult["status"]) => {
    switch (status) {
      case "PASS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "ERROR":
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  3D Spatial & Topology Validation
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Target: <span className="font-mono text-slate-200">{targetTitle}</span> ({report.targetType})
                </DialogDescription>
              </div>
            </div>
            <div>{getStatusBadge(report.overallStatus)}</div>
          </div>
        </DialogHeader>

        {/* Diagnostic KPI Strip */}
        <div className="grid grid-cols-4 gap-2 my-2">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Rules</div>
            <div className="text-base font-bold font-mono text-slate-200">{report.totalRulesChecked}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-center">
            <div className="text-[10px] uppercase font-mono text-emerald-400">Passed</div>
            <div className="text-base font-bold font-mono text-emerald-300">{report.passedCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-center">
            <div className="text-[10px] uppercase font-mono text-amber-400">Warnings</div>
            <div className="text-base font-bold font-mono text-amber-300">{report.warningCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-center">
            <div className="text-[10px] uppercase font-mono text-rose-400">Errors</div>
            <div className="text-base font-bold font-mono text-rose-300">{report.errorCount}</div>
          </div>
        </div>

        {/* Volumetric Summary if available */}
        {report.volumetricMetrics && (
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-400">Volume:</span>{" "}
              <span className="text-teal-300 font-semibold">{report.volumetricMetrics.volumeCuM} m³</span>
            </div>
            <div>
              <span className="text-slate-400">Carpet:</span>{" "}
              <span className="text-slate-200 font-semibold">{report.volumetricMetrics.carpetAreaSqM} m²</span>
            </div>
            <div>
              <span className="text-slate-400">Height (ΔZ):</span>{" "}
              <span className="text-cyan-300 font-semibold">{report.volumetricMetrics.heightM} m</span>
            </div>
            <div>
              <span className="text-slate-400">Z-Span:</span>{" "}
              <span className="text-slate-300">
                {report.volumetricMetrics.zMinM.toFixed(1)}m → {report.volumetricMetrics.zMaxM.toFixed(1)}m
              </span>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["ALL", "GEOMETRY", "CONTAINMENT", "TOPOLOGY", "VOLUMETRIC", "ATTRIBUTES"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                filterCategory === cat
                  ? "bg-teal-500/20 border border-teal-500/50 text-teal-300"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rule Results List */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {filteredRules.map((rule) => (
            <div
              key={rule.ruleId}
              className={`p-3 rounded-lg border text-xs transition-colors ${
                rule.status === "PASS"
                  ? "bg-slate-900/40 border-slate-800/80"
                  : rule.status === "WARNING"
                  ? "bg-amber-950/20 border-amber-800/50"
                  : "bg-rose-950/20 border-rose-800/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {getRuleIcon(rule.status)}
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      {rule.ruleName}
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{rule.message}</p>
                    {rule.remedialAction && (
                      <div className="mt-1.5 text-[11px] text-amber-300/90 font-mono flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        Action: {rule.remedialAction}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                    rule.status === "PASS"
                      ? "text-emerald-400 bg-emerald-950/80 border border-emerald-800/60"
                      : rule.status === "WARNING"
                      ? "text-amber-400 bg-amber-950/80 border border-amber-800/60"
                      : "text-rose-400 bg-rose-950/80 border border-rose-800/60"
                  }`}
                >
                  {rule.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 font-mono">
            Validated at {new Date(report.timestamp).toLocaleTimeString()} · ISO 19152 LADM / OGC 3D Cadastre
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isValidating}
              onClick={handleRunRevalidation}
              className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isValidating ? "animate-spin text-teal-400" : ""}`} />
              Re-run Validation
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
