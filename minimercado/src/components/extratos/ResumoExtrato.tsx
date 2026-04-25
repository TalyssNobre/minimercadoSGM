import React from 'react';

interface Props {
  activeTab: 'PENDENTE' | 'PAGO';
  totais: { pago: number; pendente: number; selecionado: number };
  isSubmitting: boolean;
  hasSelectedItems: boolean;
  userRole: string; 
  onQuitar: () => void;
}

export default function ResumoExtrato({ activeTab, totais, isSubmitting, hasSelectedItems, userRole, onQuitar }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // 🟢 Checa de forma exata se o texto resultante é ADMIN
  const isAdmin = userRole === 'ADMIN';

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
          disabled={!hasSelectedItems || isSubmitting || !isAdmin} 
          title={!isAdmin ? "Apenas administradores podem dar baixa em fiados." : ""}
          className={`w-full md:w-auto font-bold py-3 px-8 rounded-md transition-all shadow-md text-sm md:text-base uppercase tracking-wide flex items-center justify-center gap-2 ${
            !isAdmin 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-[#1a7f71] hover:bg-[#15665a] text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
          }`}
        >
          {/* 🟢 O MODO DETETIVE: Imprime o cargo no botão se estiver bloqueado */}
          {isSubmitting 
            ? 'Processando baixa...' 
            : !isAdmin 
              ? `Acesso Restrito: Apenas Admin Podem Dar Baixa` 
              : `Quitar Pendência Selecionada (${formatCurrency(totais.selecionado)})`}
        </button>
      )}
    </div>
  );
}