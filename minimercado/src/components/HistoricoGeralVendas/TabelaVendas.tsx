import React from 'react';
import { Venda } from './types';

interface Props {
  isLoading: boolean;
  vendas: Venda[];
  onCancelar: (venda: Venda) => void;
}

export default function TabelaVendas({ isLoading, vendas, onCancelar }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[380px] border border-gray-200 rounded-lg shadow-sm mt-6">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-24">Data</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Operador</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Cliente</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700">Itens da Compra</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Status</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-right">Valor Líquido</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-500">
                <div className="animate-pulse font-medium">Carregando histórico...</div>
              </td>
            </tr>
          ) : vendas.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-12 text-center text-gray-500">
                <p className="text-lg font-medium text-gray-700">Nenhuma venda encontrada</p>
              </td>
            </tr>
          ) : (
            vendas.map((venda) => {
              // 🟢 A MÁGICA ACONTECE AQUI TAMBÉM
              const desconto = venda.discount || 0;
              const valorBruto = venda.total_value || 0;
              const valorLiquido = valorBruto - desconto;

              return (
                <tr key={venda.sale_id} className={`transition-colors ${!venda.status ? 'bg-red-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-4 text-sm text-gray-800">{venda.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{venda.operator_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{venda.client_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {venda.items.map((item) => (
                        <span key={item.id_item_sale || Math.random()} className="px-2 py-0.5 rounded text-xs border">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${venda.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {venda.status ? 'Pago' : 'Fiado'}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium text-right flex flex-col items-end ${!venda.status ? 'text-gray-400' : 'text-gray-800'}`}>
                    {/* 🟢 SE TEVE DESCONTO, MOSTRA O VALOR FINAL E A ETIQUETA */}
                    <span className="font-bold text-base">
                      {formatCurrency(valorLiquido)}
                    </span>
                    
                    {desconto > 0 && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-400 line-through">{formatCurrency(valorBruto)}</span>
                        <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded">- {formatCurrency(desconto)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => onCancelar(venda)} className="bg-[#c82333] hover:bg-[#a71d2a] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm">
                      Cancelar Venda
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}