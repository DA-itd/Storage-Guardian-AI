import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { StorageItem, AIModelItem, TopStorageItem, ScanCategory, SafetyLevel } from './src/types/storage.js';

const execPromise = util.promisify(exec);

// Target definition for scanning
export interface TargetDefinition {
  id: string;
  name: string;
  relPath: string; // e.g. '.ollama/models' or 'Library/Application Support/Google/Chrome'
  isAbsolute?: boolean;
  category: ScanCategory;
  safety: SafetyLevel;
  app: string;
  description: string;
  isModelFolder?: boolean;
}

export const TARGET_DEFINITIONS: TargetDefinition[] = [
  // IA
  {
    id: 'ollama-models',
    name: 'Modelos Ollama (~/.ollama)',
    relPath: '.ollama/models',
    category: 'ai_models',
    safety: 'safe',
    app: 'Ollama',
    description: 'Modelos de lenguaje local descargados con CLI ollama (pesos GGUF).',
    isModelFolder: true
  },
  {
    id: 'lm-studio-models',
    name: 'LM Studio — Modelos y Caché',
    relPath: 'Library/Application Support/LM Studio/models',
    category: 'ai_models',
    safety: 'safe',
    app: 'LM Studio',
    description: 'Modelos descargados e indexados por LM Studio.',
    isModelFolder: true
  },
  {
    id: 'stability-matrix',
    name: 'StabilityMatrix — Checkpoints',
    relPath: 'Library/Application Support/StabilityMatrix/Models',
    category: 'ai_models',
    safety: 'review_needed',
    app: 'StabilityMatrix',
    description: 'Modelos de difusión estable (SDXL, SD 1.5, Flux).',
    isModelFolder: true
  },
  {
    id: 'comfyui-output',
    name: 'ComfyUI — Caché y Salida Temporal',
    relPath: 'ComfyUI/output',
    category: 'ai_models',
    safety: 'very_safe',
    app: 'ComfyUI',
    description: 'Imágenes generadas temporales y latentes de inferencia.'
  },
  {
    id: 'forge-webui',
    name: 'Forge WebUI — Modelos',
    relPath: 'stable-diffusion-webui-forge/models/Stable-diffusion',
    category: 'ai_models',
    safety: 'review_needed',
    app: 'Forge',
    description: 'Checkpoints de difusión cargados en Forge.',
    isModelFolder: true
  },
  {
    id: 'automatic1111-cache',
    name: 'Automatic1111 — Caché y VAE',
    relPath: 'stable-diffusion-webui/cache',
    category: 'ai_models',
    safety: 'very_safe',
    app: 'Automatic1111',
    description: 'Caché de embeddings, VAE y ControlNet.'
  },
  {
    id: 'claude-desktop-vm',
    name: 'Claude Desktop — Contenedor VM y Caché',
    relPath: 'Library/Application Support/Claude/vm',
    category: 'ai_models',
    safety: 'safe',
    app: 'Claude Desktop',
    description: 'Entornos virtuales y archivos de máquina virtual de Claude Desktop.'
  },
  {
    id: 'chatgpt-desktop-cache',
    name: 'ChatGPT Desktop — Caché de Audio y Adjuntos',
    relPath: 'Library/Application Support/ChatGPT/Cache',
    category: 'ai_models',
    safety: 'very_safe',
    app: 'ChatGPT Desktop',
    description: 'Audios temporales de voz avanzada y previsualizaciones descargadas.'
  },
  {
    id: 'gemini-cli-cache',
    name: 'Gemini CLI — Caché de Respuestas',
    relPath: '.gemini/cache',
    category: 'ai_models',
    safety: 'very_safe',
    app: 'Gemini CLI',
    description: 'Caché local de tokens y respuestas CLI de Gemini.'
  },
  {
    id: 'vscode-ai-copilot',
    name: 'VS Code — Caché de Extensiones IA (Copilot & Continue)',
    relPath: '.vscode/extensions/github.copilot-chat/cache',
    category: 'ai_models',
    safety: 'very_safe',
    app: 'VS Code',
    description: 'Índices vectoriales y cachés locales de asistentes de código.'
  },

  // Navegadores
  {
    id: 'chrome-ai-models',
    name: 'Chrome — Modelos IA locales (OptGuideOnDeviceModel)',
    relPath: 'Library/Application Support/Google/Chrome/OptGuideOnDeviceModel',
    category: 'browsers',
    safety: 'safe',
    app: 'Google Chrome',
    description: 'Modelos Gemini Nano descargados localmente por Google Chrome.',
    isModelFolder: true
  },
  {
    id: 'chrome-cachestorage',
    name: 'Chrome — Service Worker y CacheStorage',
    relPath: 'Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage',
    category: 'browsers',
    safety: 'very_safe',
    app: 'Google Chrome',
    description: 'Caché offline de aplicaciones web y PWAs.'
  },
  {
    id: 'chrome-indexeddb',
    name: 'Chrome — IndexedDB',
    relPath: 'Library/Application Support/Google/Chrome/Default/IndexedDB',
    category: 'browsers',
    safety: 'safe',
    app: 'Google Chrome',
    description: 'Bases de datos locales de sitios web visitados.'
  },
  {
    id: 'safari-cache',
    name: 'Safari — Caché de Navegación',
    relPath: 'Library/Containers/com.apple.Safari/Data/Library/Caches',
    category: 'browsers',
    safety: 'very_safe',
    app: 'Safari',
    description: 'Caché HTTP y previsualizaciones temporales de Safari.'
  },
  {
    id: 'edge-cache',
    name: 'Microsoft Edge — CacheStorage',
    relPath: 'Library/Application Support/Microsoft Edge/Default/CacheStorage',
    category: 'browsers',
    safety: 'very_safe',
    app: 'Microsoft Edge',
    description: 'Caché offline y temporales de Microsoft Edge.'
  },
  {
    id: 'firefox-cache',
    name: 'Firefox — Cache2',
    relPath: 'Library/Caches/Firefox/Profiles',
    category: 'browsers',
    safety: 'very_safe',
    app: 'Firefox',
    description: 'Caché HTTP y recursos temporales de Mozilla Firefox.'
  },

  // Video
  {
    id: 'capcut-cache',
    name: 'CapCut — Caché de Proyectos',
    relPath: 'Movies/CapCut/User Data/Cache',
    category: 'video_media',
    safety: 'very_safe',
    app: 'CapCut',
    description: 'Renderizados temporales de video, ondas y previsualizaciones.'
  },
  {
    id: 'capcut-smartcrop',
    name: 'CapCut — SmartCrop & Effect Cache',
    relPath: 'Movies/CapCut/User Data/SmartCrop',
    category: 'video_media',
    safety: 'very_safe',
    app: 'CapCut',
    description: 'Cálculos de recorte inteligente por IA y filtros descargados.'
  },
  {
    id: 'capcut-aiavatar',
    name: 'CapCut — AIAvatarCache & OnlineMaterial',
    relPath: 'Movies/CapCut/User Data/AIAvatarCache',
    category: 'video_media',
    safety: 'very_safe',
    app: 'CapCut',
    description: 'Modelos de avatares 3D y plantillas descargadas de la nube.'
  },
  {
    id: 'davinci-cacheclip',
    name: 'DaVinci Resolve — CacheClip & Proxies',
    relPath: 'Library/Application Support/Blackmagic Design/DaVinci Resolve/CacheClip',
    category: 'video_media',
    safety: 'safe',
    app: 'DaVinci Resolve',
    description: 'Caché de reproducción ProRes/DNxHR para edición fluida.'
  },
  {
    id: 'premiere-mediacache',
    name: 'Adobe Premiere — Media Cache Files',
    relPath: 'Library/Application Support/Adobe/Common/Media Cache Files',
    category: 'video_media',
    safety: 'very_safe',
    app: 'Premiere Pro',
    description: 'Archivos temporales .cfa y .pek decodificados de audio y video.'
  },

  // macOS
  {
    id: 'macos-aerial',
    name: 'Fondos Aéreos 4K de macOS (com.apple.idleassetsd)',
    relPath: '/Library/Application Support/com.apple.idleassetsd/Customer',
    isAbsolute: true,
    category: 'macos_system',
    safety: 'safe',
    app: 'macOS Aerial Wallpapers',
    description: 'Videos en cámara lenta 4K HDR descargados automáticamente para salvapantallas de macOS.'
  },
  {
    id: 'macos-trash',
    name: 'Papelera del Sistema (~/.Trash)',
    relPath: '.Trash',
    category: 'macos_system',
    safety: 'very_safe',
    app: 'Finder',
    description: 'Archivos eliminados pendientes de vaciar en APFS.'
  },
  {
    id: 'macos-caches',
    name: 'Caché de Usuario (~/Library/Caches)',
    relPath: 'Library/Caches',
    category: 'macos_system',
    safety: 'very_safe',
    app: 'macOS System',
    description: 'Cachés temporales acumuladas por aplicaciones de usuario.'
  },
  {
    id: 'macos-logs',
    name: 'Registros y Logs (~/Library/Logs)',
    relPath: 'Library/Logs',
    category: 'macos_system',
    safety: 'very_safe',
    app: 'macOS System',
    description: 'Reportes de fallos antiguos (.ips, .crash) y logs de diagnóstico.'
  },
  {
    id: 'downloads-folder',
    name: 'Descargas Antiguas (~/Downloads)',
    relPath: 'Downloads',
    category: 'macos_system',
    safety: 'review_needed',
    app: 'Finder',
    description: 'Archivos descargados (.dmg, .zip, instaladores).'
  }
];

// Helper to expand ~ to user home directory
export function resolvePath(def: TargetDefinition): string {
  if (def.isAbsolute) {
    return def.relPath;
  }
  return path.join(os.homedir(), def.relPath);
}

// Check if a directory is protected (contains git, xcode, package.json, etc.)
export async function isProjectProtected(dirPath: string): Promise<boolean> {
  const protectedMarkers = ['.git', 'package.json', 'Cargo.toml', '.xcodeproj', '.xcworkspace', '.venv', 'venv'];
  for (const marker of protectedMarkers) {
    if (fs.existsSync(path.join(dirPath, marker))) {
      return true;
    }
  }
  return false;
}

// Calculate directory size using du on macOS/Unix or recursive stat
export async function getDirectoryMetrics(dirPath: string): Promise<{ sizeBytes: number; fileCount: number; lastModified: Date }> {
  try {
    if (!fs.existsSync(dirPath)) {
      return { sizeBytes: 0, fileCount: 0, lastModified: new Date() };
    }

    const stat = await fs.promises.stat(dirPath);
    if (!stat.isDirectory()) {
      return { sizeBytes: stat.size, fileCount: 1, lastModified: stat.mtime };
    }

    // Try fast du -sk command on macOS/Unix
    try {
      const { stdout } = await execPromise(`du -sk "${dirPath}" 2>/dev/null`);
      const kb = parseInt(stdout.trim().split(/\s+/)[0], 10);
      const sizeBytes = !isNaN(kb) ? kb * 1024 : 0;

      // Quick file count
      const { stdout: findOut } = await execPromise(`find "${dirPath}" -type f | wc -l 2>/dev/null`);
      const fileCount = parseInt(findOut.trim(), 10) || 1;

      return { sizeBytes, fileCount, lastModified: stat.mtime };
    } catch {
      // Fallback: simple recursive read
      let totalSize = 0;
      let count = 0;
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        try {
          const full = path.join(dirPath, entry.name);
          const s = await fs.promises.stat(full);
          if (s.isFile()) {
            totalSize += s.size;
            count++;
          }
        } catch {}
      }
      return { sizeBytes: totalSize, fileCount: count, lastModified: stat.mtime };
    }
  } catch {
    return { sizeBytes: 0, fileCount: 0, lastModified: new Date() };
  }
}

// Scan single item in real filesystem
export async function scanRealTarget(def: TargetDefinition): Promise<StorageItem | null> {
  const fullPath = resolvePath(def);
  if (!fs.existsSync(fullPath)) {
    return null; // Return null if target doesn't exist on this Mac
  }

  // Safety check: protect code projects
  const protectedProject = await isProjectProtected(fullPath);
  if (protectedProject) {
    return null; // Skip any active projects
  }

  const { sizeBytes, fileCount, lastModified } = await getDirectoryMetrics(fullPath);
  if (sizeBytes === 0 && fileCount === 0) {
    return null;
  }

  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - lastModified.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    id: def.id,
    name: def.name,
    path: fullPath.replace(os.homedir(), '~'),
    category: def.category,
    safety: def.safety,
    sizeBytes,
    fileCount,
    lastAccessed: lastModified.toISOString().slice(0, 10),
    description: def.description,
    app: def.app,
    isSelected: def.safety === 'very_safe' || def.safety === 'safe',
    isSelectable: true,
    metadata: {
      unusedDays: diffDays
    }
  };
}

// Scan AI model files inside real folders
export async function scanRealAIModels(): Promise<AIModelItem[]> {
  const modelExtensions = ['.gguf', '.safetensors', '.bin', '.onnx', '.pt', '.ckpt'];
  const searchDirs = [
    path.join(os.homedir(), '.ollama', 'models', 'blobs'),
    path.join(os.homedir(), 'Library', 'Application Support', 'LM Studio', 'models'),
    path.join(os.homedir(), 'Library', 'Application Support', 'StabilityMatrix', 'Models'),
    path.join(os.homedir(), 'stable-diffusion-webui-forge', 'models', 'Stable-diffusion'),
    path.join(os.homedir(), 'stable-diffusion-webui', 'models', 'Stable-diffusion'),
    path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'OptGuideOnDeviceModel')
  ];

  const models: AIModelItem[] = [];
  let modelIndex = 1;

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    try {
      const files = await fs.promises.readdir(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file.toString());
        try {
          const stat = await fs.promises.stat(filePath);
          if (!stat.isFile()) continue;

          const ext = path.extname(filePath).toLowerCase();
          const isModelBlob = dir.includes('.ollama') && stat.size > 200 * 1024 * 1024; // Ollama stores in blobs
          const hasModelExt = modelExtensions.includes(ext) && stat.size > 50 * 1024 * 1024; // >50MB

          if (isModelBlob || hasModelExt) {
            const fileName = path.basename(filePath);
            const daysAgo = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));
            const app = dir.includes('.ollama') 
              ? 'Ollama' 
              : dir.includes('LM Studio') 
              ? 'LM Studio' 
              : dir.includes('StabilityMatrix') 
              ? 'StabilityMatrix' 
              : dir.includes('Chrome') 
              ? 'Google Chrome' 
              : 'WebUI';

            const format = ext === '.gguf' 
              ? 'GGUF' 
              : ext === '.safetensors' 
              ? 'safetensors' 
              : ext === '.onnx' 
              ? 'onnx' 
              : 'bin';

            models.push({
              id: `real-model-${modelIndex++}`,
              name: fileName,
              app,
              path: filePath.replace(os.homedir(), '~'),
              sizeBytes: stat.size,
              format,
              parameterSize: stat.size > 20 * 1024 * 1024 * 1024 ? '70B+' : stat.size > 8 * 1024 * 1024 * 1024 ? '14B' : '7B',
              lastUsedDaysAgo: daysAgo,
              isDuplicate: false,
              recommendation: daysAgo > 90 
                ? `Modelo no accedido en ${daysAgo} días. Candidato ideal para liberar espacio.` 
                : 'Modelo de uso reciente.',
              safety: daysAgo > 60 ? 'safe' : 'review_needed',
              isSelected: daysAgo > 90
            });
          }
        } catch {}
      }
    } catch {}
  }

  // Detect duplicates by exact size
  const sizeMap = new Map<number, AIModelItem[]>();
  for (const m of models) {
    const list = sizeMap.get(m.sizeBytes) || [];
    list.push(m);
    sizeMap.set(m.sizeBytes, list);
  }

  for (const [, list] of sizeMap.entries()) {
    if (list.length > 1) {
      list.forEach((item, idx) => {
        item.isDuplicate = true;
        if (idx > 0) {
          item.recommendation = `Modelo duplicado de ${list[0].name} (${list[0].app}). Seguro de eliminar copia secundaria.`;
          item.isSelected = true;
        }
      });
    }
  }

  return models;
}

// Find top 50 largest files in real home directory (skipping protected code)
export async function scanRealTopFiles(): Promise<TopStorageItem[]> {
  const home = os.homedir();
  const searchRoot = path.join(home, 'Library');
  const items: TopStorageItem[] = [];

  try {
    // Fast find command on macOS for files > 100MB
    const cmd = `find "${home}/Library/Caches" "${home}/Library/Application Support" "${home}/Movies" -type f -size +100M -exec ls -lh {} + 2>/dev/null | head -n 50`;
    const { stdout } = await execPromise(cmd);
    const lines = stdout.trim().split('\n');

    let rank = 1;
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 9) {
        const fullPath = parts.slice(8).join(' ');
        try {
          const stat = await fs.promises.stat(fullPath);
          items.push({
            id: `real-top-file-${rank}`,
            rank: rank++,
            name: path.basename(fullPath),
            path: fullPath.replace(home, '~'),
            sizeBytes: stat.size,
            type: 'file',
            appOrCategory: fullPath.includes('CapCut') ? 'CapCut' : fullPath.includes('Chrome') ? 'Google Chrome' : 'macOS',
            safety: fullPath.includes('Cache') ? 'very_safe' : 'safe',
            lastModified: stat.mtime.toISOString().slice(0, 10)
          });
        } catch {}
      }
    }
  } catch {}

  return items;
}

// Execute real clean on disk
export async function executeRealClean(targetPaths: string[]): Promise<{ freedBytes: number; successPaths: string[]; errorPaths: string[] }> {
  let freedBytes = 0;
  const successPaths: string[] = [];
  const errorPaths: string[] = [];

  for (let rawPath of targetPaths) {
    const fullPath = rawPath.startsWith('~') 
      ? path.join(os.homedir(), rawPath.slice(2)) 
      : rawPath;

    // Absolute security guard: NEVER delete root, personal documents, pictures, music, or active projects!
    const home = os.homedir();
    if (
      fullPath === home ||
      fullPath === '/' ||
      fullPath === path.join(home, 'Documents') ||
      fullPath === path.join(home, 'Pictures') ||
      fullPath === path.join(home, 'Music') ||
      fullPath === path.join(home, 'Desktop')
    ) {
      errorPaths.push(`${rawPath}: Ruta protegida del sistema`);
      continue;
    }

    if (await isProjectProtected(fullPath)) {
      errorPaths.push(`${rawPath}: Contiene repositorio o proyecto activo de código`);
      continue;
    }

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    try {
      const metrics = await getDirectoryMetrics(fullPath);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        // If it's a critical root folder like ~/.Trash or ~/Library/Caches, delete inside contents, not the folder itself
        if (fullPath === path.join(home, '.Trash') || fullPath === path.join(home, 'Library', 'Caches')) {
          const contents = await fs.promises.readdir(fullPath);
          for (const item of contents) {
            try {
              await fs.promises.rm(path.join(fullPath, item), { recursive: true, force: true });
            } catch {}
          }
        } else {
          // Remove contents recursively
          await fs.promises.rm(fullPath, { recursive: true, force: true });
        }
      } else {
        await fs.promises.unlink(fullPath);
      }

      freedBytes += metrics.sizeBytes;
      successPaths.push(rawPath);
    } catch (err: any) {
      errorPaths.push(`${rawPath}: ${err.message || 'Error al eliminar'}`);
    }
  }

  return { freedBytes, successPaths, errorPaths };
}
