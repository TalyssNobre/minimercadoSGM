import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Equipe, Membro } from './types';

interface Props {
  equipes: Equipe[];
  membros: Membro[];
  selectedTeam: Equipe | null;
  setSelectedTeam: (t: Equipe | null) => void;
  selectedMember: Membro | null;
  setSelectedMember: (m: Membro | null) => void;
  resetSelection: () => void;
}

export default function SelecaoClienteExtrato({ equipes, membros, selectedTeam, setSelectedTeam, selectedMember, setSelectedMember, resetSelection }: Props) {
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const teamRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (teamRef.current && !teamRef.current.contains(event.target as Node)) setIsTeamDropdownOpen(false);
      if (memberRef.current && !memberRef.current.contains(event.target as Node)) setIsMemberDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const membrosFiltrados = useMemo(() => {
    if (!selectedTeam) return [];
    return membros.filter(m => m.team_id === selectedTeam.id);
  }, [selectedTeam, membros]);

  return (
    <div className="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Selecione o Cliente para buscar o extrato</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropdown de Equipe */}
        <div className="relative" ref={teamRef}>
          <button type="button" onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)} className="w-full px-4 py-3 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#15665a] transition-all shadow-sm">
            <span className="truncate text-gray-700 font-medium">{selectedTeam ? selectedTeam.name : '1º - Selecione a Equipe'}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isTeamDropdownOpen && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {equipes.length === 0 ? <div className="px-4 py-3 text-sm text-gray-500">Carregando equipes...</div> : equipes.map(t => (
                <div key={t.id} onClick={() => { setSelectedTeam(t); setSelectedMember(null); setIsTeamDropdownOpen(false); resetSelection(); }} className="px-4 py-3 hover:bg-[#15665a] hover:text-white cursor-pointer text-sm border-b border-gray-50 last:border-0">{t.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown de Membro */}
        <div className="relative" ref={memberRef}>
          <button type="button" disabled={!selectedTeam} onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)} className="w-full px-4 py-3 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#15665a] transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
            <span className="truncate text-gray-700 font-medium">{selectedMember ? selectedMember.name : '2º - Selecione o Integrante'}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isMemberDropdownOpen && selectedTeam && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {membrosFiltrados.length === 0 ? <div className="px-4 py-3 text-sm text-gray-500">Nenhum integrante cadastrado.</div> : membrosFiltrados.map(m => (
                <div key={m.id} onClick={() => { setSelectedMember(m); setIsMemberDropdownOpen(false); resetSelection(); }} className="px-4 py-3 hover:bg-[#15665a] hover:text-white cursor-pointer text-sm border-b border-gray-50 last:border-0">{m.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}