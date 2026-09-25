import React from 'react';
import { 
  Shield, 
  Fingerprint, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  UserCheck, 
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { ClientProfile } from '../types/bank';
import { formatBRL } from '../data/mockBank';

interface TopNavProps {
  currentClient: ClientProfile;
  onOpenClientSwitcher: () => void;
  hideValues: boolean;
  onToggleHideValues: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTransferModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentClient,
  onOpenClientSwitcher,
  hideValues,
  onToggleHideValues,
  soundEnabled,
  onToggleSound,
  onOpenTransferModal,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Client Info */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
            <Fingerprint className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                Nexus<span className="text-emerald-400">Bank</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Biometric Shield
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Chat Bancário Inteligente</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block h-6 w-px bg-slate-800" />

        {/* Active Client Selector Dropdown Button */}
        <button
          onClick={onOpenClientSwitcher}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group text-left"
          title="Clique para alternar entre Cliente X, Y e Z"
        >
          <div className="relative">
            <img
              src={currentClient.avatarUrl}
              alt={currentClient.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate max-w-[110px] sm:max-w-[150px]">
                {currentClient.label}
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:inline">
                ({currentClient.shortName})
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>C/C: {currentClient.accountNumber}</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">
                {hideValues ? '••••' : formatBRL(currentClient.balance)}
              </span>
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Biometric Shield Status Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Biometria FIDO2 Ativa</span>
        </div>

        {/* Hide/Show Eye toggle */}
        <button
          onClick={onToggleHideValues}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          title={hideValues ? 'Mostrar saldos' : 'Ocultar saldos'}
          aria-label="Alternar visibilidade de valores"
        >
          {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          title={soundEnabled ? 'Silenciar biometria' : 'Ativar áudio biométrico'}
          aria-label="Alternar som"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Quick Transfer CTA */}
        <button
          onClick={onOpenTransferModal}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Novo PIX</span>
        </button>
      </div>
    </header>
  );
};
