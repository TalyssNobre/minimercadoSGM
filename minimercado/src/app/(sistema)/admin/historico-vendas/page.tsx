'use client';
import React, { useState } from 'react';

// Componentes UI
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import TabelaVendas from '@/src/components/HistoricoGeralVendas/TabelaVendas';
import ModalCancelamento from '@/src/components/HistoricoGeralVendas/ModalCancelamento';

// Hooks e Tipos
import { useHistoricoVendas } from '@/src/components/HistoricoGeralVendas/hooks/useHistoricoVendas';
import { Venda } from '@/src/components/HistoricoGeralVendas/types';

export default function HistoricoVendasPage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  // Puxando nosso cérebro do Histórico
  const historico = useHistoricoVendas(exibirAlerta);

  // Controle de Interface (Modal)
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Histórico Geral de Vendas</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filtrar por Vendedor</label>
            <select 
              value={historico.filtroVendedor}
              onChange={(e) => historico.setFiltroVendedor(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 text-sm shadow-sm"
            >
              <option value="Todos">{historico.isLoading ? 'Carregando...' : 'Todos'}</option>
              {historico.operadores.map(op => (
                <option key={op.user_id} value={op.user_id}>{op.name}</option>
              ))}
            </select>
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
            <span className="text-sm font-semibold text-gray-600 mr-3">Total Válido (Filtro):</span>
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