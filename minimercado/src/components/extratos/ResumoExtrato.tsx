import React from 'react';

interface Props {
  activeTab: 'PENDENTE' | 'PAGO';
  totais: { pago: number; pendente: number; selecionado: number };
  isSubmitting: boolean;
  hasSelectedItems: boolean;
  onQuitar: () => void;
}

export default function ResumoExtrato({ activeTab, totais, isSubmitting, hasSelectedItems, onQuitar }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white p-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-end gap-6 mt-auto">
      <div className="space-y-1 w-full md:w-auto">
        <p className="text-lg text-gray-800">
          <span className="font-semibold">Total Pago:</span> <span className="font-bold text-[#15665a]">{formatCurrency(totais.pago)}</span>
        </p>
        {activeTab === 'PENDENTE' && (
          <>
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Total Selecionado:</span> {formatCurrency(totais.selecionado)}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Total Pendente:</span> <span className="text-red-600 font-bold">{formatCurrency(totais.pendente)}</span>
            </p>
          </>
        )}
      </div>

      {activeTab === 'PENDENTE' && (
        <button 
          onClick={onQuitar} 
          disabled={!hasSelectedItems || isSubmitting} 
          className="w-full md:w-auto bg-[#1a7f71] hover:bg-[#15665a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-all shadow-md text-sm md:text-base uppercase tracking-wide flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Processando baixa...' : `Quitar Pendência Selecionada (${formatCurrency(totais.selecionado)})`}
        </button>
      )}
    </div>
  );
}