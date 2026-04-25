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

            return {
              id: row.id,
              date: row.date, 
              total_value: Number(row.total_value) || 0,
              // 🟢 Puxamos o discount. Se for nulo ou vazio no banco, vira 0.
              discount: Number(row.discount) || 0, 
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

  // 🟢 Cálculos automáticos agora consideram o desconto
  // Subtraímos o desconto do valor total para saber o quanto de dinheiro REAL entrou
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