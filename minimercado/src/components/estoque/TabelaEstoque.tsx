import React from 'react';
import { Produto } from './types';

interface Props {
  produtos: Produto[];
  isLoading: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => void;
}

export default function TabelaEstoque({ produtos, isLoading, onEdit, onDelete }: Props) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
            <tr className="border-b border-gray-200">
              <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/4">Nome do Produto</th>
              <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/5">Categoria</th>
              <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6">Preço Unit.</th>
              <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6 text-center">Estoque Atual</th>
              <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 animate-pulse font-medium">
                  Carregando estoque...
                </td>
              </tr>
            ) : produtos.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhum produto em estoque</h3>
                  <p className="text-gray-500 text-sm">Os produtos cadastrados aparecerão aqui.</p>
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">{produto.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{produto.category_name}</td>
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">{formatCurrency(produto.price)}</td>
                  <td className="py-4 px-6 text-sm font-bold text-center">
                    <span className={produto.stock <= 0 ? "text-red-500" : "text-gray-700"}>{produto.stock}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(produto)} className="inline-flex items-center gap-1 bg-[#1e5eb0] hover:bg-[#154685] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.158 3.71 3.71 1.159-1.157a2.625 2.625 0 000-3.711z" /><path d="M10.75 4.365a8.25 8.25 0 00-1.41 1.41M19.635 13.25a8.25 8.25 0 01-1.41 1.41" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.93z" /></svg> Editar
                      </button>
                      <button onClick={() => onDelete(produto)} className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}