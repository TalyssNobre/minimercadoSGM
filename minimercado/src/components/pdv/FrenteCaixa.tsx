'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';

// 1. IMPORTANDO SEUS CONTROLLERS
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';
import { getAllCategory } from '@/src/Server/controllers/CategoryController';
import { getAllProducts } from '@/src/Server/controllers/ProductController';
import { createSale } from '@/src/Server/controllers/SaleController';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';

// Tipagens
interface Produto {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string | null; 
}

interface Equipe {
  id: number;
  name: string;
}

interface Membro {
  id: number;
  team_id: number;
  name: string;
}

export default function FrenteCaixa() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Todos']); 

  const [selectedTeam, setSelectedTeam] = useState<Equipe | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);

  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [cart, setCart] = useState<{ product: Produto; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizando, setIsFinalizando] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDados() {
      setIsLoading(true);
      try {
        const [teamsResp, membersResp, categoriesResp, productsResp] = await Promise.all([
          getAllTeams() as any,
          getAllMember() as any,
          getAllCategory() as any,
          getAllProducts() as any
        ]);

        const catMap = new Map();
        if (categoriesResp?.success) {
          const listaCat = categoriesResp.data || categoriesResp.category || [];
          setCategorias(['Todos', ...listaCat.map((c: any) => c.name)]);
          listaCat.forEach((c: any) => catMap.set(c.id, c.name));
        }

        if (teamsResp?.success) setEquipes(teamsResp.data || teamsResp.team || []);
        if (membersResp?.success) setMembros(membersResp.data || membersResp.member || []);

        if (productsResp?.success) {
          const listaProdutos = productsResp.data || productsResp.product || [];
          setProdutos(listaProdutos.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: catMap.get(p.category_id) || p.category_name || 'Sem Categoria',
            price: Number(p.price) || 0,
            image: p.image_url || p.image || null
          })));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDados();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (teamRef.current && !teamRef.current.contains(event.target as Node)) setIsTeamDropdownOpen(false);
      if (memberRef.current && !memberRef.current.contains(event.target as Node)) setIsMemberDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const membrosFiltrados = useMemo(() => {
    if (!selectedTeam) return [];
    return membros.filter(m => m.team_id === selectedTeam.id);
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

  const addToCart = (produto: Produto) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === produto.id);
      if (existing) {
        return prev.map(item => item.product.id === produto.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: produto, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => setCart(prev => prev.filter(item => item.product.id !== productId));

  // =========================================================================
  // 🟢 FUNÇÃO DE FINALIZAÇÃO (MOLDADA PARA SEU NOVO BACKEND ENCAPSULADO)
  // =========================================================================
  const handleFinalizarVenda = async (statusVenda: 'PAGO' | 'PENDENTE') => {
    if (cart.length === 0) return alert("O carrinho está vazio!");
    if (!selectedMember) return alert("Selecione um cliente para finalizar!");
    if (isFinalizando) return;

    setIsFinalizando(true);

    try {
      // 1. Validando o Vendedor com trava de segurança real
      const userResp = await getLoggedUserController();
     const vendedorId = (userResp as any)?.user?.id || (userResp as any)?.data?.user?.id;
      
      if (!vendedorId) {
        alert("Sessão expirada ou Vendedor não encontrado. Recarregue a página e tente de novo.");
        setIsFinalizando(false);
        return;
      }

      // 2. Criando o FormData que o Controller vai transformar em Objeto
      const formData = new FormData();
      formData.append('member_id', selectedMember.id.toString());
      formData.append('user_id', vendedorId.toString());
      formData.append('status', statusVenda === 'PAGO' ? 'Pago' : '');
      
      // 🟢 NOVO: O Service não cria mais as datas, então o Front DEVE enviar!
      formData.append('date', new Date().toISOString());
      if (statusVenda === 'PAGO') {
        formData.append('payment_date', new Date().toISOString());
      }

      // 3. Encapsulando o carrinho com a chave unit_price
      const itensCarrinho = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      formData.append('cart', JSON.stringify(itensCarrinho));

      // 4. Chamada da API
      const resposta = await createSale(formData) as any;

      if (resposta.success) {
        alert("✅ Venda realizada com sucesso!");
        setCart([]);
        setSelectedMember(null);
        setSelectedTeam(null);
      } else {
        alert("❌ Erro ao salvar: " + (resposta.message || resposta.error));
      }
    } catch (error: any) {
      alert("Erro Crítico: " + error.message);
    } finally {
      setIsFinalizando(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LADO ESQUERDO: SELEÇÃO E PRODUTOS */}
      <div className="flex-1 space-y-6">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleção de Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="relative" ref={teamRef}>
              <button 
                type="button"
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#0D9488]"
              >
                <span className="truncate">{selectedTeam ? selectedTeam.name : 'Selecione a Equipe...'}</span>
                <svg className={`w-4 h-4 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isTeamDropdownOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {equipes.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => { setSelectedTeam(t); setSelectedMember(null); setIsTeamDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-[#0D9488] hover:text-white cursor-pointer text-sm"
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={memberRef}>
              <button 
                type="button"
                disabled={!selectedTeam}
                onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#0D9488] disabled:bg-gray-50 disabled:text-gray-400"
              >
                <span className="truncate">{selectedMember ? selectedMember.name : 'Selecione o Integrante...'}</span>
                <svg className={`w-4 h-4 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isMemberDropdownOpen && selectedTeam && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {membrosFiltrados.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">Nenhum integrante encontrado.</div>
                  ) : (
                    membrosFiltrados.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => { setSelectedMember(m); setIsMemberDropdownOpen(false); }}
                        className="px-3 py-2 hover:bg-[#0D9488] hover:text-white cursor-pointer text-sm"
                      >
                        {m.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <input 
                type="text" placeholder="Buscar Produto..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-end">
              {categorias.map(cat => (
                <button
                  key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                    ${selectedCategory === cat ? 'bg-[#0D9488] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}
                  `}
                >
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
                <div key={produto.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-[#0D9488]/30">
                  <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    {produto.image ? (
                      <img src={produto.image} alt={produto.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold">Sem imagem</div>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-gray-700 mb-1 line-clamp-2 min-h-[2.5rem] leading-tight">{produto.name}</h3>
                  <span className="text-sm font-black text-[#0D9488] mb-3">{formatCurrency(produto.price)}</span>
                  <button 
                    onClick={() => addToCart(produto)}
                    className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold py-2 rounded-lg text-xs transition-colors mt-auto active:scale-95"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LADO DIREITO: CARRINHO */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sticky top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 mb-6 scrollbar-thin">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10 font-medium">O carrinho está vazio.</p>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-gray-200 rounded text-[10px]">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                        <span className="px-2 font-bold border-x border-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-800">{formatCurrency(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold text-gray-800">Total</span>
              <span className="text-xl font-black text-[#0D9488]">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="space-y-3">
              <button 
                disabled={isFinalizando}
                onClick={() => handleFinalizarVenda('PAGO')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isFinalizando ? 'PROCESSANDO...' : 'PAGO NO ATO'}
              </button>
              <button 
                disabled={isFinalizando}
                onClick={() => handleFinalizarVenda('PENDENTE')} 
                className="w-full bg-[#B89822] hover:bg-[#9B7F1B] text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isFinalizando ? 'PROCESSANDO...' : 'PENDENTE / FIADO'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}