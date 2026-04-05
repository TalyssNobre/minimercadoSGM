'use client';
import React from 'react';
import Topbar from "@/src/components/layout/Topbar";
import Sidebar from "@/src/components/layout/Sidebar";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Menu Lateral */}
      <Sidebar />

      {/* 🟢 Área Direita: Tiramos o pt-36 daqui, pois ele travava o buraco na tela */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <Topbar tipoUsuario="admin" />
        
        {/* O main é a caixa que realmente tem o scroll (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto">
          
          {/* 🟢 O SEGREDO ESTÁ AQUI: 
              Colocamos "pt-40" (espaço exato das duas barras + um respiro) DENTRO do conteúdo.
              Como ele está aqui dentro, ao rolar a página para baixo, esse espaço rola junto e some,
              fazendo o seu sistema usar a tela inteira do celular!
              No PC (md:p-8), ele volta a ter a margem padrão.
          */}
          <div className="p-4 pt-40 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}