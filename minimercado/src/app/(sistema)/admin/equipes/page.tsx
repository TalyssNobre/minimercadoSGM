'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';

export default function EquipesPage() {
  // =========================================================================
  // ESTADOS PRINCIPAIS
  // =========================================================================
  const [equipes, setEquipes] = useState<{ team_id: number; name: string; color: string }[]>([]);

  // =========================================================================
  // ESTADOS DOS MODAIS
  // =========================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipeEmEdicao, setEquipeEmEdicao] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#0D9488'); 

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<{ team_id: number; name: string } | null>(null);

  // =========================================================================
  // FUNÇÕES DE AÇÃO
  // =========================================================================
  
  const handleAbrirModalNovo = () => {
    setEquipeEmEdicao(null);
    setNovoNome('');
    setNovaCor('#0D9488');
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (equipe: { team_id: number, name: string, color: string }, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEquipeEmEdicao(equipe.team_id);
    setNovoNome(equipe.name);
    setNovaCor(equipe.color);
    setIsModalOpen(true);
  };

  const handleSalvarEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    
    if (equipeEmEdicao !== null) {
      const listaAtualizada = equipes.map(equipe => 
        equipe.team_id === equipeEmEdicao ? { ...equipe, name: novoNome, color: novaCor } : equipe
      );
      setEquipes(listaAtualizada);
    } else {
      const novaEquipe = { team_id: Date.now(), name: novoNome, color: novaCor };
      setEquipes([...equipes, novaEquipe]);
    }
    
    setNovoNome('');
    setEquipeEmEdicao(null);
    setIsModalOpen(false);
  };

  const handleAbrirExclusao = (equipe: { team_id: number; name: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEquipeParaExcluir(equipe);
    setIsDeleteModalOpen(true);
  };

  const confirmarExclusao = () => {
    if (equipeParaExcluir) {
      const listaAtualizada = equipes.filter(equipe => equipe.team_id !== equipeParaExcluir.team_id);
      setEquipes(listaAtualizada);
      setIsDeleteModalOpen(false);
      setEquipeParaExcluir(null);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6 relative">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Equipes</h1>
          <p className="text-gray-500 text-sm mt-1">Visualize e cadastre as equipes do Minimercado.</p>
        </div>
        
        <ButtonSistema type="button" variant="primary" onClick={handleAbrirModalNovo} className="gap-2">
          <span className="text-xl leading-none">+</span> Nova Equipe
        </ButtonSistema>
      </div>

      {/* LISTA DE EQUIPES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-4">
        {equipes.map((equipe) => (
          <div key={equipe.team_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1">
            
            {/* 🟢 CORREÇÃO DO LINK: Adicionado o prefixo /admin */}
            <Link href={`/admin/equipes/${equipe.team_id}`} className="block cursor-pointer">
              {/* TOPO DO CARD */}
              <div 
                className="px-4 py-4 flex justify-center items-center text-center min-h-[4rem]" 
                style={{ backgroundColor: equipe.color }}
              >
                <h3 className="font-bold text-white text-lg tracking-wide break-words">
                  {equipe.name}
                </h3>
              </div>

              {/* CORPO DO CARD */}
              <div className="p-4 flex flex-col items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Integrantes</p>
                  <p className="text-3xl font-bold text-gray-700 leading-none group-hover:text-[#0D9488] transition-colors">0</p>
                </div>
              </div>
            </Link>

            <div className="px-4 pb-4 bg-white">
              <div className="w-full h-px bg-gray-100 mb-3"></div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex items-center justify-center gap-4 w-full relative z-10">
                <button 
                  onClick={(e) => handleAbrirModalEditar(equipe, e)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-colors"
                  title="Editar equipe"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                  Editar
                </button>
                
                <button 
                  onClick={(e) => handleAbrirExclusao(equipe, e)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                  title="Excluir equipe"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  Excluir
                </button>
              </div>
            </div>

          </div>
        ))}

        {equipes.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
            Nenhuma equipe cadastrada ainda. Clique em "Nova Equipe" para começar!
          </p>
        )}
      </div>

      {/* MODAL MISTO (CRIAR E EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden flex flex-col">
            
            <div className="bg-[#0D9488] px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {equipeEmEdicao !== null ? 'Editar Equipe' : 'Nova Equipe'}
              </h2>
            </div>
            
            <form onSubmit={handleSalvarEquipe} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Equipe</label>
                <input 
                  type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Escreva o nome da equipe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cor de Identificação</label>
                <div className="flex items-center gap-3 p-2.5 border border-gray-300 rounded-md bg-white">
                  <input 
                    type="color" value={novaCor} onChange={(e) => setNovaCor(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded-md cursor-pointer border-0 bg-white shadow-sm"
                  />
                  <span className="text-xs text-gray-600 font-medium">Clique na caixa ao lado para escolher um tom.</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <ButtonSistema type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</ButtonSistema>
                <ButtonSistema type="submit" variant="primary">
                  {equipeEmEdicao !== null ? 'Salvar Alterações' : 'Salvar Equipe'}
                </ButtonSistema>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {isDeleteModalOpen && equipeParaExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir Equipe</h2>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir a equipe <strong>{equipeParaExcluir.name}</strong>? Esta ação não pode ser desfeita e pode afetar os integrantes nela contidos.
            </p>
            <div className="flex justify-center gap-3">
              <ButtonSistema type="button" variant="outline" onClick={() => { setIsDeleteModalOpen(false); setEquipeParaExcluir(null); }}>Cancelar</ButtonSistema>
              <ButtonSistema type="button" variant="danger" onClick={confirmarExclusao}>Sim, Excluir</ButtonSistema>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}