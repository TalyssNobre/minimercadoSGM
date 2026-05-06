import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 
import { Sale } from '../types';


import { useUsuario } from '@/src/hooks/useUsuario';

export function useMeuHistorico() {
  // 🟢 2. PEGAMOS O USUÁRIO INSTANTANEAMENTE DA MEMÓRIA
  const { user, isLoading: isUserLoading } = useUsuario();
  
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [filtroData, setFiltroData] = useState<string>('');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const carregarDadosDoSupabase = useCallback(async () => {
    // 🟢 3. Se ainda não temos o ID do usuário, não fazemos nada.
    if (!user?.id) return;

    setIsLoadingSales(true);
    try {
      const salesResp = await getAllSales() as any;
      
      if (salesResp?.success && salesResp?.data) {
        const todasVendas = Array.isArray(salesResp.data) ? salesResp.data : (salesResp.data.sale || []);
        
        // 🟢 4. Usamos o ID que veio direto do nosso Hook do SWR!
        const minhasVendas = todasVendas.filter((v: any) => v.user_id === user.id);

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

        // ORDENAÇÃO: Mais novas no topo
        vendasFormatadas.sort((a, b) => b.id - a.id);
        setVendas(vendasFormatadas);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoadingSales(false);
    }
  }, [user?.id]); // 🟢 A função agora depende exclusivamente do ID do usuário

  // 🟢 5. "Escutamos" o usuário. Assim que o SWR entregar o usuário, buscamos as vendas dele.
  useEffect(() => {
    if (user?.id) {
      carregarDadosDoSupabase();
    } else if (!isUserLoading && !user) {
      // Se não está carregando e não tem usuário, para de girar o loading
      setIsLoadingSales(false);
    }
  }, [user?.id, isUserLoading, carregarDadosDoSupabase]);

  // 🟢 6. Montamos o objeto "operadorAtual" dinamicamente para não quebrar a sua página .tsx
  const operadorAtual = user 
    ? { id: user.id, name: user.name || 'Operador', user_id: user.id.toString() } 
    : { id: 0, name: 'Sessão Expirada', user_id: '' };

  // FILTRAGEM POR DATA
  const vendasFiltradas = useMemo(() => {
    if (!filtroData) return vendas;
    return vendas.filter(v => v.date.startsWith(filtroData));
  }, [vendas, filtroData]);

  // TOTAIS RECALCULADOS 
  const totalVendidoPago = vendasFiltradas.filter(v => v.status === true).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);
  const totalVendidoFiado = vendasFiltradas.filter(v => v.status === false).reduce((acc, curr) => acc + ((curr.total_value || 0) - (curr.discount || 0)), 0);

  // 🟢 7. O tempo de loading total é a soma de descobrir quem é o usuário + baixar as vendas
  const isLoadingFinal = isUserLoading || isLoadingSales;

  return { 
    operadorAtual, 
    vendasFiltradas, 
    isLoading: isLoadingFinal, 
    totalVendidoPago, 
    totalVendidoFiado,
    formatDate,
    filtroData, setFiltroData, 
    atualizarDados: carregarDadosDoSupabase 
  };
}