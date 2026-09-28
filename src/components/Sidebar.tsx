import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Cpu, 
  BarChart3, 
  Clock, 
  ShieldCheck, 
  HardDrive,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { DiskSpaceInfo } from '../types/storage';
import { formatBytes } from '../services/storageScanner';

export type NavTab = 'dashboard' | 'scan' | 'models' | 'reports' | 'launchd' | 'protection';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  diskInfo: DiskSpaceInfo;
  pendingItemsCount: number;
  aiModelsCount: number;
  onOpenEmergency: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  diskInfo,
  pendingItemsCount,
  aiModelsCount,
  onOpenEmergency
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'scan' as NavTab,
      label: 'Escaneo Inteligente',
      icon: Sparkles,
      badge: pendingItemsCount > 0 ? `${pendingItemsCount}` : null
    },
    {
      id: 'models' as NavTab,
      label: 'Auditoría Modelos IA',
      icon: Cpu,
      badge: `${aiModelsCount}`
    },
    {
      id: 'reports' as NavTab,
      label: 'Top 50 y Reportes',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'launchd' as NavTab,
      label: 'Programación launchd',
      icon: Clock,
      badge: 'Daemon'
    },
    {
      id: 'protection' as NavTab,
      label: 'Protección de Datos',
      icon: ShieldCheck,
      badge: '8 reglas'
    }
  ];

  const freeGB = diskInfo.freeBytes / (1024 * 1024 * 1024);
  const totalGB = diskInfo.totalBytes / (1024 * 1024 * 1024);
  const usedPercent = diskInfo.usedPercent;

  return (
    <aside className="w-64 bg-neutral-900/60 border-r border-neutral-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Navegación
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Disk Space Status Widget */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/40">
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
              <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
              <span>Disco Macintosh HD</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-neutral-400">
              {usedPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                diskInfo.isEmergency
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums font-mono">
            <span>Libre: {formatBytes(diskInfo.freeBytes)}</span>
            <span>Total: {Math.round(totalGB)} GB</span>
          </div>

          {diskInfo.isEmergency ? (
            <button
              onClick={onOpenEmergency}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-md text-[11px] font-medium transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Recuperación urgente</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Espacio saludable</span>
            </div>
          )}
        </div>

        <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-neutral-400">
          <span>macOS 15.3 APFS</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
