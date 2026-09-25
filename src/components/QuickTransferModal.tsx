import React, { useState } from 'react';
import { ArrowUpRight, X, Users, AlertCircle, Fingerprint } from 'lucide-react';
import { ClientProfile, BeneficiaryContact } from '../types/bank';
import { formatBRL } from '../data/mockBank';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: ClientProfile;
  contacts: BeneficiaryContact[];
  onRequestBiometrics: (transferData: any) => void;
}

export const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  isOpen,
  onClose,
  currentClient,
  contacts,
  onRequestBiometrics,
}) => {
  const [selectedContact, setSelectedContact] = useState<BeneficiaryContact | null>(contacts[0] || null);
  const [customRecipient, setCustomRecipient] = useState('');
  const [customPixKey, setCustomPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, informe um valor válido para transferência.');
      return;
    }

    if (parsedAmount > currentClient.balance) {
      setError(`Saldo insuficiente. Seu saldo atual é ${formatBRL(currentClient.balance)}.`);
      return;
    }

    const recipientName = isCustomMode ? customRecipient : selectedContact?.name;
    const recipientBank = isCustomMode ? 'Banco Destino' : selectedContact?.bankName;
    const recipientPixKey = isCustomMode ? customPixKey : selectedContact?.pixKey;

    if (!recipientName) {
      setError('Selecione ou informe o nome do favorecido.');
      return;
    }

    onClose();
    onRequestBiometrics({
      amount: parsedAmount,
      recipientName,
      recipientBank,
      recipientPixKey,
      reason: reason || 'Transferência PIX',
      recipientId: selectedContact?.clientId
    });
  };

  const quickAmounts = [20, 50, 100, 250, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Nova Transferência PIX</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Account Info */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">Origem: {currentClient.shortName}</span>
            <span className="font-bold text-emerald-400">Saldo: {formatBRL(currentClient.balance)}</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                !isCustomMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400'
              }`}
            >
              Meus Contatos
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isCustomMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400'
              }`}
            >
              Nova Chave PIX
            </button>
          </div>

          {!isCustomMode ? (
            /* Select contact */
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Selecione o favorecido:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {contacts.map((c) => {
                  const isSelected = selectedContact?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedContact(c)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{c.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{c.bankName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom contact inputs */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  placeholder="Ex: Beatriz Lima"
                  className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Chave PIX (CPF, E-mail ou Telefone)</label>
                <input
                  type="text"
                  required
                  value={customPixKey}
                  onChange={(e) => setCustomPixKey(e.target.value)}
                  placeholder="Ex: beatriz@email.com"
                  className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Valor da Transferência (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full text-lg font-bold pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick chips */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                >
                  +{formatBRL(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Descrição / Mensagem (Opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Aluguel, Almoço, Serviços..."
              className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Fingerprint className="w-4 h-4" />
            Continuar para Autenticação Biométrica
          </button>
        </form>
      </div>
    </div>
  );
};
