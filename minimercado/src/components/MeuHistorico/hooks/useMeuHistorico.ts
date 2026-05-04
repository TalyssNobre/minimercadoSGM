import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 
import { User, Sale } from '../types';

export function useMeuHistorico() {
  const [operadorAtual, setOperadorAtual] = useState<User | null>(null);
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 NOVO: Estado para o filtro de data
  const [filtroData, setFiltroData] = useState<string>('');

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

            const totalDescontoDosItens = itensBrutos.reduce((acc: number, item: any) => acc + (Number(item.item_discount) || 0), 0);
            const descontoGeralDaVenda = Number(row.discount) || 0;
            const descontoRealTotal = totalDescontoDosItens + descontoGeralDaVenda;

            return {
              id: row.id,
              date: row.date, 
              total_value: Number(row.total_value) || 0,
              discount: descontoRealTotal, 
              status: row.status, 
              payment_date: row.payment_date,
              member: {
                name: membroBruto?.name || 'Cliente Avulso',
                Team: { name: membroBruto?.Team?.name || membroBruto?.team?.name || '' }
              },
              Item_sale: itensBrutos.map((item: any) => ({
                quantity: item.quantity,
                item_discount: Number(item.item_discount) || 0, 
                Product: { name: item.Product?.name || item.product?.name || 'Produto' }
              }))
            };
          });

          // 🟢 ORDENAÇÃO: Mais novas no topo
          vendasFormatadas.sort((a, b) => b.id - a.id);

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
  }, []);

  useEffect(() => {
    carregarDadosDoSupabase();
  }, [carregarDadosDoSupabase]);

  // 🟢 FILTRAGEM POR DATA
  const vendasFiltradas = useMemo(() => {
    if (!filtroData) return vendas;
    // O banco costuma retornar data no formato ISO (YYYY-MM-DD...), então startsWith funciona perfeitamente
    return vendas.filter(v => v.date.startsWith(filtroData));
  }, [vendas, filtroData]);

  // 🟢 TOTAIS RECALCULADOS (Baseados nas vendas já filtradas!)
  const totalVendidoPago = vendasFiltradas.filter(v => v.status === true).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);
  const totalVendidoFiado = vendasFiltradas.filter(v => v.status === false).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);

  return { 
    operadorAtual, 
    vendasFiltradas, // 🟢 Exportamos a filtrada no lugar da normal
    isLoading, 
    totalVendidoPago, 
    totalVendidoFiado,
    formatDate,
    filtroData, setFiltroData, // 🟢 Exportamos o controle do input
    atualizarDados: carregarDadosDoSupabase 
  };
}