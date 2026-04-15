import React from 'react';
import { Membro } from './types';

interface Props {
  membros: Membro[];
  isLoading: boolean;
  onEdit: (membro: Membro) => void;
  onDelete: (membro: Membro) => void;
}

export default function GridIntegrantes({ membros, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-8">
      {isLoading ? (
        <p className="animate-pulse text-gray-400 font-medium col-span-full">Carregando dados...</p>
      ) : membros.map((membro) => (
        <div key={membro.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center transition-all duration-300 hover:shadow-lg hover:border-[#0D9488]/20 group">
          <span className="text-gray-700 font-bold text-sm uppercase block mb-5 min-h-[1.25rem] tracking-wide">
            {membro.name}
          </span>
          <div className="flex justify-center gap-3 border-t pt-4">
            <button onClick={() => onEdit(membro)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-90" title="Editar">
              <span className="text-lg">🖌️</span>
            </button>
            <button onClick={() => onDelete(membro)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-500 transition-all duration-200 hover:bg-red-600 hover:text-white hover:scale-110 active:scale-90" title="Excluir">
              <span className="text-lg">🗑️</span>
            </button>
          </div>
        </div>
      ))}

      {!isLoading && membros.length === 0 && (
        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">Nenhum integrante cadastrado nesta equipe.</p>
          <p className="text-gray-400 text-xs mt-1">Clique no botão acima para adicionar.</p>
        </div>
      )}
    </div>
  );
}