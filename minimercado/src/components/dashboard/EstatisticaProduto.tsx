import React, { useState, useMemo } from 'react';
import { Product, ComboItem } from './types'; 
import { InputPesquisa } from '@/src/components/ui/InputPesquisa';

interface Props {
  produtos: Product[]; 
  fetchStats: (id: number | string) => Promise<{ quantidadeSold: number; totalArrecadado: number; totalDesconto: number } | null>;
}

export default function EstatisticaProduto({ produtos, fetchStats }: Props) {
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [stats, setStats] = useState({ quantidadeSold: 0, totalArrecadado: 0, totalDesconto: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const produtosFiltrados = useMemo(() => {
    if (!termoPesquisa.trim()) return [];
    return produtos.filter(p => p.name.toLowerCase().includes(termoPesquisa.toLowerCase())).slice(0, 5);
  }, [termoPesquisa, produtos]);

  const selecionarProduto = async (p: Product) => {
    setProdutoSelecionado(p);
    setTermoPesquisa(p.name);
    setMostrarSugestoes(false);
    setIsLoading(true);
    const data = await fetchStats(p.id);
    if (data) setStats(data);
    setIsLoading(false);
  };

  const impactoEstoque = useMemo(() => {
    if (!produtoSelecionado || !produtoSelecionado.combo || stats.quantidadeSold <= 0) return [];

    try {
      const comboParseado = typeof produtoSelecionado.combo === 'string' 
        ? JSON.parse(produtoSelecionado.combo) 
        : produtoSelecionado.combo;
      
      const comboArray: ComboItem[] = Array.isArray(comboParseado) ? comboParseado : [];

      return comboArray.map(item => {
        const idIngrediente = item.product_id || item.produto_id;
        const qtdPorCombo = item.quantity || item.qty || 1;
        
        const produtoReal = produtos.find(p => p.id === Number(idIngrediente));

        return {
          nome: produtoReal ? produtoReal.name : 'Produto Excluído/Desconhecido',
          qtdPorCombo: qtdPorCombo,
          totalBaixado: qtdPorCombo * stats.quantidadeSold 
        };
      });
    } catch (error) {
      console.error("Erro ao ler composição do combo:", error);
      return [];
    }
  }, [produtoSelecionado, stats.quantidadeSold, produtos]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mt-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Total Vendido de Cada Produto</h2>
          <p className="text-sm text-gray-500">Calcula o total de vendas e descontos aplicados.</p>
        </div>
        
        <div className="w-full md:w-80 relative">
          <InputPesquisa 
            value={termoPesquisa}
            onChange={(val) => { setTermoPesquisa(val); setMostrarSugestoes(true); if(!val) setProdutoSelecionado(null); }}
            placeholder="Pesquisar produto..."
          />
          {mostrarSugestoes && produtosFiltrados.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              {produtosFiltrados.map(p => (
                <button key={p.id} onClick={() => selecionarProduto(p)} className="w-full text-left px-4 py-3 hover:bg-[#0D9488]/10 text-sm text-gray-700 flex justify-between items-center border-b last:border-none border-gray-50">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400">Selecionar</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {produtoSelecionado ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            
            {/* CARD UNIDADES */}
            <div className="bg-blue-50 border border-blue-100 p-4 lg:p-5 rounded-xl flex items-center justify-start gap-3 lg:gap-4">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" /></svg>
               </div>
               <div className="flex flex-col justify-center flex-1 min-w-0">
                 <p className="text-[11px] lg:text-sm font-semibold text-blue-600 uppercase tracking-wide leading-normal">
                   Unidades
                 </p>
                 {/* 🟢 Adicionado leading-normal para evitar o corte no topo das fontes pesadas */}
                 <p className="text-base md:text-base lg:text-xl xl:text-2xl font-black text-blue-900 leading-normal">
                   {isLoading ? "..." : `${stats.quantidadeSold} un`}
                 </p>
               </div>
            </div>

            {/* CARD FATURAMENTO */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 lg:p-5 rounded-xl flex items-center justify-start gap-3 lg:gap-4">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0" /></svg>
               </div>
               <div className="flex flex-col justify-center flex-1 min-w-0">
                 <p className="text-[11px] lg:text-sm font-semibold text-emerald-600 uppercase tracking-wide leading-normal">
                   Faturamento
                 </p>
                 <p className="text-base md:text-base lg:text-xl xl:text-2xl font-black text-emerald-900 leading-normal">
                   {isLoading ? "..." : formatCurrency(stats.totalArrecadado)}
                 </p>
               </div>
            </div>

            {/* CARD DESCONTOS */}
            <div className="bg-rose-50 border border-rose-100 p-4 lg:p-5 rounded-xl flex items-center justify-start gap-3 lg:gap-4">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l7.181-7.181a1.125 1.125 0 000-1.591l-9.581-9.581c-.422-.422-.994-.659-1.591-.659zM6 7.125a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
               </div>
               <div className="flex flex-col justify-center flex-1 min-w-0">
                 <p className="text-[11px] lg:text-sm font-semibold text-rose-600 uppercase tracking-wide leading-normal">
                   Descontos
                 </p>
                 <p className="text-base md:text-base lg:text-xl xl:text-2xl font-black text-rose-900 leading-normal">
                   {isLoading ? "..." : formatCurrency(stats.totalDesconto)}
                 </p>
               </div>
            </div>
            
          </div>

          {!isLoading && impactoEstoque.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-orange-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
                Composição do Combo & Impacto no Estoque
              </h3>
              
              <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4">
                <ul className="space-y-2">
                  {impactoEstoque.map((ingrediente, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm border-b border-orange-100/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-700 font-medium">
                        <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded text-xs mr-2">{ingrediente.qtdPorCombo}x</span> 
                        {ingrediente.nome} <span className="text-gray-400 font-normal italic text-xs">(por combo)</span>
                      </span>
                      <span className="font-bold text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm">
                        📉 -{ingrediente.totalBaixado} un
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
           <p className="text-gray-400 text-sm italic">Use a lupa acima para pesquisar o produto desejado.</p>
        </div>
      )}
    </div>
  );
}