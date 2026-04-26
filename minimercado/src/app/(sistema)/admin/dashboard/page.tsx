'use client';
import React, { useState } from 'react';

// Subcomponentes Visuais
import ResumoCards from '@/src/components/dashboard/ResumoCards';
import SubtotaisSetores from '@/src/components/dashboard/SubtotaisSetores';
import TabelaHistorico from '@/src/components/dashboard/TabelaHistorico';

// 🟢 1. Importação do novo componente de análise por produto
import EstatisticaProduto from '@/src/components/dashboard/EstatisticaProduto'; 

// O "Cérebro" (Hook customizado)
import { useDashboardData } from '@/src/components/dashboard/hooks/useDashboardData';

export default function DashboardPage() {
  // 🟢 2. Extraímos 'products' e 'fetchProductStats' que adicionamos no Hook
  const { 
    categories, 
    products, 
    fetchProductStats, 
    isLoading, 
    totaisGerais, 
    totaisPorCategoria, 
    historicoDesmembrado 
  } = useDashboardData();
  
  // Estado que controla o filtro de categoria para os componentes abaixo
  const [activeTab, setActiveTab] = useState<string | number>('Todos');

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <svg className="animate-spin h-10 w-10 text-[#0D9488]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium">Calculando caixa e setores...</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        {/* CABEÇALHO */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Financeiro</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do caixa e faturamento por produto.</p>
        </div>

        {/* 1. CARDS DE RESUMO GERAL (Vendido, Recebido, Fiado) */}
        <ResumoCards totaisGerais={totaisGerais} />
        
        {/* 🟢 3. NOVO COMPONENTE: Estatísticas específicas por Produto selecionado */}
        <EstatisticaProduto produtos={products} fetchStats={fetchProductStats} />
        
        {/* 4. RATEIO POR CATEGORIAS (SETORES) */}
        <SubtotaisSetores 
          categories={categories} 
          totaisPorCategoria={totaisPorCategoria} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        {/* 5. TABELA DE HISTÓRICO DETALHADO */}
        <TabelaHistorico 
          categories={categories} 
          historico={historicoDesmembrado} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

      </div>
    </div>
  );
}