import React from 'react';
import { InputPesquisa } from '@/src/components/ui/InputPesquisa';

export default function ModalCombo({ promocoes }: { promocoes: any }) {
  const { modais, comboForm, dados } = promocoes;
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 transition-all";

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white font-bold">
          <h2>{comboForm.idEditando ? 'Editar Combo' : 'Configurar Novo Combo'}</h2>
          <button onClick={modais.fecharModais}>✕</button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* UPLOAD IMAGEM */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="block text-xs font-black text-gray-400 uppercase mb-3">Imagem do Combo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-white relative shadow-sm">
                {(comboForm.imageHook.previewUrl || comboForm.imagemAtualUrl) ? (
                  <img src={comboForm.imageHook.previewUrl || comboForm.imagemAtualUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-[10px] text-center p-2 font-bold uppercase">Sem Foto</span>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-xs uppercase cursor-pointer hover:bg-gray-700 text-center transition-colors shadow-sm">
                  ESCOLHER IMAGEM
                  <input type="file" accept="image/*" onChange={comboForm.imageHook.handleImageChange} className="hidden" />
                </label>
                {(comboForm.imageHook.previewUrl || comboForm.imagemAtualUrl) && (
                  <button type="button" onClick={() => { comboForm.imageHook.handleRemoveImage(); comboForm.setImagemAtualUrl(null); }} className="text-red-500 text-xs font-bold hover:underline">
                    Remover Imagem
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nome do Combo*</label>
              <input type="text" value={comboForm.nomeCombo} onChange={(e) => comboForm.setNomeCombo(e.target.value)} className={inputClasses} placeholder="Ex: Combo Café da Manhã" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Categoria*</label>
              <select value={comboForm.categoriaId} onChange={(e) => comboForm.setCategoriaId(e.target.value)} className={inputClasses}>
                <option value="" disabled>Selecione...</option>
                {dados.categorias.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Preço de Venda (R$)*</label>
              <input type="number" value={comboForm.precoCombo} onChange={(e) => comboForm.setPrecoCombo(e.target.value)} className={inputClasses} placeholder="0.00" />
            </div>
          </div>

          {/* BUSCA E ADD PRODUTOS */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-xl border relative">
            <label className="block text-xs font-black text-gray-400 uppercase">Buscar Produto para Composição</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow relative">
                <InputPesquisa 
                    value={comboForm.buscaTexto} 
                    onChange={comboForm.setBuscaTexto} 
                    placeholder="Digite o nome do produto..." 
                />
                {dados.produtosFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {dados.produtosFiltrados.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          comboForm.setProdutoSelecionadoId(String(p.id));
                          comboForm.setBuscaTexto(p.name);
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
              <input type="number" value={comboForm.quantidadeSelecionada} onChange={(e) => comboForm.setQuantidadeSelecionada(Number(e.target.value))} className="w-20 border rounded-md text-center font-bold" />
              <button type="button" onClick={comboForm.handleAdicionarProdutoNoCombo} className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-xs uppercase">ADD</button>
            </div>
          </div>

          <div className="max-h-[200px] overflow-y-auto border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-400 sticky top-0">
                <tr><th className="p-2 px-4">Item</th><th className="p-2 text-center">Qtd</th><th className="p-2 text-right">Subtotal</th><th className="p-2"></th></tr>
              </thead>
              <tbody>
                {comboForm.itensDoCombo.map((it: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 px-4 font-medium">{it.nome}</td>
                    <td className="p-2 text-center">{it.quantidade}x</td>
                    <td className="p-2 text-right">R$ {it.subtotal.toFixed(2)}</td>
                    <td className="p-2 text-center"><button type="button" onClick={() => comboForm.setItensDoCombo((prev: any[]) => prev.filter((_, i) => i !== idx))} className="text-red-400">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          <button type="button" onClick={modais.fecharModais} className="text-gray-400 font-bold text-[10px] uppercase">Cancelar</button>
          <button 
            type="button" 
            disabled={dados.isSubmitting}
            onClick={comboForm.handleSalvarCombo} 
            className="px-6 py-2 bg-[#0D9488] text-white font-bold rounded-lg shadow-md text-[10px] disabled:opacity-50"
          >
            {dados.isSubmitting ? 'SALVANDO...' : (comboForm.idEditando ? 'SALVAR ALTERAÇÕES' : 'SALVAR COMBO')}
          </button>
        </div>
      </div>
    </div>
  );
}