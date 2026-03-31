'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';

// 🟢 1. IMPORTANDO AS FUNÇÕES DO SEU BACKEND
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '@/src/Server/controllers/TeamController';

interface Equipe {
  id: number;
  name: string;
  color: string;
  memberCount?: number; 
}

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipeEmEdicao, setEquipeEmEdicao] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#0D9488'); 

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<Equipe | null>(null);

  // =========================================================================
  // 1. BUSCAR EQUIPES (Conectado ao Backend)
  // =========================================================================
  const buscarEquipes = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTeams() as any;
      
      console.log("🔎 Resposta exata do Backend:", response);

      if (response?.success) {
        
        let listaBruta = [];

        // 🛡️ O FUNIL EXATO (Baseado no seu Print):
        if (response.data && Array.isArray(response.data.team)) {
          // Se vier empacotado no controller: { success: true, data: { team: [...] } }
          listaBruta = response.data.team; 
        } 
        else if (Array.isArray(response.team)) {
          // Se vier direto: { success: true, team: [...] }
          listaBruta = response.team;
        } 
        else if (Array.isArray(response.data)) {
          // Fallback caso o backend mude futuramente para mandar a lista direto em data
          listaBruta = response.data;
        }

        // Fazemos o map com segurança absoluta!
        const formatadas = listaBruta.map((e: any) => ({
          id: e.id,
          name: e.name,
          color: e.color,
          memberCount: e.member?.[0]?.count || e.memberCount || 0 
        }));
        
        setEquipes(formatadas);

      } else {
        console.error("Erro ao buscar do backend:", response?.message);
      }
    } catch (error) {
      console.error("Erro fatal ao buscar equipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarEquipes();
  }, []);

  // =========================================================================
  // 2. SALVAR EQUIPE (Conectado ao Backend)
  // =========================================================================
  const handleSalvarEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('name', novoNome);
      formData.append('color', novaCor);

      let response;

      if (equipeEmEdicao !== null) {
        formData.append('id', equipeEmEdicao.toString());
        response = await updateTeam(formData);
      } else {
        response = await createTeam(formData);
      }
      
      if (!response.success) {
        alert("Erro retornado pelo servidor: " + response.message);
        return;
      }

      await buscarEquipes(); 
      setIsModalOpen(false);
      setNovoNome('');
      setEquipeEmEdicao(null);

    } catch (error) {
      alert("Erro de conexão ao salvar a equipe.");
      console.error(error);
    }
  };

  // =========================================================================
  // 3. EXCLUIR EQUIPE (Conectado ao Backend)
  // =========================================================================
  const confirmarExclusao = async () => {
    if (!equipeParaExcluir) return;

    if (equipeParaExcluir.memberCount && equipeParaExcluir.memberCount > 0) {
      alert(`⚠️ Ação Negada: A equipe "${equipeParaExcluir.name}" possui integrantes ativos. Para excluí-la, remova todos os integrantes primeiro.`);
      setIsDeleteModalOpen(false);
      setEquipeParaExcluir(null);
      return;
    }

    try {
<<<<<<< HEAD
      const response = await deleteTeam( equipeParaExcluir.id);
=======
      const response = await deleteTeam(equipeParaExcluir.id);
>>>>>>> c5dc8ace440e2dd2e6bc16856145050e6c4ed5ce
      
      if (response.success === false || response.sucess === false) {
         alert("Erro ao excluir: " + response.message);
         return;
      }

      setEquipes(equipes.filter(e => e.id !== equipeParaExcluir.id));
      setIsDeleteModalOpen(false);
      setEquipeParaExcluir(null);

    } catch (error) {
      console.error("Erro ao excluir equipe:", error);
      alert("Erro técnico ao tentar excluir. Tente novamente.");
    }
  };

  return (
  <div className="space-y-6 relative">
     <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Equipes</h1>
          <p className="text-gray-500 text-sm mt-1">Visualize e organize as equipes do Minimercado.</p>
        </div>
        <ButtonSistema type="button" variant="primary" onClick={() => { setEquipeEmEdicao(null); setNovoNome(''); setIsModalOpen(true); }} className="gap-2">
          <span className="text-xl leading-none">+</span> Nova Equipe
        </ButtonSistema>
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-4">
        {isLoading ? (
          <p className="text-gray-400 animate-pulse">Carregando...</p>
        ) : equipes.map((equipe) => (
          <div key={equipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col hover:-translate-y-1 group">
            
            <Link href={`/admin/equipes/${equipe.id}`} className="block cursor-pointer">
              <div 
                className="px-4 py-4 flex justify-center items-center text-center min-h-[4rem] group-hover:brightness-95 transition-all" 
                style={{ backgroundColor: equipe.color }}
              >
                <h3 className="font-bold text-white text-lg tracking-wide">{equipe.name}</h3>
              </div>

            <div className="p-4 flex flex-col items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Integrantes</p>
                  <p className="text-3xl font-bold text-gray-700 leading-none group-hover:text-[#0D9488] transition-colors">
                    {equipe.memberCount}
                  </p>
                </div>
              </div>
            </Link>

            <div className="px-4 pb-4 bg-white">
              <div className="w-full h-px bg-gray-100 mb-3"></div>
            <div className="flex items-center justify-center gap-4 w-full relative z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setEquipeEmEdicao(equipe.id);
                    setNovoNome(equipe.name);
                    setNovaCor(equipe.color);
                    setIsModalOpen(true);
                  }} 
                  className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                >
                  🖌️ Editar
                </button>
              <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEquipeParaExcluir(equipe); 
                    setIsDeleteModalOpen(true); 
                  }} 
                  className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
         </div>
        ))}
    </div>

      {/* MODAL SALVAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#0D9488] px-6 py-4 font-bold text-white">
              {equipeEmEdicao !== null ? 'Editar Equipe' : 'Nova Equipe'}
          </div>
            <form onSubmit={handleSalvarEquipe} className="p-6 space-y-4">
              <input type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]" />
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <input type="color" value={novaCor} onChange={(e) => setNovaCor(e.target.value)} className="w-10 h-10 cursor-pointer" />
                <span className="text-xs text-gray-500">Cor da equipe</span>
            </div>
              <div className="flex justify-end gap-3 pt-4">
                <ButtonSistema type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</ButtonSistema>
                <ButtonSistema type="submit" variant="primary">Salvar</ButtonSistema>
              </div>
            </form>
        </div>
        </div>
      )}

      {/* MODAL EXCLUIR */}
      {isDeleteModalOpen && equipeParaExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm shadow-2xl">
            {equipeParaExcluir.memberCount && equipeParaExcluir.memberCount > 0 ? (
              <>
                <div className="text-amber-500 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">Equipe Ocupada</h2>
                <p className="text-sm text-gray-600 mb-6">
                  A equipe <strong>{equipeParaExcluir.name}</strong> possui <strong>{equipeParaExcluir.memberCount} integrantes</strong>. 
                  Não é permitido excluir equipes com membros ativos.
                </p>
                <ButtonSistema type="button" variant="primary" onClick={() => setIsDeleteModalOpen(false)} className="w-full">
                  Entendi
                </ButtonSistema>
              </>
            ) : (
              <>
                <div className="text-red-500 text-4xl mb-4">🗑️</div>
                <h2 className="text-xl font-bold mb-2">Excluir Equipe</h2>
                <p className="text-sm text-gray-600 mb-6">Deseja excluir a equipe <strong>{equipeParaExcluir.name}</strong>?</p>
                <div className="flex justify-center gap-3">
                  <ButtonSistema type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</ButtonSistema>
                  <ButtonSistema type="button" variant="danger" onClick={confirmarExclusao}>Sim, Excluir</ButtonSistema>
                </div>
              </>
            )}
          </div>
        </div>
      )}
  </div>
  );
}