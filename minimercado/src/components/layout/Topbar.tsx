'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutController, getLoggedUserController } from '@/src/Server/controllers/UserController';  

interface TopbarProps {
  tipoUsuario: 'admin' | 'operador';
}

export default function Topbar({ tipoUsuario }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [nomeUsuario, setNomeUsuario] = useState<string>('Carregando...');
  const [cargoUsuario, setCargoUsuario] = useState<string>(tipoUsuario);

  // 🟢 CONTROLE DE SCROLL SUAVE PARA O MOBILE (Em sincronia com a Sidebar)
  const [showTopbar, setShowTopbar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const currentScrollY = e.target.scrollTop || window.scrollY;
      if (currentScrollY === undefined) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowTopbar(false); 
      } else {
        setShowTopbar(true);  
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const resposta = await getLoggedUserController();
        if (resposta.success && resposta.user) {
          const nomeParaSplit = resposta.user.name || 'Usuário';
          const primeiroNome = nomeParaSplit.split(' ')[0];
          
          setNomeUsuario(primeiroNome);
          
          if (resposta.user.profile) {
            setCargoUsuario(resposta.user.profile);
          }
        } else {
          setNomeUsuario('Usuário');
        }
      } catch (error) {
        setNomeUsuario('Usuário');
      }
    }
    fetchUser();
  }, []);

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
    // 🟢 MAGIA AQUI: No mobile ela é fixed abaixo da outra barra. No PC é sticky normal.
    // O translate puxa ela totalmente pra fora da tela no mobile sem dar pulos.
    <nav 
      className={`w-full bg-verde-principal h-20 text-white shadow-lg px-6 flex justify-between items-center transition-transform duration-300 ease-in-out z-[50]
      fixed top-16 left-0 md:static md:sticky md:top-0 md:left-auto
      ${showTopbar ? 'translate-y-0' : '-translate-y-36 md:translate-y-0'}`}
    >
      <div className="flex items-center">
        <div className="w-10"></div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover scale-125" />
        </div>
        <span className="text-xl md:text-2xl font-medium tracking-wide">Segue-me</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex flex-col text-right leading-none mr-2">
          <span className="text-sm font-bold tracking-wide">
            {nomeUsuario}
          </span>
          <span className="text-[10px] uppercase font-medium opacity-80 mt-1">
            {cargoUsuario}
          </span>
        </div>
        
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