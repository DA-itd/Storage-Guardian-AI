import {
  StorageItem,
  DiskSpaceInfo,
  AIModelItem,
  TopStorageItem,
  DailyGrowthPoint,
  AppConsumptionItem,
  ExclusionRule,
  SimulationResult,
  EmergencyRescuePlan,
  SafetyLevel,
  ScanCategory
} from '../types/storage';

// Default mock initial disk space (macOS Sequoia on Apple Silicon)
const DEFAULT_TOTAL_BYTES = 512 * 1024 * 1024 * 1024; // 512 GB SSD
const DEFAULT_FREE_BYTES = 13.8 * 1024 * 1024 * 1024; // 13.8 GB (under 15 GB threshold! Emergency scenario by default to test the requested feature)
const DEFAULT_USED_BYTES = DEFAULT_TOTAL_BYTES - DEFAULT_FREE_BYTES;
const EMERGENCY_THRESHOLD_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

export const DEFAULT_EXCLUSION_RULES: ExclusionRule[] = [
  {
    id: 'git',
    name: 'Repositorios Git (.git)',
    pathPattern: '**/.git',
    type: 'project_marker',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Protege ramas, historial y proyectos activos de Git'
  },
  {
    id: 'xcode',
    name: 'Proyectos Xcode (.xcodeproj, .xcworkspace)',
    pathPattern: '**/*.{xcodeproj,xcworkspace}',
    type: 'project_marker',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Evita borrar proyectos de apps de iOS y macOS en desarrollo'
  },
  {
    id: 'node_modules_active',
    name: 'Proyectos Node/TypeScript con package.json',
    pathPattern: '**/package.json',
    type: 'project_marker',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Detecta y resguarda repositorios y aplicaciones en desarrollo'
  },
  {
    id: 'rust_cargo',
    name: 'Proyectos Rust (Cargo.toml)',
    pathPattern: '**/Cargo.toml',
    type: 'project_marker',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Proyectos de código compilado de Rust'
  },
  {
    id: 'python_venv',
    name: 'Entornos virtuales Python (.venv, venv)',
    pathPattern: '**/{.venv,venv}',
    type: 'directory',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Entornos virtuales activos de desarrollo Python'
  },
  {
    id: 'personal_docs',
    name: 'Documentos Personales (~/Documents)',
    pathPattern: '~/Documents/**',
    type: 'directory',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Archivos PDF, hojas de cálculo, presentaciones y textos personales'
  },
  {
    id: 'personal_pictures',
    name: 'Fototeca y Fotos (~/Pictures)',
    pathPattern: '~/Pictures/**',
    type: 'directory',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Fotos personales y biblioteca de Apple Photos'
  },
  {
    id: 'personal_music',
    name: 'Música Personal (~/Music)',
    pathPattern: '~/Music/**',
    type: 'directory',
    isDefaultProtected: true,
    isEnabled: true,
    description: 'Biblioteca de música y proyectos de GarageBand / Logic Pro'
  }
];

// Rich predefined scanner target catalog matching the user's specific prompt
export const INITIAL_STORAGE_ITEMS: StorageItem[] = [
  // IA
  {
    id: 'item-ollama-models',
    name: 'Modelos Ollama (Llama 3.3, DeepSeek R1)',
    path: '~/.ollama/models/blobs',
    category: 'ai_models',
    safety: 'safe',
    sizeBytes: 15.4 * 1024 * 1024 * 1024, // 15.4 GB
    fileCount: 8,
    lastAccessed: '2026-06-12',
    description: 'Modelos de lenguaje local descargados con CLI ollama (incluye pesos GGUF sin usar en 120 días).',
    app: 'Ollama',
    isSelected: true,
    isSelectable: true,
    metadata: { unusedDays: 120, format: 'GGUF', suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-lm-studio-cache',
    name: 'LM Studio — Modelos y Caché de Inferencia',
    path: '~/Library/Application Support/LM Studio/models',
    category: 'ai_models',
    safety: 'safe',
    sizeBytes: 18.2 * 1024 * 1024 * 1024, // 18.2 GB
    fileCount: 4,
    lastAccessed: '2026-05-18',
    description: 'Modelos Qwen 2.5 14B y Mistral NeMo descargados en LM Studio; duplicados de Ollama detectados.',
    app: 'LM Studio',
    isSelected: true,
    isSelectable: true,
    metadata: { unusedDays: 95, isDuplicate: true, format: 'GGUF', suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-stability-matrix',
    name: 'StabilityMatrix — Checkpoints SDXL',
    path: '~/Library/Application Support/StabilityMatrix/Models',
    category: 'ai_models',
    safety: 'review_needed',
    sizeBytes: 12.8 * 1024 * 1024 * 1024,
    fileCount: 3,
    lastAccessed: '2026-07-04',
    description: 'Modelos safetensors de difusión estable para generación de imágenes.',
    app: 'StabilityMatrix',
    isSelected: false,
    isSelectable: true,
    metadata: { unusedDays: 78, format: 'safetensors' }
  },
  {
    id: 'item-comfyui-cache',
    name: 'ComfyUI — Caché de Salida y Tensores VAE',
    path: '~/ComfyUI/output',
    category: 'ai_models',
    safety: 'very_safe',
    sizeBytes: 9.6 * 1024 * 1024 * 1024,
    fileCount: 420,
    lastAccessed: '2026-09-10',
    description: 'Imágenes generadas intermedias, latentes temporales y caché VAE.',
    app: 'ComfyUI',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-forge-webui',
    name: 'Forge WebUI — Checkpoints temporales',
    path: '~/stable-diffusion-webui-forge/models/Stable-diffusion',
    category: 'ai_models',
    safety: 'review_needed',
    sizeBytes: 7.2 * 1024 * 1024 * 1024,
    fileCount: 2,
    lastAccessed: '2026-04-10',
    description: 'Checkpoints de Stable Diffusion WebUI Forge sin uso reciente.',
    app: 'Forge',
    isSelected: false,
    isSelectable: true,
    metadata: { unusedDays: 140, format: 'safetensors' }
  },
  {
    id: 'item-automatic1111',
    name: 'Automatic1111 — Caché de embeddings y VAE',
    path: '~/stable-diffusion-webui/cache',
    category: 'ai_models',
    safety: 'very_safe',
    sizeBytes: 5.1 * 1024 * 1024 * 1024,
    fileCount: 185,
    lastAccessed: '2026-08-01',
    description: 'Archivos de preprocesado ControlNet y caché de aceleración.',
    app: 'Automatic1111',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-claude-desktop',
    name: 'Claude Desktop — Máquina Virtual y Caché Local',
    path: '~/Library/Application Support/Claude/vm',
    category: 'ai_models',
    safety: 'safe',
    sizeBytes: 11.2 * 1024 * 1024 * 1024, // 11.2 GB
    fileCount: 14,
    lastAccessed: '2026-09-22',
    description: 'Caché de contenedor virtual local y archivos temporales de Claude Desktop.',
    app: 'Claude Desktop',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-chatgpt-desktop',
    name: 'ChatGPT Desktop — Caché de voz y adjuntos',
    path: '~/Library/Application Support/ChatGPT/Cache',
    category: 'ai_models',
    safety: 'very_safe',
    sizeBytes: 3.4 * 1024 * 1024 * 1024,
    fileCount: 310,
    lastAccessed: '2026-09-25',
    description: 'Fragmentos de audio temporales de Advanced Voice Mode y previsualizaciones descargadas.',
    app: 'ChatGPT Desktop',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-gemini-cli',
    name: 'Gemini CLI — Caché de Tokens y Modelos Locales',
    path: '~/.gemini/cache',
    category: 'ai_models',
    safety: 'very_safe',
    sizeBytes: 1.8 * 1024 * 1024 * 1024,
    fileCount: 92,
    lastAccessed: '2026-09-20',
    description: 'Caché de respuestas y embeddings locales de la herramienta CLI de Gemini.',
    app: 'Gemini CLI',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-vscode-ai',
    name: 'VS Code — Caché Extensiones IA (Copilot & Continue)',
    path: '~/.vscode/extensions/github.copilot-chat/cache',
    category: 'ai_models',
    safety: 'very_safe',
    sizeBytes: 2.9 * 1024 * 1024 * 1024,
    fileCount: 540,
    lastAccessed: '2026-09-26',
    description: 'Índices vectoriales locales de código y logs de extensiones de IA para VS Code.',
    app: 'VS Code',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },

  // Navegadores
  {
    id: 'item-chrome-ai-models',
    name: 'Chrome — Modelos IA en Dispositivo (OptGuideOnDeviceModel)',
    path: '~/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel',
    category: 'browsers',
    safety: 'safe',
    sizeBytes: 4.3 * 1024 * 1024 * 1024, // 4.3 GB
    fileCount: 12,
    lastAccessed: '2026-09-18',
    description: 'Modelos Gemini Nano locales descargados por Google Chrome para autocompletado y resumen.',
    app: 'Google Chrome',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-chrome-cachestorage',
    name: 'Chrome — Service Worker y CacheStorage',
    path: '~/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage',
    category: 'browsers',
    safety: 'very_safe',
    sizeBytes: 8.6 * 1024 * 1024 * 1024,
    fileCount: 1420,
    lastAccessed: '2026-09-27',
    description: 'Caché de PWAs, fuentes y assets estáticos guardados por Service Workers en Chrome.',
    app: 'Google Chrome',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-chrome-indexeddb',
    name: 'Chrome — IndexedDB desactualizado',
    path: '~/Library/Application Support/Google/Chrome/Default/IndexedDB',
    category: 'browsers',
    safety: 'safe',
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    fileCount: 380,
    lastAccessed: '2026-08-30',
    description: 'Bases de datos IndexedDB de sitios web de IA y suites web ya no visitadas.',
    app: 'Google Chrome',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-safari-cache',
    name: 'Safari — Datos de Sitios Web y Caché',
    path: '~/Library/Containers/com.apple.Safari/Data/Library/Caches',
    category: 'browsers',
    safety: 'very_safe',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    fileCount: 960,
    lastAccessed: '2026-09-27',
    description: 'Caché HTTP, archivos temporales de navegación y previsualizaciones de pestañas.',
    app: 'Safari',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-edge-cache',
    name: 'Microsoft Edge — Caché y Modelos CoPilot',
    path: '~/Library/Application Support/Microsoft Edge/Default/CacheStorage',
    category: 'browsers',
    safety: 'very_safe',
    sizeBytes: 3.2 * 1024 * 1024 * 1024,
    fileCount: 450,
    lastAccessed: '2026-09-12',
    description: 'Caché offline de Edge y modelos en dispositivo de sugerencias.',
    app: 'Microsoft Edge',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-firefox-cache',
    name: 'Firefox — Cache2 Web Storage',
    path: '~/Library/Caches/Firefox/Profiles/default-release/cache2',
    category: 'browsers',
    safety: 'very_safe',
    sizeBytes: 2.1 * 1024 * 1024 * 1024,
    fileCount: 840,
    lastAccessed: '2026-09-15',
    description: 'Caché de red comprimida de Mozilla Firefox.',
    app: 'Firefox',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },

  // Video
  {
    id: 'item-capcut-cache',
    name: 'CapCut — Caché General de Proyectos',
    path: '~/Movies/CapCut/User Data/Cache',
    category: 'video_media',
    safety: 'very_safe',
    sizeBytes: 45.3 * 1024 * 1024 * 1024, // 45.3 GB
    fileCount: 4200,
    lastAccessed: '2026-09-26',
    description: 'Renderizados temporales, ondas de audio calculadas y previsualizaciones de CapCut.',
    app: 'CapCut',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-capcut-smartcrop',
    name: 'CapCut — SmartCrop & Effect Cache',
    path: '~/Movies/CapCut/User Data/SmartCrop',
    category: 'video_media',
    safety: 'very_safe',
    sizeBytes: 12.4 * 1024 * 1024 * 1024,
    fileCount: 1100,
    lastAccessed: '2026-09-24',
    description: 'Cálculos de recorte inteligente por IA y filtros de efectos descargados.',
    app: 'CapCut',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-capcut-aiavatar',
    name: 'CapCut — AIAvatarCache & OnlineMaterial',
    path: '~/Movies/CapCut/User Data/AIAvatarCache',
    category: 'video_media',
    safety: 'very_safe',
    sizeBytes: 6.8 * 1024 * 1024 * 1024,
    fileCount: 890,
    lastAccessed: '2026-09-21',
    description: 'Modelos de avatares sintéticos descargados y plantillas multimedia de la nube.',
    app: 'CapCut',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-davinci-cacheclip',
    name: 'DaVinci Resolve — CacheClip & ProxyMedia',
    path: '~/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip',
    category: 'video_media',
    safety: 'safe',
    sizeBytes: 28.5 * 1024 * 1024 * 1024,
    fileCount: 310,
    lastAccessed: '2026-09-14',
    description: 'Render cache de clips ProRes/DNxHR para reproducción en tiempo real.',
    app: 'DaVinci Resolve',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-premiere-mediacache',
    name: 'Adobe Premiere — Media Cache Files & Previews',
    path: '~/Library/Application Support/Adobe/Common/Media Cache Files',
    category: 'video_media',
    safety: 'very_safe',
    sizeBytes: 16.7 * 1024 * 1024 * 1024,
    fileCount: 6500,
    lastAccessed: '2026-09-08',
    description: 'Archivos .cfa y .pek de audio decodificado de proyectos antiguos de Premiere.',
    app: 'Premiere Pro',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },

  // macOS
  {
    id: 'item-macos-aerial',
    name: 'Fondos Aéreos de macOS (com.apple.idleassetsd)',
    path: '/Library/Application Support/com.apple.idleassetsd/Customer',
    category: 'macos_system',
    safety: 'safe',
    sizeBytes: 41.2 * 1024 * 1024 * 1024, // 41.2 GB
    fileCount: 32,
    lastAccessed: '2026-09-22',
    description: 'Videos aéreos 4K HDR en cámara lenta descargados por macOS Sonoma/Sequoia para salvapantallas.',
    app: 'macOS Aerial Wallpapers',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 2 }
  },
  {
    id: 'item-macos-trash',
    name: 'Papelera del Sistema (~/.Trash)',
    path: '~/.Trash',
    category: 'macos_system',
    safety: 'very_safe',
    sizeBytes: 8.9 * 1024 * 1024 * 1024,
    fileCount: 64,
    lastAccessed: '2026-09-27',
    description: 'Archivos descartados que continúan ocupando espacio en el disco APFS.',
    app: 'Finder',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-macos-caches',
    name: 'Caché de Usuario de macOS (~/Library/Caches)',
    path: '~/Library/Caches',
    category: 'macos_system',
    safety: 'very_safe',
    sizeBytes: 14.6 * 1024 * 1024 * 1024,
    fileCount: 8900,
    lastAccessed: '2026-09-27',
    description: 'Cachés temporales de aplicaciones de terceros y utilidades de macOS.',
    app: 'macOS System',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-macos-logs',
    name: 'Registros de Diagnóstico y Logs (~/Library/Logs)',
    path: '~/Library/Logs',
    category: 'macos_system',
    safety: 'very_safe',
    sizeBytes: 3.1 * 1024 * 1024 * 1024,
    fileCount: 1420,
    lastAccessed: '2026-09-27',
    description: 'Informes de fallos antiguos (.ips, .crash) y trazas de depuración de aplicaciones.',
    app: 'macOS System',
    isSelected: true,
    isSelectable: true,
    metadata: { suggestedEmergencyOrder: 1 }
  },
  {
    id: 'item-downloads-old',
    name: 'Descargas Antiguas (> 60 días)',
    path: '~/Downloads',
    category: 'macos_system',
    safety: 'review_needed',
    sizeBytes: 22.4 * 1024 * 1024 * 1024,
    fileCount: 48,
    lastAccessed: '2026-07-15',
    description: 'Instaladores .dmg, archivos .zip y documentos descargados que no han sido abiertos en 2 meses.',
    app: 'Finder',
    isSelected: false,
    isSelectable: true,
    metadata: { unusedDays: 74 }
  }
];

// Rich AI Models catalog for AI Model Auditor
export const INITIAL_AI_MODELS: AIModelItem[] = [
  {
    id: 'model-1',
    name: 'llama-3.3-70b-instruct.Q4_K_M.gguf',
    app: 'Ollama',
    path: '~/.ollama/models/blobs/sha256-4b829e1fa',
    sizeBytes: 42.8 * 1024 * 1024 * 1024,
    format: 'GGUF',
    parameterSize: '70B',
    lastUsedDaysAgo: 120,
    isDuplicate: false,
    recommendation: 'Se detectó este modelo de Ollama de 42.8 GB que no ha sido usado durante 120 días. Candidato ideal para liberar espacio.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-2',
    name: 'deepseek-r1-distill-qwen-14b.gguf',
    app: 'Ollama',
    path: '~/.ollama/models/blobs/sha256-a9f81bc32',
    sizeBytes: 9.1 * 1024 * 1024 * 1024,
    format: 'GGUF',
    parameterSize: '14B',
    lastUsedDaysAgo: 15,
    isDuplicate: true,
    duplicateGroup: 'deepseek-14b',
    recommendation: 'Modelo duplicado: también existe en LM Studio (~/Library/Application Support/LM Studio/models). Eliminar la copia en Ollama.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-3',
    name: 'DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf',
    app: 'LM Studio',
    path: '~/Library/Application Support/LM Studio/models/deepseek-r1-14b.gguf',
    sizeBytes: 9.1 * 1024 * 1024 * 1024,
    format: 'GGUF',
    parameterSize: '14B',
    lastUsedDaysAgo: 3,
    isDuplicate: true,
    duplicateGroup: 'deepseek-14b',
    recommendation: 'Copia activa en LM Studio. Se recomienda conservar esta y borrar la copia inactiva de Ollama.',
    safety: 'review_needed',
    isSelected: false
  },
  {
    id: 'model-4',
    name: 'flux1-dev-fp8.safetensors',
    app: 'StabilityMatrix',
    path: '~/Library/Application Support/StabilityMatrix/Models/Flux/flux1-dev-fp8.safetensors',
    sizeBytes: 11.9 * 1024 * 1024 * 1024,
    format: 'safetensors',
    parameterSize: 'Flux',
    lastUsedDaysAgo: 104,
    isDuplicate: false,
    recommendation: 'Checkpoint de difusión FLUX de 11.9 GB sin ejecución en más de 100 días.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-5',
    name: 'sd_xl_base_1.0.safetensors',
    app: 'Forge',
    path: '~/stable-diffusion-webui-forge/models/Stable-diffusion/sd_xl_base_1.0.safetensors',
    sizeBytes: 6.9 * 1024 * 1024 * 1024,
    format: 'safetensors',
    parameterSize: 'SDXL',
    lastUsedDaysAgo: 142,
    isDuplicate: true,
    duplicateGroup: 'sdxl-base',
    recommendation: 'Modelo SDXL sin usar en 142 días. Duplicado en la carpeta de Automatic1111.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-6',
    name: 'sd_xl_base_1.0_vae.safetensors',
    app: 'Automatic1111',
    path: '~/stable-diffusion-webui/models/Stable-diffusion/sd_xl_base_1.0_vae.safetensors',
    sizeBytes: 6.9 * 1024 * 1024 * 1024,
    format: 'safetensors',
    parameterSize: 'SDXL',
    lastUsedDaysAgo: 180,
    isDuplicate: true,
    duplicateGroup: 'sdxl-base',
    recommendation: 'Duplicado redundante de 6.9 GB no utilizado en 6 meses.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-7',
    name: 'OptGuideOnDeviceModel-v4',
    app: 'Google Chrome',
    path: '~/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel/weights.bin',
    sizeBytes: 4.3 * 1024 * 1024 * 1024,
    format: 'bin',
    parameterSize: 'Gemini Nano',
    lastUsedDaysAgo: 45,
    isDuplicate: false,
    recommendation: 'Chrome descargará de nuevo este modelo bajo demanda si es requerido. Seguro de limpiar para liberar 4.3 GB.',
    safety: 'safe',
    isSelected: true
  },
  {
    id: 'model-8',
    name: 'qwen2.5-coder-7b-instruct.gguf',
    app: 'Ollama',
    path: '~/.ollama/models/blobs/sha256-78e129ad',
    sizeBytes: 4.7 * 1024 * 1024 * 1024,
    format: 'GGUF',
    parameterSize: '7B',
    lastUsedDaysAgo: 4,
    isDuplicate: false,
    recommendation: 'Modelo de programación usado frecuentemente esta semana. Se sugiere conservar.',
    safety: 'review_needed',
    isSelected: false
  }
];

// Historical growth data
export const INITIAL_GROWTH_HISTORY: DailyGrowthPoint[] = [
  { date: '2026-09-21', dayLabel: 'Lun 21', usedGB: 462.4, cleanedGB: 0, growthGB: +2.1 },
  { date: '2026-09-22', dayLabel: 'Mar 22', usedGB: 471.8, cleanedGB: 0, growthGB: +9.4 },
  { date: '2026-09-23', dayLabel: 'Mié 23', usedGB: 478.2, cleanedGB: 0, growthGB: +6.4 },
  { date: '2026-09-24', dayLabel: 'Jue 24', usedGB: 485.5, cleanedGB: 1.2, growthGB: +7.3 },
  { date: '2026-09-25', dayLabel: 'Vie 25', usedGB: 491.0, cleanedGB: 0, growthGB: +5.5 },
  { date: '2026-09-26', dayLabel: 'Sáb 26', usedGB: 495.2, cleanedGB: 0, growthGB: +4.2 },
  { date: '2026-09-27', dayLabel: 'Dom 27', usedGB: 498.2, cleanedGB: 0, growthGB: +3.0 }
];

export const INITIAL_MONTHLY_GROWTH = [
  { month: 'Abril', usedGB: 340, cleanedGB: 35 },
  { month: 'Mayo', usedGB: 375, cleanedGB: 20 },
  { month: 'Junio', usedGB: 410, cleanedGB: 45 },
  { month: 'Julio', usedGB: 442, cleanedGB: 15 },
  { month: 'Agosto', usedGB: 468, cleanedGB: 10 },
  { month: 'Septiembre', usedGB: 498, cleanedGB: 12 }
];

// Top 50 Largest Folders
export function generateTopFolders(): TopStorageItem[] {
  const folders = [
    { name: 'CapCut / User Data / Cache', path: '~/Movies/CapCut/User Data/Cache', size: 45.3, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'Ollama Blobs & Weights', path: '~/.ollama/models/blobs', size: 42.8, app: 'Ollama', safety: 'safe' as SafetyLevel },
    { name: 'macOS Aerial Wallpapers 4K', path: '/Library/Application Support/com.apple.idleassetsd/Customer', size: 41.2, app: 'macOS System', safety: 'safe' as SafetyLevel },
    { name: 'DaVinci Resolve CacheClip', path: '~/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip', size: 28.5, app: 'DaVinci Resolve', safety: 'safe' as SafetyLevel },
    { name: 'Descargas Antiguas', path: '~/Downloads', size: 22.4, app: 'Finder', safety: 'review_needed' as SafetyLevel },
    { name: 'LM Studio Models', path: '~/Library/Application Support/LM Studio/models', size: 18.2, app: 'LM Studio', safety: 'safe' as SafetyLevel },
    { name: 'Adobe Premiere Media Cache', path: '~/Library/Application Support/Adobe/Common/Media Cache Files', size: 16.7, app: 'Premiere Pro', safety: 'very_safe' as SafetyLevel },
    { name: 'Usuario Caches General', path: '~/Library/Caches', size: 14.6, app: 'macOS System', safety: 'very_safe' as SafetyLevel },
    { name: 'StabilityMatrix Checkpoints', path: '~/Library/Application Support/StabilityMatrix/Models', size: 12.8, app: 'StabilityMatrix', safety: 'review_needed' as SafetyLevel },
    { name: 'CapCut SmartCrop & Effects', path: '~/Movies/CapCut/User Data/SmartCrop', size: 12.4, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'Claude Desktop VM Contenedor', path: '~/Library/Application Support/Claude/vm', size: 11.2, app: 'Claude Desktop', safety: 'safe' as SafetyLevel },
    { name: 'ComfyUI Output Images', path: '~/ComfyUI/output', size: 9.6, app: 'ComfyUI', safety: 'very_safe' as SafetyLevel },
    { name: 'Papelera del Sistema', path: '~/.Trash', size: 8.9, app: 'Finder', safety: 'very_safe' as SafetyLevel },
    { name: 'Chrome Service Worker & Cache', path: '~/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage', size: 8.6, app: 'Google Chrome', safety: 'very_safe' as SafetyLevel },
    { name: 'Forge Stable Diffusion Models', path: '~/stable-diffusion-webui-forge/models/Stable-diffusion', size: 7.2, app: 'Forge', safety: 'review_needed' as SafetyLevel },
    { name: 'CapCut AIAvatarCache', path: '~/Movies/CapCut/User Data/AIAvatarCache', size: 6.8, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'Automatic1111 Cache', path: '~/stable-diffusion-webui/cache', size: 5.1, app: 'Automatic1111', safety: 'very_safe' as SafetyLevel },
    { name: 'Chrome OptGuide OnDevice AI', path: '~/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel', size: 4.3, app: 'Google Chrome', safety: 'safe' as SafetyLevel },
    { name: 'Safari Web Data Cache', path: '~/Library/Containers/com.apple.Safari/Data/Library/Caches', size: 4.1, app: 'Safari', safety: 'very_safe' as SafetyLevel },
    { name: 'Chrome IndexedDB Store', path: '~/Library/Application Support/Google/Chrome/Default/IndexedDB', size: 3.8, app: 'Google Chrome', safety: 'safe' as SafetyLevel },
    { name: 'ChatGPT Desktop Cache', path: '~/Library/Application Support/ChatGPT/Cache', size: 3.4, app: 'ChatGPT Desktop', safety: 'very_safe' as SafetyLevel },
    { name: 'Microsoft Edge CacheStorage', path: '~/Library/Application Support/Microsoft Edge/Default/CacheStorage', size: 3.2, app: 'Microsoft Edge', safety: 'very_safe' as SafetyLevel },
    { name: 'macOS Diagnostic Logs', path: '~/Library/Logs', size: 3.1, app: 'macOS System', safety: 'very_safe' as SafetyLevel },
    { name: 'VS Code Copilot Vector Cache', path: '~/.vscode/extensions/github.copilot-chat/cache', size: 2.9, app: 'VS Code', safety: 'very_safe' as SafetyLevel },
    { name: 'Firefox Web Storage Cache2', path: '~/Library/Caches/Firefox/Profiles/default-release/cache2', size: 2.1, app: 'Firefox', safety: 'very_safe' as SafetyLevel },
    { name: 'Gemini CLI Embeddings Cache', path: '~/.gemini/cache', size: 1.8, app: 'Gemini CLI', safety: 'very_safe' as SafetyLevel },
    { name: 'Xcode DerivedData Antiguo', path: '~/Library/Developer/Xcode/DerivedData', size: 8.4, app: 'Xcode', safety: 'safe' as SafetyLevel },
    { name: 'Homebrew Cache Bottleneck', path: '~/Library/Caches/Homebrew', size: 3.9, app: 'Homebrew', safety: 'very_safe' as SafetyLevel },
    { name: 'npm global cache', path: '~/.npm/_cacache', size: 2.7, app: 'Node.js', safety: 'very_safe' as SafetyLevel },
    { name: 'Docker Overlay2 Images Unused', path: '~/Library/Containers/com.docker.docker/Data/vms', size: 14.1, app: 'Docker Desktop', safety: 'review_needed' as SafetyLevel },
    { name: 'Slack Electron GPU Cache', path: '~/Library/Application Support/Slack/Service Worker/CacheStorage', size: 1.4, app: 'Slack', safety: 'very_safe' as SafetyLevel },
    { name: 'Spotify Offline Cache', path: '~/Library/Caches/com.spotify.client/Data', size: 2.5, app: 'Spotify', safety: 'safe' as SafetyLevel },
    { name: 'Figma Local Fonts & Canvas Cache', path: '~/Library/Application Support/Figma/CanvasRenderer', size: 1.6, app: 'Figma', safety: 'very_safe' as SafetyLevel },
    { name: 'Telegram Media Previews', path: '~/Library/Group Containers/ru.keepcoder.Telegram/media', size: 3.6, app: 'Telegram', safety: 'safe' as SafetyLevel },
    { name: 'WhatsApp Desktop IndexedDB', path: '~/Library/Containers/net.whatsapp.WhatsApp/Data', size: 2.2, app: 'WhatsApp', safety: 'safe' as SafetyLevel },
    { name: 'Proyectos Activos de Código', path: '~/Developer/Projects', size: 34.5, app: 'Desarrollo', safety: 'protected' as SafetyLevel },
    { name: 'Documentos Personales', path: '~/Documents', size: 19.8, app: 'Finder', safety: 'protected' as SafetyLevel },
    { name: 'Fototeca de Apple Photos', path: '~/Pictures/Photos Library.photoslibrary', size: 48.0, app: 'Apple Photos', safety: 'protected' as SafetyLevel },
    { name: 'Proyectos de Audio Logic Pro', path: '~/Music/Logic', size: 12.3, app: 'Logic Pro', safety: 'protected' as SafetyLevel },
    { name: 'iOS Device Backups Antiguos', path: '~/Library/Application Support/MobileSync/Backup', size: 18.0, app: 'Finder', safety: 'review_needed' as SafetyLevel },
    { name: 'Simulator Runtimes iOS 17', path: '/Library/Developer/CoreSimulator/Profiles/Runtimes', size: 7.8, app: 'Xcode', safety: 'safe' as SafetyLevel },
    { name: 'Postman Local Collection Cache', path: '~/Library/Application Support/Postman', size: 0.9, app: 'Postman', safety: 'very_safe' as SafetyLevel },
    { name: 'Notion Desktop Cache', path: '~/Library/Application Support/Notion/Cache', size: 1.1, app: 'Notion', safety: 'very_safe' as SafetyLevel },
    { name: 'Zoom Recording Cache Temp', path: '~/Documents/Zoom/temp', size: 1.3, app: 'Zoom', safety: 'very_safe' as SafetyLevel },
    { name: 'Raycast Clipboard History DB', path: '~/Library/Application Support/com.raycast.macos', size: 0.4, app: 'Raycast', safety: 'protected' as SafetyLevel },
    { name: 'Discord Electron Cache', path: '~/Library/Application Support/discord/Cache', size: 1.7, app: 'Discord', safety: 'very_safe' as SafetyLevel },
    { name: 'QuickTime Unsaved Recordings', path: '~/Library/Containers/com.apple.QuickTimePlayerX/Data/Library/Autosave Information', size: 2.8, app: 'QuickTime', safety: 'review_needed' as SafetyLevel },
    { name: 'Carthage Build Artifacts', path: '~/Library/Caches/org.carthage.CarthageKit', size: 1.2, app: 'Desarrollo', safety: 'very_safe' as SafetyLevel },
    { name: 'Pip Wheel Cache', path: '~/Library/Caches/pip', size: 1.9, app: 'Python', safety: 'very_safe' as SafetyLevel },
    { name: 'Android Emulator AVDs', path: '~/.android/avd', size: 10.5, app: 'Android Studio', safety: 'review_needed' as SafetyLevel }
  ];

  return folders.map((f, i) => ({
    id: `top-folder-${i + 1}`,
    rank: i + 1,
    name: f.name,
    path: f.path,
    sizeBytes: f.size * 1024 * 1024 * 1024,
    type: 'folder',
    appOrCategory: f.app,
    safety: f.safety,
    lastModified: '2026-09-20'
  }));
}

// Top 50 Largest Files
export function generateTopFiles(): TopStorageItem[] {
  const files = [
    { name: 'llama-3.3-70b-instruct.Q4_K_M.gguf', path: '~/.ollama/models/blobs/sha256-4b829e1fa', size: 42.8, app: 'Ollama', safety: 'safe' as SafetyLevel },
    { name: 'SanFrancisco_Aerial_4K_HDR.mov', path: '/Library/Application Support/com.apple.idleassetsd/Customer/4k/san_francisco_day.mov', size: 14.8, app: 'macOS Aerial', safety: 'safe' as SafetyLevel },
    { name: 'flux1-dev-fp8.safetensors', path: '~/Library/Application Support/StabilityMatrix/Models/Flux/flux1-dev-fp8.safetensors', size: 11.9, app: 'StabilityMatrix', safety: 'safe' as SafetyLevel },
    { name: 'Iceland_Glacier_Aerial_4K.mov', path: '/Library/Application Support/com.apple.idleassetsd/Customer/4k/iceland_glacier.mov', size: 11.2, app: 'macOS Aerial', safety: 'safe' as SafetyLevel },
    { name: 'Claude_Darwin_ARM64_VM.dmg', path: '~/Library/Application Support/Claude/vm/darwin-arm64.dmg', size: 11.2, app: 'Claude Desktop', safety: 'safe' as SafetyLevel },
    { name: 'Sonoma_Redwoods_Flyover_4K.mov', path: '/Library/Application Support/com.apple.idleassetsd/Customer/4k/sonoma_redwoods.mov', size: 9.8, app: 'macOS Aerial', safety: 'safe' as SafetyLevel },
    { name: 'deepseek-r1-distill-qwen-14b.gguf', path: '~/.ollama/models/blobs/sha256-a9f81bc32', size: 9.1, app: 'Ollama', safety: 'safe' as SafetyLevel },
    { name: 'DeepSeek-R1-Distill-Qwen-14B-LMStudio.gguf', path: '~/Library/Application Support/LM Studio/models/deepseek-r1-14b.gguf', size: 9.1, app: 'LM Studio', safety: 'safe' as SafetyLevel },
    { name: 'CapCut_Render_Temp_Project_89.mov', path: '~/Movies/CapCut/User Data/Cache/render_clip_tmp_098.mov', size: 8.4, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'Xcode_16_Simulator_iOS18.simruntime', path: '/Library/Developer/CoreSimulator/Profiles/Runtimes/iOS 18.0.simruntime', size: 7.8, app: 'Xcode', safety: 'safe' as SafetyLevel },
    { name: 'sd_xl_base_1.0.safetensors', path: '~/stable-diffusion-webui-forge/models/Stable-diffusion/sd_xl_base_1.0.safetensors', size: 6.9, app: 'Forge', safety: 'safe' as SafetyLevel },
    { name: 'sd_xl_base_1.0_duplicate.safetensors', path: '~/stable-diffusion-webui/models/Stable-diffusion/sd_xl_base_1.0_vae.safetensors', size: 6.9, app: 'Automatic1111', safety: 'safe' as SafetyLevel },
    { name: 'DaVinci_Render_Proxy_Reel_A01.mov', path: '~/Movies/DaVinci Resolve ProxyMedia/Reel_A01_Proxy.mov', size: 6.4, app: 'DaVinci Resolve', safety: 'safe' as SafetyLevel },
    { name: 'CapCut_Render_Preview_04.mov', path: '~/Movies/CapCut/User Data/Cache/render_clip_tmp_099.mov', size: 5.9, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'macOS_15_Sequoia_Installer.pkg', path: '~/Downloads/InstallAssistant_15.3.pkg', size: 13.4, app: 'Finder', safety: 'review_needed' as SafetyLevel },
    { name: 'qwen2.5-coder-7b-instruct.gguf', path: '~/.ollama/models/blobs/sha256-78e129ad', size: 4.7, app: 'Ollama', safety: 'review_needed' as SafetyLevel },
    { name: 'Chrome_OptGuide_Nano_v4.bin', path: '~/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel/weights.bin', size: 4.3, app: 'Google Chrome', safety: 'safe' as SafetyLevel },
    { name: 'Adobe_Peak_File_Render_Cache.cfa', path: '~/Library/Application Support/Adobe/Common/Media Cache Files/video_001.cfa', size: 4.1, app: 'Premiere Pro', safety: 'very_safe' as SafetyLevel },
    { name: 'CapCut_SmartCrop_TensorWeights.bin', path: '~/Movies/CapCut/User Data/SmartCrop/model_weights_2026.bin', size: 3.8, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'Dubai_Skyline_Night_Aerial.mov', path: '/Library/Application Support/com.apple.idleassetsd/Customer/4k/dubai_night.mov', size: 5.4, app: 'macOS Aerial', safety: 'safe' as SafetyLevel },
    { name: 'Docker_Desktop_VirtualDisk.raw', path: '~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw', size: 14.0, app: 'Docker', safety: 'review_needed' as SafetyLevel },
    { name: 'CapCut_AIAvatar_3D_Mesh.glb', path: '~/Movies/CapCut/User Data/AIAvatarCache/avatar_preset_male_02.glb', size: 2.9, app: 'CapCut', safety: 'very_safe' as SafetyLevel },
    { name: 'DaVinci_Optimized_Media_02.mov', path: '~/Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip/clip_opt_02.mov', size: 3.7, app: 'DaVinci Resolve', safety: 'safe' as SafetyLevel },
    { name: 'Trash_Old_ScreenRecording_4K.mov', path: '~/.Trash/Screen_Recording_2026-08-14.mov', size: 4.2, app: 'Finder', safety: 'very_safe' as SafetyLevel },
    { name: 'Trash_Corrupted_Zip_Backup.tar.gz', path: '~/.Trash/backup_old_2026.tar.gz', size: 3.5, app: 'Finder', safety: 'very_safe' as SafetyLevel },
    { name: 'VSCode_Copilot_Embedding_Index.db', path: '~/.vscode/extensions/github.copilot-chat/cache/code_indices.db', size: 1.8, app: 'VS Code', safety: 'very_safe' as SafetyLevel },
    { name: 'Chrome_IndexedDB_AIPlatform.leveldb', path: '~/Library/Application Support/Google/Chrome/Default/IndexedDB/https_ai_hub_0.indexeddb.leveldb/000034.ldb', size: 1.9, app: 'Google Chrome', safety: 'safe' as SafetyLevel },
    { name: 'Gemini_CLI_OfflineModel_Weights.bin', path: '~/.gemini/cache/weights_local_v2.bin', size: 1.4, app: 'Gemini CLI', safety: 'very_safe' as SafetyLevel },
    { name: 'Safari_HttpCache_LargeResource.db', path: '~/Library/Containers/com.apple.Safari/Data/Library/Caches/com.apple.Safari/Cache.db', size: 1.6, app: 'Safari', safety: 'very_safe' as SafetyLevel },
    { name: 'System_Diagnostic_Sysdiagnose.tar.gz', path: '~/Library/Logs/sysdiagnose_2026_09.tar.gz', size: 1.7, app: 'macOS System', safety: 'very_safe' as SafetyLevel }
  ];

  // Fill up to 50
  while (files.length < 50) {
    const idx = files.length + 1;
    files.push({
      name: `temp_render_chunk_${idx}.tmp`,
      path: `~/Library/Caches/TemporaryItems/chunk_${idx}.dat`,
      size: Math.max(0.4, Number((3.5 - idx * 0.05).toFixed(1))),
      app: 'macOS Cache',
      safety: 'very_safe' as SafetyLevel
    });
  }

  return files.map((f, i) => ({
    id: `top-file-${i + 1}`,
    rank: i + 1,
    name: f.name,
    path: f.path,
    sizeBytes: f.size * 1024 * 1024 * 1024,
    type: 'file',
    appOrCategory: f.app,
    safety: f.safety,
    lastModified: '2026-09-18'
  }));
}

// Compute App Consumption
export function computeAppConsumptions(items: StorageItem[]): AppConsumptionItem[] {
  const map = new Map<string, { total: number; recoverable: number; category: ScanCategory; safety: SafetyLevel }>();

  for (const item of items) {
    const existing = map.get(item.app) || {
      total: 0,
      recoverable: 0,
      category: item.category,
      safety: item.safety
    };

    existing.total += item.sizeBytes;
    if (item.safety === 'very_safe' || item.safety === 'safe') {
      existing.recoverable += item.sizeBytes;
    }
    map.set(item.app, existing);
  }

  return Array.from(map.entries())
    .map(([appName, data]) => ({
      appName,
      category: data.category,
      totalSizeBytes: data.total,
      recoverableBytes: data.recoverable,
      iconType: appName.toLowerCase().replace(/\s+/g, '-'),
      safety: data.safety
    }))
    .sort((a, b) => b.totalSizeBytes - a.totalSizeBytes);
}

// Generate Emergency Rescue Plan
export function generateEmergencyRescuePlan(
  diskInfo: DiskSpaceInfo,
  items: StorageItem[],
  targetFreeGB = 40 // macOS updates need ~35-45 GB free
): EmergencyRescuePlan {
  const currentFreeGB = diskInfo.freeBytes / (1024 * 1024 * 1024);
  const neededRecoveryGB = Math.max(0, targetFreeGB - currentFreeGB);
  const isCritical = diskInfo.freeBytes <= diskInfo.emergencyThresholdBytes;

  // Step 1: Very safe immediate purge (Caches, Logs, Trash, CapCut SmartCrop, Browser Caches)
  const phase1Items = items.filter(
    (i) => i.safety === 'very_safe' && i.isSelectable
  );
  const phase1Bytes = phase1Items.reduce((acc, i) => acc + i.sizeBytes, 0);

  // Step 2: Safe AI Models & Aerial Wallpapers (Duplicated models, unused >90 days, 4K screen savers)
  const phase2Items = items.filter(
    (i) => i.safety === 'safe' && i.isSelectable && (i.category === 'ai_models' || i.category === 'macos_system' || i.category === 'browsers')
  );
  const phase2Bytes = phase2Items.reduce((acc, i) => acc + i.sizeBytes, 0);

  // Step 3: DaVinci Proxy & Old Downloads (Requires quick user blessing)
  const phase3Items = items.filter(
    (i) => i.safety === 'review_needed' && i.isSelectable
  );
  const phase3Bytes = phase3Items.reduce((acc, i) => acc + i.sizeBytes, 0);

  const steps = [
    {
      phase: 1,
      title: 'Fase 1: Purgado Inmediato 100% Seguro',
      description: 'Cachés temporales, registros, papelera y renderizados temporales de CapCut/Premiere. Cero riesgo.',
      items: phase1Items,
      recoverableBytes: phase1Bytes,
      safety: 'very_safe' as SafetyLevel
    },
    {
      phase: 2,
      title: 'Fase 2: Modelos IA Inactivos y Fondos Aéreos 4K',
      description: 'Modelos de Ollama/LM Studio sin usar en >90 días, duplicados y fondos de pantalla automáticos de macOS Sequoia.',
      items: phase2Items,
      recoverableBytes: phase2Bytes,
      safety: 'safe' as SafetyLevel
    },
    {
      phase: 3,
      title: 'Fase 3: Medios Proxy y Descargas Residuales',
      description: 'Proxies de video antiguos y archivos en Descargas con más de 60 días de antigüedad.',
      items: phase3Items,
      recoverableBytes: phase3Bytes,
      safety: 'review_needed' as SafetyLevel
    }
  ];

  const totalEmergencyRecoverableBytes = phase1Bytes + phase2Bytes;

  return {
    currentFreeGB,
    targetTargetFreeGB: targetFreeGB,
    neededRecoveryGB,
    isCritical,
    steps,
    totalEmergencyRecoverableBytes
  };
}

// Dry Run Simulator
export function simulateCleaning(
  items: StorageItem[],
  diskInfo: DiskSpaceInfo
): SimulationResult {
  const selected = items.filter((i) => i.isSelected);
  const totalSizeBytes = selected.reduce((acc, i) => acc + i.sizeBytes, 0);

  const itemsBySafety = {
    very_safe: {
      count: selected.filter((i) => i.safety === 'very_safe').length,
      bytes: selected.filter((i) => i.safety === 'very_safe').reduce((acc, i) => acc + i.sizeBytes, 0)
    },
    safe: {
      count: selected.filter((i) => i.safety === 'safe').length,
      bytes: selected.filter((i) => i.safety === 'safe').reduce((acc, i) => acc + i.sizeBytes, 0)
    },
    review_needed: {
      count: selected.filter((i) => i.safety === 'review_needed').length,
      bytes: selected.filter((i) => i.safety === 'review_needed').reduce((acc, i) => acc + i.sizeBytes, 0)
    }
  };

  const appsAffected = Array.from(new Set(selected.map((i) => i.app)));
  const protectedSkippedCount = items.filter((i) => i.safety === 'protected').length + 8; // Including protected projects
  const estimatedFreedGB = totalSizeBytes / (1024 * 1024 * 1024);
  const estimatedDiskFreeAfterGB = (diskInfo.freeBytes + totalSizeBytes) / (1024 * 1024 * 1024);

  return {
    totalItems: selected.length,
    totalSizeBytes,
    itemsBySafety,
    appsAffected,
    protectedSkippedCount,
    estimatedDiskFreeAfterGB,
    estimatedFreedGB
  };
}

// Format utilities
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getSafetyBadge(safety: SafetyLevel): { label: string; color: string; desc: string } {
  switch (safety) {
    case 'very_safe':
      return {
        label: 'Muy seguro de limpiar',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        desc: 'Caché, Logs, Temp, Service Worker. Ningún impacto operativo.'
      };
    case 'safe':
      return {
        label: 'Seguro de limpiar',
        color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        desc: 'Modelos IA inactivos, optimizaciones locales. Se descargan si se requieren.'
      };
    case 'review_needed':
      return {
        label: 'Requiere revisión',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        desc: 'Descargas antiguas, videos generados. Requiere confirmación.'
      };
    case 'protected':
      return {
        label: 'No recomendado / Protegido',
        color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
        desc: 'Proyectos de código, documentos y fotos personales. Intocable.'
      };
  }
}
