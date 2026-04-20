import React from 'react';

interface OfertasProps {
  isLoading: boolean;
  ofertas: any[];
  onDesativar: (id: number) => void;
}

export default function OfertasAtivas({ isLoading, ofertas, onDesativar }: OfertasProps) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        Ofertas Relâmpago Ativas
      </h2>
      
      {isLoading ? (
        <div className="text-gray-400 text-center py-10">Carregando promoções...</div>
      ) : ofertas.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-400 font-medium">Nenhuma oferta ativa no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ofertas.map(produto => {
              const precoReal = Number(produto.base_price || produto.price);
              const precoPromo = Number(produto.promo_price);
              const porcentagem = precoReal > 0 ? (((precoReal - precoPromo) / precoReal) * 100).toFixed(0) : 0;
              
              return (
                <div key={produto.id} className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-teal-200 transition-colors">
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                      {porcentagem}% OFF
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-center mb-1 truncate" title={produto.name}>{produto.name}</h3>
                    <div className="flex flex-col items-center mb-4">
                        <span className="text-gray-400 line-through text-xs italic">De: R$ {precoReal.toFixed(2)}</span>
                        <span className="text-2xl font-black text-[#0D9488]">R$ {precoPromo.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => onDesativar(produto.id)} 
                      className="w-full bg-gray-50 text-gray-400 py-2 rounded-lg font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                    >
                      DESATIVAR
                    </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}