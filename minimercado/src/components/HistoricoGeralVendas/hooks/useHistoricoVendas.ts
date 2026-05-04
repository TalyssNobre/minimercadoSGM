import { useState, useEffect, useMemo } from 'react';
import { getAllSales, deleteSale } from '@/src/Server/controllers/SaleController';
import { getAllUsersController } from '@/src/Server/controllers/UserController';
import { Venda, Operador } from '../types';

export function useHistoricoVendas(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 Novos Estados de Filtro
  const [filtroVendedor, setFiltroVendedor] = useState<string>('Todos');
  const [filtroData, setFiltroData] = useState<string>(''); // YYYY-MM-DD

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const fetchDados = async () => {
    setIsLoading(true);
    try {
      const usersResponse = await getAllUsersController() as any;
      if (usersResponse?.success && usersResponse?.users) {
        setOperadores(usersResponse.users.map((u: any) => ({ user_id: u.id, name: u.name })));
      }

      const response = await getAllSales() as any;
      if (response?.success && response?.data) {
        const dadosBrutos = Array.isArray(response.data) ? response.data : (response.data.sale || []);
        
        let vendasFormatadas: Venda[] = dadosBrutos.map((row: any) => {
          const itensBrutos = row.Item_sale || row.item_sale || row.itemSale || [];
          const totalDescontoItens = itensBrutos.reduce((acc: number, item: any) => acc + (Number(item.item_discount) || 0), 0);
          const descontoGeral = Number(row.discount) || 0;
          const descontoRealTotal = totalDescontoItens + descontoGeral;

          return {
            sale_id: row.id, 
            date: formatDate(row.date), 
            operator_id: row.user_id || 0,
            operator_name: row.User?.name || row.user?.name || 'Desconhecido',
            client_name: row.Member?.name || row.member?.name || 'Cliente Avulso',
            total_value: Number(row.total_value) || 0, 
            discount: descontoRealTotal, 
            status: Boolean(row.status), 
            items: itensBrutos.map((item: any) => ({
              id_item_sale: item.id_item_sale, 
              name: item.Product?.name || item.product?.name || 'Produto',
              quantity: item.quantity,
              item_discount: Number(item.item_discount) || 0
            }))
          };
        });

        // 🟢 ORDENAÇÃO: Mais novas no topo (Maior ID primeiro)
        vendasFormatadas.sort((a, b) => b.sale_id - a.sale_id);

        setVendas(vendasFormatadas);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      exibirAlerta("Erro ao buscar o histórico de vendas.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  // 🟢 FILTRAGEM COMBINADA (Vendedor + Data)
  const vendasFiltradas = useMemo(() => {
    let filtrado = vendas;

    if (filtroVendedor !== 'Todos') {
      filtrado = filtrado.filter(v => v.operator_id.toString() === filtroVendedor);
    }

    if (filtroData) {
      // Converte YYYY-MM-DD do input date para DD/MM/YYYY do nosso sistema
      const [ano, mes, dia] = filtroData.split('-');
      const dataBuscada = `${dia}/${mes}/${ano}`;
      filtrado = filtrado.filter(v => v.date === dataBuscada);
    }

    return filtrado;
  }, [vendas, filtroVendedor, filtroData]);

  const totalFiltrado = useMemo(() => {
    return vendasFiltradas.filter(v => v.status === true).reduce((acc, curr) => acc + (curr.total_value - (curr.discount || 0)), 0);
  }, [vendasFiltradas]);

  const cancelarVenda = async (sale_id: number) => {
    try {
      const response = await deleteSale(sale_id) as any;
      if (response?.success === false || response?.sucess === false) {
        exibirAlerta("Erro ao cancelar: " + response.message, "error");
        return false;
      }
      exibirAlerta("Venda cancelada com sucesso!", "success");
      fetchDados();
      return true;
    } catch (error) {
      exibirAlerta("Erro técnico ao cancelar a venda.", "error");
      return false;
    }
  };

  return {
    operadores,
    isLoading,
    filtroVendedor, setFiltroVendedor,
    filtroData, setFiltroData, // 🟢 Exportando para a página
    vendasFiltradas,
    totalFiltrado,
    cancelarVenda
  };
}