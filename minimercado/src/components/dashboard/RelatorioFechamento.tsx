import React, { forwardRef } from 'react';
import { Category } from './types'; 

interface RelatorioProps {
  totaisGerais: { totalVendido: number; totalRecebido: number; totalAReceber: number };
  totaisPorCategoria: Record<number, number>;
  categories: Category[];
  // 🟢 Garantimos que o TypeScript sabe que existe o desconto vindo do backend
  curvaABC: { nome: string; qtd: number; valor: number; desconto?: number }[]; 
}

export const RelatorioFechamento = forwardRef<HTMLDivElement, RelatorioProps>(
  ({ totaisGerais, totaisPorCategoria, categories, curvaABC }, ref) => {
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const dataAtual = new Date().toLocaleString('pt-BR');

    return (
      <div ref={ref} className="p-10 bg-white text-black print:p-8" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        
        {/* CABEÇALHO INSTITUCIONAL */}
        <div className="border-b-2 border-black pb-6 mb-6">
          <div className="flex justify-between text-sm mb-4 font-bold">
            <span>(Arqui)diocese: ___________________________</span>
            <span>Paróquia: ___________________________</span>
            <span>Cidade/UF: ____________</span>
          </div>
          <div className="text-center mt-6">
            <h2 className="text-lg font-black uppercase tracking-widest">Encontro de Jovens com Cristo XXXVI - SEGUE-ME</h2>
            <h1 className="text-xl font-bold mt-2 text-gray-800">Demonstrativo Financeiro do Minimercado</h1>
            <p className="text-xs text-gray-500 mt-2">Gerado pelo sistema em: {dataAtual}</p>
          </div>
        </div>

        {/* 1. Resumo do Caixa */}
        <div className="mb-6">
          <h3 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-gray-700">1. Resumo do Caixa</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 border border-gray-300 rounded text-center">
              <p className="text-[10px] uppercase text-gray-500 font-bold">Faturamento Total Bruto</p>
              <p className="text-xl font-black">{formatCurrency(totaisGerais.totalVendido)}</p>
            </div>
            <div className="p-3 border border-gray-300 rounded text-center bg-gray-50">
              <p className="text-[10px] uppercase text-gray-500 font-bold">Total Recebido (Pago)</p>
              <p className="text-xl font-black">{formatCurrency(totaisGerais.totalRecebido)}</p>
            </div>
            <div className="p-3 border border-gray-300 rounded text-center">
              <p className="text-[10px] uppercase text-gray-500 font-bold">A Receber (Fiado)</p>
              <p className="text-xl font-black">{formatCurrency(totaisGerais.totalAReceber)}</p>
            </div>
          </div>
        </div>

        {/* 2. Faturamento por Setor (Categoria) */}
        <div className="mb-6">
          <h3 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-gray-700">2. Faturamento por Setor</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs">Setor / Categoria</th>
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-right w-36">Total Faturado</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{cat.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-right text-gray-700">
                    {formatCurrency(totaisPorCategoria[cat.id] || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Tabela de Estoque e Vendas (Híbrida) */}
        <div className="mb-8">
          <h3 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-gray-700">3. Controle de Estoque e Vendas</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs">Produto</th>
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-center w-24 text-gray-600">Qtd. Adquirida<br/><span className="text-[9px] font-normal">(Preencher)</span></th>
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-center w-20">Qtd. Vendida</th>
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-center w-24 text-gray-600">Sobras<br/><span className="text-[9px] font-normal">(Preencher)</span></th>
                
                {/* 🟢 Coluna de Desconto - AGORA O SISTEMA IMPRIME O VALOR */}
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-right w-24 text-rose-600">Desconto<br/>Aplicado</th>
                
                <th className="border border-gray-300 px-3 py-2 font-bold text-xs text-right w-28">Faturamento<br/></th>
              </tr>
            </thead>
            <tbody>
              {curvaABC.map((prod, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{prod.nome}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm bg-white"></td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold bg-gray-50">{prod.qtd} un</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm bg-white"></td>
                  
                <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold text-rose-600">
                {prod.desconto && prod.desconto > 0 ? formatCurrency(prod.desconto) : '-'}
                </td>

                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold text-gray-700">{formatCurrency(prod.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Assinaturas */}
        <div className="mt-16 pt-8 break-inside-avoid">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-800">
              ___________________________________________ , ______ de ______________________ de ___________
            </p>
          </div>
          <div className="flex justify-between items-center px-10">
            <div className="text-center">
              <p className="text-gray-800">_____________________________________</p>
              <p className="font-bold text-xs mt-1 uppercase text-gray-600">Coordenador(a)</p>
              <p className="text-[10px] text-gray-400">Nome / Telefone</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800">_____________________________________</p>
              <p className="font-bold text-xs mt-1 uppercase text-gray-600">Coordenador(a)</p>
              <p className="text-[10px] text-gray-400">Nome / Telefone</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RelatorioFechamento.displayName = "RelatorioFechamento";