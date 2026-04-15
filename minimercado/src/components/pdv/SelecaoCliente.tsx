import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Equipe, Membro } from './types';

interface SelecaoClienteProps {
  equipes: Equipe[];
  membros: Membro[];
  selectedTeam: Equipe | null;
  setSelectedTeam: (t: Equipe | null) => void;
  selectedMember: Membro | null;
  setSelectedMember: (m: Membro | null) => void;
}

export default function SelecaoCliente({ equipes, membros, selectedTeam, setSelectedTeam, selectedMember, setSelectedMember }: SelecaoClienteProps) {
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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleção de Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="relative" ref={teamRef}>
          <button type="button" onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#0D9488]">
            <span className="truncate">{selectedTeam ? selectedTeam.name : 'Selecione a Equipe...'}</span>
            <svg className={`w-4 h-4 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isTeamDropdownOpen && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {equipes.map(t => (
                <div key={t.id} onClick={() => { setSelectedTeam(t); setSelectedMember(null); setIsTeamDropdownOpen(false); }} className="px-3 py-2 hover:bg-[#0D9488] hover:text-white cursor-pointer text-sm">
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={memberRef}>
          <button type="button" disabled={!selectedTeam} onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white flex justify-between items-center focus:ring-2 focus:ring-[#0D9488] disabled:bg-gray-50 disabled:text-gray-400">
            <span className="truncate">{selectedMember ? selectedMember.name : 'Selecione o Integrante...'}</span>
            <svg className={`w-4 h-4 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isMemberDropdownOpen && selectedTeam && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {membrosFiltrados.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">Nenhum integrante encontrado.</div>
              ) : (
                membrosFiltrados.map(m => (
                  <div key={m.id} onClick={() => { setSelectedMember(m); setIsMemberDropdownOpen(false); }} className="px-3 py-2 hover:bg-[#0D9488] hover:text-white cursor-pointer text-sm">
                    {m.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}