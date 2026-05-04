'use client';
import React, { useState } from 'react';

import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import TabelaVendas from '@/src/components/HistoricoGeralVendas/TabelaVendas';
import ModalCancelamento from '@/src/components/HistoricoGeralVendas/ModalCancelamento';

// Hooks e Tipos
import { useHistoricoVendas } from '@/src/components/HistoricoGeralVendas/hooks/useHistoricoVendas';
import { Venda } from '@/src/components/HistoricoGeralVendas/types';

export default function HistoricoVendasPage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const historico = useHistoricoVendas(exibirAlerta);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);

  const handleAbrirCancelamento = (venda: Venda) => {
    setVendaParaCancelar(venda);
    setIsCancelModalOpen(true);
  };

  const handleConfirmarCancelamento = async () => {
    if (vendaParaCancelar) {
      const sucesso = await historico.cancelarVenda(vendaParaCancelar.sale_id);
      if (sucesso) {
        setIsCancelModalOpen(false);
        setVendaParaCancelar(null);
      }
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-[1400px] mx-auto relative">
        
        {/* CABEÇALHO E FILTROS */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Histórico Geral de Vendas</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            
            {/* 🟢 FILTRO DE DATA */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Data:</label>
              <div className="relative w-full sm:w-44">
                <input 
                  type="date"
                  value={historico.filtroData}
                  onChange={(e) => historico.setFiltroData(e.target.value)}
                  className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 text-sm shadow-sm"
                />
                {historico.filtroData && (
                  <button 
                    onClick={() => historico.setFiltroData('')}
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

            {/* FILTRO DE VENDEDOR */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Vendedor:</label>
              <select 
                value={historico.filtroVendedor}
                onChange={(e) => historico.setFiltroVendedor(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 text-sm shadow-sm"
              >
                <option value="Todos">{historico.isLoading ? 'Carregando...' : 'Todos'}</option>
                {historico.operadores.map(op => (
                  <option key={op.user_id} value={op.user_id}>{op.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* TABELA MODULARIZADA */}
        <TabelaVendas 
          isLoading={historico.isLoading} 
          vendas={historico.vendasFiltradas} 
          onCancelar={handleAbrirCancelamento} 
        />

        {/* TOTALIZADOR */}
        <div className="mt-4 flex justify-end">
          <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-lg shadow-sm">
            <span className="text-sm font-semibold text-gray-600 mr-3">Total Válido (Filtros):</span>
            <span className="text-xl font-bold text-[#0D9488]">{formatCurrency(historico.totalFiltrado)}</span>
          </div>
        </div>

        {/* MODAIS (invisíveis até serem chamados) */}
        <ModalCancelamento 
          isOpen={isCancelModalOpen} 
          venda={vendaParaCancelar} 
          onClose={() => { setIsCancelModalOpen(false); setVendaParaCancelar(null); }} 
          onConfirm={handleConfirmarCancelamento} 
        />
        
        <ModalAlerta 
          isOpen={modalAlerta.isOpen}
          mensagem={modalAlerta.mensagem}
          tipo={modalAlerta.tipo}
          onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
        />

      </div>
    </div>
  );
}