import { GoogleGenAI } from '@google/genai';
import { ClientProfile } from '../types/bank';
import { formatBRL } from '../data/mockBank';

export async function askGeminiFinancialAdvisor(
  userPrompt: string,
  client: ClientProfile
): Promise<string> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackBankingResponse(userPrompt, client);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é o assistente virtual do NexusBank, um banco digital de alta tecnologia focado em segurança biométrica avançada (FIDO2, Touch ID, Face ID, PIX instantâneo).
O cliente atual autenticado é: ${client.name} (${client.label}), saldo atual: ${formatBRL(client.balance)}.
O usuário disse: "${userPrompt}".
Responda de forma concisa, educada, segura e profissional em português do Brasil. Se o usuário quiser transferir, lembre-o de que a transação pode ser iniciada digitando o valor e o nome do favorecido, ou clicando em 'Fazer PIX', e que exigirá validação por biometria. Mantenha a resposta com menos de 3 parágrafos e use formatação Markdown limpa sem rodeios.`,
    });

    return response.text || generateFallbackBankingResponse(userPrompt, client);
  } catch (err) {
    console.debug('Gemini API call fallback:', err);
    return generateFallbackBankingResponse(userPrompt, client);
  }
}

function generateFallbackBankingResponse(prompt: string, client: ClientProfile): string {
  const p = prompt.toLowerCase();

  if (p.includes('pix') || p.includes('transfer')) {
    return `Para realizar uma transferência via PIX instantâneo com segurança biométrica, basta me informar o valor e o destinatário (por exemplo: *"Transfira R$ 100 para Mariana"*). Todas as transferências no NexusBank são validadas pelo seu sensor biométrico cadastrado (${client.biometrics.deviceName}).`;
  }

  if (p.includes('biometria') || p.includes('segurança') || p.includes('enclave')) {
    return `Sua conta está protegida pelo **Nexus Biometric Shield**. O hardware biométrico autentica cada débito via assinatura criptográfica ECDSA P-256 e validação instantânea com o Banco Central. Seu limite diário protegido é de ${formatBRL(client.biometrics.dailyLimit)}.`;
  }

  if (p.includes('saldo') || p.includes('dinheiro') || p.includes('limite')) {
    return `Seu saldo atual é **${formatBRL(client.balance)}** e você possui **${formatBRL(client.creditLimit)}** de limite de crédito pré-aprovado.`;
  }

  if (p.includes('invest') || p.includes('cdi') || p.includes('rendimento')) {
    return `No NexusBank, o saldo da sua conta rende **102% do CDI** com liquidez diária e proteção FGC. Você já possui ${formatBRL(client.savingsBalance)} guardados na sua reserva.`;
  }

  return `Entendido, ${client.shortName}! Como posso te auxiliar hoje? Você pode realizar transferências via PIX com validação biométrica, consultar extratos, limites ou contatos cadastrados.`;
}
