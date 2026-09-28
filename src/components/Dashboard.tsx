import React, { useState } from 'react';
import { 
  HardDrive, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  ShieldCheck,
  Bot,
  Globe,
  Film,
  Laptop
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  DiskSpaceInfo, 
  StorageItem, 
  DailyGrowthPoint, 
  ScanCategory 
} from '../types/storage';
import { 
  formatBytes, 
  INITIAL_GROWTH_HISTORY, 
  INITIAL_MONTHLY_GROWTH 
} from '../services/storageScanner';

interface DashboardProps {
  diskInfo: DiskSpaceInfo;
  items: StorageItem[];
  onNavigateToScan: () => void;
  onOpenEmergency: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  diskInfo,
  items,
  onNavigateToScan,
  onOpenEmergency,
  onNavigateToTab
}) => {
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  const usedGB = diskInfo.usedBytes / (1024 * 1024 * 1024);
  const freeGB = diskInfo.freeBytes / (1024 * 1024 * 1024);
  const totalGB = diskInfo.totalBytes / (1024 * 1024 * 1024);

  // Group items by category to calculate recoverable space
  const categoryStats = {
    ai_models: {
      label: 'Modelos de IA',
      icon: Bot,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      bytes: items.filter(i => i.category === 'ai_models').reduce((acc, i) => acc + i.sizeBytes, 0),
      recoverable: items.filter(i => i.category === 'ai_models' && (i.safety === 'very_safe' || i.safety === 'safe')).reduce((acc, i) => acc + i.sizeBytes, 0)
    },
    browsers: {
      label: 'Navegadores',
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      bytes: items.filter(i => i.category === 'browsers').reduce((acc, i) => acc + i.sizeBytes, 0),
      recoverable: items.filter(i => i.category === 'browsers' && (i.safety === 'very_safe' || i.safety === 'safe')).reduce((acc, i) => acc + i.sizeBytes, 0)
    },
    video_media: {
      label: 'Edición de Video',
      icon: Film,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      bytes: items.filter(i => i.category === 'video_media').reduce((acc, i) => acc + i.sizeBytes, 0),
      recoverable: items.filter(i => i.category === 'video_media' && (i.safety === 'very_safe' || i.safety === 'safe')).reduce((acc, i) => acc + i.sizeBytes, 0)
    },
    macos_system: {
      label: 'macOS & Fondos Aéreos',
      icon: Laptop,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      bytes: items.filter(i => i.category === 'macos_system').reduce((acc, i) => acc + i.sizeBytes, 0),
      recoverable: items.filter(i => i.category === 'macos_system' && (i.safety === 'very_safe' || i.safety === 'safe')).reduce((acc, i) => acc + i.sizeBytes, 0)
    }
  };

  const totalRecoverableBytes = Object.values(categoryStats).reduce((acc, c) => acc + c.recoverable, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
            Panel de Estado de Almacenamiento
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitoreo en tiempo real de disco APFS, modelos de IA y cachés acumuladas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {diskInfo.isEmergency && (
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Recuperación de Emergencia</span>
            </button>
          )}

          <button
            onClick={onNavigateToScan}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 text-xs font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explorar Escaneo</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Disk */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Capacidad Total</span>
            <HardDrive className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
            {Math.round(totalGB)} <span className="text-sm font-normal text-neutral-400">GB</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Apple SSD · Formato APFS
          </div>
        </div>

        {/* Used Space */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Espacio Ocupado</span>
            <span className="text-xs font-mono tabular-nums text-neutral-400">{diskInfo.usedPercent}%</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
            {usedGB.toFixed(1)} <span className="text-sm font-normal text-neutral-400">GB</span>
          </div>
          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${diskInfo.isEmergency ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${diskInfo.usedPercent}%` }}
            />
          </div>
        </div>

        {/* Free Space */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          diskInfo.isEmergency
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-neutral-900/60 border-neutral-800/80'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={diskInfo.isEmergency ? 'text-amber-300 font-medium' : 'text-neutral-400'}>
              Espacio Libre
            </span>
            {diskInfo.isEmergency ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${
            diskInfo.isEmergency ? 'text-amber-200' : 'text-emerald-400'
          }`}>
            {freeGB.toFixed(1)} <span className="text-sm font-normal">GB</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            {diskInfo.isEmergency
              ? 'Por debajo del umbral de 15 GB'
              : 'Espacio adecuado para el sistema'}
          </div>
        </div>

        {/* Estimated Recoverable */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900/90 to-cyan-950/20 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="text-cyan-300 font-medium">Recuperable Seguro</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-200">
            {(totalRecoverableBytes / (1024 * 1024 * 1024)).toFixed(1)} <span className="text-sm font-normal text-cyan-400">GB</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Listo para liberar sin tocar proyectos
          </div>
        </div>
      </div>

      {/* Emergency Alert Card if Critical */}
      {diskInfo.isEmergency && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-amber-950/20 to-neutral-900 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Alerta de Actualización de macOS — Espacio Libre Crítico
              </h3>
              <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                El sistema detectó que solo quedan {freeGB.toFixed(1)} GB libres. Las actualizaciones importantes de macOS (como Sequoia 15.x) requieren al menos 35 GB libres para descargar y preparar la imagen APFS sin riesgo de bloqueo.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenEmergency}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Abrir Plan de Rescate
          </button>
        </div>
      )}

      {/* Growth Charts Section */}
      <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-neutral-100">
                Historial de Crecimiento de Almacenamiento
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tendencia de acumulación de cachés y modelos por día y mes.
            </p>
          </div>

          {/* Segmented Tab Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-800/80 rounded-lg border border-neutral-700/60 self-start sm:self-auto">
            <button
              onClick={() => setChartView('weekly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartView === 'weekly'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Semanal (7 días)
            </button>
            <button
              onClick={() => setChartView('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartView === 'monthly'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Mensual (6 meses)
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 w-full pt-2">
          {chartView === 'weekly' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INITIAL_GROWTH_HISTORY}>
                <defs>
                  <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="dayLabel" 
                  stroke="#737373" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[440, 510]}
                  unit=" GB"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f5f5f5'
                  }}
                  formatter={(value: any) => [`${value} GB`, 'Espacio Usado']}
                />
                <Area 
                  type="monotone" 
                  dataKey="usedGB" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#usedGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INITIAL_MONTHLY_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#737373" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 520]}
                  unit=" GB"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f5f5f5'
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} GB`, 
                    name === 'usedGB' ? 'Ocupado' : 'Limpiado'
                  ]}
                />
                <Bar dataKey="usedGB" fill="#0284c7" radius={[4, 4, 0, 0]} name="usedGB" />
                <Bar dataKey="cleanedGB" fill="#10b981" radius={[4, 4, 0, 0]} name="cleanedGB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Categories Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">
            Categorías con Mayor Consumo Acumulado
          </h2>
          <button
            onClick={onNavigateToScan}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver análisis completo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryStats).map(([key, cat]) => {
            const Icon = cat.icon;
            return (
              <div
                key={key}
                onClick={onNavigateToScan}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-all hover:translate-y-[-1px] space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${cat.bgColor} ${cat.borderColor} border`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                    {formatBytes(cat.bytes)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Recuperable: <span className="font-mono text-cyan-400">{formatBytes(cat.recoverable)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & System Protection Banner */}
      <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-200">
              Protección de Datos y Proyectos Activos
            </div>
            <div className="text-[11px] text-neutral-400">
              Nunca se tocan repositorios Git, proyectos de Xcode, entornos de Node/Python ni documentos personales.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('protection')}
          className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 transition-colors"
        >
          Gestionar Exclusiones
        </button>
      </div>
    </div>
  );
};
