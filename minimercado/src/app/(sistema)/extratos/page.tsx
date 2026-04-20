'use client';
import React, { useState } from 'react';

// Subcomponentes
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import SelecaoClienteExtrato from '@/src/components/extratos/SelecaoClienteExtrato';
import TabelaExtrato from '@/src/components/extratos/TabelaExtrato';
import ResumoExtrato from '@/src/components/extratos/ResumoExtrato';

// Hooks
import { useExtratos } from '@/src/components/extratos/hooks/useExtratos';

export default function ExtratosPage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const extratoData = useExtratos(exibirAlerta);

  return (
    <div className="max-w-7xl mx-auto py-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-5xl mx-auto relative">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">Extratos e Baixa de Fiado</h2>
        
        <SelecaoClienteExtrato 
          equipes={extratoData.equipes} membros={extratoData.membros}
          selectedTeam={extratoData.selectedTeam} setSelectedTeam={extratoData.setSelectedTeam}
          selectedMember={extratoData.selectedMember} setSelectedMember={extratoData.setSelectedMember}
          resetSelection={() => extratoData.setSelectedItems([])}
        />

        {extratoData.selectedMember && extratoData.selectedTeam && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {extratoData.selectedMember.name} <span className="font-normal text-gray-500">- {extratoData.selectedTeam.name}</span>
              </h3>
            </div>

            <TabelaExtrato 
              activeTab={extratoData.activeTab} setActiveTab={extratoData.setActiveTab}
              comprasVisiveisAgrupadas={extratoData.comprasVisiveisAgrupadas}
              selectedItems={extratoData.selectedItems} setSelectedItems={extratoData.setSelectedItems}
              isLoadingHistorico={extratoData.isLoadingHistorico}
            />

            <ResumoExtrato 
              activeTab={extratoData.activeTab}
              totais={extratoData.totais}
              isSubmitting={extratoData.isSubmitting}
              hasSelectedItems={extratoData.selectedItems.length > 0}
              onQuitar={extratoData.handleQuitarPendencia}
            />
          </div>
        )}

        <ModalAlerta 
          isOpen={modalAlerta.isOpen}
          mensagem={modalAlerta.mensagem}
          tipo={modalAlerta.tipo}
          onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
        />
      </div>
    </div>
  );
}