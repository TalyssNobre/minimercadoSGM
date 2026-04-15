import { useState, useEffect, useMemo } from 'react';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 
import { User, Sale } from '../types';

export function useMeuHistorico() {
  const [operadorAtual, setOperadorAtual] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 1. ADICIONAMOS A FUNÇÃO AQUI DENTRO (Corrigida para Fuso Horário Local)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Converte automaticamente do UTC para o fuso horário do PC do usuário
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    async function carregarDadosDoSupabase() {
      setIsLoading(true);
      try {
        const userResp = await getLoggedUserController();
        const userLogado = (userResp as any)?.user || (userResp as any)?.data?.user;

        if (userLogado && userLogado.id) {
          setOperadorAtual({ 
            id: userLogado.id, 
            name: userLogado.name || 'Operador', 
            user_id: userLogado.id.toString() 
          });

          const salesResp = await getAllSales() as any;
          
          if (salesResp?.success && salesResp?.data) {
            const todasVendas = Array.isArray(salesResp.data) ? salesResp.data : (salesResp.data.sale || []);
            
            // Filtra apenas as vendas deste operador
            const minhasVendas = todasVendas.filter((v: any) => v.user_id === userLogado.id);

            const vendasFormatadas: Sale[] = minhasVendas.map((row: any) => {
              const itensBrutos = row.Item_sale || row.item_sale || [];
              const membroBruto = row.Member || row.member || null;

              return {
                id: row.id,
                date: row.date,
                total_value: row.total_value,
                status: row.status, 
                payment_date: row.payment_date,
                member: {
                  name: membroBruto?.name || 'Cliente Avulso',
                  Team: { name: membroBruto?.Team?.name || membroBruto?.team?.name || '' }
                },
                Item_sale: itensBrutos.map((item: any) => ({
                  quantity: item.quantity,
                  Product: { name: item.Product?.name || item.product?.name || 'Produto' }
                }))
              };
            });

            setVendas(vendasFormatadas);
          }
        } else {
          setOperadorAtual({ id: 0, name: 'Sessão Expirada', user_id: '' });
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarDadosDoSupabase();
  }, []);

  const totalVendidoPago = useMemo(() => {
    return vendas.filter(v => v.status === true).reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  }, [vendas]);

  const totalVendidoFiado = useMemo(() => {
    return vendas.filter(v => v.status === false).reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  }, [vendas]);

  // 🟢 2. EXPORTAMOS A FUNÇÃO AQUI NO RETURN
  return { 
    operadorAtual, 
    vendas, 
    isLoading, 
    totalVendidoPago, 
    totalVendidoFiado,
    formatDate // <-- Adicionado aqui!
  };
}