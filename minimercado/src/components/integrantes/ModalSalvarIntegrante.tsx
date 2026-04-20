import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Membro } from './types';

interface Props {
  isOpen: boolean;
  membroOriginal: Membro | null;
  onClose: () => void;
  onSave: (id: number | null, nome: string) => Promise<boolean>;
}

export default function ModalSalvarIntegrante({ isOpen, membroOriginal, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (isOpen) setNome(membroOriginal ? membroOriginal.name : '');
  }, [isOpen, membroOriginal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const sucesso = await onSave(membroOriginal ? membroOriginal.id : null, nome);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-[#0D9488] p-5 text-white font-bold text-center text-lg">
          {membroOriginal ? 'Editar' : 'Novo'} Integrante
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <input autoFocus type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#0D9488] transition-all font-medium" />
          <div className="flex justify-end gap-3">
            <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
            <ButtonSistema type="submit" variant="primary">Confirmar</ButtonSistema>
          </div>
        </form>
      </div>
    </div>
  );
}