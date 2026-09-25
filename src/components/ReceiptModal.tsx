import React, { useState } from 'react';
import { CheckCircle2, Copy, Download, Share2, X, QrCode, ShieldCheck, Check } from 'lucide-react';
import { Transaction } from '../types/bank';
import { formatBRL, formatDateTime } from '../data/mockBank';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  senderName: string;
  senderCpf: string;
  senderAgency: string;
  senderAccount: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  senderName,
  senderCpf,
  senderAgency,
  senderAccount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(transaction.e2eId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              NB
            </div>
            <span className="font-bold text-sm text-slate-200">Comprovante de Transferência PIX</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable receipt body */}
        <div className="p-6 md:p-8 space-y-6 text-slate-200 print:text-black">
          {/* Status Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 print:bg-emerald-100 print:text-emerald-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white print:text-black">Transferência Efetivada</h2>
            <p className="text-xs text-emerald-400 font-medium mt-0.5 print:text-emerald-700">
              Transação autorizada com sucesso via Autenticação Biométrica
            </p>
            <div className="text-3xl font-extrabold text-white mt-4 tracking-tight print:text-black">
              {formatBRL(transaction.amount)}
            </div>
            <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
              {formatDateTime(transaction.timestamp)}
            </p>
          </div>

          {/* Details Table */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-3.5 text-xs print:bg-slate-50 print:border-slate-200">
            {/* Destinatário */}
            <div>
              <span className="text-slate-400 block font-medium print:text-slate-600">Destinatário</span>
              <span className="text-sm font-semibold text-white block mt-0.5 print:text-black">
                {transaction.recipientName}
              </span>
              <div className="text-slate-400 flex flex-wrap gap-x-2 mt-0.5">
                <span>Instituição: {transaction.recipientBank || 'NexusBank Digital'}</span>
                {transaction.recipientPixKey && (
                  <span>· Chave: {transaction.recipientPixKey}</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 print:border-slate-200" />

            {/* Pagador */}
            <div>
              <span className="text-slate-400 block font-medium print:text-slate-600">Pagador</span>
              <span className="text-sm font-semibold text-white block mt-0.5 print:text-black">
                {senderName}
              </span>
              <div className="text-slate-400 flex flex-wrap gap-x-2 mt-0.5">
                <span>CPF: {senderCpf}</span>
                <span>· Ag: {senderAgency}</span>
                <span>· C/C: {senderAccount}</span>
                <span>· NexusBank Digital (499)</span>
              </div>
            </div>

            <div className="border-t border-slate-800 print:border-slate-200" />

            {/* Biometric Proof & E2E */}
            <div>
              <span className="text-slate-400 block font-medium print:text-slate-600">Assinatura Biométrica de Segurança</span>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-400 font-mono text-[11px] print:text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{transaction.authHash || 'BIO-ECDSA-SECURE-ENCLAVE-OK'}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 print:text-slate-600">
                Método: {transaction.authMethod === 'biometric_fingerprint' ? 'Sensor de Impressão Digital FIDO2' : transaction.authMethod === 'biometric_faceid' ? 'Reconhecimento Facial Face ID 3D' : 'Biometria de Hardware'}
              </span>
            </div>

            <div className="border-t border-slate-800 print:border-slate-200" />

            {/* ID Transação E2E */}
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-medium print:text-slate-600">ID da Transação Bacen (End-to-End)</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline print:hidden cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-300 mt-1 break-all bg-slate-900/80 p-2 rounded-lg border border-slate-800 print:bg-white print:text-black print:border-slate-200">
                {transaction.e2eId}
              </p>
            </div>
          </div>

          {/* Authentic Bacen Regulatory Seal */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 print:text-slate-600">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-slate-400 print:text-slate-600" />
              <span>Autenticação SPI/DICT Bacen</span>
            </div>
            <span>Ouvidoria 0800 900 8080</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar / Imprimir
            </button>
            <button
              onClick={handleCopyId}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
