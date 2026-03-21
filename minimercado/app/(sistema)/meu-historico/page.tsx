'use client';
import React, { useMemo, useState, useEffect } from 'react';

// =========================================================================
// INTERFACES (100% FIEL AO SEU DER)
// =========================================================================

// Tabela: User
interface User {
  id: number; // No seu DER o id do User é int8
  name: string;
  user_id: string; // O UUID que liga com auth.users
}

// Tabela: Team
interface Team {
  name: string;
}

// Tabela: member
interface Member {
  name: string;
  Team?: Team; // O Supabase costuma trazer o nome da tabela no JOIN
}

// Tabela: Product
interface Product {
  name: string;
}

// Tabela: Item_sale
interface ItemSale {
  quantity: number; // No DER é numeric
  Product?: Product; 
}

// Tabela Principal: Sale
interface Sale {
  id: number;
  date: string; // No DER é date
  total_value: number; // No DER é float8
  status: boolean; // No DER é bool (True para Pago, False para Fiado)
  payment_date?: string | null; // No DER é timestamptz
  member?: Member; // Relacionamento com a tabela member
  Item_sale?: ItemSale[]; // Relacionamento com a tabela Item_sale
}

export default function MeuHistoricoPage() {
  const [operadorAtual, setOperadorAtual] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDoSupabase() {
      setIsLoading(true);
      try {
        // TODO: Quando o Supabase estiver pronto, o select será exatamente assim:
        // const { data } = await supabase.from('Sale').select(`
        //   id, date, total_value, status, payment_date,
        //   member (name, Team(name)),
        //   Item_sale (quantity, Product(name))
        // `).eq('user_id', operadorAtual.id);

        // Simulando estado inicial vazio:
        setOperadorAtual({ id: 1, name: 'Carregando...', user_id: '' });
        setVendas([]); 
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarDadosDoSupabase();
  }, []);

  // Total Geral usa a coluna EXATA do seu DER: "total_value"
  const totalGeralVendas = useMemo(() => {
    return vendas.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  }, [vendas]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Como no seu banco a data é tipo "date", precisamos formatar para o padrão BR na tela
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-5xl mx-auto">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Meu Histórico de Vendas</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Operador:</span>
            <span className="text-sm font-bold text-[#0D9488] uppercase">
              {operadorAtual ? operadorAtual.name : 'Carregando...'}
            </span>
            {operadorAtual && (
              <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                ID: {operadorAtual.id}
              </span>
            )}
          </div>
        </div>
        
        {/* CARD DE TOTAL GERAL */}
        <div className="bg-[#0D9488]/10 px-6 py-3 rounded-xl border border-[#0D9488]/20 flex flex-col items-end">
          <span className="text-[10px] text-[#0D9488] font-bold uppercase tracking-widest">Total Geral de Vendas</span>
          <span className="text-2xl font-black text-[#0D9488]">{formatCurrency(totalGeralVendas)}</span>
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente / Equipe</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Itens Vendidos</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pagamento</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-6 w-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-sm">Buscando seu histórico...</span>
                  </div>
                </td>
              </tr>
            ) : vendas.length > 0 ? (
              vendas.map((venda) => (
                <tr key={venda.id} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* Usa a coluna exata "date" */}
                  <td className="py-5 px-6 text-sm text-gray-500 font-medium">
                    {formatDate(venda.date)}
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">
                        {venda.member?.name || 'Cliente Avulso'}
                      </span>
                      <span className="text-[10px] text-[#0D9488] font-semibold flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-[#0D9488]"></div>
                        {venda.member?.Team?.name || 'Sem Equipe'}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {venda.Item_sale?.map((item, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-500 text-[10px] px-2 py-1 rounded border border-gray-100 font-medium">
                          {item.quantity}x {item.Product?.name || 'Produto'}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Verifica o "status" booleano do DER para decidir se exibe PAGO ou FIADO */}
                  <td className="py-5 px-6 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-tighter ${
                      venda.status === true 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {venda.status === true ? 'PAGO' : 'FIADO'}
                    </span>
                  </td>

                  {/* Usa a coluna exata "total_value" */}
                  <td className="py-5 px-6 text-sm font-black text-gray-800 text-right">
                    {formatCurrency(venda.total_value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm italic">Nenhuma venda registrada no seu histórico ainda.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-400 italic">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-500">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        Cancelamento de vendas disponível apenas para Administradores.
      </div>
    </div>
  );
}