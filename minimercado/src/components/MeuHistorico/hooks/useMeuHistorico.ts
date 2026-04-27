import { useState, useEffect, useCallback } from 'react';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 
import { User, Sale } from '../types';

export function useMeuHistorico() {
  const [operadorAtual, setOperadorAtual] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const carregarDadosDoSupabase = useCallback(async () => {
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
          
          const minhasVendas = todasVendas.filter((v: any) => v.user_id === userLogado.id);

          const vendasFormatadas: Sale[] = minhasVendas.map((row: any) => {
            const itensBrutos = row.Item_sale || row.item_sale || [];
            const membroBruto = row.Member || row.member || null;

            // 🟢 MÁGICA: Somamos os descontos que foram salvos item por item no banco!
            const totalDescontoDosItens = itensBrutos.reduce((acc: number, item: any) => acc + (Number(item.item_discount) || 0), 0);
            const descontoGeralDaVenda = Number(row.discount) || 0;
            const descontoRealTotal = totalDescontoDosItens + descontoGeralDaVenda;

            return {
              id: row.id,
              date: row.date, 
              total_value: Number(row.total_value) || 0,
              discount: descontoRealTotal, // 🟢 Agora enviamos o desconto total EXATO
              status: row.status, 
              payment_date: row.payment_date,
              member: {
                name: membroBruto?.name || 'Cliente Avulso',
                Team: { name: membroBruto?.Team?.name || membroBruto?.team?.name || '' }
              },
              Item_sale: itensBrutos.map((item: any) => ({
                quantity: item.quantity,
                item_discount: Number(item.item_discount) || 0, // Passamos pro Front ver se precisar
                Product: { name: item.Product?.name || item.product?.name || 'Produto' }
              }))
            };
          });

          setVendas(vendasFormatadas);
        }
      } else {
        setOperadorAtual({ id: 0, name: 'Sessão Expirada, NOME NÃO ENCONTRADO', user_id: '' });
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosDoSupabase();
  }, [carregarDadosDoSupabase]);

  // Subtraímos o desconto real e exato do valor total
  const totalVendidoPago = vendas.filter(v => v.status === true).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);
  const totalVendidoFiado = vendas.filter(v => v.status === false).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);

  return { 
    operadorAtual, 
    vendas, 
    isLoading, 
    totalVendidoPago, 
    totalVendidoFiado,
    formatDate,
    atualizarDados: carregarDadosDoSupabase 
  };
}