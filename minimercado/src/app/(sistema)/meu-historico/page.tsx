'use client';
import React from 'react';


import TabelaMinhasVendas from '@/src/components/MeuHistorico/TabelaMinhasVendas';
import ResumoTotais from '@/src/components/MeuHistorico/ResumoTotais';


import { useMeuHistorico } from '@/src/components/MeuHistorico/hooks/useMeuHistorico';

export default function MeuHistoricoPage() {
  // 🟢 Puxando as novidades do Hook
  const { 
    operadorAtual, 
    vendasFiltradas, 
    isLoading, 
    totalVendidoPago, 
    totalVendidoFiado, 
    formatDate,
    filtroData,
    setFiltroData
  } = useMeuHistorico();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-[1400px] mx-auto relative mt-6">
      
      {/* CABEÇALHO COM FILTRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Meu Histórico de Vendas</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Operador:</span>
            <span className="text-sm font-bold text-[#0D9488] uppercase">
              {operadorAtual ? operadorAtual.name : 'Carregando...'}
            </span>
          </div>
        </div>

        {/* 🟢 FILTRO DE DATA ESTILIZADO */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Data:</label>
          <div className="relative w-full md:w-44">
            <input 
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 text-sm shadow-sm"
            />
            {filtroData && (
              <button 
                onClick={() => setFiltroData('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                title="Limpar Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>


      <TabelaMinhasVendas 
        vendas={vendasFiltradas}
        isLoading={isLoading} 
        formatDate={formatDate} 
      />

      {/* TOTALIZADORES SEPARADOS */}
      <ResumoTotais 
        totalVendidoPago={totalVendidoPago} 
        totalVendidoFiado={totalVendidoFiado} 
      />
      
    </div>
  );
}