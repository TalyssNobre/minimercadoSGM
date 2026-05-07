'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutController } from '@/src/Server/controllers/UserController'; 

// 🟢 1. IMPORTAMOS O NOSSO HOOK CENTRAL
import { useUsuario } from '@/src/hooks/useUsuario';

interface TopbarProps {
  tipoUsuario: 'admin' | 'operador';
}

export default function Topbar({ tipoUsuario }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🟢 2. PUXAMOS OS DADOS INSTANTANEAMENTE DA MEMÓRIA DO SWR
  const { user, cargoUsuario, isLoading } = useUsuario();

  // 🟢 3. LÓGICA DE NOME E CARGO SIMPLIFICADA (Sem precisar de useEffect)
  const nomeUsuario = isLoading 
    ? 'Carregando...' 
    : (user?.name ? user.name.split(' ')[0] : 'Usuário');
    
  const cargoExibicao = isLoading 
    ? '...' 
    : (cargoUsuario || tipoUsuario);

  // FUNÇÃO DE LOGOUT 
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const resposta = await logoutController();
      if (!resposta.success) {
        alert(resposta.message || "Erro ao sair do sistema."); 
      } else {
        router.refresh(); 
        router.push('/');
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    // 🟢 Trocado "hidden md:flex" por "hidden lg:flex" 
    // Agora a Topbar some no iPad e só aparece em PC (>= 1024px)
    <nav className="hidden lg:flex w-full bg-[#0D9488] h-20 text-white shadow-lg px-6 justify-between items-center z-[50] sticky top-0">
      
      <div className="flex items-center">
        <div className="w-10"></div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover scale-125" />
        </div>
        <span className="text-2xl font-medium tracking-wide">Segue-me</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex flex-col text-right leading-none mr-2">
          <span className="text-sm font-bold tracking-wide">
            {nomeUsuario}
          </span>
          <span className="text-[10px] uppercase font-medium opacity-80 mt-1">
            {cargoExibicao}
          </span>
        </div>
        
        {/* BOTÃO DE SAIR */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`p-2 rounded-full transition-all flex items-center justify-center min-w-[40px] ${
            isLoggingOut ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-red-500'
          }`}
          title="Sair do sistema"
        >
          {isLoggingOut ? (
            <span className="animate-pulse text-[10px] font-bold">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          )}
        </button>

      </div>
    </nav>
  );
}