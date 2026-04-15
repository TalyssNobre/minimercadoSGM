import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Membro } from './types';

interface Props {
  isOpen: boolean;
  membro: Membro | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
}

export default function ModalExcluirIntegrante({ isOpen, membro, onClose, onConfirm }: Props) {
  if (!isOpen || !membro) return null;

  const handleConfirm = async () => {
    const sucesso = await onConfirm(membro.id);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 border border-red-50">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">⚠️</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Excluir?</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
          Você removerá <strong>{membro.name}</strong> definitivamente desta equipe.
        </p>
        <div className="flex flex-col gap-2">
          <ButtonSistema type="button" variant="danger" onClick={handleConfirm} className="w-full py-3 rounded-xl font-bold">Sim, Excluir</ButtonSistema>
          <ButtonSistema type="button" variant="outline" onClick={onClose} className="w-full py-3 border-none text-gray-400 hover:text-gray-600">Cancelar</ButtonSistema>
        </div>
      </div>
    </div>
  );
}