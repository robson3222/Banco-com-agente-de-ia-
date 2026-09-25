import React from 'react';
import { UserCheck, Shield, ChevronRight, X, Sparkles, Check, Fingerprint, Lock } from 'lucide-react';
import { ClientProfile } from '../types/bank';
import { formatBRL } from '../data/mockBank';
import { soundManager } from '../utils/audioFeedback';

interface ClientSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  activeClient: ClientProfile;
  onSelectClient: (client: ClientProfile) => void;
}

export const ClientSwitcherModal: React.FC<ClientSwitcherModalProps> = ({
  isOpen,
  onClose,
  clients,
  activeClient,
  onSelectClient,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Alternar Conta de Cliente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-400 mb-4">
            Selecione qual cliente deseja autenticar no chat bancário. Cada cliente possui saldo individual, biometria e contatos vinculados:
          </p>

          <div className="space-y-3">
            {clients.map((client) => {
              const isActive = client.id === activeClient.id;
              const isClienteX = client.id === 'cliente-x';

              return (
                <button
                  key={client.id}
                  onClick={() => {
                    soundManager.playScanPulse();
                    onSelectClient(client);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={client.avatarUrl}
                        alt={client.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                      {client.biometrics.enabled && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow">
                          <Fingerprint className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isClienteX 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {client.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            Ativo
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white truncate mt-1">
                        {client.name}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Ag: {client.agency}</span>
                        <span>· C/C: {client.accountNumber}</span>
                        <span>· {formatBRL(client.balance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isActive ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt Note */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Ao trocar para o <strong>Cliente X</strong>, o assistente cumprimentará Carlos Eduardo, sincronizará o saldo em tempo real e habilitará transferências protegidas pelo sensor biométrico.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
