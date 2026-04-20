import React from 'react';
import Link from 'next/link';
import { Equipe } from './types';

interface Props {
  equipes: Equipe[];
  isLoading: boolean;
  onEdit: (equipe: Equipe) => void;
  onDelete: (equipe: Equipe) => void;
}

export default function GridEquipes({ equipes, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-4">
      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Carregando equipes...</p>
      ) : equipes.length === 0 ? (
        <p className="text-gray-500 col-span-full">Nenhuma equipe cadastrada ainda.</p>
      ) : (
        equipes.map((equipe) => (
          <div key={equipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col hover:-translate-y-1 group">
            
            <Link href={`/admin/equipes/${equipe.id}`} className="block cursor-pointer">
              <div className="px-4 py-4 flex justify-center items-center text-center min-h-[4rem] group-hover:brightness-95 transition-all" style={{ backgroundColor: equipe.color }}>
                <h3 className="font-bold text-white text-lg tracking-wide">{equipe.name}</h3>
              </div>

              <div className="p-4 flex flex-col items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Integrantes</p>
                  <p className="text-3xl font-bold text-gray-700 leading-none group-hover:text-[#0D9488] transition-colors">
                    {equipe.memberCount}
                  </p>
                </div>
              </div>
            </Link>

            <div className="px-4 pb-4 bg-white mt-auto">
              <div className="w-full h-px bg-gray-100 mb-3"></div>
              <div className="flex items-center justify-center gap-4 w-full relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(equipe); }} 
                  className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                >
                  🖌️ Editar
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(equipe); }} 
                  className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}