'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// Hooks Modulares
import { useCategorias } from '@/src/components/produtos/hooks/useCategorias';
import { useImageUpload } from '@/src/components/produtos/hooks/useImageUpload';

// Controllers
import { createProduct } from '@/src/Server/controllers/ProductController';

export default function CadastroProdutoPage() {
  const router = useRouter();

  // Alertas Globais do Formulário
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  // Hooks Injetados
  const categoriasHook = useCategorias(exibirAlerta);
  const imagemHook = useImageUpload();

  // States do Formulário de Produto
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputClasses = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all placeholder-gray-400 text-gray-800";

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaId) return exibirAlerta("Por favor, selecione uma categoria.", 'error');
    
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', nome);
      formData.append('category_id', categoriaId);
      formData.append('price', preco);
      formData.append('stock', estoque || '0');
      
      if (imagemHook.image) formData.append('image', imagemHook.image);

      const response = await createProduct(formData) as any;

      if (response.success) {
        setNome('');
        setCategoriaId('');
        setPreco('');
        setEstoque('');
        imagemHook.handleRemoveImage();
        router.refresh(); 
        exibirAlerta("Produto registrado com sucesso! 🚀", 'success');
      } else {
        exibirAlerta(response.message || "Erro ao salvar produto", 'error');
      }
    } catch (error) {
      console.error("Erro no envio:", error);
      exibirAlerta("Erro de conexão com o servidor.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 tracking-tight">Cadastro de Novo Produto</h1>

        <form onSubmit={handleSalvarProduto} className="space-y-6 md:space-y-8 bg-white">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto*</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bolo de Pote" className={inputClasses} />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria do Produto*</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={`${inputClasses} flex-grow`}>
                  <option value="" disabled>{categoriasHook.categorias.length === 0 ? "Carregando..." : "Selecione..."}</option>
                  {categoriasHook.categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <ButtonSistema type="button" onClick={() => categoriasHook.setIsModalCategoriaOpen(true)} className="px-4 py-2.5 text-xs h-[46px] whitespace-nowrap">+ Nova</ButtonSistema>
              </div>
            </div>

            {/* Preço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preço de Venda (R$)*</label>
              <input type="number" step="0.01" min="0" required value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" className={inputClasses} />
            </div>

            {/* Estoque */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estoque Inicial</label>
              <input type="number" min="0" value={estoque} onChange={(e) => setEstoque(e.target.value)} placeholder="0" className={inputClasses} />
            </div>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem do Produto</label>
            <div className="w-full aspect-video md:aspect-[3/1] border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative group overflow-hidden">
              <input type="file" accept="image/*" onChange={imagemHook.handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              
              {imagemHook.previewUrl ? (
                <div className="relative w-full h-full">
                  <img src={imagemHook.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); imagemHook.handleRemoveImage(); }} className="absolute top-2 right-2 z-20 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mb-2"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
                  <span className="text-sm font-medium">Clique para selecionar imagem</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <ButtonSistema type="button" variant="outline" onClick={() => router.back()}>Cancelar</ButtonSistema>
            <ButtonSistema type="submit" variant="primary" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Produto'}</ButtonSistema>
          </div>
        </form>
      </div>

      {/* Modal Categoria (Injetado via Hook) */}
      {categoriasHook.isModalCategoriaOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Nova Categoria</h2>
            <input type="text" autoFocus value={categoriasHook.novaCategoriaNome} onChange={(e) => categoriasHook.setNovaCategoriaNome(e.target.value)} placeholder="Nome da categoria" className={inputClasses} onKeyDown={(e) => e.key === 'Enter' && categoriasHook.handleSalvarCategoria(e as any, setCategoriaId)} />
            <div className="flex justify-end gap-2 mt-6">
              <ButtonSistema type="button" variant="outline" onClick={() => categoriasHook.setIsModalCategoriaOpen(false)}>Cancelar</ButtonSistema>
              <ButtonSistema type="button" onClick={(e) => categoriasHook.handleSalvarCategoria(e, setCategoriaId)}>Salvar</ButtonSistema>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alerta Global */}
      <ModalAlerta isOpen={modalAlerta.isOpen} mensagem={modalAlerta.mensagem} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
    </div>
  );
}