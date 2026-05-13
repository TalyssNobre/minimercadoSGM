import React, { useState, useMemo, useEffect } from 'react';
import { Produto } from './types';
import { InputPesquisa } from '@/src/components/ui/InputPesquisa'; 
// 🟢 IMPORTAMOS O SEU NOVO COMPONENTE SKELETON
import { SkeletonProduto } from '@/src/components/ui/SkeletonProduto'; 

interface GradeProdutosProps {
  produtos: Produto[];
  categorias: string[];
  isLoading: boolean;
  onAddToCart: (produto: Produto) => void;
}

export default function GradeProdutos({ produtos, categorias, isLoading, onAddToCart }: GradeProdutosProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [addedItemId, setAddedItemId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  const produtosFiltrados = useMemo(() => {
    const listaFiltrada = produtos.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    return listaFiltrada.sort((a, b) => {
      return a.name.localeCompare(b.name, 'pt-BR'); 
    });
  }, [debouncedSearchQuery, selectedCategory, produtos]);

  const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const produtosPaginados = produtosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getCardStyle = (produto: Produto) => {
    if (produto.promo_status) return 'border-orange-300 hover:border-orange-500 shadow-orange-100/50';
    if (produto.isCombo) return 'border-purple-300 hover:border-purple-500 shadow-purple-100/50';
    return 'border-gray-100 hover:border-[#0D9488]/50 shadow-sm';
  };

  const getButtonStyle = (produto: Produto) => {
    if (produto.stock <= 0) return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    if (produto.promo_status) return 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/30';
    if (produto.isCombo) return 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-500/30';
    return 'bg-[#0D9488] hover:bg-[#0f766e] text-white hover:shadow-teal-500/30';
  };

  const handleAddToCartClick = (produto: Produto) => {
    onAddToCart(produto);
    if (produto.stock > 0) {
      setAddedItemId(produto.id);
      setTimeout(() => setAddedItemId(null), 800); 
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <InputPesquisa 
          placeholder="Buscar Produto..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full md:w-64 flex-shrink-0"
        />

        <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${selectedCategory === cat ? 'bg-[#0D9488] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 AQUI ACONTECE A MÁGICA DA TROCA */}
      {isLoading ? (
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start"
          style={{ minHeight: '850px', overflowAnchor: 'none' }}
        >
          {/* Cria 15 esqueletos para preencher a tela enquanto carrega */}
          {[...Array(15)].map((_, index) => (
            <SkeletonProduto key={index} />
          ))}
        </div>
      ) : (
        <>
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start"
            style={{ minHeight: '850px', overflowAnchor: 'none' }}
          >
            {produtosPaginados.map(produto => {
              const isAdded = addedItemId === produto.id; 
              
              return (
                <div 
                  key={produto.id} 
                  className={`group bg-white p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl relative ${getCardStyle(produto)}`}
                >
                  
                  {produto.promo_status && (
                    <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-md z-20 animate-pulse">
                      OFERTA
                    </div>
                  )}

                  {produto.isCombo && (
                    <div className={`absolute -top-2 ${produto.promo_status ? 'left-16' : '-left-2'} bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md z-20`}>
                      COMBO
                    </div>
                  )}

                  <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden relative">
                    <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold z-10 shadow-sm transition-colors ${produto.stock <= 0 ? 'bg-red-500 text-white' : 'bg-black/60 text-white'}`}>
                      {produto.stock} un
                    </span>
                    {produto.image ? (
                      <img 
                        src={produto.image} 
                        alt={produto.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${produto.stock <= 0 ? 'grayscale opacity-50' : ''}`} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold transition-transform duration-500 group-hover:scale-110">Sem imagem</div>
                    )}
                  </div>
                  
                  <h3 className="text-xs font-bold text-gray-700 mb-1 line-clamp-2 min-h-[2.5rem] leading-tight transition-colors group-hover:text-black">{produto.name}</h3>
                  
                  {produto.isCombo && produto.combo_description && (
                    <p className="text-[9px] text-gray-400 italic mb-2 line-clamp-2 min-h-[1.5rem]" title={produto.combo_description}>
                      {produto.combo_description}
                    </p>
                  )}
                  
                  <div className="min-h-[2.5rem] flex flex-col justify-center items-center mb-2 w-full mt-auto">
                    {produto.promo_status && produto.base_price ? (
                      <>
                        <span className="text-[10px] text-gray-400 line-through">De: {formatCurrency(produto.base_price)}</span>
                        <span className="text-sm font-black text-orange-500 group-hover:scale-105 transition-transform">Por: {formatCurrency(produto.price)}</span>
                      </>
                    ) : (
                      <span className={`text-sm font-black group-hover:scale-105 transition-transform ${produto.isCombo ? 'text-purple-700' : 'text-[#0D9488]'}`}>
                        {formatCurrency(produto.price)}
                      </span>
                    )}
                  </div>

                  <button 
                    disabled={produto.stock <= 0} 
                    onClick={() => handleAddToCartClick(produto)} 
                    className={`w-full font-bold py-2 rounded-lg text-xs transition-all duration-300 active:scale-95 shadow-sm ${
                      isAdded 
                        ? 'bg-green-500 text-white scale-105 shadow-green-500/40' 
                        : getButtonStyle(produto)
                    }`}
                  >
                    {isAdded ? '✔ Adicionado' : (produto.stock > 0 ? 'Adicionar' : 'Esgotado')}
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4 bg-white py-2 px-6 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.currentTarget.blur(); 
                  setCurrentPage(p => Math.max(1, p - 1));
                }}
                disabled={currentPage === 1}
                className="p-2 rounded-full text-[#0D9488] hover:bg-teal-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              
              <span className="text-sm font-bold text-gray-700">
                Página {currentPage} de {totalPages}
              </span>

              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.currentTarget.blur(); 
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full text-[#0D9488] hover:bg-teal-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}