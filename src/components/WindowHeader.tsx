import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DiskSpaceInfo } from '../types/storage';
import { formatBytes } from '../services/storageScanner';

interface WindowHeaderProps {
  diskInfo: DiskSpaceInfo;
  isScanning: boolean;
  onRefreshScan: () => void;
  onOpenEmergency: () => void;
  onResetDemo?: () => void;
  recoverableBytes: number;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  diskInfo,
  isScanning,
  onRefreshScan,
  onOpenEmergency,
  recoverableBytes
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-900/90 backdrop-blur-md shrink-0">
      {/* Top Title Bar with macOS Traffic Lights */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 group">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 group-hover:opacity-80 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 group-hover:opacity-80 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 group-hover:opacity-80 transition-opacity" />
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

          {/* Window Title */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-100 tracking-tight">Storage Guardian AI</span>
            <span className="text-xs text-neutral-400 font-mono">macOS Sequoia / Silicon</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Modo Real Activo
            </span>
          </div>
        </div>

        {/* Global Quick Action Affordances */}
        <div className="flex items-center gap-2">
          {diskInfo.isEmergency && (
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-200 bg-amber-500/15 border border-amber-500/30 rounded-md hover:bg-amber-500/25 transition-colors animate-pulse"
              title="Abrir asistente de rescate de almacenamiento"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Rescate Urgente</span>
            </button>
          )}

          <button
            onClick={onRefreshScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors disabled:opacity-50"
            title="Escanear en tiempo real carpetas de IA, navegadores y video"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Escaneando disco...' : 'Escanear Ahora'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner (Shown prominently when disk space is below emergency threshold) */}
      {diskInfo.isEmergency && (
        <div className="bg-gradient-to-r from-red-950/60 via-amber-950/40 to-neutral-900 border-t border-b border-amber-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-amber-200 flex items-center gap-2">
                <span>Alerta Crítica de Almacenamiento: Solo {formatBytes(diskInfo.freeBytes)} libres en Macintosh HD</span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-300 text-[11px]">macOS requiere al menos 35 GB para instalar actualizaciones</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Se detectaron {formatBytes(recoverableBytes)} de cachés y modelos recuperables de forma 100% segura.
              </div>
            </div>
          </div>

          <button
            onClick={onOpenEmergency}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            Iniciar Recuperación de Emergencia
          </button>
        </div>
      )}
    </header>
  );
};
