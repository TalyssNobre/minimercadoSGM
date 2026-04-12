'use client';
import React, { useMemo, useState, useEffect } from 'react';

// 🟢 IMPORTANDO AS FUNÇÕES DO BACKEND
import { getLoggedUserController } from '@/src/Server/controllers/UserController';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 

interface User {
  id: number; 
  name: string;
  user_id: string; 
}

interface Team {
  name: string;
}

interface Member {
  name: string;
  Team?: Team; 
}

interface Product {
  name: string;
}

interface ItemSale {
  quantity: number; 
  Product?: Product; 
}

interface Sale {
  id: number;
  date: string; 
  total_value: number; 
  status: boolean; 
  payment_date?: string | null; 
  member?: Member; 
  Item_sale?: ItemSale[]; 
}

export default function MeuHistoricoPage() {
  const [operadorAtual, setOperadorAtual] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDoSupabase() {
      setIsLoading(true);
      try {
        const userResp = await getLoggedUserController();
        const userLogado = (userResp as any)?.user || (userResp as any)?.data?.user;

        if (userLogado && userLogado.id) {
          setOperadorAtual({ 
            id: userLogado.id, 
            name: userLogado.name || 'Operador', 
            user_id: userLogado.id.toString() 
          });

          const salesResp = await getAllSales() as any;
          
          if (salesResp?.success && salesResp?.data) {
            const todasVendas = Array.isArray(salesResp.data) ? salesResp.data : (salesResp.data.sale || []);
            
            // 🟢 Filtra apenas as vendas deste operador
            const minhasVendas = todasVendas.filter((v: any) => v.user_id === userLogado.id);

            const vendasFormatadas: Sale[] = minhasVendas.map((row: any) => {
              const itensBrutos = row.Item_sale || row.item_sale || [];
              const membroBruto = row.Member || row.member || null;

              return {
                id: row.id,
                date: row.date,
                total_value: row.total_value,
                status: row.status, 
                payment_date: row.payment_date,
                member: {
                  name: membroBruto?.name || 'Cliente Avulso',
                  Team: { name: membroBruto?.Team?.name || membroBruto?.team?.name || '' }
                },
                Item_sale: itensBrutos.map((item: any) => ({
                  quantity: item.quantity,
                  Product: { name: item.Product?.name || item.product?.name || 'Produto' }
                }))
              };
            });

            setVendas(vendasFormatadas);
          }
        } else {
          setOperadorAtual({ id: 0, name: 'Sessão Expirada', user_id: '' });
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarDadosDoSupabase();
  }, []);

  // =========================================================================
  // 🟢 CÁLCULOS SEPARADOS DE TOTAIS
  // =========================================================================
  const totalVendidoPago = useMemo(() => {
    return vendas
      .filter(v => v.status === true) // Soma apenas as vendas PAGAS
      .reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  }, [vendas]);

  const totalVendidoFiado = useMemo(() => {
    return vendas
      .filter(v => v.status === false) // Soma apenas as vendas PENDENTES (Fiado)
      .reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  }, [vendas]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-[1400px] mx-auto relative">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Meu Histórico de Vendas</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Operador:</span>
            <span className="text-sm font-bold text-[#0D9488] uppercase">
              {operadorAtual ? operadorAtual.name : 'Carregando...'}
            </span>
          </div>
        </div>
      </div>

      {/* TABELA DE VENDAS */}
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
                        <span className="text-xs text-gray-400">
                          Equipe: {venda.member.Team.name}
                        </span>
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
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      venda.status 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
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

      {/* 🟢 TOTALIZADORES SEPARADOS */}
      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
        
        {/* Card do Fiado (Amarelo) */}
        <div className="bg-yellow-50 border border-yellow-200 px-6 py-3 rounded-lg shadow-sm flex justify-between items-center min-w-[250px]">
          <span className="text-sm font-semibold text-yellow-700 mr-3">A Receber (Fiado):</span>
          <span className="text-xl font-bold text-yellow-600">{formatCurrency(totalVendidoFiado)}</span>
        </div>

        {/* Card do Pago (Verde) */}
        <div className="bg-green-50 border border-green-200 px-6 py-3 rounded-lg shadow-sm flex justify-between items-center min-w-[250px]">
          <span className="text-sm font-semibold text-green-700 mr-3">Meu Total Válido:</span>
          <span className="text-xl font-bold text-[#0D9488]">{formatCurrency(totalVendidoPago)}</span>
        </div>

      </div>
      
    </div>
  );
}