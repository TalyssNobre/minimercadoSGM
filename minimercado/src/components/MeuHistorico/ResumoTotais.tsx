import React from 'react';

interface Props {
  totalVendidoPago: number;
  totalVendidoFiado: number;
}

export default function ResumoTotais({ totalVendidoPago, totalVendidoFiado }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
      {/* Card do Fiado (Amarelo) */}
      <div className="bg-yellow-50 border border-yellow-200 px-6 py-3 rounded-lg shadow-sm flex justify-between items-center min-w-[250px]">
        <span className="text-sm font-semibold text-yellow-700 mr-3">A Receber (Fiado):</span>
        <span className="text-xl font-bold text-yellow-600">{formatCurrency(totalVendidoFiado)}</span>
      </div>

      {/* Card do Pago (Verde) */}
      <div className="bg-green-50 border border-green-200 px-6 py-3 rounded-lg shadow-sm flex justify-between items-center min-w-[250px]">
        <span className="text-sm font-semibold text-green-700 mr-3">Meu Total Válido:</span>
        <span className="text-xl font-bold text-[#0D9488]">{formatCurrency(totalVendidoPago)}</span>
      </div>
    </div>
  );
}