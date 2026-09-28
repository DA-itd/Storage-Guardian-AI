import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Eye, 
  CheckSquare, 
  Square, 
  Filter, 
  Bot, 
  Globe, 
  Film, 
  Laptop, 
  Folder, 
  AlertCircle,
  Clock,
  HardDrive,
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import { StorageItem, SafetyLevel, ScanCategory, DiskSpaceInfo } from '../types/storage';
import { formatBytes, getSafetyBadge } from '../services/storageScanner';

interface IntelligentScannerProps {
  items: StorageItem[];
  diskInfo: DiskSpaceInfo;
  isScanning: boolean;
  onRefreshScan: () => void;
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectBySafety: (safety: SafetyLevel) => void;
  onOpenSimulation: () => void;
  onExecuteCleaning: (selectedIds: string[], freedBytes: number) => void;
}

export const IntelligentScanner: React.FC<IntelligentScannerProps> = ({
  items,
  diskInfo,
  isScanning,
  onRefreshScan,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  onSelectBySafety,
  onOpenSimulation,
  onExecuteCleaning
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [safetyFilter, setSafetyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCleaningProgress, setIsCleaningProgress] = useState<boolean>(false);
  const [cleaningPercent, setCleaningPercent] = useState<number>(0);
  const [cleanedResult, setCleanedResult] = useState<{ count: number; bytes: number } | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSafety = safetyFilter === 'all' || item.safety === safetyFilter;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSafety && matchesSearch;
  });

  const selectedItems = items.filter((i) => i.isSelected);
  const selectedBytes = selectedItems.reduce((acc, i) => acc + i.sizeBytes, 0);
  const totalRecoverableSafeBytes = items
    .filter((i) => i.safety === 'very_safe' || i.safety === 'safe')
    .reduce((acc, i) => acc + i.sizeBytes, 0);

  const handleCleanNow = () => {
    if (selectedItems.length === 0) return;
    setIsCleaningProgress(true);
    setCleaningPercent(10);

    const interval = setInterval(() => {
      setCleaningPercent((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const freed = selectedBytes;
            const count = selectedItems.length;
            onExecuteCleaning(selectedItems.map(i => i.id), freed);
            setIsCleaningProgress(false);
            setCleanedResult({ count, bytes: freed });
            setTimeout(() => setCleanedResult(null), 6000);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const categories = [
    { id: 'all', label: 'Todas las Categorías', icon: Sparkles },
    { id: 'ai_models', label: 'Inteligencia Artificial', icon: Bot },
    { id: 'browsers', label: 'Navegadores Web', icon: Globe },
    { id: 'video_media', label: 'Edición de Video', icon: Film },
    { id: 'macos_system', label: 'macOS & Cachés', icon: Laptop }
  ];

  const safetyFilters = [
    { id: 'all', label: 'Todos los niveles' },
    { id: 'very_safe', label: 'Muy seguro de limpiar' },
    { id: 'safe', label: 'Seguro de limpiar' },
    { id: 'review_needed', label: 'Requiere revisión' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Controls & Category Tabs */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Escáner Inteligente de Almacenamiento</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Detección precisa de modelos de IA, temporales de video, optimizaciones de navegador y fondos 4K.
            </p>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filtrar por app, ruta o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs bg-neutral-800/90 border border-neutral-700/60 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 w-64"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Filters: Safety Classification */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px]">Nivel de Seguridad:</span>
            <div className="flex items-center gap-1">
              {safetyFilters.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSafetyFilter(s.id)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    safetyFilter === s.id
                      ? 'bg-neutral-700 text-neutral-100 font-medium'
                      : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onSelectAll}
              className="text-neutral-400 hover:text-neutral-200 text-[11px] transition-colors"
            >
              Seleccionar todo
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={onDeselectAll}
              className="text-neutral-400 hover:text-neutral-200 text-[11px] transition-colors"
            >
              Deseleccionar
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={() => onSelectBySafety('very_safe')}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] transition-colors"
            >
              Solo muy seguros
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification after clean */}
      {cleanedResult && (
        <div className="mx-4 my-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Limpieza exitosa: Se liberaron <strong className="font-mono">{formatBytes(cleanedResult.bytes)}</strong> eliminando {cleanedResult.count} elementos sin tocar proyectos protegidos.
            </span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">Espacio recuperado</span>
        </div>
      )}

      {/* Item List View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Folder className="w-8 h-8 text-neutral-600" />
            <div className="text-xs font-medium text-neutral-300">No se encontraron elementos</div>
            <div className="text-[11px] text-neutral-400 max-w-sm">
              No hay carpetas temporales que coincidan con los filtros aplicados.
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const badge = getSafetyBadge(item.safety);
            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.isSelected
                    ? 'bg-neutral-800/60 border-neutral-700/80 shadow-sm'
                    : 'bg-neutral-900/40 border-neutral-800/60 hover:border-neutral-700/60'
                }`}
              >
                {/* Left: Checkbox + App & Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleItem(item.id);
                    }}
                    className="mt-0.5 text-neutral-400 hover:text-cyan-400 transition-colors shrink-0"
                  >
                    {item.isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.app}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                      {item.path}
                    </div>

                    <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Right: Size, Safety Badge & Details */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="space-y-1">
                    <div className="text-sm font-bold font-mono tabular-nums text-neutral-100">
                      {formatBytes(item.sizeBytes)}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {item.fileCount} archivos
                    </div>
                  </div>

                  {/* Safety Indicator */}
                  <div className="w-36 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded border inline-block ${badge.color}`}>
                      {badge.label}
                    </span>
                    {item.metadata?.unusedDays && (
                      <div className="text-[10px] text-neutral-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Sin uso: {item.metadata.unusedDays}d</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cleaning Progress Overlay */}
      {isCleaningProgress && (
        <div className="p-4 bg-neutral-900 border-t border-cyan-500/40 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-medium">Purgando elementos seleccionados de forma segura...</span>
            <span className="text-cyan-400 font-mono">{cleaningPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-150"
              style={{ width: `${cleaningPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 text-xs text-neutral-300">
          <div>
            <span>Seleccionados: </span>
            <strong className="text-neutral-100 font-mono">{selectedItems.length}</strong> de {items.length}
          </div>
          <span className="text-neutral-600">·</span>
          <div>
            <span>Espacio a recuperar: </span>
            <strong className="text-cyan-300 font-mono text-sm">{formatBytes(selectedBytes)}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Dry Run Button */}
          <button
            onClick={onOpenSimulation}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span>Simulación previa</span>
          </button>

          {/* Clean Selected Button */}
          <button
            onClick={handleCleanNow}
            disabled={selectedItems.length === 0 || isCleaningProgress}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar Seleccionados ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
