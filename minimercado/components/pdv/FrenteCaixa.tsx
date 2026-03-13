'use client';
import React, { useState, useMemo } from 'react';

// Tipagens baseadas no DER
interface Produto {
  product_id: number;
  name: string;
  category: string; // Isso virá de um JOIN com a tabela Category
  price: number;
  image: string; // A URL da imagem no Supabase Storage
}

interface Equipe {
  team_id: number;
  name: string;
}

interface Membro {
  member_id: number;
  team_id: number;
  name: string;
}

export default function FrenteCaixa() {
  // =========================================================================
  // ESTADOS (Prontos para receber dados do Supabase)
  // =========================================================================
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Todos']); // 'Todos' é padrão do frontend

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMember, setSelectedMember] = useState('');


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [cart, setCart] = useState<{ product: Produto; quantity: number }[]>([]);

  // =========================================================================
  // LÓGICA DE FILTRAGEM
  // =========================================================================
  const membrosFiltrados = useMemo(() => {
    if (!selectedTeam) return [];
    return membros.filter(m => m.team_id.toString() === selectedTeam);
  }, [selectedTeam, membros]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory, produtos]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  // =========================================================================
  // FUNÇÕES DO CARRINHO
  // =========================================================================
  const addToCart = (produto: Produto) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.product_id === produto.product_id);
      if (existing) {
        return prev.map(item => 
          item.product.product_id === produto.product_id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product: produto, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.product_id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.product_id !== productId));
  };

  const handleFinalizarVenda = (statusVenda: 'PAGO' | 'PENDENTE') => {
    if (cart.length === 0) {
      alert("O carrinho está vazio!");
      return;
    }
    if (!selectedMember) {
      alert("Selecione um cliente (Equipe e Integrante) para registrar a venda!");
      return;
    }

    // TODO: Supabase INSERT na tabela Sale e Item_Sale
    const payloadVenda = {
      user_id: 1, // ID do operador logado
      member_id: Number(selectedMember),
      date: new Date().toISOString(),
      total_value: cartTotal,
      status: statusVenda === 'PAGO' ? 1 : 2,
      items: cart.map(item => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.product.price
      }))
    };

    console.log("🛒 Venda pronta para o Supabase:", payloadVenda);
    alert(`Venda registrada como ${statusVenda} com sucesso!`);
    

    setCart([]);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LADO ESQUERDO */}
      <div className="flex-1 space-y-6">
        
        {/* SELEÇÃO DE CLIENTE */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleção de Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={selectedTeam} 
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setSelectedMember('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]"
            >
              <option value="" disabled>{equipes.length === 0 ? 'Carregando equipes...' : 'Selecione a Equipe...'}</option>
              {equipes.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
            </select>

            <select 
              value={selectedMember} 
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={!selectedTeam || membrosFiltrados.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488] disabled:bg-gray-100"
            >
              <option value="" disabled>Selecione o Integrante...</option>
              {membrosFiltrados.map(m => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* PRODUTOS */}
        <div>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar Produto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
              />
            </div>

            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-end">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                    ${selectedCategory === cat 
                      ? 'bg-[#0D9488] text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ESTADO VAZIO DE PRODUTOS */}
          {produtosFiltrados.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200 border-dashed">
              Nenhum produto encontrado. Cadastre itens no estoque para começar a vender.
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {produtosFiltrados.map(produto => (
              <div 
                key={produto.product_id} 
                className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-colors"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {produto.image ? (
                    <img src={produto.image} alt={produto.name} className="w-full h-full object-cover transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem foto</div>
                  )}
                </div>
                
                <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">{produto.name}</h3>
                
                <span className="text-base font-bold text-[#0D9488] mb-3">
                  {formatCurrency(produto.price)}
                </span>
                
                <button 
                  onClick={() => addToCart(produto)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded-md text-sm transition-colors mt-auto"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* LADO DIREITO: CARRINHO */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sticky top-24">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
          


          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Nenhum produto adicionado.</p>
            ) : (
              cart.map(item => (
                <div key={item.product.product_id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                       <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-gray-300 rounded text-sm">
                        <button onClick={() => updateQuantity(item.product.product_id, -1)} className="px-2 py-0.5 hover:bg-gray-100">-</button>
                        <span className="px-2 font-medium border-x border-gray-300">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.product_id, 1)} className="px-2 py-0.5 hover:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    <button onClick={() => removeFromCart(item.product.product_id)} className="text-white bg-red-600 hover:bg-red-700 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>



          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2 text-gray-600">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-sm">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-lg font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleFinalizarVenda('PAGO')}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-md text-sm transition-colors shadow-md"
              >
                [ PAGO ] {formatCurrency(cartTotal)}
              </button>
              
              <button 
                onClick={() => handleFinalizarVenda('PENDENTE')}
                className="w-full bg-[#B89822] hover:bg-[#9B7F1B] text-white font-bold py-3.5 rounded-md text-sm transition-colors shadow-md"
              >
                [ PENDENTE / FIADO ]
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}