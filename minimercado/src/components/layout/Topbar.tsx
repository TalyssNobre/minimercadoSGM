'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// ✅ Importação corrigida para o Controller
import { logoutController } from '@/src/Server/controllers/UserController';  

interface TopbarProps {
  tipoUsuario: 'admin' | 'operador';
}

export default function Topbar({ tipoUsuario }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Evita cliques duplos enquanto processa
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);

    try {
      // 1. Chama o Controller
      const resposta = await logoutController();
      
      // 2. Verifica 'success' (padrão que definimos no back)
      if (!resposta.success) {
        // Se der erro (ex: problema na rede), mostra a mensagem que veio do back
        alert(resposta.message || "Erro ao sair do sistema."); 
      } else {
        console.log("Logout realizado:", resposta.message); 
        
        // 3. Limpa o cache das rotas protegidas
        router.refresh(); 
        
        // 4. Redireciona para a home/login
        router.push('/');
      }
    } catch (error) {
      console.error("Erro fatal ao fazer logout:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full bg-verde-principal h-16 text-white shadow-lg px-6 flex justify-between items-center sticky top-0 z-[50]">
      {/* LADO ESQUERDO: Espaço para o ícone de menu (vazio por enquanto) */}
      <div className="flex items-center">
        <div className="w-10"></div>
      </div>

      {/* CENTRO: Logo e Texto "Segue-me" */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover scale-125" />
        </div>
        <span className="text-xl md:text-2xl font-medium tracking-wide">Segue-me</span>
      </div>

      {/* LADO DIREITO: Usuário e Botão de Sair */}
      <div className="flex items-center space-x-3">
        <span className="text-xs md:text-sm font-semibold capitalize tracking-wide hidden sm:block">
          {tipoUsuario}
        </span>
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`p-2 rounded-full transition-all flex items-center justify-center min-w-[40px] ${
            isLoggingOut ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-red-500'
          }`}
          title="Sair do sistema"
        >
          {isLoggingOut ? (
            // Spinner simples ou texto de carregando
            <span className="animate-pulse text-[10px] font-bold">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}