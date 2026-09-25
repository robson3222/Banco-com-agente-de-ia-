import { ClientProfile, BeneficiaryContact, Transaction } from '../types/bank';

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'cliente-x',
    name: 'Carlos Eduardo da Silva',
    shortName: 'Carlos',
    label: 'Cliente X (Titular)',
    cpf: '348.912.408-72',
    agency: '0001',
    accountNumber: '48291-5',
    accountType: 'Conta Digital Premium',
    pixKey: 'carlos.eduardo@nexusbank.br',
    pixKeyType: 'email',
    balance: 14850.50,
    creditLimit: 12000.00,
    savingsBalance: 32400.00,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    biometrics: {
      enabled: true,
      type: 'both',
      deviceName: 'Nexus Secure Enclave (Touch ID / Face ID)',
      hardwareBacked: true,
      lastAuthTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      registeredAt: '2025-01-15T10:30:00.000Z',
      requireBiometricsAbove: 0, // always required for security
      dailyLimit: 25000.00,
      usedDailyLimit: 1420.00,
      fraudScore: 'Seguro',
    }
  },
  {
    id: 'cliente-y',
    name: 'Mariana Vasconcelos Ribeiro',
    shortName: 'Mariana',
    label: 'Cliente Y (Empresarial)',
    cpf: '582.143.901-18',
    agency: '0001',
    accountNumber: '92104-3',
    accountType: 'Conta PJ',
    pixKey: 'mariana.ribeiro@pix.me',
    pixKeyType: 'email',
    balance: 8420.80,
    creditLimit: 18000.00,
    savingsBalance: 15200.00,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    biometrics: {
      enabled: true,
      type: 'face_id',
      deviceName: 'Apple Face ID (Enclave v3)',
      hardwareBacked: true,
      lastAuthTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      registeredAt: '2025-02-10T14:15:00.000Z',
      requireBiometricsAbove: 0,
      dailyLimit: 50000.00,
      usedDailyLimit: 3200.00,
      fraudScore: 'Seguro',
    }
  },
  {
    id: 'cliente-z',
    name: 'Roberto Alencar Mendes',
    shortName: 'Roberto',
    label: 'Cliente Z (Investidor)',
    cpf: '719.345.812-44',
    agency: '0001',
    accountNumber: '33519-8',
    accountType: 'Conta Corrente',
    pixKey: '11987654321',
    pixKeyType: 'phone',
    balance: 29540.00,
    creditLimit: 25000.00,
    savingsBalance: 145000.00,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    biometrics: {
      enabled: true,
      type: 'fingerprint',
      deviceName: 'Sensor Biométrico FIDO2',
      hardwareBacked: true,
      lastAuthTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      registeredAt: '2024-11-20T09:00:00.000Z',
      requireBiometricsAbove: 0,
      dailyLimit: 100000.00,
      usedDailyLimit: 0,
      fraudScore: 'Seguro',
    }
  }
];

export const INITIAL_CONTACTS: BeneficiaryContact[] = [
  {
    id: 'c-1',
    name: 'Mariana Vasconcelos Ribeiro',
    cpf: '582.***.***-18',
    bankName: 'NexusBank Digital',
    bankCode: '499',
    pixKey: 'mariana.ribeiro@pix.me',
    pixKeyType: 'email',
    avatarBg: 'from-purple-500 to-indigo-600',
    initials: 'MR',
    isFavorite: true,
    clientId: 'cliente-y'
  },
  {
    id: 'c-2',
    name: 'Carlos Eduardo da Silva',
    cpf: '348.***.***-72',
    bankName: 'NexusBank Digital',
    bankCode: '499',
    pixKey: 'carlos.eduardo@nexusbank.br',
    pixKeyType: 'email',
    avatarBg: 'from-emerald-500 to-teal-700',
    initials: 'CS',
    isFavorite: true,
    clientId: 'cliente-x'
  },
  {
    id: 'c-3',
    name: 'Ana Carolina Dias',
    cpf: '291.***.***-45',
    bankName: 'Nubank S.A.',
    bankCode: '260',
    pixKey: 'anadias@design.io',
    pixKeyType: 'email',
    avatarBg: 'from-pink-500 to-rose-600',
    initials: 'AD',
    isFavorite: true
  },
  {
    id: 'c-4',
    name: 'Dr. Roberto Alencar Mendes',
    cpf: '719.***.***-44',
    bankName: 'NexusBank Digital',
    bankCode: '499',
    pixKey: '11987654321',
    pixKeyType: 'phone',
    avatarBg: 'from-blue-500 to-cyan-600',
    initials: 'RA',
    isFavorite: true,
    clientId: 'cliente-z'
  },
  {
    id: 'c-5',
    name: 'Mercado Central Gourmet',
    cpf: '12.345.678/0001-90',
    bankName: 'Banco Itaú Unibanco',
    bankCode: '341',
    pixKey: 'pagamentos@mercadogourmet.com.br',
    pixKeyType: 'email',
    avatarBg: 'from-amber-500 to-orange-600',
    initials: 'MC',
    isFavorite: false
  },
  {
    id: 'c-6',
    name: 'Lucas Ferreira Guimarães',
    cpf: '402.***.***-33',
    bankName: 'Banco Inter',
    bankCode: '077',
    pixKey: 'lucas.fg@gmail.com',
    pixKeyType: 'email',
    avatarBg: 'from-emerald-600 to-teal-800',
    initials: 'LF',
    isFavorite: false
  }
];

export const INITIAL_TRANSACTIONS: Record<string, Transaction[]> = {
  'cliente-x': [
    {
      id: 'tx-101',
      type: 'pix_out',
      title: 'Transferência PIX enviada',
      amount: 450.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      senderId: 'cliente-x',
      senderName: 'Carlos Eduardo da Silva',
      recipientName: 'Mariana Vasconcelos Ribeiro',
      recipientBank: 'NexusBank Digital',
      recipientPixKey: 'mariana.ribeiro@pix.me',
      status: 'completed',
      authMethod: 'biometric_fingerprint',
      authHash: 'BIO-SHA256-4b89f02e9a3b11',
      e2eId: 'E4990001202509241645a892b11f',
      description: 'Aluguel do estúdio fotográfico',
      category: 'Serviços'
    },
    {
      id: 'tx-102',
      type: 'pix_in',
      title: 'PIX recebido',
      amount: 2800.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      senderId: 'ext-99',
      senderName: 'Consultoria Alpha Corp',
      recipientName: 'Carlos Eduardo da Silva',
      recipientBank: 'NexusBank Digital',
      status: 'completed',
      e2eId: 'E0010001202509240830c492d33e',
      description: 'Pagamento de honorários projeto TI',
      category: 'Serviços'
    },
    {
      id: 'tx-103',
      type: 'pix_out',
      title: 'Pagamento PIX',
      amount: 89.90,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      senderId: 'cliente-x',
      senderName: 'Carlos Eduardo da Silva',
      recipientName: 'Mercado Central Gourmet',
      recipientBank: 'Banco Itaú',
      status: 'completed',
      authMethod: 'biometric_faceid',
      authHash: 'BIO-SHA256-91e843cda188',
      e2eId: 'E3410001202509231920e8841a29',
      category: 'Alimentação'
    }
  ],
  'cliente-y': [
    {
      id: 'tx-201',
      type: 'pix_in',
      title: 'Transferência PIX recebida',
      amount: 450.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      senderId: 'cliente-x',
      senderName: 'Carlos Eduardo da Silva',
      recipientName: 'Mariana Vasconcelos Ribeiro',
      recipientBank: 'NexusBank Digital',
      status: 'completed',
      e2eId: 'E4990001202509241645a892b11f',
      description: 'Aluguel do estúdio fotográfico',
      category: 'Serviços'
    },
    {
      id: 'tx-202',
      type: 'pix_out',
      title: 'PIX Fornecedores',
      amount: 1200.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      senderId: 'cliente-y',
      senderName: 'Mariana Vasconcelos Ribeiro',
      recipientName: 'Distribuidora Papel & Arte',
      recipientBank: 'Banco do Brasil',
      status: 'completed',
      authMethod: 'biometric_faceid',
      authHash: 'BIO-SHA256-fc88921dae',
      e2eId: 'E0010001202509241100f992019a',
      category: 'Outros'
    }
  ],
  'cliente-z': [
    {
      id: 'tx-301',
      type: 'pix_out',
      title: 'Aporte Carteira',
      amount: 5000.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      senderId: 'cliente-z',
      senderName: 'Roberto Alencar Mendes',
      recipientName: 'XP Investimentos CCTVM',
      recipientBank: 'Banco XP',
      status: 'completed',
      authMethod: 'biometric_fingerprint',
      authHash: 'BIO-SHA256-88ab194efc',
      e2eId: 'E1020001202509221530999aa21',
      category: 'Outros'
    }
  ]
};

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function generateE2EId(bankCode = '499'): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  return `E${bankCode.padStart(3, '0')}0001${year}${month}${day}${hour}${minute}${randomHex.substring(0, 10)}`;
}

export function generateAuthHash(): string {
  const randomHex = Math.random().toString(16).substring(2, 8) + 
                    Math.random().toString(16).substring(2, 8) + 
                    Math.random().toString(16).substring(2, 8);
  return `BIO-SHA256-${randomHex.toUpperCase()}`;
}
