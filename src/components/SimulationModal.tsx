import React from 'react';
import { 
  Eye, 
  X, 
  Trash2, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle,
  HardDrive,
  CheckCircle2,
  Folder
} from 'lucide-react';
import { StorageItem, DiskSpaceInfo } from '../types/storage';
import { formatBytes, simulateCleaning } from '../services/storageScanner';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StorageItem[];
  diskInfo: DiskSpaceInfo;
  onConfirmClean: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  items,
  diskInfo,
  onConfirmClean
}) => {
  if (!isOpen) return null;

  const simResult = simulateCleaning(items, diskInfo);
  const currentFreeGB = diskInfo.freeBytes / (1024 * 1024 * 1024);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Simulación Previa de Limpieza (Dry Run)
              </h2>
              <p className="text-[11px] text-neutral-400">
                Ningún archivo ha sido modificado o eliminado todavía.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Free Space Delta Banner */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-neutral-400">Espacio Libre Proyectado</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-neutral-300">
                  {currentFreeGB.toFixed(1)} GB
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-base font-bold text-emerald-400">
                  {simResult.estimatedDiskFreeAfterGB.toFixed(1)} GB
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-neutral-400">Total a Liberar</div>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
                +{simResult.estimatedFreedGB.toFixed(1)} GB
              </div>
            </div>
          </div>

          {/* Breakdown by Safety Level */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-300">
              Desglose de Seguridad de los Elementos Seleccionados:
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-300">Muy seguro de limpiar</div>
                  <div className="text-[11px] text-neutral-400">Caché, logs, temporales, CapCut SmartCrop</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-200">
                    {formatBytes(simResult.itemsBySafety.very_safe.bytes)}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {simResult.itemsBySafety.very_safe.count} elementos
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sky-300">Seguro de limpiar</div>
                  <div className="text-[11px] text-neutral-400">Modelos IA inactivos, fondos aéreos 4K</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-sky-200">
                    {formatBytes(simResult.itemsBySafety.safe.bytes)}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {simResult.itemsBySafety.safe.count} elementos
                  </div>
                </div>
              </div>

              {simResult.itemsBySafety.review_needed.count > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-amber-300">Requiere revisión</div>
                    <div className="text-[11px] text-neutral-400">Descargas o videos temporales</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-amber-200">
                      {formatBytes(simResult.itemsBySafety.review_needed.bytes)}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {simResult.itemsBySafety.review_needed.count} elementos
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apps Impacted */}
          <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-1.5">
            <div className="text-xs font-semibold text-neutral-300">
              Aplicaciones Afectadas:
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {simResult.appsAffected.map((app) => (
                <span
                  key={app}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Guarantee */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {simResult.protectedSkippedCount} carpetas protegidas (Git, Xcode, Documentos, Fotos) resguardadas.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              onClose();
              onConfirmClean();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirmar y Ejecutar Limpieza</span>
          </button>
        </div>
      </div>
    </div>
  );
};
