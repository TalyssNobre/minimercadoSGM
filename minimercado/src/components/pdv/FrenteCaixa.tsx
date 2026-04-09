'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';

// 🟢 1. IMPORTANDO O MODAL DE ALERTA AQUI
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// 2. IMPORTANDO SEUS CONTROLLERS
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

  // 🟢 ESTADOS DO DESCONTO NO CARRINHO
  const [tipoDesconto, setTipoDesconto] = useState<'R$' | '%'>('R$');
  const [valorDescontoInput, setValorDescontoInput] = useState<string>('');

  // 🟢 STATE DO MODAL DE ALERTA
  const [modalAlerta, setModalAlerta] = useState({ 
    isOpen: false, 
    mensagem: '', 
    tipo: 'success' as 'success' | 'error' 
  });

  const teamRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);

  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
    setModalAlerta({ isOpen: true, mensagem, tipo });
  };

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

  // =========================================================================
  // 🟢 CÁLCULOS DO CARRINHO E DESCONTO
  // =========================================================================
  
  // 1. O Subtotal cru dos produtos
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  // 2. Lógica para calcular o valor do desconto em Reais (R$)
  const valorDescontoCalculado = useMemo(() => {
    if (!valorDescontoInput || cartSubtotal === 0) return 0;
    
    // Troca vírgula por ponto para evitar erros de digitação no Brasil
    const valorDigitado = parseFloat(valorDescontoInput.replace(',', '.'));
    if (isNaN(valorDigitado) || valorDigitado < 0) return 0;

    if (tipoDesconto === '%') {
      return (cartSubtotal * valorDigitado) / 100;
    }
    return valorDigitado;
  }, [cartSubtotal, tipoDesconto, valorDescontoInput]);

  // 3. O Total Final com o desconto aplicado (nunca menor que zero)
  const cartTotalFinal = useMemo(() => {
    return Math.max(0, cartSubtotal - valorDescontoCalculado);
  }, [cartSubtotal, valorDescontoCalculado]);

  // =========================================================================
  // FUNÇÕES DO CARRINHO
  // =========================================================================
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
  // FINALIZAR VENDA
  // =========================================================================
  const handleFinalizarVenda = async (statusVenda: 'PAGO' | 'PENDENTE') => {
    if (cart.length === 0) {
      exibirAlerta("O carrinho está vazio! Adicione produtos para continuar.", 'error');
      return;
    }
    
    if (!selectedMember) {
      exibirAlerta("Selecione uma equipe e um cliente para finalizar a venda!", 'error');
      return;
    }
    
    if (isFinalizando) return;

    setIsFinalizando(true);

    try {
      const userResp = await getLoggedUserController();
      const vendedorId = (userResp as any)?.user?.id || (userResp as any)?.data?.user?.id;
      
      if (!vendedorId) {
        exibirAlerta("Sessão expirada ou Vendedor não encontrado. Recarregue a página.", 'error');
        setIsFinalizando(false);
        return;
      }

      const formData = new FormData();
      formData.append('member_id', selectedMember.id.toString());
      formData.append('user_id', vendedorId.toString());
      formData.append('status', statusVenda === 'PAGO' ? 'Pago' : '');
      
      // 🟢 ENVIANDO O DESCONTO MASTIGADO PARA SUA COLEGA DO BACKEND
      formData.append('discount_value', valorDescontoCalculado.toString());
      
      formData.append('date', new Date().toISOString());
      if (statusVenda === 'PAGO') {
        formData.append('payment_date', new Date().toISOString());
      }

      const itensCarrinho = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      formData.append('cart', JSON.stringify(itensCarrinho));

      const resposta = await createSale(formData) as any;

      if (resposta.success) {
        exibirAlerta("Venda realizada com sucesso!", 'success');
        setCart([]);
        setValorDescontoInput(''); // Limpa o desconto após a venda
        setSelectedMember(null);
        setSelectedTeam(null);
      } else {
        exibirAlerta(resposta.message || resposta.error || "Erro ao salvar a venda.", 'error');
      }
    } catch (error: any) {
      exibirAlerta("Erro Crítico de conexão: " + error.message, 'error');
    } finally {
      setIsFinalizando(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      
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

      {/* LADO DIREITO: CARRINHO E DESCONTOS */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sticky top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
          <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 mb-6 scrollbar-thin">
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

          {/* 🟢 PAINEL DE DESCONTO */}
          {cart.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Aplicar Desconto</h3>
              <div className="flex gap-2">
                <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
                  <button 
                    onClick={() => { setTipoDesconto('R$'); setValorDescontoInput(''); }}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${tipoDesconto === 'R$' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    R$
                  </button>
                  <button 
                    onClick={() => { setTipoDesconto('%'); setValorDescontoInput(''); }}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${tipoDesconto === '%' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    %
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="Valor..."
                  value={valorDescontoInput}
                  onChange={(e) => setValorDescontoInput(e.target.value.replace(/[^0-9.,]/g, ''))} // Aceita só números, ponto e vírgula
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
            </div>
          )}

          {/* 🟢 RESUMO DE CÁLCULOS */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-800 font-semibold">{formatCurrency(cartSubtotal)}</span>
            </div>
            
            {valorDescontoCalculado > 0 && (
              <div className="flex justify-between items-center mb-3 text-sm text-[#059669]">
                <span className="font-bold">Desconto ({tipoDesconto === '%' ? `${valorDescontoInput}%` : 'R$'})</span>
                <span className="font-bold">- {formatCurrency(valorDescontoCalculado)}</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 pt-3 border-t border-dashed border-gray-200">
              <span className="text-base font-bold text-gray-800">Total Final</span>
              <span className="text-2xl font-black text-[#0D9488]">{formatCurrency(cartTotalFinal)}</span>
            </div>

            <div className="space-y-3">
              <button 
                disabled={isFinalizando || cart.length === 0}
                onClick={() => handleFinalizarVenda('PAGO')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isFinalizando ? 'PROCESSANDO...' : 'PAGO NO ATO'}
              </button>
              <button 
                disabled={isFinalizando || cart.length === 0}
                onClick={() => handleFinalizarVenda('PENDENTE')} 
                className="w-full bg-[#B89822] hover:bg-[#9B7F1B] text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isFinalizando ? 'PROCESSANDO...' : 'PENDENTE / FIADO'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ALERTA RENDERIZADO AQUI NO FINAL */}
      <ModalAlerta 
        isOpen={modalAlerta.isOpen}
        mensagem={modalAlerta.mensagem}
        tipo={modalAlerta.tipo}
        onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
      />

    </div>
  );
}