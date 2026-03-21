'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';

// =========================================================================
// INTERFACES (Tipagens baseadas no DER)
// =========================================================================
interface Membro {
  member_id: number;
  name: string;
  team_name: string; // Virá de um JOIN com a tabela Team
}

interface LinhaHistorico {
  id_linha: number; // Será o id da tabela Item_Sale
  member_id: number;
  date: string; // Vem da tabela Sale
  product_name: string; // Virá de um JOIN com a tabela Product
  category_name: string; // Virá de um JOIN com Product -> Category
  quantity: number; // Vem de Item_Sale
  price: number; // Preço total deste item (quantity * unit_price)
  status: 'PENDENTE' | 'PAGO'; // Calculado a partir do Sale.status (1 ou 2)
}

export default function ExtratoFiado() {
  // =========================================================================
  // ESTADOS PRINCIPAIS (Prontos para o Supabase)
  // =========================================================================
  const [membros, setMembros] = useState<Membro[]>([]);
  const [historicoBruto, setHistoricoBruto] = useState<LinhaHistorico[]>([]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================================
  // LÓGICA DE DADOS (AGRUPAMENTO)
  // =========================================================================
  const membroAtual = membros.find(m => m.member_id.toString() === selectedMemberId);

  const membrosFiltradosBusca = useMemo(() => {
    return membros.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, membros]);

  // 🟢 LÓGICA DE AGRUPAMENTO (Mantida intacta, mas agora lê de historicoBruto)
  const comprasVisiveisAgrupadas = useMemo(() => {
    if (!selectedMemberId) return [];

    const comprasBrutas = historicoBruto.filter(
      item => item.member_id.toString() === selectedMemberId && item.status === activeTab
    );

    const agrupado = comprasBrutas.reduce((acc: any, curr) => {
      // Formata a data para agrupar apenas pelo "dia" (ignora a hora se houver)
      // Ajuste isso caso a data venha em formato ISO do banco (ex: split('T')[0])
      const dataDia = curr.date.split(' ')[0]; 
      
      const key = `${dataDia}-${curr.product_name}-${curr.status}`;
      
      if (!acc[key]) {
        acc[key] = {
          id_agrupado: key,
          date: dataDia,
          product_name: curr.product_name,
          category_name: curr.category_name,
          quantity: curr.quantity,
          price: curr.price,
          status: curr.status,
          ids_originais: [curr.id_linha] 
        };
      } else {
        acc[key].quantity += curr.quantity;
        acc[key].price += curr.price;
        acc[key].ids_originais.push(curr.id_linha);
      }
      return acc;
    }, {});

    return Object.values(agrupado) as any[];
  }, [selectedMemberId, activeTab, historicoBruto]);

  const totais = useMemo(() => {
    if (!selectedMemberId) return { pago: 0, pendente: 0, selecionado: 0 };
    
    const todasComprasMembro = historicoBruto.filter(i => i.member_id.toString() === selectedMemberId);
    const totalPago = todasComprasMembro.filter(i => i.status === 'PAGO').reduce((acc, curr) => acc + curr.price, 0);
    const totalPendente = todasComprasMembro.filter(i => i.status === 'PENDENTE').reduce((acc, curr) => acc + curr.price, 0);
    
    const totalSelecionado = comprasVisiveisAgrupadas
      .filter(i => selectedItems.includes(i.id_agrupado))
      .reduce((acc, curr) => acc + curr.price, 0);

    return { pago: totalPago, pendente: totalPendente, selecionado: totalSelecionado };
  }, [selectedMemberId, comprasVisiveisAgrupadas, selectedItems, historicoBruto]);

  // =========================================================================
  // FUNÇÕES DA TABELA E BUSCA
  // =========================================================================
  const handleSelecionarMembro = (membro: Membro) => {
    setSelectedMemberId(membro.member_id.toString());
    setSearchTerm(`${membro.name} - ${membro.team_name}`);
    setIsDropdownOpen(false);
    setSelectedItems([]);
  };

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

  const handleQuitarPendencia = () => {
    if (selectedItems.length === 0) return;

    // TODO: Supabase UPDATE. Pegar os ids_originais dos itens selecionados e dar baixa no banco.
    // const idsParaBaixa = comprasVisiveisAgrupadas
    //   .filter(item => selectedItems.includes(item.id_agrupado))
    //   .flatMap(item => item.ids_originais);
    
    alert(`Simulação: Baixa de R$ ${totais.selecionado.toFixed(2).replace('.', ',')} realizada com sucesso!`);
    setSelectedItems([]); 
  };

  const handleTabChange = (tab: 'PENDENTE' | 'PAGO') => {
    setActiveTab(tab);
    setSelectedItems([]); 
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-5xl mx-auto">
      
      {/* BARRA DE PESQUISA */}
      <div className="mb-8 relative" ref={dropdownRef}>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">Extratos e Baixa de Fiado</h2>
        
        <div className="relative">
          <input 
            type="text"
            placeholder="Buscar Integrante (ex: Tio João)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              if (e.target.value === '') setSelectedMemberId('');
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#15665a] focus:border-[#15665a] outline-none text-gray-700 shadow-sm transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchTerm.length > 0 && membrosFiltradosBusca.length === 0 ? (
               <div className="px-4 py-3 text-sm text-gray-500 text-center">Nenhum integrante encontrado.</div>
            ) : membrosFiltradosBusca.length > 0 ? (
              membrosFiltradosBusca.map(m => (
                <div 
                  key={m.member_id} 
                  onClick={() => handleSelecionarMembro(m)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800">{m.name}</span>
                  <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-full">{m.team_name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center italic">Digite para buscar...</div>
            )}
          </div>
        )}
      </div>

      {/* ÁREA DO MEMBRO SELECIONADO */}
      {membroAtual && (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              {membroAtual.name} <span className="font-normal text-gray-500">- {membroAtual.team_name}</span>
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row bg-gray-100">
            <button onClick={() => handleTabChange('PENDENTE')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'PENDENTE' ? 'bg-[#15665a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              Histórico de Compras Pendentes
            </button>
            <button onClick={() => handleTabChange('PAGO')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'PAGO' ? 'bg-[#15665a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              Histórico de Compras Pagas
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[400px] bg-[#e5e9e5]/30">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-gray-200 shadow-sm z-10">
                <tr className="text-gray-700">
                  {activeTab === 'PENDENTE' && (
                    <th className="py-3 px-4 w-12 text-center border-b border-gray-300">
                      <input type="checkbox" className="w-4 h-4 accent-[#15665a] cursor-pointer" checked={comprasVisiveisAgrupadas.length > 0 && selectedItems.length === comprasVisiveisAgrupadas.length} onChange={handleToggleAll} />
                    </th>
                  )}
                  {activeTab === 'PAGO' && <th className="py-3 px-4 w-12 border-b border-gray-300"></th>}
                  <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Data</th>
                  <th className="py-3 px-4 text-sm font-bold border-b border-gray-300">Produto</th>
                  <th className="py-3 px-4 text-sm font-bold text-center border-b border-gray-300">Quantidade</th>
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
                    ) : (
                      <td className="py-3 px-4"></td>
                    )}
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
                Nenhum registro de compra encontrado para esta aba.
              </div>
            )}
          </div>

          <div className="bg-white p-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-end gap-6 mt-auto">
            <div className="space-y-1 w-full md:w-auto">
              <p className="text-lg text-gray-800"><span className="font-semibold">Total Pago:</span> <span className="font-bold text-[#15665a]">{formatCurrency(totais.pago)}</span></p>
              {activeTab === 'PENDENTE' && (
                <>
                  <p className="text-lg text-gray-800"><span className="font-semibold">Total Selecionado:</span> {formatCurrency(totais.selecionado)}</p>
                  <p className="text-lg text-gray-800"><span className="font-semibold">Total Pendente:</span> <span className="text-red-600 font-bold">{formatCurrency(totais.pendente)}</span></p>
                </>
              )}
            </div>

            {activeTab === 'PENDENTE' && (
              <button onClick={handleQuitarPendencia} disabled={selectedItems.length === 0} className="w-full md:w-auto bg-[#1a7f71] hover:bg-[#15665a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-all shadow-md text-sm md:text-base uppercase tracking-wide">
                Quitar Pendência Selecionada ({formatCurrency(totais.selecionado)})
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}