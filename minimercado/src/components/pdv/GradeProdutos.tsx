import React, { useState, useMemo } from 'react';
import { Produto } from './types';

interface GradeProdutosProps {
  produtos: Produto[];
  categorias: string[];
  isLoading: boolean;
  onAddToCart: (produto: Produto) => void;
}

export default function GradeProdutos({ produtos, categorias, isLoading, onAddToCart }: GradeProdutosProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory, produtos]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <input 
            type="text" placeholder="Buscar Produto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-end">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat ? 'bg-[#0D9488] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse font-medium">Carregando estoque...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {produtosFiltrados.map(produto => (
            <div key={produto.id} className={`bg-white p-3 rounded-xl shadow-sm border flex flex-col items-center text-center transition-all hover:shadow-md relative ${produto.promo_status ? 'border-orange-300' : 'border-gray-100'}`}>
              
              {/* 🟢 Etiqueta de Promoção */}
              {produto.promo_status && (
                <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md z-20 animate-pulse">
                  OFERTA
                </div>
              )}

              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden relative">
                <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold z-10 shadow-sm ${produto.stock <= 0 ? 'bg-red-500 text-white' : 'bg-black/60 text-white'}`}>
                  {produto.stock} un
                </span>
                {produto.image ? (
                  <img src={produto.image} alt={produto.name} className={`w-full h-full object-cover ${produto.stock <= 0 ? 'grayscale opacity-50' : ''}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold">Sem imagem</div>
                )}
              </div>
              <h3 className="text-xs font-bold text-gray-700 mb-1 line-clamp-2 min-h-[2.5rem] leading-tight">{produto.name}</h3>
              
              {/* 🟢 Preço Riscado se estiver em promo */}
              <div className="min-h-[2.5rem] flex flex-col justify-center items-center mb-2">
                {produto.promo_status && produto.base_price ? (
                  <>
                    <span className="text-[10px] text-gray-400 line-through">De: {formatCurrency(produto.base_price)}</span>
                    <span className="text-sm font-black text-orange-500">Por: {formatCurrency(produto.price)}</span>
                  </>
                ) : (
                  <span className="text-sm font-black text-[#0D9488]">{formatCurrency(produto.price)}</span>
                )}
              </div>

              <button disabled={produto.stock <= 0} onClick={() => onAddToCart(produto)} className={`w-full font-bold py-2 rounded-lg text-xs transition-colors mt-auto active:scale-95 ${produto.stock > 0 ? (produto.promo_status ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-[#0D9488] hover:bg-[#0f766e] text-white') : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                {produto.stock > 0 ? 'Adicionar' : 'Esgotado'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}