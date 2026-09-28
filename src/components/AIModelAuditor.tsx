import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Copy, 
  Clock, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HardDrive,
  FileCode,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { AIModelItem } from '../types/storage';
import { formatBytes } from '../services/storageScanner';

interface AIModelAuditorProps {
  models: AIModelItem[];
  onToggleModel: (id: string) => void;
  onPruneSelectedModels: (modelIds: string[], freedBytes: number) => void;
}

export const AIModelAuditor: React.FC<AIModelAuditorProps> = ({
  models,
  onToggleModel,
  onPruneSelectedModels
}) => {
  const [filterType, setFilterType] = useState<'all' | 'duplicates' | 'stale'>('all');
  const [prunedMessage, setPrunedMessage] = useState<string | null>(null);

  // Stats calculation
  const totalModelBytes = models.reduce((acc, m) => acc + m.sizeBytes, 0);
  const duplicateModels = models.filter((m) => m.isDuplicate);
  const staleModels = models.filter((m) => m.lastUsedDaysAgo >= 90);
  
  const filteredModels = models.filter((m) => {
    if (filterType === 'duplicates') return m.isDuplicate;
    if (filterType === 'stale') return m.lastUsedDaysAgo >= 90;
    return true;
  });

  const selectedModels = models.filter((m) => m.isSelected);
  const selectedBytes = selectedModels.reduce((acc, m) => acc + m.sizeBytes, 0);

  const handlePrune = () => {
    if (selectedModels.length === 0) return;
    const ids = selectedModels.map((m) => m.id);
    const bytes = selectedBytes;
    onPruneSelectedModels(ids, bytes);
    setPrunedMessage(`Se eliminaron con éxito ${ids.length} modelos de IA liberando ${formatBytes(bytes)}.`);
    setTimeout(() => setPrunedMessage(null), 5000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header and Summary */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h1 className="text-base font-semibold text-neutral-100">
              Auditor y Gestor de Modelos de IA
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Detección de pesos pesados locales (GGUF, safetensors), copias duplicadas entre apps y modelos sin inferencia en &gt;90 días.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/60">
            <div className="text-neutral-400 text-[11px]">Espacio Total en Modelos</div>
            <div className="text-lg font-bold font-mono text-purple-300 mt-0.5">
              {formatBytes(totalModelBytes)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{models.length} modelos indexados</div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/60">
            <div className="text-neutral-400 text-[11px]">Modelos Inactivos (&gt;90d)</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
              {staleModels.length} modelos
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {formatBytes(staleModels.reduce((acc, m) => acc + m.sizeBytes, 0))} sin usar
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/60">
            <div className="text-neutral-400 text-[11px]">Modelos Duplicados</div>
            <div className="text-lg font-bold font-mono text-sky-300 mt-0.5">
              {duplicateModels.length} copias
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {formatBytes(duplicateModels.reduce((acc, m) => acc + m.sizeBytes, 0))} redundantes
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-800/60 to-purple-950/20 border border-purple-500/30">
            <div className="text-purple-300 text-[11px] font-medium">Recuperable Seleccionado</div>
            <div className="text-lg font-bold font-mono text-purple-200 mt-0.5">
              {formatBytes(selectedBytes)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{selectedModels.length} seleccionados</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-neutral-800 text-purple-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todos ({models.length})
          </button>
          <button
            onClick={() => setFilterType('stale')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filterType === 'stale'
                ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Inactivos &gt;90 días ({staleModels.length})
          </button>
          <button
            onClick={() => setFilterType('duplicates')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filterType === 'duplicates'
                ? 'bg-neutral-800 text-sky-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Duplicados ({duplicateModels.length})
          </button>
        </div>
      </div>

      {/* Pruned Message Banner */}
      {prunedMessage && (
        <div className="mx-4 my-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{prunedMessage}</span>
        </div>
      )}

      {/* Model Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onToggleModel(model.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              model.isSelected
                ? 'bg-neutral-800/80 border-purple-500/40 shadow-sm'
                : 'bg-neutral-900/40 border-neutral-800/70 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Checkbox and Model Title */}
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleModel(model.id);
                  }}
                  className="mt-0.5 text-neutral-400 hover:text-purple-400 transition-colors shrink-0"
                >
                  {model.isSelected ? (
                    <CheckSquare className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-600" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-100 font-mono">
                      {model.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {model.format}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {model.parameterSize}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      vía {model.app}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 truncate mt-1">
                    {model.path}
                  </div>

                  {/* Recommendation Callout */}
                  <div className="mt-2 text-xs text-neutral-300 bg-neutral-950/60 border border-neutral-800/80 p-2.5 rounded-lg flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">
                      {model.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Size & Inactivity */}
              <div className="text-right shrink-0 space-y-1">
                <div className="text-base font-bold font-mono text-neutral-100 tabular-nums">
                  {formatBytes(model.sizeBytes)}
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>Último uso: {model.lastUsedDaysAgo}d</span>
                </div>
                {model.isDuplicate && (
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Copia redundante
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between shrink-0">
        <div className="text-xs text-neutral-300">
          <span>Modelos seleccionados: </span>
          <strong className="text-purple-300 font-mono">{selectedModels.length}</strong> de {models.length}
          <span className="mx-2 text-neutral-600">·</span>
          <span>Liberación proyectada: </span>
          <strong className="text-neutral-100 font-mono text-sm">{formatBytes(selectedBytes)}</strong>
        </div>

        <button
          onClick={handlePrune}
          disabled={selectedModels.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purgar Modelos Seleccionados ({formatBytes(selectedBytes)})</span>
        </button>
      </div>
    </div>
  );
};
