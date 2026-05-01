'use client';
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print'; // 🟢 Biblioteca de impressão

// Subcomponentes
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import SelecaoClienteExtrato from '@/src/components/extratos/SelecaoClienteExtrato';
import TabelaExtrato from '@/src/components/extratos/TabelaExtrato';
import ResumoExtrato from '@/src/components/extratos/ResumoExtrato';
import { RelatorioExtrato } from '@/src/components/extratos/RelatorioExtrato'; // 🟢 Nosso novo relatório

// Hooks
import { useExtratos } from '@/src/components/extratos/hooks/useExtratos';

export default function ExtratosPage() {
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => setModalAlerta({ isOpen: true, mensagem, tipo });

  const extratoData = useExtratos(exibirAlerta);
  
  // 🟢 Configuração de Impressão
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Extrato_${extratoData.selectedMember?.name?.replace(/\s+/g, '_') || 'Cliente'}`,
  });

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
            
            {/* 🟢 Cabeçalho do Cliente com o Botão de Imprimir */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-gray-800">
                {extratoData.selectedMember.name} <span className="font-normal text-gray-500">- {extratoData.selectedTeam.name}</span>
              </h3>
              
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all border border-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v2.796c0 1.136.92 2.053 2.053 2.053h6.394c1.132 0 2.053-.917 2.053-2.053V9.214Z" />
                </svg>
                Imprimir Extrato
              </button>
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
              userRole={extratoData.userRole}
              onQuitar={extratoData.handleQuitarPendencia}
            />
          </div>
        )}

        {/* 🟢 Molde Oculto para o PDF */}
        <div className="hidden">
          <RelatorioExtrato 
            ref={componentRef}
            membro={extratoData.selectedMember}
            equipe={extratoData.selectedTeam}
            historico={extratoData.historicoBruto || []}
          />
        </div>

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