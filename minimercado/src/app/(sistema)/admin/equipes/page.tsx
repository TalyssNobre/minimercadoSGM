'use client';
import React, { useState } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// Subcomponentes
import GridEquipes from '@/src/components/equipes/GridEquipes';
import ModalSalvarEquipe from '@/src/components/equipes/ModalSalvarEquipe';
import ModalExcluirEquipe from '@/src/components/equipes/ModalExcluirEquipe';

// Lógica e Tipos
import { useEquipes } from '@/src/components/equipes/hooks/useEquipes';
import { Equipe } from '@/src/components/equipes/types';

export default function EquipesPage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const equipeData = useEquipes(exibirAlerta);

  // Estados de controle da UI (Modais)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipeEmEdicao, setEquipeEmEdicao] = useState<Equipe | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<Equipe | null>(null);

  const handleAbrirCriacao = () => {
    setEquipeEmEdicao(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (equipe: Equipe) => {
    setEquipeEmEdicao(equipe);
    setIsModalOpen(true);
  };

  const handleAbrirExclusao = (equipe: Equipe) => {
    setEquipeParaExcluir(equipe);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 relative py-4 max-w-7xl mx-auto">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Equipes</h1>
          <p className="text-gray-500 text-sm mt-1">Visualize e organize as equipes do Minimercado.</p>
        </div>
        <ButtonSistema type="button" variant="primary" onClick={handleAbrirCriacao} className="gap-2">
          <span className="text-xl leading-none">+</span> Nova Equipe
        </ButtonSistema>
      </div>

      {/* COMPONENTES MODULARES */}
      <GridEquipes 
        equipes={equipeData.equipes} 
        isLoading={equipeData.isLoading}
        onEdit={handleAbrirEdicao}
        onDelete={handleAbrirExclusao}
      />

      {/* MODAIS */}
      <ModalSalvarEquipe 
        isOpen={isModalOpen}
        equipeOriginal={equipeEmEdicao}
        onClose={() => { setIsModalOpen(false); setEquipeEmEdicao(null); }}
        onSave={equipeData.salvarEquipe}
      />

      <ModalExcluirEquipe 
        isOpen={isDeleteModalOpen}
        equipe={equipeParaExcluir}
        onClose={() => { setIsDeleteModalOpen(false); setEquipeParaExcluir(null); }}
        onConfirm={equipeData.excluirEquipe}
      />

      <ModalAlerta 
        isOpen={modalAlerta.isOpen}
        mensagem={modalAlerta.mensagem}
        tipo={modalAlerta.tipo}
        onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
      />
    </div>
  );
}