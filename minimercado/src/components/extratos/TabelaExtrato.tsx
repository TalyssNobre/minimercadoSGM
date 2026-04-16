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
    if (selectedItems.length === comprasVisiveisAgrupadas.length && comprasVisiveisAgrupadas.length > 0) {
      setSelectedItems([]); 
    } else {
      setSelectedItems(comprasVisiveisAgrupadas.map(item => item.id_agrupado)); 
    }
  };

  const mudarAba = (aba: 'PENDENTE' | 'PAGO') => {
    setActiveTab(aba);
    setSelectedItems([]); 
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
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300 w-28">Data</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Itens da Compra</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300 text-center w-28">Status</th>
              <th className="py-3 px-4 text-sm font-bold border-b border-gray-300 text-right w-36">Valor Líquido</th>
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
                
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {/* 🟢 Corta a string pelo vírgula e gera as etiquetas bonitinhas */}
                    {item.items_resumo.split(', ').map((str, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50">
                        {str}
                      </span>
                    ))}
                  </div>
                </td>
                
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.status === 'PAGO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status === 'PAGO' ? 'Pago' : 'Fiado'}
                  </span>
                </td>
                
                <td className="py-3 px-4 text-sm font-medium text-right flex flex-col items-end">
                  {/* 🟢 Lógica idêntica ao Meu Histórico */}
                  <span className="font-bold text-base text-gray-800">
                    {formatCurrency(item.valor_liquido)}
                  </span>
                  
                  {item.desconto > 0 && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-gray-400 line-through">{formatCurrency(item.valor_bruto)}</span>
                      <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded">- {formatCurrency(item.desconto)}</span>
                    </div>
                  )}
                </td>

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
            ) : "Nenhum registro encontrado para esta aba."}
          </div>
        )}
      </div>
    </>
  );
}