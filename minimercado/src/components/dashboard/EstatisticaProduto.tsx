import React, { useState, useEffect, useMemo } from 'react';
import { Product } from './types';
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" /></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Unidades</p>
               <p className="text-2xl font-black text-blue-900">{isLoading ? "..." : `${stats.quantidadeSold} un`}</p>
             </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0" /></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Faturamento Líquido</p>
               <p className="text-2xl font-black text-emerald-900">{isLoading ? "..." : formatCurrency(stats.totalArrecadado)}</p>
             </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-5 rounded-xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l7.181-7.181a1.125 1.125 0 000-1.591l-9.581-9.581c-.422-.422-.994-.659-1.591-.659zM6 7.125a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Desconto Aplicado</p>
               <p className="text-2xl font-black text-rose-900">{isLoading ? "..." : formatCurrency(stats.totalDesconto)}</p>
             </div>
          </div>
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