'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  tipoUsuario: 'admin' | 'operador';
}

export default function Topbar({ tipoUsuario }: TopbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    /* 🟢 MUDANÇA AQUI: Trocamos 'fixed' por 'sticky' e removemos o 'top-0' fixo */
    /* Isso faz a barra ocupar 100% apenas do espaço disponível ao lado da Sidebar */
    <nav className="w-full bg-verde-principal h-16 text-white shadow-lg px-6 flex justify-between items-center sticky top-0 z-[50]">
      
      {/* LADO ESQUERDO: Espaço para o ícone de menu (hambúrguer) se quiser adicionar depois */}
      <div className="flex items-center">
        <div className="w-10">
           {/* Aqui você pode colocar o ícone de abrir/fechar a sidebar futuramente */}
        </div>
      </div>

      {/* CENTRO: Logo e Texto "Segue-me" */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover scale-125" />
        </div>
        <span className="text-xl md:text-2xl font-medium tracking-wide">Segue-me</span>
      </div>

      {/* LADO DIREITO: Usuário e Botão de Sair (Agora ficarão visíveis!) */}
      <div className="flex items-center space-x-3">
        <span className="text-xs md:text-sm font-semibold capitalize tracking-wide hidden sm:block">
          {tipoUsuario}
        </span>
        
        <button 
          onClick={handleLogout}
          className="bg-white/10 hover:bg-red-500 p-2 rounded-full transition-all"
          title="Sair do sistema"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

    </nav>
  );
}