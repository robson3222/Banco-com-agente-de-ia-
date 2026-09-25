import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Send, 
  FileText, 
  Users, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ClientProfile, BeneficiaryContact, Transaction } from '../types/bank';
import { formatBRL, formatDateTime } from '../data/mockBank';

interface CardProps {
  onQuickAction?: (actionText: string) => void;
  onOpenBiometrics?: (transferData: any) => void;
  onViewReceipt?: (tx: Transaction) => void;
  client: ClientProfile;
  hideValuesGlobal?: boolean;
}

// 1. Welcome Card
export const WelcomeCard: React.FC<CardProps & { data?: any }> = ({ 
  client, 
  onQuickAction,
  hideValuesGlobal = false 
}) => {
  const [hideBalance, setHideBalance] = useState(hideValuesGlobal);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{client.label}</span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessão Biométrica Autenticada
            </span>
          </div>
        </div>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          title={hideBalance ? 'Mostrar valores' : 'Ocultar valores'}
        >
          {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Balance snapshot */}
      <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">Saldo em Conta</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {hideBalance ? '••••••••' : formatBRL(client.balance)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Limite Disponível</span>
          <span className="text-xs font-semibold text-emerald-400">
            {hideBalance ? '••••' : formatBRL(client.creditLimit)}
          </span>
        </div>
      </div>

      {/* Quick Access Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => onQuickAction?.('Transferir via PIX')}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block text-[11px]">Fazer PIX</span>
            <span className="text-[10px] text-slate-400">Instantâneo</span>
          </div>
        </button>

        <button
          onClick={() => onQuickAction?.('Ver extrato')}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block text-[11px]">Extrato</span>
            <span className="text-[10px] text-slate-400">Histórico</span>
          </div>
        </button>

        <button
          onClick={() => onQuickAction?.('Ver contatos')}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block text-[11px]">Contatos</span>
            <span className="text-[10px] text-slate-400">Favoritos</span>
          </div>
        </button>
      </div>
    </div>
  );
};

// 2. Balance Card
export const BalanceCard: React.FC<CardProps> = ({ client, onQuickAction, hideValuesGlobal = false }) => {
  const [hide, setHide] = useState(hideValuesGlobal);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Conta: {client.accountNumber} · Agência: {client.agency}
        </span>
        <button
          onClick={() => setHide(!hide)}
          className="p-1 text-slate-400 hover:text-white"
        >
          {hide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-slate-400">Saldo disponível</span>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {hide ? '••••••••' : formatBRL(client.balance)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-950 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Limite Cheque Especial</span>
          <span className="font-semibold text-slate-200">
            {hide ? '••••' : formatBRL(client.creditLimit)}
          </span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Reserva / Poupança</span>
          <span className="font-semibold text-emerald-400">
            {hide ? '••••' : formatBRL(client.savingsBalance)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onQuickAction?.('Transferir')}
        className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        Fazer uma Transferência com Biometria
      </button>
    </div>
  );
};

// 3. Pending Transfer Card (Requires Biometric Authorization)
export const TransferPendingCard: React.FC<CardProps & { data: any }> = ({ 
  data, 
  onOpenBiometrics, 
  onQuickAction,
  client 
}) => {
  const { amount, recipientName, recipientBank, recipientPixKey, reason } = data;
  const isInsufficient = amount > client.balance;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Autorização Biométrica Requerida
            </h4>
            <span className="text-[11px] text-slate-400">NexusBank DICT / BACEN PIX</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Aguardando Biometria
        </span>
      </div>

      {/* Transfer Amount highlight */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <span className="text-xs text-slate-400 block mb-1">Valor a ser transferido:</span>
        <div className="text-3xl font-black text-white tracking-tight">
          {formatBRL(amount)}
        </div>
        {reason && (
          <span className="text-[11px] text-slate-400 italic mt-1 block">
            "{reason}"
          </span>
        )}
      </div>

      {/* Recipient Details */}
      <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex justify-between">
          <span className="text-slate-400">Destinatário:</span>
          <span className="font-semibold text-white">{recipientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Banco:</span>
          <span className="text-slate-200">{recipientBank || 'NexusBank Digital'}</span>
        </div>
        {recipientPixKey && (
          <div className="flex justify-between">
            <span className="text-slate-400">Chave PIX:</span>
            <span className="text-slate-300 font-mono text-[11px]">{recipientPixKey}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-800/60 pt-2 text-[11px]">
          <span className="text-slate-400">Débito em:</span>
          <span className="text-slate-300">{client.name} (Saldo: {formatBRL(client.balance)})</span>
        </div>
      </div>

      {isInsufficient ? (
        <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Saldo insuficiente para esta transferência ({formatBRL(client.balance)}).</span>
        </div>
      ) : (
        /* Action buttons */
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenBiometrics?.(data)}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Autorizar com Biometria
          </button>

          <button
            type="button"
            onClick={() => onQuickAction?.('Cancelar transferência')}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancelar operação
          </button>
        </div>
      )}
    </div>
  );
};

// 4. Transfer Success Card
export const TransferSuccessCard: React.FC<CardProps & { data: Transaction }> = ({ 
  data, 
  onViewReceipt,
  onQuickAction 
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-emerald-500/40 p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex items-center gap-2 text-emerald-400">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="font-bold text-xs uppercase tracking-wide">
          Transferência Concluída
        </span>
      </div>

      <div className="text-2xl font-black text-white tracking-tight">
        {formatBRL(data.amount)}
      </div>

      <p className="text-xs text-slate-300">
        Enviado com sucesso para <strong className="text-white">{data.recipientName}</strong> ({data.recipientBank}).
      </p>

      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="truncate mr-2">E2E: {data.e2eId}</span>
        <span className="text-emerald-400 font-sans font-semibold shrink-0">Biometria OK</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onViewReceipt?.(data)}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Ver Comprovante
        </button>
        <button
          type="button"
          onClick={() => onQuickAction?.('Transferir')}
          className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          Novo PIX
        </button>
      </div>
    </div>
  );
};

// 5. Contacts List Card
export const ContactsListCard: React.FC<CardProps & { data: BeneficiaryContact[] }> = ({ 
  data, 
  onQuickAction 
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-400" />
          Contatos e Chaves PIX
        </span>
        <span className="text-[10px] text-slate-400">Clique para transferir</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {data.map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onQuickAction?.(`Transferir para ${contact.name}`)}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${contact.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                {contact.initials}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-white">
                  {contact.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {contact.bankName}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
};

// 6. Statement Card
export const StatementCard: React.FC<CardProps & { data: Transaction[] }> = ({ 
  data, 
  onViewReceipt 
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-cyan-400" />
          Extrato das Últimas Transações
        </span>
        <span className="text-[10px] text-slate-400">{data.length} lançamentos</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {data.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">Nenhuma transação recente encontrada.</p>
        ) : (
          data.map((tx) => {
            const isOut = tx.type === 'pix_out' || tx.type === 'ted' || tx.type === 'boleto';
            return (
              <div
                key={tx.id}
                onClick={() => onViewReceipt?.(tx)}
                className="p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isOut ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isOut ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200 block truncate">
                      {isOut ? tx.recipientName : tx.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {formatDateTime(tx.timestamp)} · {tx.category}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`font-bold block ${isOut ? 'text-slate-200' : 'text-emerald-400'}`}>
                    {isOut ? '-' : '+'} {formatBRL(tx.amount)}
                  </span>
                  {tx.authHash && (
                    <span className="text-[9px] text-emerald-500 flex items-center justify-end gap-0.5">
                      <Fingerprint className="w-2.5 h-2.5" /> Bio
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 7. Security Status Card
export const SecurityStatusCard: React.FC<CardProps> = ({ client }) => {
  const bio = client.biometrics;
  const usagePercentage = Math.min(100, Math.round((bio.usedDailyLimit / bio.dailyLimit) * 100));

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Segurança Biométrica FIDO2</h4>
            <span className="text-[10px] text-emerald-400 font-medium">Proteção Ativa Nível Bancário</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Enclave Seguro
        </span>
      </div>

      <div className="space-y-2.5 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div className="flex justify-between">
          <span className="text-slate-400">Dispositivo Cadastrado:</span>
          <span className="text-slate-200 font-medium truncate max-w-[180px]">{bio.deviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Tipo de Autenticação:</span>
          <span className="text-slate-200">
            {bio.type === 'both' ? 'Digital + Face ID' : bio.type === 'face_id' ? 'Face ID 3D' : 'Impressão Digital'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Score Antifraude:</span>
          <span className="text-emerald-400 font-semibold">{bio.fraudScore} (0 Incidentes)</span>
        </div>
      </div>

      {/* Daily limit gauge */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Limite Diário PIX com Biometria:</span>
          <span className="text-slate-200 font-semibold">{formatBRL(bio.dailyLimit)}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Utilizado hoje: {formatBRL(bio.usedDailyLimit)}</span>
          <span>Disponível: {formatBRL(bio.dailyLimit - bio.usedDailyLimit)}</span>
        </div>
      </div>
    </div>
  );
};
