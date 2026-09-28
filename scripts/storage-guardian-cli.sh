#!/usr/bin/env bash
# ==============================================================================
# Storage Guardian AI — CLI & Background Daemon for macOS
# Compatible with macOS Sonoma (14+) & macOS Sequoia (15+)
# ==============================================================================

set -euo pipefail

VERSION="1.0.0"
LOG_DIR="${HOME}/Library/Logs/StorageGuardian"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/daemon.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [StorageGuardian] $1" | tee -a "${LOG_FILE}"
}

print_header() {
    echo "=========================================================="
    echo "       Storage Guardian AI — macOS Storage Daemon v${VERSION}"
    echo "=========================================================="
}

check_disk_space() {
    local FREE_KB=$(df -k / | awk 'NR==2 {print $4}')
    local FREE_GB=$((FREE_KB / 1024 / 1024))
    echo "${FREE_GB}"
}

notify_macos() {
    local TITLE="Storage Guardian AI"
    local MSG="$1"
    osascript -e "display notification \"${MSG}\" with title \"${TITLE}\" sound name \"Hero\"" 2>/dev/null || true
}

run_cleanup() {
    local MODE="${1:-safe}"
    local THRESHOLD_GB="${2:-15}"
    
    log "Iniciando escaneo inteligente y mantenimiento..."
    local BEFORE_GB=$(check_disk_space)
    log "Espacio libre inicial: ${BEFORE_GB} GB (Umbral crítico: ${THRESHOLD_GB} GB)"

    local IS_CRITICAL=false
    if [ "${BEFORE_GB}" -lt "${THRESHOLD_GB}" ]; then
        IS_CRITICAL=true
        log "ALERTA: Espacio inferior al umbral de seguridad. Se aplicará purga intensiva."
    fi

    # 1. Cachés de CapCut
    if [ -d "${HOME}/Movies/CapCut/User Data/Cache" ]; then
        log "Purgando caché de renderizado de CapCut..."
        rm -rf "${HOME}/Movies/CapCut/User Data/Cache"/* 2>/dev/null || true
    fi
    if [ -d "${HOME}/Movies/CapCut/User Data/SmartCrop" ]; then
        log "Purgando modelos SmartCrop temporales de CapCut..."
        rm -rf "${HOME}/Movies/CapCut/User Data/SmartCrop"/* 2>/dev/null || true
    fi

    # 2. DaVinci Resolve
    if [ -d "${HOME}/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip" ]; then
        log "Purgando CacheClip de DaVinci Resolve..."
        rm -rf "${HOME}/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip"/* 2>/dev/null || true
    fi

    # 3. Modelos locales de Chrome y Service Workers
    if [ -d "${HOME}/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel" ]; then
        log "Limpiando modelos en dispositivo de Chrome..."
        rm -rf "${HOME}/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel"/* 2>/dev/null || true
    fi
    if [ -d "${HOME}/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage" ]; then
        log "Limpiando CacheStorage de navegadores..."
        rm -rf "${HOME}/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage"/* 2>/dev/null || true
    fi

    # 4. Fondos Aéreos 4K de macOS Sequoia/Sonoma inactivos (>30 días)
    local AERIAL_DIR="/Library/Application Support/com.apple.idleassetsd/Customer"
    if [ -d "${AERIAL_DIR}" ] && [ -w "${AERIAL_DIR}" ]; then
        log "Purgando videos aéreos 4K no utilizados..."
        find "${AERIAL_DIR}" -name "*.mov" -atime +30 -delete 2>/dev/null || true
    fi

    # 5. Papelera si está en emergencia
    if [ "${IS_CRITICAL}" = true ]; then
        log "Vaciando papelera del usuario..."
        rm -rf "${HOME}/.Trash"/* 2>/dev/null || true
    fi

    local AFTER_GB=$(check_disk_space)
    local RECOVERED_GB=$((AFTER_GB - BEFORE_GB))
    log "Limpieza finalizada. Espacio libre ahora: ${AFTER_GB} GB (+${RECOVERED_GB} GB recuperados)"
    notify_macos "Mantenimiento completado: +${RECOVERED_GB} GB recuperados. Espacio libre: ${AFTER_GB} GB."
}

case "${1:-status}" in
    status)
        print_header
        FREE_NOW=$(check_disk_space)
        echo "Espacio Libre Actual: ${FREE_NOW} GB"
        echo "Ruta de Logs: ${LOG_FILE}"
        ;;
    clean)
        print_header
        run_cleanup "${2:-safe}" "${3:-15}"
        ;;
    install-launchd)
        print_header
        echo "Instalando servicio launchd de macOS..."
        mkdir -p "${HOME}/Library/LaunchAgents" "${HOME}/.storage-guardian"
        cp "$0" "${HOME}/.storage-guardian/cleanup-daemon.sh"
        chmod +x "${HOME}/.storage-guardian/cleanup-daemon.sh"
        launchctl bootstrap "gui/$(id -u)" "${HOME}/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist" 2>/dev/null || true
        echo "Daemon registrado correctamente en launchd."
        ;;
    *)
        echo "Uso: $0 {status|clean|install-launchd}"
        exit 1
        ;;
esac
