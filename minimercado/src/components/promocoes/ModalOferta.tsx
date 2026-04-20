import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { InputPesquisa } from '@/src/components/ui/InputPesquisa';

export default function ModalOferta({ promocoes }: { promocoes: any }) {
  const { modais, ofertaForm, dados } = promocoes;
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] outline-none text-gray-700 transition-all";

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left">
        <div className="bg-[#0D9488] px-6 py-4 flex justify-between items-center text-white font-bold">
          <h2>Criar Oferta Relâmpago</h2>
          <button onClick={modais.fecharModais}>✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Buscar Produto (Apenas S/ Promo)</label>
            <InputPesquisa 
                value={ofertaForm.buscaTexto} 
                onChange={ofertaForm.setBuscaTexto} 
                placeholder="Nome do produto..." 
            />
            
            {dados.produtosFiltrados.length > 0 && !ofertaForm.ofertaProdutoId && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {dados.produtosFiltrados.filter((p: any) => !p.promo_status).map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      ofertaForm.setOfertaProdutoId(String(p.id));
                      ofertaForm.setBuscaTexto(p.name);
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
            <input type="number" value={ofertaForm.ofertaPreco} onChange={(e) => ofertaForm.setOfertaPreco(e.target.value)} className={inputClasses} placeholder="0.00" />
          </div>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          <ButtonSistema variant="outline" onClick={modais.fecharModais}>Cancelar</ButtonSistema>
          <ButtonSistema variant="primary" className="bg-[#0D9488] disabled:opacity-50" disabled={dados.isSubmitting} onClick={ofertaForm.handleAtivarOferta}>
            {dados.isSubmitting ? 'ATIVANDO...' : 'ATIVAR OFERTA'}
          </ButtonSistema>
        </div>
      </div>
    </div>
  );
}