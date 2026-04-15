'use client';
import React, { useState } from 'react';

// UI e Subcomponentes
import { ModalAlerta } from '@/src/components/ui/ModalAlerta';
import SelecaoCliente from '@/src/components/pdv/SelecaoCliente';
import GradeProdutos from '@/src/components/pdv/GradeProdutos';
import CarrinhoLateral from '@/src/components/pdv/CarrinhoLateral';

// Hooks
// 🟢 Importamos o atualizarDados que criamos no hook usePDVDados
import { usePDVDados } from '@/src/components/pdv/hooks/usePDVDados';
import { useCarrinho } from '@/src/components/pdv/hooks/useCarrinho';
import { Equipe, Membro } from '@/src/components/pdv/types';

// Controllers
import { createSale } from '@/src/Server/controllers/SaleController';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';

export default function CaixaPage() {
  // 🟢 Desestruturamos o atualizarDados aqui
  const { equipes, membros, produtos, categorias, isLoading, atualizarDados } = usePDVDados();
  const carrinho = useCarrinho();

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
      formData.append('discount_value', carrinho.valorDescontoCalculado.toString());
      
      formData.append('date', new Date().toISOString());
      if (statusVenda === 'PAGO') {
        formData.append('payment_date', new Date().toISOString());
      }

      const itensCarrinho = carrinho.cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      formData.append('cart', JSON.stringify(itensCarrinho));

      const resposta = await createSale(formData) as any;

      if (resposta.success) {
        carrinho.exibirAlerta("Venda realizada com sucesso!", 'success');
        carrinho.limparCarrinho();
        setSelectedMember(null);
        setSelectedTeam(null);
        
        // 🟢 ETAPA 1: Chamamos a revitalização dos dados aqui!
        // Isso força o front-end a buscar o estoque atualizado do banco.
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
    <div className="max-w-7xl mx-auto py-4">
      <div className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* Lado Esquerdo */}
        <div className="flex-1 space-y-6">
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
  );
}