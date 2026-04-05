import React from 'react';
import { ButtonSistema } from './ButtonSistema'; // Como estão na mesma pasta, o import fica mais curto!

interface ModalAlertaProps {
  isOpen: boolean;
  mensagem: string;
  tipo?: 'success' | 'error';
  onClose: () => void;
}

export function ModalAlerta({ isOpen, mensagem, tipo = 'success', onClose }: ModalAlertaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Ícone Dinâmico */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
          tipo === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
        }`}>
          {tipo === 'success' ? (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h3 className="text-2xl font-black text-gray-800 mb-2">
          {tipo === 'success' ? 'Sucesso!' : 'Ops!'}
        </h3>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          {mensagem}
        </p>

        <ButtonSistema 
          type="button"
          onClick={onClose} 
          className={`w-full py-3 text-sm font-bold ${tipo === 'success' ? 'bg-[#0D9488] hover:bg-[#0f766e]' : 'bg-red-500 hover:bg-red-600'}`}
        >
          Entendido
        </ButtonSistema>
      </div>
    </div>
  );
}