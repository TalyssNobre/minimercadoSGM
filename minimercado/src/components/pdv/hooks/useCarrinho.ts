import { useState, useMemo } from 'react';
import { Produto, CartItem } from '../types';

export function useCarrinho() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tipoDesconto, setTipoDesconto] = useState<'R$' | '%'>('R$');
  const [valorDescontoInput, setValorDescontoInput] = useState<string>('');
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  
  // 🟢 NOVO: Estado para a notificação rápida (Toast)
  const [toastAviso, setToastAviso] = useState({ show: false, msg: '' });

  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
    setModalAlerta({ isOpen: true, mensagem, tipo });
  };

  const atualizarItemPeloRealtime = (payload: any) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      setCart((prevCart) => prevCart.map(item => {
        if (item.product.id === payload.new.id) {
          const precoOriginal = Number(payload.new.price) || 0;
          const emPromo = Boolean(payload.new.promo_status);
          const precoPromo = Number(payload.new.promo_price) || 0;
          const precoEfetivo = (emPromo && precoPromo > 0) ? precoPromo : precoOriginal;

          return {
            ...item,
            product: {
              ...item.product,
              stock: Number(payload.new.stock) || 0,
              promo_status: emPromo,
              base_price: precoOriginal,
              price: precoEfetivo
            }
          };
        }
        return item;
      }));
    }
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
    if (produto.stock <= 0) {
      return exibirAlerta(`O produto "${produto.name}" está esgotado!`, 'error');
    }

    const existingItem = cart.find(item => item.product.id === produto.id);
    if (existingItem && existingItem.quantity + 1 > produto.stock) {
      return exibirAlerta(`Estoque insuficiente! Restam apenas ${produto.stock} unidades.`, 'error');
    }

    setCart(prev => {
      if (existingItem) {
        return prev.map(item => item.product.id === produto.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: produto, quantity: 1 }];
    });

    // 🟢 MÁGICA: Dispara a notificação de sucesso e some após 2 segundos!
    setToastAviso({ show: true, msg: `${produto.name} adicionado!` });
    setTimeout(() => {
      setToastAviso(prev => ({ ...prev, show: false }));
    }, 2000);
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
    cart,
    tipoDesconto, setTipoDesconto,
    valorDescontoInput, setValorDescontoInput,
    cartSubtotal, valorDescontoCalculado, cartTotalFinal,
    addToCart, updateQuantity, removeFromCart, limparCarrinho,
    modalAlerta, setModalAlerta, exibirAlerta,
    atualizarItemPeloRealtime,
    toastAviso // 🟢 Exportado para a tela principal
  };
}