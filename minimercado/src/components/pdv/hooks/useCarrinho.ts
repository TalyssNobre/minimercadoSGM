import { useState, useMemo } from 'react';
import { Produto, CartItem } from '../types';

export function useCarrinho() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tipoDesconto, setTipoDesconto] = useState<'R$' | '%'>('R$');
  const [valorDescontoInput, setValorDescontoInput] = useState<string>('');
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  
  // 🟢 ESTADOS DO COMBO E TOAST
  const [toastAviso, setToastAviso] = useState({ show: false, msg: '' });
  const [comboParaConfigurar, setComboParaConfigurar] = useState<Produto | null>(null);

  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
    setModalAlerta({ isOpen: true, mensagem, tipo });
  };

  const atualizarItemPeloRealtime = (payload: any) => {
    // ... (Mantenha a sua lógica atual do realtime aqui se tiver, ou deixe vazio se não estiver usando)
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const valorDescontoCalculado = useMemo(() => {
    if (!valorDescontoInput || cartSubtotal === 0) return 0;
    const valorDigitado = parseFloat(valorDescontoInput.replace(',', '.'));
    if (isNaN(valorDigitado) || valorDigitado < 0) return 0;
    return tipoDesconto === '%' ? (cartSubtotal * valorDigitado) / 100 : valorDigitado;
  }, [cartSubtotal, tipoDesconto, valorDescontoInput]);

  const cartTotalFinal = useMemo(() => {
    return Math.max(0, cartSubtotal - valorDescontoCalculado);
  }, [cartSubtotal, valorDescontoCalculado]);

  const addToCart = (produto: Produto) => {
    // 🟢 INTERCEPTA O CLIQUE: Se for combo, abre o modal e para por aqui
    if (produto.isCombo) {
      setComboParaConfigurar(produto);
      return;
    }

    if (produto.stock <= 0) {
      return exibirAlerta(`O produto "${produto.name}" está esgotado!`, 'error');
    }

    const existingItem = cart.find(item => item.product.id === produto.id && !item.customizacao);
    if (existingItem && existingItem.quantity + 1 > produto.stock) {
      return exibirAlerta(`Estoque insuficiente! Restam apenas ${produto.stock} unidades.`, 'error');
    }

    setCart(prev => {
      if (existingItem) {
        return prev.map(item => item.product.id === produto.id && !item.customizacao ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: produto, quantity: 1 }];
    });

    setToastAviso({ show: true, msg: `${produto.name} adicionado!` });
    setTimeout(() => setToastAviso(prev => ({ ...prev, show: false })), 2000);
  };

  // 🟢 FUNÇÃO QUE O MODAL CHAMA AO CONFIRMAR AS BEBIDAS
  const finalizarAdicaoCombo = (produto: Produto, itensEscolhidos: any[]) => {
    setCart(prev => [...prev, { product: produto, quantity: 1, customizacao: itensEscolhidos }]);
    setComboParaConfigurar(null);
    setToastAviso({ show: true, msg: `${produto.name} adicionado!` });
    setTimeout(() => setToastAviso(prev => ({ ...prev, show: false })), 2000);
  };

  const updateQuantity = (productId: number, delta: number) => {
    const existingItem = cart.find(item => item.product.id === productId);
    if (!existingItem) return;

    const newQuantity = existingItem.quantity + delta;
    if (delta > 0 && newQuantity > existingItem.product.stock) {
      return exibirAlerta(`Estoque atingido! Máximo de ${existingItem.product.stock} unidades.`, 'error');
    }

    setCart(prev => prev.map(item => item.product.id === productId ? (newQuantity > 0 ? { ...item, quantity: newQuantity } : item) : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const limparCarrinho = () => {
    setCart([]);
    setValorDescontoInput('');
  };

  return {
    cart, tipoDesconto, setTipoDesconto, valorDescontoInput, setValorDescontoInput,
    cartSubtotal, valorDescontoCalculado, cartTotalFinal,
    addToCart, updateQuantity, removeFromCart, limparCarrinho,
    modalAlerta, setModalAlerta, exibirAlerta, atualizarItemPeloRealtime, toastAviso,
    // 🟢 Exportando as funções do combo
    comboParaConfigurar, setComboParaConfigurar, finalizarAdicaoCombo
  };
}