'use client';
import React, { useState } from 'react';
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

  
  return (
    <div className="max-w-6xl mx-auto py-6 relative">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Gerenciamento de Estoque</h1>
        <Link href="/admin/produto">
          <ButtonSistema type="button" variant="primary" className="gap-2">
            <span className="text-xl leading-none">+</span> Novo Produto
          </ButtonSistema>
        </Link>
      </div>

      {/* TABELA VISUAL */}
      <TabelaEstoque 
        produtos={estoqueData.produtos} 
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