export type ScanCategory = 'ai_models' | 'browsers' | 'video_media' | 'macos_system';

export type SafetyLevel = 'very_safe' | 'safe' | 'review_needed' | 'protected';

export interface StorageItem {
  id: string;
  name: string;
  path: string;
  category: ScanCategory;
  safety: SafetyLevel;
  sizeBytes: number;
  fileCount: number;
  lastAccessed: string;
  description: string;
  app: string;
  isSelected: boolean;
  isSelectable: boolean;
  metadata?: {
    unusedDays?: number;
    isDuplicate?: boolean;
    format?: string;
    isProject?: boolean;
    duplicateOf?: string;
    suggestedEmergencyOrder?: number;
  };
}

export interface DiskSpaceInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercent: number;
  isEmergency: boolean;
  emergencyThresholdBytes: number; // e.g. 15 GB
  macOSVersion: string;
  architecture: string;
  fileSystem: string;
  lastScanTimestamp: string;
}

export interface AIModelItem {
  id: string;
  name: string;
  app: string;
  path: string;
  sizeBytes: number;
  format: 'GGUF' | 'safetensors' | 'checkpoint' | 'diffusers' | 'onnx' | 'bin';
  parameterSize: string;
  lastUsedDaysAgo: number;
  isDuplicate: boolean;
  duplicateGroup?: string;
  recommendation: string;
  safety: SafetyLevel;
  isSelected?: boolean;
}

export interface TopStorageItem {
  id: string;
  rank: number;
  name: string;
  path: string;
  sizeBytes: number;
  type: 'file' | 'folder';
  appOrCategory: string;
  safety: SafetyLevel;
  lastModified: string;
}

export interface DailyGrowthPoint {
  date: string;
  dayLabel: string;
  usedGB: number;
  cleanedGB: number;
  growthGB: number;
}

export interface AppConsumptionItem {
  appName: string;
  category: ScanCategory;
  totalSizeBytes: number;
  recoverableBytes: number;
  iconType: string;
  safety: SafetyLevel;
}

export interface ExclusionRule {
  id: string;
  name: string;
  pathPattern: string;
  type: 'project_marker' | 'directory' | 'extension';
  isDefaultProtected: boolean;
  isEnabled: boolean;
  description: string;
}

export interface LaunchdConfig {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  cleanSafetyLevels: SafetyLevel[];
  emergencyAutoClean: boolean;
  emergencyThresholdGB: number;
  notifyOnCompletion: boolean;
  plistPath: string;
  scriptPath: string;
}

export interface SimulationResult {
  totalItems: number;
  totalSizeBytes: number;
  itemsBySafety: {
    very_safe: { count: number; bytes: number };
    safe: { count: number; bytes: number };
    review_needed: { count: number; bytes: number };
  };
  appsAffected: string[];
  protectedSkippedCount: number;
  estimatedDiskFreeAfterGB: number;
  estimatedFreedGB: number;
}

export interface EmergencyRescuePlan {
  currentFreeGB: number;
  targetTargetFreeGB: number;
  neededRecoveryGB: number;
  isCritical: boolean;
  steps: {
    phase: number;
    title: string;
    description: string;
    items: StorageItem[];
    recoverableBytes: number;
    safety: SafetyLevel;
  }[];
  totalEmergencyRecoverableBytes: number;
}
