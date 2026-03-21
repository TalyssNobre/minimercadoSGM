'use client';
import React, { useState, useMemo } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';

// =========================================================================
// INTERFACES (Tipagens baseadas no DER)
// =========================================================================
interface ItemVenda {
  name: string; // Virá do JOIN com Product
  quantity: number; // Virá de Item_Sale
}

interface Venda {
  sale_id: number;
  date: string;
  operator_id: number;
  operator_name: string; // Virá do JOIN com a tabela de Usuários (operadores)
  client_name: string; // Virá do JOIN com a tabela Member
  total_value: number;
  status: 'ATIVA' | 'CANCELADA';
  payment_status: 'PAGO' | 'FIADO'; // Baseado no status original da venda (1 ou 2)
  items: ItemVenda[];
}

interface Operador {
  user_id: number;
  name: string;
}

export default function HistoricoGeralVendas() {
  // =========================================================================
  // ESTADOS PRINCIPAIS (Prontos para o Supabase)
  // =========================================================================
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  
  const [filtroVendedor, setFiltroVendedor] = useState<string>('Todos');

  // Estados do Modal de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);

  // =========================================================================
  // LÓGICA DE FILTRAGEM
  // =========================================================================
  const vendasFiltradas = useMemo(() => {
    if (filtroVendedor === 'Todos') return vendas;
    return vendas.filter(v => v.operator_id.toString() === filtroVendedor);
  }, [vendas, filtroVendedor]);

  const totalFiltrado = useMemo(() => {
    // Soma apenas as vendas ativas
    return vendasFiltradas
      .filter(v => v.status === 'ATIVA')
      .reduce((acc, curr) => acc + curr.total_value, 0);
  }, [vendasFiltradas]);

  // =========================================================================
  // FUNÇÕES DE AÇÃO
  // =========================================================================
  const handleAbrirCancelamento = (venda: Venda) => {
    setVendaParaCancelar(venda);
    setIsCancelModalOpen(true);
  };

  const confirmarCancelamento = () => {
    if (vendaParaCancelar) {
      // 🟢 TODO SUPABASE: Transaction necessária aqui
      // 1. UPDATE Sale SET status = 'CANCELADA' WHERE sale_id = vendaParaCancelar.sale_id
      // 2. Fazer um loop nos itens e devolver a 'quantity' pro 'stock' na tabela Product
      
      const listaAtualizada = vendas.map(v => 
        v.sale_id === vendaParaCancelar.sale_id ? { ...v, status: 'CANCELADA' as const } : v
      );
      setVendas(listaAtualizada);
      
      setIsCancelModalOpen(false);
      setVendaParaCancelar(null);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-[1400px] mx-auto relative">
      
      {/* CABEÇALHO E FILTRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Histórico Geral de Vendas</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filtrar por Vendedor</label>
          <select 
            value={filtroVendedor}
            onChange={(e) => setFiltroVendedor(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 text-sm shadow-sm"
          >
            <option value="Todos">{operadores.length === 0 ? 'Carregando...' : 'Todos'}</option>
            {operadores.map(op => (
              <option key={op.user_id} value={op.user_id}>{op.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-24">Data</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Operador</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Cliente</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700">Itens da Compra</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Pagamento</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-right">Valor Total</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Ação</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100 bg-white">
            {vendasFiltradas.map((venda) => (
              <tr key={venda.sale_id} className={`transition-colors ${venda.status === 'CANCELADA' ? 'bg-red-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                <td className="py-3 px-4 text-sm text-gray-800">{venda.date}</td>
                <td className="py-3 px-4 text-sm text-gray-800 font-medium">{venda.operator_name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{venda.client_name}</td>
                
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {venda.items.map((item, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded text-xs border ${venda.status === 'CANCELADA' ? 'border-red-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    venda.status === 'CANCELADA' 
                      ? 'bg-transparent text-gray-400 border border-gray-300' 
                      : venda.payment_status === 'PAGO' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {venda.payment_status}
                  </span>
                </td>
                
                <td className={`py-3 px-4 text-sm font-medium text-right ${venda.status === 'CANCELADA' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {formatCurrency(venda.total_value)}
                </td>
                
                <td className="py-3 px-4 text-center">
                  {venda.status === 'ATIVA' ? (
                    <button 
                      onClick={() => handleAbrirCancelamento(venda)}
                      className="bg-[#c82333] hover:bg-[#a71d2a] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Cancelar Venda
                    </button>
                  ) : (
                    <span className="text-red-500 text-xs font-bold uppercase bg-red-100 px-2 py-1 rounded">
                      Cancelada
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MENSAGEM DE ESTADO VAZIO */}
        {vendasFiltradas.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-white border-t border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">Nenhuma venda encontrada</p>
            <p className="text-sm">Os registros aparecerão aqui assim que as vendas começarem.</p>
          </div>
        )}
      </div>

      {/* TOTALIZADOR */}
      <div className="mt-4 flex justify-end">
        <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-lg shadow-sm">
          <span className="text-sm font-semibold text-gray-600 mr-3">Total Válido (Filtro):</span>
          <span className="text-xl font-bold text-[#0D9488]">{formatCurrency(totalFiltrado)}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
      {/* ========================================================================= */}
      {isCancelModalOpen && vendaParaCancelar && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center">
            
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cancelar Venda #{vendaParaCancelar.sale_id}?</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-left text-sm text-gray-700">
              <p><strong>Cliente:</strong> {vendaParaCancelar.client_name}</p>
              <p><strong>Status:</strong> {vendaParaCancelar.payment_status}</p>
              <p className="mt-1"><strong>Itens que retornarão ao estoque:</strong></p>
              <ul className="list-disc list-inside text-gray-500 text-xs ml-1">
                {vendaParaCancelar.items.map((item, idx) => (
                  <li key={idx}>{item.quantity}x {item.name}</li>
                ))}
              </ul>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Esta ação anulará a cobrança de <strong>{formatCurrency(vendaParaCancelar.total_value)}</strong>. Deseja confirmar?
            </p>
            
            <div className="flex justify-center gap-3">
              <ButtonSistema type="button" variant="outline" onClick={() => { setIsCancelModalOpen(false); setVendaParaCancelar(null); }}>
                Voltar
              </ButtonSistema>
              
              <ButtonSistema type="button" variant="danger" onClick={confirmarCancelamento}>
                Sim, Cancelar Venda
              </ButtonSistema>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}