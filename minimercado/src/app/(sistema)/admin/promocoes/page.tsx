'use client';

import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { getAllProducts } from '@/src/Server/controllers/ProductController';

export default function PromocoesPage() {
  // =========================================================================
  // 1. ESTADOS DE DADOS (Dados fictícios para teste de layout)
  // =========================================================================
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([]);
  
  const [ofertasAtivas, setOfertasAtivas] = useState<any[]>([
    { id: 1, produto_id: 10, name: 'Coca-cola 310ml', preco_original: 5.00, preco_promo: 4.00 }
  ]);
  const [combosCadastrados, setCombosCadastrados] = useState<any[]>([
    { id: 1, name: 'Combo Café da manhã', itens: 'Café expresso, Pão de queijo', preco_original: 6.00, preco_final: 5.00 }
  ]);

  const [isModalOfertaOpen, setIsModalOfertaOpen] = useState(false);
  const [isModalComboOpen, setIsModalComboOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // ESTADOS DOS FORMULÁRIOS
  const [nomeCombo, setNomeCombo] = useState('');
  const [precoCombo, setPrecoCombo] = useState<number | string>('');
  const [itensDoCombo, setItensDoCombo] = useState<any[]>([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState<number>(1);

  const [ofertaProdutoId, setOfertaProdutoId] = useState<string>('');
  const [ofertaPreco, setOfertaPreco] = useState<number | string>('');

  // =========================================================================
  // 2. CARREGAR PRODUTOS (Back-end)
  // =========================================================================
  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const resp = await getAllProducts() as any;
      if (resp?.success) {
        const data = resp.data || resp.product || resp;
        setProdutosDisponiveis(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  // =========================================================================
  // 3. AUXILIARES
  // =========================================================================
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

  const valorTotalOriginal = itensDoCombo.reduce((acc, item) => acc + item.subtotal, 0);
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700";

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Promoções e Combos</h1>
        <div className="flex gap-3">
          <ButtonSistema variant="primary" className="bg-[#0D9488] border-none" onClick={() => setIsModalOfertaOpen(true)}>
            + Nova Oferta Relâmpago
          </ButtonSistema>
          <ButtonSistema variant="primary" className="bg-[#0D9488] border-none" onClick={() => setIsModalComboOpen(true)}>
            + Novo Combo
          </ButtonSistema>
        </div>
      </div>

      {/* SEÇÃO 1: OFERTAS RELÂMPAGO ATIVAS (SEM IMAGEM) */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ofertas Relâmpago Ativas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ofertasAtivas.map(oferta => (
            <div key={oferta.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <h3 className="font-bold text-gray-800 text-center">{oferta.name}</h3>
              <div className="flex justify-between w-full mt-3 text-sm">
                <span className="text-gray-400 line-through">Normal: R$ {oferta.preco_original.toFixed(2)}</span>
              </div>
              <div className="text-xl font-bold text-[#0D9488] mt-1 mb-4">R$ {oferta.preco_promo.toFixed(2)}</div>
              <button onClick={() => setOfertasAtivas(prev => prev.filter(o => o.id !== oferta.id))} className="w-full bg-[#0D9488] text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition">
                Desativar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: COMBOS & KITS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Combos & Kits</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-600 text-sm">
                <th className="p-4 font-semibold">Nome do Combo</th>
                <th className="p-4 font-semibold">Produtos Incluídos</th>
                <th className="p-4 font-semibold">Preço Normal</th>
                <th className="p-4 font-semibold">Preço Combo</th>
                <th className="p-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {combosCadastrados.map(combo => (
                <tr key={combo.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{combo.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{combo.itens}</td>
                  <td className="p-4 text-gray-400 line-through text-sm">R$ {combo.preco_original.toFixed(2)}</td>
                  <td className="p-4 font-bold text-gray-800">R$ {combo.preco_final.toFixed(2)}</td>
                  <td className="p-4 flex justify-center gap-4">
                    <button className="text-teal-600">✏️</button>
                    <button onClick={() => setCombosCadastrados(prev => prev.filter(c => c.id !== combo.id))} className="text-red-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟢 MODAL: CRIAR NOVO COMBO (LAYOUT REFINADO) */}
      {isModalComboOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Criar Novo Combo</h2>
              <button onClick={fecharModais} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Combo</label>
                  <input type="text" value={nomeCombo} onChange={(e) => setNomeCombo(e.target.value)} className={inputClasses} placeholder="Ex: Café da manhã" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Sugerido (Venda)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input type="number" value={precoCombo} onChange={(e) => setPrecoCombo(e.target.value)} className={`${inputClasses} pl-9`} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Adicionar Produtos a este combo</label>
                <div className="flex gap-2">
                  <select value={produtoSelecionadoId} onChange={(e) => setProdutoSelecionadoId(e.target.value)} className={`${inputClasses} flex-grow`}>
                    <option value="">Selecione um produto...</option>
                    {produtosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name} - R${p.price}</option>)}
                  </select>
                  <input type="number" value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))} className={`${inputClasses} w-24 text-center`} />
                  <button onClick={handleAdicionarProdutoNoCombo} className="bg-[#1e293b] text-white px-4 py-2 rounded-md font-medium">Adicionar</button>
                </div>
              </div>

              {/* TABELA DE ITENS NO MODAL */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="py-2 px-4 font-semibold">Produto</th>
                      <th className="py-2 px-4 font-semibold text-center">Qtd</th>
                      <th className="py-2 px-4 font-semibold text-right">Subtotal</th>
                      <th className="py-2 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensDoCombo.map((it, idx) => (
                      <tr key={idx} className="border-t border-gray-50">
                        <td className="py-2 px-4">{it.nome}</td>
                        <td className="py-2 px-4 text-center">{it.quantidade}x</td>
                        <td className="py-2 px-4 text-right font-medium">R$ {it.subtotal.toFixed(2)}</td>
                        <td className="py-2 px-4 text-center">
                          <button onClick={() => setItensDoCombo(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-bold">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr className="border-t border-gray-200">
                      <td colSpan={2} className="py-2 px-4 text-right text-gray-500 italic">Total se vendido separado:</td>
                      <td className="py-2 px-4 text-right text-gray-500 line-through">R$ {valorTotalOriginal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    {precoCombo && Number(precoCombo) < valorTotalOriginal && (
                      <tr className="bg-[#f0fdf4] text-[#166534]">
                        <td colSpan={2} className="py-2 px-4 text-right font-bold">Desconto aplicado:</td>
                        <td className="py-2 px-4 text-right font-bold">- R$ {(valorTotalOriginal - Number(precoCombo)).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )}
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="py-2 px-4 text-right font-bold">Preço Final do Combo:</td>
                      <td className="py-2 px-4 text-right font-bold text-[#0D9488]">R$ {Number(precoCombo || 0).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={fecharModais} className="px-4 py-2 text-gray-600 font-bold uppercase text-sm border border-gray-200 rounded hover:bg-white">CANCELAR</button>
              <button onClick={() => {
                setCombosCadastrados(prev => [...prev, { id: Date.now(), name: nomeCombo, itens: itensDoCombo.map(i => i.nome).join(', '), preco_original: valorTotalOriginal, preco_final: Number(precoCombo) }]);
                fecharModais();
              }} className="px-4 py-2 bg-[#0D9488] text-white font-bold uppercase text-sm rounded hover:bg-teal-700">SALVAR COMBO</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA OFERTA (LAYOUT SIMPLES) */}
      {isModalOfertaOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 text-left">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Nova Oferta Relâmpago</h2>
              <button onClick={fecharModais}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Selecione o Produto</label>
                <select value={ofertaProdutoId} onChange={(e) => setOfertaProdutoId(e.target.value)} className={inputClasses}>
                  <option value="">Escolha um produto...</option>
                  {produtosDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Preço Promocional</label>
                <input type="number" placeholder="Valor em R$" value={ofertaPreco} onChange={(e) => setOfertaPreco(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <ButtonSistema variant="outline" onClick={fecharModais}>Cancelar</ButtonSistema>
              <ButtonSistema variant="primary" className="bg-[#0D9488]" onClick={() => {
                const prod = produtosDisponiveis.find(p => p.id === Number(ofertaProdutoId));
                setOfertasAtivas(prev => [...prev, { id: Date.now(), name: prod.name, preco_original: Number(prod.price), preco_promo: Number(ofertaPreco) }]);
                fecharModais();
              }}>Ativar Oferta</ButtonSistema>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}