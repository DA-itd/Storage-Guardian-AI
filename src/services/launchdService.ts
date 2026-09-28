import { LaunchdConfig } from '../types/storage';

export const DEFAULT_LAUNCHD_CONFIG: LaunchdConfig = {
  isEnabled: true,
  frequency: 'weekly',
  hour: 3,
  minute: 30,
  dayOfWeek: 0, // Sunday
  dayOfMonth: 1,
  cleanSafetyLevels: ['very_safe'],
  emergencyAutoClean: true,
  emergencyThresholdGB: 15,
  notifyOnCompletion: true,
  plistPath: '~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist',
  scriptPath: '~/.storage-guardian/cleanup-daemon.sh'
};

/**
 * Generates valid macOS launchd property list (.plist) XML string
 */
export function generateLaunchdPlist(config: LaunchdConfig): string {
  let calendarIntervalXml = '';

  if (config.frequency === 'daily') {
    calendarIntervalXml = `    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>${config.hour}</integer>
        <key>Minute</key>
        <integer>${config.minute}</integer>
    </dict>`;
  } else if (config.frequency === 'weekly') {
    // 0 is Sunday in launchd
    calendarIntervalXml = `    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>${config.dayOfWeek ?? 0}</integer>
        <key>Hour</key>
        <integer>${config.hour}</integer>
        <key>Minute</key>
        <integer>${config.minute}</integer>
    </dict>`;
  } else if (config.frequency === 'monthly') {
    calendarIntervalXml = `    <key>StartCalendarInterval</key>
    <dict>
        <key>Day</key>
        <integer>${config.dayOfMonth ?? 1}</integer>
        <key>Hour</key>
        <integer>${config.hour}</integer>
        <key>Minute</key>
        <integer>${config.minute}</integer>
    </dict>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.storageguardian.ai.cleanup</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${config.scriptPath.replace('~', '${HOME}')}</string>
        <string>--mode</string>
        <string>${config.cleanSafetyLevels.join(',')}</string>
        <string>--threshold</string>
        <string>${config.emergencyThresholdGB}</string>
    </array>

${calendarIntervalXml}

    <key>StandardOutPath</key>
    <string>\${HOME}/Library/Logs/StorageGuardian/daemon.log</string>

    <key>StandardErrorPath</key>
    <string>\${HOME}/Library/Logs/StorageGuardian/daemon_err.log</string>

    <key>RunAtLoad</key>
    <false/>

    <key>ProcessType</key>
    <string>Background</string>

    <key>LowPriorityIO</key>
    <true/>

    <key>Nice</key>
    <integer>15</integer>
</dict>
</plist>`;
}

/**
 * Generates the companion executable bash daemon script executed by launchd
 */
export function generateDaemonBashScript(config: LaunchdConfig): string {
  return `#!/usr/bin/env bash
# ==============================================================================
# Storage Guardian AI — macOS Background Cleanup Daemon
# Automated launchd maintenance script
# Compatible with macOS Sonoma (14.x) and macOS Sequoia (15.x+)
# ==============================================================================

set -euo pipefail

LOG_DIR="\${HOME}/Library/Logs/StorageGuardian"
mkdir -p "\${LOG_DIR}"
LOG_FILE="\${LOG_DIR}/daemon.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [StorageGuardian] \$1" | tee -a "\${LOG_FILE}"
}

notify_user() {
    local TITLE="Storage Guardian AI"
    local MSG="\$1"
    osascript -e "display notification \"\${MSG}\" with title \"\${TITLE}\" sound name \"Hero\""
}

log "Iniciando ciclo de mantenimiento preventivo automático..."

# 1. Comprobación del espacio libre en disco (APFS)
FREE_BLOCKS=$(df -k / | awk 'NR==2 {print \$4}')
FREE_GB=$((FREE_BLOCKS / 1024 / 1024))
log "Espacio libre actual: \${FREE_GB} GB (Umbral de emergencia: ${config.emergencyThresholdGB} GB)"

IS_EMERGENCY=false
if [ "\${FREE_GB}" -lt "${config.emergencyThresholdGB}" ]; then
    IS_EMERGENCY=true
    log "ALERTA CRÍTICA: Espacio bajo umbral de emergencia. Activando protocolo de rescate."
fi

# 2. Limpieza de Caché de CapCut (SmartCrop, Cache, AIAvatar)
if [ -d "\${HOME}/Movies/CapCut/User Data/Cache" ]; then
    log "Limpiando caché de render temporal de CapCut..."
    rm -rf "\${HOME}/Movies/CapCut/User Data/Cache"/* || true
fi
if [ -d "\${HOME}/Movies/CapCut/User Data/SmartCrop" ]; then
    log "Limpiando cálculos SmartCrop de CapCut..."
    rm -rf "\${HOME}/Movies/CapCut/User Data/SmartCrop"/* || true
fi

# 3. Limpieza de DaVinci Resolve CacheClip
if [ -d "\${HOME}/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip" ]; then
    log "Limpiando CacheClip temporal de DaVinci Resolve..."
    rm -rf "\${HOME}/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip"/* || true
fi

# 4. Limpieza de Modelos en Dispositivo y Caché de Navegadores (Chrome, Safari)
if [ -d "\${HOME}/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel" ]; then
    log "Limpiando modelos AI locales en Chrome..."
    rm -rf "\${HOME}/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel"/* || true
fi
if [ -d "\${HOME}/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage" ]; then
    log "Purgando Service Worker CacheStorage en Chrome..."
    rm -rf "\${HOME}/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage"/* || true
fi

# 5. Limpieza de fondos aéreos descargados inactivos de macOS (Sonoma/Sequoia)
AERIAL_PATH="/Library/Application Support/com.apple.idleassetsd/Customer"
if [ -d "\${AERIAL_PATH}" ] && [ -w "\${AERIAL_PATH}" ]; then
    log "Purgando fondos aéreos 4K no seleccionados..."
    find "\${AERIAL_PATH}" -name "*.mov" -atime +30 -delete || true
fi

# 6. Caché general de usuario y registros de diagnóstico (>30 días)
log "Limpiando logs de diagnóstico antiguos..."
find "\${HOME}/Library/Logs" -name "*.log" -o -name "*.ips" -o -name "*.crash" -mtime +30 -delete || true

# 7. Vaciado de Papelera si está en emergencia
if [ "\${IS_EMERGENCY}" = true ]; then
    log "Vaciando papelera del usuario (~/.Trash)..."
    rm -rf "\${HOME}/.Trash"/* || true
fi

# 8. Reporte final
NEW_FREE_BLOCKS=$(df -k / | awk 'NR==2 {print \$4}')
NEW_FREE_GB=$((NEW_FREE_BLOCKS / 1024 / 1024))
RECUPERADO=$((NEW_FREE_GB - FREE_GB))
log "Mantenimiento finalizado con éxito. Espacio libre ahora: \${NEW_FREE_GB} GB (+ \${RECUPERADO} GB recuperados)"

${config.notifyOnCompletion ? 'notify_user "Mantenimiento completado: +"$RECUPERADO" GB recuperados. Disco libre: "$NEW_FREE_GB" GB."' : '# Notificaciones desactivadas'}
`;
}

/**
 * Returns copy-pasteable terminal instructions for macOS
 */
export function getLaunchdTerminalCommands(config: LaunchdConfig): {
  installCommand: string;
  uninstallCommand: string;
  statusCommand: string;
  runNowCommand: string;
} {
  return {
    installCommand: `mkdir -p ~/Library/LaunchAgents ~/.storage-guardian ~/Library/Logs/StorageGuardian
chmod +x ~/.storage-guardian/cleanup-daemon.sh
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist`,

    uninstallCommand: `launchctl bootout gui/$(id -u)/com.storageguardian.ai.cleanup
rm -f ~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist`,

    statusCommand: `launchctl list | grep com.storageguardian.ai.cleanup`,

    runNowCommand: `launchctl kickstart -k gui/$(id -u)/com.storageguardian.ai.cleanup`
  };
}
