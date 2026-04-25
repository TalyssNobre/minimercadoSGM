import React from 'react';
import { ButtonSistema } from './ButtonSistema';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  titulo?: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModalConfirmacao({
  isOpen,
  titulo = 'Tem certeza?',
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tipo = 'danger',
  onConfirm,
  onCancel
}: ModalConfirmacaoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Ícone de Atenção Dinâmico */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${tipo === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-2xl font-black text-gray-800 mb-2">{titulo}</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">{mensagem}</p>

        {/* Botões lado a lado */}
        <div className="flex w-full gap-3">
          <ButtonSistema 
            type="button" 
            onClick={onCancel} 
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 shadow-none"
          >
            {textoCancelar}
          </ButtonSistema>
          
          <ButtonSistema 
            type="button" 
            onClick={() => {
              onConfirm();
              onCancel(); // Fecha o modal após confirmar
            }} 
            className={`flex-1 font-bold py-3 text-white border-none ${tipo === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {textoConfirmar}
          </ButtonSistema>
        </div>

      </div>
    </div>
  );
}