import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  ArrowRight,
  Info,
  Trash2,
  Sliders
} from 'lucide-react';
import { DiskSpaceInfo, StorageItem } from '../types/storage';
import { formatBytes, generateEmergencyRescuePlan } from '../services/storageScanner';

interface EmergencyRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  diskInfo: DiskSpaceInfo;
  items: StorageItem[];
  onExecuteRescue: (itemIds: string[], freedBytes: number) => void;
  onUpdateThreshold: (newThresholdGB: number) => void;
}

export const EmergencyRescueModal: React.FC<EmergencyRescueModalProps> = ({
  isOpen,
  onClose,
  diskInfo,
  items,
  onExecuteRescue,
  onUpdateThreshold
}) => {
  if (!isOpen) return null;

  const [selectedPhases, setSelectedPhases] = useState<number[]>([1, 2]);
  const [targetFreeGB, setTargetFreeGB] = useState<number>(40);
  const [isRescuing, setIsRescuing] = useState<boolean>(false);
  const [rescueProgress, setRescueProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [freedResult, setFreedResult] = useState<number>(0);

  const plan = generateEmergencyRescuePlan(diskInfo, items, targetFreeGB);

  const togglePhase = (phase: number) => {
    if (selectedPhases.includes(phase)) {
      setSelectedPhases(selectedPhases.filter((p) => p !== phase));
    } else {
      setSelectedPhases([...selectedPhases, phase]);
    }
  };

  // Calculate selected recoverable bytes
  const selectedItemsToClean = plan.steps
    .filter((step) => selectedPhases.includes(step.phase))
    .flatMap((step) => step.items);

  const selectedBytesToClean = selectedItemsToClean.reduce((acc, i) => acc + i.sizeBytes, 0);
  const projectedFreeGB = (diskInfo.freeBytes + selectedBytesToClean) / (1024 * 1024 * 1024);

  const handleStartRescue = () => {
    setIsRescuing(true);
    setRescueProgress(15);

    const interval = setInterval(() => {
      setRescueProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const freed = selectedBytesToClean;
            onExecuteRescue(selectedItemsToClean.map(i => i.id), freed);
            setIsRescuing(false);
            setFreedResult(freed);
            setIsSuccess(true);
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 bg-gradient-to-r from-red-950/40 via-amber-950/20 to-neutral-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <span>Protocolo de Recuperación de Emergencia</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Umbral &lt;15 GB
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Libera espacio masivo inmediato para permitir actualizaciones de macOS sin tocar datos personales.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Success State */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100">
                  ¡Emergencia Resuelta con Éxito!
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Se han liberado con éxito <strong className="text-emerald-400 font-mono text-sm">{formatBytes(freedResult)}</strong>. El disco ahora tiene espacio suficiente para instalar la actualización de macOS Sequoia y operar fluidamente.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 max-w-sm mx-auto flex items-center justify-between text-xs">
                <span className="text-neutral-400">Nuevo espacio libre estimado:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {projectedFreeGB.toFixed(1)} GB libres
                </span>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-lg transition-colors"
              >
                Volver al Panel
              </button>
            </div>
          ) : (
            <>
              {/* Emergency Status Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                <div>
                  <div className="text-neutral-400 text-[11px]">Espacio Libre Actual</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                    {plan.currentFreeGB.toFixed(1)} GB
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[11px]">Objetivo Sugerido</div>
                  <div className="text-base font-bold font-mono text-neutral-200 mt-0.5">
                    {targetFreeGB} GB
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[11px]">Déficit a Recuperar</div>
                  <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                    +{plan.neededRecoveryGB.toFixed(1)} GB
                  </div>
                </div>
              </div>

              {/* Step-by-Step Triage Options */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-neutral-300">
                  Plan de Acción Priorizado por Seguridad y Tamaño:
                </div>

                {plan.steps.map((step) => {
                  const isChecked = selectedPhases.includes(step.phase);
                  return (
                    <div
                      key={step.phase}
                      onClick={() => togglePhase(step.phase)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-neutral-800/80 border-cyan-500/40 shadow-sm'
                          : 'bg-neutral-900/40 border-neutral-800/70 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className="mt-1 accent-cyan-500"
                          />
                          <div>
                            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
                              <span>{step.title}</span>
                              {step.phase === 1 && (
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                            <div className="text-[10px] text-neutral-400 font-mono mt-1.5">
                              {step.items.length} carpetas identificadas
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono tabular-nums text-cyan-300">
                            +{formatBytes(step.recoverableBytes)}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {step.safety === 'very_safe' ? '0% riesgo' : 'Seguro'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Projection Card */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Proyección posterior al rescate:</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-amber-400">{plan.currentFreeGB.toFixed(1)} GB</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-emerald-400 font-bold">{projectedFreeGB.toFixed(1)} GB libres</span>
                </div>
              </div>

              {/* Progress Bar during execution */}
              {isRescuing && (
                <div className="p-4 bg-neutral-950 rounded-xl border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-300 font-medium">Ejecutando purga acelerada...</span>
                    <span className="font-mono text-cyan-400">{rescueProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-150"
                      style={{ width: `${rescueProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isRescuing}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleStartRescue}
              disabled={selectedBytesToClean === 0 || isRescuing}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Ejecutar Rescate Inmediato ({formatBytes(selectedBytesToClean)})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
