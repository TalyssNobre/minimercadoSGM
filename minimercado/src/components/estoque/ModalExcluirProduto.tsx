import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Produto } from './types';

interface Props {
  isOpen: boolean;
  produto: Produto | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
}

export default function ModalExcluirProduto({ isOpen, produto, onClose, onConfirm }: Props) {
  if (!isOpen || !produto) return null;

  const handleConfirm = async () => {
    const sucesso = await onConfirm(produto.id);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir Produto</h2>
        <p className="text-gray-600 text-sm mb-6">
          Tem certeza que deseja excluir <strong>{produto.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-center gap-3">
          <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
          <ButtonSistema type="button" variant="danger" onClick={handleConfirm}>Sim, Excluir</ButtonSistema>
        </div>
      </div>
    </div>
  );
}