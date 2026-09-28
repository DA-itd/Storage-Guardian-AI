import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  BarChart2, 
  Calendar, 
  Download, 
  Search, 
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { TopStorageItem, StorageItem } from '../types/storage';
import { 
  generateTopFolders, 
  generateTopFiles, 
  computeAppConsumptions, 
  formatBytes, 
  getSafetyBadge,
  INITIAL_GROWTH_HISTORY 
} from '../services/storageScanner';

interface TopReportsProps {
  items: StorageItem[];
}

export const TopReports: React.FC<TopReportsProps> = ({ items }) => {
  const [activeReportTab, setActiveReportTab] = useState<'folders' | 'files' | 'apps' | 'growth'>('folders');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const topFolders = generateTopFolders();
  const topFiles = generateTopFiles();
  const appConsumptions = computeAppConsumptions(items);

  const filteredFolders = topFolders.filter(
    (f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = topFiles.filter(
    (f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportReport = () => {
    let report = `STORAGE GUARDIAN AI — REPORTE DE ALMACENAMIENTO\nGenerado: ${new Date().toLocaleString()}\n\n`;
    report += `=== TOP 10 CARPETAS MÁS GRANDES ===\n`;
    topFolders.slice(0, 10).forEach((f) => {
      report += `${f.rank}. ${f.name} — ${formatBytes(f.sizeBytes)} (${f.path})\n`;
    });
    report += `\n=== TOP 10 ARCHIVOS MÁS GRANDES ===\n`;
    topFiles.slice(0, 10).forEach((f) => {
      report += `${f.rank}. ${f.name} — ${formatBytes(f.sizeBytes)} (${f.appOrCategory})\n`;
    });
    report += `\n=== CONSUMO POR APLICACIÓN ===\n`;
    appConsumptions.forEach((a) => {
      report += `${a.appName}: Total ${formatBytes(a.totalSizeBytes)} | Recuperable: ${formatBytes(a.recoverableBytes)}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storage-guardian-reporte-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Bar with Report Tabs & Export */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Reporte Avanzado de Almacenamiento</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inspección exhaustiva de los mayores consumidores de espacio en disco APFS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar Informe (.txt)</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-800/60 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setActiveReportTab('folders')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeReportTab === 'folders'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Top 50 Carpetas</span>
            </button>

            <button
              onClick={() => setActiveReportTab('files')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeReportTab === 'files'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Top 50 Archivos</span>
            </button>

            <button
              onClick={() => setActiveReportTab('apps')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeReportTab === 'apps'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Consumo por App</span>
            </button>

            <button
              onClick={() => setActiveReportTab('growth')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeReportTab === 'growth'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Crecimiento Diario</span>
            </button>
          </div>

          {(activeReportTab === 'folders' || activeReportTab === 'files') && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por nombre o ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-neutral-800/80 border border-neutral-700/60 rounded-md text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 w-56"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* VIEW 1: TOP 50 FOLDERS */}
        {activeReportTab === 'folders' && (
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-800/60 border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Carpeta / Directorio</th>
                  <th className="py-2.5 px-4">Origen / App</th>
                  <th className="py-2.5 px-4">Clasificación</th>
                  <th className="py-2.5 px-4 text-right">Tamaño Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredFolders.map((f) => {
                  const badge = getSafetyBadge(f.safety);
                  return (
                    <tr key={f.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-neutral-500">
                        {f.rank}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-neutral-200">{f.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400 truncate max-w-md">
                          {f.path}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-300 font-mono">
                        {f.appOrCategory}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded border inline-block ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-neutral-100">
                        {formatBytes(f.sizeBytes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: TOP 50 FILES */}
        {activeReportTab === 'files' && (
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-800/60 border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Archivo</th>
                  <th className="py-2.5 px-4">Ubicación y Formato</th>
                  <th className="py-2.5 px-4">Clasificación</th>
                  <th className="py-2.5 px-4 text-right">Tamaño</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredFiles.map((file) => {
                  const badge = getSafetyBadge(file.safety);
                  return (
                    <tr key={file.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-neutral-500">
                        {file.rank}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-neutral-200 font-mono">{file.name}</div>
                        <div className="text-[11px] text-neutral-400">{file.appOrCategory}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-neutral-400 truncate max-w-sm">
                        {file.path}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded border inline-block ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-cyan-300">
                        {formatBytes(file.sizeBytes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: APPS CONSUMING MOST SPACE */}
        {activeReportTab === 'apps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appConsumptions.map((app) => (
              <div
                key={app.appName}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-800 text-cyan-400 border border-neutral-700/60">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-100">{app.appName}</h3>
                      <span className="text-[11px] text-neutral-400">
                        Categoría: {app.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-neutral-100 tabular-nums">
                      {formatBytes(app.totalSizeBytes)}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      Recuperable: {formatBytes(app.recoverableBytes)}
                    </div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{
                      width: `${Math.min(100, Math.round((app.recoverableBytes / app.totalSizeBytes) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 4: DAILY GROWTH TABLE */}
        {activeReportTab === 'growth' && (
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-800/60 border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Espacio Total Usado</th>
                  <th className="py-2.5 px-4">Espacio Limpiado</th>
                  <th className="py-2.5 px-4 text-right">Variación Diaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {INITIAL_GROWTH_HISTORY.map((day) => (
                  <tr key={day.date} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-neutral-200">
                      {day.dayLabel} ({day.date})
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-neutral-300">
                      {day.usedGB} GB
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-emerald-400">
                      {day.cleanedGB > 0 ? `-${day.cleanedGB} GB` : '0 GB'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-amber-400">
                      {day.growthGB > 0 ? `+${day.growthGB} GB` : `${day.growthGB} GB`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
