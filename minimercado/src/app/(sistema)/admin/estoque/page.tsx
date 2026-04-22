'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// Subcomponentes
import TabelaEstoque from '@/src/components/estoque/TabelaEstoque';
import ModalEditarProduto from '@/src/components/estoque/ModalEditarProduto';
import ModalExcluirProduto from '@/src/components/estoque/ModalExcluirProduto';

// Cérebro e Tipos
import { useEstoque } from '@/src/components/estoque/hooks/useEstoque';
import { Produto } from '@/src/components/estoque/types';

export default function GerenciarEstoquePage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const estoqueData = useEstoque(exibirAlerta);

  // Controles de Filtro e Ordenação 🟢
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [ordemEstoque, setOrdemEstoque] = useState<'maior' | 'menor'>('maior');

  // Controles de Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);

  const handleAbrirEdicao = (produto: Produto) => {
    setProdutoEditando(produto);
    setIsEditModalOpen(true);
  };

  const handleAbrirExclusao = (produto: Produto) => {
    setProdutoParaExcluir(produto);
    setIsDeleteModalOpen(true);
  };

  // 🟢 MÁGICA DOS FILTROS: Calcula a lista que vai pra tabela na hora
  const produtosFiltradosEOrdenados = useMemo(() => {
    let lista = [...estoqueData.produtos];
    
    // 1. Filtra por categoria se não for "Todos"
    if (filtroCategoria !== 'Todos') {
      lista = lista.filter(p => p.category_id === Number(filtroCategoria));
    }
    
    // 2. Ordena
    lista.sort((a, b) => {
      if (ordemEstoque === 'maior') return b.stock - a.stock;
      return a.stock - b.stock; // menor
    });

    return lista;
  }, [estoqueData.produtos, filtroCategoria, ordemEstoque]);
  
  return (
    <div className="max-w-6xl mx-auto py-6 relative">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Gerenciamento de Estoque</h1>
        <Link href="/admin/produtos">
          <ButtonSistema type="button" variant="primary" className="gap-2">
            <span className="text-xl leading-none">+</span> Novo Produto
          </ButtonSistema>
        </Link>
      </div>

      {/* 🟢 BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Filtrar por Categoria</label>
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] outline-none text-sm text-gray-700"
          >
            <option value="Todos">Todas as Categorias</option>
            {estoqueData.categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Ordenar por Quantidade</label>
          <select 
            value={ordemEstoque} 
            onChange={(e) => setOrdemEstoque(e.target.value as 'maior' | 'menor')} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] outline-none text-sm text-gray-700"
          >
            <option value="maior">Maior Estoque ➔ Menor Estoque</option>
            <option value="menor">Menor Estoque ➔ Maior Estoque</option>
          </select>
        </div>
      </div>

      {/* TABELA VISUAL - Agora recebe a lista processada! */}
      <TabelaEstoque 
        produtos={produtosFiltradosEOrdenados} 
        isLoading={estoqueData.isLoading}
        onEdit={handleAbrirEdicao}
        onDelete={handleAbrirExclusao}
      />

      {/* MODAIS */}
      <ModalEditarProduto 
        isOpen={isEditModalOpen}
        produtoOriginal={produtoEditando}
        categorias={estoqueData.categorias}
        onClose={() => { setIsEditModalOpen(false); setProdutoEditando(null); }}
        onSave={estoqueData.salvarEdicao}
      />

      <ModalExcluirProduto 
        isOpen={isDeleteModalOpen}
        produto={produtoParaExcluir}
        onClose={() => { setIsDeleteModalOpen(false); setProdutoParaExcluir(null); }}
        onConfirm={estoqueData.excluirProduto}
      />

      <ModalAlerta 
        isOpen={modalAlerta.isOpen}
        mensagem={modalAlerta.mensagem}
        tipo={modalAlerta.tipo}
        onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
      />
    </div>
  );
}