'use client';
import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';

// 🟢 1. IMPORTANDO AS FUNÇÕES DO SEU BACKEND
import { getAllMember, createMember, updateMember, deleteMember } from '@/src/Server/controllers/MemberController';
import { getTeamById } from '@/src/Server/controllers/TeamController'; 

interface Membro {
  id: number;
  name: string;
  team_id: number;
}

export default function IntegrantesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const equipeIdRaw = resolvedParams.id; 
  const equipeId = Number(equipeIdRaw);

  const [membros, setMembros] = useState<Membro[]>([]);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membroEmEdicao, setMembroEmEdicao] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState<Membro | null>(null);

  // =========================================================================
  // 1. BUSCAR DADOS (Equipe e Membros)
  // =========================================================================
  const fetchDados = async () => {
    if (isNaN(equipeId)) return;
    setIsLoading(true);
    
    try {
      // 🟢 Busca do time mantida sem chaves (Padrão Novo)
      const teamResponse = await getTeamById(equipeId) as any;
      
      if (teamResponse?.success && teamResponse?.data) {
        const name = teamResponse.data.name || teamResponse.data.team?.name;
        if (name) setNomeEquipe(name);
      }

      const membersResponse = await getAllMember() as any;
      
      if (membersResponse?.success) {
        let listaBruta = [];

        if (membersResponse.data && Array.isArray(membersResponse.data.member)) {
          listaBruta = membersResponse.data.member;
        } else if (membersResponse.data && Array.isArray(membersResponse.data.data)) {
          listaBruta = membersResponse.data.data;
        } else if (Array.isArray(membersResponse.data)) {
          listaBruta = membersResponse.data;
        }

        const membrosDestaEquipe = listaBruta.filter((m: any) => m.team_id === equipeId);

        const formatadas = membrosDestaEquipe.map((m: any) => ({
          id: m.id,
          name: m.name,
          team_id: m.team_id
        }));
        
        setMembros(formatadas);
      } else {
        console.error("Erro ao buscar membros:", membersResponse?.message);
      }

    } catch (error) {
      console.error("Erro fatal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDados(); 
  }, [equipeId]);

  // =========================================================================
  // 2. SALVAR MEMBRO (Criar ou Atualizar)
  // =========================================================================
  const handleSalvarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    
    try {
      // 🟢 FormData envia tudo exatamente como o seu Controller pediu
      const formData = new FormData();
      formData.append('name', novoNome);
      formData.append('team_id', equipeId.toString());

      let response;

      if (membroEmEdicao !== null) {
        // Envia o ID na edição para o backend saber quem atualizar
        formData.append('id', membroEmEdicao.toString());
        response = await updateMember(formData);
      } else {
        response = await createMember(formData);
      }

      if (!response?.success && !(response as any)?.sucess) {
        alert("Erro retornado pelo servidor: " + (response?.message || "Erro desconhecido"));
        return;
      }

      setNovoNome('');
      setMembroEmEdicao(null);
      setIsModalOpen(false);
      
      fetchDados();

    } catch (error) {
      alert("Erro de conexão ao salvar!");
      console.error(error);
    }
  };

  // =========================================================================
  // 3. EXCLUIR MEMBRO
  // =========================================================================
  const confirmarExclusao = async () => {
    if (!membroParaExcluir) return;
    try {
      // 🟢 Deletando pelo novo padrão: ID solto, sem chaves!
      const response = await deleteMember(membroParaExcluir.id);
      
      if (response?.success === false || (response as any)?.sucess === false) {
         alert("Erro ao excluir: " + response.message);
         return;
      }

      setIsDeleteModalOpen(false);
      setMembroParaExcluir(null);
      
      fetchDados();

    } catch (error) {
      console.error(error);
      alert("Erro técnico ao excluir.");
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* VOLTAR */}
      <Link href="/admin/equipes" className="group inline-flex items-center text-gray-400 hover:text-[#0D9488] text-sm font-bold transition-all">
        <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Voltar para Equipes
      </Link>
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Integrantes: <span className="text-[#0D9488]">{nomeEquipe || `Carregando...`}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Lista de colaboradores ativos.</p>
        </div>
        <ButtonSistema type="button" variant="primary" onClick={() => { setMembroEmEdicao(null); setNovoNome(''); setIsModalOpen(true); }} className="shadow-md active:scale-95">
          + Novo Integrante
        </ButtonSistema>
      </div>

      {/* GRID DE INTEGRANTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-8">
        {isLoading ? (
          <p className="animate-pulse text-gray-400 font-medium col-span-full">Carregando dados...</p>
        ) : (
          membros.map((membro) => (
            <div key={membro.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center transition-all duration-300 hover:shadow-lg hover:border-[#0D9488]/20 group">
              <span className="text-gray-700 font-bold text-sm uppercase block mb-5 min-h-[1.25rem] tracking-wide">
                {membro.name}
              </span>
              
              <div className="flex justify-center gap-3 border-t pt-4">
                 <button 
                   onClick={() => { setMembroEmEdicao(membro.id); setNovoNome(membro.name); setIsModalOpen(true); }}
                   className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 
                              hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-90"
                   title="Editar"
                 >
                   <span className="text-lg">🖌️</span>
                 </button>

                 <button 
                   onClick={() => { setMembroParaExcluir(membro); setIsDeleteModalOpen(true); }}
                   className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-500 transition-all duration-200 
                              hover:bg-red-600 hover:text-white hover:scale-110 active:scale-90"
                   title="Excluir"
                 >
                   <span className="text-lg">🗑️</span>
                 </button>
              </div>
            </div>
          ))
        )}

        {!isLoading && membros.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Nenhum integrante cadastrado nesta equipe.</p>
            <p className="text-gray-400 text-xs mt-1">Clique no botão acima para adicionar.</p>
          </div>
        )}
      </div>

      {/* MODAL SALVAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#0D9488] p-5 text-white font-bold text-center text-lg">
              {membroEmEdicao ? 'Editar' : 'Novo'} Integrante
            </div>
            <form onSubmit={handleSalvarMembro} className="p-6 space-y-5">
              <input 
                autoFocus
                type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#0D9488] transition-all font-medium"
              />
              <div className="flex justify-end gap-3">
                <ButtonSistema type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</ButtonSistema>
                <ButtonSistema type="submit" variant="primary">Confirmar</ButtonSistema>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR */}
      {isDeleteModalOpen && membroParaExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 border border-red-50">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">⚠️</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Excluir?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
              Você removerá <strong>{membroParaExcluir.name}</strong> definitivamente desta equipe.
            </p>
            <div className="flex flex-col gap-2">
              <ButtonSistema type="button" variant="danger" onClick={confirmarExclusao} className="w-full py-3 rounded-xl font-bold">
                Sim, Excluir
              </ButtonSistema>
              <ButtonSistema type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 border-none text-gray-400 hover:text-gray-600">
                Cancelar
              </ButtonSistema>
            </div>
          </div>
        </div>
      )}
  </div>
  );
}