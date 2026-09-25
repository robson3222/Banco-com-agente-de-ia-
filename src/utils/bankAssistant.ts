import { ClientProfile, BeneficiaryContact, Transaction, ChatMessage } from '../types/bank';
import { formatBRL } from '../data/mockBank';

export interface ParsedFinancialIntent {
  intent: 'transfer' | 'balance' | 'statement' | 'contacts' | 'security' | 'help' | 'greeting' | 'general';
  amount?: number;
  recipientName?: string;
  matchedContact?: BeneficiaryContact;
  pixKey?: string;
  rawText: string;
}

export function parseFinancialInput(
  text: string, 
  contacts: BeneficiaryContact[],
  clients: ClientProfile[],
  currentClient: ClientProfile
): ParsedFinancialIntent {
  const normalized = text.toLowerCase().trim();

  // Greeting
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|opa|e ai|e aí)/i.test(normalized) && normalized.length < 25) {
    return { intent: 'greeting', rawText: text };
  }

  // Balance query
  if (/saldo|quanto (eu )?tenho|meu dinheiro|extrato de saldo|meu saldo/i.test(normalized)) {
    return { intent: 'balance', rawText: text };
  }

  // Statement / Extrato query
  if (/extrato|historico|histórico|movimentações|movimentacoes|transações|transacoes|lançamentos|lancamentos/i.test(normalized)) {
    return { intent: 'statement', rawText: text };
  }

  // Contacts query
  if (/contatos|beneficiarios|beneficiários|favoritos|para quem posso transferir/i.test(normalized)) {
    return { intent: 'contacts', rawText: text };
  }

  // Security & Biometrics
  if (/biometria|seguranca|segurança|limite|limites|face id|touch id|digital|antifraude/i.test(normalized)) {
    return { intent: 'security', rawText: text };
  }

  // Transfer / PIX intent
  const isTransfer = /transf|pix|enviar|manda|mandar|pagar|paga/i.test(normalized);
  
  // Extract amount
  // e.g. R$ 150,00 | R$150 | 150 reais | 150,50 | 150.00
  let amount: number | undefined;
  const amountMatch = normalized.match(/(?:r\$|reais)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:reais|r\$)?/i);
  
  // Clean up if it just matched numbers
  if (amountMatch) {
    // Check if the number is likely a financial amount (not an account or agência)
    const rawNum = amountMatch[1].replace(',', '.');
    const parsedNum = parseFloat(rawNum);
    if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum < 1000000) {
      // If the word transfer or pix is nearby or context is clear
      if (isTransfer || /reais|r\$/i.test(normalized)) {
        amount = parsedNum;
      }
    }
  }

  // Match recipient contact
  let matchedContact: BeneficiaryContact | undefined;
  let recipientName: string | undefined;

  for (const c of contacts) {
    const contactFirstName = c.name.split(' ')[0].toLowerCase();
    const contactFullName = c.name.toLowerCase();
    if (normalized.includes(contactFirstName) || normalized.includes(contactFullName)) {
      matchedContact = c;
      recipientName = c.name;
      break;
    }
  }

  // Also check other clients (e.g. "Mariana", "Carlos", "Roberto")
  if (!matchedContact) {
    for (const cl of clients) {
      if (cl.id !== currentClient.id) {
        const clFirst = cl.shortName.toLowerCase();
        if (normalized.includes(clFirst) || normalized.includes(cl.name.toLowerCase())) {
          recipientName = cl.name;
          matchedContact = {
            id: `client-contact-${cl.id}`,
            name: cl.name,
            cpf: cl.cpf,
            bankName: 'NexusBank Digital',
            bankCode: '499',
            pixKey: cl.pixKey,
            pixKeyType: cl.pixKeyType,
            avatarBg: 'from-emerald-600 to-teal-700',
            initials: cl.shortName.substring(0, 2).toUpperCase(),
            isFavorite: true,
            clientId: cl.id
          };
          break;
        }
      }
    }
  }

  if (isTransfer || amount !== undefined || matchedContact !== undefined) {
    return {
      intent: 'transfer',
      amount,
      recipientName,
      matchedContact,
      rawText: text
    };
  }

  return { intent: 'general', rawText: text };
}

export function createWelcomeMessage(client: ClientProfile): ChatMessage {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return {
    id: `welcome-${Date.now()}`,
    sender: 'assistant',
    text: `${greeting}, **${client.shortName}**! Você está conectado com segurança biométrica na sua conta **NexusBank**.\n\nComo posso te ajudar agora? Você pode transferir via PIX com autenticação biométrica, consultar seu extrato ou gerenciar seus limites.`,
    timestamp: new Date().toISOString(),
    cardType: 'welcome',
    cardData: {
      client
    },
    quickReplies: [
      '⚡ Fazer PIX',
      '💰 Ver meu saldo',
      '📋 Extrato recente',
      '👥 Meus contatos',
      '🔒 Status da Biometria'
    ]
  };
}
