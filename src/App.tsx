import React, { useState, useEffect } from 'react';
import { WindowHeader } from './components/WindowHeader';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IntelligentScanner } from './components/IntelligentScanner';
import { AIModelAuditor } from './components/AIModelAuditor';
import { TopReports } from './components/TopReports';
import { ScheduledCleaner } from './components/ScheduledCleaner';
import { DataProtection } from './components/DataProtection';
import { EmergencyRescueModal } from './components/EmergencyRescueModal';
import { SimulationModal } from './components/SimulationModal';

import { DiskSpaceInfo, StorageItem, AIModelItem, SafetyLevel } from './types/storage';
import { 
  INITIAL_STORAGE_ITEMS, 
  INITIAL_AI_MODELS 
} from './services/storageScanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [items, setItems] = useState<StorageItem[]>(INITIAL_STORAGE_ITEMS);
  const [aiModels, setAiModels] = useState<AIModelItem[]>(INITIAL_AI_MODELS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [lastCleanResult, setLastCleanResult] = useState<{ freedBytes: number; successPaths: string[]; errorPaths: string[] } | null>(null);

  const [diskInfo, setDiskInfo] = useState<DiskSpaceInfo>({
    totalBytes: 512 * 1024 * 1024 * 1024,
    usedBytes: (512 - 13.8) * 1024 * 1024 * 1024,
    freeBytes: 13.8 * 1024 * 1024 * 1024,
    usedPercent: 97,
    isEmergency: true,
    emergencyThresholdBytes: 15 * 1024 * 1024 * 1024,
    macOSVersion: 'macOS 15.3 Sequoia',
    architecture: 'Apple Silicon (M3 Max / arm64e)',
    fileSystem: 'APFS (Encrypted)',
    lastScanTimestamp: new Date().toISOString()
  });

  // 1. Fetch real disk status and perform real filesystem scan on mount
  const runRealScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan/real');
      if (res.ok) {
        const data = await res.json();
        if (data.diskInfo) {
          setDiskInfo(data.diskInfo);
        }
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
        if (Array.isArray(data.aiModels)) {
          setAiModels(data.aiModels);
        }
      } else {
        // Fallback status check
        const statusRes = await fetch('/api/system/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setDiskInfo(statusData);
        }
      }
    } catch (err) {
      console.error('Error al realizar escaneo real:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runRealScan();
  }, []);

  // Handlers for Scanner Selection
  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const handleSelectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isSelected: false })));
  };

  const handleSelectBySafety = (safety: SafetyLevel) => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: item.safety === safety }))
    );
  };

  const handleRefreshScan = () => {
    runRealScan();
  };

  // 2. Real Cleaning Execution on filesystem
  const handleExecuteCleaning = async (selectedIds: string[], estimatedFreedBytes: number) => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    const targetPaths = selectedItems.map((i) => i.path);

    try {
      const res = await fetch('/api/clean/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPaths })
      });

      if (res.ok) {
        const data = await res.json();
        setLastCleanResult({
          freedBytes: data.freedBytes || estimatedFreedBytes,
          successPaths: data.successPaths || targetPaths,
          errorPaths: data.errorPaths || []
        });

        if (data.newDiskInfo) {
          setDiskInfo(data.newDiskInfo);
        } else {
          setDiskInfo((prev) => {
            const newFree = Math.min(prev.totalBytes, prev.freeBytes + (data.freedBytes || estimatedFreedBytes));
            const newUsed = Math.max(0, prev.totalBytes - newFree);
            return {
              ...prev,
              freeBytes: newFree,
              usedBytes: newUsed,
              usedPercent: Math.round((newUsed / prev.totalBytes) * 100),
              isEmergency: newFree <= prev.emergencyThresholdBytes
            };
          });
        }

        // Remove cleaned items or update size
        setItems((prev) =>
          prev.map((item) => {
            if (selectedIds.includes(item.id)) {
              return {
                ...item,
                sizeBytes: 0,
                fileCount: 0,
                isSelected: false
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.error('Error al ejecutar limpieza real:', err);
    }
  };

  // Emergency Rescue
  const handleExecuteRescue = (itemIds: string[], freedBytes: number) => {
    handleExecuteCleaning(itemIds, freedBytes);
  };

  // AI Models Handlers
  const handleToggleModel = (id: string) => {
    setAiModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSelected: !m.isSelected } : m))
    );
  };

  const handlePruneSelectedModels = async (modelIds: string[], estimatedFreedBytes: number) => {
    const selected = aiModels.filter((m) => modelIds.includes(m.id));
    const targetPaths = selected.map((m) => m.path);

    try {
      await fetch('/api/clean/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPaths })
      });
      setAiModels((prev) => prev.filter((m) => !modelIds.includes(m.id)));
      runRealScan();
    } catch (err) {
      console.error('Error al purgar modelos:', err);
    }
  };

  // Total recoverable bytes
  const totalRecoverableBytes = items
    .filter((i) => i.safety === 'very_safe' || i.safety === 'safe')
    .reduce((acc, i) => acc + i.sizeBytes, 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Window Header */}
      <WindowHeader
        diskInfo={diskInfo}
        isScanning={isScanning}
        onRefreshScan={handleRefreshScan}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onResetDemo={handleRefreshScan}
        recoverableBytes={totalRecoverableBytes}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          diskInfo={diskInfo}
          pendingItemsCount={items.filter((i) => i.isSelected).length}
          aiModelsCount={aiModels.length}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-900/30">
          {activeTab === 'dashboard' && (
            <Dashboard
              diskInfo={diskInfo}
              items={items}
              onNavigateToScan={() => setActiveTab('scan')}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'scan' && (
            <IntelligentScanner
              items={items}
              diskInfo={diskInfo}
              isScanning={isScanning}
              onRefreshScan={handleRefreshScan}
              onToggleItem={handleToggleItem}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSelectBySafety={handleSelectBySafety}
              onOpenSimulation={() => setIsSimulationModalOpen(true)}
              onExecuteCleaning={handleExecuteCleaning}
            />
          )}

          {activeTab === 'models' && (
            <AIModelAuditor
              models={aiModels}
              onToggleModel={handleToggleModel}
              onPruneSelectedModels={handlePruneSelectedModels}
            />
          )}

          {activeTab === 'reports' && (
            <TopReports items={items} />
          )}

          {activeTab === 'launchd' && (
            <ScheduledCleaner />
          )}

          {activeTab === 'protection' && (
            <DataProtection />
          )}
        </main>
      </div>

      {/* Emergency Rescue Modal */}
      <EmergencyRescueModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        diskInfo={diskInfo}
        items={items}
        onExecuteRescue={handleExecuteRescue}
        onUpdateThreshold={(val) => {
          setDiskInfo((prev) => ({
            ...prev,
            emergencyThresholdBytes: val * 1024 * 1024 * 1024
          }));
        }}
      />

      {/* Simulation Dry Run Modal */}
      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        items={items}
        diskInfo={diskInfo}
        onConfirmClean={() => {
          const selected = items.filter((i) => i.isSelected);
          const bytes = selected.reduce((acc, i) => acc + i.sizeBytes, 0);
          handleExecuteCleaning(selected.map((i) => i.id), bytes);
        }}
      />
    </div>
  );
}
