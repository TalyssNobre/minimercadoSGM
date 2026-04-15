import React from 'react';
import { Category } from './types';

interface Props {
  categories: Category[];
  totaisPorCategoria: Record<number, number>;
  activeTab: string | number;
  setActiveTab: (tab: string | number) => void;
}

export default function SubtotaisSetores({ categories, totaisPorCategoria, activeTab, setActiveTab }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        Subtotais por Categoria (Rateio)
        {categories.length > 0 && (
          <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{categories.length} Setores</span>
        )}
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => setActiveTab(cat.id)}
            className={`bg-white rounded-xl p-5 border shadow-sm transition-all cursor-pointer border-l-4
              ${activeTab === cat.id ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20' : 'border-gray-100 hover:border-[#0D9488]/50 border-l-[#0D9488]'}
            `}
          >
            <p className="text-sm font-bold text-gray-600 truncate">{cat.name}</p>
            <h4 className="text-xl font-bold text-gray-800 mt-2">{formatCurrency(totaisPorCategoria[cat.id] || 0)}</h4>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full p-6 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
            Nenhuma categoria registrada.
          </div>
        )}
      </div>
    </div>
  );
}