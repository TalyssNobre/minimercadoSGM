'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Para o PC (minimizar a barra)
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Para o Celular (abrir/fechar o menu)
  const pathname = usePathname();

  // Fecha o menu mobile automaticamente ao clicar em um link
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard Financeiro', href: '/dashboard', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>)},
    { name: 'Gestão de Equipes', href: '/equipes', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>)},
    { name: 'Cadastrar Produto', href: '/produtos', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)},
    { name: 'Gerenciar Estoque', href: '/estoque', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>)},
    { name: 'Frente de Caixa (PDV)', href: '/caixa', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.1-.716 2.454-1.777l1.527-4.577a1.125 1.125 0 00-1.07-1.465H5.437m0 0L7.25 14.25z" /></svg>)},
    { name: 'Receber Fiado (Extratos)', href: '/extratos', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>)},
    { name: 'Histórico Geral', href: '/historico-vendas', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>)},
  ];

  return (
    <>
      {/* 🟢 HEADER MOBILE (Aparece só no celular) */}
      <div className="md:hidden bg-[#0D9488] text-white p-4 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50">
        <h1 className="font-bold text-lg tracking-wide">MiniMercado SGM</h1>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-white/10 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* 🟢 OVERLAY ESCURO (Fundo embaçado ao abrir menu no celular) */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🟢 BARRA LATERAL (Sidebar) */}
      <aside 
        className={`bg-[#0F766E] text-white min-h-screen transition-all duration-300 flex flex-col fixed top-0 z-[70] shadow-2xl h-full
          /* Comportamento no Celular: Fica escondida pra esquerda (-translate-x-full) e entra quando abre */
          ${isMobileOpen ? 'left-0 w-64' : '-left-full md:left-0'} 
          /* Comportamento no PC: Fica relativa, não sobrepõe e obedece o isCollapsed */
          md:relative md:flex ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Topo da Sidebar (Diferente no Mobile e PC) */}
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <span className={`font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden transition-opacity ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
            Menu
          </span>
          
          {/* Botão de Fechar no Mobile (X) */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Botão de Recolher no PC (Hamburguer) */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-2 hover:bg-white/10 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <nav className="flex-grow mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-6 py-4 transition-all hover:bg-white/10 group
                  ${isActive ? 'bg-white/20 border-r-4 border-white' : ''}
                `}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {/* O texto do menu só some se estiver no PC (md) E colapsado */}
                <span className={`ml-4 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isCollapsed ? 'md:opacity-0 md:w-0 md:ml-0' : 'opacity-100'}
                `}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}