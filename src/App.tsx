/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Fingerprint, 
  ShieldCheck, 
  ArrowUpRight, 
  FileText, 
  Users, 
  Sparkles, 
  RefreshCw, 
  CreditCard,
  Lock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { 
  ClientProfile, 
  BeneficiaryContact, 
  Transaction, 
  ChatMessage 
} from './types/bank';
import { 
  INITIAL_CLIENTS, 
  INITIAL_CONTACTS, 
  INITIAL_TRANSACTIONS, 
  formatBRL, 
  generateE2EId, 
  generateAuthHash 
} from './data/mockBank';
import { soundManager } from './utils/audioFeedback';
import { parseFinancialInput, createWelcomeMessage } from './utils/bankAssistant';
import { askGeminiFinancialAdvisor } from './utils/geminiChat';
import { BiometricModal } from './components/BiometricModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ClientSwitcherModal } from './components/ClientSwitcherModal';
import { QuickTransferModal } from './components/QuickTransferModal';
import { TopNav } from './components/TopNav';
import { 
  WelcomeCard, 
  BalanceCard, 
  TransferPendingCard, 
  TransferSuccessCard, 
  ContactsListCard, 
  StatementCard, 
  SecurityStatusCard 
} from './components/ChatCards';
import confetti from 'canvas-confetti';

export default function App() {
  // Clients state - Defaulting to Cliente X (Carlos Eduardo) as requested: "Qo cliente x entra na conra"
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [activeClientId, setActiveClientId] = useState<string>('cliente-x');
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0];

  // Transactions database by client
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>(INITIAL_TRANSACTIONS);
  const currentTransactions = transactionsMap[activeClientId] || [];

  // Contacts
  const [contacts, setContacts] = useState<BeneficiaryContact[]>(INITIAL_CONTACTS);

  // Global UI states
  const [hideValues, setHideValues] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Modals
  const [showClientSwitcher, setShowClientSwitcher] = useState<boolean>(false);
  const [showQuickTransfer, setShowQuickTransfer] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [pendingTransferData, setPendingTransferData] = useState<any>(null);
  const [viewingReceiptTx, setViewingReceiptTx] = useState<Transaction | null>(null);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(INITIAL_CLIENTS[0])]);
  const [inputText, setInputText] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Client Switch ("Qo cliente x entra na conta")
  const handleSelectClient = (client: ClientProfile) => {
    setActiveClientId(client.id);
    soundManager.playBioSuccess();

    // Reset or append client login in chat
    const welcomeMsg = createWelcomeMessage(client);
    setMessages(prev => [
      ...prev,
      {
        id: `sys-login-${Date.now()}`,
        sender: 'system',
        text: `Autenticação biométrica confirmada. Sessão iniciada para **${client.name}** (${client.label}).`,
        timestamp: new Date().toISOString()
      },
      welcomeMsg
    ]);
  };

  // Process user chat input
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    soundManager.playMessageSent();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Analyze intent
    const parsed = parseFinancialInput(text, contacts, clients, activeClient);

    setTimeout(async () => {
      setIsTyping(false);

      if (parsed.intent === 'balance') {
        const reply: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Aqui está a posição consolidada da sua conta, **${activeClient.shortName}**:`,
          timestamp: new Date().toISOString(),
          cardType: 'balance',
          quickReplies: ['⚡ Fazer PIX', '📋 Ver extrato', '🔒 Segurança']
        };
        setMessages(prev => [...prev, reply]);
        return;
      }

      if (parsed.intent === 'statement') {
        const reply: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Consultando seu extrato bancário em tempo real:`,
          timestamp: new Date().toISOString(),
          cardType: 'statement',
          cardData: currentTransactions,
          quickReplies: ['💰 Consultar saldo', '⚡ Fazer PIX']
        };
        setMessages(prev => [...prev, reply]);
        return;
      }

      if (parsed.intent === 'contacts') {
        const reply: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Aqui estão os contatos e chaves PIX cadastrados para transferências rápidas:`,
          timestamp: new Date().toISOString(),
          cardType: 'contacts_list',
          cardData: contacts,
          quickReplies: ['⚡ Novo PIX', '💰 Meu Saldo']
        };
        setMessages(prev => [...prev, reply]);
        return;
      }

      if (parsed.intent === 'security') {
        const reply: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Painel de Segurança Biométrica e Enclave Criptográfico FIDO2:`,
          timestamp: new Date().toISOString(),
          cardType: 'security_status',
          cardData: activeClient.biometrics,
          quickReplies: ['⚡ Fazer PIX', '💰 Ver Saldo', '📋 Extrato']
        };
        setMessages(prev => [...prev, reply]);
        return;
      }

      if (parsed.intent === 'transfer') {
        // If amount and recipient are known
        if (parsed.amount && parsed.matchedContact) {
          const transferData = {
            amount: parsed.amount,
            recipientName: parsed.matchedContact.name,
            recipientBank: parsed.matchedContact.bankName,
            recipientPixKey: parsed.matchedContact.pixKey,
            recipientId: parsed.matchedContact.clientId,
            reason: 'Transferência PIX via Chat'
          };

          const reply: ChatMessage = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: `Perfeito! Preparei a transferência de **${formatBRL(parsed.amount)}** para **${parsed.matchedContact.name}**. Por normas de segurança do Bacen e NexusBank, confirme com sua biometria abaixo:`,
            timestamp: new Date().toISOString(),
            cardType: 'transfer_pending',
            cardData: transferData
          };
          setMessages(prev => [...prev, reply]);
          return;
        }

        // If only recipient is known
        if (parsed.matchedContact && !parsed.amount) {
          const reply: ChatMessage = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: `Quanto você deseja transferir para **${parsed.matchedContact.name}** (${parsed.matchedContact.bankName})?`,
            timestamp: new Date().toISOString(),
            quickReplies: [
              `Transferir R$ 50 para ${parsed.matchedContact.name.split(' ')[0]}`,
              `Transferir R$ 100 para ${parsed.matchedContact.name.split(' ')[0]}`,
              `Transferir R$ 250 para ${parsed.matchedContact.name.split(' ')[0]}`
            ]
          };
          setMessages(prev => [...prev, reply]);
          return;
        }

        // If only amount is known
        if (parsed.amount && !parsed.matchedContact) {
          const reply: ChatMessage = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: `Entendi o valor de **${formatBRL(parsed.amount)}**. Para quem você deseja enviar esse PIX? Escolha um contato ou digite o nome:`,
            timestamp: new Date().toISOString(),
            cardType: 'contacts_list',
            cardData: contacts
          };
          setMessages(prev => [...prev, reply]);
          return;
        }

        // Generic transfer intent
        const reply: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Para quem você gostaria de fazer uma transferência PIX? Você pode selecionar um favorecido abaixo ou digitar: *"Transfira R$ 100 para Mariana"*:`,
          timestamp: new Date().toISOString(),
          cardType: 'contacts_list',
          cardData: contacts
        };
        setMessages(prev => [...prev, reply]);
        return;
      }

      // Greeting
      if (parsed.intent === 'greeting') {
        const welcome = createWelcomeMessage(activeClient);
        setMessages(prev => [...prev, welcome]);
        return;
      }

      // General Financial Advisor (with Gemini AI)
      const aiResponse = await askGeminiFinancialAdvisor(text, activeClient);
      const reply: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: aiResponse,
        timestamp: new Date().toISOString(),
        quickReplies: ['⚡ Fazer PIX', '💰 Ver saldo', '📋 Extrato']
      };
      setMessages(prev => [...prev, reply]);
    }, 450);
  };

  // Launch Biometrics Modal from Transfer Card
  const handleOpenBiometrics = (transferData: any) => {
    soundManager.playScanPulse();
    setPendingTransferData(transferData);
    setShowBiometricModal(true);
  };

  // Successful Biometric Verification and Execution
  const handleBiometricSuccess = (authResult: any) => {
    setShowBiometricModal(false);

    if (!pendingTransferData) return;

    const { amount, recipientName, recipientBank, recipientPixKey, recipientId, reason } = pendingTransferData;
    const e2eId = generateE2EId();
    const authHash = authResult.hash || generateAuthHash();
    const nowIso = new Date().toISOString();

    // 1. Debit from active client
    setClients(prev => prev.map(c => {
      if (c.id === activeClientId) {
        return {
          ...c,
          balance: c.balance - amount,
          biometrics: {
            ...c.biometrics,
            usedDailyLimit: c.biometrics.usedDailyLimit + amount,
            lastAuthTime: nowIso
          }
        };
      }
      // If recipient is another client in the system, credit them!
      if (recipientId && c.id === recipientId) {
        return {
          ...c,
          balance: c.balance + amount
        };
      }
      return c;
    }));

    // 2. Create outgoing transaction record
    const outgoingTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'pix_out',
      title: 'Transferência PIX enviada',
      amount,
      timestamp: nowIso,
      senderId: activeClientId,
      senderName: activeClient.name,
      recipientId,
      recipientName,
      recipientBank: recipientBank || 'NexusBank Digital',
      recipientPixKey,
      status: 'completed',
      authMethod: authResult.method,
      authHash,
      e2eId,
      description: reason,
      category: 'Transferência'
    };

    // 3. If recipient is another system client, add incoming transaction for them
    setTransactionsMap(prev => {
      const updated = { ...prev };
      updated[activeClientId] = [outgoingTx, ...(updated[activeClientId] || [])];

      if (recipientId) {
        const incomingTx: Transaction = {
          id: `tx-in-${Date.now()}`,
          type: 'pix_in',
          title: 'PIX recebido',
          amount,
          timestamp: nowIso,
          senderId: activeClientId,
          senderName: activeClient.name,
          recipientId,
          recipientName,
          recipientBank: 'NexusBank Digital',
          status: 'completed',
          e2eId,
          description: reason,
          category: 'Transferência'
        };
        updated[recipientId] = [incomingTx, ...(updated[recipientId] || [])];
      }

      return updated;
    });

    // 4. Append success message in chat
    const successMsg: ChatMessage = {
      id: `asst-success-${Date.now()}`,
      sender: 'assistant',
      text: `🎉 **Transferência PIX autorizada e efetivada com sucesso!**\n\nA autenticação biométrica foi validada e o valor de **${formatBRL(amount)}** foi transferido instantaneamente para **${recipientName}**.`,
      timestamp: nowIso,
      cardType: 'transfer_success_receipt',
      cardData: outgoingTx,
      quickReplies: ['📄 Ver comprovante oficial', '💰 Consultar novo saldo', '⚡ Fazer outro PIX']
    };

    setMessages(prev => [...prev, successMsg]);
    setPendingTransferData(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation */}
      <TopNav
        currentClient={activeClient}
        onOpenClientSwitcher={() => setShowClientSwitcher(true)}
        hideValues={hideValues}
        onToggleHideValues={() => setHideValues(v => !v)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(soundManager.toggleSound())}
        onOpenTransferModal={() => setShowQuickTransfer(true)}
      />

      {/* Main Workspace: Sidebar on Desktop + Interactive Banking Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Banking Hub (Desktop) */}
        <aside className="hidden lg:flex w-80 xl:w-96 flex-col border-r border-slate-800/80 bg-slate-950/70 p-5 overflow-y-auto space-y-5">
          {/* Active Client Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Conta Ativa Conectada
              </span>
              <button
                onClick={() => setShowClientSwitcher(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-white underline cursor-pointer"
              >
                Trocar Cliente
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={activeClient.avatarUrl}
                alt={activeClient.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-400 block">{activeClient.label}</span>
                <h3 className="text-sm font-extrabold text-white truncate">{activeClient.name}</h3>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Ag: {activeClient.agency} · Conta: {activeClient.accountNumber}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Saldo Disponível</span>
                <span className="text-base font-black text-white">
                  {hideValues ? '••••••••' : formatBRL(activeClient.balance)}
                </span>
              </div>
              <button
                onClick={() => setShowQuickTransfer(true)}
                className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                PIX
              </button>
            </div>
          </div>

          {/* Biometric Shield Status */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Biometria FIDO2</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dispositivo registrado no Enclave: <span className="text-slate-200">{activeClient.biometrics.deviceName}</span>. Cada transferência via chat é assinada com chave ECDSA.
            </p>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
              <span>Limite Diário Biométrico:</span>
              <span className="font-semibold text-slate-200">{formatBRL(activeClient.biometrics.dailyLimit)}</span>
            </div>
          </div>

          {/* Quick Favorite Contacts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Contatos Frequentes
              </span>
              <button
                onClick={() => handleSendMessage('Meus contatos')}
                className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-1.5">
              {contacts.slice(0, 3).map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSendMessage(`Transferir para ${contact.name}`)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${contact.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                      {contact.initials}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-white">
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {contact.bankName}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Prompt quick hints */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experimente no Chat:</span>
            </div>
            <p className="text-slate-300">
              • "Transfira R$ 150 para Mariana"<br />
              • "Qual meu saldo?"<br />
              • "Mostre meu extrato"<br />
              • "Status da biometria"
            </p>
          </div>
        </aside>

        {/* Central Banking Chat Container */}
        <main className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Security Shield Banner */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ambiente Bancário Criptografado Ponta a Ponta · FIDO2 Biometrics</span>
                </div>
              </div>

              {/* Message items */}
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';

                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-md">
                        <Fingerprint className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}

                    {/* Message Bubble & Cards */}
                    <div className={`space-y-3 max-w-xl ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Text Bubble */}
                      {msg.text && (
                        <div 
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            isUser 
                              ? 'bg-slate-800 text-white rounded-tr-xs border border-slate-700/80 shadow-md ml-auto' 
                              : 'bg-slate-900/90 text-slate-200 rounded-tl-xs border border-slate-800 shadow-lg'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* Interactive Rich Cards */}
                      {msg.cardType === 'welcome' && (
                        <WelcomeCard
                          client={activeClient}
                          onQuickAction={(act) => handleSendMessage(act)}
                          hideValuesGlobal={hideValues}
                        />
                      )}

                      {msg.cardType === 'balance' && (
                        <BalanceCard
                          client={activeClient}
                          onQuickAction={(act) => handleSendMessage(act)}
                          hideValuesGlobal={hideValues}
                        />
                      )}

                      {msg.cardType === 'transfer_pending' && (
                        <TransferPendingCard
                          client={activeClient}
                          data={msg.cardData}
                          onOpenBiometrics={handleOpenBiometrics}
                          onQuickAction={(act) => handleSendMessage(act)}
                        />
                      )}

                      {msg.cardType === 'transfer_success_receipt' && (
                        <TransferSuccessCard
                          client={activeClient}
                          data={msg.cardData}
                          onViewReceipt={(tx) => setViewingReceiptTx(tx)}
                          onQuickAction={(act) => handleSendMessage(act)}
                        />
                      )}

                      {msg.cardType === 'contacts_list' && (
                        <ContactsListCard
                          client={activeClient}
                          data={msg.cardData || contacts}
                          onQuickAction={(act) => handleSendMessage(act)}
                        />
                      )}

                      {msg.cardType === 'statement' && (
                        <StatementCard
                          client={activeClient}
                          data={msg.cardData || currentTransactions}
                          onViewReceipt={(tx) => setViewingReceiptTx(tx)}
                        />
                      )}

                      {msg.cardType === 'security_status' && (
                        <SecurityStatusCard
                          client={activeClient}
                        />
                      )}

                      {/* Quick Replies below message */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.quickReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (reply.includes('comprovante') && msg.cardData) {
                                  setViewingReceiptTx(msg.cardData);
                                } else {
                                  handleSendMessage(reply);
                                }
                              }}
                              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-medium text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <img
                        src={activeClient.avatarUrl}
                        alt={activeClient.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Fingerprint className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
                    <span className="text-xs text-slate-400 ml-2">Processando solicitação bancária...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* Quick Action Suggestion Bar */}
          <div className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                Ações Rápidas:
              </span>
              <button
                type="button"
                onClick={() => handleSendMessage('Transferir via PIX')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                ⚡ Fazer PIX
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Qual meu saldo?')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 shrink-0 cursor-pointer"
              >
                💰 Ver Saldo
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Ver extrato')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 shrink-0 cursor-pointer"
              >
                📋 Extrato
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Meus contatos')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 shrink-0 cursor-pointer"
              >
                👥 Contatos
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Status da biometria')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 shrink-0 cursor-pointer"
              >
                🔒 Biometria
              </button>
            </div>
          </div>

          {/* Chat Input Box */}
          <div className="border-t border-slate-800/80 bg-slate-900/90 p-3 sm:p-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              {/* Quick Transfer Button */}
              <button
                type="button"
                onClick={() => setShowQuickTransfer(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Abrir formulário de transferência PIX"
                aria-label="Abrir formulário PIX"
              >
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Converse com o NexusBank (ex: "Transfira R$ 100 para Mariana")...`}
                  className="w-full py-3 px-4 pr-10 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => {
          setShowBiometricModal(false);
          setPendingTransferData(null);
        }}
        onSuccess={handleBiometricSuccess}
        amount={pendingTransferData?.amount}
        recipientName={pendingTransferData?.recipientName}
        recipientBank={pendingTransferData?.recipientBank}
        clientName={activeClient.name}
        biometricType={activeClient.biometrics.type}
      />

      {/* Official Comprovante Receipt Modal */}
      <ReceiptModal
        isOpen={!!viewingReceiptTx}
        onClose={() => setViewingReceiptTx(null)}
        transaction={viewingReceiptTx}
        senderName={activeClient.name}
        senderCpf={activeClient.cpf}
        senderAgency={activeClient.agency}
        senderAccount={activeClient.accountNumber}
      />

      {/* Client Switcher Modal ("Qo cliente x entra na conta") */}
      <ClientSwitcherModal
        isOpen={showClientSwitcher}
        onClose={() => setShowClientSwitcher(false)}
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleSelectClient}
      />

      {/* Quick Transfer Form Drawer Modal */}
      <QuickTransferModal
        isOpen={showQuickTransfer}
        onClose={() => setShowQuickTransfer(false)}
        currentClient={activeClient}
        contacts={contacts}
        onRequestBiometrics={handleOpenBiometrics}
      />
    </div>
  );
}
