import React from 'react';
import { ItemAgrupado } from './types';

interface Props {
  activeTab: 'PENDENTE' | 'PAGO';
  setActiveTab: (tab: 'PENDENTE' | 'PAGO') => void;
  comprasVisiveisAgrupadas: ItemAgrupado[];
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  isLoadingHistorico: boolean;
}

export default function TabelaExtrato({ activeTab, setActiveTab, comprasVisiveisAgrupadas, selectedItems, setSelectedItems, isLoadingHistorico }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleToggleItem = (id_agrupado: string) => {
    setSelectedItems(prev => prev.includes(id_agrupado) ? prev.filter(id => id !== id_agrupado) : [...prev, id_agrupado]);
  };

  const handleToggleAll = () => {
    if (selectedItems.length === comprasVisiveisAgrupadas.length) {
      setSelectedItems([]); 
    } else {
      setSelectedItems(comprasVisiveisAgrupadas.map(item => item.id_agrupado)); 
    }
  };

  const mudarAba = (aba: 'PENDENTE' | 'PAGO') => {
    setActiveTab(aba);
    setSelectedItems([]); // Limpa a seleção ao trocar de aba
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row bg-gray-100 border-b border-gray-200">
        <button onClick={() => mudarAba('PENDENTE')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'PENDENTE' ? 'bg-[#15665a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
          Histórico de Compras Pendentes
        </button>
        <button onClick={() => mudarAba('PAGO')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'PAGO' ? 'bg-[#15665a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
          Histórico de Compras Pagas
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[450px] bg-[#e5e9e5]/30">
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 bg-gray-200 shadow-sm z-10">
            <tr className="text-gray-700">
              {activeTab === 'PENDENTE' ? (
                <th className="py-3 px-4 w-12 text-center border-b border-gray-300">
                  <input type="checkbox" className="w-4 h-4 accent-[#15665a] cursor-pointer" checked={comprasVisiveisAgrupadas.length > 0 && selectedItems.length === comprasVisiveisAgrupadas.length} onChange={handleToggleAll} />
                </th>
              ) : <th className="py-3 px-4 w-12 border-b border-gray-300"></th>}
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Data</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Produto</th>
              <th className="py-3 px-4 text-sm font-bold text-center border-b border-gray-300">Qtd</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Categoria</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Valor Total</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 bg-white">
            {comprasVisiveisAgrupadas.map((item) => (
              <tr key={item.id_agrupado} className="hover:bg-gray-50 transition-colors">
                {activeTab === 'PENDENTE' ? (
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-[#15665a] cursor-pointer" checked={selectedItems.includes(item.id_agrupado)} onChange={() => handleToggleItem(item.id_agrupado)} />
                  </td>
                ) : <td className="py-3 px-4"></td>}
                <td className="py-3 px-4 text-sm text-gray-800">{item.date}</td>
                <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.product_name}</td>
                <td className="py-3 px-4 text-sm text-gray-800 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.category_name}</td>
                <td className="py-3 px-4 text-sm text-gray-800 font-medium">{formatCurrency(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {comprasVisiveisAgrupadas.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white border-t border-gray-200">
            {isLoadingHistorico ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#15665a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Carregando histórico...
              </span>
            ) : "Nenhum registro de compra encontrado para esta aba."}
          </div>
        )}
      </div>
    </>
  );
}