import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { Venda } from './types';

interface Props {
  isOpen: boolean;
  venda: Venda | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalCancelamento({ isOpen, venda, onClose, onConfirm }: Props) {
  if (!isOpen || !venda) return null;

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Cancelar Venda #{venda.sale_id}?</h2>
        
        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-left text-sm text-gray-700">
          <p><strong>Cliente:</strong> {venda.client_name}</p>
          <p className="mt-1"><strong>Itens:</strong></p>
          <ul className="list-disc list-inside text-gray-500 text-xs ml-1">
            {venda.items.map((item) => (
              <li key={item.id_item_sale || Math.random()}>{item.quantity}x {item.name}</li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Esta ação excluirá a cobrança de <strong>{formatCurrency(venda.total_value)}</strong>. Deseja confirmar?
        </p>
        
        <div className="flex justify-center gap-3">
          <ButtonSistema type="button" variant="outline" onClick={onClose}>Voltar</ButtonSistema>
          <ButtonSistema type="button" variant="danger" onClick={onConfirm}>Sim, Cancelar Venda</ButtonSistema>
        </div>
      </div>
    </div>
  );
}