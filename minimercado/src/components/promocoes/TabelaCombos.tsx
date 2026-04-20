import React from 'react';

interface TabelaCombosProps {
  isLoading: boolean;
  combos: any[];
  onEditar: (combo: any) => void;
  onExcluir: (id: number) => void;
}

export default function TabelaCombos({ isLoading, combos, onEditar, onExcluir }: TabelaCombosProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Combos & Kits Registrados</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                  <tr className="text-gray-400 text-[10px] uppercase font-black">
                      <th className="p-4 w-16 text-center">Foto</th>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Produtos</th>
                      <th className="p-4">Preço Original</th>
                      <th className="p-4">Preço Combo</th>
                      <th className="p-4 text-center">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y">
                  {combos.map(combo => (
                      <tr key={combo.id} className="hover:bg-gray-50">
                          <td className="p-4 text-center">
                            {combo.image ? (
                              <div className="w-10 h-10 relative rounded-md overflow-hidden mx-auto border shadow-sm">
                                <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mx-auto border text-[10px] text-gray-400">S/F</div>
                            )}
                          </td>
                          <td className="p-4 font-bold">{combo.name}</td>
                          <td className="p-4 text-xs italic">{combo.itens}</td>
                          <td className="p-4 text-gray-400 line-through">R$ {combo.preco_original.toFixed(2)}</td>
                          <td className="p-4 font-black text-[#0D9488]">R$ {combo.preco_final.toFixed(2)}</td>
                          <td className="p-4 flex justify-center gap-4">
                              <button onClick={() => onEditar(combo)} title="Editar" className="hover:scale-110 transition-transform mt-3">✏️</button>
                              <button onClick={() => onExcluir(combo.id)} title="Excluir" className="hover:scale-110 transition-transform mt-3">🗑️</button>
                          </td>
                      </tr>
                  ))}
                  {combos.length === 0 && !isLoading && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum combo cadastrado.</td></tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}