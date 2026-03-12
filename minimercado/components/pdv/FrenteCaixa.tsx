'use client';
import React, { useState, useMemo } from 'react';
import { ButtonSistema } from '@/components/ui/ButtonSistema';

// =========================================================================
// MOCKS (Dados Fictícios baseados no DER)
// =========================================================================
const EQUIPES_MOCK = [
  { team_id: 1, name: 'Comando' },
  { team_id: 2, name: 'Limpeza' }
];

const MEMBROS_MOCK = [
  { member_id: 1, team_id: 1, name: 'Sávio e Nana' },
  { member_id: 2, team_id: 1, name: 'Tio João' },
  { member_id: 3, team_id: 2, name: 'Maria' }
];

const CATEGORIAS_MOCK = ['Todos', 'Bigas', 'Livraria', 'Geral'];

const PRODUTOS_MOCK = [
  { product_id: 1, name: 'Bolo de Pote', category: 'Bigas', price: 8.00, image: 'https://via.placeholder.com/150' },
  { product_id: 2, name: 'Refri', category: 'Geral', price: 5.00, image: 'https://via.placeholder.com/150' },
  { product_id: 3, name: 'Livraria', category: 'Livraria', price: 25.00, image: 'https://via.placeholder.com/150' },
  { product_id: 4, name: 'Salgado', category: 'Geral', price: 7.00, image: 'https://via.placeholder.com/150' },
];

export default function FrenteCaixa() {
  // =========================================================================
  // ESTADOS (STATE)
  // =========================================================================
  // Seleção de Cliente
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  // Filtros de Produto
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Carrinho de Compras
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);

  // =========================================================================
  // LÓGICA DE FILTRAGEM (useMemo para performance)
  // =========================================================================
  const membrosFiltrados = useMemo(() => {
    if (!selectedTeam) return [];
    return MEMBROS_MOCK.filter(m => m.team_id.toString() === selectedTeam);
  }, [selectedTeam]);

  const produtosFiltrados = useMemo(() => {
    return PRODUTOS_MOCK.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  // =========================================================================
  // FUNÇÕES DO CARRINHO
  // =========================================================================
  const addToCart = (produto: any) => {
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

    // Estrutura exata exigida pelo DER para a tabela Sale e Item_Sale
    const payloadVenda = {
      user_id: 1, // Exemplo: ID do operador de caixa logado
      member_id: Number(selectedMember),
      date: new Date().toISOString(),
      total_value: cartTotal,
      status: statusVenda === 'PAGO' ? 1 : 2, // 1 = Pago, 2 = Fiado
      items: cart.map(item => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.product.price
      }))
    };

    console.log("🛒 Venda pronta para o Supabase:", payloadVenda);
    alert(`Venda registrada como ${statusVenda} com sucesso!`);
    
    // Limpa o carrinho
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LADO ESQUERDO: SELEÇÃO E PRODUTOS (Ocupa 2/3 da tela no PC) */}
      <div className="flex-1 space-y-6">
        
        {/* SELEÇÃO DE CLIENTE */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleção de Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={selectedTeam} 
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setSelectedMember(''); // Reseta o membro ao trocar a equipe
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]"
            >
              <option value="" disabled>Selecione a Equipe...</option>
              {EQUIPES_MOCK.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
            </select>

            <select 
              value={selectedMember} 
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={!selectedTeam}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488] disabled:bg-gray-100"
            >
              <option value="" disabled>Selecione o Integrante...</option>
              {membrosFiltrados.map(m => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* PRODUTOS DISPONÍVEIS E FILTROS */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Produtos Disponíveis</h2>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Busca..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
              />
            </div>
          </div>

          {/* Pílulas de Categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {CATEGORIAS_MOCK.map(cat => (
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

          {/* Grid de Produtos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {produtosFiltrados.map(produto => (
              <div key={produto.product_id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-[#0D9488] transition-colors">
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img src={produto.image} alt={produto.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2 min-h-[2.5rem]">{produto.name}</h3>
                
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

      {/* LADO DIREITO: CARRINHO (Ocupa 1/3 da tela no PC e fica Sticky) */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sticky top-24">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
          
          {/* Lista de Itens */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Nenhum produto adicionado.</p>
            ) : (
              cart.map(item => (
                <div key={item.product.product_id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Controles de Quantidade */}
                      <div className="flex items-center border border-gray-300 rounded text-sm">
                        <button onClick={() => updateQuantity(item.product.product_id, -1)} className="px-2 py-0.5 hover:bg-gray-100">-</button>
                        <span className="px-2 font-medium border-x border-gray-300">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.product_id, 1)} className="px-2 py-0.5 hover:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price * item.quantity)}
                    </span>
                    <button onClick={() => removeFromCart(item.product.product_id)} className="text-white bg-red-600 hover:bg-red-700 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumo e Botões de Pagamento */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2 text-gray-600">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-lg font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleFinalizarVenda('PAGO')}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-md text-sm transition-colors shadow-md"
              >
                [ PAGO ] {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
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