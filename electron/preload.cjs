const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('macStorageGuardian', {
  platform: process.platform,
  arch: process.arch,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
