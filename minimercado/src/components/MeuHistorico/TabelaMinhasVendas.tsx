import React from 'react';
import { Sale } from './types';

interface Props {
  vendas: Sale[];
  isLoading: boolean;
}

export default function TabelaMinhasVendas({ vendas, isLoading }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[380px] border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-24">Data</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Cliente / Equipe</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700">Itens da Compra</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Status</th>
            <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-right">Valor Total</th>
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
            vendas.map((venda) => (
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
                  <div className="flex flex-wrap gap-1">
                    {venda.Item_sale?.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50">
                        {item.quantity}x {item.Product?.name || 'Produto'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${venda.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {venda.status ? 'Pago' : 'Fiado'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-right text-gray-800">
                  {formatCurrency(venda.total_value)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}