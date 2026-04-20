import React, { useMemo } from 'react';
import { Category, HistoricoLinha } from './types';

interface Props {
  categories: Category[];
  historico: HistoricoLinha[];
  activeTab: string | number;
  setActiveTab: (tab: string | number) => void;
}

export default function TabelaHistorico({ categories, historico, activeTab, setActiveTab }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const historicoFiltrado = useMemo(() => {
    if (activeTab === 'Todos') return historico;
    return historico.filter(h => h.categoria_id === activeTab);
  }, [activeTab, historico]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Histórico de Vendas - Setores</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('Todos')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === 'Todos' ? 'bg-[#0D9488] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === cat.id ? 'bg-[#0D9488] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[400px] relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Data</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Operador</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Cliente</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Produto</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center bg-gray-50">Qtd</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center bg-gray-50">Pagamento</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50">Valor Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {historicoFiltrado.map((linha) => {
              // 🟢 A MÁGICA VISUAL AQUI
              const liquido = linha.valor_liquido ?? linha.valor_total;
              const temDesconto = liquido < linha.valor_total;

              return (
                <tr key={linha.id_unico} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-sm text-gray-600">{linha.data}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 font-medium">{linha.operador}</td>
                  <td className="py-3 px-6 text-sm text-gray-600">{linha.cliente}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 font-medium">{linha.produto_nome}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 text-center">{linha.qty}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${linha.pagamento === 'PAGO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {linha.pagamento}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm font-bold text-right flex flex-col items-end">
                    <span className="text-[#0D9488]">{formatCurrency(liquido)}</span>
                    {temDesconto && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatCurrency(linha.valor_total)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {historicoFiltrado.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 bg-white">
                  Nenhum registro encontrado. Comece a vender para ver o histórico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}