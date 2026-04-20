import React, { useState, useEffect } from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Equipe } from './types';

interface Props {
  isOpen: boolean;
  equipeOriginal: Equipe | null;
  onClose: () => void;
  onSave: (id: number | null, nome: string, cor: string) => Promise<boolean>;
}

export default function ModalSalvarEquipe({ isOpen, equipeOriginal, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#0D9488');

  useEffect(() => {
    if (isOpen) {
      setNome(equipeOriginal ? equipeOriginal.name : '');
      setCor(equipeOriginal ? equipeOriginal.color : '#0D9488');
    }
  }, [isOpen, equipeOriginal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const sucesso = await onSave(equipeOriginal ? equipeOriginal.id : null, nome, cor);
    if (sucesso) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-[#0D9488] px-6 py-4 font-bold text-white">
          {equipeOriginal ? 'Editar Equipe' : 'Nova Equipe'}
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input 
            type="text" required value={nome} onChange={(e) => setNome(e.target.value)} 
            placeholder="Nome da Equipe" 
            className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]" 
          />
          <div className="flex items-center gap-3 p-2 border rounded-md">
            <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-10 h-10 cursor-pointer border-none p-0" />
            <span className="text-xs text-gray-500">Cor da equipe</span>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <ButtonSistema type="button" variant="outline" onClick={onClose}>Cancelar</ButtonSistema>
            <ButtonSistema type="submit" variant="primary">Salvar</ButtonSistema>
          </div>
        </form>
      </div>
    </div>
  );
}