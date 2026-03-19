'use client';
import React, { useMemo, useState } from 'react';

// =========================================================================
// MOCK (Simulando apenas as vendas do operador logado)
// PAGINNA NAO PRONTA
// =========================================================================
const MINHAS_VENDAS_MOCK = [
  { sale_id: 101, date: '18/03', client_name: 'Tio João', total_value: 25.00, payment_status: 'PAGO', items: [{ name: 'Livro "O Alquimista"', quantity: 1 }] },
  { sale_id: 102, date: '18/03', client_name: 'Maria Silva', total_value: 12.50, payment_status: 'FIADO', items: [{ name: 'Bolo de Pote', quantity: 1 }, { name: 'Refri Lata', quantity: 1 }] },
  { sale_id: 105, date: '17/03', client_name: 'Visitante', total_value: 8.00, payment_status: 'PAGO', items: [{ name: 'Bolo de Pote', quantity: 1 }] },
];

export default function MeuHistoricoPage() {
  const [vendas] = useState(MINHAS_VENDAS_MOCK);

  const totalMeuTurno = useMemo(() => {
    return vendas.reduce((acc, curr) => acc + curr.total_value, 0);
  }, [vendas]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Meu Histórico de Vendas</h2>
          <p className="text-gray-500 text-sm mt-1">Confira aqui as vendas realizadas no seu turno.</p>
        </div>
        
        <div className="bg-[#0D9488]/10 px-4 py-2 rounded-lg border border-[#0D9488]/20">
          <span className="text-sm text-gray-600 font-medium">Total do meu turno: </span>
          <span className="text-lg font-bold text-[#0D9488]">{formatCurrency(totalMeuTurno)}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Data</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Cliente</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Itens</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-center">Pagamento</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendas.map((venda) => (
              <tr key={venda.sale_id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-700">{venda.date}</td>
                <td className="py-4 px-4 text-sm font-medium text-gray-800">{venda.client_name}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {venda.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    venda.payment_status === 'PAGO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {venda.payment_status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm font-bold text-gray-800 text-right">
                  {formatCurrency(venda.total_value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {vendas.length === 0 && (
          <div className="p-10 text-center text-gray-500 italic">
            Você ainda não realizou nenhuma venda hoje.
          </div>
        )}
      </div>
    </div>
  );
}