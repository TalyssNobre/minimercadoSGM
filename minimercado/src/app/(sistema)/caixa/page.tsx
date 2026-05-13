'use client';
import React, { useState } from 'react';

// UI e Subcomponentes
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import SelecaoCliente from '@/src/components/pdv/SelecaoCliente';
import GradeProdutos from '@/src/components/pdv/GradeProdutos';
import CarrinhoLateral from '@/src/components/pdv/CarrinhoLateral';

// Hooks
import { usePDVDados } from '@/src/components/pdv/hooks/usePDVDados';
import { useCarrinho } from '@/src/components/pdv/hooks/useCarrinho';
import { Equipe, Membro } from '@/src/components/pdv/types';
import { useRealtimeSync } from '@/src/hooks/useRealtimeSync';

// Controllers
import { createSale } from '@/src/Server/controllers/SaleController';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';

export default function CaixaPage() {
  const { equipes, membros, produtos, categorias, isLoading, atualizarDados, atualizarProdutoAoVivo } = usePDVDados();
  const carrinho = useCarrinho();

  useRealtimeSync('Product', (payload) => {
    atualizarProdutoAoVivo(payload); 
    carrinho.atualizarItemPeloRealtime(payload); 
  });

  const [selectedTeam, setSelectedTeam] = useState<Equipe | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);
  const [isFinalizando, setIsFinalizando] = useState(false);

  const handleFinalizarVenda = async (statusVenda: 'PAGO' | 'PENDENTE') => {
    if (carrinho.cart.length === 0) return carrinho.exibirAlerta("O carrinho está vazio!", 'error');
    if (!selectedMember) return carrinho.exibirAlerta("Selecione um cliente!", 'error');
    if (isFinalizando) return;

    setIsFinalizando(true);

    try {
      const userResp = await getLoggedUserController() as any;
      const vendedorId = userResp?.user?.id || userResp?.data?.user?.id;
      
      if (!vendedorId) {
        carrinho.exibirAlerta("Vendedor não encontrado.", 'error');
        setIsFinalizando(false);
        return;
      }

      const formData = new FormData();
      formData.append('member_id', selectedMember.id.toString());
      formData.append('user_id', vendedorId.toString());
      formData.append('status', statusVenda === 'PAGO' ? 'Pago' : '');
      
      const itensCarrinho = carrinho.cart.map(item => {
        const precoBase = item.product.base_price || item.product.price;
        const precoEfetivo = item.product.price;
        const descontoDesteItem = (precoBase - precoEfetivo) * item.quantity;

        return {
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: precoBase,
          item_discount: descontoDesteItem 
        };
      });

      formData.append('discount', carrinho.valorDescontoCalculado.toString());

      const agora = new Date();
      const timezoneOffset = agora.getTimezoneOffset() * 60000;
      const dataLocalISO = new Date(agora.getTime() - timezoneOffset).toISOString();

      formData.append('date', dataLocalISO);
      if (statusVenda === 'PAGO') {
        formData.append('payment_date', dataLocalISO);
      }

      formData.append('cart', JSON.stringify(itensCarrinho));

      const resposta = await createSale(formData) as any;

      if (resposta.success) {
        carrinho.exibirAlerta("Venda realizada com sucesso!", 'success');
        carrinho.limparCarrinho();
        setSelectedMember(null);
        setSelectedTeam(null);
        
        atualizarDados(); 
        
      } else {
        carrinho.exibirAlerta(resposta.message || "Erro ao salvar.", 'error');
      }
    } catch (error: any) {
      carrinho.exibirAlerta("Erro Crítico: " + error.message, 'error');
    } finally {
      setIsFinalizando(false);
    }
  };

  return (
    <>
      {/* 🟢 TOAST FLUTUANTE GLOBAL DA PÁGINA */}
      <div 
        className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-out flex items-center shadow-xl bg-green-600 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide border border-green-400 ${carrinho.toastAviso.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {carrinho.toastAviso.msg}
      </div>

      <div className="max-w-7xl mx-auto py-4 text-left">
        <div className="flex flex-col lg:flex-row gap-6 relative">
          
          {/* Lado Esquerdo - min-w-0 */}
          <div className="flex-1 min-w-0 space-y-6">
            <SelecaoCliente 
              equipes={equipes} membros={membros}
              selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
              selectedMember={selectedMember} setSelectedMember={setSelectedMember}
            />
            <GradeProdutos 
              produtos={produtos} categorias={categorias} isLoading={isLoading}
              onAddToCart={carrinho.addToCart}
            />
          </div>

          {/* Lado Direito */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <CarrinhoLateral 
              cart={carrinho.cart}
              tipoDesconto={carrinho.tipoDesconto} setTipoDesconto={carrinho.setTipoDesconto}
              valorDescontoInput={carrinho.valorDescontoInput} setValorDescontoInput={carrinho.setValorDescontoInput}
              cartSubtotal={carrinho.cartSubtotal} valorDescontoCalculado={carrinho.valorDescontoCalculado} cartTotalFinal={carrinho.cartTotalFinal}
              updateQuantity={carrinho.updateQuantity} removeFromCart={carrinho.removeFromCart}
              isFinalizando={isFinalizando} onFinalizarVenda={handleFinalizarVenda}
            />
          </div>

          {/* Modais */}
          <ModalAlerta 
            isOpen={carrinho.modalAlerta.isOpen}
            mensagem={carrinho.modalAlerta.mensagem}
            tipo={carrinho.modalAlerta.tipo}
            onClose={() => carrinho.setModalAlerta({ ...carrinho.modalAlerta, isOpen: false })}
          />
        </div>
      </div>
    </>
  );
}