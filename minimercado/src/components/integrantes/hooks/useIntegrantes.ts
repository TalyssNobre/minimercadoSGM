import { useState, useEffect } from 'react';
import { getAllMember, createMember, updateMember, deleteMember } from '@/src/Server/controllers/MemberController';
import { getTeamById } from '@/src/Server/controllers/TeamController'; 
import { Membro } from '../types';

export function useIntegrantes(equipeId: number, exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDados = async () => {
    if (isNaN(equipeId)) return;
    setIsLoading(true);
    
    try {
      const teamResponse = await getTeamById(equipeId) as any;
      if (teamResponse?.success && teamResponse?.data) {
        setNomeEquipe(teamResponse.data.name || teamResponse.data.team?.name || '');
      }

      const membersResponse = await getAllMember() as any;
      if (membersResponse?.success) {
        let listaBruta = [];
        if (membersResponse.data && Array.isArray(membersResponse.data.member)) listaBruta = membersResponse.data.member;
        else if (membersResponse.data && Array.isArray(membersResponse.data.data)) listaBruta = membersResponse.data.data;
        else if (Array.isArray(membersResponse.data)) listaBruta = membersResponse.data;

        const membrosDestaEquipe = listaBruta.filter((m: any) => m.team_id === equipeId);
        setMembros(membrosDestaEquipe.map((m: any) => ({ id: m.id, name: m.name, team_id: m.team_id })));
      }
    } catch (error) {
      exibirAlerta("Erro ao carregar dados da equipe.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDados(); 
  }, [equipeId]);

  const salvarMembro = async (id: number | null, nome: string) => {
    try {
      const formData = new FormData();
      formData.append('name', nome);
      formData.append('team_id', equipeId.toString());

      let response;
      if (id !== null) {
        formData.append('id', id.toString());
        response = await updateMember(formData) as any;
      } else {
        response = await createMember(formData) as any;
      }

      if (response?.success === false || response?.sucess === false) {
        exibirAlerta("Erro retornado pelo servidor: " + (response.message || "Erro desconhecido"), 'error');
        return false;
      }

      await fetchDados();
      exibirAlerta(id !== null ? "Integrante atualizado!" : "Integrante adicionado!", 'success');
      return true;

    } catch (error) {
      exibirAlerta("Erro de conexão ao salvar!", 'error');
      return false;
    }
  };

  const excluirMembro = async (id: number) => {
    try {
      const response = await deleteMember(id) as any;
      if (response?.success === false || response?.sucess === false) {
         exibirAlerta("Erro ao excluir: " + response.message, 'error');
         return false;
      }
      await fetchDados();
      exibirAlerta("Integrante removido com sucesso!", 'success');
      return true;
    } catch (error) {
      exibirAlerta("Erro técnico ao excluir.", 'error');
      return false;
    }
  };

  return { membros, nomeEquipe, isLoading, salvarMembro, excluirMembro };
}