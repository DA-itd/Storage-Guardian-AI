import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Play, 
  ShieldCheck, 
  Zap, 
  Bell, 
  CheckCircle2,
  FileCode,
  Loader2
} from 'lucide-react';
import { LaunchdConfig } from '../types/storage';
import { 
  DEFAULT_LAUNCHD_CONFIG, 
  generateLaunchdPlist, 
  generateDaemonBashScript, 
  getLaunchdTerminalCommands 
} from '../services/launchdService';

export const ScheduledCleaner: React.FC = () => {
  const [config, setConfig] = useState<LaunchdConfig>(DEFAULT_LAUNCHD_CONFIG);
  const [activeTab, setActiveTab] = useState<'settings' | 'plist' | 'script' | 'terminal'>('settings');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testExecutionOutput, setTestExecutionOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const plistXml = generateLaunchdPlist(config);
  const bashScript = generateDaemonBashScript(config);
  const terminalCommands = getLaunchdTerminalCommands(config);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 3000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Real execution of scripts/storage-guardian-cli.sh via Node backend
  const runTestDaemon = async () => {
    setIsTesting(true);
    setTestExecutionOutput('Ejecutando script real scripts/storage-guardian-cli.sh en el sistema...');

    try {
      const res = await fetch('/api/daemon/run-test', { method: 'POST' });
      const data = await res.json();
      setTestExecutionOutput(data.output || 'Limpieza ejecutada sin salida.');
    } catch (err: any) {
      setTestExecutionOutput(`Error al invocar daemon: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-3 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Programación Automática Real con launchd de macOS</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automatización nativa del sistema operativo Apple. Ejecuta tareas en segundo plano semanalmente sin requerir que abras la interfaz.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Configuración del Horario
          </button>
          <button
            onClick={() => setActiveTab('plist')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'plist'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Archivo .plist
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'script'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Script Daemon (.sh)
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'terminal'
                ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Comandos launchctl
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-3xl">
            {/* Active Switch */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-100">
                  Estado del Daemon en Segundo Plano
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  ~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist
                </div>
              </div>

              <button
                onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  config.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {config.isEnabled ? 'Activado' : 'Desactivado'}
              </button>
            </div>

            {/* Frequency Selector */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="text-xs font-semibold text-neutral-200">
                Frecuencia de Mantenimiento
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setConfig({ ...config, frequency: freq })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.frequency === freq
                        ? 'bg-neutral-800 border-cyan-500/50 text-neutral-100 shadow-sm'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-semibold capitalize">
                      {freq === 'daily' ? 'Diario' : freq === 'weekly' ? 'Semanal' : 'Mensual'}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {freq === 'daily' && 'Todos los días a la hora programada'}
                      {freq === 'weekly' && 'Cada domingo por la madrugada (Recomendado)'}
                      {freq === 'monthly' && 'El primer día de cada mes'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Hour & Minute */}
              <div className="flex items-center gap-4 pt-2">
                <div className="text-xs text-neutral-300">Hora de ejecución:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.hour}
                    onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-center text-xs font-mono text-neutral-100"
                  />
                  <span className="text-neutral-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={config.minute}
                    onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-center text-xs font-mono text-neutral-100"
                  />
                  <span className="text-[11px] text-neutral-400">(Formato 24h, ideal en reposo nocturno)</span>
                </div>
              </div>
            </div>

            {/* Emergency Auto Clean Trigger */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-neutral-100">
                    Disparo Automático por Emergencia de Espacio en APFS
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.emergencyAutoClean}
                  onChange={(e) => setConfig({ ...config, emergencyAutoClean: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Si el espacio libre en el disco Macintosh HD baja de <strong className="text-amber-300 font-mono">{config.emergencyThresholdGB} GB</strong>, launchd ejecutará el protocolo de rescate inmediato automáticamente para evitar bloqueos del sistema.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-neutral-300">Umbral de Emergencia:</span>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={config.emergencyThresholdGB}
                  onChange={(e) => setConfig({ ...config, emergencyThresholdGB: parseInt(e.target.value, 10) || 15 })}
                  className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-center text-xs font-mono text-neutral-100"
                />
                <span className="text-xs font-mono text-neutral-400">GB libres</span>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-neutral-100">
                    Notificaciones Nativas de macOS
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Avisa mediante el Centro de Notificaciones de macOS cuántos GB fueron recuperados
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.notifyOnCompletion}
                onChange={(e) => setConfig({ ...config, notifyOnCompletion: e.target.checked })}
                className="accent-cyan-500 w-4 h-4"
              />
            </div>

            {/* Test Trigger Button */}
            <div className="pt-2">
              <button
                onClick={runTestDaemon}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isTesting ? 'Ejecutando script de mantenimiento en disco...' : 'Ejecutar Mantenimiento Real Ahora'}</span>
              </button>

              {testExecutionOutput && (
                <div className="mt-3 p-3 rounded-lg bg-neutral-950 font-mono text-[11px] text-emerald-400 whitespace-pre-line border border-neutral-800">
                  {testExecutionOutput}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PLIST CODE */}
        {activeTab === 'plist' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400 font-mono">
                ~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(plistXml, 'plist')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  {copiedField === 'plist' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'plist' ? 'Copiado' : 'Copiar .plist'}</span>
                </button>
                <button
                  onClick={() => downloadFile(plistXml, 'com.storageguardian.ai.cleanup.plist')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
              {plistXml}
            </pre>
          </div>
        )}

        {/* TAB 3: SCRIPT DAEMON */}
        {activeTab === 'script' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400 font-mono">
                ~/.storage-guardian/cleanup-daemon.sh
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(bashScript, 'bash')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  {copiedField === 'bash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'bash' ? 'Copiado' : 'Copiar script'}</span>
                </button>
                <button
                  onClick={() => downloadFile(bashScript, 'cleanup-daemon.sh')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
              {bashScript}
            </pre>
          </div>
        )}

        {/* TAB 4: TERMINAL COMMANDS */}
        {activeTab === 'terminal' && (
          <div className="space-y-4 max-w-3xl">
            <div className="text-xs text-neutral-400 leading-relaxed">
              Comandos oficiales para registrar y gestionar el servicio en launchd mediante la Terminal de macOS:
            </div>

            {/* Install */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">1. Instalar y Activar Daemon:</span>
                <button
                  onClick={() => copyToClipboard(terminalCommands.installCommand, 'cmd1')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedField === 'cmd1' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="p-2.5 bg-neutral-950 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {terminalCommands.installCommand}
              </pre>
            </div>

            {/* Status */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">2. Verificar Estado en launchd:</span>
                <button
                  onClick={() => copyToClipboard(terminalCommands.statusCommand, 'cmd2')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedField === 'cmd2' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="p-2.5 bg-neutral-950 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {terminalCommands.statusCommand}
              </pre>
            </div>

            {/* Run Now */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">3. Forzar Ejecución Manual Inmediata:</span>
                <button
                  onClick={() => copyToClipboard(terminalCommands.runNowCommand, 'cmd3')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedField === 'cmd3' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="p-2.5 bg-neutral-950 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {terminalCommands.runNowCommand}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
