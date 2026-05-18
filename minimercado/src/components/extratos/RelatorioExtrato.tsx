import React, { forwardRef } from 'react';
import { Membro, Equipe, ItemAgrupado } from './types'; 

interface RelatorioExtratoProps {
  membro: Membro | null;
  equipe: Equipe | null;
  historico: ItemAgrupado[];
}

export const RelatorioExtrato = forwardRef<HTMLDivElement, RelatorioExtratoProps>(
  ({ membro, equipe, historico }, ref) => {
    if (!membro || !equipe) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const dataAtual = new Date().toLocaleString('pt-BR');

    // Separamos apenas o que foi PAGO para o Recibo
    const itensPagos = historico.filter(h => h.status === 'PAGO');

    const rec_TotalBruto = itensPagos.reduce((acc, venda) => acc + venda.valor_bruto, 0);
    const rec_TotalDescontos = itensPagos.reduce((acc, venda) => acc + venda.desconto, 0);
    const rec_TotalLiquido = itensPagos.reduce((acc, venda) => acc + venda.valor_liquido, 0);

    return (
      <div 
        ref={ref} 
        // 🟢 CONFIGURAÇÃO DA BOBINA: 80mm de largura, altura automática e fonte monoespaçada
        style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}
        // 🟢 CORREÇÃO: print:pt-8 empurra o conteúdo para baixo na impressão para não cortar
        className="p-4 print:pt-8 print:px-0 print:pb-4 text-xs"
      >
        
        {/* CABEÇALHO */}
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h2 className="font-bold text-sm">SGM - MINI MERCADO</h2>
          <h1 className="font-bold mt-1">CUPOM DE QUITACAO</h1>
          <p className="text-[10px] mt-1">Emissao: {dataAtual}</p>
        </div>

        {/* INFO DO CLIENTE */}
        <div className="border-b border-dashed border-black pb-2 mb-2 text-[11px] leading-tight">
          <p><strong>INTEGRANTE:</strong> {membro.name.toUpperCase()}</p>
          <p><strong>EQUIPE:</strong> {equipe.name.toUpperCase()}</p>
          <p><strong>SITUAÇÃO:</strong> CONTA FECHADA</p>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="mb-2">
          <table className="w-full text-[10px] leading-tight border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left font-bold w-6">QTD</th>
                <th className="text-left font-bold">PRODUTO</th>
                <th className="text-right font-bold w-10">UN</th>
                <th className="text-right font-bold w-12">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {itensPagos.length > 0 ? (
                itensPagos.map((venda) => (
                  <React.Fragment key={venda.id_agrupado}>
                    
                    {/* Divisor de Venda */}
                    <tr>
                      <td colSpan={4} className="pt-2 pb-1 text-center font-bold">
                        -- {venda.date} --
                      </td>
                    </tr>
                    
                    {/* Produtos (Sem o "R$" para economizar espaço) */}
                    {venda.items_resumo.map((item, i) => (
                      <tr key={i}>
                        <td className="align-top py-0.5">{item.quantity}</td>
                        <td className="align-top py-0.5 pr-1">{item.name.toUpperCase()}</td>
                        <td className="align-top py-0.5 text-right">
                          {formatCurrency(item.unit_price).replace('R$', '').trim()}
                        </td>
                        <td className="align-top py-0.5 text-right">
                          {formatCurrency(item.total_bruto).replace('R$', '').trim()}
                        </td>
                      </tr>
                    ))}

                    {/* Desconto da Compra */}
                    {venda.desconto > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right py-0.5 pr-1 font-bold">Desc:</td>
                        <td className="text-right py-0.5 font-bold">
                          -{formatCurrency(venda.desconto).replace('R$', '').trim()}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-2 text-center">Nenhum consumo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTAIS FINAIS */}
        <div className="border-t border-dashed border-black pt-2 text-[11px]">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(rec_TotalBruto)}</span>
          </div>
          <div className="flex justify-between">
            <span>DESCONTOS:</span>
            <span>- {formatCurrency(rec_TotalDescontos)}</span>
          </div>
          <div className="flex justify-between font-bold text-[12px] mt-1 pt-1 border-t border-black">
            <span>TOTAL PAGO:</span>
            <span>{formatCurrency(rec_TotalLiquido)}</span>
          </div>
        </div>
      </div>
    );
  }
);

RelatorioExtrato.displayName = "RelatorioExtrato";