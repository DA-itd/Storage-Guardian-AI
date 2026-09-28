# Storage Guardian AI — Monitor y Limpiador Inteligente para macOS

**Storage Guardian AI** es una aplicación de escritorio nativa y de alta eficiencia diseñada específicamente para macOS (Sonoma 14.x, Sequoia 15.x y posteriores). Su objetivo primordial es monitorear, auditar y limpiar automáticamente archivos temporales masivos, cachés descontroladas y pesos de modelos de Inteligencia Artificial que saturan el disco APFS con el paso de los meses.

Previene de forma proactiva situaciones críticas donde el usuario se queda sin espacio para instalar actualizaciones de macOS (las cuales requieren habitualmente entre 35 y 50 GB libres para preparar la partición sellada del sistema APFS).

---

## 🏛 1. Arquitectura Completa del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STORAGE GUARDIAN AI                             │
│                  Look & Feel Nativo macOS Sequoia                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   Frontend   │             │   Backend    │             │   Subsistema │
│ React + Vite │             │  Local Node  │             │   launchd    │
│  TypeScript  │             │   Express    │             │  (Daemon OS) │
│   Recharts   │             │  (Localhost) │             │  Background  │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             MOTOR DE ESCANEO INTELIGENTE                │
       │                                                         │
       │  • Módulo IA: Ollama, LM Studio, ComfyUI, Forge,        │
       │               StabilityMatrix, Claude VM, ChatGPT,      │
       │               Chrome OptGuideOnDeviceModel              │
       │  • Módulo Video: CapCut Cache/SmartCrop/AIAvatar,       │
       │                  DaVinci Resolve CacheClip,             │
       │                  Adobe Premiere Media Cache             │
       │  • Módulo Navegadores: Chrome, Safari, Firefox, Edge    │
       │  • Módulo macOS: Fondos Aéreos 4K (com.apple.wallpaper) │
       │                  Cachés, Logs, Descargas, Papelera      │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              CAPA DE PROTECCIÓN DE DATOS                │
       │                                                         │
       │  Exclusión inmutable: Repositorios Git (.git),          │
       │  Proyectos Xcode (.xcodeproj), Node (package.json),     │
       │  Rust (Cargo.toml), Python (venv), Documentos y Fotos   │
       └─────────────────────────────────────────────────────────┘
```

---

## 📁 2. Estructura de Carpetas

```
├── electron/
│   ├── main.cjs                    # Proceso principal de Electron (ventana nativa macOS, vibrancy)
│   └── preload.cjs                 # Puente seguro IPC entre frontend y macOS
├── launchd/
│   └── com.storageguardian.ai.cleanup.plist  # Archivo Property List de launchd para macOS
├── scripts/
│   ├── package-macos.sh            # Script de empaquetado para .app y .dmg (Apple Silicon/Intel)
│   └── storage-guardian-cli.sh     # CLI y Daemon ejecutable en segundo plano
├── src/
│   ├── components/
│   │   ├── AIModelAuditor.tsx       # Módulo IA: auditor de modelos GGUF/safetensors y duplicados
│   │   ├── Dashboard.tsx            # Métricas, gráficas Recharts (semanal/mensual) y radar
│   │   ├── DataProtection.tsx       # Reglas de exclusión de proyectos y documentos personales
│   │   ├── EmergencyRescueModal.tsx # FUNCIÓN EXTRA: Rescate urgente con espacio <15 GB
│   │   ├── IntelligentScanner.tsx   # Escaneo categorizado, clasificación y barra de progreso
│   │   ├── ScheduledCleaner.tsx     # Generador y gestor de launchd (.plist y comandos CLI)
│   │   ├── Sidebar.tsx              # Barra lateral estilo macOS Sequoia con medidor APFS
│   │   ├── SimulationModal.tsx      # Modo Dry Run (simulación previa antes de eliminar)
│   │   ├── TopReports.tsx           # Top 50 carpetas, Top 50 archivos y consumo por app
│   │   └── WindowHeader.tsx         # Semáforo de ventana macOS (rojo/amarillo/verde) y alertas
│   ├── services/
│   │   ├── launchdService.ts        # Generador dinámico de .plist XML y scripts bash
│   │   └── storageScanner.ts        # Motor de indexación, cálculo de seguridad y rescate
│   ├── types/
│   │   └── storage.ts               # Tipado TypeScript riguroso para todo el sistema
│   ├── App.tsx                      # Enrutador y orquestador del estado de la aplicación
│   ├── index.css                    # Estilos Tailwind v4 y tipografía SF Pro / JetBrains Mono
│   └── main.tsx                     # Punto de entrada React 19
├── index.html                       # Entry HTML optimizado para macOS
├── package.json                     # Scripts y dependencias
├── server.ts                        # Servidor local Express con middlewares Vite
└── tsconfig.json                    # Configuración TypeScript para macOS
```

---

## ⚙️ 3. Requisitos del Sistema

* **Sistema Operativo:** macOS 14.0 (Sonoma), macOS 15.0+ (Sequoia) o versiones posteriores.
* **Procesador:** Apple Silicon (M1, M2, M3, M4 en todas sus variantes) o procesadores Intel Core x86_64.
* **Sistema de Archivos:** APFS (Apple File System) con soporte de snapshots locales.
* **Node.js:** Versión 18.0 o superior (recomendado Node 20 LTS o 22).
* **Permisos de macOS:**
  * Para limpiar fondos aéreos (`com.apple.idleassetsd`) y cachés del sistema, se recomienda otorgar **Acceso Total al Disco (Full Disk Access)** en:
    `Ajustes del Sistema > Privacidad y Seguridad > Acceso total al disco > Añadir Storage Guardian AI`.

---

## 🚀 4. Instalación y Ejecución Local en VS Code

1. **Abrir el proyecto en VS Code:**
   ```bash
   code .
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor local y la interfaz:**
   ```bash
   npm run dev
   ```
   La aplicación se abrirá en `http://localhost:3000` con el servidor Express y el motor de escaneo listos para operar.

---

## ✨ 5. Funciones Principales

### 1. Dashboard Completo
* Métricas en tiempo real de espacio total, espacio ocupado, espacio libre y porcentaje de saturación.
* Historial de crecimiento diario y semanal con gráficas de área interactivas de **Recharts**.
* Historial de 6 meses comparando gigabytes ocupados versus gigabytes liberados.

### 2. Escaneo Inteligente Especializado
Detecta automáticamente las carpetas conocidas por devorar decenas de gigabytes en macOS:
* **Herramientas de IA:**
  * `~/.ollama` (modelos GGUF de Llama 3, DeepSeek, Mistral, Qwen)
  * `~/Library/Application Support/LM Studio/models`
  * `~/Library/Application Support/StabilityMatrix/Models`
  * `~/ComfyUI/output` y checkpoints
  * `~/stable-diffusion-webui-forge` y `~/stable-diffusion-webui` (Automatic1111)
  * `~/Library/Application Support/Claude/vm` (Contenedores VM de Claude Desktop)
  * `~/Library/Application Support/ChatGPT/Cache`
  * Extensiones de IA de VS Code (GitHub Copilot, Continue)
* **Navegadores:**
  * Google Chrome (`OptGuideOnDeviceModel`, Service Worker `CacheStorage`, `IndexedDB`)
  * Safari, Firefox y Microsoft Edge
* **Edición de Video:**
  * CapCut (`User Data/Cache`, `SmartCrop`, `AIAvatarCache`, `Effect`)
  * DaVinci Resolve (`CacheClip`, `ProxyMedia`)
  * Adobe Premiere Pro (`Media Cache Files`, Previews)
* **macOS:**
  * Fondos Aéreos 4K HDR (`com.apple.idleassetsd / com.apple.wallpaper`), los cuales pueden ocupar más de 40 a 80 GB en segundo plano sin que el usuario lo note.
  * Papelera, Descargas antiguas, Logs de diagnóstico y cachés de usuario.

### 3. Clasificación Automática de Seguridad (4 Niveles)
1. **Muy seguro de limpiar:** Cachés, logs temporales, Service Worker caches, CapCut SmartCrop. Ningún impacto en flujos de trabajo.
2. **Seguro de limpiar:** Modelos IA inactivos que pueden redescargarse, fondos aéreos no activos.
3. **Requiere revisión:** Descargas con más de 60 días sin abrir, proxies de video antiguos.
4. **No recomendado / Protegido:** Proyectos activos de código, documentos, biblioteca de fotos y música.

### 4. Simulación Previa (Dry Run)
Antes de proceder a cualquier eliminación, el botón **"Simulación previa"** muestra un desglose de cuántos GB se van a recuperar, qué apps se verán afectadas y confirma que las carpetas protegidas quedarán intactas.

### 5. Auditor de Modelos IA (Modo IA)
* Detección de modelos GGUF, safetensors, checkpoints y ONNX.
* Identificación de modelos duplicados entre diferentes clientes (por ejemplo, tener el mismo modelo en Ollama y en LM Studio).
* Alerta de modelos sin uso durante más de 90 o 120 días con recomendaciones concretas de purga.

### 6. Programación Automática con launchd
* Integración nativa con el programador de tareas `launchd` de Apple mediante un archivo Property List (`.plist`) en `~/Library/LaunchAgents/com.storageguardian.ai.cleanup.plist`.
* Funciona con el equipo en reposo o sin la interfaz abierta.
* Disparo automático programable diario, semanal o mensual.
* Disparo por emergencia si el almacenamiento cae por debajo de 15 GB.

### 7. FUNCIÓN EXTRA: Recuperación de Emergencia (<15 GB)
Cuando el espacio libre desciende del umbral crítico (15 GB por defecto, configurable):
* Se activa un banner de alerta destacado en la cabecera.
* Se despliega el **Asistente de Rescate Urgente**, el cual estructura un plan en 3 fases para liberar de forma inmediata hasta 100+ GB sin tocar documentos personales, permitiendo descargar e instalar actualizaciones del sistema operativo macOS sin bloqueos ni errores de espacio insuficiente.

### 8. Reportes Avanzados
* Top 50 Carpetas más grandes del disco APFS.
* Top 50 Archivos individuales más pesados.
* Resumen de consumo agrupado por aplicación.
* Exportación de informe en formato texto plano descargable.

---

## 📦 6. Compilación y Empaquetado para macOS

### Generar la compilación web de producción:
```bash
npm run build
```

### Empaquetado como Aplicación Nativa macOS (.app y .dmg):
Ejecuta el script incluido en `scripts/package-macos.sh`:
```bash
chmod +x scripts/package-macos.sh
./scripts/package-macos.sh
```

### Firma con Apple Developer ID y Notarización:
Para distribuir la aplicación a usuarios de macOS sin que aparezca la advertencia de Gatekeeper:
```bash
# 1. Firmar el bundle
codesign --deep --force --options runtime --sign "Developer ID Application: Tu Nombre (TEAMID)" dist-electron/mac-arm64/Storage\ Guardian\ AI.app

# 2. Crear la imagen DMG
hdiutil create -volname "Storage Guardian AI" -srcfolder dist-electron/mac-arm64/Storage\ Guardian\ AI.app -ov -format UDZO dist-electron/StorageGuardianAI-1.0.0-arm64.dmg

# 3. Notarizar con notarytool
xcrun notarytool submit dist-electron/StorageGuardianAI-1.0.0-arm64.dmg --keychain-profile "AC_PASSWORD" --wait
xcrun stapler staple dist-electron/StorageGuardianAI-1.0.0-arm64.dmg
```

---

## 🔒 7. Privacidad y Seguridad

* **100% Local:** No envía telemetría ni datos a servidores externos.
* **Lectura no destructiva:** Los análisis operan en modo solo lectura hasta que el usuario confirma expresamente la limpieza o simulación.
* **Protección activa:** La detección automática de proyectos (`.git`, `.xcodeproj`, `package.json`, `Cargo.toml`) garantiza que tus repositorios de código nunca sean eliminados por error.
