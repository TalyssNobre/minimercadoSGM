'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { InputPesquisa } from '@/src/components/ui/InputPesquisa'; // 🟢 Importamos a Lupa
import { getAllProducts } from '@/src/Server/controllers/ProductController';

export default function PromocoesPage() {
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 ESTADO PARA A LUPA (Busca)
  const [buscaTexto, setBuscaTexto] = useState('');
  
  const [ofertasAtivas, setOfertasAtivas] = useState<any[]>([
    { id: 1, produto_id: 10, name: 'Coca-cola 310ml', preco_original: 5.00, preco_promo: 4.00 }
  ]);
  
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

  // 🟢 FILTRO DINÂMICO PARA A LUPA
  const produtosFiltrados = useMemo(() => {
    if (!buscaTexto) return [];
    return produtosDisponiveis.filter(p => 
      p.name.toLowerCase().includes(buscaTexto.toLowerCase())
    ).slice(0, 5); // Mostra apenas os 5 primeiros para não poluir
  }, [produtosDisponiveis, buscaTexto]);

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
    setBuscaTexto(''); // 🟢 Limpa a busca ao fechar
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
      setBuscaTexto(''); // Limpa para a próxima busca
      setQuantidadeSelecionada(1);
    }
  };

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
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen relative text-left">
      
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

      {/* DASHBOARD */}
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

      {/* SEÇÃO 1: OFERTAS */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Ofertas Relâmpago Ativas
        </h2>
        {/* ... Grid de ofertas igual ao seu ... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ofertasAtivas.map(oferta => (
                <div key={oferta.id} className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-center mb-1">{oferta.name}</h3>
                    <div className="flex flex-col items-center mb-4">
                        <span className="text-gray-400 line-through text-xs">De: R$ {oferta.preco_original.toFixed(2)}</span>
                        <span className="text-2xl font-black text-[#0D9488]">R$ {oferta.preco_promo.toFixed(2)}</span>
                    </div>
                    <button onClick={() => setOfertasAtivas(prev => prev.filter(o => o.id !== oferta.id))} className="w-full bg-gray-50 text-gray-400 py-2 rounded-lg font-bold text-xs hover:text-red-500 transition-all">DESATIVAR</button>
                </div>
            ))}
        </div>
      </div>

      {/* SEÇÃO 2: COMBOS */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Combos & Kits Registrados</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-400 text-[10px] uppercase font-black">
                        <th className="p-4">Nome</th>
                        <th className="p-4">Produtos</th>
                        <th className="p-4">Preço Original</th>
                        <th className="p-4">Preço Combo</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {combosCadastrados.map(combo => (
                        <tr key={combo.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold">{combo.name}</td>
                            <td className="p-4 text-xs italic">{combo.itens}</td>
                            <td className="p-4 text-gray-400 line-through">R$ {combo.preco_original.toFixed(2)}</td>
                            <td className="p-4 font-black text-[#0D9488]">R$ {combo.preco_final.toFixed(2)}</td>
                            <td className="p-4 flex justify-center gap-4">
                                <button onClick={() => handleEditarCombo(combo)} title="Editar">✏️</button>
                                <button onClick={() => setCombosCadastrados(prev => prev.filter(c => c.id !== combo.id))} title="Excluir">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* 🟢 MODAL: COMBO (Ajustado com a Lupa) */}
      {isModalComboOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white font-bold">
              <h2>{idEditando ? 'Editar Combo' : 'Configurar Novo Combo'}</h2>
              <button onClick={fecharModais}>✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nome do Combo</label>
                  <input type="text" value={nomeCombo} onChange={(e) => setNomeCombo(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Preço de Venda</label>
                  <input type="number" value={precoCombo} onChange={(e) => setPrecoCombo(e.target.value)} className={inputClasses} />
                </div>
              </div>

              {/* LUPA DE PESQUISA PARA COMPOSIÇÃO */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border relative">
                <label className="block text-xs font-black text-gray-400 uppercase">Buscar Produto para Composição</label>
                <div className="flex gap-2">
                  <div className="flex-grow relative">
                    <InputPesquisa 
                        value={buscaTexto} 
                        onChange={setBuscaTexto} 
                        placeholder="Digite o nome do produto..." 
                    />
                    
                    {/* Lista Flutuante de Resultados */}
                    {produtosFiltrados.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {produtosFiltrados.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProdutoSelecionadoId(String(p.id));
                              setBuscaTexto(p.name);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-teal-50 flex justify-between items-center border-b last:border-0"
                          >
                            <span className="font-medium text-gray-700">{p.name}</span>
                            <span className="text-[10px] font-bold text-[#0D9488]">R$ {p.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <input type="number" value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(Number(e.target.value))} className="w-20 border rounded-md text-center font-bold" />
                  <button onClick={handleAdicionarProdutoNoCombo} className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-xs uppercase">ADD</button>
                </div>
              </div>

              {/* TABELA DE ITENS NO MODAL */}
              <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 sticky top-0">
                    <tr><th className="p-2 px-4">Item</th><th className="p-2 text-center">Qtd</th><th className="p-2 text-right">Subtotal</th><th className="p-2"></th></tr>
                  </thead>
                  <tbody>
                    {itensDoCombo.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 px-4 font-medium">{it.nome}</td>
                        <td className="p-2 text-center">{it.quantidade}x</td>
                        <td className="p-2 text-right">R$ {it.subtotal.toFixed(2)}</td>
                        <td className="p-2 text-center"><button onClick={() => setItensDoCombo(prev => prev.filter((_, i) => i !== idx))} className="text-red-400">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <button onClick={fecharModais} className="text-gray-400 font-bold text-[10px] uppercase">Cancelar</button>
              <button onClick={() => {
                const comboFormatado = { 
                  id: idEditando || Date.now(), 
                  name: nomeCombo, 
                  itens: itensDoCombo.map(i => `${i.quantidade}x ${i.nome}`).join(', '),
                  rawItens: itensDoCombo,
                  preco_original: valorTotalOriginal, 
                  preco_final: Number(precoCombo) 
                };
                if (idEditando) setCombosCadastrados(prev => prev.map(c => c.id === idEditando ? comboFormatado : c));
                else setCombosCadastrados(prev => [...prev, comboFormatado]);
                fecharModais();
              }} className="px-6 py-2 bg-[#0D9488] text-white font-bold rounded-lg shadow-md text-[10px]">
                {idEditando ? 'SALVAR ALTERAÇÕES' : 'SALVAR COMBO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL: OFERTA (Ajustado com a Lupa) */}
      {isModalOfertaOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white font-bold">
              <h2>Criar Oferta Relâmpago</h2>
              <button onClick={fecharModais}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Buscar Produto</label>
                <InputPesquisa 
                    value={buscaTexto} 
                    onChange={setBuscaTexto} 
                    placeholder="Nome do produto..." 
                />
                
                {produtosFiltrados.length > 0 && !ofertaProdutoId && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                    {produtosFiltrados.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setOfertaProdutoId(String(p.id));
                          setBuscaTexto(p.name);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-teal-50"
                      >
                        {p.name} - <span className="font-bold text-[#0D9488]">R$ {p.price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Preço Promocional</label>
                <input type="number" value={ofertaPreco} onChange={(e) => setOfertaPreco(e.target.value)} className={inputClasses} placeholder="0.00" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <ButtonSistema variant="outline" onClick={fecharModais}>Cancelar</ButtonSistema>
              <ButtonSistema variant="primary" className="bg-[#0D9488]" onClick={() => {
                const prod = produtosDisponiveis.find(p => p.id === Number(ofertaProdutoId));
                if(!prod || !ofertaPreco) return alert("Selecione um produto e preço!");
                setOfertasAtivas(prev => [...prev, { id: Date.now(), name: prod.name, preco_original: Number(prod.price), preco_promo: Number(ofertaPreco) }]);
                fecharModais();
              }}>ATIVAR OFERTA</ButtonSistema>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}