import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  FolderCheck, 
  Lock, 
  Code2, 
  FileText, 
  Image, 
  Music, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ExclusionRule } from '../types/storage';
import { DEFAULT_EXCLUSION_RULES } from '../services/storageScanner';

export const DataProtection: React.FC = () => {
  const [rules, setRules] = useState<ExclusionRule[]>(DEFAULT_EXCLUSION_RULES);
  const [newRulePath, setNewRulePath] = useState<string>('');
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r)));
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePath.trim()) return;

    const newRule: ExclusionRule = {
      id: `custom-${Date.now()}`,
      name: newRuleName.trim() || newRulePath.trim(),
      pathPattern: newRulePath.trim(),
      type: 'directory',
      isDefaultProtected: false,
      isEnabled: true,
      description: 'Ruta excluida manualmente por el usuario'
    };

    setRules([...rules, newRule]);
    setNewRulePath('');
    setNewRuleName('');
    setShowAddForm(false);
  };

  const removeCustomRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  // Detected active projects on the machine protected automatically
  const activeProjectsDetected = [
    { name: 'mi-app-react-native', path: '~/Developer/Projects/mi-app-react-native', marker: 'package.json + .git', size: '1.4 GB' },
    { name: 'vision-engine-metal', path: '~/Developer/Xcode/vision-engine-metal', marker: '.xcodeproj', size: '3.8 GB' },
    { name: 'fastapi-ai-service', path: '~/Developer/Python/fastapi-ai-service', marker: 'venv + requirements.txt', size: '890 MB' },
    { name: 'audio-plugin-dsp', path: '~/Developer/Rust/audio-plugin-dsp', marker: 'Cargo.toml + .git', size: '2.1 GB' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protección Absoluta de Datos y Proyectos</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Políticas de exclusión inmutable. Storage Guardian AI nunca tocará archivos personales ni proyectos de desarrollo.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Añadir Exclusión Personalizada</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Form to Add Custom Rule */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomRule}
            className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/30 space-y-3 animate-fadeIn"
          >
            <div className="text-xs font-semibold text-neutral-200">
              Nueva Regla de Exclusión
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  placeholder="Ej: Carpeta de Proyectos Clientes"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Ruta o Patrón Glob</label>
                <input
                  type="text"
                  placeholder="Ej: ~/Trabajo/** o /Volumes/SSD-Externo"
                  value={newRulePath}
                  onChange={(e) => setNewRulePath(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded-lg"
              >
                Guardar Exclusión
              </button>
            </div>
          </form>
        )}

        {/* Protection Guarantee Notice */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-emerald-300">
              Garantía de Integridad del Código y Archivos del Usuario
            </h3>
            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
              El motor de escaneo valida cada ruta antes de cualquier simulación o limpieza. Si un directorio contiene marcadores como <code className="font-mono text-emerald-400">.git</code>, <code className="font-mono text-emerald-400">package.json</code>, <code className="font-mono text-emerald-400">Cargo.toml</code> o <code className="font-mono text-emerald-400">.xcodeproj</code>, queda automáticamente bloqueado contra cualquier eliminación.
            </p>
          </div>
        </div>

        {/* Default Exclusion Rules List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-300">
            Reglas de Protección del Sistema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 mt-0.5">
                    {rule.type === 'project_marker' ? (
                      <Code2 className="w-4 h-4 text-cyan-400" />
                    ) : rule.name.includes('Fotos') ? (
                      <Image className="w-4 h-4 text-pink-400" />
                    ) : rule.name.includes('Música') ? (
                      <Music className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                      <span>{rule.name}</span>
                      {rule.isDefaultProtected && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
                          Blindado
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                      {rule.pathPattern}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {rule.description}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!rule.isDefaultProtected && (
                    <button
                      onClick={() => removeCustomRule(rule.id)}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <input
                    type="checkbox"
                    checked={rule.isEnabled}
                    disabled={rule.isDefaultProtected}
                    onChange={() => toggleRule(rule.id)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Detected Active Projects */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-cyan-400" />
              <span>Proyectos Activos Detectados y Protegidos</span>
            </h2>
            <span className="text-[11px] text-neutral-400">
              {activeProjectsDetected.length} repositorios protegidos
            </span>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-800/60 border-b border-neutral-800 text-neutral-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Proyecto</th>
                  <th className="py-2.5 px-4">Ruta en Disco</th>
                  <th className="py-2.5 px-4">Marcador Detectado</th>
                  <th className="py-2.5 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {activeProjectsDetected.map((proj) => (
                  <tr key={proj.name} className="hover:bg-neutral-800/20">
                    <td className="py-2.5 px-4 font-semibold text-neutral-200">
                      {proj.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {proj.path}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-cyan-300 text-[11px]">
                      {proj.marker}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Excluido 100%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
