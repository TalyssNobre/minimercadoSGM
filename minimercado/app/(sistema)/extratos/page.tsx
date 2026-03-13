import React from 'react';
import ExtratoFiado from '@/components/extratos/ExtratoFiado';

export default function ExtratosPage() {
  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Aqui estamos chamando o componente que criamos na pasta components */}
      <ExtratoFiado />
    </div>
  );
}