'use client';
import React from 'react';
import Topbar from "@/src/components/layout/Topbar";
import Sidebar from "@/src/components/layout/Sidebar";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    // overflow-hidden evita que qualquer erro de largura crie barras de rolagem
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Menu Lateral */}
      <Sidebar />

      {/* Área Direita: Ocupa o resto do espaço (flex-1) */}
      {/* 🟢 AQUI: Adicionado pt-16 no mobile, e md:pt-0 no PC */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        
        {/* Barra Superior agora é sticky e fica dentro desse fluxo */}
        <Topbar tipoUsuario="admin" />
        
        {/* Conteúdo que rola verticalmente (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}