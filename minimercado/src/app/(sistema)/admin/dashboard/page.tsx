'use client';
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Subcomponentes Visuais
import ResumoCards from '@/src/components/dashboard/ResumoCards';
import SubtotaisSetores from '@/src/components/dashboard/SubtotaisSetores';
import EstatisticaProduto from '@/src/components/dashboard/EstatisticaProduto'; 

// Molde do Relatório
import { RelatorioFechamento } from '@/src/components/dashboard/RelatorioFechamento';

// Hook de Dados
import { useDashboardData } from '@/src/components/dashboard/hooks/useDashboardData';

export default function DashboardPage() {
  const { 
    categories, 
    products, 
    fetchProductStats, 
    isLoading, 
    totaisGerais, 
    totaisPorCategoria, 
    curvaABC 
  } = useDashboardData();
  
  // Mantemos o activeTab porque o SubtotaisSetores precisa dele
  const [activeTab, setActiveTab] = useState<string | number>('Todos');

  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: 'Relatorio_Fechamento_SGM',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <svg className="animate-spin h-10 w-10 text-[#0D9488]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium">Calculando caixa...</p>
      </div>
    );
  }

  return (
    <div className="py-2 relative overflow-x-hidden">
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Financeiro</h1>
            <p className="text-gray-500 text-sm mt-1">Visão geral do caixa e faturamento por setor.</p>
          </div>

          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v2.796c0 1.136.92 2.053 2.053 2.053h6.394c1.132 0 2.053-.917 2.053-2.053V9.214Z" />
            </svg>
            Gerar Relatório (PDF)
          </button>
        </div>

        <ResumoCards totaisGerais={totaisGerais} />
        <EstatisticaProduto produtos={products} fetchStats={fetchProductStats} />
        
        <SubtotaisSetores 
          categories={categories} 
          totaisPorCategoria={totaisPorCategoria} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>

      <div className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
        <RelatorioFechamento 
          ref={componentRef} 
          totaisGerais={totaisGerais} 
          totaisPorCategoria={totaisPorCategoria} 
          categories={categories} 
          curvaABC={curvaABC} 
        />
      </div>
    </div>
  );
}