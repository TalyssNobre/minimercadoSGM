import { useState, useEffect, useMemo } from 'react';
import { getAllCategory } from '@/src/Server/controllers/CategoryController';
import { getAllProducts } from '@/src/Server/controllers/ProductController';
import { getAllSales } from '@/src/Server/controllers/SaleController';
import { Category, Product, Sale, HistoricoLinha } from '../types';

export function useDashboardData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 NOVA FUNÇÃO BLINDADA CONTRA FUSO HORÁRIO
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Pega apenas a parte da data e cria a String DD/MM/AAAA manualmente
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    async function carregarDashboard() {
      setIsLoading(true);
      try {
        const [catRes, prodRes, salesRes] = await Promise.all([
          getAllCategory() as any,
          getAllProducts() as any,
          getAllSales() as any
        ]);

        if (catRes?.success) setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        if (prodRes?.success) setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);

        if (salesRes?.success) {
          const rawSales = Array.isArray(salesRes.data) ? salesRes.data : [];
          const vendasMapeadas: Sale[] = rawSales.map((venda: any) => ({
            sale_id: venda.id || venda.sale_id,
            date: formatDate(venda.date), // 👈 Aplica a formatação limpa aqui
            operator_name: venda.user?.name || venda.User?.name || venda.operator_name || 'Sistema', 
            client_name: venda.member?.name || venda.Member?.name || venda.client_name || 'Avulso', 
            status: 'ATIVA', 
            payment_status: venda.status ? 'PAGO' : 'FIADO', 
            items: (venda.Item_sale || venda.item_sale || venda.items || []).map((item: any) => ({
              product_id: item.product_id,
              qty: item.quantity || item.qty,
              price: item.unit_price || item.price
            }))
          }));
          setSales(vendasMapeadas);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    carregarDashboard();
  }, []);

  const metricas = useMemo(() => {
    let totalVendido = 0;
    let totalRecebido = 0;
    let totalAReceber = 0;
    
    const catTotals: Record<number, number> = {};
    categories.forEach(c => { catTotals[c.id] = 0; });

    const historico: HistoricoLinha[] = []; 
    const vendasValidas = sales.filter(s => s.status !== 'CANCELADA');

    vendasValidas.forEach(venda => {
      venda.items.forEach(item => {
        const valorItemTotal = item.qty * item.price;
        const produto = products.find(p => p.id === item.product_id);
        
        if (produto) {
          totalVendido += valorItemTotal;
          if (venda.payment_status === 'PAGO') totalRecebido += valorItemTotal;
          if (venda.payment_status === 'FIADO') totalAReceber += valorItemTotal;

          if (catTotals[produto.category_id] !== undefined) {
            catTotals[produto.category_id] += valorItemTotal;
          }

          historico.push({
            id_unico: `${venda.sale_id}-${produto.id}`,
            data: venda.date,
            operador: venda.operator_name,
            cliente: venda.client_name,
            produto_nome: produto.name,
            categoria_id: produto.category_id,
            qty: item.qty,
            pagamento: venda.payment_status,
            valor_total: valorItemTotal
          });
        }
      });
    });

    return {
      totaisGerais: { totalVendido, totalRecebido, totalAReceber },
      totaisPorCategoria: catTotals,
      historicoDesmembrado: historico.reverse()
    };
  }, [categories, products, sales]);

  return { categories, isLoading, ...metricas };
}