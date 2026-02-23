// ─── Transaction result ─────────────────────────────────────
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// ─── Vault data from contract ───────────────────────────────
export interface VaultInfo {
  admin: string;
  token: string;
  totalDeposited: number;
  depositCount: number;
}

export interface UserVault {
  balance: number;
  timelock: number; // UNIX timestamp, 0 = no lock
}

// ─── SVT Token data (Green Belt) ────────────────────────────
export interface SvtTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

export interface RewardInfo {
  rewardToken: string;
  rewardRate: number; // basis points
}

// ─── Events ─────────────────────────────────────────────────
export interface VaultEvent {
  type: 'deposit' | 'withdraw' | 'lock' | 'reward' | 'mint';
  user: string;
  amount?: number;
  unlockTime?: number;
  timestamp: number;
  txHash: string;
}

// ─── Errors ─────────────────────────────────────────────────
export enum AppErrorType {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  FUNDS_TIMELOCKED = 'FUNDS_TIMELOCKED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
}

export interface AppError {
  type: AppErrorType;
  message: string;
  details?: string;
}

// ─── Wallet ─────────────────────────────────────────────────
export type WalletType = 'freighter' | 'albedo' | 'xbull';
