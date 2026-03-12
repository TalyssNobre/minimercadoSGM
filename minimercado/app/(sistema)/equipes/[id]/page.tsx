'use client';
import React, { use, useState } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/components/ui/ButtonSistema';

export default function IntegrantesPage({ params }: { params: Promise<{ id: string }> }) {
  // O Next.js 14/15 usa o hook 'use' para desempacotar params dinâmicos
  const { id: equipeId } = use(params); 

  // =========================================================================
  // ESTADOS PRINCIPAIS (Alinhado com a tabela Member do DER)
  // =========================================================================
  const [membros, setMembros] = useState<{ member_id: number; team_id: number; name: string }[]>([]);

  // =========================================================================
  // ESTADOS DOS MODAIS
  // =========================================================================
  // Modal de Criação/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membroEmEdicao, setMembroEmEdicao] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');

  // 🟢 Modal de Exclusão (Novo)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState<{ member_id: number; name: string } | null>(null);

  // =========================================================================
  // FUNÇÕES DE AÇÃO
  // =========================================================================
  const handleAbrirModalNovo = () => {
    setMembroEmEdicao(null);
    setNovoNome('');
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (membro: { member_id: number, name: string }) => {
    setMembroEmEdicao(membro.member_id);
    setNovoNome(membro.name);
    setIsModalOpen(true);
  };

  const handleSalvarMembro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    // TODO: Conectar com Supabase (INSERT / UPDATE na tabela Member)
    if (membroEmEdicao !== null) {
      const listaAtualizada = membros.map(membro => 
        membro.member_id === membroEmEdicao ? { ...membro, name: novoNome } : membro
      );
      setMembros(listaAtualizada);
    } else {
      // Cria um novo membro e já vincula o team_id da URL
      const novoMembro = { 
        member_id: Date.now(), 
        team_id: Number(equipeId), 
        name: novoNome 
      };
      setMembros([...membros, novoMembro]);
    }
    setNovoNome('');
    setMembroEmEdicao(null);
    setIsModalOpen(false);
  };

  // 🟢 Funções do Modal de Exclusão
  const handleAbrirExclusao = (membro: { member_id: number; name: string }) => {
    setMembroParaExcluir(membro);
    setIsDeleteModalOpen(true);
  };

  const confirmarExclusao = () => {
    if (membroParaExcluir) {
      // TODO: Conectar com Supabase (DELETE na tabela Member)
      const listaAtualizada = membros.filter(membro => membro.member_id !== membroParaExcluir.member_id);
      setMembros(listaAtualizada);
      
      setIsDeleteModalOpen(false);
      setMembroParaExcluir(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* CABEÇALHO */}
      <div>
        <Link href="/equipes" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#0D9488] transition-colors mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para Equipes
        </Link>
        
        <div className="flex justify-between items-end border-b pb-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Integrantes da Equipe <span className="text-[#0D9488]">#{equipeId}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie as pessoas alocadas neste grupo.</p>
          </div>
          
          <ButtonSistema type="button" variant="primary" onClick={handleAbrirModalNovo} className="gap-2">
            <span className="text-xl leading-none">+</span> Novo Integrante
          </ButtonSistema>
        </div>
      </div>

      {/* LISTA DE INTEGRANTES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
        {membros.map((membro) => (
          <div key={membro.member_id} className="bg-white rounded-lg shadow-sm border border-[#0D9488]/30 overflow-hidden flex flex-col hover:border-[#0D9488] transition-colors">
            
            <div className="py-3 px-2 flex-grow flex items-center justify-center text-center">
              <span className="text-gray-800 font-medium text-sm">{membro.name}</span>
            </div>

            <div className="border-t border-gray-100 p-1.5 flex justify-end gap-2 bg-gray-50/50">
              <button 
                onClick={() => handleAbrirModalEditar(membro)}
                className="text-[#0D9488] hover:text-[#0F766E] transition-colors p-1"
                title="Editar integrante"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.158 3.71 3.71 1.159-1.157a2.625 2.625 0 000-3.711z" /><path d="M10.75 4.365a8.25 8.25 0 00-1.41 1.41M19.635 13.25a8.25 8.25 0 01-1.41 1.41" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.93z" /></svg>
              </button>
              
              <button 
                onClick={() => handleAbrirExclusao(membro)} // 🟢 Agora abre o modal de confirmação
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Excluir integrante"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ESTADO VAZIO */}
      {membros.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhum integrante ainda</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Esta equipe está vazia. Clique no botão acima para começar a adicionar os funcionários.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL MISTO (CRIAR E EDITAR) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#0D9488] px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {membroEmEdicao !== null ? 'Editar Integrante' : 'Adicionar Novo Integrante'}
              </h2>
            </div>
            
            <form onSubmit={handleSalvarMembro} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Integrante</label>
                <input 
                  type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Digite o nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <ButtonSistema type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</ButtonSistema>
                <ButtonSistema type="submit" variant="primary">Salvar</ButtonSistema>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && membroParaExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir Integrante</h2>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir o integrante <strong>{membroParaExcluir.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3">
              <ButtonSistema type="button" variant="outline" onClick={() => { setIsDeleteModalOpen(false); setMembroParaExcluir(null); }}>Cancelar</ButtonSistema>
              <ButtonSistema type="button" variant="danger" onClick={confirmarExclusao}>Sim, Excluir</ButtonSistema>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}