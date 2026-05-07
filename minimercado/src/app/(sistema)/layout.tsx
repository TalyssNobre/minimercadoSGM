'use client';
import React from 'react';
import Topbar from "@/src/components/layout/Topbar";
import Sidebar from "@/src/components/layout/Sidebar";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Menu Lateral (Onde fica o Header Mobile agora) */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <Topbar tipoUsuario="admin" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 pt-24 md:px-8 md:pb-8 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}