'use client';
import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/components/ui/ButtonSistema';

export default function FormularioProduto() {
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<{ id: string | number; name: string }[]>([]);
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');



  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);


  const inputClasses = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all placeholder-gray-400";

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImagem(null); setPreviewUrl(null);
  };

  const handleSalvarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;
    const novaCat = { id: Date.now(), name: novaCategoriaNome };
    setCategorias([...categorias, novaCat]); 
    setCategoriaId(novaCat.id.toString());   
    setNovaCategoriaNome('');
    setIsModalCategoriaOpen(false);
  };

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Salvar:", { nome, categoriaId, preco, estoque, image: imagem?.name });
    alert("Produto salvo com sucesso! (Aguardando Supabase)");
    setNome(''); setCategoriaId(''); setPreco(''); setEstoque(''); 
    handleRemoveImage(e as any);
  };

  return (
    <>
      <form onSubmit={handleSalvarProduto} className="space-y-6 md:space-y-8">
        
        {/* Usamos flex-col no mobile e grid no PC para evitar esmagamento */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto*</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bolo de Pote" className={inputClasses} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria da Receita*</label>
            {/* O flex-col sm:flex-row garante que em telas muito pequenas (iPhone) o botão fique embaixo do select */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={`${inputClasses} flex-grow text-gray-700`}>
                <option value="" disabled>{categorias.length === 0 ? "Cadastre uma categoria ao lado..." : "Selecione..."}</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ButtonSistema type="button" onClick={() => setIsModalCategoriaOpen(true)} className="px-4 py-2.5 text-xs whitespace-nowrap capitalize flex-shrink-0 w-full sm:w-auto h-[46px]">
                + Nova Categoria
              </ButtonSistema>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preço de Venda (R$)*</label>
            <input type="number" step="0.01" min="0" required value={preco} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setPreco(e.target.value) }} placeholder="0,00" className={inputClasses} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estoque Inicial</label>
            <input type="number" min="0" value={estoque} onChange={(e) => { if(Number(e.target.value) >= 0 || e.target.value === '') setEstoque(e.target.value) }} placeholder="0" className={inputClasses} />
          </div>

        </div>

        {/* ÁREA DE IMAGEM */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem do Produto</label>
          <div className="w-full aspect-video md:aspect-[3/1] lg:aspect-video border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative group overflow-hidden">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-gray-100" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-3 right-3 z-20 bg-red-600 text-white rounded-full p-2 shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700" title="Remover imagem">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-[#0D9488] transition-colors p-4 md:p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3"><path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" /><path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" /></svg>
                <span className="text-xs md:text-sm font-medium">Clique ou arraste uma imagem do produto</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
          <ButtonSistema type="button" variant="outline" className="w-full sm:w-auto">Cancelar</ButtonSistema>
          <ButtonSistema type="submit" variant="primary" className="w-full sm:w-auto">Salvar Produto</ButtonSistema>
        </div>
      </form>

      {/* MODAL CATEGORIA */}
      {isModalCategoriaOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <form onSubmit={handleSalvarCategoria} className="p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Nova Categoria</h2>
              <input type="text" required value={novaCategoriaNome} onChange={(e) => setNovaCategoriaNome(e.target.value)} placeholder="Nome da Categoria" className={inputClasses} />
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <ButtonSistema type="button" variant="outline" onClick={() => setIsModalCategoriaOpen(false)} className="w-full sm:w-auto">Cancelar</ButtonSistema>
                <ButtonSistema type="submit" variant="primary" className="w-full sm:w-auto">Salvar</ButtonSistema>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}