'use client';
import React, { useMemo, useState, useEffect } from 'react';

// =========================================================================
// INTERFACES (Tipagens baseadas no MER / Supabase)
// =========================================================================
interface Category {
  id: number; // PK
  name: string;
}

interface Product {
  id: number; // PK
  name: string;
  category_id: number; // FK
}

interface ItemSale {
  product_id: number; // FK
  qty: number;
  price: number; // Preço na hora da venda
}

interface Sale {
  sale_id: number; // PK
  date: string;
  operator_name: string; // Vem do JOIN com a tabela User
  client_name: string; // Vem do JOIN com a tabela Member
  status: 'ATIVA' | 'CANCELADA'; // Status de validade da venda
  payment_status: 'PAGO' | 'FIADO'; // Status financeiro
  items: ItemSale[]; // Vem do JOIN com a tabela Item_Sale
}

export default function DashboardFinanceiro() {
  // =========================================================================
  // ESTADOS PRINCIPAIS (Iniciam vazios, prontos para o Supabase)
  // =========================================================================
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Estado para controlar a aba selecionada ('Todos' ou o ID da Categoria)
  const [activeTab, setActiveTab] = useState<string | number>('Todos');

  // =========================================================================
  // LÓGICA DE CÁLCULO (Cérebro do Dashboard)
  // =========================================================================
  const { totaisGerais, totaisPorCategoria, historicoDesmembrado } = useMemo(() => {
    let totalVendido = 0;
    let totalRecebido = 0;
    let totalAReceber = 0;
    
    // Objeto para acumular os valores por ID da categoria
    const catTotals: Record<number, number> = {};
    categories.forEach(c => { catTotals[c.id] = 0; });

    const historico: any[] = []; 

    // Ignora vendas canceladas na matemática
    const vendasValidas = sales.filter(s => s.status !== 'CANCELADA');

    vendasValidas.forEach(venda => {
      venda.items.forEach(item => {
        const valorItemTotal = item.qty * item.price;
        const produto = products.find(p => p.id === item.product_id);
        
        if (produto) {
          // 1. Soma nos Totais Gerais
          totalVendido += valorItemTotal;
          if (venda.payment_status === 'PAGO') totalRecebido += valorItemTotal;
          if (venda.payment_status === 'FIADO') totalAReceber += valorItemTotal;

          // 2. Soma nos Totais por Categoria
          if (catTotals[produto.category_id] !== undefined) {
            catTotals[produto.category_id] += valorItemTotal;
          }

          // 3. Monta a linha para a Tabela de Histórico
          historico.push({
            id_unico: `${venda.sale_id}-${produto.id}`,
            data: venda.date,
            operador: venda.operator_name,
            cliente: venda.client_name,
            produto_nome: produto.name,
            categoria_id: produto.category_id,
            qty: item.qty,
            pagamento: venda.payment_status,
            valor_total: valorItemTotal
          });
        }
      });
    });

    // Deixa as vendas mais recentes no topo
    historico.reverse();

    return {
      totaisGerais: { totalVendido, totalRecebido, totalAReceber },
      totaisPorCategoria: catTotals,
      historicoDesmembrado: historico
    };
  }, [categories, products, sales]);

  // Filtra a tabela baseada na Aba selecionada
  const historicoFiltrado = useMemo(() => {
    if (activeTab === 'Todos') return historicoDesmembrado;
    return historicoDesmembrado.filter(h => h.categoria_id === activeTab);
  }, [activeTab, historicoDesmembrado]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do caixa e rateio de setores do evento.</p>
      </div>

      {/* ========================================== */}
      {/* CARDS DE TOTAIS GERAIS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Geral Vendido</p>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totaisGerais.totalVendido)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Recebido (Caixa)</p>
            <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totaisGerais.totalRecebido)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total a Receber (Fiado)</p>
            <h3 className="text-2xl font-bold text-amber-600">{formatCurrency(totaisGerais.totalAReceber)}</h3>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SUBTOTAIS POR CATEGORIA (Cards Menores) */}
      {/* ========================================== */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Subtotais por Categoria (Rateio)
          {categories.length > 0 && (
            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{categories.length} Setores</span>
          )}
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setActiveTab(cat.id)}
              className={`bg-white rounded-xl p-5 border shadow-sm transition-all cursor-pointer border-l-4
                ${activeTab === cat.id ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20' : 'border-gray-100 hover:border-[#0D9488]/50 border-l-[#0D9488]'}
              `}
            >
              <p className="text-sm font-bold text-gray-600 truncate">{cat.name}</p>
              <h4 className="text-xl font-bold text-gray-800 mt-2">{formatCurrency(totaisPorCategoria[cat.id] || 0)}</h4>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full p-6 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
              Nenhuma categoria ou venda registrada ainda.
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* HISTÓRICO DE VENDAS - SETORES */}
      {/* ========================================== */}
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
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {historicoFiltrado.map((linha) => (
                <tr key={linha.id_unico} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-sm text-gray-600">{linha.data}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 font-medium">{linha.operador}</td>
                  <td className="py-3 px-6 text-sm text-gray-600">{linha.cliente}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 font-medium">{linha.produto_nome}</td>
                  <td className="py-3 px-6 text-sm text-gray-800 text-center">{linha.qty}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      linha.pagamento === 'PAGO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {linha.pagamento}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm font-bold text-[#0D9488] text-right">{formatCurrency(linha.valor_total)}</td>
                </tr>
              ))}
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

    </div>
  );
}