import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Equipe } from './types';

interface Props {
  isOpen: boolean;
  equipe: Equipe | null;
  onClose: () => void;
  onConfirm: (equipe: Equipe) => Promise<boolean>;
}

export default function ModalExcluirEquipe({ isOpen, equipe, onClose, onConfirm }: Props) {
  if (!isOpen || !equipe) return null;

  const temIntegrantes = equipe.memberCount && equipe.memberCount > 0;

  const handleConfirm = async () => {
    if (temIntegrantes) return;
    const sucesso = await onConfirm(equipe);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 text-center max-w-sm shadow-2xl">
        {temIntegrantes ? (
          <>
            <div className="text-amber-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Equipe Ocupada</h2>
            <p className="text-sm text-gray-600 mb-6">
              A equipe <strong>{equipe.name}</strong> possui <strong>{equipe.memberCount} integrantes</strong>. 
              Não é permitido excluir equipes com membros ativos.
            </p>
            <ButtonSistema type="button" variant="primary" onClick={onClose} className="w-full">
              Entendi
            </ButtonSistema>
          </>
        ) : (
          <>
            <div className="text-red-500 text-4xl mb-4">🗑️</div>
            <h2 className="text-xl font-bold mb-2">Excluir Equipe</h2>
            <p className="text-sm text-gray-600 mb-6">Deseja excluir a equipe <strong>{equipe.name}</strong>?</p>
            <div className="flex justify-center gap-3">
              <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
              <ButtonSistema type="button" variant="danger" onClick={handleConfirm}>Sim, Excluir</ButtonSistema>
            </div>
          </>
        )}
      </div>
    </div>
  );
}