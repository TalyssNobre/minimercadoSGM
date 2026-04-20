import React from 'react';

interface DashboardProps {
  stats: { totalOfertas: number; totalCombos: number };
}

export default function DashboardPromocoes({ stats }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ofertas Relâmpago</span>
        <div className="text-2xl font-black text-[#0D9488]">{stats.totalOfertas}</div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Combos Ativos</span>
        <div className="text-2xl font-black text-gray-800">{stats.totalCombos}</div>
      </div>
    </div>
  );
}