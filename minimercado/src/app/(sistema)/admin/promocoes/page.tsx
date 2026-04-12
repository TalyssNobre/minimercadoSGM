'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { getAllProducts } from '@/src/Server/controllers/ProductController';

export default function PromocoesPage() {
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dados fictícios (Troque pela API quando sua amiga terminar)
  const [ofertasAtivas, setOfertasAtivas] = useState<any[]>([
    { id: 1, produto_id: 10, name: 'Coca-cola 310ml', preco_original: 5.00, preco_promo: 4.00 }
  ]);
  
  // 🟢 Adicionado o "rawItens" para podermos reconstruir a tabela ao editar
  const [combosCadastrados, setCombosCadastrados] = useState<any[]>([
    { 
      id: 1, 
      name: 'Combo Café da manhã', 
      itens: '1x Café expresso, 1x Pão de queijo', 
      rawItens: [
        { produto_id: 991, nome: 'Café expresso', preco_unitario: 3.00, quantidade: 1, subtotal: 3.00 },
        { produto_id: 992, nome: 'Pão de queijo', preco_unitario: 3.00, quantidade: 1, subtotal: 3.00 }
      ],
      preco_original: 6.00, 
      preco_final: 5.00 
    }
  ]);

  const [isModalOfertaOpen, setIsModalOfertaOpen] = useState(false);
  const [isModalComboOpen, setIsModalComboOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // Estados dos formulários
  const [nomeCombo, setNomeCombo] = useState('');
  const [precoCombo, setPrecoCombo] = useState<number | string>('');
  const [itensDoCombo, setItensDoCombo] = useState<any[]>([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState<number>(1);

  const [ofertaProdutoId, setOfertaProdutoId] = useState<string>('');
  const [ofertaPreco, setOfertaPreco] = useState<number | string>('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    setIsLoading(true);
    try {
      const resp = await getAllProducts() as any;
      if (resp?.success) {
        const data = resp.data || resp.product || resp;
        setProdutosDisponiveis(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================================================
  // 🟢 CÁLCULOS DO DASHBOARD (Mini Resumo Ajustado)
  // =========================================================================
  const stats = useMemo(() => {
    return { 
      totalOfertas: ofertasAtivas.length, 
      totalCombos: combosCadastrados.length 
    };
  }, [ofertasAtivas, combosCadastrados]);

  const fecharModais = () => {
    setIsModalOfertaOpen(false);
    setIsModalComboOpen(false);
    setIdEditando(null);
    setNomeCombo('');
    setPrecoCombo('');
    setItensDoCombo([]);
    setOfertaProdutoId('');
    setOfertaPreco('');
  };

  const handleAdicionarProdutoNoCombo = () => {
    const produtoEncontrado = produtosDisponiveis.find(p => p.id === Number(produtoSelecionadoId));
    if (produtoEncontrado) {
      setItensDoCombo([...itensDoCombo, {
        produto_id: produtoEncontrado.id,
        nome: produtoEncontrado.name,
        preco_unitario: Number(produtoEncontrado.price),
        quantidade: quantidadeSelecionada,
        subtotal: Number(produtoEncontrado.price) * quantidadeSelecionada
      }]);
      setProdutoSelecionadoId('');
      setQuantidadeSelecionada(1);
    }
  };

  // 🟢 FUNÇÃO PARA ABRIR EDIÇÃO
  const handleEditarCombo = (combo: any) => {
    setIdEditando(combo.id);
    setNomeCombo(combo.name);
    setPrecoCombo(combo.preco_final);
    setItensDoCombo(combo.rawItens || []);
    setIsModalComboOpen(true);
  };

  const valorTotalOriginal = itensDoCombo.reduce((acc, item) => acc + item.subtotal, 0);
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 transition-all";

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Promoções</h1>
          <p className="text-sm text-gray-500">Crie ofertas relâmpago e combos de produtos.</p>
        </div>
        <div className="flex gap-3">
          <ButtonSistema variant="primary" className="bg-[#0D9488] border-none shadow-sm" onClick={() => setIsModalOfertaOpen(true)}>
            + Nova Oferta
          </ButtonSistema>
          <ButtonSistema variant="primary" className="bg-[#1e293b] border-none shadow-sm" onClick={() => setIsModalComboOpen(true)}>
            + Novo Combo
          </ButtonSistema>
        </div>
      </div>

      {/* 🟢 MINI DASHBOARD (Ajustado para 2 colunas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ofertas Relâmpago</span>
          <div className="text-2xl font-black text-[#0D9488]">{stats.totalOfertas}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Combos Ativos</span>
          <div className="text-2xl font-black text-gray-800">{stats.totalCombos}</div>
        </div>
      </div>

      {/* SEÇÃO 1: OFERTAS RELÂMPAGO */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Ofertas Relâmpago Ativas
        </h2>
        
        {ofertasAtivas.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-400 font-medium">Nenhuma oferta ativa no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ofertasAtivas.map(oferta => {
              const porcentagem = (((oferta.preco_original - oferta.preco_promo) / oferta.preco_original) * 100).toFixed(0);
              return (
                <div key={oferta.id} className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {/* Badge de % */}
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                    {porcentagem}% OFF
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-center mb-1">{oferta.name}</h3>
                  <div className="flex flex-col items-center mb-4">
                    <span className="text-gray-400 line-through text-xs italic">De: R$ {oferta.preco_original.toFixed(2)}</span>
                    <span className="text-2xl font-black text-[#0D9488]">R$ {oferta.preco_promo.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => setOfertasAtivas(prev => prev.filter(o => o.id !== oferta.id))} 
                    className="w-full bg-gray-50 text-gray-400 py-2 rounded-lg font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                  >
                    DESATIVAR
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: COMBOS & KITS */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Combos & Kits Registrados</h2>
        {combosCadastrados.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-400 font-medium">Você ainda não criou nenhum combo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest">
                  <th className="p-4 font-black">Nome do Combo</th>
                  <th className="p-4 font-black">Produtos</th>
                  <th className="p-4 font-black">Preço Normal</th>
                  <th className="p-4 font-black">Preço Combo</th>
                  <th className="p-4 font-black text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {combosCadastrados.map(combo => (
                  <tr key={combo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{combo.name}</td>
                    <td className="p-4 text-gray-500 text-xs italic">{combo.itens}</td>
                    <td className="p-4 text-gray-400 line-through text-sm">R$ {combo.preco_original.toFixed(2)}</td>
                    <td className="p-4 font-black text-[#0D9488] text-lg">R$ {combo.preco_final.toFixed(2)}</td>
                    <td className="p-4 flex justify-center gap-4">
                      {/* 🟢 BOTÃO EDITAR AGORA CHAMA A FUNÇÃO */}
                      <button onClick={() => handleEditarCombo(combo)} className="text-gray-400 hover:text-teal-600 transition-colors" title="Editar">✏️</button>
                      <button onClick={() => setCombosCadastrados(prev => prev.filter(c => c.id !== combo.id))} className="text-gray-400 hover:text-red-500 transition-colors" title="Excluir">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🟢 MODAL: CRIAR OU EDITAR COMBO */}
      {isModalComboOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">{idEditando ? 'Editar Combo' : 'Configurar Novo Combo'}</h2>
              <button onClick={fecharModais} className="hover:rotate-90 transition-transform">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nome do Combo</label>
                  <input type="text" value={nomeCombo} onChange={(e) => setNomeCombo(e.target.value)} className={inputClasses} placeholder="Ex: Kit Churrasco" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Preço Final de Venda</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input type="number" value={precoCombo} onChange={(e) => setPrecoCombo(e.target.value)} className={`${inputClasses} pl-10 font-bold text-[#0D9488]`} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-xs font-black text-gray-400 uppercase">Montar Composição</label>
                <div className="flex gap-2">
                  <select value={produtoSelecionadoId} onChange={(e) => setProdutoSelecionadoId(e.target.value)} className={`${inputClasses} flex-grow bg-white`}>
                    <option value="">Selecione um produto...</option>
                    {produtosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name} (R${p.price})</option>)}
                  </select>
                  <input type="number" value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))} className={`${inputClasses} w-20 text-center bg-white`} />
                  <button onClick={handleAdicionarProdutoNoCombo} className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-black transition-colors">ADD</button>
                </div>
              </div>

              {/* TABELA DE ITENS NO MODAL */}
              <div className="max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-4">Item</th>
                      <th className="py-2 px-4 text-center">Qtd</th>
                      <th className="py-2 px-4 text-right">Subtotal</th>
                      <th className="py-2 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensDoCombo.map((it, idx) => (
                      <tr key={idx} className="border-t border-gray-50">
                        <td className="py-2 px-4 font-medium">{it.nome}</td>
                        <td className="py-2 px-4 text-center">{it.quantidade}x</td>
                        <td className="py-2 px-4 text-right">R$ {it.subtotal.toFixed(2)}</td>
                        <td className="py-2 px-4 text-center">
                          <button onClick={() => setItensDoCombo(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer de Cálculos no Modal */}
              <div className="space-y-1 pt-2 border-t border-dashed">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Soma dos produtos individuais:</span>
                  <span className="line-through font-bold">R$ {valorTotalOriginal.toFixed(2)}</span>
                </div>
                {precoCombo && Number(precoCombo) < valorTotalOriginal ? (
                  <div className="flex justify-between text-sm text-[#059669] font-bold">
                    <span>Desconto do Combo:</span>
                    <span>- R$ {(valorTotalOriginal - Number(precoCombo)).toFixed(2)}</span>
                  </div>
                ) : precoCombo && Number(precoCombo) > valorTotalOriginal ? (
                   <div className="bg-amber-50 text-amber-700 p-2 rounded text-[10px] font-bold text-center italic">
                     ⚠️ Atenção: O preço do combo está acima do valor dos itens somados.
                   </div>
                ) : null}
              </div>
            </div>

            {/* 🟢 AÇÕES DE SALVAR (CRIAÇÃO OU ATUALIZAÇÃO) */}
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <button onClick={fecharModais} className="px-4 py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600">Cancelar</button>
              <button onClick={() => {
                if(!nomeCombo || !precoCombo) return alert("Preencha o nome e o preço do combo!");
                
                const comboFormatado = { 
                  id: idEditando || Date.now(), 
                  name: nomeCombo, 
                  itens: itensDoCombo.map(i => `${i.quantidade}x ${i.nome}`).join(', '), // Formatação mais bonita
                  rawItens: itensDoCombo, // Guarda a base para futuras edições
                  preco_original: valorTotalOriginal, 
                  preco_final: Number(precoCombo) 
                };

                if (idEditando) {
                  // Atualiza o existente
                  setCombosCadastrados(prev => prev.map(c => c.id === idEditando ? comboFormatado : c));
                } else {
                  // Cria um novo
                  setCombosCadastrados(prev => [...prev, comboFormatado]);
                }
                
                fecharModais();
              }} className="px-6 py-2 bg-[#0D9488] text-white font-bold uppercase text-[10px] tracking-widest rounded-lg shadow-md hover:bg-teal-700 transition-all">
                {idEditando ? 'SALVAR ALTERAÇÕES' : 'SALVAR COMBO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA OFERTA */}
      {isModalOfertaOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 text-left">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Criar Oferta Relâmpago</h2>
              <button onClick={fecharModais}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Selecione o Produto</label>
                <select value={ofertaProdutoId} onChange={(e) => setOfertaProdutoId(e.target.value)} className={inputClasses}>
                  <option value="">Escolha um produto do estoque...</option>
                  {produtosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Novo Preço Promocional</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                   <input type="number" placeholder="0.00" value={ofertaPreco} onChange={(e) => setOfertaPreco(e.target.value)} className={`${inputClasses} pl-10 font-bold text-orange-500`} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <ButtonSistema variant="outline" onClick={fecharModais}>Cancelar</ButtonSistema>
              <ButtonSistema variant="primary" className="bg-[#0D9488] shadow-md" onClick={() => {
                const prod = produtosDisponiveis.find(p => p.id === Number(ofertaProdutoId));
                if(!prod || !ofertaPreco) return alert("Selecione um produto e um preço!");
                setOfertasAtivas(prev => [...prev, { id: Date.now(), name: prod.name, preco_original: Number(prod.price), preco_promo: Number(ofertaPreco) }]);
                fecharModais();
              }}>ATIVAR OFERTA AGORA</ButtonSistema>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}