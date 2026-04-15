'use client';
import React from 'react';

// Subcomponentes
import TabelaMinhasVendas from '@/src/components/MeuHistorico/TabelaMinhasVendas';
import ResumoTotais from '@/src/components/MeuHistorico/ResumoTotais';

// O "Cérebro"
import { useMeuHistorico } from '@/src/components/MeuHistorico/hooks/useMeuHistorico';

export default function MeuHistoricoPage() {
  const { operadorAtual, vendas, isLoading, totalVendidoPago, totalVendidoFiado } = useMeuHistorico();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-[1400px] mx-auto relative mt-6">
      
      {/* CABEÇALHO */}
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
      </div>

      {/* TABELA DE VENDAS */}
      <TabelaMinhasVendas vendas={vendas} isLoading={isLoading} />

      {/* TOTALIZADORES SEPARADOS */}
      <ResumoTotais totalVendidoPago={totalVendidoPago} totalVendidoFiado={totalVendidoFiado} />
      
    </div>
  );
}