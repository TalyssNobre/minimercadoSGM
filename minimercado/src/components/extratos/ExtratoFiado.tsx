'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';

// 🟢 IMPORTANDO AS FUNÇÕES QUE JÁ EXISTEM NO SEU BACKEND
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';

// =========================================================================
// INTERFACES (Atualizadas para o padrão real do Banco)
// =========================================================================
interface Equipe {
  id: number;
  name: string;
}

interface Membro {
  id: number;
  team_id: number;
  name: string;
}

interface LinhaHistorico {
  id_linha: number; 
  member_id: number;
  date: string; 
  product_name: string; 
  category_name: string; 
  quantity: number; 
  price: number; 
  status: 'PENDENTE' | 'PAGO'; 
}

export default function ExtratoFiado() {
  // =========================================================================
  // ESTADOS PRINCIPAIS
  // =========================================================================
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [historicoBruto, setHistoricoBruto] = useState<LinhaHistorico[]>([]);

  // 🟢 ESTADOS DO NOVO SELETOR (Idêntico ao PDV)
  const [selectedTeam, setSelectedTeam] = useState<Equipe | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 🟢 BUSCA DE EQUIPES E MEMBROS AO CARREGAR A PÁGINA
  useEffect(() => {
    async function fetchDados() {
      try {
        const [teamsResp, membersResp] = await Promise.all([
          getAllTeams() as any,
          getAllMember() as any
        ]);

        if (teamsResp?.success) setEquipes(teamsResp.data || teamsResp.team || []);
        if (membersResp?.success) setMembros(membersResp.data || membersResp.member || []);
      } catch (error) {
        console.error("Erro ao carregar equipes e membros:", error);
      }
    }
    fetchDados();
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (teamRef.current && !teamRef.current.contains(event.target as Node)) setIsTeamDropdownOpen(false);
      if (memberRef.current && !memberRef.current.contains(event.target as Node)) setIsMemberDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================================
  // LÓGICA DE DADOS E AGRUPAMENTO
  // =========================================================================
  
  // 🟢 Filtra os membros baseado na equipe selecionada
  const membrosFiltrados = useMemo(() => {
    if (!selectedTeam) return [];
    return membros.filter(m => m.team_id === selectedTeam.id);
  }, [selectedTeam, membros]);

  // Mantém a compatibilidade com a sua lógica original
  const selectedMemberId = selectedMember ? selectedMember.id.toString() : '';

  const comprasVisiveisAgrupadas = useMemo(() => {
    if (!selectedMemberId) return [];

    const comprasBrutas = historicoBruto.filter(
      item => item.member_id.toString() === selectedMemberId && item.status === activeTab
    );

    const agrupado = comprasBrutas.reduce((acc: any, curr) => {
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
  // FUNÇÕES DE AÇÃO DA TABELA
  // =========================================================================
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
      
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">Extratos e Baixa de Fiado</h2>
      
      {/* 🟢 SELEÇÃO DE EQUIPE E CLIENTE (Idêntica ao PDV) */}
      <div className="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Selecione o Cliente para buscar o extrato</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={teamRef}>
            <button 
              type="button"
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#15665a] transition-all shadow-sm"
            >
              <span className="truncate text-gray-700 font-medium">
                {selectedTeam ? selectedTeam.name : '1º - Selecione a Equipe'}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isTeamDropdownOpen && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {equipes.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Carregando equipes...</div>
                ) : (
                  equipes.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => { 
                        setSelectedTeam(t); 
                        setSelectedMember(null); 
                        setIsTeamDropdownOpen(false); 
                        setSelectedItems([]); 
                      }}
                      className="px-4 py-3 hover:bg-[#15665a] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0"
                    >
                      {t.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={memberRef}>
            <button 
              type="button"
              disabled={!selectedTeam}
              onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#15665a] transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span className="truncate text-gray-700 font-medium">
                {selectedMember ? selectedMember.name : '2º - Selecione o Integrante'}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isMemberDropdownOpen && selectedTeam && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {membrosFiltrados.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Nenhum integrante cadastrado nesta equipe.</div>
                ) : (
                  membrosFiltrados.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => { 
                        setSelectedMember(m); 
                        setIsMemberDropdownOpen(false); 
                        setSelectedItems([]); 
                      }}
                      className="px-4 py-3 hover:bg-[#15665a] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0"
                    >
                      {m.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ÁREA DO MEMBRO SELECIONADO (Só aparece se a pessoa selecionar alguém) */}
      {selectedMember && selectedTeam && (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              {selectedMember.name} <span className="font-normal text-gray-500">- {selectedTeam.name}</span>
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
                {historicoBruto.length === 0 ? "Aguardando backend carregar o histórico..." : "Nenhum registro de compra encontrado para esta aba."}
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