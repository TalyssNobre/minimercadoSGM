import React, { forwardRef } from 'react';
import { Category } from './types';

interface RelatorioProps {
  totaisGerais: { totalVendido: number; totalRecebido: number; totalAReceber: number };
  totaisPorCategoria: Record<number, number>;
  categories: Category[];
  curvaABC: { nome: string; qtd: number; valor: number }[];
}

// 🟢 Usamos o forwardRef para a biblioteca de impressão conseguir capturar esse componente
export const RelatorioFechamento = forwardRef<HTMLDivElement, RelatorioProps>(
  ({ totaisGerais, totaisPorCategoria, categories, curvaABC }, ref) => {
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const dataAtual = new Date().toLocaleString('pt-BR');

    return (
      <div ref={ref} className="p-10 bg-white text-black print:p-8" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        
        {/* Cabeçalho do Documento */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest">Relatório de Fechamento</h1>
          <h2 className="text-xl font-bold mt-2">SGM - Mini Mercado</h2>
          <p className="text-sm text-gray-600 mt-1">Gerado em: {dataAtual}</p>
        </div>

        {/* 1. Resumo Financeiro */}
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 uppercase">1. Resumo Financeiro (Caixa)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-300 rounded text-center">
              <p className="text-xs uppercase text-gray-500 font-bold">Faturamento Total Bruto</p>
              <p className="text-2xl font-black">{formatCurrency(totaisGerais.totalVendido)}</p>
            </div>
            <div className="p-4 border border-gray-300 rounded text-center bg-gray-50">
              <p className="text-xs uppercase text-gray-500 font-bold">Total Recebido (Pago)</p>
              <p className="text-2xl font-black">{formatCurrency(totaisGerais.totalRecebido)}</p>
            </div>
            <div className="p-4 border border-gray-300 rounded text-center">
              <p className="text-xs uppercase text-gray-500 font-bold">A Receber (Fiado)</p>
              <p className="text-2xl font-black">{formatCurrency(totaisGerais.totalAReceber)}</p>
            </div>
          </div>
        </div>

        {/* 2. Resumo por Setor (Categoria) */}
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 uppercase">2. Faturamento por Setor</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm">Setor / Categoria</th>
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm text-right">Total Faturado</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{cat.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm font-bold text-right">{formatCurrency(totaisPorCategoria[cat.id] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Produtos Vendidos (Curva ABC) */}
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 uppercase">3. Produtos Vendidos (Curva ABC)</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm w-12 text-center">#</th>
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm">Produto</th>
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm text-center">Qtd. Saída</th>
                <th className="border border-gray-300 px-4 py-2 font-bold text-sm text-right">Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {curvaABC.map((prod, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-1 text-sm text-center text-gray-500">{idx + 1}º</td>
                  <td className="border border-gray-300 px-4 py-1 text-sm">{prod.nome}</td>
                  <td className="border border-gray-300 px-4 py-1 text-sm text-center font-medium">{prod.qtd} un</td>
                  <td className="border border-gray-300 px-4 py-1 text-sm text-right font-bold">{formatCurrency(prod.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-200">
          <p>Fim do Relatório - SGM Mini Mercado</p>
        </div>

      </div>
    );
  }
);

RelatorioFechamento.displayName = "RelatorioFechamento"; // Necessário quando usamos forwardRef no React