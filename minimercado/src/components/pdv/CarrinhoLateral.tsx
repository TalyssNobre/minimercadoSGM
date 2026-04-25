import React from 'react';
import { CartItem } from './types';

interface CarrinhoProps {
  cart: CartItem[];
  tipoDesconto: 'R$' | '%';
  setTipoDesconto: (v: 'R$' | '%') => void;
  valorDescontoInput: string;
  setValorDescontoInput: (v: string) => void;
  cartSubtotal: number;
  valorDescontoCalculado: number;
  cartTotalFinal: number;
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  isFinalizando: boolean;
  onFinalizarVenda: (status: 'PAGO' | 'PENDENTE') => void;
}

export default function CarrinhoLateral({
  cart, tipoDesconto, setTipoDesconto, valorDescontoInput, setValorDescontoInput,
  cartSubtotal, valorDescontoCalculado, cartTotalFinal,
  updateQuantity, removeFromCart, isFinalizando, onFinalizarVenda
}: CarrinhoProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sticky top-24">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
      <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 mb-6 scrollbar-thin">
        {cart.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10 font-medium">O carrinho está vazio.</p>
        ) : (
          cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.product.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-800 truncate">{item.product.name}</h4>
                
                {/* 🟢 MÁGICA: Adicionada a descrição do combo no carrinho */}
                {item.product.isCombo && item.product.combo_description && (
                  <p className="text-[9px] text-gray-400 italic truncate" title={item.product.combo_description}>
                    {item.product.combo_description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center border border-gray-200 rounded text-[10px]">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                    <span className="px-2 font-bold border-x border-gray-200">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-gray-800">{formatCurrency(item.product.price * item.quantity)}</span>
                <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Aplicar Desconto</h3>
          <div className="flex gap-2">
            <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
              <button onClick={() => { setTipoDesconto('R$'); setValorDescontoInput(''); }} className={`px-3 py-1.5 text-xs font-bold transition-colors ${tipoDesconto === 'R$' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>R$</button>
              <button onClick={() => { setTipoDesconto('%'); setValorDescontoInput(''); }} className={`px-3 py-1.5 text-xs font-bold transition-colors ${tipoDesconto === '%' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>%</button>
            </div>
            <input type="text" placeholder="Valor..." value={valorDescontoInput} onChange={(e) => setValorDescontoInput(e.target.value.replace(/[^0-9.,]/g, ''))} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#0D9488]" />
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-500 font-medium">Subtotal</span>
          <span className="text-gray-800 font-semibold">{formatCurrency(cartSubtotal)}</span>
        </div>
        {valorDescontoCalculado > 0 && (
          <div className="flex justify-between items-center mb-3 text-sm text-[#059669]">
            <span className="font-bold">Desconto ({tipoDesconto === '%' ? `${valorDescontoInput}%` : 'R$'})</span>
            <span className="font-bold">- {formatCurrency(valorDescontoCalculado)}</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-6 pt-3 border-t border-dashed border-gray-200">
          <span className="text-base font-bold text-gray-800">Total Final</span>
          <span className="text-2xl font-black text-[#0D9488]">{formatCurrency(cartTotalFinal)}</span>
        </div>
        <div className="space-y-3">
          <button disabled={isFinalizando || cart.length === 0} onClick={() => onFinalizarVenda('PAGO')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50">
            {isFinalizando ? 'PROCESSANDO...' : 'PAGO NO ATO'}
          </button>
          <button disabled={isFinalizando || cart.length === 0} onClick={() => onFinalizarVenda('PENDENTE')} className="w-full bg-[#B89822] hover:bg-[#9B7F1B] text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-50">
            {isFinalizando ? 'PROCESSANDO...' : 'PENDENTE / FIADO'}
          </button>
        </div>
      </div>
    </div>
  );
}