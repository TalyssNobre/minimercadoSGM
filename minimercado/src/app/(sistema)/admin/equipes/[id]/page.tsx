'use client';
import React, { use, useState } from 'react';
import Link from 'next/link';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// Subcomponentes
import GridIntegrantes from '@/src/components/integrantes/GridIntegrantes';
import ModalSalvarIntegrante from '@/src/components/integrantes/ModalSalvarIntegrante';
import ModalExcluirIntegrante from '@/src/components/integrantes/ModalExcluirIntegrante';

// Cérebro e Tipos
import { useIntegrantes } from '@/src/components/integrantes/hooks/useIntegrantes';
import { Membro } from '@/src/components/integrantes/types';

export default function IntegrantesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const equipeId = Number(resolvedParams.id);

  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const integranteData = useIntegrantes(equipeId, exibirAlerta);

  // Estados de Controle UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membroEmEdicao, setMembroEmEdicao] = useState<Membro | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState<Membro | null>(null);

  const handleAbrirCriacao = () => {
    setMembroEmEdicao(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (membro: Membro) => {
    setMembroEmEdicao(membro);
    setIsModalOpen(true);
  };

  const handleAbrirExclusao = (membro: Membro) => {
    setMembroParaExcluir(membro);
    setIsDeleteModalOpen(true);
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
            Integrantes: <span className="text-[#0D9488]">{integranteData.nomeEquipe || `Carregando...`}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Lista de colaboradores ativos.</p>
        </div>
        <ButtonSistema type="button" variant="primary" onClick={handleAbrirCriacao} className="shadow-md active:scale-95">
          + Novo Integrante
        </ButtonSistema>
      </div>

      {/* COMPONENTES MODULARES */}
      <GridIntegrantes 
        membros={integranteData.membros} 
        isLoading={integranteData.isLoading}
        onEdit={handleAbrirEdicao}
        onDelete={handleAbrirExclusao}
      />

      {/* MODAIS */}
      <ModalSalvarIntegrante 
        isOpen={isModalOpen}
        membroOriginal={membroEmEdicao}
        onClose={() => { setIsModalOpen(false); setMembroEmEdicao(null); }}
        onSave={integranteData.salvarMembro}
      />

      <ModalExcluirIntegrante 
        isOpen={isDeleteModalOpen}
        membro={membroParaExcluir}
        onClose={() => { setIsDeleteModalOpen(false); setMembroParaExcluir(null); }}
        onConfirm={integranteData.excluirMembro}
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