export type BiometricType = 'fingerprint' | 'face_id' | 'both';

export type AuthMethod = 
  | 'biometric_fingerprint' 
  | 'biometric_faceid' 
  | 'webauthn_hardware' 
  | 'pin_backup';

export interface ClientProfile {
  id: string;
  name: string;
  shortName: string;
  label: string; // e.g. "Cliente X"
  cpf: string;
  agency: string;
  accountNumber: string;
  accountType: 'Conta Corrente' | 'Conta Digital Premium' | 'Conta PJ';
  pixKey: string;
  pixKeyType: 'email' | 'cpf' | 'phone' | 'random';
  balance: number;
  creditLimit: number;
  savingsBalance: number;
  avatarUrl: string;
  biometrics: {
    enabled: boolean;
    type: BiometricType;
    deviceName: string;
    hardwareBacked: boolean;
    lastAuthTime: string;
    registeredAt: string;
    requireBiometricsAbove: number; // in BRL, e.g. 0 = always require
    dailyLimit: number;
    usedDailyLimit: number;
    fraudScore: 'Seguro' | 'Moderado' | 'Alto';
  };
}

export interface BeneficiaryContact {
  id: string;
  name: string;
  cpf: string;
  bankName: string;
  bankCode: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
  avatarBg: string;
  initials: string;
  isFavorite: boolean;
  clientId?: string; // If this contact maps to another client in the system
}

export interface Transaction {
  id: string;
  type: 'pix_out' | 'pix_in' | 'ted' | 'boleto' | 'transfer';
  title: string;
  amount: number;
  timestamp: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientName: string;
  recipientBank: string;
  recipientPixKey?: string;
  status: 'completed' | 'pending_biometrics' | 'failed' | 'cancelled';
  authMethod?: AuthMethod;
  authHash?: string;
  e2eId: string;
  description?: string;
  category: 'Alimentação' | 'Serviços' | 'Transferência' | 'Lazer' | 'Outros';
}

export type ChatCardType = 
  | 'welcome'
  | 'balance'
  | 'transfer_prompt'
  | 'transfer_pending'
  | 'transfer_success_receipt'
  | 'statement'
  | 'contacts_list'
  | 'security_status'
  | 'limits_config';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  cardType?: ChatCardType;
  cardData?: any;
  quickReplies?: string[];
}
