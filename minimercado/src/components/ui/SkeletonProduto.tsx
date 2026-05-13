import React from 'react';

export function SkeletonProduto() {
  return (
    <div className="bg-white p-3 rounded-xl border flex flex-col items-center w-full animate-pulse shadow-sm">
      {/* Imagem do produto (Quadrado cinza) */}
      <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
      
      {/* Título do Produto (Duas linhas finas) */}
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      
      {/* Espaço flexível para empurrar o preço pro fundo (igual ao card real) */}
      <div className="flex-1 w-full min-h-[2.5rem]"></div>
      
      {/* Preço (Linha um pouco mais escura para dar destaque) */}
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-3 mt-auto"></div>
      
      {/* Botão de Adicionar */}
      <div className="w-full h-8 bg-gray-200 rounded-lg"></div>
    </div>
  );
}