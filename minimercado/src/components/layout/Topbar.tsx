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
    <nav className="hidden lg:flex w-full bg-[#0D9488] h-20 text-white shadow-lg px-6 justify-between items-center z-[50] sticky top-0">
      
      {/* 1. LADO ESQUERDO: Espaçador flex para garantir o centro exato */}
      <div className="flex-1"></div>

      {/* 2. CENTRO: Apenas o Nome (Sem Logo) */}
      <div className="flex items-center justify-center flex-1">
        <span className="text-3xl font-bold tracking-wide drop-shadow-sm">
          Mercadinho
        </span>
      </div>

      {/* 3. LADO DIREITO: Perfil e Botão de Sair fixados na borda */}
      <div className="flex items-center justify-end space-x-3 flex-1">
        <div className="flex flex-col text-right leading-none mr-2">
          <span className="text-sm font-bold tracking-wide drop-shadow-sm">
            {nomeUsuario}
          </span>
          <span className="text-[10px] uppercase font-medium opacity-90 mt-1">
            {cargoExibicao}
          </span>
        </div>
        
        {/* BOTÃO DE SAIR */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`p-2 rounded-full transition-all flex items-center justify-center min-w-[40px] shadow-sm ${
            isLoggingOut ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-red-500 hover:shadow-md'
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