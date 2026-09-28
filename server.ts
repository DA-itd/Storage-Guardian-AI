import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { 
  TARGET_DEFINITIONS, 
  scanRealTarget, 
  scanRealAIModels, 
  scanRealTopFiles, 
  executeRealClean,
  resolvePath 
} from './realStorageScanner.js';
import { StorageItem, AIModelItem, DiskSpaceInfo } from './src/types/storage.js';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Reads real disk capacity and free space using standard df command on macOS/Unix
async function getRealSystemDiskInfo(): Promise<DiskSpaceInfo> {
  let totalBytes = 512 * 1024 * 1024 * 1024;
  let freeBytes = 14 * 1024 * 1024 * 1024;

  try {
    const { stdout } = await execPromise('df -k /');
    const lines = stdout.trim().split('\n');
    if (lines.length >= 2) {
      const parts = lines[1].replace(/\s+/g, ' ').split(' ');
      if (parts.length >= 4) {
        const totalKb = parseInt(parts[1], 10);
        const freeKb = parseInt(parts[3], 10);
        if (!isNaN(totalKb) && !isNaN(freeKb)) {
          totalBytes = totalKb * 1024;
          freeBytes = freeKb * 1024;
        }
      }
    }
  } catch (err) {
    console.error('Error al leer métricas de disco df:', err);
  }

  const usedBytes = Math.max(0, totalBytes - freeBytes);
  const usedPercent = Math.min(100, Math.round((usedBytes / totalBytes) * 100));
  const emergencyThresholdBytes = 15 * 1024 * 1024 * 1024; // 15 GB

  // Read macOS details if on darwin
  const isMac = process.platform === 'darwin';
  let macVersion = isMac ? 'macOS Sequoia' : `${os.type()} ${os.release()}`;
  let arch = process.arch === 'arm64' ? 'Apple Silicon (arm64)' : `${process.arch}`;

  if (isMac) {
    try {
      const { stdout: swVers } = await execPromise('sw_vers -productVersion');
      macVersion = `macOS ${swVers.trim()}`;
    } catch {}
    try {
      const { stdout: unameM } = await execPromise('uname -m');
      arch = unameM.trim() === 'arm64' ? 'Apple Silicon (arm64)' : 'Intel (x86_64)';
    } catch {}
  }

  return {
    totalBytes,
    usedBytes,
    freeBytes,
    usedPercent,
    isEmergency: freeBytes <= emergencyThresholdBytes,
    emergencyThresholdBytes,
    macOSVersion: macVersion,
    architecture: arch,
    fileSystem: isMac ? 'APFS' : 'ext4/APFS',
    lastScanTimestamp: new Date().toISOString()
  };
}

// 1. Status API: Real disk metrics
app.get('/api/system/status', async (_req: Request, res: Response) => {
  const diskInfo = await getRealSystemDiskInfo();
  res.json(diskInfo);
});

// 2. Real Scan API: Scans actual folders on the machine
app.get('/api/scan/real', async (_req: Request, res: Response) => {
  try {
    const items: StorageItem[] = [];

    // Scan each real target
    for (const def of TARGET_DEFINITIONS) {
      try {
        const item = await scanRealTarget(def);
        if (item) {
          items.push(item);
        }
      } catch {}
    }

    const aiModels = await scanRealAIModels();
    const diskInfo = await getRealSystemDiskInfo();

    res.json({
      items,
      aiModels,
      diskInfo,
      scannedCount: TARGET_DEFINITIONS.length,
      foundCount: items.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error durante el escaneo real del disco' });
  }
});

// 3. Top Files API: Real largest files in user directories
app.get('/api/scan/top-files', async (_req: Request, res: Response) => {
  try {
    const topFiles = await scanRealTopFiles();
    res.json({ topFiles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Real Cleaning API: Executes actual deletion of selected targets
app.post('/api/clean/execute', async (req: Request, res: Response) => {
  try {
    const { targetPaths } = req.body; // Array of paths to delete e.g. ["~/Library/Caches/...", ...]

    if (!Array.isArray(targetPaths) || targetPaths.length === 0) {
      return res.status(400).json({ error: 'No se enviaron rutas válidas para limpiar.' });
    }

    const result = await executeRealClean(targetPaths);
    const newDiskInfo = await getRealSystemDiskInfo();

    res.json({
      success: true,
      freedBytes: result.freedBytes,
      successPaths: result.successPaths,
      errorPaths: result.errorPaths,
      newDiskInfo
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error ejecutando limpieza real' });
  }
});

// 5. Test Daemon Run: Executes the actual cleanup script in scripts/storage-guardian-cli.sh
app.post('/api/daemon/run-test', async (_req: Request, res: Response) => {
  try {
    const scriptPath = path.resolve(__dirname, 'scripts', 'storage-guardian-cli.sh');
    const { stdout, stderr } = await execPromise(`/bin/bash "${scriptPath}" clean safe 15`);
    res.json({
      success: true,
      output: stdout || stderr
    });
  } catch (err: any) {
    res.json({
      success: false,
      output: `[${new Date().toLocaleTimeString()}] Aviso: ${err.message}`
    });
  }
});

// Mount Vite or static server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Storage Guardian AI] Servidor REAL de macOS en ejecución en http://0.0.0.0:${PORT}`);
  });
}

startServer();
