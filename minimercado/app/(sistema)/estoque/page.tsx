'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/components/ui/ButtonSistema';

export default function GerenciarEstoquePage() {
  // =========================================================================
  // ESTADOS PRINCIPAIS
  // =========================================================================
  const [produtos, setProdutos] = useState([
    { prdocut_id: 1, name: 'Bolo de Pote', category: 'Doceria/Bigas', price: 8.00, stock: 15 },
    { prdocut_id: 2, name: 'Refri Lata 350ml', category: 'Geral', price: 5.00, stock: 42 },
    { prdocut_id: 3, name: 'Salgado Assado', category: 'Geral', price: 7.00, stock: 0 },
    { prdocut_id: 4, name: 'Livro de Orações', category: 'Livraria', price: 25.00, stock: 8 },
    { prdocut_id: 5, name: 'Trufa de Chocolate', category: 'Doceria/Bigas', price: 3.50, stock: 20 },
  ]);

  const categoriasMock = ['Doceria/Bigas', 'Geral', 'Livraria'];

  // =========================================================================
  // ESTADOS DOS MODAIS (Edição e Exclusão)
  // =========================================================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);

  // 🟢 Novos estados para controlar a Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<any>(null);

  const inputClasses = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all text-gray-700";

  // =========================================================================
  // FUNÇÕES DE AÇÃO
  // =========================================================================
  
  // --- Funções de Edição ---
  const handleAbrirEdicao = (produto: any) => {
    setProdutoEditando({ ...produto });
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    const listaAtualizada = produtos.map(p => 
      p.prdocut_id === produtoEditando.prdocut_id ? produtoEditando : p
    );
    setProdutos(listaAtualizada);
    setIsEditModalOpen(false);
    setProdutoEditando(null);
  };

  // 🟢 --- Funções de Exclusão ---
  const handleAbrirExclusao = (produto: any) => {
    setProdutoParaExcluir(produto);
    setIsDeleteModalOpen(true);
  };

  const confirmarExclusao = () => {
    if (produtoParaExcluir) {
      // Filtra a lista removendo apenas o produto que tem o ID igual ao que queremos excluir
      const listaAtualizada = produtos.filter(p => p.prdocut_id !== produtoParaExcluir.prdocut_id);
      setProdutos(listaAtualizada);
      
      // Fecha o modal e limpa a memória
      setIsDeleteModalOpen(false);
      setProdutoParaExcluir(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 relative">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Gerenciamento de Estoque
        </h1>
        
        <Link href="/produtos">
          <ButtonSistema type="button" variant="primary" className="gap-2">
            <span className="text-xl leading-none">+</span> Novo Produto
          </ButtonSistema>
        </Link>
      </div>

      {/* CONTAINER DA TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/4">Nome do Produto</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/5">Categoria</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6">Preço Unit.</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6 text-center">Estoque Atual</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {produtos.map((produto) => (
                <tr key={produto.prdocut_id} className="hover:bg-gray-50/50 transition-colors">
                  
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">{produto.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{produto.category}</td>
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-center">
                    <span className={produto.stock === 0 ? "text-red-500" : "text-gray-700"}>
                      {produto.stock}
                    </span>
                  </td>
                  
                  {/* BOTÕES DE AÇÃO LADO A LADO */}
                  <td className="py-4 px-6 text-center">
                    {/* 🟢 Colocamos os dois botões dentro de uma div com flex e gap */}
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleAbrirEdicao(produto)}
                        className="inline-flex items-center gap-1 bg-[#1e5eb0] hover:bg-[#154685] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                        title="Editar Produto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.158 3.71 3.71 1.159-1.157a2.625 2.625 0 000-3.711z" />
                          <path d="M10.75 4.365a8.25 8.25 0 00-1.41 1.41M19.635 13.25a8.25 8.25 0 01-1.41 1.41" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.93z" />
                        </svg>
                        Editar
                      </button>

                      {/* 🟢 NOVO BOTÃO DE EXCLUIR */}
                      <button 
                        onClick={() => handleAbrirExclusao(produto)}
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                        title="Excluir Produto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
            
          </table>
          
          {produtos.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhum produto cadastrado no estoque ainda.</div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO DE PRODUTO */}
      {/* ========================================================================= */}
      {isEditModalOpen && produtoEditando && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4">
              <h2 className="text-lg font-bold text-white">Editar Produto</h2>
            </div>
            
            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
                <input type="text" required value={produtoEditando.name} onChange={(e) => setProdutoEditando({...produtoEditando, name: e.target.value})} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                <select required value={produtoEditando.category} onChange={(e) => setProdutoEditando({...produtoEditando, category: e.target.value})} className={inputClasses}>
                  {categoriasMock.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unit.</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input type="number" step="0.01" min="0" required value={produtoEditando.price} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, price: e.target.value}) }} className={`${inputClasses} pl-9`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estoque Atual</label>
                <input type="number" min="0" required value={produtoEditando.stock} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, stock: e.target.value}) }} className={inputClasses} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <ButtonSistema type="submit" variant="primary" className="px-6 py-2">Salvar</ButtonSistema>
                <ButtonSistema type="button" variant="danger" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2">Cancelar</ButtonSistema>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && produtoParaExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
            
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir Produto</h2>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir <strong>{produtoParaExcluir.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-center gap-3">
              <ButtonSistema 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProdutoParaExcluir(null);
                }}
              >
                Cancelar
              </ButtonSistema>
              
              <ButtonSistema 
                type="button" 
                variant="danger" 
                onClick={confirmarExclusao}
              >
                Sim, Excluir
              </ButtonSistema>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}