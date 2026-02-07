export enum IntelType {
  JAILBREAK = 'JAILBREAK',
  OPTIMIZER = 'OPTIMIZER',
  INJECTION = 'INJECTION',
  LEAK = 'LEAK',
  DEFENSE = 'DEFENSE',
  SYSTEM_PROMPT = 'SYSTEM_PROMPT'
}

export type TeamType = 'RED' | 'BLUE';

export interface IntelItem {
  id: string;
  type: IntelType;
  team: TeamType;
  title: string;
  content: string;
  sourceUrl?: string;
  timestamp: string;
  impactScore: number; // 0-100 (Red = Severity, Blue = Efficiency)
  model: string;
}

export interface ModelOption {
  id: string;
  name: string;
  version: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface MiningStats {
  vaultCount: number;
  lastFound: string;
  activeModel: string;
  status: 'IDLE' | 'MINING' | 'ANALYZING' | 'DECRYPTING';
}