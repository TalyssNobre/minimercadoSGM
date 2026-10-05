import React, { useState } from 'react';
import { Produto } from './types';

interface ModalProps {
  produto: Produto;
  allProducts: Produto[]; 
  onClose: () => void;
  onConfirm: (itensEscolhidos: any[]) => void;
}

export default function ModalEscolhaCombo({ produto, allProducts, onClose, onConfirm }: ModalProps) {
  const [selecoes, setSelecoes] = useState<any[]>([]);
  
  const comboItens = typeof produto.combo === 'string' ? JSON.parse(produto.combo) : (produto.combo || []);

  const handleSelect = (index: number, item: any) => {
    const novasSelecoes = [...selecoes];
    novasSelecoes[index] = { product_id: item.id, name: item.name };
    setSelecoes(novasSelecoes);
  };

  const confirmar = () => {
    // Conta quantas opções de escolha de categoria existem no combo
    const itensDeEscolha = comboItens.filter((i: any) => i.tipo === 'categoria' || i.is_category_choice || i.category_id);
    
    if (selecoes.filter(Boolean).length < itensDeEscolha.length) {
      alert("Selecione todas as opções necessárias!");
      return;
    }
    onConfirm(selecoes);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Escolha os itens de {produto.name}</h2>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {comboItens.map((item: any, index: number) => {
            // Se for um produto fixo em vez de escolha de categoria, o modal pula (já vem embutido no preço/combo)
            if (item.product_id && !item.tipo && !item.is_category_choice && !item.category_id) {
              return null;
            }

            // Descobre o ID real da categoria daquele item do combo
            const catIdAlvo = item.category_id || item.product_id;

            // Filtra os produtos que pertencem a essa categoria
            const produtosDaCategoria = allProducts.filter(p => Number(p.category_id) === Number(catIdAlvo));
            
            return (
              <div key={index} className="border-b pb-4 last:border-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escolha a opção ({item.quantity || 1}x):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {produtosDaCategoria.length > 0 ? (
                    produtosDaCategoria.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect(index, p)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all text-left truncate ${selecoes[index]?.product_id === p.id ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        {p.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-red-500 col-span-2">Nenhum produto encontrado nesta categoria (ID: {catIdAlvo}).</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
          <button type="button" onClick={confirmar} className="flex-1 py-3 rounded-lg font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] transition-colors shadow-md">Confirmar</button>
        </div>
      </div>
    </div>
  );
}