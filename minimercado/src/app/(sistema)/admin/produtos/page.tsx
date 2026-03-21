import React from 'react';
import FormularioProduto from '@/src/components/forms/FormularioProduto';

export default function CadastroProdutoPage() {
  return (
    // 🟢 AQUI: Aumentamos de max-w-4xl para max-w-5xl para o layout respirar
    <div className="max-w-5xl mx-auto py-6">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-8 tracking-tight">
          Cadastro de Novo Produto
        </h1>

        <FormularioProduto />

      </div>
    </div>
  );
}