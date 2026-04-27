import { useState, useEffect } from 'react';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '@/src/Server/controllers/TeamController';
import { Equipe } from '../types';

export function useEquipes(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buscarEquipes = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTeams() as any;
      
      if (response?.success) {
        let listaBruta = [];
        if (Array.isArray(response.data)) listaBruta = response.data;
        else if (response.data && Array.isArray(response.data.team)) listaBruta = response.data.team; 
        else if (Array.isArray(response.team)) listaBruta = response.team;

        const formatadas = listaBruta.map((e: any) => ({
          id: e.id,
          name: e.name,
          color: e.color,
          memberCount: e.member?.[0]?.count || e.memberCount || 0 
        }));
        
        setEquipes(formatadas);
      } else {
        exibirAlerta("Erro ao buscar dados do servidor.", 'error');
      }
    } catch (error) {
      exibirAlerta("Erro fatal ao buscar equipes.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarEquipes();
  }, []);

  const salvarEquipe = async (id: number | null, nome: string, cor: string) => {
    try {
      const formData = new FormData();
      formData.append('name', nome);
      formData.append('color', cor);

      let response;
      if (id !== null) {
        formData.append('id', id.toString());
        response = await updateTeam(formData) as any;
      } else {
        response = await createTeam(formData) as any;
      }
      
      if (response?.success === false || response?.sucess === false) {
        exibirAlerta("Atenção: " + response.message, 'error');
        return false;
      }

      await buscarEquipes(); 
      exibirAlerta(id !== null ? "Equipe atualizada!" : "Equipe criada com sucesso!", 'success');
      return true;

    } catch (error) {
      exibirAlerta("Erro de conexão ao salvar a equipe.", 'error');
      return false;
    }
  };

const excluirEquipe = async (equipe: Equipe) => {
    try {
      const response = await deleteTeam(equipe.id) as any;
      if (!response || response.success === false || response.sucess === false) {
         const msgErro = response?.message || response?.error || "A equipe não pôde ser excluída. Verifique se há vínculos pendentes.";
         exibirAlerta("Erro ao excluir: " + msgErro, 'error');
         return false;
      }
      await buscarEquipes(); 
      exibirAlerta("Equipe excluída com sucesso!", 'success');
      return true;

   } catch (error: any) {
      exibirAlerta("Erro técnico ao tentar excluir: " + (error.message || "Falha na comunicação"), 'error');
      return false;
    }
  };

  return { equipes, isLoading, salvarEquipe, excluirEquipe };
}