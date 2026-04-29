import React from 'react';
import { Sale } from './types';

interface Props {
  vendas: (Sale & { discount?: number })[];
  isLoading: boolean;
  formatDate: (dateString: string) => string; 
}

export default function TabelaMinhasVendas({ vendas, isLoading, formatDate }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[380px] border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-24">Data</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Cliente / Equipe</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700">Itens da Compra</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Status</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-right">Valor Líquido</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-500">
                <div className="animate-pulse font-medium">Carregando seu histórico...</div>
              </td>
            </tr>
          ) : vendas.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-gray-500">
                <p className="text-lg font-medium text-gray-700">Nenhuma venda encontrada</p>
              </td>
            </tr>
          ) : (
            vendas.map((venda) => {
              const desconto = venda.discount || 0;
              const valorBruto = venda.total_value || 0;
              const valorLiquido = valorBruto - desconto;

              return (
                <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-800">{formatDate(venda.date)}</td>
                  
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span>{venda.member?.name || 'Cliente Avulso'}</span>
                      {venda.member?.Team?.name && (
                        <span className="text-xs text-gray-400">Equipe: {venda.member.Team.name}</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1.5">
                      {venda.Item_sale?.map((item, idx) => {
                        // 🟢 VERIFICADOR DE DESCONTO INDIVIDUAL
                        const descontoDoItem = item.item_discount || 0;
                        const teveDesconto = descontoDoItem > 0;

                        return (
                          <span 
                            key={idx} 
                            className={`px-2 py-1 rounded text-xs border inline-flex items-center gap-1 ${
                              teveDesconto 
                                ? 'bg-orange-50 border-orange-200 text-orange-800 font-medium shadow-sm' // 🟠 Com Desconto
                                : 'bg-gray-50 border-gray-200 text-gray-600' // ⚪ Sem Desconto
                            }`}
                          >
                            {item.quantity}x {item.Product?.name || 'Produto'}
                            
                            {/* 🟢 SE TEVE DESCONTO, MOSTRA A QUEDA AQUI DENTRO! */}
                            {teveDesconto && (
                              <span className="ml-1 text-orange-600 font-bold">
                              -{formatCurrency(descontoDoItem)}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${venda.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {venda.status ? 'Pago' : 'Fiado'}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 text-sm font-medium text-right flex flex-col items-end">
                    <span className="text-gray-900 font-bold text-base">
                      {formatCurrency(valorLiquido)}
                    </span>
                    
                    {desconto > 0 && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-400 line-through">{formatCurrency(valorBruto)}</span>
                        <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded">- {formatCurrency(desconto)}</span>
                      </div>
                    )}
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