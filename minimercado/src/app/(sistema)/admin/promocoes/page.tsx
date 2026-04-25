'use client';

import React from 'react';
import { ButtonSistema } from '@/src/components/ui/ButtonSistema';
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';

// 🟢 Importando o novo Modal de Confirmação
import { ModalConfirmacao } from '@/src/components/ui/ModalConfirmacao';

import { usePromocoes } from '@/src/components/promocoes/hooks/usePromocoes';

import DashboardPromocoes from '@/src/components/promocoes/DashboardPromocoes';
import OfertasAtivas from '@/src/components/promocoes/OfertasAtivas';
import TabelaCombos from '@/src/components/promocoes/TabelaCombos';
import ModalCombo from '@/src/components/promocoes/ModalCombo';
import ModalOferta from '@/src/components/promocoes/ModalOferta';

export default function PromocoesPage() {
  const promocoes = usePromocoes();

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen relative text-left">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Promoções</h1>
          <p className="text-sm text-gray-500">Crie ofertas relâmpago e combos de produtos.</p>
        </div>
        <div className="flex gap-3">
          <ButtonSistema variant="primary" className="bg-[#0D9488] border-none shadow-sm" onClick={() => promocoes.modais.setIsModalOfertaOpen(true)}>
            + Nova Oferta
          </ButtonSistema>
          <ButtonSistema variant="primary" className="bg-[#1e293b] border-none shadow-sm" onClick={() => promocoes.modais.setIsModalComboOpen(true)}>
            + Novo Combo
          </ButtonSistema>
        </div>
      </div>

      <DashboardPromocoes stats={promocoes.dados.stats} />

      <OfertasAtivas 
        isLoading={promocoes.dados.isLoading} 
        ofertas={promocoes.dados.ofertasAtivas} 
        onDesativar={promocoes.ofertaForm.handleDesativarOferta} 
      />

      <TabelaCombos 
        isLoading={promocoes.dados.isLoading} 
        combos={promocoes.dados.combosCadastrados} 
        onEditar={promocoes.comboForm.handleEditarCombo} 
        onExcluir={promocoes.comboForm.handleExcluirCombo} 
      />

      {promocoes.modais.isModalComboOpen && <ModalCombo promocoes={promocoes} />}
      {promocoes.modais.isModalOfertaOpen && <ModalOferta promocoes={promocoes} />}

      {/* MODAL ALERTA */}
      <ModalAlerta 
        isOpen={promocoes.modais.modalAlerta.isOpen}
        mensagem={promocoes.modais.modalAlerta.mensagem}
        tipo={promocoes.modais.modalAlerta.tipo as any}
        onClose={() => promocoes.modais.setModalAlerta({ ...promocoes.modais.modalAlerta, isOpen: false })}
      />

      {/* 🟢 MODAL DE CONFIRMAÇÃO */}
      <ModalConfirmacao
        isOpen={promocoes.modais.modalConfirmacao.isOpen}
        titulo={promocoes.modais.modalConfirmacao.titulo}
        mensagem={promocoes.modais.modalConfirmacao.mensagem}
        onConfirm={promocoes.modais.modalConfirmacao.onConfirm}
        onCancel={() => promocoes.modais.setModalConfirmacao(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}