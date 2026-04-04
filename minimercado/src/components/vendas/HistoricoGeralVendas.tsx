'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';

// 🟢 IMPORTANDO AS FUNÇÕES DO BACKEND 
import { getAllSales, deleteSale } from '@/src/Server/controllers/SaleController';
import { getAllUsersController } from '@/src/Server/controllers/UserController';

// =========================================================================
// INTERFACES 
// =========================================================================
interface ItemVenda {
  id_item_sale: number; 
  name: string; 
  quantity: number; 
}

interface Venda {
  sale_id: number;
  date: string;
  operator_id: number;
  operator_name: string; 
  client_name: string; 
  total_value: number;
  status: boolean; 
  items: ItemVenda[];
}

interface Operador {
  user_id: number;
  name: string;
}

export default function HistoricoGeralVendas() {
  // =========================================================================
  // ESTADOS PRINCIPAIS
  // =========================================================================
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filtroVendedor, setFiltroVendedor] = useState<string>('Todos');

  // Estados do Modal de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);

  // =========================================================================
  // BUSCA E FORMATAÇÃO DE DADOS
  // =========================================================================
  const fetchDados = async () => {
    setIsLoading(true);
    try {
      // 1. BUSCA OS OPERADORES
      const usersResponse = await getAllUsersController() as any;
      if (usersResponse?.success && usersResponse?.users) {
        const opsFormatados = usersResponse.users.map((u: any) => ({
          user_id: u.id, 
          name: u.name
        }));
        setOperadores(opsFormatados);
      }

      // 2. BUSCA AS VENDAS
      const response = await getAllSales() as any;
      
      if (response?.success && response?.data) {
        const dadosBrutos = Array.isArray(response.data) ? response.data : (response.data.sale || []);
        
        console.log("Dados que chegaram do Supabase:", dadosBrutos); 

        const vendasFormatadas: Venda[] = dadosBrutos.map((row: any) => {
          const itensBrutos = row.Item_sale || row.item_sale || row.itemSale || [];

          return {
            sale_id: row.id, 
            date: formatDate(row.date), 
            operator_id: row.user_id || 0,
            operator_name: row.User?.name || row.user?.name || 'Desconhecido',
            client_name: row.Member?.name || row.member?.name || 'Cliente Avulso',
            total_value: row.total_value, 
            status: Boolean(row.status), 
            items: itensBrutos.map((item: any) => ({
              id_item_sale: item.id_item_sale, 
              name: item.Product?.name || item.product?.name || 'Produto',
              quantity: item.quantity
            }))
          };
        });

        setVendas(vendasFormatadas);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // =========================================================================
  // LÓGICA DE FILTRAGEM
  // =========================================================================
  const vendasFiltradas = useMemo(() => {
    if (filtroVendedor === 'Todos') return vendas;
    return vendas.filter(v => v.operator_id.toString() === filtroVendedor);
  }, [vendas, filtroVendedor]);

  const totalFiltrado = useMemo(() => {
    return vendasFiltradas
      .filter(v => v.status === true) 
      .reduce((acc, curr) => acc + curr.total_value, 0);
  }, [vendasFiltradas]);

  // =========================================================================
  // FUNÇÕES DE AÇÃO (CANCELAMENTO)
  // =========================================================================
  const handleAbrirCancelamento = (venda: Venda) => {
    setVendaParaCancelar(venda);
    setIsCancelModalOpen(true);
  };

  const confirmarCancelamento = async () => {
    if (!vendaParaCancelar) return;

    try {
      const response = await deleteSale(vendaParaCancelar.sale_id) as any;
      
      if (response?.success === false || (response as any)?.sucess === false) {
        alert("Erro ao cancelar: " + response.message);
        return;
      }

      setIsCancelModalOpen(false);
      setVendaParaCancelar(null);
      fetchDados(); 

    } catch (error) {
      alert("Erro técnico ao cancelar a venda.");
      console.error(error);
    }
  };

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
            <option value="Todos">{isLoading ? 'Carregando...' : 'Todos'}</option>
            {operadores.map(op => (
              <option key={op.user_id} value={op.user_id}>{op.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      {/* 🟢 ADICIONADO: max-h-[380px] e overflow-y-auto */}
      <div className="overflow-x-auto overflow-y-auto max-h-[380px] border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          
          {/* 🟢 ADICIONADO: sticky top-0 z-10 shadow-sm */}
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-24">Data</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Operador</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-48">Cliente</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700">Itens da Compra</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-center">Status</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-700 w-32 text-right">Valor Total</th>
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
            ) : vendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500">
                  <p className="text-lg font-medium text-gray-700">Nenhuma venda encontrada</p>
                </td>
              </tr>
            ) : (
              vendasFiltradas.map((venda) => (
                <tr key={venda.sale_id} className={`transition-colors ${!venda.status ? 'bg-red-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-4 text-sm text-gray-800">{venda.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{venda.operator_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{venda.client_name}</td>
                  
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {venda.items.map((item) => (
                        <span key={item.id_item_sale || Math.random()} className={`px-2 py-0.5 rounded text-xs border`}>
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      venda.status 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {venda.status ? 'Pago' : 'Fiado'}
                    </span>
                  </td>
                  
                  <td className={`py-3 px-4 text-sm font-medium text-right ${!venda.status ? 'text-gray-400' : 'text-gray-800'}`}>
                    {formatCurrency(venda.total_value)}
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => handleAbrirCancelamento(venda)}
                        className="bg-[#c82333] hover:bg-[#a71d2a] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Cancelar Venda
                      </button>
                    
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALIZADOR */}
      <div className="mt-4 flex justify-end">
        <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-lg shadow-sm">
          <span className="text-sm font-semibold text-gray-600 mr-3">Total Válido (Filtro):</span>
          <span className="text-xl font-bold text-[#0D9488]">{formatCurrency(totalFiltrado)}</span>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
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
              <p className="mt-1"><strong>Itens:</strong></p>
              <ul className="list-disc list-inside text-gray-500 text-xs ml-1">
                {vendaParaCancelar.items.map((item) => (
                  <li key={item.id_item_sale || Math.random()}>{item.quantity}x {item.name}</li>
                ))}
              </ul>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Esta ação excluirá a cobrança de <strong>{formatCurrency(vendaParaCancelar.total_value)}</strong>. Deseja confirmar?
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