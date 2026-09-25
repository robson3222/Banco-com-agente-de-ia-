import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Scan, ShieldCheck, CheckCircle2, X, AlertTriangle, KeyRound, Smartphone, Cpu } from 'lucide-react';
import { formatBRL } from '../data/mockBank';
import { soundManager } from '../utils/audioFeedback';
import { triggerWebAuthnVerification, BiometricAuthResult } from '../utils/biometrics';
import confetti from 'canvas-confetti';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BiometricAuthResult) => void;
  title?: string;
  subtitle?: string;
  amount?: number;
  recipientName?: string;
  recipientBank?: string;
  clientName: string;
  biometricType?: 'fingerprint' | 'face_id' | 'both';
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autenticação Biométrica Requerida',
  subtitle = 'Confirme sua identidade para autorizar a operação financeira',
  amount,
  recipientName,
  recipientBank,
  clientName,
  biometricType = 'both',
}) => {
  const [activeTab, setActiveTab] = useState<'fingerprint' | 'face_id'>(
    biometricType === 'face_id' ? 'face_id' : 'fingerprint'
  );
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Toque ou segure o sensor');
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const scanIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setScanState('idle');
      setProgress(0);
      setStatusText(activeTab === 'fingerprint' ? 'Pressione o sensor biométrico' : 'Olhe para a câmera frontal');
      setShowPinFallback(false);
      setPinInput('');
      setPinError(false);
    } else {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const startScan = () => {
    if (scanState === 'scanning' || scanState === 'verifying' || scanState === 'success') return;

    setScanState('scanning');
    setProgress(10);
    setStatusText('Lendo características biométricas...');
    soundManager.playScanPulse();

    let current = 10;
    scanIntervalRef.current = setInterval(() => {
      current += 15;
      if (current % 30 === 0) {
        soundManager.playScanPulse();
      }
      setProgress(Math.min(current, 90));

      if (current >= 90) {
        clearInterval(scanIntervalRef.current);
        setScanState('verifying');
        setStatusText('Validando assinatura no Secure Enclave...');
        
        // Finalize
        setTimeout(() => {
          setScanState('success');
          setProgress(100);
          setStatusText('Identidade Verificada com Sucesso!');
          soundManager.playBioSuccess();

          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#34d399', '#059669', '#38bdf8']
            });
          } catch {}

          setTimeout(() => {
            onSuccess({
              success: true,
              method: activeTab === 'fingerprint' ? 'biometric_fingerprint' : 'biometric_faceid',
              hash: `BIO-ECDSA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              timestamp: new Date().toISOString(),
              hardwareVerified: true
            });
          }, 700);
        }, 600);
      }
    }, 120);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.length === 4) {
      soundManager.playBioSuccess();
      setScanState('success');
      setStatusText('PIN de Segurança Validado');
      setTimeout(() => {
        onSuccess({
          success: true,
          method: 'pin_backup',
          hash: `PIN-AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          hardwareVerified: false
        });
      }, 600);
    } else {
      setPinError(true);
      soundManager.playBioError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playBioError();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{subtitle}</p>
          </div>

          {/* Transaction Summary (If applicable) */}
          {amount !== undefined && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Valor a transferir</span>
                <span className="text-emerald-400 font-medium">PIX Instantâneo</span>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight">
                {formatBRL(amount)}
              </div>
              {recipientName && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Para:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {recipientName} {recipientBank ? `(${recipientBank})` : ''}
                  </span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Taxa de operação</span>
                <span className="text-emerald-400 font-medium">R$ 0,00 (Gratuito)</span>
              </div>
            </div>
          )}

          {!showPinFallback ? (
            <>
              {/* Biometric Type Selector */}
              {biometricType === 'both' && (
                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('fingerprint');
                      setScanState('idle');
                      setProgress(0);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'fingerprint'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    Impressão Digital
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('face_id');
                      setScanState('idle');
                      setProgress(0);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'face_id'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Scan className="w-4 h-4" />
                    Face ID
                  </button>
                </div>
              )}

              {/* Biometric Scanner Visual Area */}
              <div className="flex flex-col items-center justify-center my-4">
                <div 
                  onClick={startScan}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startScan(); }}
                  className={`relative group cursor-pointer w-36 h-36 rounded-3xl flex flex-col items-center justify-center border-2 transition-all duration-300 select-none ${
                    scanState === 'idle'
                      ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-900/30 hover:scale-105'
                      : scanState === 'scanning'
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                      : scanState === 'verifying'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                      : scanState === 'success'
                      ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                      : 'border-rose-500 bg-rose-950/40'
                  }`}
                >
                  {/* Concentric Pulse Rings when scanning */}
                  {(scanState === 'scanning' || scanState === 'verifying') && (
                    <div className="absolute inset-0 rounded-3xl border border-emerald-400/60 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Laser Scanline */}
                  {scanState === 'scanning' && (
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce pointer-events-none" />
                  )}

                  {/* Icon */}
                  {scanState === 'success' ? (
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-scale-up" />
                  ) : activeTab === 'fingerprint' ? (
                    <Fingerprint className={`w-16 h-16 transition-colors duration-300 ${
                      scanState === 'scanning' 
                        ? 'text-emerald-400' 
                        : scanState === 'verifying' 
                        ? 'text-cyan-400' 
                        : 'text-slate-300 group-hover:text-emerald-300'
                    }`} />
                  ) : (
                    <Scan className={`w-16 h-16 transition-colors duration-300 ${
                      scanState === 'scanning' 
                        ? 'text-emerald-400' 
                        : scanState === 'verifying' 
                        ? 'text-cyan-400' 
                        : 'text-slate-300 group-hover:text-emerald-300'
                    }`} />
                  )}

                  <span className="text-[11px] font-medium text-slate-400 mt-2">
                    {scanState === 'idle' ? 'Clique para ler' : `${progress}%`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 rounded-full ${
                      scanState === 'success' ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Status caption */}
                <p className={`text-xs mt-3 font-medium text-center ${
                  scanState === 'success' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {statusText}
                </p>

                {/* Secure Enclave badge */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500/80" />
                  <span>Nexus Enclave FIDO2 / ECDSA P-256</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {scanState === 'idle' && (
                  <button
                    type="button"
                    onClick={startScan}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Autorizar com Biometria
                  </button>
                )}

                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPinFallback(true)}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Usar senha de 4 dígitos (PIN)
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* PIN Fallback View */
            <form onSubmit={handlePinSubmit} className="space-y-4 my-2">
              <div className="text-center mb-4">
                <p className="text-xs text-slate-400">
                  Digite a senha de 4 dígitos da conta para autorizar:
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">(Dica de teste: 1234)</p>
              </div>

              <div className="flex justify-center">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-40 text-center tracking-[1em] text-2xl font-mono py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PIN incorreto. Tente 1234.
                </p>
              )}

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Confirmar PIN
              </button>

              <button
                type="button"
                onClick={() => setShowPinFallback(false)}
                className="w-full text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                Voltar para Biometria
              </button>
            </form>
          )}

          {/* Security Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <span>Titular da Conta:</span>
            <span className="text-slate-300 font-medium">{clientName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
