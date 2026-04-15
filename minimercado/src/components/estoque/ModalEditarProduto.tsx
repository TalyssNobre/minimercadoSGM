import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Produto, Categoria } from './types';

interface Props {
  isOpen: boolean;
  produtoOriginal: Produto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSave: (produto: Produto) => Promise<boolean>;
}

export default function ModalEditarProduto({ isOpen, produtoOriginal, categorias, onClose, onSave }: Props) {
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const inputClasses = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all text-gray-700";

  // Sempre que o modal abrir com um novo produto, atualiza o state local
  useEffect(() => {
    if (produtoOriginal) setProdutoEditando({ ...produtoOriginal });
  }, [produtoOriginal]);

  if (!isOpen || !produtoEditando) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await onSave(produtoEditando);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="bg-[#0D9488] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Editar Produto</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
            <input type="text" required value={produtoEditando.name || ''} onChange={(e) => setProdutoEditando({...produtoEditando, name: e.target.value})} className={inputClasses} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
            <select required value={produtoEditando.category_id || ''} onChange={(e) => setProdutoEditando({...produtoEditando, category_id: Number(e.target.value)})} className={inputClasses}>
              <option value="" disabled>{categorias.length === 0 ? "Carregando categorias..." : "Selecione..."}</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unit.</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
              <input type="number" step="0.01" min="0" required value={produtoEditando.price ?? ''} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, price: Number(e.target.value)}) }} className={`${inputClasses} pl-9`} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estoque Atual</label>
            <input type="number" min="0" required value={produtoEditando.stock ?? ''} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, stock: Number(e.target.value)}) }} className={inputClasses} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
            <ButtonSistema type="submit" variant="primary">Salvar</ButtonSistema>
          </div>
        </form>
      </div>
    </div>
  );
}