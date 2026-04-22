import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Produto, Categoria } from './types';
import { useImageUpload } from '@/src/components/produtos/hooks/useImageUpload'; // 🟢 Importando seu hook

interface Props {
  isOpen: boolean;
  produtoOriginal: Produto | null;
  categorias: Categoria[];
  onClose: () => void;
  // 🟢 Função onSave agora espera a imagem opcional
  onSave: (produto: Produto, imageFile?: File | null) => Promise<boolean>; 
}

export default function ModalEditarProduto({ isOpen, produtoOriginal, categorias, onClose, onSave }: Props) {
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  
  // 🟢 Preparando o terreno para as imagens
  const imagemHook = useImageUpload();
  const [imagemAtualUrl, setImagemAtualUrl] = useState<string | null>(null);

  const inputClasses = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all text-gray-700";

  useEffect(() => {
    if (produtoOriginal) {
      setProdutoEditando({ ...produtoOriginal });
      setImagemAtualUrl(produtoOriginal.image || null); // Salva a foto que já veio do banco
      imagemHook.handleRemoveImage(); // Limpa qualquer upload pendente anterior
    }
  }, [produtoOriginal]);

  if (!isOpen || !produtoEditando) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🟢 Passando o produto e a possível nova imagem
    const sucesso = await onSave(produtoEditando, imagemHook.image);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="bg-[#0D9488] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Editar Produto</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            
            {/* LADO ESQUERDO: IMAGEM */}
            <div className="w-full md:w-1/3 space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Imagem</label>
              <div className="w-full aspect-square border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden shadow-inner">
                <input type="file" accept="image/*" onChange={imagemHook.handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Trocar imagem" />
                
                {(imagemHook.previewUrl || imagemAtualUrl) ? (
                  <div className="relative w-full h-full">
                    <img src={imagemHook.previewUrl || imagemAtualUrl!} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); imagemHook.handleRemoveImage(); setImagemAtualUrl(null); }} className="absolute top-2 right-2 z-20 bg-red-600/80 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mb-1"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-bold uppercase">Alterar Foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* LADO DIREITO: DADOS */}
            <div className="w-full md:w-2/3 space-y-4">
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
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unit.</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input type="number" step="0.01" min="0" required value={produtoEditando.price ?? ''} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, price: Number(e.target.value)}) }} className={`${inputClasses} pl-9`} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estoque</label>
                  <input type="number" min="0" required value={produtoEditando.stock ?? ''} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setProdutoEditando({...produtoEditando, stock: Number(e.target.value)}) }} className={inputClasses} />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
            <ButtonSistema type="submit" variant="primary">Salvar Alterações</ButtonSistema>
          </div>
        </form>
      </div>
    </div>
  );
}